import type { CropType } from '@/types';
import type {
  DemandPredictionInput,
  DemandPredictionResult,
  TrainedModelData,
  TreeNode,
  ModelMetrics,
} from './types';
import { extractFeatures } from './preprocessing';
import trainedModelJson from './trainedDemandModel.json';
import { cropPrices, cropDemandBaseline } from '@/utils/aiSimulation';

// Static fall-back metrics in case of corrupt weights
const FALLBACK_METRICS: ModelMetrics = {
  mae: 364,
  rmse: 547,
  r2: 0.968,
  mape: 6.45,
  trainSamples: 960,
  testSamples: 240,
  calculatedAt: '2026-09-10T08:36:00.000Z',
};

// Cached model instance
let loadedModel: TrainedModelData | null = null;

try {
  loadedModel = trainedModelJson as unknown as TrainedModelData;
} catch (err) {
  console.warn('[AgriFlow ML] Error parsing static trainedDemandModel.json:', err);
}

/**
 * Traverse a decision tree node
 */
function traverseNode(x: number[], node: TreeNode): number {
  if (node.isLeaf || node.splitFeature === undefined || node.threshold === undefined) {
    return node.value;
  }
  if (x[node.splitFeature] <= node.threshold) {
    return node.left ? traverseNode(x, node.left) : node.value;
  } else {
    return node.right ? traverseNode(x, node.right) : node.value;
  }
}

/**
 * Supervised Machine Learning Demand Prediction
 * Evaluates the trained Random Forest ensemble against agricultural market features
 */
export function predictDemandML(input: DemandPredictionInput): DemandPredictionResult {
  const crop = input.crop;
  const now = new Date();
  const currentMonth = input.month ?? (now.getMonth() + 1);
  const region = input.marketRegion ?? 'Alandurai Centre';

  // Fallback check
  if (!loadedModel || !Array.isArray(loadedModel.trees) || loadedModel.trees.length === 0) {
    return getFallbackPrediction(input, 'ML model artifact missing or failed to initialize');
  }

  try {
    const baseDemand = cropDemandBaseline[crop] ?? 3500;
    const basePrice = cropPrices[crop] ?? 25;

    const modalPrice = input.modalPrice ?? basePrice;
    const minPrice = Math.round(modalPrice * 0.9);
    const maxPrice = Math.round(modalPrice * 1.1);

    const historicalDemand = input.historicalDemandKg ?? baseDemand;
    const prevWeekDemand = input.previousWeekDemandKg ?? baseDemand;
    const marketArrivals = input.marketArrivalsKg ?? Math.round(baseDemand * 0.95);

    // Indian harvest festival indicator
    const isFestival = input.isFestivalSeason !== undefined
      ? (input.isFestivalSeason ? 1 : 0)
      : (currentMonth === 1 || currentMonth === 4 || currentMonth === 10 || currentMonth === 11 ? 1 : 0);

    // Extract feature vector
    const featureVector = extractFeatures({
      crop,
      month: currentMonth,
      year: 2026,
      historical_demand_kg: historicalDemand,
      previous_week_demand_kg: prevWeekDemand,
      market_arrivals_kg: marketArrivals,
      modal_price: modalPrice,
      minimum_price: minPrice,
      maximum_price: maxPrice,
      festival_or_season_indicator: isFestival,
      market_region: region,
    });

    // Run inference across all trained decision trees
    const treePredictions: number[] = [];
    for (const tree of loadedModel.trees) {
      treePredictions.push(traverseNode(featureVector, tree));
    }

    if (treePredictions.length === 0) {
      return getFallbackPrediction(input, 'Zero tree responses from ensemble');
    }

    const meanPred = treePredictions.reduce((a, b) => a + b, 0) / treePredictions.length;
    const variance =
      treePredictions.reduce((acc, p) => acc + Math.pow(p - meanPred, 2), 0) / treePredictions.length;
    const stdDev = Math.sqrt(variance);

    const predictedDemandKg = Math.round(meanPred);
    const treeSpreadKg = Math.round(stdDev);

    // Model reliability indicator based on ensemble variance and test R²
    const cvRatio = stdDev / (meanPred || 1);
    let reliability = 'High (Tight tree convergence)';
    if (cvRatio > 0.20) {
      reliability = 'Moderate (Higher tree variance across volatile price features)';
    } else if (cvRatio > 0.35) {
      reliability = 'Low (Outlier input values)';
    }

    const explanation = `Random Forest Regression forecast (${loadedModel.trees.length} estimators, R² = ${loadedModel.metadata.metrics.r2}): ` +
      `Predicts ${predictedDemandKg.toLocaleString('en-IN')} kg for ${crop} in ${region}. ` +
      `Ensemble dispersion is ±${treeSpreadKg} kg (${reliability}). Major driving factors: arrivals (${marketArrivals.toLocaleString('en-IN')} kg) ` +
      `and modal price (₹${modalPrice}/kg).`;

    return {
      predictedDemandKg,
      confidenceOrReliabilityIndicator: `${reliability} [±${treeSpreadKg} kg]`,
      modelName: loadedModel.metadata.modelName,
      modelVersion: loadedModel.metadata.modelVersion,
      modelType: loadedModel.metadata.modelType,
      inputFeatures: {
        Crop: crop,
        Month: currentMonth,
        Region: region,
        'Modal Price': `₹${modalPrice}/kg`,
        'Market Arrivals': `${marketArrivals.toLocaleString('en-IN')} kg`,
        'Prev Week Demand': `${prevWeekDemand.toLocaleString('en-IN')} kg`,
        'Festival Boost': isFestival ? 'Yes' : 'No',
      },
      timestamp: new Date().toISOString(),
      explanation,
      isFallback: false,
      treeSpreadKg,
      metrics: loadedModel.metadata.metrics,
    };
  } catch (error) {
    console.error('[AgriFlow ML] Inference failed:', error);
    return getFallbackPrediction(input, (error as Error).message);
  }
}

/**
 * Safe, explicit fallback when ML model cannot run
 */
function getFallbackPrediction(input: DemandPredictionInput, reason: string): DemandPredictionResult {
  const crop = input.crop;
  const baseDemand = cropDemandBaseline[crop] ?? 3500;
  const fallbackDemand = Math.round(baseDemand * 1.05);

  return {
    predictedDemandKg: fallbackDemand,
    confidenceOrReliabilityIndicator: 'Explainable Fallback Model (Non-ML)',
    modelName: 'Deterministic Baseline Fallback Engine',
    modelVersion: 'v1.0-fallback',
    modelType: 'Fallback Deterministic',
    inputFeatures: {
      Crop: crop,
      'Fallback Reason': reason,
      'Baseline Volume': `${baseDemand} kg`,
    },
    timestamp: new Date().toISOString(),
    explanation: 'ML forecast unavailable — using explainable fallback model.',
    isFallback: true,
    treeSpreadKg: 0,
    metrics: FALLBACK_METRICS,
  };
}

/**
 * Allow runtime dynamic model update (e.g., after explicit admin retraining)
 */
export function setRuntimeTrainedModel(model: TrainedModelData): void {
  loadedModel = model;
}

export function getTrainedModelMetadata() {
  return loadedModel?.metadata ?? null;
}
