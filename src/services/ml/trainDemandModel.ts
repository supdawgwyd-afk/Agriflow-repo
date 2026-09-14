import { agricultureDataService } from './agricultureDataService';
import { preprocessDataset, FEATURE_NAMES } from './preprocessing';
import { RandomForestRegressor } from './randomForest';
import type { TrainedModelData, ModelMetadata } from './types';
import { DATASET_NAME, DATASET_TYPE } from './dataset';

export const CURRENT_MODEL_VERSION = 'AgriFlow-Demand-v1';

export async function trainDemandModel(options: {
  nEstimators?: number;
  maxDepth?: number;
  minSamplesSplit?: number;
  splitRatio?: number;
  randomSeed?: number;
} = {}): Promise<TrainedModelData> {
  const nEstimators = options.nEstimators ?? 30;
  const maxDepth = options.maxDepth ?? 8;
  const minSamplesSplit = options.minSamplesSplit ?? 5;
  const splitRatio = options.splitRatio ?? 0.8;
  const randomSeed = options.randomSeed ?? 42;

  // 1. Fetch data
  const records = await agricultureDataService.getMarketRecords();

  // 2. Preprocess & 80/20 train-test split
  const preprocessed = preprocessDataset(records, {
    splitRatio,
    splitStrategy: 'chronological',
    randomSeed,
  });

  // 3. Train Random Forest
  const rf = new RandomForestRegressor(
    {
      nEstimators,
      maxDepth,
      minSamplesSplit,
      featureSubsampleRatio: 0.5,
      randomSeed,
    },
    preprocessed.featureNames
  );

  rf.fit(preprocessed.X_train, preprocessed.y_train);

  // 4. Real evaluation on held-out test data
  const metrics = rf.evaluate(preprocessed.X_test, preprocessed.y_test);
  metrics.trainSamples = preprocessed.X_train.length;
  metrics.testSamples = preprocessed.X_test.length;

  // 5. Metadata
  const metadata: ModelMetadata = {
    modelVersion: CURRENT_MODEL_VERSION,
    modelName: 'AgriFlow Supervised Random Forest Demand Predictor',
    modelType: 'Random Forest Regression',
    datasetName: DATASET_NAME,
    datasetType: DATASET_TYPE,
    trainingDate: '2026-09-10',
    hyperparameters: {
      nEstimators,
      maxDepth,
      minSamplesSplit,
      featuresPerSplit: Math.max(1, Math.floor(preprocessed.featureNames.length * 0.5)),
      randomSeed,
      trainTestSplitRatio: splitRatio,
    },
    metrics,
    featureNames: preprocessed.featureNames,
    featureImportances: rf.featureImportances,
  };

  return {
    metadata,
    trees: rf.trees,
    categoricalEncodings: {
      crops: {
        Tomato: 0, Potato: 1, Onion: 2, Rice: 3, Maize: 4,
        Chilli: 5, Wheat: 6, Cotton: 7, Sugarcane: 8, Groundnut: 9,
      },
      regions: {
        'Coimbatore Central': 0,
        'Pollachi Mandi': 1,
        'Alandurai Centre': 2,
        'Kinathukadavu APMC': 3,
      },
    },
    featureNames: FEATURE_NAMES,
  };
}
