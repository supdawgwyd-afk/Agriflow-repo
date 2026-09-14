export type Role = 'farmer' | 'centre' | 'buyer' | 'admin';

export type CropType =
  | 'Tomato'
  | 'Potato'
  | 'Onion'
  | 'Rice'
  | 'Maize'
  | 'Chilli'
  | 'Wheat'
  | 'Cotton'
  | 'Sugarcane'
  | 'Groundnut';

export type DemandLevel = 'LOW' | 'MODERATE' | 'HIGH' | 'VERY HIGH';
export type SurplusRisk = 'LOW' | 'MEDIUM' | 'HIGH';
export type CentreStatus = 'AVAILABLE' | 'MODERATE' | 'HIGH LOAD' | 'OVERLOADED';
export type QualityGrade = 'A' | 'B' | 'C';

export interface Crop {
  id: string;
  farmerId: string;
  name: CropType;
  quantityKg: number;
  harvestDate: string;
  location: string;
  quality: QualityGrade;
  demandLevel: DemandLevel;
  predictedPriceMin: number;
  predictedPriceMax: number;
  surplusRisk: SurplusRisk;
  status: 'growing' | 'ready' | 'harvested';
}

export interface ProduceListing {
  id: string;
  farmerId: string;
  farmerName: string;
  crop: CropType;
  quantityKg: number;
  pricePerKg: number;
  quality: QualityGrade;
  location: string;
  distanceKm: number;
  availableInDays: number;
  buyerInterest: number;
  status: 'available' | 'reserved' | 'sold';
  centreId?: string;
  centreName?: string;
}

export interface ProcurementCentre {
  id: string;
  name: string;
  district: string;
  location?: string;
  capacityPct: number;
  queueCount: number;
  estimatedWaitMin: number;
  todaySlotsTotal: number;
  todaySlotsBooked: number;
  status: CentreStatus;
  x: number;
  y: number;
  processedTodayKg: number;
  pendingPaymentsCount: number;
  farmersToday: number;
}

export interface QueueToken {
  id: string;
  tokenNumber: string;
  centreId: string;
  farmerId: string;
  farmerName: string;
  crop: CropType;
  quantityKg: number;
  arrivalTime: string;
  stage: QueueStage;
  estimatedWaitMin: number;
  priority: 'Normal' | 'High' | 'Urgent';
  slotTime: string;
}

export type QueueStage =
  | 'Registered'
  | 'Arrived'
  | 'Waiting'
  | 'Weighing'
  | 'Quality Check'
  | 'Procured'
  | 'Payment';

export const QUEUE_STAGES: QueueStage[] = [
  'Registered',
  'Arrived',
  'Waiting',
  'Weighing',
  'Quality Check',
  'Procured',
  'Payment',
];

export interface Slot {
  id: string;
  centreId: string;
  time: string;
  date: string;
  capacity: number;
  booked: number;
  predictedCongestionPct: number;
  isOpen: boolean;
}

export interface Buyer {
  id: string;
  name: string;
  type: 'Wholesaler' | 'Retailer' | 'Processor' | 'Exporter' | 'FPO';
  requiredCrop: CropType;
  requiredQtyKg: number;
  distanceKm: number;
  offeredPrice: number;
  reliabilityPct: number;
  location: string;
  activeOrders: number;
}

export interface BuyerMatch {
  buyerId: string;
  buyerName: string;
  matchScore: number;
  quantityMatch: number;
  distanceScore: number;
  priceScore: number;
  timingScore: number;
  reliabilityScore: number;
  reasoning: string;
}

export interface FarmerCluster {
  id: string;
  clusterNumber: number;
  farmers: { name: string; quantityKg: number; distanceKm: number }[];
  totalProduceKg: number;
  avgDistanceKm: number;
  pricePerKg: number;
  reliabilityPct: number;
  matchScore: number;
  route: { stop: string; type: 'farmer' | 'warehouse'; distanceKm: number }[];
  totalDistanceKm: number;
  estimatedTravelMin: number;
  logisticsCost: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  buyerId: string;
  buyerName: string;
  farmerId: string;
  farmerName: string;
  crop: CropType;
  quantityKg: number;
  pricePerKg: number;
  totalAmount: number;
  status: OrderStatus;
  placedDate: string;
  deliveryDate: string;
  centreId?: string;
  produceId?: string;
}

export type OrderStatus =
  | 'Placed'
  | 'Confirmed'
  | 'Collection Scheduled'
  | 'In Transit'
  | 'Delivered'
  | 'Completed';

export const ORDER_STATUSES: OrderStatus[] = [
  'Placed',
  'Confirmed',
  'Collection Scheduled',
  'In Transit',
  'Delivered',
  'Completed',
];

export interface Payment {
  id: string;
  transactionId?: string;
  farmerId: string;
  farmerName: string;
  centreId?: string;
  centreName?: string;
  crop: CropType;
  quantityKg: number;
  amount: number;
  status: 'Pending' | 'Processing' | 'Completed';
  date: string;
  method: 'Bank Transfer' | 'UPI' | 'Cheque' | 'Bank Transfer (UPI / IMPS)';
}

export interface Delivery {
  id: string;
  orderId: string;
  origin: string;
  collectionPoints: string[];
  destination: string;
  distanceKm: number;
  eta: string;
  driver: string;
  vehicle: string;
  status: 'Scheduled' | 'In Transit' | 'Delivered';
}

export interface Notification {
  id: string;
  role: Role;
  type: 'slot' | 'queue' | 'buyer' | 'payment' | 'congestion' | 'surge' | 'capacity' | 'delay' | 'produce' | 'order' | 'delivery';
  title: string;
  message: string;
  time: string;
  read: boolean;
  severity: 'info' | 'success' | 'warning' | 'danger';
}

export interface AIRecommendation {
  id: string;
  number: number;
  type: 'redirect' | 'cluster' | 'surplus';
  title: string;
  from?: string;
  to?: string;
  reason: string;
  expectedResult: string;
  impact: string;
}

export interface Farmer {
  id: string;
  name: string;
  village: string;
  district: string;
  phone: string;
  landAcres: number;
  totalProduceKg: number;
  totalEarnings: number;
  pendingPayments: number;
  rating: number;
  crops: CropType[];
  joinedDate: string;
  centreId?: string;
}

export interface SlotBooking {
  id: string;
  tokenNumber: string;
  centreId: string;
  centreName: string;
  farmerId: string;
  farmerName: string;
  crop: CropType;
  quantityKg: number;
  date: string;
  slotTime: string;
  estimatedWaitMin: number;
  aiReasoning: string;
  status: 'booked' | 'arrived' | 'completed';
}
