import type {
  Farmer,
  Buyer,
  ProcurementCentre,
  ProduceListing,
  Crop,
  CropType,
  QueueToken,
  Order,
  Payment,
  Notification,
  AIRecommendation,
  Slot,
  Delivery,
  FarmerCluster,
  SlotBooking,
} from '@/types';

// ── FARMERS (20) ──
export const farmers: Farmer[] = [
  { id: 'F01', name: 'Ravi Kumar', village: 'Karunya Nagar', district: 'Coimbatore', phone: '+91 98490 12345', landAcres: 4.5, totalProduceKg: 3200, totalEarnings: 284000, pendingPayments: 12000, rating: 4.7, crops: ['Tomato', 'Rice'], joinedDate: '2024-03-15' },
  { id: 'F02', name: 'Suresh Kumar', village: 'Siruvani', district: 'Coimbatore', phone: '+91 98490 23456', landAcres: 6.0, totalProduceKg: 4800, totalEarnings: 412000, pendingPayments: 0, rating: 4.9, crops: ['Potato', 'Onion'], joinedDate: '2024-01-20' },
  { id: 'F03', name: 'Murugan', village: 'Alandurai', district: 'Coimbatore', phone: '+91 98490 34567', landAcres: 2.5, totalProduceKg: 1800, totalEarnings: 156000, pendingPayments: 8500, rating: 4.5, crops: ['Chilli', 'Tomato'], joinedDate: '2024-05-10' },
  { id: 'F04', name: 'Karthikeyan', village: 'Madampatti', district: 'Coimbatore', phone: '+91 98490 45678', landAcres: 3.0, totalProduceKg: 2400, totalEarnings: 198000, pendingPayments: 6000, rating: 4.6, crops: ['Maize', 'Cotton'], joinedDate: '2024-02-05' },
  { id: 'F05', name: 'Selvam', village: 'Thondamuthur', district: 'Coimbatore', phone: '+91 98490 56789', landAcres: 5.5, totalProduceKg: 4100, totalEarnings: 367000, pendingPayments: 15000, rating: 4.8, crops: ['Rice', 'Groundnut'], joinedDate: '2024-01-08' },
  { id: 'F06', name: 'Prakash', village: 'Perur', district: 'Coimbatore', phone: '+91 98490 67890', landAcres: 2.0, totalProduceKg: 1500, totalEarnings: 134000, pendingPayments: 0, rating: 4.4, crops: ['Tomato', 'Chilli'], joinedDate: '2024-04-12' },
  { id: 'F07', name: 'Muthu', village: 'Kovaipudur', district: 'Coimbatore', phone: '+91 98490 78901', landAcres: 7.0, totalProduceKg: 5200, totalEarnings: 445000, pendingPayments: 22000, rating: 4.9, crops: ['Cotton', 'Maize'], joinedDate: '2024-01-15' },
  { id: 'F08', name: 'Arul', village: 'Siruvani', district: 'Coimbatore', phone: '+91 98490 89012', landAcres: 1.5, totalProduceKg: 900, totalEarnings: 78000, pendingPayments: 4500, rating: 4.3, crops: ['Onion', 'Tomato'], joinedDate: '2024-06-20' },
  { id: 'F09', name: 'Senthil Kumar', village: 'Karunya Nagar', district: 'Coimbatore', phone: '+91 98490 90123', landAcres: 8.0, totalProduceKg: 6400, totalEarnings: 568000, pendingPayments: 0, rating: 4.8, crops: ['Rice', 'Sugarcane'], joinedDate: '2024-01-01' },
  { id: 'F10', name: 'Rajendran', village: 'Alandurai', district: 'Coimbatore', phone: '+91 98491 01234', landAcres: 3.5, totalProduceKg: 2700, totalEarnings: 223000, pendingPayments: 9000, rating: 4.5, crops: ['Groundnut', 'Maize'], joinedDate: '2024-03-22' },
  { id: 'F11', name: 'Palinisamy', village: 'Madampatti', district: 'Coimbatore', phone: '+91 98491 12345', landAcres: 4.0, totalProduceKg: 3100, totalEarnings: 276000, pendingPayments: 11000, rating: 4.6, crops: ['Potato', 'Wheat'], joinedDate: '2024-02-18' },
  { id: 'F12', name: 'Lakshmi', village: 'Thondamuthur', district: 'Coimbatore', phone: '+91 98491 23456', landAcres: 2.5, totalProduceKg: 1900, totalEarnings: 162000, pendingPayments: 0, rating: 4.4, crops: ['Chilli', 'Cotton'], joinedDate: '2024-04-05' },
  { id: 'F13', name: 'Marimuthu', village: 'Perur', district: 'Coimbatore', phone: '+91 98491 34567', landAcres: 6.5, totalProduceKg: 4900, totalEarnings: 423000, pendingPayments: 18000, rating: 4.7, crops: ['Rice', 'Groundnut'], joinedDate: '2024-01-25' },
  { id: 'F14', name: 'Sasikumar', village: 'Kovaipudur', district: 'Coimbatore', phone: '+91 98491 45678', landAcres: 3.0, totalProduceKg: 2300, totalEarnings: 189000, pendingPayments: 7500, rating: 4.5, crops: ['Tomato', 'Onion'], joinedDate: '2024-03-30' },
  { id: 'F15', name: 'Velusamy', village: 'Karunya Nagar', district: 'Coimbatore', phone: '+91 98491 56789', landAcres: 5.0, totalProduceKg: 3800, totalEarnings: 341000, pendingPayments: 0, rating: 4.8, crops: ['Maize', 'Sugarcane'], joinedDate: '2024-02-10' },
  { id: 'F16', name: 'Sundaram', village: 'Siruvani', district: 'Coimbatore', phone: '+91 98491 67890', landAcres: 2.0, totalProduceKg: 1400, totalEarnings: 121000, pendingPayments: 5000, rating: 4.3, crops: ['Chilli', 'Tomato'], joinedDate: '2024-05-15' },
  { id: 'F17', name: 'Manikandan', village: 'Alandurai', district: 'Coimbatore', phone: '+91 98491 78901', landAcres: 4.5, totalProduceKg: 3500, totalEarnings: 312000, pendingPayments: 13000, rating: 4.6, crops: ['Cotton', 'Rice'], joinedDate: '2024-01-30' },
  { id: 'F18', name: 'Revathi', village: 'Madampatti', district: 'Coimbatore', phone: '+91 98491 89012', landAcres: 1.5, totalProduceKg: 800, totalEarnings: 67000, pendingPayments: 0, rating: 4.2, crops: ['Onion', 'Groundnut'], joinedDate: '2024-06-01' },
  { id: 'F19', name: 'Subramanian', village: 'Thondamuthur', district: 'Coimbatore', phone: '+91 98491 90123', landAcres: 7.5, totalProduceKg: 5800, totalEarnings: 498000, pendingPayments: 25000, rating: 4.9, crops: ['Rice', 'Maize'], joinedDate: '2024-01-05' },
  { id: 'F20', name: 'Ganesan', village: 'Perur', district: 'Coimbatore', phone: '+91 98492 01234', landAcres: 3.5, totalProduceKg: 2600, totalEarnings: 214000, pendingPayments: 8000, rating: 4.5, crops: ['Potato', 'Wheat'], joinedDate: '2024-03-12' },
];

