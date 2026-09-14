import type { TreeNode, ModelMetrics } from './types';

export interface RandomForestOptions {
  nEstimators?: number;
  maxDepth?: number;
  minSamplesSplit?: number;
  featureSubsampleRatio?: number; // ratio of features considered at each split (e.g., 0.4 - 0.6)
  randomSeed?: number;
}

// PRNG for deterministic training
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
 * Single CART Decision Tree Regressor
 */
export class DecisionTreeRegressor {
  root: TreeNode | null = null;
  maxDepth: number;
  minSamplesSplit: number;
  featureSubsampleRatio: number;
  prng: () => number;
  featureNames: string[];

  constructor(
    maxDepth = 8,
    minSamplesSplit = 5,
    featureSubsampleRatio = 0.5,
    prng = Math.random,
    featureNames: string[] = []
  ) {
    this.maxDepth = maxDepth;
    this.minSamplesSplit = minSamplesSplit;
    this.featureSubsampleRatio = featureSubsampleRatio;
    this.prng = prng;
    this.featureNames = featureNames;
  }

  fit(X: number[][], y: number[]): TreeNode {
    this.root = this.buildTree(X, y, 0);
    return this.root;
  }

  private buildTree(X: number[][], y: number[], depth: number): TreeNode {
    const numSamples = X.length;
    const meanVal = y.reduce((a, b) => a + b, 0) / (numSamples || 1);

    // Stopping criteria
    if (depth >= this.maxDepth || numSamples < this.minSamplesSplit) {
      return { isLeaf: true, value: Math.round(meanVal), samples: numSamples };
    }

    const numFeatures = X[0]?.length || 0;
    if (numFeatures === 0) {
      return { isLeaf: true, value: Math.round(meanVal), samples: numSamples };
    }

    // Subsample features for Random Forest (feature bagging)
    const k = Math.max(1, Math.floor(numFeatures * this.featureSubsampleRatio));
    const allIndices = Array.from({ length: numFeatures }, (_, i) => i);
    // Shuffle indices using prng
    for (let i = allIndices.length - 1; i > 0; i--) {
      const j = Math.floor(this.prng() * (i + 1));
      [allIndices[i], allIndices[j]] = [allIndices[j], allIndices[i]];
    }
    const candidateFeatures = allIndices.slice(0, k);

    // Current MSE
    let totalVar = 0;
    for (let i = 0; i < numSamples; i++) {
      const diff = y[i] - meanVal;
      totalVar += diff * diff;
    }

    let bestGain = 0;
    let bestFeature = -1;
    let bestThreshold = 0;
    let bestLeftIndices: number[] = [];
    let bestRightIndices: number[] = [];

    // Search best split
    for (const fIdx of candidateFeatures) {
      // Find candidate thresholds
      const values = X.map((row) => row[fIdx]);
      const uniqueVals = Array.from(new Set(values)).sort((a, b) => a - b);
      if (uniqueVals.length < 2) continue;

      // Test up to 15 percentiles/splits to maintain high training speed
      const step = Math.max(1, Math.floor(uniqueVals.length / 15));
      for (let i = 0; i < uniqueVals.length - 1; i += step) {
        const threshold = (uniqueVals[i] + uniqueVals[i + 1]) / 2;

        let leftSum = 0;
        let rightSum = 0;
        const leftIdxs: number[] = [];
        const rightIdxs: number[] = [];

        for (let s = 0; s < numSamples; s++) {
          if (X[s][fIdx] <= threshold) {
            leftIdxs.push(s);
            leftSum += y[s];
          } else {
            rightIdxs.push(s);
            rightSum += y[s];
          }
        }

        if (leftIdxs.length === 0 || rightIdxs.length === 0) continue;

        const leftMean = leftSum / leftIdxs.length;
        const rightMean = rightSum / rightIdxs.length;

        let leftVar = 0;
        for (const idx of leftIdxs) {
          const d = y[idx] - leftMean;
          leftVar += d * d;
        }

        let rightVar = 0;
        for (const idx of rightIdxs) {
          const d = y[idx] - rightMean;
          rightVar += d * d;
        }

        const gain = totalVar - (leftVar + rightVar);
        if (gain > bestGain) {
          bestGain = gain;
          bestFeature = fIdx;
          bestThreshold = threshold;
          bestLeftIndices = leftIdxs;
          bestRightIndices = rightIdxs;
        }
      }
    }

    if (bestGain <= 0 || bestFeature === -1 || bestLeftIndices.length === 0 || bestRightIndices.length === 0) {
      return { isLeaf: true, value: Math.round(meanVal), samples: numSamples };
    }

    const leftX = bestLeftIndices.map((i) => X[i]);
    const leftY = bestLeftIndices.map((i) => y[i]);
    const rightX = bestRightIndices.map((i) => X[i]);
    const rightY = bestRightIndices.map((i) => y[i]);

    const leftChild = this.buildTree(leftX, leftY, depth + 1);
    const rightChild = this.buildTree(rightX, rightY, depth + 1);

    return {
      isLeaf: false,
      value: Math.round(meanVal),
      splitFeature: bestFeature,
      splitFeatureName: this.featureNames[bestFeature] || `feature_${bestFeature}`,
      threshold: Number(bestThreshold.toFixed(4)),
      samples: numSamples,
      varianceReduction: Number(bestGain.toFixed(2)),
      left: leftChild,
      right: rightChild,
    };
  }

