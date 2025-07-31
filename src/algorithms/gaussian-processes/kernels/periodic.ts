import { Kernel } from './base';

export class Periodic extends Kernel {
  public readonly lengthScale: number;
  public readonly periodicity: number;
  public readonly variance: number;

  constructor(lengthScale = 1.0, periodicity = 1.0, variance = 1.0) {
    super({ length_scale: lengthScale, periodicity, variance });
    this.lengthScale = lengthScale;
    this.periodicity = periodicity;
    this.variance = variance;
  }

  public override compute(x1: number[], x2: number[]): number {
    const distance = this.euclideanDistance(x1, x2);
    const sinTerm = Math.sin(Math.PI * distance / this.periodicity);
    return this.variance * Math.exp(-2 * Math.pow(sinTerm / this.lengthScale, 2));
  }

  public override getParams(): { length_scale: number; periodicity: number; variance: number } {
    return {
      length_scale: this.lengthScale,
      periodicity: this.periodicity,
      variance: this.variance,
    };
  }
}