// ── PROCUREMENT CENTRES (5) ──
export const centres: ProcurementCentre[] = [
  { id: 'C01', name: 'Centre A — Alandurai', district: 'Coimbatore', capacityPct: 92, queueCount: 37, estimatedWaitMin: 108, todaySlotsTotal: 60, todaySlotsBooked: 55, status: 'HIGH LOAD', x: 38, y: 42, processedTodayKg: 4200, pendingPaymentsCount: 8, farmersToday: 42 },
  { id: 'C02', name: 'Centre B — Karunya Nagar', district: 'Coimbatore', capacityPct: 46, queueCount: 11, estimatedWaitMin: 21, todaySlotsTotal: 60, todaySlotsBooked: 28, status: 'AVAILABLE', x: 22, y: 56, processedTodayKg: 2100, pendingPaymentsCount: 3, farmersToday: 18 },
  { id: 'C03', name: 'Centre C — Thondamuthur', district: 'Coimbatore', capacityPct: 63, queueCount: 18, estimatedWaitMin: 38, todaySlotsTotal: 50, todaySlotsBooked: 32, status: 'MODERATE', x: 45, y: 28, processedTodayKg: 3100, pendingPaymentsCount: 5, farmersToday: 25 },
  { id: 'C04', name: 'Centre D — Madampatti', district: 'Coimbatore', capacityPct: 78, queueCount: 24, estimatedWaitMin: 55, todaySlotsTotal: 55, todaySlotsBooked: 43, status: 'MODERATE', x: 62, y: 46, processedTodayKg: 3600, pendingPaymentsCount: 6, farmersToday: 31 },
  { id: 'C05', name: 'Centre E — Perur', district: 'Coimbatore', capacityPct: 31, queueCount: 7, estimatedWaitMin: 14, todaySlotsTotal: 50, todaySlotsBooked: 16, status: 'AVAILABLE', x: 78, y: 52, processedTodayKg: 1500, pendingPaymentsCount: 2, farmersToday: 12 },
];

