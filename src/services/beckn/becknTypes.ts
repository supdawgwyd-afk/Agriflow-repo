import type { CropType, OrderStatus } from '@/types';

export type BecknAction =
  | 'search'
  | 'select'
  | 'init'
  | 'confirm'
  | 'status'
  | 'track'
  | 'cancel';

export interface BecknContext {
  domain: string;
  country: string;
  city: string;
  action: BecknAction;
  coreVersion: string;
  bppId: string;
  bppUri: string;
  transactionId: string;
  messageId: string;
  timestamp: string;
  environment: 'sandbox' | 'production';
}

export interface BecknProvider {
  id: string;
  name: string;
  type: string;
  domain: string;
  environment: 'sandbox' | 'production';
  status: 'connected' | 'disconnected';
  description: string;
}

export interface BecknLocation {
  id: string;
  address: string;
  city: string;
  district: string;
  gps?: string;
}

export interface BecknItem {
  id: string;
  crop: CropType;
  description: string;
  quantityKg: number;
  pricePerKg: number;
  currency: string;
  quality: string;
  providerName: string;
  location: BecknLocation;
  availability: 'available' | 'reserved' | 'sold';
  fulfillmentId: string;
  aiMatchScore?: number;
  procurementCentre?: string;
  procurementCentreId?: string;
}

export interface BecknCatalog {
  provider: BecknProvider;
  items: BecknItem[];
  locations: BecknLocation[];
  fulfillments: BecknFulfillment[];
  itemCount: number;
}

export interface BecknFulfillment {
  id: string;
  type: 'procurement' | 'delivery';
  origin: BecknLocation;
  destination: BecknLocation;
  distanceKm: number;
  eta: string;
  status: 'pending' | 'scheduled' | 'in-transit' | 'delivered';
  driver?: string;
  vehicle?: string;
  route?: string[];
}

export interface BecknPayment {
  id: string;
  status: 'pending' | 'initiated' | 'completed';
  method: string;
  amount: number;
  currency: string;
}

export interface BecknOrder {
  id: string;
  transactionId: string;
  provider: BecknProvider;
  item: BecknItem;
  quantityKg: number;
  totalAmount: number;
  fulfillment: BecknFulfillment;
  payment: BecknPayment;
  status: BecknOrderStatus;
  agriflowOrderId?: string;
  createdAt: string;
}

export type BecknOrderStatus =
  | 'created'
  | 'initialized'
  | 'confirmed'
  | 'collection-scheduled'
  | 'in-transit'
  | 'delivered'
  | 'completed'
  | 'cancelled';

export interface BecknTransaction {
  id: string;
  context: BecknContext;
  order?: BecknOrder;
  searchResults?: BecknItem[];
  selectedItem?: BecknItem;
  status: BecknOrderStatus;
  timeline: BecknTimelineEntry[];
  createdAt: string;
}

export interface BecknTimelineEntry {
  action: BecknAction;
  timestamp: string;
  label: string;
  description: string;
  request: Record<string, unknown>;
  response: Record<string, unknown>;
}

export interface BecknSearchRequest {
  action: 'search';
  crop?: CropType | 'All';
  quantityKg?: number;
  location?: string;
  maxPricePerKg?: number;
  maxDistanceKm?: number;
  quality?: 'A' | 'B' | 'C' | 'All';
}

export interface BppTransactionRecord {
  id: string;
  transactionId: string;
  buyerId: string;
  buyerName: string;
  farmerId: string;
  farmerName: string;
  crop: CropType;
  quantityKg: number;
  pricePerKg: number;
  totalAmount: number;
  becknStatus: BecknOrderStatus;
  agriflowOrderId: string;
  agriflowOrderNumber: string;
  fulfillmentStatus: string;
  timeline: BecknTimelineEntry[];
  createdAt: string;
  produceId?: string;
  providerId?: string;
  deliveryId?: string;
  paymentId?: string;
}

export interface BecknSearchResponse {
  provider: string;
  itemsFound: number;
  items: BecknItem[];
}

export interface BecknSelectRequest {
  action: 'select';
  itemId: string;
  quantityKg: number;
}

export interface BecknSelectResponse {
  item: BecknItem;
  fulfillment: BecknFulfillment;
  payment: BecknPayment;
  aiMatchScore?: number;
}

export interface BecknInitRequest {
  action: 'init';
  itemId: string;
  quantityKg: number;
  buyerId: string;
  buyerName: string;
}

export interface BecknInitResponse {
  transactionId: string;
  order: BecknOrder;
}

export interface BecknConfirmRequest {
  action: 'confirm';
  transactionId: string;
}

export interface BecknConfirmResponse {
  order: BecknOrder;
  agriflowOrderId: string;
}

export interface BecknStatusResponse {
  transactionId: string;
  status: BecknOrderStatus;
  order: BecknOrder;
}

export interface BecknTrackResponse {
  transactionId: string;
  fulfillment: BecknFulfillment;
  trackingHistory: { timestamp: string; status: string; location: string }[];
}

export const BECKN_ORDER_STATUS_MAP: Record<OrderStatus, BecknOrderStatus> = {
  'Placed': 'created',
  'Confirmed': 'confirmed',
  'Collection Scheduled': 'collection-scheduled',
  'In Transit': 'in-transit',
  'Delivered': 'delivered',
  'Completed': 'completed',
};

export const BECKN_FLOW_STEPS: { action: BecknAction; label: string; description: string }[] = [
  { action: 'search', label: 'Search', description: 'Buyer searches for produce via BPP discovery' },
  { action: 'select', label: 'Select', description: 'Buyer selects an item from the catalog' },
  { action: 'init', label: 'Init', description: 'Transaction is initialized with provider' },
  { action: 'confirm', label: 'Confirm', description: 'Order is confirmed and placed in AgriFlow' },
  { action: 'status', label: 'Status', description: 'Order status is queried from AgriFlow' },
  { action: 'track', label: 'Track', description: 'Fulfillment and delivery are tracked' },
  { action: 'cancel', label: 'Cancel', description: 'Order is cancelled if needed' },
];