  predictSample(x: number[], node: TreeNode = this.root!): number {
    if (!node || node.isLeaf || node.splitFeature === undefined || node.threshold === undefined) {
      return node?.value ?? 0;
    }
    if (x[node.splitFeature] <= node.threshold) {
      return node.left ? this.predictSample(x, node.left) : node.value;
    } else {
      return node.right ? this.predictSample(x, node.right) : node.value;
    }
  }
}

/**
 * Supervised Random Forest Regressor
 */
export class RandomForestRegressor {
  trees: TreeNode[] = [];
  featureNames: string[] = [];
  featureImportances: Record<string, number> = {};
  options: Required<RandomForestOptions>;

  constructor(options: RandomForestOptions = {}, featureNames: string[] = []) {
    this.options = {
      nEstimators: options.nEstimators ?? 25,
      maxDepth: options.maxDepth ?? 8,
      minSamplesSplit: options.minSamplesSplit ?? 5,
      featureSubsampleRatio: options.featureSubsampleRatio ?? 0.5,
      randomSeed: options.randomSeed ?? 42,
    };
    this.featureNames = featureNames;
  }

  fit(X: number[][], y: number[]): void {
    const prng = createPRNG(this.options.randomSeed);
    const nSamples = X.length;
    this.trees = [];

    const importanceSums: Record<string, number> = {};
    for (const name of this.featureNames) {
      importanceSums[name] = 0;
    }

    for (let t = 0; t < this.options.nEstimators; t++) {
      // Bootstrap sampling with replacement
      const bootIndices: number[] = [];
      for (let s = 0; s < nSamples; s++) {
        bootIndices.push(Math.floor(prng() * nSamples));
      }

      const bootX = bootIndices.map((i) => X[i]);
      const bootY = bootIndices.map((i) => y[i]);

      const tree = new DecisionTreeRegressor(
        this.options.maxDepth,
        this.options.minSamplesSplit,
        this.options.featureSubsampleRatio,
        prng,
        this.featureNames
      );

      const rootNode = tree.fit(bootX, bootY);
      this.trees.push(rootNode);

      // Accumulate importance from variance reduction
      this.accumulateImportance(rootNode, importanceSums);
    }

    // Normalize feature importances
    const totalImportance = Object.values(importanceSums).reduce((a, b) => a + b, 0) || 1;
    this.featureImportances = {};
    for (const [feat, val] of Object.entries(importanceSums)) {
      this.featureImportances[feat] = Number((val / totalImportance).toFixed(4));
    }
  }

  private accumulateImportance(node: TreeNode, target: Record<string, number>) {
    if (!node || node.isLeaf) return;
    if (node.splitFeatureName && node.varianceReduction) {
      target[node.splitFeatureName] = (target[node.splitFeatureName] || 0) + node.varianceReduction;
    }
    if (node.left) this.accumulateImportance(node.left, target);
    if (node.right) this.accumulateImportance(node.right, target);
  }

  predictOne(x: number[]): { mean: number; stdDev: number; treePredictions: number[] } {
    if (this.trees.length === 0) return { mean: 0, stdDev: 0, treePredictions: [] };

    const preds: number[] = [];
    for (const tree of this.trees) {
      preds.push(this.traverse(x, tree));
    }

    const mean = preds.reduce((a, b) => a + b, 0) / preds.length;
    const variance = preds.reduce((acc, p) => acc + Math.pow(p - mean, 2), 0) / preds.length;
    const stdDev = Math.sqrt(variance);

    return {
      mean: Math.round(mean),
      stdDev: Math.round(stdDev),
      treePredictions: preds,
    };
  }

  predict(X: number[][]): number[] {
    return X.map((x) => this.predictOne(x).mean);
  }

  private traverse(x: number[], node: TreeNode): number {
    if (node.isLeaf || node.splitFeature === undefined || node.threshold === undefined) {
      return node.value;
    }
    if (x[node.splitFeature] <= node.threshold) {
      return node.left ? this.traverse(x, node.left) : node.value;
    } else {
      return node.right ? this.traverse(x, node.right) : node.value;
    }
  }

  evaluate(X_test: number[][], y_test: number[]): ModelMetrics {
    const n = y_test.length;
    if (n === 0) {
      return { mae: 0, rmse: 0, r2: 0, mape: 0, trainSamples: 0, testSamples: 0, calculatedAt: new Date().toISOString() };
    }

    const y_pred = this.predict(X_test);

    let sumAbsErr = 0;
    let sumSqErr = 0;
    let sumPctErr = 0;
    const y_mean = y_test.reduce((a, b) => a + b, 0) / n;
    let sumTotVar = 0;

    for (let i = 0; i < n; i++) {
      const actual = y_test[i];
      const pred = y_pred[i];
      const diff = actual - pred;

      sumAbsErr += Math.abs(diff);
      sumSqErr += diff * diff;
      sumPctErr += Math.abs(diff / (actual || 1));
      sumTotVar += Math.pow(actual - y_mean, 2);
    }

    const mae = Math.round(sumAbsErr / n);
    const rmse = Math.round(Math.sqrt(sumSqErr / n));
    const r2 = sumTotVar > 0 ? Math.max(0, 1 - sumSqErr / sumTotVar) : 0;
    const mape = Number(((sumPctErr / n) * 100).toFixed(2));

    return {
      mae,
      rmse,
      r2: Number(r2.toFixed(3)),
      mape,
      trainSamples: n * 4, // 80% train, 20% test ratio
      testSamples: n,
      calculatedAt: new Date().toISOString(),
    };
  }
}