// ── CROPS (for current farmer F01) ──
export const crops: Crop[] = [
  { id: 'CR01', farmerId: 'F01', name: 'Tomato', quantityKg: 800, harvestDate: '2026-09-08', location: 'Karunya Nagar', quality: 'A', demandLevel: 'HIGH', predictedPriceMin: 29, predictedPriceMax: 32, surplusRisk: 'LOW', status: 'ready' },
  { id: 'CR02', farmerId: 'F01', name: 'Rice', quantityKg: 1200, harvestDate: '2026-10-15', location: 'Karunya Nagar', quality: 'A', demandLevel: 'VERY HIGH', predictedPriceMin: 38, predictedPriceMax: 42, surplusRisk: 'LOW', status: 'growing' },
  { id: 'CR03', farmerId: 'F01', name: 'Chilli', quantityKg: 350, harvestDate: '2026-09-20', location: 'Karunya Nagar', quality: 'B', demandLevel: 'MODERATE', predictedPriceMin: 85, predictedPriceMax: 95, surplusRisk: 'MEDIUM', status: 'growing' },
  { id: 'CR04', farmerId: 'F01', name: 'Onion', quantityKg: 500, harvestDate: '2026-09-12', location: 'Karunya Nagar', quality: 'A', demandLevel: 'HIGH', predictedPriceMin: 22, predictedPriceMax: 26, surplusRisk: 'LOW', status: 'ready' },
];

// ── PRODUCE LISTINGS (30) ──
const cropNames: CropType[] = ['Tomato', 'Potato', 'Onion', 'Rice', 'Maize', 'Chilli', 'Wheat', 'Cotton', 'Sugarcane', 'Groundnut'];
const villages = ['Karunya Nagar', 'Siruvani', 'Alandurai', 'Madampatti', 'Thondamuthur', 'Kovaipudur', 'Perur', 'Mathivarangal', 'Semmedu', 'Pooluvapatti', 'Vedapatti', 'Isha Gate', 'Velliangiri Foothills', 'Theethipalayam', 'Kalampalayam', 'Sundakkamuthur', 'Kuniyamuthur', 'Telungupalayam', 'Chittur Road', 'Coimbatore West'];

export const produceListings: ProduceListing[] = Array.from({ length: 30 }, (_, i) => {
  const farmer = farmers[i % farmers.length];
  const crop = cropNames[i % cropNames.length];
  const qty = [200, 300, 350, 400, 450, 500, 550, 600, 750, 800][i % 10];
  const price = { Tomato: 30, Potato: 18, Onion: 24, Rice: 40, Maize: 22, Chilli: 90, Wheat: 28, Cotton: 55, Sugarcane: 35, Groundnut: 48 }[crop] || 25;
  return {
    id: `P${String(i + 1).padStart(2, '0')}`,
    farmerId: farmer.id,
    farmerName: farmer.name,
    crop,
    quantityKg: qty,
    pricePerKg: price + (i % 5) - 2,
    quality: (['A', 'B', 'A', 'B', 'C'] as const)[i % 5],
    location: villages[i % villages.length],
    distanceKm: Math.round((3 + i * 1.7) % 40 * 10) / 10,
    availableInDays: [0, 1, 2, 3, 5, 7, 10, 14][i % 8],
    buyerInterest: Math.round(40 + (i * 7) % 60),
    status: (['available', 'available', 'reserved', 'available', 'sold'] as const)[i % 5],
  };
});

// ── QUEUE TOKENS (30) ──
const stages = ['Registered', 'Arrived', 'Waiting', 'Weighing', 'Quality Check', 'Procured', 'Payment'] as const;
const priorities = ['Normal', 'Normal', 'High', 'Normal', 'Urgent'] as const;

