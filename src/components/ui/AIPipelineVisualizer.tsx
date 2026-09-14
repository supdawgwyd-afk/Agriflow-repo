import { useState } from 'react';
import { Database, TrendingUp, IndianRupee, MapPin, Users, Truck, CheckCircle2, ChevronRight, Sparkles, HelpCircle } from 'lucide-react';

export interface AIPipelineStep {
  id: string;
  name: string;
  shortName: string;
  category: 'DATA' | 'PREDICTION' | 'OPTIMIZATION' | 'ACTION';
  icon: typeof Database;
  description: string;
  demoMetric: string;
}

const defaultSteps: AIPipelineStep[] = [
  {
    id: 'data',
    name: 'Unified Data Layer',
    shortName: 'DATA',
    category: 'DATA',
    icon: Database,
    description: 'Aggregates farmer crop acreage, live centre capacities, and buyer demand requirements across Karunya Nagar and Coimbatore.',
    demoMetric: '4 Centrals • 6 Buyers • 10 Crops',
  },
  {
    id: 'forecast',
    name: 'Demand Forecasting (Supervised ML)',
    shortName: 'ML DEMAND',
    category: 'PREDICTION',
    icon: TrendingUp,
    description: 'Trained Random Forest Regressor predicts physical consumer demand (kg) based on mandi arrivals, modal price, and seasonal trends.',
    demoMetric: 'Random Forest R² = 0.968 • 4,350 kg',
  },
  {
    id: 'pricing',
    name: 'Price & Surplus Engine',
    shortName: 'PRICE / SURPLUS',
    category: 'PREDICTION',
    icon: IndianRupee,
    description: 'Dynamic price discovery benchmarking mandi MSP with Grade A quality premium and localized supply deficit.',
    demoMetric: '₹35/kg Rec. (Grade A +17%)',
  },
  {
    id: 'centre',
    name: 'Centre & Queue Optimization',
    shortName: 'CENTRE & QUEUE',
    category: 'OPTIMIZATION',
    icon: MapPin,
    description: 'Load balances incoming farmer bookings to the least congested centre with predictive wait estimation.',
    demoMetric: 'Siruvani Centre B (45% cap, 15m wait)',
  },
  {
    id: 'matching',
    name: 'Buyer-Farmer Match',
    shortName: 'BUYER MATCH',
    category: 'OPTIMIZATION',
    icon: Users,
    description: 'Clusters local harvests to satisfy bulk buyer purchase requirements with high quality and quantity compatibility.',
    demoMetric: '92% Match with Hotel GreenPark',
  },
  {
    id: 'logistics',
    name: 'Logistics Optimization',
    shortName: 'LOGISTICS',
    category: 'OPTIMIZATION',
    icon: Truck,
    description: 'Route optimization that aggregates collection pickups along Siruvani Main Road to cut transit miles.',
    demoMetric: '27% Transit Distance Saved',
  },
  {
    id: 'action',
    name: 'Verifiable Action',
    shortName: 'ACTION',
    category: 'ACTION',
    icon: CheckCircle2,
    description: 'Direct execution: smart slot booked, produce cataloged, order fulfilled, and instant payment disbursed.',
    demoMetric: 'Zero Distress Sales • Realized Gain',
  },
];

interface AIPipelineVisualizerProps {
  activeStepId?: string;
  compact?: boolean;
  className?: string;
}

export function AIPipelineVisualizer({ activeStepId, compact = false, className = '' }: AIPipelineVisualizerProps) {
  const [selectedStepId, setSelectedStepId] = useState<string>(activeStepId || 'forecast');

  const selectedStep = defaultSteps.find((s) => s.id === selectedStepId) || defaultSteps[1];

  return (
    <div className={`rounded-2xl border border-earth-200 bg-white shadow-sm overflow-hidden ${className}`}>
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5 bg-earth-50/80 border-b border-earth-200">
        <div className="flex items-center gap-2">
          <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-agri-600 text-white shadow-xs">
            <Sparkles className="w-4 h-4" />
          </span>
          <div>
            <h4 className="text-sm font-bold text-earth-900 flex items-center gap-1.5 font-display">
              AgriFlow AI Intelligence Pipeline
              <span className="px-2 py-0.5 text-[10px] uppercase tracking-wider font-semibold rounded-full bg-agri-100 text-agri-800">
                SIH 2026 Core Logic
              </span>
            </h4>
            <p className="text-xs text-earth-500">
              Data &rarr; Prediction &rarr; Recommendation &rarr; Action &rarr; Measurable Impact
            </p>
          </div>
        </div>
        <div className="text-xs text-earth-500 hidden sm:flex items-center gap-1">
          <HelpCircle className="w-3.5 h-3.5 text-earth-400" />
          <span>Click any stage to view decision logic</span>
        </div>
      </div>

      {/* Horizontal Pipeline Steps */}
      <div className="p-4 overflow-x-auto">
        <div className="flex items-center min-w-[650px] justify-between relative">
          {defaultSteps.map((step, idx) => {
            const Icon = step.icon;
            const isSelected = step.id === selectedStepId;
            const isCurrentActive = step.id === activeStepId;

            return (
              <div key={step.id} className="flex items-center flex-1 last:flex-none">
                <button
                  type="button"
                  onClick={() => setSelectedStepId(step.id)}
                  className={`flex flex-col items-center text-center p-2 rounded-xl transition-all w-full max-w-[110px] group ${
                    isSelected
                      ? 'bg-agri-50 ring-2 ring-agri-500 text-agri-900'
                      : isCurrentActive
                        ? 'bg-earth-100 text-earth-900 font-semibold'
                        : 'hover:bg-earth-50 text-earth-600'
                  }`}
                >
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center mb-1.5 transition-colors ${
                      isSelected
                        ? 'bg-agri-600 text-white shadow-sm'
                        : isCurrentActive
                          ? 'bg-agri-500 text-white'
                          : 'bg-earth-100 text-earth-700 group-hover:bg-earth-200'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-earth-400">
                    Step {idx + 1}
                  </span>
                  <span className="text-xs font-semibold leading-tight line-clamp-1">
                    {step.shortName}
                  </span>
                </button>

                {idx < defaultSteps.length - 1 && (
                  <div className="flex items-center justify-center px-1 text-earth-300">
                    <ChevronRight className="w-4 h-4" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Stage Detail Panel */}
      {!compact && selectedStep && (
        <div className="px-5 py-3.5 bg-earth-50/50 border-t border-earth-200 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-fade-in">
          <div className="flex items-start gap-2.5">
            <div className="w-2 h-2 rounded-full bg-agri-600 mt-1.5 flex-shrink-0" />
            <div>
              <span className="font-semibold text-earth-900">{selectedStep.name}: </span>
              <span className="text-earth-600">{selectedStep.description}</span>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0 bg-white border border-earth-200 px-3 py-1.5 rounded-lg">
            <span className="text-earth-400 font-medium">Demo Indicator:</span>
            <span className="font-bold text-agri-800">{selectedStep.demoMetric}</span>
          </div>
        </div>
      )}
    </div>
  );
}
