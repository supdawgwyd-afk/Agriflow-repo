import type { AgriMarketRecord, MarketRegion } from './types';
import type { CropType } from '@/types';
import { ALL_CROPS, ALL_REGIONS } from './dataset';

export interface PreprocessingConfig {
  splitRatio: number; // 0.8 default
  splitStrategy: 'chronological' | 'random';
  randomSeed: number;
}

export interface PreprocessedDataset {
  X_train: number[][];
  y_train: number[];
  X_test: number[][];
  y_test: number[];
  featureNames: string[];
  trainRecords: AgriMarketRecord[];
  testRecords: AgriMarketRecord[];
}

export const FEATURE_NAMES: string[] = [
  // Numeric engineered features
  'historical_demand_kg',
  'previous_week_demand_kg',
  'market_arrivals_kg',
  'modal_price',
  'price_spread',
  'arrival_to_demand_ratio',
  'month_sin',
  'month_cos',
  'festival_indicator',
  // One-hot encoded crops (10)
  ...ALL_CROPS.map((c) => `crop_${c}`),
  // One-hot encoded regions (4)
  ...ALL_REGIONS.map((r) => `region_${r.replace(/\s+/g, '_')}`),
];

/**
 * Extract feature vector from a record
 */
export function extractFeatures(
  record: Omit<AgriMarketRecord, 'id' | 'target_demand_kg'>
): number[] {
  const priceSpread = Math.max(0, record.maximum_price - record.minimum_price);
  const arrivalRatio = record.market_arrivals_kg / Math.max(1, record.historical_demand_kg);
  const angle = (2 * Math.PI * (record.month - 1)) / 12;
  const monthSin = Math.sin(angle);
  const monthCos = Math.cos(angle);

  const vector: number[] = [
    record.historical_demand_kg,
    record.previous_week_demand_kg,
    record.market_arrivals_kg,
    record.modal_price,
    priceSpread,
    arrivalRatio,
    Number(monthSin.toFixed(4)),
    Number(monthCos.toFixed(4)),
    record.festival_or_season_indicator,
  ];

  // Crop One-Hot
  for (const crop of ALL_CROPS) {
    vector.push(record.crop === crop ? 1 : 0);
  }

  // Region One-Hot
  for (const region of ALL_REGIONS) {
    vector.push(record.market_region === region ? 1 : 0);
  }

  return vector;
}

/**
 * Preprocess entire dataset with reproducible 80/20 train/test split
 */
export function preprocessDataset(
  records: AgriMarketRecord[],
  config: PreprocessingConfig = {
    splitRatio: 0.8,
    splitStrategy: 'chronological',
    randomSeed: 42,
  }
): PreprocessedDataset {
  let trainRecords: AgriMarketRecord[] = [];
  let testRecords: AgriMarketRecord[] = [];

  if (config.splitStrategy === 'chronological') {
    // Chronological: Sort by year and month
    const sorted = [...records].sort((a, b) => {
      if (a.year !== b.year) return a.year - b.year;
      return a.month - b.month;
    });

    const splitIndex = Math.floor(sorted.length * config.splitRatio);
    trainRecords = sorted.slice(0, splitIndex);
    testRecords = sorted.slice(splitIndex);
  } else {
    // Deterministic random split using seed
    let seed = config.randomSeed;
    const rng = () => {
      seed = (seed * 9301 + 49297) % 233280;
      return seed / 233280;
    };

    const shuffled = [...records].sort(() => rng() - 0.5);
    const splitIndex = Math.floor(shuffled.length * config.splitRatio);
    trainRecords = shuffled.slice(0, splitIndex);
    testRecords = shuffled.slice(splitIndex);
  }

  const X_train = trainRecords.map((r) => extractFeatures(r));
  const y_train = trainRecords.map((r) => r.target_demand_kg);

  const X_test = testRecords.map((r) => extractFeatures(r));
  const y_test = testRecords.map((r) => r.target_demand_kg);

  return {
    X_train,
    y_train,
    X_test,
    y_test,
    featureNames: FEATURE_NAMES,
    trainRecords,
    testRecords,
  };
}
