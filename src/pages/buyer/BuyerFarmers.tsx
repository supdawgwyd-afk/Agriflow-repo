import { useMemo } from 'react';
import { Card, CardHeader } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { PageHeader } from '@/components/ui/PageHeader';
import { useApp } from '@/context/AppContext';
import type { CropType, ProduceListing, Buyer, Farmer } from '@/types';
import {
  Users, Package, MapPin, Route, IndianRupee, Clock,
  ArrowDown, Warehouse, Sparkles,
} from 'lucide-react';

interface Cluster {
  id: string;
  clusterNumber: number;
  crop: CropType;
  farmers: { name: string; quantityKg: number; distanceKm: number }[];
  totalProduceKg: number;
  matchScore: number;
  totalDistanceKm: number;
  estimatedTravelMin: number;
  logisticsCost: number;
  route: { stop: string; type: 'farm' | 'warehouse'; distanceKm: number }[];
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

    const sorted = [...items].sort((a, b) => a.distanceKm - b.distanceKm);
    const selected = sorted.slice(0, Math.min(4, sorted.length));
    if (selected.length === 0) continue;

    const totalProduceKg = selected.reduce((s, p) => s + p.quantityKg, 0);
    const totalDistanceKm = Math.round(selected.reduce((s, p, i) => s + (i === 0 ? p.distanceKm : p.distanceKm * 0.6), 0) * 10) / 10;
    const estimatedTravelMin = Math.round(totalDistanceKm * 2.5);
    const logisticsCost = Math.round(totalDistanceKm * 12);
    const matchScore = Math.min(98, Math.round((totalProduceKg / buyer.requiredQtyKg) * 100));

    const route: { stop: string; type: 'farm' | 'warehouse'; distanceKm: number }[] = selected.map((p) => ({
      stop: `${p.farmerName} (${p.location})`,
      type: 'farm' as const,
      distanceKm: Math.round(p.distanceKm * 10) / 10,
    }));
    route.push({ stop: buyer.name, type: 'warehouse', distanceKm: Math.round(buyer.distanceKm * 10) / 10 });

    clusterNum++;
    clusters.push({
      id: `cluster-${clusterNum}`,
      clusterNumber: clusterNum,
      crop,
      farmers: selected.map((p) => ({ name: p.farmerName, quantityKg: p.quantityKg, distanceKm: p.distanceKm })),
      totalProduceKg,
      matchScore,
      totalDistanceKm,
      estimatedTravelMin,
      logisticsCost,
      route,
    });
  }

  return clusters.sort((a, b) => b.matchScore - a.matchScore);
}

export function BuyerFarmers() {
  const { produceListings, buyers, farmers } = useApp();
  const clusters = useMemo(() => buildClusters(produceListings, buyers, farmers), [produceListings, buyers, farmers]);

  return (
    <div>
      <PageHeader
        title="Farmer Clusters"
        subtitle="AI-optimized farmer aggregation and collection routes — built from live marketplace data"
        icon={<Users className="w-5 h-5" />}
      />

      {clusters.length === 0 ? (
        <Card className="p-12 text-center">
          <Sparkles className="w-12 h-12 mx-auto text-earth-300 mb-3" />
          <p className="text-earth-500">No farmer clusters available. New produce listings will generate clusters automatically.</p>
        </Card>
      ) : (
        <div className="space-y-6">
          {clusters.map((cluster) => (
            <Card key={cluster.id} className="p-6">
              <CardHeader
                title={`Farmer Cluster #${cluster.clusterNumber} — ${cluster.crop}`}
                subtitle={`${cluster.farmers.length} farmers • ${cluster.totalProduceKg} kg total`}
                icon={<Users className="w-5 h-5" />}
                action={<Badge variant="agri">AI Match: {cluster.matchScore}%</Badge>}
              />

              <div className="p-5 pt-2 grid lg:grid-cols-2 gap-6">
                {/* Farmer List */}
                <div>
                  <p className="text-sm font-medium text-earth-700 mb-3">Participating Farmers</p>
                  <div className="space-y-2">
                    {cluster.farmers.map((f) => (
                      <div key={f.name} className="flex items-center justify-between p-3 rounded-xl border border-earth-100 bg-earth-50/50">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg bg-agri-50 text-agri-600 flex items-center justify-center">
                            <Package className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="font-medium text-sm text-earth-900">{f.name}</p>
                            <p className="text-xs text-earth-500">{f.distanceKm} km away</p>
                          </div>
                        </div>
                        <span className="font-semibold text-earth-900">{f.quantityKg} kg</span>
                      </div>
                    ))}
                    <div className="flex items-center justify-between p-3 rounded-xl bg-agri-50 border border-agri-200">
                      <span className="font-semibold text-agri-800">Total Produce</span>
                      <span className="font-bold text-agri-700">{cluster.totalProduceKg} kg</span>
                    </div>
                  </div>
                </div>

                {/* Optimized Route */}
                <div>
                  <p className="text-sm font-medium text-earth-700 mb-3 flex items-center gap-1.5">
                    <Route className="w-4 h-4 text-blue-600" /> Optimized Collection Route
                  </p>
                  <div className="space-y-1">
                    {cluster.route.map((stop, j) => (
                      <div key={j}>
                        <div className="flex items-center gap-3 p-2.5 rounded-xl border border-earth-100">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${
                            stop.type === 'warehouse' ? 'bg-amber-100 text-amber-700' : 'bg-agri-100 text-agri-700'
                          }`}>
                            {stop.type === 'warehouse' ? <Warehouse className="w-4 h-4" /> : j + 1}
                          </div>
                          <span className="text-sm font-medium text-earth-900 flex-1">{stop.stop}</span>
                          <span className="text-xs text-earth-500">{stop.distanceKm} km</span>
                        </div>
                        {j < cluster.route.length - 1 && (
                          <div className="flex items-center justify-center py-0.5">
                            <ArrowDown className="w-3 h-3 text-earth-300" />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 grid grid-cols-3 gap-3">
                    <div className="bg-earth-50 rounded-xl p-3 text-center">
                      <MapPin className="w-4 h-4 text-earth-400 mx-auto mb-1" />
                      <p className="text-xs text-earth-500">Distance</p>
                      <p className="font-semibold text-earth-900">{cluster.totalDistanceKm} km</p>
                    </div>
                    <div className="bg-earth-50 rounded-xl p-3 text-center">
                      <Clock className="w-4 h-4 text-earth-400 mx-auto mb-1" />
                      <p className="text-xs text-earth-500">Travel Time</p>
                      <p className="font-semibold text-earth-900">{cluster.estimatedTravelMin} min</p>
                    </div>
                    <div className="bg-earth-50 rounded-xl p-3 text-center">
                      <IndianRupee className="w-4 h-4 text-earth-400 mx-auto mb-1" />
                      <p className="text-xs text-earth-500">Logistics</p>
                      <p className="font-semibold text-earth-900">₹{cluster.logisticsCost.toLocaleString('en-IN')}</p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
