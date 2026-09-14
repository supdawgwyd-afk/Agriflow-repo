import { createContext, useContext, useState, useCallback, useRef, type ReactNode } from 'react';
import type {
  Farmer,
  Buyer,
  ProcurementCentre,
  QueueToken,
  ProduceListing,
  Crop,
  Order,
  Payment,
  Notification,
  SlotBooking,
  Slot,
  Role,
  CropType,
  CentreStatus,
  Delivery,
} from '@/types';
import type { BppTransactionRecord, BecknOrderStatus } from '@/services/beckn/becknTypes';
import { BECKN_ORDER_STATUS_MAP } from '@/services/beckn/becknTypes';

const initialBppTransactions: BppTransactionRecord[] = [
  {
    id: 'BPP-TXN-20260902-001',
    transactionId: 'BPP-TXN-20260902-001',
    buyerId: 'B02',
    buyerName: 'Nilgiris Supermarket',
    farmerId: 'F02',
    farmerName: 'Palinisamy',
    crop: 'Potato',
    quantityKg: 300,
    pricePerKg: 28,
    totalAmount: 8400,
    becknStatus: 'in-transit',
    agriflowOrderId: 'O02',
    agriflowOrderNumber: 'ORD-2026-0002',
    fulfillmentStatus: 'in-transit',
    produceId: 'P02',
    providerId: 'AGRIFLOW-BPP-DEMO',
    deliveryId: 'DLV02',
    paymentId: 'PAY02',
    createdAt: '2026-09-02T10:30:00Z',
    timeline: [
      {
        action: 'search',
        timestamp: '2026-09-02T10:15:00Z',
        label: 'Beckn /search',
        description: 'Network-wide search for available Potato lots in Coimbatore region',
        request: { action: 'search', crop: 'Potato', quantityKg: 300, location: 'All' },
        response: { provider: 'AgriFlow AI', itemsFound: 1, items: [{ id: 'P02', crop: 'Potato', quantityKg: 300, pricePerKg: 28, quality: 'Grade A' }] },
      },
      {
        action: 'select',
        timestamp: '2026-09-02T10:18:00Z',
        label: 'Beckn /select',
        description: 'Selected Potato lot from Palinisamy with procurement fulfillment route',
        request: { action: 'select', itemId: 'P02', quantityKg: 300 },
        response: { item: { id: 'P02', crop: 'Potato', quantityKg: 300, pricePerKg: 28 }, fulfillment: { id: 'DLV02', status: 'pending', route: ['Karunya Nagar', 'Siruvani Main Road Centre', 'R.S. Puram, Coimbatore'] } },
      },
      {
        action: 'init',
        timestamp: '2026-09-02T10:20:00Z',
        label: 'Beckn /init',
        description: 'Initialized order draft with billing, delivery parameters, and payment terms',
        request: { action: 'init', itemId: 'P02', quantityKg: 300, buyerId: 'B02', buyerName: 'Nilgiris Supermarket' },
        response: { transactionId: 'BPP-TXN-20260902-001', order: { id: 'beckn-BPP-TXN-20260902-001', status: 'initialized', totalAmount: 8400 } },
      },
      {
        action: 'confirm',
        timestamp: '2026-09-02T10:22:00Z',
        label: 'Beckn /confirm',
        description: 'BPP Confirm linked directly to AgriFlow canonical order ORD-2026-0002',
        request: { action: 'confirm', transactionId: 'BPP-TXN-20260902-001' },
        response: { order: { id: 'beckn-BPP-TXN-20260902-001', status: 'confirmed', agriflowOrderId: 'O02' }, agriflowOrderId: 'O02' },
      },
      {
        action: 'status',
        timestamp: '2026-09-02T10:25:00Z',
        label: 'Beckn /status',
        description: 'Live order status query returned: in-transit (synchronized with logistics)',
        request: { action: 'status', transactionId: 'BPP-TXN-20260902-001' },
        response: { transactionId: 'BPP-TXN-20260902-001', status: 'in-transit', agriflowOrderId: 'O02' },
      },
      {
        action: 'track',
        timestamp: '2026-09-02T10:30:00Z',
        label: 'Beckn /track',
        description: 'Live GPS route tracking from Karunya Nagar via Siruvani Highway to R.S. Puram',
        request: { action: 'track', transactionId: 'BPP-TXN-20260902-001' },
        response: { transactionId: 'BPP-TXN-20260902-001', fulfillment: { id: 'DLV02', status: 'in-transit', eta: '3h 5m' } },
      },
    ],
  },
];
import {
  farmers as initialFarmers,
  buyers as initialBuyers,
  centres as initialCentres,
  queueTokens as initialQueueTokens,
  produceListings as initialProduce,
  crops as initialCrops,
  orders as initialOrders,
  payments as initialPayments,
  notifications as initialNotifications,
  slotBookings as initialBookings,
  slots as initialSlots,
  deliveries as initialDeliveries,
} from '@/data/mockData';