export const queueTokens: QueueToken[] = Array.from({ length: 30 }, (_, i) => {
  const centre = centres[i % centres.length];
  const farmer = farmers[i % farmers.length];
  const crop = cropNames[i % cropNames.length];
  const stage = stages[Math.min(Math.floor(i / 4), 6)];
  return {
    id: `Q${String(i + 1).padStart(2, '0')}`,
    tokenNumber: `${centre.id[1]}${String(i + 1).padStart(3, '0')}`,
    centreId: centre.id,
    farmerId: farmer.id,
    farmerName: farmer.name,
    crop,
    quantityKg: [150, 200, 250, 300, 350, 400, 450, 500, 550, 600][i % 10],
    arrivalTime: `${9 + Math.floor(i / 4)}:${(i % 2) * 30 === 0 ? '00' : '30'} ${Math.floor(i / 4) < 3 ? 'AM' : 'PM'}`,
    stage,
    estimatedWaitMin: [5, 12, 18, 25, 35, 45, 55, 70, 85, 100][i % 10],
    priority: priorities[i % priorities.length],
    slotTime: `${9 + Math.floor(i / 6)}:${(i % 2) * 30 === 0 ? '00' : '30'} ${Math.floor(i / 6) < 3 ? 'AM' : 'PM'}`,
  };
});

// ── SLOTS ──
export const slots: Slot[] = Array.from({ length: 20 }, (_, i) => {
  const centre = centres[i % centres.length];
  const hour = 9 + Math.floor(i / 4);
  return {
    id: `S${String(i + 1).padStart(2, '0')}`,
    centreId: centre.id,
    time: `${hour}:00 - ${hour}:30`,
    date: '2026-09-02',
    capacity: 15,
    booked: Math.floor(Math.random() * 15),
    predictedCongestionPct: [20, 45, 82, 94, 61, 37, 24, 15][i % 8],
    isOpen: i % 7 !== 0,
  };
});

// ── BUYERS (10) ──
export const buyers: Buyer[] = [
  { id: 'B01', name: 'ABC Foods Pvt Ltd', type: 'Wholesaler', requiredCrop: 'Tomato', requiredQtyKg: 450, distanceKm: 18, offeredPrice: 30, reliabilityPct: 94, location: 'Coimbatore', activeOrders: 3 },
  { id: 'B02', name: 'FreshMart Retail', type: 'Retailer', requiredCrop: 'Potato', requiredQtyKg: 600, distanceKm: 22, offeredPrice: 18, reliabilityPct: 91, location: 'Coimbatore', activeOrders: 2 },
  { id: 'B03', name: 'Spice Export Co.', type: 'Exporter', requiredCrop: 'Chilli', requiredQtyKg: 800, distanceKm: 25, offeredPrice: 95, reliabilityPct: 97, location: 'Coimbatore', activeOrders: 5 },
  { id: 'B04', name: 'Kongu Rice Mills', type: 'Processor', requiredCrop: 'Rice', requiredQtyKg: 2000, distanceKm: 15, offeredPrice: 41, reliabilityPct: 96, location: 'Perur', activeOrders: 4 },
  { id: 'B05', name: 'Siruvani FPO Collective', type: 'FPO', requiredCrop: 'Onion', requiredQtyKg: 500, distanceKm: 8, offeredPrice: 25, reliabilityPct: 89, location: 'Alandurai', activeOrders: 1 },
  { id: 'B06', name: 'Global Foods Ltd', type: 'Exporter', requiredCrop: 'Tomato', requiredQtyKg: 750, distanceKm: 20, offeredPrice: 32, reliabilityPct: 93, location: 'Coimbatore', activeOrders: 3 },
  { id: 'B07', name: 'Thondamuthur Agro Corp', type: 'Processor', requiredCrop: 'Maize', requiredQtyKg: 1500, distanceKm: 12, offeredPrice: 23, reliabilityPct: 95, location: 'Thondamuthur', activeOrders: 2 },
  { id: 'B08', name: 'Coimbatore Cotton Traders', type: 'Wholesaler', requiredCrop: 'Cotton', requiredQtyKg: 1000, distanceKm: 16, offeredPrice: 56, reliabilityPct: 88, location: 'Kovaipudur', activeOrders: 1 },
  { id: 'B09', name: 'Madampatti Oil Mills', type: 'Processor', requiredCrop: 'Groundnut', requiredQtyKg: 800, distanceKm: 11, offeredPrice: 49, reliabilityPct: 92, location: 'Madampatti', activeOrders: 2 },
  { id: 'B10', name: 'Siruvani Cane Co-op', type: 'FPO', requiredCrop: 'Sugarcane', requiredQtyKg: 3000, distanceKm: 5, offeredPrice: 36, reliabilityPct: 90, location: 'Karunya Nagar', activeOrders: 3 },
];

