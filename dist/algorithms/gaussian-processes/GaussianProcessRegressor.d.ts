import { Kernel } from './kernels/base';
import { GaussianProcessOptions, PredictionResult } from '../../types/algorithms';
export declare class GaussianProcessRegressor {
    private kernel;
    private alpha;
    private XTrain?;
    private yTrain?;
    private L?;
    private alphaVector?;
    constructor(kernel: Kernel, options?: GaussianProcessOptions);
    fit(X: number[] | number[][], y: number[]): void;
    predict(X: number[] | number[][], returnStd?: boolean): PredictionResult;
    sampleY(X: number[] | number[][], nSamples?: number): number[][];
    logMarginalLikelihood(): number;
    private computeStd;
    private solveCholesky;
    private forwardSubstitution;
    private backSubstitution;
    private sampleStandardNormal;
}
