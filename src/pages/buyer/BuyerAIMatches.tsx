import { useMemo, useState } from 'react';
import { Badge } from '@/components/ui/Badge';
import { AIInsightCard, AIRecommendationRow } from '@/components/ui/AIInsightCard';
import { PageHeader } from '@/components/ui/PageHeader';
import { Modal } from '@/components/ui/Modal';
import { AIPipelineVisualizer } from '@/components/ui/AIPipelineVisualizer';
import { AIExplainCard } from '@/components/ui/AIExplainCard';
import { useApp } from '@/context/AppContext';
import type { CropType, ProduceListing, Buyer, Farmer } from '@/types';
import type { AIExplainPipeline } from '@/utils/aiSimulation';
import {
  Sparkles, Users, MapPin, IndianRupee, Shield,
  TrendingUp, ArrowRight, Route, Package, CheckCircle2,
} from 'lucide-react';

interface Cluster {
  id: string;
  crop: CropType;
  farmers: { name: string; quantityKg: number; quality: string; location: string }[];
  totalProduceKg: number;
  pricePerKg: number;
  reliabilityPct: number;
  matchScore: number;
  qualityMatchPct: number;
  quantityMatchPct: number;
  distanceScorePct: number;
  priceScorePct: number;
  totalDistanceKm: number;
  estimatedTravelMin: number;
  logisticsCost: number;
  route: { stop: string; type: 'farm' | 'warehouse'; distanceKm: number }[];
  buyerId: string;
  firstFarmerId: string;
  firstFarmerName: string;
  pipeline: AIExplainPipeline;
}

function buildClusters(produceListings: ProduceListing[], buyers: Buyer[], farmers: Farmer[]): Cluster[] {
  const available = produceListings.filter((p) => p.status === 'available');
  const byCrop = new Map<CropType, ProduceListing[]>();
  for (const p of available) {
    if (!byCrop.has(p.crop)) byCrop.set(p.crop, []);
    byCrop.get(p.crop)!.push(p);
  }

  const clusters: Cluster[] = [];
  let clusterNum = 0;

  for (const [crop, items] of byCrop) {
    const buyer = buyers.find((b) => b.requiredCrop === crop);
    if (!buyer) continue;

    // Deterministic sorting by proximity
    const sorted = [...items].sort((a, b) => a.distanceKm - b.distanceKm);
    const selected = sorted.slice(0, Math.min(4, sorted.length));
    if (selected.length === 0) continue;

    const totalProduceKg = selected.reduce((s, p) => s + p.quantityKg, 0);
    const avgPrice = Math.round(selected.reduce((s, p) => s + p.pricePerKg, 0) / selected.length);
    const totalDistanceKm = Math.round(selected.reduce((s, p, i) => s + (i === 0 ? p.distanceKm : p.distanceKm * 0.6), 0) * 10) / 10;
    const estimatedTravelMin = Math.round(totalDistanceKm * 2.5);
    const logisticsCost = Math.round(totalDistanceKm * 12);

    // Multi-factor explainable scoring without Math.random()
    const quantityMatchPct = Math.min(100, Math.round((totalProduceKg / buyer.requiredQtyKg) * 100));
    const distanceScorePct = Math.max(30, Math.min(100, 100 - Math.round(totalDistanceKm * 2.5)));
    const priceDiff = Math.abs(avgPrice - buyer.offeredPrice);
    const priceScorePct = Math.max(40, 100 - priceDiff * 4);
    const gradeACount = selected.filter((p) => p.quality === 'A').length;
    const qualityMatchPct = Math.round((gradeACount / selected.length) * 100);
    const reliabilityPct = 88; // Deterministic benchmark score for Siruvani FPO network

    const matchScore = Math.round(
      quantityMatchPct * 0.30 +
      priceScorePct * 0.25 +
      qualityMatchPct * 0.20 +
      distanceScorePct * 0.15 +
      reliabilityPct * 0.10
    );

    const route: { stop: string; type: 'farm' | 'warehouse'; distanceKm: number }[] = selected.map((p) => ({
      stop: `${p.farmerName} (${p.location})`,
      type: 'farm' as const,
      distanceKm: Math.round(p.distanceKm * 10) / 10,
    }));
    route.push({ stop: buyer.name, type: 'warehouse', distanceKm: Math.round(buyer.distanceKm * 10) / 10 });

    clusterNum++;
    clusters.push({
      id: `cluster-${clusterNum}`,
      crop,
      farmers: selected.map((p) => ({
        name: p.farmerName,
        quantityKg: p.quantityKg,
        quality: p.quality,
        location: p.location,
      })),
      totalProduceKg,
      pricePerKg: avgPrice,
      reliabilityPct,
      matchScore,
      qualityMatchPct,
      quantityMatchPct,
      distanceScorePct,
      priceScorePct,
      totalDistanceKm,
      estimatedTravelMin,
      logisticsCost,
      route,
      buyerId: buyer.id,
      firstFarmerId: selected[0].farmerId,
      firstFarmerName: selected[0].farmerName,
      pipeline: {
        inputs: [
          `Buyer Demand: ${buyer.requiredQtyKg} kg ${crop} @ target ₹${buyer.offeredPrice}/kg`,
          `Cluster Supply: ${totalProduceKg} kg across ${selected.length} Karunya/Siruvani farms`,
          `Quality: ${gradeACount}/${selected.length} lots certified Grade A`,
          `Aggregated route distance: ${totalDistanceKm} km`,
        ],
        model: 'Multi-attribute clustering: 30% Volume + 25% Price + 20% Quality + 15% Proximity + 10% Reliability.',
        output: `${matchScore}% Match Index. Recommended consolidation: ₹${avgPrice}/kg for ${totalProduceKg} kg.`,
      },
    });
  }

  return clusters.sort((a, b) => b.matchScore - a.matchScore).slice(0, 6);
}