// ── ORDERS (20) ──
const orderStatuses = ['Placed', 'Confirmed', 'Collection Scheduled', 'In Transit', 'Delivered', 'Completed'] as const;

export const orders: Order[] = Array.from({ length: 20 }, (_, i) => {
  const buyer = buyers[i % buyers.length];
  const farmer = farmers[i % farmers.length];
  const qty = [200, 300, 350, 400, 450, 500, 550, 600, 750, 800][i % 10];
  const price = buyer.offeredPrice;
  return {
    id: `O${String(i + 1).padStart(2, '0')}`,
    orderNumber: `ORD-2026-${String(i + 1).padStart(4, '0')}`,
    buyerId: buyer.id,
    buyerName: buyer.name,
    farmerId: farmer.id,
    farmerName: farmer.name,
    crop: buyer.requiredCrop,
    quantityKg: qty,
    pricePerKg: price,
    totalAmount: qty * price,
    status: orderStatuses[i % 6],
    placedDate: `2026-08-${String(28 - i).padStart(2, '0')}`,
    deliveryDate: `2026-09-${String(2 + (i % 6)).padStart(2, '0')}`,
    centreId: centres[i % centres.length].id,
  };
});

// ── PAYMENTS (20) ──
export const payments: Payment[] = Array.from({ length: 20 }, (_, i) => {
  const farmer = farmers[i % farmers.length];
  const centre = centres[i % centres.length];
  const crop = cropNames[i % cropNames.length];
  const qty = [150, 200, 250, 300, 350, 400, 450, 500, 550, 600][i % 10];
  const price = { Tomato: 30, Potato: 18, Onion: 24, Rice: 40, Maize: 22, Chilli: 90, Wheat: 28, Cotton: 55, Sugarcane: 35, Groundnut: 48 }[crop] || 25;
  const status = (['Completed', 'Completed', 'Processing', 'Completed', 'Pending'] as const)[i % 5];
  return {
    id: `PAY${String(i + 1).padStart(2, '0')}`,
    transactionId: `TXN${String(i + 10001).padStart(7, '0')}`,
    farmerId: farmer.id,
    farmerName: farmer.name,
    centreId: centre.id,
    centreName: centre.name,
    crop,
    quantityKg: qty,
    amount: qty * price,
    status,
    date: `2026-08-${String(28 - i).padStart(2, '0')}`,
    method: (['Bank Transfer', 'UPI', 'Bank Transfer', 'UPI', 'Cheque'] as const)[i % 5],
  };
});

// ── DELIVERIES ──
export const deliveries: Delivery[] = Array.from({ length: 8 }, (_, i) => {
  const order = orders[i];
  return {
    id: `DLV${String(i + 1).padStart(2, '0')}`,
    orderId: order.id,
    origin: farmers[i % farmers.length].village,
    collectionPoints: [farmers[(i + 1) % farmers.length].village, farmers[(i + 2) % farmers.length].village],
    destination: buyers[i % buyers.length].location,
    distanceKm: [12, 18, 25, 15, 8, 22, 14, 30][i],
    eta: `${2 + i}h ${i * 5}m`,
    driver: ['Murugesan', 'Karthik', 'Senthil', 'Marimuthu', 'Velusamy', 'Rajesh', 'Prakash', 'Saravanan'][i],
    vehicle: ['TN 38 AB 1234', 'TN 38 CD 5678', 'TN 38 EF 9012', 'TN 38 GH 3456', 'TN 38 IJ 7890', 'TN 38 KL 1234', 'TN 38 MN 5678', 'TN 38 OP 9012'][i],
    status: (['Scheduled', 'In Transit', 'Delivered', 'In Transit', 'Scheduled', 'Delivered', 'In Transit', 'Scheduled'] as const)[i],
  };
});

