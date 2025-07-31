import { Matrix } from '../../../utils/matrix';
import { KernelParams } from '../../../types/algorithms';
export declare abstract class Kernel {
    protected params: KernelParams;
    constructor(params?: KernelParams);
    call(X1: Matrix, X2?: Matrix): Matrix;
    abstract compute(x1: number[], x2: number[]): number;
    getParams(): KernelParams;
    setParams(newParams: Partial<KernelParams>): void;
    protected euclideanDistance(x1: number[], x2: number[]): number;
    protected squaredEuclideanDistance(x1: number[], x2: number[]): number;
}
