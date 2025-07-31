import { Kernel } from './base';

export class RationalQuadratic extends Kernel {
  public readonly lengthScale: number;
  public readonly alpha: number;
  public readonly variance: number;

  constructor(lengthScale = 1.0, alpha = 1.0, variance = 1.0) {
    super({ length_scale: lengthScale, alpha, variance });
    this.lengthScale = lengthScale;
    this.alpha = alpha;
    this.variance = variance;
  }

  public override compute(x1: number[], x2: number[]): number {
    const distanceSquared = this.squaredEuclideanDistance(x1, x2);
    const term = 1 + distanceSquared / (2 * this.alpha * Math.pow(this.lengthScale, 2));
    return this.variance * Math.pow(term, -this.alpha);
  }

  public override getParams(): { length_scale: number; alpha: number; variance: number } {
    return {
      length_scale: this.lengthScale,
      alpha: this.alpha,
      variance: this.variance,
    };
  }
}