// ── FARMER CLUSTERS ──
export const farmerClusters: FarmerCluster[] = [
  {
    id: 'FC01', clusterNumber: 12,
    farmers: [
      { name: 'Ravi Kumar', quantityKg: 250, distanceKm: 2.1 },
      { name: 'Palinisamy', quantityKg: 300, distanceKm: 3.5 },
      { name: 'Sasikumar', quantityKg: 200, distanceKm: 4.8 },
    ],
    totalProduceKg: 750, avgDistanceKm: 3.5, pricePerKg: 30, reliabilityPct: 96, matchScore: 94,
    route: [
      { stop: 'Ravi Kumar (Karunya Nagar)', type: 'farmer', distanceKm: 2.1 },
      { stop: 'Palinisamy (Madampatti)', type: 'farmer', distanceKm: 1.4 },
      { stop: 'Sasikumar (Kovaipudur)', type: 'farmer', distanceKm: 1.3 },
      { stop: 'Buyer Warehouse (Coimbatore)', type: 'warehouse', distanceKm: 8.2 },
    ],
    totalDistanceKm: 13.0, estimatedTravelMin: 42, logisticsCost: 1850,
  },
  {
    id: 'FC02', clusterNumber: 8,
    farmers: [
      { name: 'Suresh Kumar', quantityKg: 400, distanceKm: 1.8 },
      { name: 'Murugan', quantityKg: 350, distanceKm: 2.9 },
    ],
    totalProduceKg: 750, avgDistanceKm: 2.4, pricePerKg: 18, reliabilityPct: 94, matchScore: 88,
    route: [
      { stop: 'Suresh Kumar (Siruvani)', type: 'farmer', distanceKm: 1.8 },
      { stop: 'Murugan (Alandurai)', type: 'farmer', distanceKm: 1.1 },
      { stop: 'Buyer Warehouse (Coimbatore)', type: 'warehouse', distanceKm: 12.0 },
    ],
    totalDistanceKm: 14.9, estimatedTravelMin: 38, logisticsCost: 2100,
  },
  {
    id: 'FC03', clusterNumber: 15,
    farmers: [
      { name: 'Karthikeyan', quantityKg: 150, distanceKm: 3.2 },
      { name: 'Selvam', quantityKg: 200, distanceKm: 4.1 },
      { name: 'Arul', quantityKg: 100, distanceKm: 5.5 },
    ],
    totalProduceKg: 450, avgDistanceKm: 4.3, pricePerKg: 90, reliabilityPct: 92, matchScore: 85,
    route: [
      { stop: 'Karthikeyan (Madampatti)', type: 'farmer', distanceKm: 3.2 },
      { stop: 'Selvam (Thondamuthur)', type: 'farmer', distanceKm: 0.9 },
      { stop: 'Arul (Siruvani)', type: 'farmer', distanceKm: 1.4 },
      { stop: 'Buyer Warehouse (Coimbatore)', type: 'warehouse', distanceKm: 22.0 },
    ],
    totalDistanceKm: 27.5, estimatedTravelMin: 65, logisticsCost: 3200,
  },
];

