import { useMemo } from 'react';
import { Badge } from '@/components/ui/Badge';
import { AIInsightCard, AIRecommendationRow } from '@/components/ui/AIInsightCard';
import { PageHeader } from '@/components/ui/PageHeader';
import { useApp } from '@/context/AppContext';
import { computeBuyerMatch } from '@/utils/aiSimulation';
import type { CropType } from '@/types';
import {
  Users, MapPin, IndianRupee, Shield, Sparkles, TrendingUp,
} from 'lucide-react';

export function FarmerBuyers() {
  const { buyers, currentFarmer, produceListings, connectWithBuyer } = useApp();

  const matches = useMemo(() => {
    const myProduce = produceListings.filter(
      (p) => p.farmerId === currentFarmer.id && (p.status === 'available' || p.status === 'reserved')
    );

    type MatchResult = ReturnType<typeof computeBuyerMatch> & { buyer: typeof buyers[number]; produce: typeof myProduce[number] };
    const results: MatchResult[] = [];
    for (const produce of myProduce) {
      for (const buyer of buyers) {
        if (buyer.requiredCrop === produce.crop) {
          const match = computeBuyerMatch(buyer, produce, currentFarmer);
          results.push({ ...match, buyer, produce });
        }
      }
    }

    return results.sort((a, b) => b.matchScore - a.matchScore).slice(0, 6);
  }, [buyers, currentFarmer, produceListings]);

  return (
    <div>
      <PageHeader
        title="AI-Recommended Buyers"
        subtitle="Smart matching based on your live produce and buyer requirements"
        icon={<Users className="w-5 h-5" />}
      />

      {matches.length === 0 ? (
        <div className="bg-earth-50 rounded-xl p-12 text-center border border-earth-200">
          <Users className="w-12 h-12 mx-auto text-earth-300 mb-3" />
          <p className="text-earth-500">No matching buyers found. Add produce listings to see AI-matched buyers.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {matches.map((match, i) => {
            const buyer = match.buyer;
            const produce = match.produce;
            return (
              <AIInsightCard
                key={`${buyer.id}-${produce.id}`}
                title={`Match #${i + 1}: ${buyer.name}`}
                badge={`AI Match: ${match.matchScore}%`}
                variant={i === 0 ? 'success' : 'default'}
                reasoning={match.reasoning}
              >
                <div className="grid sm:grid-cols-2 gap-4">
                  {/* Buyer Info */}
                  <div className="bg-white/70 rounded-xl p-4 border border-earth-200 space-y-2">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                        <Users className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-semibold text-earth-900">{buyer.name}</p>
                        <p className="text-xs text-earth-500">{buyer.type} • {buyer.location}</p>
                      </div>
                    </div>
                    <AIRecommendationRow label="Required Quantity" value={`${buyer.requiredQtyKg} kg`} icon={<TrendingUp className="w-3.5 h-3.5" />} />
                    <AIRecommendationRow label="Distance" value={`${buyer.distanceKm} km`} icon={<MapPin className="w-3.5 h-3.5" />} />
                    <AIRecommendationRow label="Offered Price" value={`₹${buyer.offeredPrice}/kg`} icon={<IndianRupee className="w-3.5 h-3.5" />} />
                    <AIRecommendationRow label="Reliability" value={`${buyer.reliabilityPct}%`} icon={<Shield className="w-3.5 h-3.5" />} />
                  </div>

                  {/* Match Breakdown */}
                  <div className="bg-white/70 rounded-xl p-4 border border-earth-200">
                    <p className="text-sm font-medium text-earth-700 mb-3 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-agri-600" />
                      Match Breakdown
                    </p>
                    <div className="space-y-2.5">
                      {[
                        { label: 'Quantity Match', value: match.quantityMatch },
                        { label: 'Distance', value: match.distanceScore },
                        { label: 'Price', value: match.priceScore },
                        { label: 'Delivery Timing', value: match.timingScore },
                        { label: 'Buyer Reliability', value: match.reliabilityScore },
                      ].map((item) => (
                        <div key={item.label}>
                          <div className="flex items-center justify-between text-xs mb-1">
                            <span className="text-earth-500">{item.label}</span>
                            <span className="font-semibold text-earth-900">{item.value}%</span>
                          </div>
                          <div className="h-1.5 rounded-full bg-earth-200 overflow-hidden">
                            <div className="h-full rounded-full bg-agri-500" style={{ width: `${item.value}%` }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-4 pt-4 border-t border-earth-200/50">
                  <div className="flex items-center gap-2">
                    <Badge variant={i === 0 ? 'success' : 'agri'}>
                      {i === 0 ? 'BEST MATCH' : `MATCH #${i + 1}`}
                    </Badge>
                    <span className="text-sm text-earth-500">
                      Your produce: <strong className="text-earth-900">{produce.quantityKg} kg {produce.crop}</strong>
                    </span>
                  </div>
                  <button
                    onClick={() => connectWithBuyer(buyer.id, currentFarmer.id, produce.crop, produce.quantityKg, produce.pricePerKg)}
                    className="btn-primary"
                  >
                    Connect with Buyer
                  </button>
                </div>
              </AIInsightCard>
            );
          })}
        </div>
      )}
    </div>
  );
}
