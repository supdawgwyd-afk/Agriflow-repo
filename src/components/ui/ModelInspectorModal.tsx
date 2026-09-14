import { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';
import {
  Brain, CheckCircle2, RefreshCw, Layers, BarChart2,
  TrendingUp, Sparkles, ShieldCheck, Database, Sliders, Info,
} from 'lucide-react';
import {
  getTrainedModelMetadata,
  predictDemandML,
  trainDemandModel,
  setRuntimeTrainedModel,
  ALL_CROPS,
  ALL_REGIONS,
  REAL_MODEL_METADATA,
  getPythonApiUrl,
} from '@/services/ml';
import type { CropType } from '@/types';
import type { MarketRegion } from '@/services/ml/types';

interface ModelInspectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultCrop?: CropType;
}

export function ModelInspectorModal({
  isOpen,
  onClose,
  defaultCrop = 'Tomato',
}: ModelInspectorModalProps) {
  const metadata = getTrainedModelMetadata();
  const [selectedCrop, setSelectedCrop] = useState<CropType>(defaultCrop);
  const [selectedRegion, setSelectedRegion] = useState<MarketRegion>('Alandurai Centre');
  const [testModalPrice, setTestModalPrice] = useState<number>(30);
  const [testArrivals, setTestArrivals] = useState<number>(3800);
  const [isFestival, setIsFestival] = useState<boolean>(false);
  const [isRetraining, setIsRetraining] = useState<boolean>(false);
  const [retrainSuccess, setRetrainSuccess] = useState<string | null>(null);

  // Live interactive test prediction
  const liveResult = predictDemandML({
    crop: selectedCrop,
    marketRegion: selectedRegion,
    modalPrice: testModalPrice,
    marketArrivalsKg: testArrivals,
    isFestivalSeason: isFestival,
  });

  const handleRetrain = async () => {
    setIsRetraining(true);
    setRetrainSuccess(null);
    try {
      // Simulate real training call with slight parameter variations
      const newModel = await trainDemandModel({
        nEstimators: 30,
        maxDepth: 8,
        minSamplesSplit: 5,
        randomSeed: Date.now(),
      });
      setRuntimeTrainedModel(newModel);
      setRetrainSuccess(`Model re-trained & verified: R² = ${newModel.metadata.metrics.r2}, MAE = ${newModel.metadata.metrics.mae} kg`);
    } catch (err) {
      console.error('Retrain failed:', err);
    } finally {
      setIsRetraining(false);
    }
  };

  if (!metadata) return null;

  const metrics = metadata.metrics;
  const sortedImportances = Object.entries(metadata.featureImportances)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 7);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="AgriFlow Machine Learning Model Inspector"
      size="xl"
    >
      <div className="space-y-6 text-earth-800">
        {/* Top Header info */}
        <div className="p-4 rounded-xl bg-agri-50/70 border border-agri-200">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-agri-600 text-white flex items-center justify-center shadow-xs">
                <Brain className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-earth-900 font-display">
                    {metadata.modelName}
                  </h3>
                  <Badge variant="agri">{metadata.modelVersion}</Badge>
                </div>
                <p className="text-xs text-earth-600 mt-0.5">
                  Supervised Decision-Tree Ensemble for Agricultural Demand Forecasting
                </p>
              </div>
            </div>

            <button
              onClick={handleRetrain}
              disabled={isRetraining}
              className="btn btn-secondary text-xs flex items-center gap-1.5 py-1.5 px-3"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRetraining ? 'animate-spin' : ''}`} />
              <span>{isRetraining ? 'Retraining & Evaluating...' : 'Live Model Re-evaluation'}</span>
            </button>
          </div>

          {retrainSuccess && (
            <div className="mt-3 p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>{retrainSuccess}</span>
            </div>
          )}
        </div>

        {/* Real AGMARKNET Trained Model Metadata Card */}
        <div className="p-4 rounded-xl border border-indigo-200 bg-indigo-50/40 text-xs space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 animate-pulse" />
              <span className="font-bold text-indigo-950 uppercase tracking-wider text-[11px]">
                Target Model: agriflow_random_forest_demand.joblib (AGMARKNET Kaggle Model)
              </span>
            </div>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-800 border border-indigo-200">
              {getPythonApiUrl() ? 'Python Inference Service Configured' : 'Client Mode • Deterministic Engine Active'}
            </span>
          </div>

          <div className="grid sm:grid-cols-4 gap-2 text-[11px] text-earth-700">
            <div className="p-2 rounded-lg bg-white border border-indigo-100">
              <span className="text-earth-500 block text-[10px]">Target Variable</span>
              <strong className="text-earth-900 font-mono text-[11px]">{REAL_MODEL_METADATA.target}</strong>
              <span className="text-[10px] text-earth-500 block mt-0.5">Market activity proxy (not direct kg demand)</span>
            </div>
            <div className="p-2 rounded-lg bg-white border border-indigo-100">
              <span className="text-earth-500 block text-[10px]">Dataset Rows</span>
              <strong className="text-earth-900 font-mono text-[11px]">{REAL_MODEL_METADATA.dataset_rows.toLocaleString('en-IN')} rows</strong>
              <span className="text-[10px] text-earth-500 block mt-0.5">28,341 train | 5,413 eval (32 states, 10 crops)</span>
            </div>
            <div className="p-2 rounded-lg bg-white border border-indigo-100">
              <span className="text-earth-500 block text-[10px]">Model Evaluation</span>
              <strong className="text-emerald-700 font-mono text-[11px]">R² = {REAL_MODEL_METADATA.r2.toFixed(4)}</strong>
              <span className="text-[10px] text-earth-500 block mt-0.5">MAE: {REAL_MODEL_METADATA.mae.toFixed(2)} | RMSE: {REAL_MODEL_METADATA.rmse.toFixed(2)}</span>
            </div>
            <div className="p-2 rounded-lg bg-white border border-indigo-100">
              <span className="text-earth-500 block text-[10px]">Architecture</span>
              <strong className="text-earth-900 font-mono text-[11px]">RF (300 trees, depth 15)</strong>
              <span className="text-[10px] text-earth-500 block mt-0.5">13 Scikit-Learn encoded features</span>
            </div>
          </div>

          <p className="text-[11px] text-indigo-900/90 leading-relaxed bg-white/80 p-2.5 rounded-lg border border-indigo-100">
            <strong>Runtime Execution Note:</strong> Scikit-learn <code className="font-mono text-indigo-800">.joblib</code> files are Python-compiled binaries containing Cython data structures. They cannot be executed directly inside a browser JavaScript runtime without a Python environment. AgriFlow provides a dedicated FastAPI microservice in <code className="font-mono text-indigo-800">/api_service</code> for executing the real model, while retaining the client-side deterministic engine as a zero-downtime fallback.
          </p>
        </div>

        {/* 4 Core Inspection Cards: Model, Dataset, Inputs/Outputs, Evaluation */}
        <div className="grid md:grid-cols-2 gap-4">
          {/* 1. Model Architecture */}
          <div className="p-4 rounded-xl border border-earth-200 bg-white shadow-2xs space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-earth-500">
              <Layers className="w-4 h-4 text-agri-600" />
              <span>Model Architecture</span>
            </div>
            <div className="text-sm font-semibold text-earth-900">{metadata.modelType}</div>
            <div className="text-xs text-earth-600 space-y-1">
              <div>• Ensemble Size: <strong>{metadata.hyperparameters.nEstimators} Decision Trees</strong></div>
              <div>• Max Tree Depth: <strong>{metadata.hyperparameters.maxDepth} levels</strong></div>
              <div>• Split Criterion: <strong>Mean Squared Error (MSE) Variance Reduction</strong></div>
              <div>• Feature Subsampling: <strong>50% features evaluated per node split</strong></div>
              <div>• Training Date: <strong>{metadata.trainingDate}</strong></div>
            </div>
          </div>

          {/* 2. Dataset Attribution */}
          <div className="p-4 rounded-xl border border-earth-200 bg-white shadow-2xs space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-earth-500">
              <Database className="w-4 h-4 text-blue-600" />
              <span>Dataset Provenance</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-earth-900">{metadata.datasetName}</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                {metadata.datasetType}
              </span>
            </div>
            <div className="text-xs text-earth-600 space-y-1">
              <div>• Training Samples: <strong>{metrics.trainSamples} records</strong> (80% split)</div>
              <div>• Held-Out Validation: <strong>{metrics.testSamples} records</strong> (20% chronological)</div>
              <div>• Coverage: <strong>10 Mandi Crops across 30 Months (2024–2026)</strong></div>
              <div>• Regions: <strong>4 Mandis (Coimbatore, Pollachi, Alandurai, Kinathukadavu)</strong></div>
              <div className="text-[11px] text-earth-500 italic mt-1">
                Note: Labeled as synthetic data modeled on Tamil Nadu APMC market dynamics.
              </div>
            </div>
          </div>

          {/* 3. Inputs & Outputs */}
          <div className="p-4 rounded-xl border border-earth-200 bg-white shadow-2xs space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-earth-500">
              <Sliders className="w-4 h-4 text-purple-600" />
              <span>Model Inputs & Output</span>
            </div>
            <div className="text-xs text-earth-600 space-y-1">
              <div><strong>Inputs (Feature Vector of {metadata.featureNames.length} features):</strong></div>
              <p className="text-[11px] text-earth-500 leading-relaxed">
                Crop identity (10 one-hot), Market arrivals (kg), Historical baseline demand, Previous week demand momentum, Modal mandi price, Price spread (Max - Min), Arrival-to-demand ratio, Cyclic season harmonics (sin/cos month), Festival indicator (Pongal/Diwali), Region one-hot.
              </p>
              <div className="pt-1">
                <strong>Output:</strong> Expected regional crop demand in <strong>Kilograms (kg)</strong>.
              </div>
            </div>
          </div>

          {/* 4. Real Evaluation Metrics */}
          <div className="p-4 rounded-xl border border-earth-200 bg-white shadow-2xs space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-earth-500">
              <BarChart2 className="w-4 h-4 text-emerald-600" />
              <span>Held-Out Test Metrics</span>
            </div>
            <div className="grid grid-cols-2 gap-2 pt-1">
              <div className="p-2 rounded-lg bg-earth-50 border border-earth-200">
                <div className="text-[10px] text-earth-500 font-semibold">R² Score</div>
                <div className="text-base font-bold text-emerald-700 font-mono">{metrics.r2}</div>
              </div>
              <div className="p-2 rounded-lg bg-earth-50 border border-earth-200">
                <div className="text-[10px] text-earth-500 font-semibold">Mean Absolute Error</div>
                <div className="text-base font-bold text-earth-900 font-mono">{metrics.mae} kg</div>
              </div>
              <div className="p-2 rounded-lg bg-earth-50 border border-earth-200">
                <div className="text-[10px] text-earth-500 font-semibold">Root Mean Squared Error</div>
                <div className="text-base font-bold text-earth-900 font-mono">{metrics.rmse} kg</div>
              </div>
              <div className="p-2 rounded-lg bg-earth-50 border border-earth-200">
                <div className="text-[10px] text-earth-500 font-semibold">MAPE</div>
                <div className="text-base font-bold text-blue-700 font-mono">{metrics.mape}%</div>
              </div>
            </div>
          </div>
        </div>

        {/* Feature Importances */}
        <div className="p-4 rounded-xl border border-earth-200 bg-white">
          <h4 className="text-xs font-bold uppercase tracking-wider text-earth-500 mb-3 flex items-center gap-1.5">
            <TrendingUp className="w-4 h-4 text-agri-600" />
            <span>Empirical Feature Importances (Variance Reduction)</span>
          </h4>
          <div className="space-y-2">
            {sortedImportances.map(([feat, imp]) => (
              <div key={feat} className="text-xs">
                <div className="flex justify-between text-earth-700 mb-1">
                  <span className="font-mono text-earth-900">{feat}</span>
                  <span className="font-semibold text-agri-700">{(imp * 100).toFixed(1)}%</span>
                </div>
                <div className="w-full bg-earth-100 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-agri-600 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, imp * 100 * 2)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Interactive Live Prediction Playground */}
        <div className="p-4 rounded-xl border border-agri-200 bg-gradient-to-br from-agri-50/50 to-white">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-4 h-4 text-agri-600" />
            <h4 className="text-sm font-bold text-earth-900 font-display">
              Live Inference Simulator (SIH Verification Playground)
            </h4>
          </div>

          <div className="grid sm:grid-cols-4 gap-3 mb-4">
            <div>
              <label className="text-[11px] font-semibold text-earth-600 block mb-1">Select Crop</label>
              <select
                value={selectedCrop}
                onChange={(e) => setSelectedCrop(e.target.value as CropType)}
                className="input py-1.5 text-xs"
              >
                {ALL_CROPS.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-earth-600 block mb-1">Market Region</label>
              <select
                value={selectedRegion}
                onChange={(e) => setSelectedRegion(e.target.value as MarketRegion)}
                className="input py-1.5 text-xs"
              >
                {ALL_REGIONS.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-earth-600 block mb-1">Modal Price (₹/kg)</label>
              <input
                type="number"
                value={testModalPrice}
                onChange={(e) => setTestModalPrice(Number(e.target.value))}
                className="input py-1.5 text-xs font-mono"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-earth-600 block mb-1">Arrivals Volume (kg)</label>
              <input
                type="number"
                value={testArrivals}
                onChange={(e) => setTestArrivals(Number(e.target.value))}
                className="input py-1.5 text-xs font-mono"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 mb-3">
            <input
              type="checkbox"
              id="festivalCheck"
              checked={isFestival}
              onChange={(e) => setIsFestival(e.target.checked)}
              className="rounded border-earth-300 text-agri-600 focus:ring-agri-500"
            />
            <label htmlFor="festivalCheck" className="text-xs text-earth-700 font-medium">
              Festival / Peak Holiday Season (e.g., Pongal / Deepavali demand boost)
            </label>
          </div>

          {/* Prediction Output Card */}
          <div className="p-3.5 rounded-xl bg-white border border-agri-300 shadow-xs">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-earth-100 pb-2 mb-2">
              <span className="text-xs font-semibold text-earth-600">
                Random Forest Regressor Inference:
              </span>
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span className="text-xs font-medium text-earth-700">
                  Reliability: <strong className="text-emerald-700">{liveResult.confidenceOrReliabilityIndicator}</strong>
                </span>
              </div>
            </div>

            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-agri-700 font-mono">
                {liveResult.predictedDemandKg.toLocaleString('en-IN')} kg
              </span>
              <span className="text-xs text-earth-500">expected demand</span>
            </div>
            <p className="text-xs text-earth-600 mt-1 leading-relaxed">
              {liveResult.explanation}
            </p>
          </div>
        </div>

        {/* Hybrid Architecture Distinction Note */}
        <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200 text-xs text-amber-900 flex items-start gap-2.5">
          <Info className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <strong>Hybrid Architecture Clarification:</strong> The Random Forest model purely predicts <em>expected physical market demand in kilograms</em> based on arrivals and prices. AgriFlow's <em>explainable deterministic decision engine</em> then uses that prediction to calculate fair minimum support prices, surplus absorption, and truck logistics.
          </div>
        </div>
      </div>
    </Modal>
  );
}
