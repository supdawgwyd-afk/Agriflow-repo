import type {
  ProduceListing,
  Order,
  Delivery,
  Payment,
  Farmer,
  Buyer,
} from '@/types';
import type {
  BecknContext,
  BecknTimelineEntry,
  BecknSearchRequest,
  BecknSearchResponse,
  BecknSelectRequest,
  BecknSelectResponse,
  BecknInitRequest,
  BecknInitResponse,
  BecknConfirmRequest,
  BecknConfirmResponse,
  BecknStatusResponse,
  BecknTrackResponse,
  BecknItem,
  BecknOrder,
  BecknOrderStatus,
  BecknAction,
  BppTransactionRecord,
} from './becknTypes';
import { BPP_CONTEXT_DEFAULTS } from './becknMockData';
import { AGRIFLOW_BPP_PROVIDER } from './becknMockData';
import {
  produceToItem,
  orderToBecknOrder,
  orderToFulfillment,
  buildCatalog,
} from './becknTransformers';

let txnCounter = 0;
function nextTxnId(): string {
  txnCounter += 1;
  return `BPP-TXN-${String(Date.now()).slice(-6)}-${txnCounter}`;
}

let msgCounter = 0;
function nextMsgId(): string {
  msgCounter += 1;
  return `MSG-${String(Date.now()).slice(-6)}-${msgCounter}`;
}

function createContext(action: BecknAction, transactionId: string): BecknContext {
  return {
    ...BPP_CONTEXT_DEFAULTS,
    action,
    transactionId,
    messageId: nextMsgId(),
    timestamp: new Date().toISOString(),
  };
}

function timelineEntry(
  action: BecknAction,
  label: string,
  description: string,
  request: Record<string, unknown>,
  response: Record<string, unknown>,
): BecknTimelineEntry {
  return {
    action,
    timestamp: new Date().toISOString(),
    label,
    description,
    request,
    response,
  };
}

