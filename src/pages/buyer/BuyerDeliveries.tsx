import { Badge, StatusBadge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { PageHeader } from '@/components/ui/PageHeader';
import { useApp } from '@/context/AppContext';
import type { Delivery } from '@/types';
import {
  Truck, MapPin, Clock, User, Navigation, Package,
  Network, CheckCircle2, Circle, ArrowRight,
} from 'lucide-react';

const FULFILLMENT_STAGES = [
  { key: 'pending', label: 'Order Confirmed' },
  { key: 'pickup-scheduled', label: 'Pickup Scheduled' },
  { key: 'collected', label: 'Collected' },
  { key: 'in-transit', label: 'In Transit' },
  { key: 'delivered', label: 'Delivered' },
  { key: 'completed', label: 'Completed' },
] as const;

function getStageIndex(status: string): number {
  const idx = FULFILLMENT_STAGES.findIndex((s) => s.key === status);
  return idx < 0 ? 0 : idx;
}

export function BuyerDeliveries() {
  const { deliveries, orders, bppTransactions, centres } = useApp();

  const getBppInfo = (orderId: string) => {
    const order = orders.find((o) => o.id === orderId);
    if (!order) return null;
    const txn = bppTransactions.find((t) => t.agriflowOrderId === orderId);
    return txn ? { txn, order } : null;
  };

  return (
    <div>
      <PageHeader
        title="Deliveries"
        subtitle="Track your produce deliveries and routes — updates live as orders are placed"
        icon={<Truck className="w-5 h-5" />}
      />

      {deliveries.length === 0 ? (
        <Card className="p-12 text-center">
          <Truck className="w-12 h-12 mx-auto text-earth-300 mb-3" />
          <p className="text-earth-500">No deliveries yet. Place an order to see delivery tracking here.</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {deliveries.map((delivery: Delivery) => {
            const bppInfo = getBppInfo(delivery.orderId);
            const order = orders.find((o) => o.id === delivery.orderId);
            const centre = order?.centreId ? centres.find((c) => c.id === order.centreId) : undefined;
            const stageIdx = bppInfo ? getStageIndex(bppInfo.txn.fulfillmentStatus) : -1;

            return (
              <Card key={delivery.id} className="p-5">
                <div className="flex flex-col lg:flex-row gap-4">
                  <div className="lg:w-48 flex-shrink-0">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                        <Truck className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-semibold text-earth-900">{delivery.id}</p>
                        <p className="text-xs text-earth-500">Order: {delivery.orderId}</p>
                      </div>
                    </div>
                    <StatusBadge status={delivery.status} />
                    {bppInfo && (
                      <div className="mt-2 flex items-center gap-1.5">
                        <Network className="w-3.5 h-3.5 text-blue-600" />
                        <span className="text-[10px] font-mono text-blue-700">{bppInfo.txn.transactionId}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-3">
                      <Navigation className="w-4 h-4 text-agri-600" />
                      <p className="text-sm font-medium text-earth-700">Route</p>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                      <div className="flex items-center gap-2 bg-earth-50 rounded-lg px-3 py-2">
                        <MapPin className="w-4 h-4 text-agri-600" />
                        <span className="text-sm text-earth-700">{delivery.origin}</span>
                      </div>
                      {delivery.collectionPoints.map((point) => (
                        <div key={point} className="flex items-center gap-2">
                          <div className="text-earth-300">→</div>
                          <div className="flex items-center gap-2 bg-amber-50 rounded-lg px-3 py-2">
                            <Package className="w-4 h-4 text-amber-600" />
                            <span className="text-sm text-earth-700">{point}</span>
                          </div>
                        </div>
                      ))}
                      {centre && (
                        <div className="flex items-center gap-2">
                          <div className="text-earth-300">→</div>
                          <div className="flex items-center gap-2 bg-agri-50 rounded-lg px-3 py-2">
                            <Package className="w-4 h-4 text-agri-600" />
                            <span className="text-sm text-earth-700">{centre.name}</span>
                          </div>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <div className="text-earth-300">→</div>
                        <div className="flex items-center gap-2 bg-blue-50 rounded-lg px-3 py-2">
                          <MapPin className="w-4 h-4 text-blue-600" />
                          <span className="text-sm text-earth-700">{delivery.destination}</span>
                        </div>
                      </div>
                    </div>

                    {/* BPP Tracking Timeline */}
                    {bppInfo && (
                      <div className="mt-4 pt-4 border-t border-earth-100">
                        <div className="flex items-center gap-2 mb-3">
                          <Network className="w-4 h-4 text-blue-600" />
                          <p className="text-sm font-semibold text-earth-700">BPP Fulfillment Tracking</p>
                          <Badge variant="info">SIMULATED</Badge>
                        </div>
                        <div className="flex items-center gap-1 flex-wrap">
                          {FULFILLMENT_STAGES.map((stage, i) => (
                            <div key={stage.key} className="flex items-center gap-1">
                              <div className="flex items-center gap-1.5">
                                {i <= stageIdx ? (
                                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                                ) : (
                                  <Circle className="w-4 h-4 text-earth-300" />
                                )}
                                <span className={`text-xs font-medium ${i <= stageIdx ? 'text-green-700' : 'text-earth-400'}`}>
                                  {stage.label}
                                </span>
                              </div>
                              {i < FULFILLMENT_STAGES.length - 1 && <ArrowRight className="w-3 h-3 text-earth-300" />}
                            </div>
                          ))}
                        </div>
                        <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                          <div className="bg-earth-50 rounded-lg p-2">
                            <p className="text-earth-500">Fulfillment ID</p>
                            <p className="font-mono font-semibold text-earth-900">ful-{delivery.orderId}</p>
                          </div>
                          <div className="bg-earth-50 rounded-lg p-2">
                            <p className="text-earth-500">BPP Txn ID</p>
                            <p className="font-mono font-semibold text-earth-900 text-[10px]">{bppInfo.txn.transactionId}</p>
                          </div>
                          <div className="bg-earth-50 rounded-lg p-2">
                            <p className="text-earth-500">Quantity</p>
                            <p className="font-semibold text-earth-900">{bppInfo.txn.quantityKg} kg</p>
                          </div>
                          <div className="bg-earth-50 rounded-lg p-2">
                            <p className="text-earth-500">Status</p>
                            <p className="font-semibold text-blue-700">{bppInfo.txn.fulfillmentStatus}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="lg:w-48 flex-shrink-0 grid grid-cols-2 lg:grid-cols-1 gap-2 text-sm">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-earth-400" />
                      <span className="text-earth-500">Distance:</span>
                      <span className="font-medium text-earth-900">{delivery.distanceKm} km</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-earth-400" />
                      <span className="text-earth-500">ETA:</span>
                      <span className="font-medium text-earth-900">{delivery.eta}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-earth-400" />
                      <span className="text-earth-500">Driver:</span>
                      <span className="font-medium text-earth-900">{delivery.driver}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Truck className="w-4 h-4 text-earth-400" />
                      <span className="text-earth-500">Vehicle:</span>
                      <span className="font-medium text-earth-900 text-xs">{delivery.vehicle}</span>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
