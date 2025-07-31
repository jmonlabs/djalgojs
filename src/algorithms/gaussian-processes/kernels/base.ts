import { Matrix } from '../../../utils/matrix';
import { KernelParams } from '../../../types/algorithms';

export abstract class Kernel {
  protected params: KernelParams;

  constructor(params: KernelParams = {}) {
    this.params = { ...params };
  }

  public call(X1: Matrix, X2?: Matrix): Matrix {
    const X2_actual = X2 || X1;
    const K = Matrix.zeros(X1.rows, X2_actual.rows);
    
    for (let i = 0; i < X1.rows; i++) {
      for (let j = 0; j < X2_actual.rows; j++) {
        K.set(i, j, this.compute(X1.getRow(i), X2_actual.getRow(j)));
      }
    }
    
    return K;
  }

  public abstract compute(x1: number[], x2: number[]): number;

  public getParams(): KernelParams {
    return { ...this.params };
  }

  public setParams(newParams: Partial<KernelParams>): void {
    Object.assign(this.params, newParams);
  }

  protected euclideanDistance(x1: number[], x2: number[]): number {
    let sum = 0;
    for (let i = 0; i < x1.length; i++) {
      sum += Math.pow(x1[i]! - x2[i]!, 2);
    }
    return Math.sqrt(sum);
  }

  protected squaredEuclideanDistance(x1: number[], x2: number[]): number {
    let sum = 0;
    for (let i = 0; i < x1.length; i++) {
      sum += Math.pow(x1[i]! - x2[i]!, 2);
    }
    return sum;
  }
}