export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'info' | 'warning' | 'error';
}

interface AppState {
  role: Role;
  setRole: (r: Role) => void;
  currentFarmer: Farmer;
  farmers: Farmer[];
  buyers: Buyer[];
  centres: ProcurementCentre[];
  queueTokens: QueueToken[];
  produceListings: ProduceListing[];
  crops: Crop[];
  orders: Order[];
  payments: Payment[];
  notifications: Notification[];
  bookings: SlotBooking[];
  slots: Slot[];
  toasts: Toast[];
  addCrop: (crop: Omit<Crop, 'id'>) => void;
  updateCrop: (id: string, updates: Partial<Omit<Crop, 'id'>>) => void;
  removeCrop: (id: string) => void;
  addProduce: (produce: Omit<ProduceListing, 'id'>) => void;
  updateProduce: (id: string, updates: Partial<Omit<ProduceListing, 'id'>>) => void;
  removeProduce: (id: string) => void;
  bookSlot: (booking: Omit<SlotBooking, 'id' | 'status'>) => SlotBooking;
  updateQueueStage: (tokenId: string, stage: QueueToken['stage']) => void;
  placeOrder: (order: Omit<Order, 'id' | 'orderNumber' | 'status' | 'placedDate'>) => Order;
  updateOrderStatus: (orderId: string, status: Order['status']) => void;
  executeRedirect: (fromCentreId: string, toCentreId: string) => void;
  connectWithBuyer: (buyerId: string, farmerId: string, crop: CropType, quantityKg: number, pricePerKg: number) => void;
  updateDeliveryStatus: (deliveryId: string, status: Delivery['status']) => void;
  markNotificationRead: (id: string) => void;
  toggleSlot: (slotId: string) => void;
  addNotification: (n: Omit<Notification, 'id' | 'time' | 'read'>) => void;
  showToast: (message: string, type?: Toast['type']) => void;
  dismissToast: (id: string) => void;
  deliveries: Delivery[];
  updatePaymentStatus: (paymentId: string, status: Payment['status']) => void;
  bppTransactions: BppTransactionRecord[];
  addBppTransaction: (txn: BppTransactionRecord) => void;
  updateBppTransaction: (id: string, updates: Partial<BppTransactionRecord>) => void;
  resetDemoState: () => void;
}

const AppContext = createContext<AppState | null>(null);

function computeCentreStatus(capacityPct: number): CentreStatus {
  if (capacityPct >= 90) return 'OVERLOADED';
  if (capacityPct >= 75) return 'HIGH LOAD';
  if (capacityPct >= 50) return 'MODERATE';
  return 'AVAILABLE';
}

function recomputeCapacity(queueCount: number, slotsBooked: number, slotsTotal: number): number {
  const slotUsage = (slotsBooked / slotsTotal) * 100;
  const queueLoad = Math.min(100, queueCount * 2.5);
  return Math.round(Math.min(100, Math.max(slotUsage, queueLoad, (slotUsage + queueLoad) / 2 + 10)));
}

