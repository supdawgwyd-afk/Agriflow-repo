import type {
  ProduceListing,
  Order,
  Delivery,
  Payment,
  Farmer,
} from '@/types';
import type {
  BecknItem,
  BecknLocation,
  BecknFulfillment,
  BecknPayment,
  BecknOrder,
  BecknOrderStatus,
  BecknProvider,
  BecknCatalog,
} from './becknTypes';
import { AGRIFLOW_BPP_PROVIDER } from './becknMockData';
import { BECKN_ORDER_STATUS_MAP } from './becknTypes';

export function produceToItem(produce: ProduceListing, farmer?: Farmer): BecknItem {
  const centreName = farmer?.centreId === 'C01'
    ? 'Siruvani Main Road Centre'
    : farmer?.centreId === 'C02'
      ? 'Thondamuthur Centre'
      : farmer?.centreId === 'C03'
        ? 'Alandurai Hub'
        : 'Siruvani Main Road Centre';

  return {
    id: produce.id,
    crop: produce.crop,
    description: `${produce.crop} — ${produce.quantityKg} kg available from ${produce.farmerName}`,
    quantityKg: produce.quantityKg,
    pricePerKg: produce.pricePerKg,
    currency: 'INR',
    quality: `Grade ${produce.quality}`,
    providerName: produce.farmerName,
    location: {
      id: `loc-${produce.farmerId}`,
      address: produce.location,
      city: produce.location,
      district: farmer?.district || 'Coimbatore',
      gps: undefined,
    },
    availability: produce.status,
    fulfillmentId: `ful-${produce.id}`,
    aiMatchScore: produce.buyerInterest,
    procurementCentre: centreName,
    procurementCentreId: farmer?.centreId || 'C01',
  };
}

export function orderToFulfillment(order: Order, delivery?: Delivery): BecknFulfillment {
  const origin: BecknLocation = {
    id: `loc-${order.farmerId}`,
    address: delivery?.origin || 'Karunya Nagar',
    city: delivery?.origin || 'Karunya Nagar',
    district: 'Coimbatore',
  };
  const destination: BecknLocation = {
    id: `loc-${order.buyerId}`,
    address: delivery?.destination || order.buyerName,
    city: delivery?.destination || order.buyerName,
    district: 'Coimbatore',
  };

  const statusMap: Record<Delivery['status'], BecknFulfillment['status']> = {
    'Scheduled': 'scheduled',
    'In Transit': 'in-transit',
    'Delivered': 'delivered',
  };

  const procurementHub = delivery?.collectionPoints && delivery.collectionPoints.length > 0
    ? delivery.collectionPoints[0]
    : 'Siruvani Main Road Centre';

  const route = [
    delivery?.origin || 'Karunya Nagar',
    procurementHub,
    delivery?.destination || order.buyerName,
  ];

  return {
    id: delivery?.id || `ful-${order.id}`,
    type: 'delivery',
    origin,
    destination,
    distanceKm: delivery?.distanceKm || 0,
    eta: delivery?.eta || 'TBD',
    status: delivery ? statusMap[delivery.status] : 'pending',
    driver: delivery?.driver,
    vehicle: delivery?.vehicle,
    route,
  };
}

export function orderToPayment(order: Order, payment?: Payment): BecknPayment {
  return {
    id: payment?.id || `PAY-${order.id}`,
    status: (order.status === 'Completed' || payment?.status === 'Completed') ? 'completed' : 'pending',
    method: payment?.method || 'AgriFlow Payment Gateway',
    amount: order.totalAmount,
    currency: 'INR',
  };
}

export function orderToBecknOrder(
  order: Order,
  delivery?: Delivery,
  provider: BecknProvider = AGRIFLOW_BPP_PROVIDER,
  payment?: Payment,
  produce?: ProduceListing,
): BecknOrder {
  const item: BecknItem = {
    id: order.produceId || produce?.id || `item-${order.id}`,
    crop: order.crop,
    description: `${order.crop} — ${order.quantityKg} kg`,
    quantityKg: order.quantityKg,
    pricePerKg: order.pricePerKg,
    currency: 'INR',
    quality: 'Market Grade',
    providerName: order.farmerName,
    location: {
      id: `loc-${order.farmerId}`,
      address: delivery?.origin || 'Karunya Nagar',
      city: 'Coimbatore',
      district: 'Coimbatore',
    },
    availability: 'reserved',
    fulfillmentId: delivery?.id || `ful-${order.id}`,
    procurementCentre: 'Siruvani Main Road Centre',
    procurementCentreId: order.centreId || 'C01',
  };

  return {
    id: `beckn-${order.id}`,
    transactionId: `txn-${order.id}`,
    provider,
    item,
    quantityKg: order.quantityKg,
    totalAmount: order.totalAmount,
    fulfillment: orderToFulfillment(order, delivery),
    payment: orderToPayment(order, payment),
    status: BECKN_ORDER_STATUS_MAP[order.status],
    agriflowOrderId: order.id,
    createdAt: order.placedDate,
  };
}

export function buildCatalog(
  produceListings: ProduceListing[],
  farmers: Farmer[],
  orders: Order[],
  deliveries: Delivery[],
): BecknCatalog {
  const items = produceListings
    .filter((p) => p.status === 'available' || p.status === 'reserved')
    .map((p) => {
      const farmer = farmers.find((f) => f.id === p.farmerId);
      return produceToItem(p, farmer);
    });

  const locations = items.map((item) => item.location);
  const fulfillments = orders.map((o) => {
    const delivery = deliveries.find((d) => d.orderId === o.id);
    return orderToFulfillment(o, delivery);
  });

  return {
    provider: AGRIFLOW_BPP_PROVIDER,
    items,
    locations,
    fulfillments,
    itemCount: items.length,
  };
}

export function mapOrderStatus(orderStatus: Order['status']): BecknOrderStatus {
  return BECKN_ORDER_STATUS_MAP[orderStatus];
}