export const bppService = {
  provider: AGRIFLOW_BPP_PROVIDER,

  search(
    request: BecknSearchRequest,
    produceListings: ProduceListing[],
    farmers: Farmer[],
  ): { response: BecknSearchResponse; items: BecknItem[] } {
    let filtered = produceListings.filter((p) => p.status === 'available');

    if (request.crop && request.crop !== 'All') {
      filtered = filtered.filter((p) => p.crop === request.crop);
    }
    if (request.quantityKg) {
      filtered = filtered.filter((p) => p.quantityKg >= request.quantityKg!);
    }
    if (request.maxPricePerKg) {
      filtered = filtered.filter((p) => p.pricePerKg <= request.maxPricePerKg!);
    }
    if (request.maxDistanceKm) {
      filtered = filtered.filter((p) => p.distanceKm <= request.maxDistanceKm!);
    }
    if (request.quality && request.quality !== 'All') {
      filtered = filtered.filter((p) => p.quality === request.quality);
    }
    if (request.location) {
      const loc = request.location.toLowerCase();
      filtered = filtered.filter(
        (p) => p.location.toLowerCase().includes(loc) || loc.includes(p.location.toLowerCase()),
      );
    }

    const items = filtered.map((p) => {
      const farmer = farmers.find((f) => f.id === p.farmerId);
      return produceToItem(p, farmer);
    });

    const response: BecknSearchResponse = {
      provider: AGRIFLOW_BPP_PROVIDER.name,
      itemsFound: items.length,
      items,
    };

    return { response, items };
  },

  select(
    request: BecknSelectRequest,
    produceListings: ProduceListing[],
    farmers: Farmer[],
    buyers: Buyer[],
  ): BecknSelectResponse {
    const produce = produceListings.find((p) => p.id === request.itemId);
    if (!produce) throw new Error('Item not found in BPP catalog');

    const farmer = farmers.find((f) => f.id === produce.farmerId);
    const item = produceToItem(produce, farmer);

    const fulfillment = {
      id: `ful-${produce.id}`,
      type: 'delivery' as const,
      origin: item.location,
      destination: {
        id: 'buyer-dest',
        address: 'Buyer location (to be confirmed)',
        city: 'TBD',
        district: 'TBD',
      },
      distanceKm: produce.distanceKm,
      eta: `${Math.max(1, Math.round(produce.distanceKm / 25))}h`,
      status: 'pending' as const,
    };

    const payment = {
      id: `pay-${produce.id}`,
      status: 'pending' as const,
      method: 'AgriFlow Payment Gateway',
      amount: produce.pricePerKg * request.quantityKg,
      currency: 'INR',
    };

    const matchingBuyer = buyers.find((b) => b.requiredCrop === produce.crop);
    const aiMatchScore = matchingBuyer
      ? Math.min(98, Math.round((produce.quantityKg / matchingBuyer.requiredQtyKg) * 100))
      : undefined;

    return { item, fulfillment, payment, aiMatchScore };
  },

  init(
    request: BecknInitRequest,
    produceListings: ProduceListing[],
    farmers: Farmer[],
  ): BecknInitResponse {
    const produce = produceListings.find((p) => p.id === request.itemId);
    if (!produce) throw new Error('Item not found for init');

    const farmer = farmers.find((f) => f.id === produce.farmerId);
    const item = produceToItem(produce, farmer);
    const txnId = nextTxnId();

    const order: BecknOrder = {
      id: `beckn-${txnId}`,
      transactionId: txnId,
      provider: AGRIFLOW_BPP_PROVIDER,
      item,
      quantityKg: request.quantityKg,
      totalAmount: produce.pricePerKg * request.quantityKg,
      fulfillment: {
        id: `ful-${txnId}`,
        type: 'delivery',
        origin: item.location,
        destination: {
          id: `dest-${request.buyerId}`,
          address: request.buyerName,
          city: 'TBD',
          district: 'TBD',
        },
        distanceKm: produce.distanceKm,
        eta: `${Math.max(1, Math.round(produce.distanceKm / 25))}h`,
        status: 'pending',
      },
      payment: {
        id: `pay-${txnId}`,
        status: 'pending',
        method: 'AgriFlow Payment Gateway',
        amount: produce.pricePerKg * request.quantityKg,
        currency: 'INR',
      },
      status: 'initialized',
      createdAt: new Date().toISOString(),
    };

    return { transactionId: txnId, order };
  },

  confirm(
    request: BecknConfirmRequest,
    pendingOrders: Map<string, BecknOrder>,
    existingOrder?: Order,
    agriflowOrderId?: string,
  ): BecknConfirmResponse {
    const order = pendingOrders.get(request.transactionId);
    if (!order) throw new Error('Transaction not found for confirm');

    const targetOrderId = existingOrder?.id || agriflowOrderId || order.agriflowOrderId || `O-${request.transactionId.replace('BPP-TXN-', '')}`;

    const confirmedOrder: BecknOrder = {
      ...order,
      status: 'confirmed',
      agriflowOrderId: targetOrderId,
    };

    return {
      order: confirmedOrder,
      agriflowOrderId: targetOrderId,
    };
  },

  status(
    transactionId: string,
    orders: Order[],
    deliveries: Delivery[],
    bppTransactions?: BppTransactionRecord[],
    payments?: Payment[],
  ): BecknStatusResponse {
    const bppTxn = bppTransactions?.find(
      (t) => t.transactionId === transactionId || t.id === transactionId || t.agriflowOrderId === transactionId
    );
    const agriflowOrderId = bppTxn?.agriflowOrderId || transactionId;

    const order = orders.find(
      (o) =>
        o.id === agriflowOrderId ||
        o.orderNumber === agriflowOrderId ||
        o.id === transactionId ||
        `txn-${o.id}` === transactionId ||
        `beckn-${o.id}` === transactionId
    );
    if (!order) throw new Error(`Transaction or order not found: ${transactionId}`);

    const delivery = deliveries.find((d) => d.orderId === order.id);
    const payment = payments?.find((p) => p.farmerId === order.farmerId && p.crop === order.crop);
    const becknOrder = orderToBecknOrder(order, delivery, AGRIFLOW_BPP_PROVIDER, payment);

    return {
      transactionId,
      status: becknOrder.status,
      order: becknOrder,
    };
  },

  track(
    transactionId: string,
    orders: Order[],
    deliveries: Delivery[],
    bppTransactions?: BppTransactionRecord[],
  ): BecknTrackResponse {
    const bppTxn = bppTransactions?.find(
      (t) => t.transactionId === transactionId || t.id === transactionId || t.agriflowOrderId === transactionId
    );
    const agriflowOrderId = bppTxn?.agriflowOrderId || transactionId;

    const order = orders.find(
      (o) =>
        o.id === agriflowOrderId ||
        o.orderNumber === agriflowOrderId ||
        o.id === transactionId ||
        `txn-${o.id}` === transactionId ||
        `beckn-${o.id}` === transactionId
    );
    if (!order) throw new Error(`Transaction or order not found for tracking: ${transactionId}`);

    const delivery = deliveries.find((d) => d.orderId === order.id);
    const fulfillment = orderToFulfillment(order, delivery);

    const trackingHistory = [
      { timestamp: order.placedDate, status: 'Order Placed', location: 'AgriFlow BPP' },
      { timestamp: order.placedDate, status: 'Confirmed', location: 'AgriFlow Platform' },
    ];
    if (delivery) {
      trackingHistory.push({
        timestamp: delivery.eta || 'Scheduled',
        status: delivery.status,
        location: delivery.status === 'Delivered' ? delivery.destination : delivery.origin,
      });
      if (delivery.status === 'In Transit') {
        trackingHistory.push({
          timestamp: 'Live ETA: ' + delivery.eta,
          status: 'In Transit along Siruvani Highway',
          location: delivery.collectionPoints?.[0] || 'En route to ' + delivery.destination,
        });
      } else if (delivery.status === 'Delivered') {
        trackingHistory.push({
          timestamp: 'Delivered',
          status: 'Delivered at Buyer Destination',
          location: delivery.destination,
        });
      }
    }

    return { transactionId, fulfillment, trackingHistory };
  },

  cancel(transactionId: string, pendingOrders: Map<string, BecknOrder>): BecknOrder {
    const order = pendingOrders.get(transactionId);
    if (!order) throw new Error('Transaction not found for cancel');
    return { ...order, status: 'cancelled' as BecknOrderStatus };
  },

  statusByOrderId(
    agriflowOrderId: string,
    orders: Order[],
    deliveries: Delivery[],
    payments?: Payment[],
  ): BecknStatusResponse {
    const order = orders.find((o) => o.id === agriflowOrderId || o.orderNumber === agriflowOrderId);
    if (!order) throw new Error(`AgriFlow order not found for BPP status: ${agriflowOrderId}`);
    const delivery = deliveries.find((d) => d.orderId === order.id);
    const payment = payments?.find((p) => p.farmerId === order.farmerId && p.crop === order.crop);
    const becknOrder = orderToBecknOrder(order, delivery, AGRIFLOW_BPP_PROVIDER, payment);
    return {
      transactionId: `txn-${order.id}`,
      status: becknOrder.status,
      order: becknOrder,
    };
  },

  trackByOrderId(
    agriflowOrderId: string,
    orders: Order[],
    deliveries: Delivery[],
  ): BecknTrackResponse {
    const order = orders.find((o) => o.id === agriflowOrderId || o.orderNumber === agriflowOrderId);
    if (!order) throw new Error(`AgriFlow order not found for BPP tracking: ${agriflowOrderId}`);
    const delivery = deliveries.find((d) => d.orderId === order.id);
    const fulfillment = orderToFulfillment(order, delivery);
    const trackingHistory = [
      { timestamp: order.placedDate, status: 'Order Placed', location: 'AgriFlow BPP' },
      { timestamp: order.placedDate, status: 'Confirmed', location: 'AgriFlow Platform' },
    ];
    if (delivery) {
      trackingHistory.push({ timestamp: delivery.eta || 'Scheduled', status: delivery.status, location: delivery.origin });
      if (delivery.status === 'In Transit' || delivery.status === 'Delivered') {
        trackingHistory.push({ timestamp: delivery.eta, status: delivery.status, location: delivery.destination });
      }
    }
    return { transactionId: `txn-${order.id}`, fulfillment, trackingHistory };
  },

  buildTransactionRecord(
    transactionId: string,
    order: BecknOrder,
    agriflowOrderId: string,
    agriflowOrderNumber: string,
    buyerId: string,
    buyerName: string,
    fulfillmentStatus: string,
    timeline: BecknTimelineEntry[],
    extra?: {
      produceId?: string;
      providerId?: string;
      deliveryId?: string;
      paymentId?: string;
    },
  ): BppTransactionRecord {
    return {
      id: transactionId,
      transactionId,
      buyerId,
      buyerName,
      farmerId: order.item.id.replace('item-', '').split('-')[0] || '',
      farmerName: order.item.providerName,
      crop: order.item.crop,
      quantityKg: order.quantityKg,
      pricePerKg: order.item.pricePerKg,
      totalAmount: order.totalAmount,
      becknStatus: order.status,
      agriflowOrderId,
      agriflowOrderNumber,
      fulfillmentStatus,
      timeline,
      createdAt: new Date().toISOString(),
      produceId: extra?.produceId || order.item.id,
      providerId: extra?.providerId || AGRIFLOW_BPP_PROVIDER.id,
      deliveryId: extra?.deliveryId || order.fulfillment.id,
      paymentId: extra?.paymentId || order.payment.id,
    };
  },

  buildCatalog,

  createContext,
  timelineEntry,
  nextTxnId,
};