// ── NOTIFICATIONS ──
export const notifications: Notification[] = [
  { id: 'N01', role: 'farmer', type: 'slot', title: 'Slot Confirmed', message: 'Your slot at Centre B — Karunya Nagar (2:00–2:30 PM) has been confirmed. Token: B047', time: '10 min ago', read: false, severity: 'success' },
  { id: 'N02', role: 'farmer', type: 'queue', title: 'Queue Update', message: 'Your position in queue is now 11. Estimated wait: 18 minutes', time: '25 min ago', read: false, severity: 'info' },
  { id: 'N03', role: 'farmer', type: 'buyer', title: 'Buyer Interest', message: 'ABC Foods showed interest in your Tomato produce (800 kg)', time: '1 hr ago', read: false, severity: 'info' },
  { id: 'N04', role: 'farmer', type: 'payment', title: 'Payment Received', message: '₹24,000 received for 800 kg Rice procurement at Centre A — Alandurai', time: '3 hrs ago', read: true, severity: 'success' },
  { id: 'N05', role: 'farmer', type: 'congestion', title: 'Congestion Alert', message: 'Centre A — Alandurai is experiencing high load. Consider Centre B — Karunya Nagar instead', time: '5 hrs ago', read: true, severity: 'warning' },
  { id: 'N06', role: 'centre', type: 'surge', title: 'Incoming Farmer Surge', message: '14 farmers predicted to arrive in next 30 minutes at Centre A — Alandurai', time: '5 min ago', read: false, severity: 'warning' },
  { id: 'N07', role: 'centre', type: 'capacity', title: 'Capacity Warning', message: 'Centre A — Alandurai at 92% capacity. Consider redirecting arrivals', time: '15 min ago', read: false, severity: 'danger' },
  { id: 'N08', role: 'centre', type: 'delay', title: 'Delayed Processing', message: 'Weighing bay 2 is running 12 minutes behind schedule', time: '40 min ago', read: true, severity: 'warning' },
  { id: 'N09', role: 'buyer', type: 'produce', title: 'New Matching Produce', message: '750 kg Tomato available from Farmer Cluster #12, 8.2 km away', time: '20 min ago', read: false, severity: 'info' },
  { id: 'N10', role: 'buyer', type: 'order', title: 'Order Confirmed', message: 'Farmer Ravi Kumar confirmed order ORD-2026-0003', time: '1 hr ago', read: false, severity: 'success' },
  { id: 'N11', role: 'buyer', type: 'delivery', title: 'Delivery Update', message: 'Your delivery DLV03 is in transit. ETA: 4h 10m', time: '2 hrs ago', read: true, severity: 'info' },
  { id: 'N12', role: 'admin', type: 'congestion', title: 'RED Alert: Centre A — Alandurai', message: 'Centre A — Alandurai predicted to reach 94% capacity in next 2 hours', time: '8 min ago', read: false, severity: 'danger' },
  { id: 'N13', role: 'admin', type: 'congestion', title: 'YELLOW: Tomato Surplus', message: '4.2 tonnes tomato surplus predicted in Thondamuthur block', time: '30 min ago', read: false, severity: 'warning' },
  { id: 'N14', role: 'admin', type: 'buyer', title: 'GREEN: Buyer Demand', message: '6.8 tonnes buyer demand detected for Rice in Coimbatore', time: '1 hr ago', read: true, severity: 'success' },
];

// ── AI RECOMMENDATIONS ──
export const aiRecommendations: AIRecommendation[] = [
  { id: 'R01', number: 1, type: 'redirect', title: 'Redirect 23 farmers', from: 'Centre A — Alandurai', to: 'Centre B — Karunya Nagar', reason: 'Centre A — Alandurai predicted to reach 94% capacity between 10:30 AM and 12:00 PM based on arrival forecast and historical patterns.', expectedResult: '41% reduction in average waiting time', impact: '67% wait reduction' },
  { id: 'R02', number: 2, type: 'cluster', title: 'Create 4 farmer collection clusters', reason: 'Nearby farmers in Karunya Nagar and Alandurai regions can be aggregated to optimize collection routes.', expectedResult: '27% logistics distance reduction', impact: '27% distance saved' },
  { id: 'R03', number: 3, type: 'surplus', title: 'Redirect predicted tomato surplus to 3 bulk buyers', reason: 'Thondamuthur block shows 4.2 tonnes surplus. ABC Foods, Global Foods, and FreshMart can absorb the excess.', expectedResult: '4.2 tonnes absorbed by bulk buyers', impact: '4.2t surplus absorbed' },
];

// ── SLOT BOOKINGS ──
export const slotBookings: SlotBooking[] = [
  { id: 'SB01', tokenNumber: 'B047', centreId: 'C02', centreName: 'Centre B — Karunya Nagar', farmerId: 'F01', farmerName: 'Ravi Kumar', crop: 'Tomato', quantityKg: 800, date: '2026-09-02', slotTime: '2:00 PM – 2:30 PM', estimatedWaitMin: 18, aiReasoning: 'Based on predicted arrivals, processing capacity, and historical waiting times, 2:00–2:30 PM is expected to have the lowest waiting time at Centre B — Karunya Nagar.', status: 'booked' },
];

// ── CHART DATA ──
export const weeklyDemandData = [
  { day: 'Mon', demand: 3800, supply: 3200 },
  { day: 'Tue', demand: 4200, supply: 3500 },
  { day: 'Wed', demand: 4050, supply: 4100 },
  { day: 'Thu', demand: 4500, supply: 3800 },
  { day: 'Fri', demand: 4800, supply: 3900 },
  { day: 'Sat', demand: 5200, supply: 4200 },
  { day: 'Sun', demand: 4600, supply: 3600 },
];

