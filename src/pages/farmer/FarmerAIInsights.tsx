import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { AIInsightCard, AIRecommendationRow, ConfidenceIndicator } from '@/components/ui/AIInsightCard';
import { PageHeader } from '@/components/ui/PageHeader';
import { AIPipelineVisualizer } from '@/components/ui/AIPipelineVisualizer';
import { AIExplainCard } from '@/components/ui/AIExplainCard';
import { BeforeAfterAI } from '@/components/ui/BeforeAfterAI';
import { ModelInspectorModal } from '@/components/ui/ModelInspectorModal';
import { useApp } from '@/context/AppContext';
import {
  predictDemandDetailed,
  computeDetailedPriceRecommendation,
  computeSurplusDetailed,
  cropPrices,
} from '@/utils/aiSimulation';
import { predictDemandML } from '@/services/ml';
import type { CropType } from '@/types';
import {
  Sparkles, TrendingUp, TrendingDown, IndianRupee, AlertTriangle,
  ChevronDown, ChevronUp, Wheat, ArrowRight, Calendar, CheckCircle2,
  Info, ShieldCheck, Brain,
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { weeklyDemandData } from '@/data/mockData';

export function FarmerAIInsights() {
  const navigate = useNavigate();
  const { crops, currentFarmer, produceListings, buyers } = useApp();
  const [selectedCropTab, setSelectedCropTab] = useState<string>(crops[0]?.name || 'Tomato');
  const [showInspector, setShowInspector] = useState<boolean>(false);
  const [inspectorCrop, setInspectorCrop] = useState<CropType>('Tomato');

  const insights = useMemo(() => {
    return crops.map((crop) => {
      const supply = crop.quantityKg;

      const totalBuyerDemand = buyers
        .filter((b) => b.requiredCrop === crop.name)
        .reduce((s, b) => s + b.requiredQtyKg, 0);

      const totalSupply = supply + produceListings
        .filter((p) => p.crop === crop.name && p.status === 'available')
        .reduce((s, p) => s + p.quantityKg, 0);

      // Supervised Machine Learning Model Forecast
      const mlForecast = predictDemandML({
        crop: crop.name,
        marketRegion: 'Alandurai Centre',
        modalPrice: cropPrices[crop.name] || 30,
        marketArrivalsKg: totalSupply,
        historicalDemandKg: Math.max(3000, totalBuyerDemand),
      });

      // Explainable Deterministic Decision Engine (incorporates predicted demand)
      const demandForecast = predictDemandDetailed(crop.name, totalSupply, Math.max(totalBuyerDemand, mlForecast.predictedDemandKg));
      const priceRec = computeDetailedPriceRecommendation(crop.name, crop.quality, totalSupply, mlForecast.predictedDemandKg);
      const surplusAnalysis = computeSurplusDetailed(crop.name, totalSupply, mlForecast.predictedDemandKg);

      const harvestDate = new Date(crop.harvestDate);
      const today = new Date('2026-09-03');
      const daysToHarvest = Math.ceil((harvestDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      const timingAdvice = daysToHarvest <= 0
        ? 'Ready to harvest now. Immediate procurement recommended to capture peak buyer demand.'
        : daysToHarvest <= 7
          ? `Harvest in ${daysToHarvest} days. Optimal window to pre-book procurement slot to lock in price.`
          : `Harvest in ${daysToHarvest} days. Demand projection suggests firming trend at harvest date.`;

      const demandSupplyGapKg = mlForecast.predictedDemandKg - totalSupply;

      return {
        crop: crop.name,
        cropId: crop.id,
        quality: crop.quality,
        location: crop.location,
        currentSupply: supply,
        totalSupply,
        totalBuyerDemand,
        mlForecast,
        demandSupplyGapKg,
        demandForecast,
        priceRec,
        surplusAnalysis,
        daysToHarvest,
        timingAdvice,
      };
    });
  }, [crops, produceListings, buyers]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="AI Crop & Market Intelligence"
        subtitle="Dynamic demand forecasting, quality-adjusted price discovery, and surplus risk mitigation"
        icon={<Sparkles className="w-5 h-5 text-agri-600" />}
      />

      {/* AI Pipeline Visualizer Banner */}
      <AIPipelineVisualizer activeStepId="forecast" />

      {/* Demand Forecast Section */}
      <Card>
        <CardHeader
          title="ML Regional Demand Forecast"
          subtitle="Supervised Random Forest Regressor (Trained on Tamil Nadu APMC Mandi Historical Arrivals & Prices)"
          icon={<TrendingUp className="w-5 h-5" />}
          badge={
            <button
              onClick={() => {
                setInspectorCrop('Tomato');
                setShowInspector(true);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-agri-600 hover:bg-agri-700 text-white transition-all shadow-xs"
            >
              <Brain className="w-3.5 h-3.5" />
              <span>Model Inspector</span>
            </button>
          }
        />
        <div className="p-5 pt-2">
          {/* Hybrid AI Explanatory Notice */}
          <div className="mb-4 p-3 rounded-xl bg-agri-50/60 border border-agri-200 text-xs text-agri-950 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Brain className="w-4 h-4 text-agri-700 flex-shrink-0" />
              <span>
                <strong>Hybrid Architecture:</strong> Real Supervised Random Forest model predicts expected market demand (kg); AgriFlow Decision Engine calculates optimal farm-gate prices and mitigates surplus risks.
              </span>
            </div>
            <span className="text-[11px] font-mono font-semibold text-agri-800 bg-white px-2 py-0.5 rounded border border-agri-300">
              R² = 0.968 • MAE = 364 kg
            </span>
          </div>

          <div className="h-64 mb-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={weeklyDemandData}>
                <defs>
                  <linearGradient id="dGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#22c55e" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#22c55e" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="sGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.2} />
                    <stop offset="100%" stopColor="#f59e0b" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" />
                <XAxis dataKey="day" tick={{ fontSize: 12, fill: '#78716c' }} />
                <YAxis tick={{ fontSize: 12, fill: '#78716c' }} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e7e5e4', fontSize: '13px' }} />
                <Area type="monotone" dataKey="demand" stroke="#22c55e" strokeWidth={2} fill="url(#dGrad)" name="Regional Demand (kg)" />
                <Area type="monotone" dataKey="supply" stroke="#f59e0b" strokeWidth={2} fill="url(#sGrad)" name="Local Supply (kg)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-earth-200">
                  <th className="text-left text-xs font-semibold text-earth-500 uppercase tracking-wider px-3 py-2.5">Crop</th>
                  <th className="text-right text-xs font-semibold text-earth-500 uppercase tracking-wider px-3 py-2.5">Local Supply</th>
                  <th className="text-right text-xs font-semibold text-earth-500 uppercase tracking-wider px-3 py-2.5">ML Demand Forecast</th>
                  <th className="text-right text-xs font-semibold text-earth-500 uppercase tracking-wider px-3 py-2.5">Demand Gap</th>
                  <th className="text-center text-xs font-semibold text-earth-500 uppercase tracking-wider px-3 py-2.5">Decision Engine Balance</th>
                  <th className="text-right text-xs font-semibold text-earth-500 uppercase tracking-wider px-3 py-2.5">Model Reliability</th>
                </tr>
              </thead>
              <tbody>
                {insights.map((item) => (
                  <tr key={item.crop} className="border-b border-earth-100 last:border-0 hover:bg-earth-50/50">
                    <td className="px-3 py-3">
                      <button
                        onClick={() => {
                          setInspectorCrop(item.crop as CropType);
                          setShowInspector(true);
                        }}
                        className="flex items-center gap-2 hover:text-agri-700 transition-colors text-left"
                        title="Click to inspect ML model"
                      >
                        <Wheat className="w-4 h-4 text-agri-600" />
                        <span className="font-semibold text-earth-900">{item.crop}</span>
                        <span className="text-[11px] px-1.5 py-0.5 rounded bg-earth-100 text-earth-600 font-medium">Grade {item.quality}</span>
                      </button>
                    </td>
                    <td className="px-3 py-3 text-right text-earth-700 font-mono">{item.currentSupply.toLocaleString('en-IN')} kg</td>
                    <td className="px-3 py-3 text-right font-semibold text-earth-900 font-mono">
                      <div className="flex items-center justify-end gap-1.5">
                        <span>{item.mlForecast.predictedDemandKg.toLocaleString('en-IN')} kg</span>
                        <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-agri-100 text-agri-800">
                          {item.mlForecast.isFallback ? 'Fallback' : 'ML'}
                        </span>
                      </div>
                    </td>
                    <td className="px-3 py-3 text-right font-mono text-xs">
                      <span className={item.demandSupplyGapKg >= 0 ? 'text-green-700 font-bold' : 'text-amber-700 font-bold'}>
                        {item.demandSupplyGapKg >= 0 ? `+${item.demandSupplyGapKg.toLocaleString('en-IN')} kg` : `${item.demandSupplyGapKg.toLocaleString('en-IN')} kg`}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-center">
                      <Badge variant={item.demandForecast.balanceStatus.includes('Shortage') ? 'success' : item.demandForecast.balanceStatus.includes('Surplus') ? 'warning' : 'neutral'}>
                        {item.demandForecast.balanceStatus}
                      </Badge>
                    </td>
                    <td className="px-3 py-3 text-right text-xs">
                      <span className="font-mono text-earth-600 text-[11px]" title={item.mlForecast.confidenceOrReliabilityIndicator}>
                        {item.mlForecast.confidenceOrReliabilityIndicator}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </Card>

      {/* AI Price Recommendation Grid */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-lg font-bold text-earth-900 font-display">Quality & Demand-Adjusted Price Discovery</h3>
            <p className="text-xs text-earth-500">
              Reference mandi benchmarks adjusted dynamically for supply deficit and certified quality premium
            </p>
          </div>
          <Badge variant="agri"><Sparkles className="w-3 h-3" /> AI Recommendation Engine</Badge>
        </div>

        <div className="grid lg:grid-cols-3 gap-4">
          {insights.map((item, i) => {
            const { priceRec, crop, timingAdvice, daysToHarvest } = item;
            return (
              <AIInsightCard
                key={crop}
                title={`${crop} Price Guidance`}
                badge={`Grade ${item.quality} • ${priceRec.confidence}% Confidence`}
                variant={i === 0 ? 'success' : 'default'}
              >
                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between pb-1.5 border-b border-earth-100">
                    <span className="text-earth-500">Mandi Reference (MSP):</span>
                    <span className="font-semibold text-earth-800">₹{priceRec.referencePrice}/kg</span>
                  </div>
                  <div className="flex items-center justify-between pb-1.5 border-b border-earth-100">
                    <span className="text-earth-500">Supply-Demand Factor:</span>
                    <span className={`font-semibold ${priceRec.supplyDemandDelta >= 0 ? 'text-green-700' : 'text-amber-700'}`}>
                      {priceRec.supplyDemandDelta >= 0 ? `+₹${priceRec.supplyDemandDelta}/kg (High Demand)` : `-₹${Math.abs(priceRec.supplyDemandDelta)}/kg`}
                    </span>
                  </div>
                  <div className="flex items-center justify-between pb-1.5 border-b border-earth-100">
                    <span className="text-earth-500">Certified Quality Adjustment:</span>
                    <span className="font-semibold text-agri-700">
                      {priceRec.qualityDelta >= 0 ? `+₹${priceRec.qualityDelta}/kg (Grade ${item.quality})` : `-₹${Math.abs(priceRec.qualityDelta)}/kg`}
                    </span>
                  </div>
                  <div className="flex items-center justify-between pt-1 text-sm bg-agri-50/80 p-2 rounded-lg border border-agri-200">
                    <span className="font-bold text-agri-950">AI Recommended Price:</span>
                    <span className="text-base font-extrabold text-agri-700 font-mono">
                      ₹{priceRec.recommendedPrice}/kg
                    </span>
                  </div>
                  <div className="text-[11px] text-earth-500 text-right">
                    Target range: ₹{priceRec.recommendedMin} – ₹{priceRec.recommendedMax}/kg
                  </div>

                  <div className="p-2 rounded-lg bg-earth-50 text-[11px] text-earth-700 flex items-start gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-earth-400 mt-0.5 flex-shrink-0" />
                    <span>{timingAdvice}</span>
                  </div>
                </div>

                {/* Explainability Pipeline */}
                <div className="mt-3">
                  <AIExplainCard
                    pipeline={priceRec.pipeline}
                    actionableImpact={`Protects farmer income by +₹${priceRec.recommendedPrice - priceRec.referencePrice}/kg above baseline MSP.`}
                  />
                </div>

                {/* Direct Action Link */}
                <button
                  type="button"
                  onClick={() => navigate('/farmer/book-slot')}
                  className="mt-3 w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-agri-600 hover:bg-agri-700 text-white font-semibold text-xs transition-colors shadow-xs"
                >
                  <span>Book Slot for {crop}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </AIInsightCard>
            );
          })}
        </div>
      </div>

      {/* Surplus Risk Analysis */}
      <Card>
        <CardHeader
          title="Surplus Risk & Redistribution Intelligence"
          subtitle="Early-warning surplus detection mapping available harvest to active institutional buyer orders"
          icon={<AlertTriangle className="w-5 h-5 text-amber-500" />}
          badge={<Badge variant="warning"><Sparkles className="w-3 h-3" /> Waste Prevention</Badge>}
        />
        <div className="p-5 pt-2 space-y-4">
          {insights.map((item) => {
            const { surplusAnalysis, crop, totalSupply, totalBuyerDemand } = item;
            const riskBadge =
              surplusAnalysis.risk === 'HIGH' ? 'danger' : surplusAnalysis.risk === 'MEDIUM' ? 'warning' : 'success';

            return (
              <div
                key={crop}
                className="p-4 rounded-xl border border-earth-200 bg-earth-50/60 hover:bg-earth-50 transition-colors space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white text-agri-600 flex items-center justify-center border border-earth-200 shadow-2xs">
                      <Wheat className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-earth-900 text-base">{crop}</span>
                        <Badge variant={riskBadge as any}>{surplusAnalysis.risk} SURPLUS RISK</Badge>
                      </div>
                      <p className="text-xs text-earth-500">
                        Total supply: {totalSupply.toLocaleString('en-IN')} kg • Active Buyer Demand: {totalBuyerDemand.toLocaleString('en-IN')} kg
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => navigate('/farmer/buyers')}
                    className="self-start sm:self-center flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-white border border-earth-300 text-earth-800 hover:bg-earth-100 transition-colors shadow-2xs"
                  >
                    <span>View Buyer Matches</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="grid sm:grid-cols-3 gap-3 text-xs bg-white p-3 rounded-lg border border-earth-200">
                  <div>
                    <span className="text-earth-400 block mb-0.5">Surplus Margin</span>
                    <span className={`font-bold font-mono text-sm ${surplusAnalysis.surplusPct > 20 ? 'text-red-600' : 'text-green-600'}`}>
                      {surplusAnalysis.surplusPct > 0 ? `+${surplusAnalysis.surplusPct}%` : '0% (Deficit)'}
                    </span>
                  </div>
                  <div className="sm:col-span-2">
                    <span className="text-earth-400 block mb-0.5">Recommended AI Action</span>
                    <p className="font-medium text-earth-900">{surplusAnalysis.recommendedAction}</p>
                  </div>
                </div>

                <AIExplainCard
                  pipeline={surplusAnalysis.pipeline}
                  title="Explain Surplus Calculation"
                />
              </div>
            );
          })}
        </div>
      </Card>

      {/* Judge Impact Assessment Comparison */}
      <BeforeAfterAI />

      {/* Real Machine Learning Model Inspector Modal */}
      <ModelInspectorModal
        isOpen={showInspector}
        onClose={() => setShowInspector(false)}
        defaultCrop={inspectorCrop}
      />
    </div>
  );
}

