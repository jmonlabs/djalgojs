import { Matrix } from '../../utils/matrix';
import { RBF } from './kernels/rbf';
import { sampleMultivariateNormal } from './utils';

export interface KernelGenerationOptions {
  walkAround?: boolean;
  length?: number;
  lengthScale?: number;
  amplitude?: number;
  noiseLevel?: number;
}

export class KernelGenerator {
  private data: number[];
  private lengthScale: number;
  private amplitude: number;
  private noiseLevel: number;
  private walkAround: boolean;

  constructor(
    data: number[] = [],
    lengthScale = 1.0,
    amplitude = 1.0,
    noiseLevel = 0.1,
    walkAround = false
  ) {
    this.data = [...data];
    this.lengthScale = lengthScale;
    this.amplitude = amplitude;
    this.noiseLevel = noiseLevel;
    this.walkAround = walkAround;
  }

  public generate(options: KernelGenerationOptions = {}): number[] {
    const length = options.length || 100;
    const lengthScale = options.lengthScale || this.lengthScale;
    const amplitude = options.amplitude || this.amplitude;
    const noiseLevel = options.noiseLevel || this.noiseLevel;

    // Create input points
    const X = Array.from({ length }, (_, i) => [i]);
    const XMatrix = new Matrix(X);

    // Create RBF kernel
    const kernel = new RBF(lengthScale, amplitude);
    const K = kernel.call(XMatrix);

    // Add noise to diagonal
    for (let i = 0; i < K.rows; i++) {
      K.set(i, i, K.get(i, i) + noiseLevel);
    }

    // Sample from multivariate normal
    const mean = new Array(length).fill(0);
    const sample = sampleMultivariateNormal(mean, K);

    if (this.walkAround && this.data.length > 0) {
      // Modify sample to walk around existing data
      const dataLength = this.data.length;
      for (let i = 0; i < Math.min(length, dataLength); i++) {
        sample[i] = this.data[i]! + sample[i]! * 0.1;
      }
    }

    return sample;
  }

  public rbfKernel(x1: number[], x2: number[]): number {
    let distanceSquared = 0;
    for (let i = 0; i < x1.length; i++) {
      distanceSquared += Math.pow(x1[i]! - x2[i]!, 2);
    }
    return this.amplitude * Math.exp(-distanceSquared / (2 * Math.pow(this.lengthScale, 2)));
  }

  public setData(data: number[]): void {
    this.data = [...data];
  }

  public getData(): number[] {
    return [...this.data];
  }

  public setLengthScale(lengthScale: number): void {
    this.lengthScale = lengthScale;
  }

  public setAmplitude(amplitude: number): void {
    this.amplitude = amplitude;
  }

  public setNoiseLevel(noiseLevel: number): void {
    this.noiseLevel = noiseLevel;
  }
}