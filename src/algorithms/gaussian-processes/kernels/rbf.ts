import { Kernel } from './base';

export class RBF extends Kernel {
  public readonly lengthScale: number;
  public readonly variance: number;

  constructor(lengthScale = 1.0, variance = 1.0) {
    super({ length_scale: lengthScale, variance });
    this.lengthScale = lengthScale;
    this.variance = variance;
  }

  public override compute(x1: number[], x2: number[]): number {
    const distance = this.euclideanDistance(x1, x2);
    return this.variance * Math.exp(-0.5 * Math.pow(distance / this.lengthScale, 2));
  }

  public override getParams(): { length_scale: number; variance: number } {
    return {
      length_scale: this.lengthScale,
      variance: this.variance,
    };
  }
}