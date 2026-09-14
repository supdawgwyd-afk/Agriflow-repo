import type { CropType } from '@/types';

export type MarketRegion = 'Pollachi Mandi' | 'Alandurai Centre' | 'Coimbatore Central' | 'Kinathukadavu APMC';

export interface AgriMarketRecord {
  id: string;
  crop: CropType;
  month: number; // 1-12
  year: number; // 2024, 2025, 2026
  historical_demand_kg: number;
  previous_week_demand_kg: number;
  market_arrivals_kg: number;
  modal_price: number;
  minimum_price: number;
  maximum_price: number;
  festival_or_season_indicator: number; // 0 or 1
  market_region: MarketRegion;
  target_demand_kg: number; // Ground truth target
}

export interface PreprocessedFeatures {
  vector: number[];
  featureNames: string[];
}

export interface ModelMetrics {
  mae: number;
  rmse: number;
  r2: number;
  mape: number;
  trainSamples: number;
  testSamples: number;
  calculatedAt: string;
}

export interface ModelMetadata {
  modelVersion: string;
  modelName: string;
  modelType: 'Random Forest Regression' | 'Extra Trees Regression' | 'Fallback Deterministic';
  datasetName: string;
  datasetType: 'REAL' | 'SYNTHETIC TRAINING DATA' | 'MIXED';
  trainingDate: string;
  hyperparameters: {
    nEstimators: number;
    maxDepth: number;
    minSamplesSplit: number;
    featuresPerSplit: number;
    randomSeed: number;
    trainTestSplitRatio: number;
  };
  metrics: ModelMetrics;
  featureNames: string[];
  featureImportances: Record<string, number>;
}

export interface TreeNode {
  isLeaf: boolean;
  value: number; // Leaf prediction
  splitFeature?: number;
  splitFeatureName?: string;
  threshold?: number;
  left?: TreeNode;
  right?: TreeNode;
  samples: number;
  varianceReduction?: number;
}

export interface TrainedModelData {
  metadata: ModelMetadata;
  trees: TreeNode[];
  categoricalEncodings: {
    crops: Record<string, number>;
    regions: Record<string, number>;
  };
  featureNames: string[];
}

export interface DemandPredictionInput {
  crop: CropType;
  month?: number;
  marketRegion?: MarketRegion;
  modalPrice?: number;
  marketArrivalsKg?: number;
  previousWeekDemandKg?: number;
  historicalDemandKg?: number;
  isFestivalSeason?: boolean;
}

export interface DemandPredictionResult {
  predictedDemandKg: number;
  confidenceOrReliabilityIndicator: string;
  modelName: string;
  modelVersion: string;
  modelType: string;
  inputFeatures: Record<string, string | number>;
  timestamp: string;
  explanation: string;
  isFallback: boolean;
  treeSpreadKg: number; // Standard deviation among trees
  metrics: ModelMetrics;
}