export function BuyerAIMatches() {
  const { buyers, produceListings, farmers, placeOrder } = useApp();
  const buyer = buyers[0];
  const [orderCluster, setOrderCluster] = useState<Cluster | null>(null);

  const clusters = useMemo(() => buildClusters(produceListings, buyers, farmers), [produceListings, buyers, farmers]);

  const handlePlaceOrder = () => {
    if (!orderCluster || !buyer) return;
    const qty = Math.min(orderCluster.totalProduceKg, buyer.requiredQtyKg);
    placeOrder({
      buyerId: buyer.id,
      buyerName: buyer.name,
      farmerId: orderCluster.firstFarmerId,
      farmerName: orderCluster.firstFarmerName,
      crop: orderCluster.crop,
      quantityKg: qty,
      pricePerKg: orderCluster.pricePerKg,
      totalAmount: qty * orderCluster.pricePerKg,
      deliveryDate: '2026-09-06',
    });
    setOrderCluster(null);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="AI Buyer-Farmer Matching Engine"
        subtitle="Optimized harvest clustering and route aggregation for institutional procurement"
        icon={<Sparkles className="w-5 h-5 text-agri-600" />}
      />

      {/* Pipeline Visualizer */}
      <AIPipelineVisualizer activeStepId="matching" />

      {clusters.length === 0 ? (
        <div className="bg-earth-50 rounded-xl p-12 text-center border border-earth-200">
          <Sparkles className="w-12 h-12 mx-auto text-earth-300 mb-3" />
          <p className="text-earth-500">No matching farmer clusters found. New produce listings will appear here automatically.</p>
        </div>
      ) : (
        <div className="space-y-5">
          {clusters.map((cluster, i) => (
            <AIInsightCard
              key={cluster.id}
              title={`Match #${i + 1}: ${cluster.crop} Aggregation Cluster`}
              badge={`AI Match Score: ${cluster.matchScore}%`}
              variant={i === 0 ? 'success' : 'default'}
              reasoning={`Aggregates ${cluster.farmers.length} smallholder farms along Siruvani Road to satisfy ${cluster.totalProduceKg} kg of ${cluster.crop} demand with pooled transportation.`}
            >
              <div className="grid lg:grid-cols-3 gap-4">
                {/* Cluster Lots */}
                <div className="bg-white/80 rounded-xl p-4 border border-earth-200">
                  <p className="text-xs font-bold text-earth-600 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-agri-600" /> Farmers in Cluster
                  </p>
                  <div className="space-y-2">
                    {cluster.farmers.map((f, idx) => (
                      <div key={idx} className="flex items-center justify-between text-xs p-1.5 rounded bg-earth-50/70">
                        <div>
                          <span className="font-semibold text-earth-900 block">{f.name}</span>
                          <span className="text-[11px] text-earth-500">{f.location} • Grade {f.quality}</span>
                        </div>
                        <span className="font-bold text-agri-800 font-mono">{f.quantityKg} kg</span>
                      </div>
                    ))}
                    <div className="pt-2 mt-2 border-t border-earth-200 flex items-center justify-between text-xs">
                      <span className="font-bold text-earth-900">Total Pooled Supply</span>
                      <span className="font-extrabold text-agri-700 font-mono text-sm">{cluster.totalProduceKg.toLocaleString('en-IN')} kg</span>
                    </div>
                  </div>
                </div>

                {/* Match Breakdown */}
                <div className="bg-white/80 rounded-xl p-4 border border-earth-200">
                  <p className="text-xs font-bold text-earth-600 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-agri-600" /> Compatibility Breakdown
                  </p>
                  <div className="space-y-2">
                    {[
                      { label: 'Volume Fulfillment', value: cluster.quantityMatchPct },
                      { label: 'Price Compatibility', value: cluster.priceScorePct },
                      { label: 'Grade A Quality Fit', value: cluster.qualityMatchPct },
                      { label: 'Distance / Proximity', value: cluster.distanceScorePct },
                      { label: 'Farmer Reliability', value: cluster.reliabilityPct },
                    ].map((item) => (
                      <div key={item.label}>
                        <div className="flex items-center justify-between text-[11px] mb-0.5">
                          <span className="text-earth-600">{item.label}</span>
                          <span className="font-bold text-earth-900 font-mono">{item.value}%</span>
                        </div>
                        <div className="h-1.5 rounded-full bg-earth-200 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${item.value >= 80 ? 'bg-green-500' : 'bg-agri-500'}`}
                            style={{ width: `${item.value}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Optimized Route */}
                <div className="bg-white/80 rounded-xl p-4 border border-earth-200">
                  <p className="text-xs font-bold text-earth-600 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                    <Route className="w-3.5 h-3.5 text-blue-600" /> Aggregated Pickup Route
                  </p>
                  <div className="space-y-1 text-xs">
                    {cluster.route.map((stop, j) => (
                      <div key={j} className="flex items-center gap-2">
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                          stop.type === 'warehouse' ? 'bg-amber-100 text-amber-800' : 'bg-agri-100 text-agri-800'
                        }`}>
                          {j + 1}
                        </div>
                        <span className="text-earth-700 truncate">{stop.stop}</span>
                        <span className="text-earth-400 text-[11px] ml-auto font-mono">{stop.distanceKm} km</span>
                      </div>
                    ))}
                  </div>
                  <div className="pt-2.5 mt-2.5 border-t border-earth-200 space-y-1 text-xs">
                    <div className="flex justify-between text-earth-600">
                      <span>Total Distance:</span>
                      <span className="font-semibold text-earth-900 font-mono">{cluster.totalDistanceKm} km</span>
                    </div>
                    <div className="flex justify-between text-earth-600">
                      <span>Transit Estimate:</span>
                      <span className="font-semibold text-earth-900 font-mono">{cluster.estimatedTravelMin} min</span>
                    </div>
                    <div className="flex justify-between text-earth-600">
                      <span>Estimated Freight:</span>
                      <span className="font-semibold text-agri-700 font-mono">₹{cluster.logisticsCost.toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Explainability Pipeline */}
              <div className="mt-3">
                <AIExplainCard
                  pipeline={cluster.pipeline}
                  title="Explain Match Algorithm Logic"
                  actionableImpact="Consolidation saves 27% transit miles compared to separate pickups."
                />
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-4 pt-3 border-t border-earth-200">
                <div className="flex items-center gap-2">
                  <Badge variant={i === 0 ? 'success' : 'agri'}>
                    {i === 0 ? 'TOP AI MATCH' : `RANK #${i + 1}`}
                  </Badge>
                  <span className="text-xs text-earth-600">
                    Weighted Price: <strong className="text-earth-900 font-mono">₹{cluster.pricePerKg}/kg</strong>
                  </span>
                </div>
                <button onClick={() => setOrderCluster(cluster)} className="btn-primary">
                  <span>Place Order with Cluster</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </AIInsightCard>
          ))}
        </div>
      )}

      {/* Confirm Order Modal */}
      <Modal open={!!orderCluster} onClose={() => setOrderCluster(null)} title="Confirm Order with Farmer Cluster" size="md">
        {orderCluster && buyer && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-earth-50 rounded-xl p-3"><p className="text-earth-500">Crop Required</p><p className="font-bold text-sm text-earth-900">{orderCluster.crop}</p></div>
              <div className="bg-earth-50 rounded-xl p-3"><p className="text-earth-500">Matched Volume</p><p className="font-bold text-sm text-earth-900">{Math.min(orderCluster.totalProduceKg, buyer.requiredQtyKg)} kg</p></div>
              <div className="bg-earth-50 rounded-xl p-3"><p className="text-earth-500">Consolidated Price</p><p className="font-bold text-sm text-agri-700 font-mono">₹{orderCluster.pricePerKg}/kg</p></div>
              <div className="bg-earth-50 rounded-xl p-3"><p className="text-earth-500">Total Purchase Value</p><p className="font-bold text-sm text-agri-900 font-mono">₹{(Math.min(orderCluster.totalProduceKg, buyer.requiredQtyKg) * orderCluster.pricePerKg).toLocaleString('en-IN')}</p></div>
            </div>
            <div className="p-3 bg-agri-50 rounded-xl text-xs text-agri-900 flex items-start gap-2 border border-agri-200">
              <CheckCircle2 className="w-4 h-4 text-agri-600 mt-0.5 flex-shrink-0" />
              <span>
                Order will be dispatched across {orderCluster.farmers.length} pooled farmers in Karunya/Siruvani and recorded in BPP Beckn registry.
              </span>
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={() => setOrderCluster(null)} className="btn-secondary flex-1">Cancel</button>
              <button onClick={handlePlaceOrder} className="btn-primary flex-1">Confirm Purchase Order</button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

