import { Matrix, choleskyDecomposition, ensure2D } from '../../utils/matrix';
import { Kernel } from './kernels/base';
import { GaussianProcessOptions, PredictionResult } from '../../types/algorithms';

export class GaussianProcessRegressor {
  private kernel: Kernel;
  private alpha: number;
  private XTrain?: Matrix;
  private yTrain?: number[];
  private L?: Matrix;
  private alphaVector?: number[];

  constructor(kernel: Kernel, options: GaussianProcessOptions = {}) {
    this.kernel = kernel;
    this.alpha = options.alpha || 1e-10;
  }

  public fit(X: number[] | number[][], y: number[]): void {
    this.XTrain = ensure2D(X);
    this.yTrain = [...y];

    const K = this.kernel.call(this.XTrain);
    
    // Add noise to diagonal
    for (let i = 0; i < K.rows; i++) {
      K.set(i, i, K.get(i, i) + this.alpha);
    }

    try {
      this.L = choleskyDecomposition(K);
    } catch (error) {
      throw new Error(`Failed to compute Cholesky decomposition: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    // Solve L * L^T * alpha = y using forward and back substitution
    this.alphaVector = this.solveCholesky(this.L, this.yTrain);
  }

  public predict(X: number[] | number[][], returnStd = false): PredictionResult {
    if (!this.XTrain || !this.yTrain || !this.L || !this.alphaVector) {
      throw new Error('Model must be fitted before prediction');
    }

    const XTest = ensure2D(X);
    const KStar = this.kernel.call(this.XTrain!, XTest);
    
    // Compute mean prediction
    const mean = new Array(XTest.rows);
    for (let i = 0; i < XTest.rows; i++) {
      mean[i] = 0;
      for (let j = 0; j < this.XTrain!.rows; j++) {
        mean[i] += KStar.get(j, i) * this.alphaVector![j]!;
      }
    }

    const result: PredictionResult = { mean };

    if (returnStd) {
      const std = this.computeStd(XTest, KStar);
      result.std = std;
    }

    return result;
  }

  public sampleY(X: number[] | number[][], nSamples = 1): number[][] {
    if (!this.XTrain || !this.yTrain || !this.L || !this.alphaVector) {
      throw new Error('Model must be fitted before sampling');
    }

    const XTest = ensure2D(X);
    const prediction = this.predict(X, true);
    
    if (!prediction.std) {
      throw new Error('Standard deviation computation failed');
    }

    const samples: number[][] = [];
    for (let i = 0; i < nSamples; i++) {
      const sample = new Array(XTest.rows);
      for (let j = 0; j < XTest.rows; j++) {
        const mean = prediction.mean[j]!;
        const std = prediction.std[j]!;
        sample[j] = mean + std * this.sampleStandardNormal();
      }
      samples.push(sample);
    }

    return samples;
  }

  public logMarginalLikelihood(): number {
    if (!this.XTrain || !this.yTrain || !this.L || !this.alphaVector) {
      throw new Error('Model must be fitted before computing log marginal likelihood');
    }

    let logLikelihood = 0;
    
    // -0.5 * y^T * K^{-1} * y
    for (let i = 0; i < this.yTrain!.length; i++) {
      logLikelihood -= 0.5 * this.yTrain![i]! * this.alphaVector![i]!;
    }
    
    // -0.5 * log|K|
    for (let i = 0; i < this.L!.rows; i++) {
      logLikelihood -= Math.log(this.L!.get(i, i));
    }
    
    // -n/2 * log(2π)
    logLikelihood -= 0.5 * this.yTrain.length * Math.log(2 * Math.PI);
    
    return logLikelihood;
  }

  private computeStd(XTest: Matrix, KStar: Matrix): number[] {
    if (!this.L) {
      throw new Error('Cholesky decomposition not available');
    }

    const std = new Array(XTest.rows);
    
    for (let i = 0; i < XTest.rows; i++) {
      // K_** diagonal element
      const kStarStar = this.kernel.compute(XTest.getRow(i), XTest.getRow(i));
      
      // Solve L * v = k_*
      const kStarColumn = KStar.getColumn(i);
      const v = this.forwardSubstitution(this.L, kStarColumn);
      
      // Compute v^T * v
      let vTv = 0;
      for (let j = 0; j < v.length; j++) {
        vTv += v[j]! * v[j]!;
      }
      
      const variance = kStarStar - vTv;
      std[i] = Math.sqrt(Math.max(0, variance));
    }
    
    return std;
  }

  private solveCholesky(L: Matrix, y: number[]): number[] {
    // Forward substitution: L * z = y
    const z = this.forwardSubstitution(L, y);
    
    // Back substitution: L^T * alpha = z
    return this.backSubstitution(L, z);
  }

  private forwardSubstitution(L: Matrix, b: number[]): number[] {
    const n = L.rows;
    const x = new Array(n);
    
    for (let i = 0; i < n; i++) {
      x[i] = b[i];
      for (let j = 0; j < i; j++) {
        x[i] -= L.get(i, j) * x[j];
      }
      x[i] /= L.get(i, i);
    }
    
    return x;
  }

  private backSubstitution(L: Matrix, b: number[]): number[] {
    const n = L.rows;
    const x = new Array(n);
    
    for (let i = n - 1; i >= 0; i--) {
      x[i] = b[i];
      for (let j = i + 1; j < n; j++) {
        x[i] -= L.get(j, i) * x[j];
      }
      x[i] /= L.get(i, i);
    }
    
    return x;
  }

  private sampleStandardNormal(): number {
    const u1 = Math.random();
    const u2 = Math.random();
    return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
  }
}