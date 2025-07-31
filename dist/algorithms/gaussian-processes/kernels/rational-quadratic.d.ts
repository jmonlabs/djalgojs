import { Kernel } from './base';
export declare class RationalQuadratic extends Kernel {
    readonly lengthScale: number;
    readonly alpha: number;
    readonly variance: number;
    constructor(lengthScale?: number, alpha?: number, variance?: number);
    compute(x1: number[], x2: number[]): number;
    getParams(): {
        length_scale: number;
        alpha: number;
        variance: number;
    };
}