export const priceTrendData = [
  { week: 'W1', tomato: 24, potato: 14, onion: 18 },
  { week: 'W2', tomato: 26, potato: 15, onion: 20 },
  { week: 'W3', tomato: 28, potato: 16, onion: 22 },
  { week: 'W4', tomato: 27, potato: 17, onion: 21 },
  { week: 'W5', tomato: 29, potato: 18, onion: 24 },
  { week: 'W6', tomato: 31, potato: 18, onion: 25 },
  { week: 'W7', tomato: 30, potato: 19, onion: 24 },
  { week: 'W8', tomato: 32, potato: 20, onion: 26 },
];

export const arrivalForecastData = [
  { time: '9 AM', predicted: 35 },
  { time: '10 AM', predicted: 82 },
  { time: '11 AM', predicted: 61 },
  { time: '12 PM', predicted: 37 },
  { time: '1 PM', predicted: 24 },
  { time: '2 PM', predicted: 28 },
  { time: '3 PM', predicted: 19 },
  { time: '4 PM', predicted: 12 },
];

export const dailyFarmersData = [
  { day: 'Mon', farmers: 28, processed: 24 },
  { day: 'Tue', farmers: 35, processed: 31 },
  { day: 'Wed', farmers: 42, processed: 38 },
  { day: 'Thu', farmers: 38, processed: 34 },
  { day: 'Fri', farmers: 45, processed: 41 },
  { day: 'Sat', farmers: 52, processed: 48 },
  { day: 'Sun', farmers: 22, processed: 20 },
];

export const waitTimeData = [
  { day: 'Mon', before: 102, after: 34 },
  { day: 'Tue', farmers: 35 },
];

export const centreUtilizationData = [
  { name: 'Centre A', utilization: 92, capacity: 100 },
  { name: 'Centre B', utilization: 46, capacity: 100 },
  { name: 'Centre C', utilization: 63, capacity: 100 },
  { name: 'Centre D', utilization: 78, capacity: 100 },
  { name: 'Centre E', utilization: 31, capacity: 100 },
];

export const cropDistributionData = [
  { name: 'Tomato', value: 28, color: '#ef4444' },
  { name: 'Rice', value: 22, color: '#22c55e' },
  { name: 'Potato', value: 15, color: '#f59e0b' },
  { name: 'Onion', value: 12, color: '#8b5cf6' },
  { name: 'Maize', value: 10, color: '#eab308' },
  { name: 'Chilli', value: 8, color: '#dc2626' },
  { name: 'Others', value: 5, color: '#6b7280' },
];

export const procurementVolumeData = [
  { day: 'Mon', volume: 3.2 },
  { day: 'Tue', volume: 4.1 },
  { day: 'Wed', volume: 3.8 },
  { day: 'Thu', volume: 4.5 },
  { day: 'Fri', volume: 5.1 },
  { day: 'Sat', volume: 5.8 },
  { day: 'Sun', volume: 2.9 },
];

export const incomeTrendData = [
  { month: 'Mar', income: 182000, before: 145000 },
  { month: 'Apr', income: 210000, before: 168000 },
  { month: 'May', income: 245000, before: 192000 },
  { month: 'Jun', income: 280000, before: 210000 },
  { month: 'Jul', income: 310000, before: 235000 },
  { month: 'Aug', income: 345000, before: 258000 },
];

export const paymentProcessingData = [
  { week: 'W1', completed: 85, pending: 15 },
  { week: 'W2', completed: 88, pending: 12 },
  { week: 'W3', completed: 91, pending: 9 },
  { week: 'W4', completed: 94, pending: 6 },
];

export const buyerFulfillmentData = [
  { month: 'Mar', fulfillment: 72 },
  { month: 'Apr', fulfillment: 78 },
  { month: 'May', fulfillment: 81 },
  { month: 'Jun', fulfillment: 85 },
  { month: 'Jul', fulfillment: 89 },
  { month: 'Aug', fulfillment: 93 },
];

export const surplusPreventedData = [
  { month: 'Mar', tonnes: 2.1 },
  { month: 'Apr', tonnes: 3.4 },
  { month: 'May', tonnes: 2.8 },
  { month: 'Jun', tonnes: 4.2 },
  { month: 'Jul', tonnes: 5.1 },
  { month: 'Aug', tonnes: 6.3 },
];

export const logisticsDistanceData = [
  { month: 'Mar', before: 42, after: 31 },
  { month: 'Apr', before: 45, after: 33 },
  { month: 'May', before: 48, after: 34 },
  { month: 'Jun', before: 50, after: 35 },
  { month: 'Jul', before: 52, after: 36 },
  { month: 'Aug', before: 55, after: 37 },
];