let idCounter = 0;
function nextId(prefix: string): string {
  idCounter += 1;
  return `${prefix}${String(idCounter).padStart(3, '0')}`;
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<Role>('farmer');
  const [farmers, setFarmers] = useState<Farmer[]>(initialFarmers);
  const [buyers] = useState<Buyer[]>(initialBuyers);
  const [centres, setCentres] = useState<ProcurementCentre[]>(initialCentres);
  const [queueTokens, setQueueTokens] = useState<QueueToken[]>(initialQueueTokens);
  const [produceListings, setProduceListings] = useState<ProduceListing[]>(initialProduce);
  const [crops, setCrops] = useState<Crop[]>(initialCrops);
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [payments, setPayments] = useState<Payment[]>(initialPayments);
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);
  const [bookings, setBookings] = useState<SlotBooking[]>(initialBookings);
  const [slots, setSlots] = useState<Slot[]>(initialSlots);
  const [deliveries, setDeliveries] = useState<Delivery[]>(initialDeliveries);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [bppTransactions, setBppTransactions] = useState<BppTransactionRecord[]>(initialBppTransactions);
  const toastTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  const currentFarmer = farmers[0];

  const showToast = useCallback((message: string, type: Toast['type'] = 'success') => {
    const id = nextId('T');
    setToasts((prev) => [...prev, { id, message, type }]);
    toastTimers.current[id] = setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
      delete toastTimers.current[id];
    }, 4000);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
    if (toastTimers.current[id]) {
      clearTimeout(toastTimers.current[id]);
      delete toastTimers.current[id];
    }
  }, []);

  const addBppTransaction = useCallback((txn: BppTransactionRecord) => {
    setBppTransactions((prev) => [txn, ...prev]);
  }, []);

  const updateBppTransaction = useCallback((id: string, updates: Partial<BppTransactionRecord>) => {
    setBppTransactions((prev) => prev.map((t) => (t.id === id ? { ...t, ...updates } : t)));
  }, []);

  const addNotification = useCallback((n: Omit<Notification, 'id' | 'time' | 'read'>) => {
    const newNotif: Notification = {
      ...n,
      id: nextId('N'),
      time: 'Just now',
      read: false,
    };
    setNotifications((prev) => [newNotif, ...prev]);
  }, []);

  const updateCentreStats = useCallback((centreId: string) => {
    setCentres((prevCentres) =>
      prevCentres.map((c) => {
        if (c.id !== centreId) return c;
        return c;
      })
    );
    // We need to recompute from queueTokens, but that's in a different setter.
    // So we'll do it in the callers where we have both pieces of state.
  }, []);

  const addCrop = useCallback((crop: Omit<Crop, 'id'>) => {
    const newCrop: Crop = { ...crop, id: nextId('CR') };
    setCrops((prev) => [...prev, newCrop]);
    showToast(`${crop.name} added successfully`, 'success');
  }, [showToast]);

  const updateCrop = useCallback((id: string, updates: Partial<Omit<Crop, 'id'>>) => {
    setCrops((prev) => prev.map((c) => (c.id === id ? { ...c, ...updates } : c)));
    showToast('Crop updated successfully', 'success');
  }, [showToast]);

  const removeCrop = useCallback((id: string) => {
    const crop = crops.find((c) => c.id === id);
    setCrops((prev) => prev.filter((c) => c.id !== id));
    if (crop) showToast(`${crop.name} removed`, 'info');
  }, [crops, showToast]);

  const addProduce = useCallback((produce: Omit<ProduceListing, 'id'>) => {
    const newProduce: ProduceListing = { ...produce, id: nextId('P') };
    setProduceListings((prev) => [newProduce, ...prev]);
    showToast(`${produce.crop} listing added to marketplace`, 'success');
  }, [showToast]);

  const updateProduce = useCallback((id: string, updates: Partial<Omit<ProduceListing, 'id'>>) => {
    setProduceListings((prev) => prev.map((p) => (p.id === id ? { ...p, ...updates } : p)));
    showToast('Produce listing updated', 'success');
  }, [showToast]);

  const removeProduce = useCallback((id: string) => {
    setProduceListings((prev) => prev.filter((p) => p.id !== id));
    showToast('Produce listing removed', 'info');
  }, [showToast]);

  const bookSlot = useCallback((booking: Omit<SlotBooking, 'id' | 'status'>) => {
    const newBooking: SlotBooking = {
      ...booking,
      id: nextId('SB'),
      status: 'booked',
    };
    setBookings((prev) => [newBooking, ...prev]);

    const newToken: QueueToken = {
      id: nextId('Q'),
      tokenNumber: booking.tokenNumber,
      centreId: booking.centreId,
      farmerId: booking.farmerId,
      farmerName: booking.farmerName,
      crop: booking.crop,
      quantityKg: booking.quantityKg,
      arrivalTime: '—',
      stage: 'Registered',
      estimatedWaitMin: booking.estimatedWaitMin,
      priority: 'Normal',
      slotTime: booking.slotTime,
    };
    setQueueTokens((prev) => [newToken, ...prev]);

    // Update centre: increment queue + slots booked + recompute capacity/status
    setCentres((prev) =>
      prev.map((c) => {
        if (c.id !== booking.centreId) return c;
        const newQueue = c.queueCount + 1;
        const newSlotsBooked = c.todaySlotsBooked + 1;
        const newCapacity = recomputeCapacity(newQueue, newSlotsBooked, c.todaySlotsTotal);
        return {
          ...c,
          queueCount: newQueue,
          todaySlotsBooked: newSlotsBooked,
          farmersToday: c.farmersToday + 1,
          capacityPct: newCapacity,
          status: computeCentreStatus(newCapacity),
        };
      })
    );

    addNotification({
      role: 'farmer',
      type: 'slot',
      title: 'Slot Confirmed',
      message: `Your slot at ${booking.centreName} (${booking.slotTime}) has been confirmed. Token: ${booking.tokenNumber}`,
      severity: 'success',
    });

    addNotification({
      role: 'centre',
      type: 'surge',
      title: 'New Farmer Booking',
      message: `${booking.farmerName} booked slot ${booking.slotTime} for ${booking.quantityKg} kg ${booking.crop}. Token: ${booking.tokenNumber}`,
      severity: 'info',
    });

    addNotification({
      role: 'admin',
      type: 'slot',
      title: 'New Slot Booked',
      message: `${booking.farmerName} booked slot at ${booking.centreName} for ${booking.quantityKg} kg ${booking.crop}. Token: ${booking.tokenNumber}`,
      severity: 'info',
    });

    showToast(`Slot booked! Token: ${booking.tokenNumber}`, 'success');

    return newBooking;
  }, [addNotification, showToast]);

  const updateQueueStage = useCallback((tokenId: string, stage: QueueToken['stage']) => {
    setQueueTokens((prev) => {
      const token = prev.find((t) => t.id === tokenId);
      if (!token) return prev;
      const updated = prev.map((t) => (t.id === tokenId ? { ...t, stage } : t));

      const farmer = farmers.find((f) => f.id === token.farmerId);
      const centre = centres.find((c) => c.id === token.centreId);
      const cropInfo = crops.find((c) => c.farmerId === token.farmerId && c.name === token.crop);
      const quality = cropInfo?.quality || 'A';
      const basePrices: Record<CropType, number> = {
        Tomato: 30, Potato: 18, Onion: 24, Rice: 40, Maize: 22,
        Chilli: 90, Wheat: 28, Cotton: 55, Sugarcane: 35, Groundnut: 48,
      };
      const price = basePrices[token.crop] || 25;
      const paymentAmount = token.quantityKg * price;

      // When procurement is completed, create produce listing, update farmer stats, mark booking completed, and create payment
      if (stage === 'Procured') {
        // 1. Create produce listing for marketplace
        setProduceListings((prevProduce) => {
          const existingListing = prevProduce.find(
            (p) => p.farmerId === token.farmerId && p.crop === token.crop && p.status === 'available' && p.quantityKg === token.quantityKg
          );
          if (existingListing) return prevProduce;
          const newListing: ProduceListing = {
            id: nextId('P'),
            farmerId: token.farmerId,
            farmerName: token.farmerName,
            crop: token.crop,
            quantityKg: token.quantityKg,
            pricePerKg: price,
            quality,
            location: farmer?.village || 'Karunya Nagar',
            distanceKm: Math.round(Math.random() * 15 * 10) / 10,
            availableInDays: 0,
            buyerInterest: Math.round(40 + Math.random() * 40),
            status: 'available',
            centreId: token.centreId,
            centreName: centre?.name || 'Karunya Nagar Centre',
          };
          return [newListing, ...prevProduce];
        });

        // 2. Mark booking completed
        setBookings((prevBookings) =>
          prevBookings.map((b) =>
            b.tokenNumber === token.tokenNumber ? { ...b, status: 'completed' } : b
          )
        );

        // 3. Update farmer stats (produce + pending payment)
        setFarmers((prevFarmers) =>
          prevFarmers.map((f) =>
            f.id === token.farmerId
              ? {
                  ...f,
                  totalProduceKg: f.totalProduceKg + token.quantityKg,
                  pendingPayments: f.pendingPayments + paymentAmount,
                }
              : f
          )
        );

        // 4. Update centre: queue, processed kg, pending payments count, and capacity
        setCentres((prevCentres) =>
          prevCentres.map((c) => {
            if (c.id !== token.centreId) return c;
            const newQueue = Math.max(0, c.queueCount - 1);
            const newCapacity = recomputeCapacity(newQueue, c.todaySlotsBooked, c.todaySlotsTotal);
            return {
              ...c,
              queueCount: newQueue,
              processedTodayKg: c.processedTodayKg + token.quantityKg,
              pendingPaymentsCount: c.pendingPaymentsCount + 1,
              capacityPct: newCapacity,
              status: computeCentreStatus(newCapacity),
            };
          })
        );

        // 5. Create payment record in Processing state
        setPayments((prevPay) => {
          const exists = prevPay.some((p) => p.farmerId === token.farmerId && p.crop === token.crop && p.quantityKg === token.quantityKg && p.status !== 'Completed');
          if (exists) return prevPay;
          const newPayment: Payment = {
            id: nextId('PAY'),
            transactionId: `TXN${String(Date.now()).slice(-7)}`,
            farmerId: token.farmerId,
            farmerName: token.farmerName,
            centreId: token.centreId,
            centreName: centre?.name || 'Unknown Centre',
            crop: token.crop,
            quantityKg: token.quantityKg,
            amount: paymentAmount,
            status: 'Processing',
            date: '2026-09-02',
            method: 'Bank Transfer',
          };
          return [newPayment, ...prevPay];
        });

        // Notifications
        addNotification({
          role: 'farmer',
          type: 'produce',
          title: 'Procurement Completed & Listed',
          message: `${token.quantityKg} kg ${token.crop} procured at ${centre?.name || 'centre'}. Produce is now listed in Buyer Marketplace.`,
          severity: 'success',
        });
        addNotification({
          role: 'buyer',
          type: 'produce',
          title: 'New Produce Available',
          message: `${token.quantityKg} kg ${token.crop} available from ${token.farmerName} at ₹${price}/kg.`,
          severity: 'info',
        });
        addNotification({
          role: 'centre',
          type: 'surge',
          title: 'Procurement Recorded',
          message: `${token.quantityKg} kg ${token.crop} from ${token.farmerName} (${token.tokenNumber}) processed successfully.`,
          severity: 'info',
        });
        addNotification({
          role: 'admin',
          type: 'produce',
          title: 'Produce Catalog Updated',
          message: `${token.quantityKg} kg ${token.crop} from ${token.farmerName} (${centre?.name || 'centre'}) now listed on marketplace.`,
          severity: 'info',
        });

        showToast(`Procurement completed & produce listed on marketplace!`, 'success');
      } else if (stage === 'Payment') {
        // Mark payment completed and update farmer earnings
        setPayments((prevPay) => {
          const existing = prevPay.find((p) => p.farmerId === token.farmerId && p.crop === token.crop);
          if (existing) {
            return prevPay.map((p) => (p.id === existing.id ? { ...p, status: 'Completed' } : p));
          }
          const newPayment: Payment = {
            id: nextId('PAY'),
            transactionId: `TXN${String(Date.now()).slice(-7)}`,
            farmerId: token.farmerId,
            farmerName: token.farmerName,
            centreId: token.centreId,
            centreName: centre?.name || 'Unknown Centre',
            crop: token.crop,
            quantityKg: token.quantityKg,
            amount: paymentAmount,
            status: 'Completed',
            date: '2026-09-02',
            method: 'Bank Transfer',
          };
          return [newPayment, ...prevPay];
        });

        setFarmers((prevFarmers) =>
          prevFarmers.map((f) =>
            f.id === token.farmerId
              ? {
                  ...f,
                  pendingPayments: Math.max(0, f.pendingPayments - paymentAmount),
                  totalEarnings: f.totalEarnings + paymentAmount,
                }
              : f
          )
        );

        setCentres((prevCentres) =>
          prevCentres.map((c) =>
            c.id === token.centreId
              ? { ...c, pendingPaymentsCount: Math.max(0, c.pendingPaymentsCount - 1) }
              : c
          )
        );

        addNotification({
          role: 'farmer',
          type: 'payment',
          title: 'Payment Completed',
          message: `₹${paymentAmount.toLocaleString('en-IN')} payment completed for ${token.quantityKg} kg ${token.crop} at ${centre?.name || 'centre'}.`,
          severity: 'success',
        });
        addNotification({
          role: 'centre',
          type: 'delay',
          title: 'Payment Disbursed',
          message: `Payment of ₹${paymentAmount.toLocaleString('en-IN')} disbursed to ${token.farmerName} (${token.tokenNumber}).`,
          severity: 'success',
        });
        addNotification({
          role: 'admin',
          type: 'payment',
          title: 'Payment Processed',
          message: `₹${paymentAmount.toLocaleString('en-IN')} paid to ${token.farmerName} at ${centre?.name || 'centre'}.`,
          severity: 'success',
        });

        showToast(`Payment completed for ${token.farmerName}!`, 'success');
      } else {
        // Notify farmer of stage change
        addNotification({
          role: 'farmer',
          type: 'queue',
          title: 'Queue Updated',
          message: `Your token ${token.tokenNumber} moved to: ${stage}`,
          severity: 'info',
        });
      }

      return updated;
    });
  }, [centres, farmers, crops, addNotification, showToast]);

  const executeRedirect = useCallback((fromCentreId: string, toCentreId: string) => {
    const fromCentre = centres.find((c) => c.id === fromCentreId);
    const toCentre = centres.find((c) => c.id === toCentreId);
    if (!fromCentre || !toCentre) return;

    // Move Registered/Waiting tokens from the congested centre to the alternative
    const tokensToMove = queueTokens.filter(
      (t) => t.centreId === fromCentreId && (t.stage === 'Registered' || t.stage === 'Waiting')
    );
    const movedCount = Math.min(tokensToMove.length, Math.ceil(tokensToMove.length * 0.5));
    const tokensToRedirect = tokensToMove.slice(0, movedCount);

    if (tokensToRedirect.length > 0) {
      setQueueTokens((prev) =>
        prev.map((t) => {
          const shouldMove = tokensToRedirect.find((mt) => mt.id === t.id);
          return shouldMove ? { ...t, centreId: toCentreId } : t;
        })
      );
    }

    // Update both centres' capacity and queue
    setCentres((prev) =>
      prev.map((c) => {
        if (c.id === fromCentreId) {
          const newQueue = Math.max(0, c.queueCount - movedCount);
          const newCapacity = recomputeCapacity(newQueue, c.todaySlotsBooked, c.todaySlotsTotal);
          return { ...c, queueCount: newQueue, capacityPct: newCapacity, status: computeCentreStatus(newCapacity) };
        }
        if (c.id === toCentreId) {
          const newQueue = c.queueCount + movedCount;
          const newCapacity = recomputeCapacity(newQueue, c.todaySlotsBooked, c.todaySlotsTotal);
          return { ...c, queueCount: newQueue, capacityPct: newCapacity, status: computeCentreStatus(newCapacity) };
        }
        return c;
      })
    );

    addNotification({
      role: 'centre',
      type: 'congestion',
      title: 'Farmers Redirected',
      message: `${movedCount} farmers redirected from ${fromCentre.name} to ${toCentre.name}.`,
      severity: 'warning',
    });

    addNotification({
      role: 'admin',
      type: 'congestion',
      title: 'Redirect Executed',
      message: `${movedCount} farmers redirected from ${fromCentre.name} to ${toCentre.name}.`,
      severity: 'warning',
    });

    showToast(`${movedCount} farmers redirected from ${fromCentre.name} to ${toCentre.name}`, 'success');
  }, [centres, queueTokens, addNotification, showToast]);

  const connectWithBuyer = useCallback((buyerId: string, farmerId: string, crop: CropType, quantityKg: number, pricePerKg: number) => {
    const buyer = buyers.find((b) => b.id === buyerId);
    const farmer = farmers.find((f) => f.id === farmerId);
    if (!buyer || !farmer) return;

    addNotification({
      role: 'farmer',
      type: 'buyer',
      title: 'Buyer Connection Request',
      message: `${buyer.name} has been notified of your interest to sell ${quantityKg} kg ${crop} at ₹${pricePerKg}/kg.`,
      severity: 'info',
    });

    addNotification({
      role: 'buyer',
      type: 'produce',
      title: 'Farmer Connection Request',
      message: `${farmer.name} is interested in selling ${quantityKg} kg ${crop} at ₹${pricePerKg}/kg.`,
      severity: 'info',
    });

    showToast(`Connection request sent to ${buyer.name}`, 'success');
  }, [buyers, farmers, addNotification, showToast]);

  const placeOrder = useCallback((order: Omit<Order, 'id' | 'orderNumber' | 'status' | 'placedDate'>): Order => {
    const newOrder: Order = {
      ...order,
      id: nextId('O'),
      orderNumber: `ORD-2026-${String(Date.now()).slice(-4)}`,
      status: 'Placed',
      placedDate: '2026-09-02',
    };
    setOrders((prev) => [newOrder, ...prev]);

    // Update produce status to reserved
    setProduceListings((prev) =>
      prev.map((p) =>
        p.farmerId === order.farmerId && p.crop === order.crop && p.status === 'available'
          ? { ...p, status: 'reserved' }
          : p
      )
    );

    addNotification({
      role: 'farmer',
      type: 'order',
      title: 'New Order Received',
      message: `${order.buyerName} placed an order for ${order.quantityKg} kg ${order.crop} (₹${order.totalAmount.toLocaleString('en-IN')})`,
      severity: 'info',
    });

    addNotification({
      role: 'buyer',
      type: 'order',
      title: 'Order Placed',
      message: `Order ${newOrder.orderNumber} placed for ${order.quantityKg} kg ${order.crop} from ${order.farmerName}`,
      severity: 'success',
    });

    addNotification({
      role: 'admin',
      type: 'order',
      title: 'New Marketplace Order',
      message: `Order ${newOrder.orderNumber} placed by ${order.buyerName} for ${order.quantityKg} kg ${order.crop} (₹${order.totalAmount.toLocaleString('en-IN')})`,
      severity: 'info',
    });

    addNotification({
      role: 'centre',
      type: 'order',
      title: 'Procured Produce Ordered',
      message: `${order.quantityKg} kg ${order.crop} ordered by ${order.buyerName} from ${order.farmerName}`,
      severity: 'info',
    });

    // Create a delivery record for the new order: Farmer/source -> Procurement Centre -> Buyer destination
    const farmer = farmers.find((f) => f.id === order.farmerId);
    const orderBuyer = buyers.find((b) => b.id === order.buyerId);
    const centreName = farmer?.centreId === 'C01'
      ? 'Siruvani Main Road Centre'
      : farmer?.centreId === 'C02'
        ? 'Thondamuthur Centre'
        : farmer?.centreId === 'C03'
          ? 'Alandurai Hub'
          : 'Siruvani Main Road Centre';

    const newDelivery: Delivery = {
      id: nextId('DLV'),
      orderId: newOrder.id,
      origin: farmer?.village || 'Karunya Nagar',
      collectionPoints: [centreName],
      destination: orderBuyer?.location || order.buyerName,
      distanceKm: Math.round((5 + Math.random() * 25) * 10) / 10,
      eta: `${2 + Math.floor(Math.random() * 4)}h ${Math.floor(Math.random() * 60)}m`,
      driver: 'Auto-assigned',
      vehicle: 'Pending assignment',
      status: 'Scheduled',
    };
    setDeliveries((prev) => [newDelivery, ...prev]);

    // Create corresponding simulated payment record: Order ↔ Payment ↔ BPP transaction
    const newPayment: Payment = {
      id: nextId('PAY'),
      farmerId: order.farmerId,
      farmerName: order.farmerName,
      crop: order.crop,
      quantityKg: order.quantityKg,
      amount: order.totalAmount,
      date: '2026-09-02',
      status: 'Pending',
      method: 'Bank Transfer (UPI / IMPS)',
    };
    setPayments((prev) => [newPayment, ...prev]);

    showToast(`Order placed: ${newOrder.orderNumber}`, 'success');
    return newOrder;
  }, [buyers, farmers, addNotification, showToast]);

  const updateOrderStatus = useCallback((orderId: string, status: Order['status']) => {
    setOrders((prev) => {
      const order = prev.find((o) => o.id === orderId);
      if (!order) return prev;

      addNotification({
        role: 'farmer',
        type: 'order',
        title: 'Order Status Updated',
        message: `Order ${order.orderNumber} is now: ${status}`,
        severity: status === 'Completed' ? 'success' : 'info',
      });

      addNotification({
        role: 'buyer',
        type: 'order',
        title: 'Order Status Updated',
        message: `Order ${order.orderNumber} is now: ${status}`,
        severity: status === 'Completed' ? 'success' : 'info',
      });

      addNotification({
        role: 'admin',
        type: 'order',
        title: 'Order Status Updated',
        message: `Order ${order.orderNumber} updated to: ${status}`,
        severity: status === 'Completed' ? 'success' : 'info',
      });

      if (status === 'Completed') {
        setFarmers((prevFarmers) =>
          prevFarmers.map((f) =>
            f.id === order.farmerId
              ? { ...f, totalEarnings: f.totalEarnings + order.totalAmount }
              : f
          )
        );

        addNotification({
          role: 'farmer',
          type: 'payment',
          title: 'Payment Completed',
          message: `₹${order.totalAmount.toLocaleString('en-IN')} received for order ${order.orderNumber}`,
          severity: 'success',
        });
        showToast(`Payment completed: ₹${order.totalAmount.toLocaleString('en-IN')}`, 'success');
      } else {
        showToast(`Order updated: ${status}`, 'info');
      }

      // If completed, mark produce as sold
      if (status === 'Completed') {
        setProduceListings((prevProduce) =>
          prevProduce.map((p) =>
            p.farmerId === order.farmerId && p.crop === order.crop
              ? { ...p, status: 'sold' }
              : p
          )
        );
      }

      // Sync delivery status with order status
      if (status === 'Delivered' || status === 'Completed') {
        setDeliveries((prevDeliv) =>
          prevDeliv.map((d) => (d.orderId === orderId ? { ...d, status: 'Delivered', eta: 'Delivered' } : d))
        );
      } else if (status === 'In Transit') {
        setDeliveries((prevDeliv) =>
          prevDeliv.map((d) => (d.orderId === orderId && d.status === 'Scheduled' ? { ...d, status: 'In Transit' } : d))
        );
      }

      // Sync BPP transaction status with order status
      const becknStatus = BECKN_ORDER_STATUS_MAP[status];
      const fulfillmentStatusMap: Record<Order['status'], string> = {
        'Placed': 'pending',
        'Confirmed': 'pickup-scheduled',
        'Collection Scheduled': 'collected',
        'In Transit': 'in-transit',
        'Delivered': 'delivered',
        'Completed': 'completed',
      };
      setBppTransactions((prevTxns) =>
        prevTxns.map((t) =>
          t.agriflowOrderId === orderId
            ? { ...t, becknStatus, fulfillmentStatus: fulfillmentStatusMap[status] }
            : t
        )
      );

      return prev.map((o) => (o.id === orderId ? { ...o, status } : o));
    });
  }, [addNotification, showToast]);

  const markNotificationRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  }, []);

  const toggleSlot = useCallback((slotId: string) => {
    setSlots((prev) =>
      prev.map((s) => {
        if (s.id !== slotId) return s;
        showToast(`Slot ${s.isOpen ? 'closed' : 'opened'}: ${s.time}`, 'info');
        return { ...s, isOpen: !s.isOpen };
      })
    );
  }, [showToast]);

  const updateDeliveryStatus = useCallback((deliveryId: string, status: Delivery['status']) => {
    setDeliveries((prev) => {
      const delivery = prev.find((d) => d.id === deliveryId);
      if (delivery) {
        // Sync back to orders
        setOrders((oPrev) =>
          oPrev.map((o) => {
            if (o.id !== delivery.orderId) return o;
            if (status === 'In Transit' && o.status !== 'Delivered' && o.status !== 'Completed') {
              return { ...o, status: 'In Transit' };
            }
            if (status === 'Delivered' && o.status !== 'Completed') {
              return { ...o, status: 'Delivered' };
            }
            return o;
          })
        );

        const fulfillmentStatusMap: Record<Delivery['status'], string> = {
          'Scheduled': 'pickup-scheduled',
          'In Transit': 'in-transit',
          'Delivered': 'delivered',
        };
        const becknStatusMap: Record<Delivery['status'], BecknOrderStatus> = {
          'Scheduled': 'collection-scheduled',
          'In Transit': 'in-transit',
          'Delivered': 'delivered',
        };
        setBppTransactions((prevTxns) =>
          prevTxns.map((t) =>
            t.agriflowOrderId === delivery.orderId
              ? {
                  ...t,
                  fulfillmentStatus: fulfillmentStatusMap[status],
                  becknStatus: becknStatusMap[status],
                }
              : t
          )
        );

        addNotification({
          role: 'buyer',
          type: 'delivery',
          title: 'Delivery Update',
          message: `Delivery for order ${delivery.orderId} is now ${status}. Origin: ${delivery.origin}.`,
          severity: status === 'Delivered' ? 'success' : 'info',
        });
        addNotification({
          role: 'farmer',
          type: 'delivery',
          title: 'Logistics Update',
          message: `Produce shipment for order ${delivery.orderId} is now ${status}. Destination: ${delivery.destination}.`,
          severity: status === 'Delivered' ? 'success' : 'info',
        });
        addNotification({
          role: 'admin',
          type: 'delivery',
          title: 'Logistics Tracking',
          message: `Delivery ${delivery.id} (Order: ${delivery.orderId}) updated to ${status}.`,
          severity: 'info',
        });
      }
      return prev.map((d) => (d.id === deliveryId ? { ...d, status, ...(status === 'Delivered' ? { eta: 'Delivered' } : {}) } : d));
    });
    showToast(`Delivery updated: ${status}`, 'info');
  }, [addNotification, showToast]);

  const updatePaymentStatus = useCallback((paymentId: string, status: Payment['status']) => {
    setPayments((prev) => {
      const payment = prev.find((p) => p.id === paymentId);
      if (!payment) return prev;
      const wasCompleted = payment.status === 'Completed';
      const isNowCompleted = status === 'Completed';

      if (!wasCompleted && isNowCompleted) {
        setFarmers((prevFarmers) =>
          prevFarmers.map((f) =>
            f.id === payment.farmerId
              ? {
                  ...f,
                  pendingPayments: Math.max(0, f.pendingPayments - payment.amount),
                  totalEarnings: f.totalEarnings + payment.amount,
                }
              : f
          )
        );

        setCentres((prevCentres) =>
          prevCentres.map((c) =>
            c.id === payment.centreId
              ? { ...c, pendingPaymentsCount: Math.max(0, c.pendingPaymentsCount - 1) }
              : c
          )
        );

        addNotification({
          role: 'farmer',
          type: 'payment',
          title: 'Payment Completed',
          message: `Payment of ₹${payment.amount.toLocaleString('en-IN')} for ${payment.quantityKg} kg ${payment.crop} has been completed via ${payment.method}.`,
          severity: 'success',
        });
        addNotification({
          role: 'centre',
          type: 'delay',
          title: 'Payment Completed',
          message: `Payment of ₹${payment.amount.toLocaleString('en-IN')} completed for ${payment.farmerName}.`,
          severity: 'success',
        });
        addNotification({
          role: 'admin',
          type: 'payment',
          title: 'Payment Cleared',
          message: `₹${payment.amount.toLocaleString('en-IN')} cleared for ${payment.farmerName} (${payment.centreName}).`,
          severity: 'success',
        });
        showToast(`Payment of ₹${payment.amount.toLocaleString('en-IN')} completed!`, 'success');
      } else {
        addNotification({
          role: 'farmer',
          type: 'payment',
          title: 'Payment Status Updated',
          message: `Payment of ₹${payment.amount.toLocaleString('en-IN')} for ${payment.crop} is now: ${status}.`,
          severity: 'info',
        });
        showToast(`Payment updated: ${status}`, 'info');
      }

      return prev.map((p) => (p.id === paymentId ? { ...p, status } : p));
    });
  }, [addNotification, showToast]);

  const resetDemoState = useCallback(() => {
    try {
      sessionStorage.removeItem('sih-demo-current-step');
    } catch {
      // Graceful fallback for sandboxed environments
    }
    setOrders(initialOrders);
    setProduceListings(initialProduce);
    setQueueTokens(initialQueueTokens);
    setDeliveries(initialDeliveries);
    setPayments(initialPayments);
    setBppTransactions(initialBppTransactions);
    showToast('Demo state reset to clean initial baseline', 'info');
  }, [showToast]);

  return (
    <AppContext.Provider
      value={{
        role,
        setRole,
        currentFarmer,
        farmers,
        buyers,
        centres,
        queueTokens,
        produceListings,
        crops,
        orders,
        payments,
        notifications,
        bookings,
        slots,
        toasts,
        addCrop,
        removeCrop,
        bookSlot,
        updateQueueStage,
        placeOrder,
        updateOrderStatus,
        markNotificationRead,
        toggleSlot,
        addNotification,
        showToast,
        dismissToast,
        updateCrop,
        addProduce,
        updateProduce,
        removeProduce,
        executeRedirect,
        connectWithBuyer,
        deliveries,
        updateDeliveryStatus,
        updatePaymentStatus,
        bppTransactions,
        addBppTransaction,
        updateBppTransaction,
        resetDemoState,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
