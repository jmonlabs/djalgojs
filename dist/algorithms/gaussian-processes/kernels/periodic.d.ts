import { Kernel } from './base';
export declare class Periodic extends Kernel {
    readonly lengthScale: number;
    readonly periodicity: number;
    readonly variance: number;
    constructor(lengthScale?: number, periodicity?: number, variance?: number);
    compute(x1: number[], x2: number[]): number;
    getParams(): {
        length_scale: number;
        periodicity: number;
        variance: number;
    };
}
