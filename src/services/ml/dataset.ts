import type { AgriMarketRecord, MarketRegion } from './types';
import type { CropType } from '@/types';

export const DATASET_NAME = 'AgriFlow-Mandi-TamilNadu-Historical-v1';
export const DATASET_TYPE = 'SYNTHETIC TRAINING DATA' as const;
export const DATASET_DESCRIPTION = 
  'Reproducible synthetic training dataset modeled on Tamil Nadu APMC mandi arrival-demand dynamics for 10 crops across 30 months (2024-2026). Generated with deterministic agro-economic formulas.';

export const ALL_CROPS: CropType[] = [
  'Tomato',
  'Potato',
  'Onion',
  'Rice',
  'Maize',
  'Chilli',
  'Wheat',
  'Cotton',
  'Sugarcane',
  'Groundnut',
];

export const ALL_REGIONS: MarketRegion[] = [
  'Coimbatore Central',
  'Pollachi Mandi',
  'Alandurai Centre',
  'Kinathukadavu APMC',
];

// Base crop economic profiles for realistic synthetic generation
interface CropProfile {
  baseDemandKg: number;
  basePrice: number;
  priceVolatility: number;
  peakMonths: number[]; // e.g. [3, 4, 5] for summer, [10, 11] for festival season
  arrivalElasticity: number; // effect of arrival surplus on demand/price
}

const CROP_PROFILES: Record<CropType, CropProfile> = {
  Tomato: { baseDemandKg: 4200, basePrice: 30, priceVolatility: 0.35, peakMonths: [3, 4, 5, 10, 11], arrivalElasticity: -0.25 },
  Potato: { baseDemandKg: 5500, basePrice: 18, priceVolatility: 0.15, peakMonths: [1, 2, 11, 12], arrivalElasticity: -0.15 },
  Onion: { baseDemandKg: 3400, basePrice: 26, priceVolatility: 0.40, peakMonths: [9, 10, 11], arrivalElasticity: -0.30 },
  Rice: { baseDemandKg: 8500, basePrice: 40, priceVolatility: 0.10, peakMonths: [1, 2, 9, 10], arrivalElasticity: -0.10 },
  Maize: { baseDemandKg: 3900, basePrice: 22, priceVolatility: 0.18, peakMonths: [7, 8, 9], arrivalElasticity: -0.15 },
  Chilli: { baseDemandKg: 1600, basePrice: 92, priceVolatility: 0.28, peakMonths: [1, 2, 3, 10], arrivalElasticity: -0.20 },
  Wheat: { baseDemandKg: 6400, basePrice: 28, priceVolatility: 0.12, peakMonths: [3, 4, 5], arrivalElasticity: -0.10 },
  Cotton: { baseDemandKg: 2900, basePrice: 56, priceVolatility: 0.22, peakMonths: [10, 11, 12], arrivalElasticity: -0.18 },
  Sugarcane: { baseDemandKg: 5800, basePrice: 35, priceVolatility: 0.15, peakMonths: [12, 1, 2], arrivalElasticity: -0.12 },
  Groundnut: { baseDemandKg: 2700, basePrice: 48, priceVolatility: 0.20, peakMonths: [1, 2, 8, 9], arrivalElasticity: -0.16 },
};

const REGION_DEMAND_WEIGHT: Record<MarketRegion, number> = {
  'Coimbatore Central': 1.35, // Metropolitan consumption hub
  'Pollachi Mandi': 1.10,     // Major agro trade centre
  'Alandurai Centre': 0.85,   // Cluster collection node
  'Kinathukadavu APMC': 0.90, // Sub-regional distribution market
};

// Deterministic Pseudo-Random Number Generator (Mulberry32)
function createPRNG(seed: number) {
  let s = seed;
  return function next(): number {
    s |= 0;
    s = (s + 0x6D2B79F5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Generate a reproducible, realistic synthetic dataset for supervised training
 */
export function generateAgriDemandDataset(seed: number = 42): AgriMarketRecord[] {
  const prng = createPRNG(seed);
  const records: AgriMarketRecord[] = [];

  // Years: 2024 (12 months), 2025 (12 months), 2026 (first 6 months) = 30 months
  const timeline: { year: number; month: number }[] = [];
  for (let m = 1; m <= 12; m++) timeline.push({ year: 2024, month: m });
  for (let m = 1; m <= 12; m++) timeline.push({ year: 2025, month: m });
  for (let m = 1; m <= 6; m++) timeline.push({ year: 2026, month: m });

  let idCounter = 1;

  for (const crop of ALL_CROPS) {
    const profile = CROP_PROFILES[crop];

    for (const region of ALL_REGIONS) {
      const regionMultiplier = REGION_DEMAND_WEIGHT[region];
      let previousDemand = profile.baseDemandKg * regionMultiplier;

      for (const time of timeline) {
        const { year, month } = time;

        // Indian agricultural festivals: Pongal (month 1), Tamil New Year (month 4), Deepavali/Navratri (months 10, 11)
        const isFestival = (month === 1 || month === 4 || month === 10 || month === 11) ? 1 : 0;
        const festivalDemandBoost = isFestival ? (1 + 0.18 + prng() * 0.12) : 1.0;

        // Seasonality factor
        const isPeak = profile.peakMonths.includes(month);
        const seasonalFactor = isPeak ? (1 + 0.22 + prng() * 0.08) : (1 - 0.08 - prng() * 0.06);

        // Economic arrival-price-demand dynamics
        const arrivalVariance = 0.85 + prng() * 0.35;
        const marketArrivals = Math.round(profile.baseDemandKg * regionMultiplier * seasonalFactor * arrivalVariance);

        // Price variations
        const priceVariance = (prng() - 0.5) * 2 * profile.priceVolatility;
        const modalPrice = Math.max(10, Math.round(profile.basePrice * (1 + priceVariance)));
        const minPrice = Math.max(8, Math.round(modalPrice * (0.88 - prng() * 0.06)));
        const maxPrice = Math.round(modalPrice * (1.12 + prng() * 0.08));

        // Historical baseline with slight noise
        const historicalDemand = Math.round(profile.baseDemandKg * regionMultiplier * (0.95 + prng() * 0.1));
        const prevWeekDemand = Math.round(previousDemand * (0.93 + prng() * 0.14));

        // Ground truth Target Demand (kg):
        // Dependent on:
        // - Crop baseline & region capacity
        // - Seasonality & peak harvesting
        // - Festival consumption
        // - Price elasticity: higher modal price slightly dampens retail volume, lower price expands processing demand
        // - Previous week momentum
        const priceEffect = 1 - (priceVariance * 0.3);
        const momentumEffect = (prevWeekDemand / (profile.baseDemandKg * regionMultiplier)) * 0.25 + 0.75;
        const rawTarget = profile.baseDemandKg * regionMultiplier * seasonalFactor * festivalDemandBoost * priceEffect * momentumEffect;
        
        // Realistic market friction and noise (±4%)
        const noise = 0.96 + prng() * 0.08;
        const targetDemand = Math.round(rawTarget * noise);

        records.push({
          id: `REC-${String(idCounter++).padStart(5, '0')}`,
          crop,
          month,
          year,
          historical_demand_kg: historicalDemand,
          previous_week_demand_kg: prevWeekDemand,
          market_arrivals_kg: marketArrivals,
          modal_price: modalPrice,
          minimum_price: minPrice,
          maximum_price: maxPrice,
          festival_or_season_indicator: isFestival,
          market_region: region,
          target_demand_kg: targetDemand,
        });

        // Store for next step's momentum
        previousDemand = targetDemand;
      }
    }
  }

  return records;
}
