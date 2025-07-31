import { Kernel } from './base';
export declare class RBF extends Kernel {
    readonly lengthScale: number;
    readonly variance: number;
    constructor(lengthScale?: number, variance?: number);
    compute(x1: number[], x2: number[]): number;
    getParams(): {
        length_scale: number;
        variance: number;
    };
}
