export interface KernelGenerationOptions {
    walkAround?: boolean;
    length?: number;
    lengthScale?: number;
    amplitude?: number;
    noiseLevel?: number;
}
export declare class KernelGenerator {
    private data;
    private lengthScale;
    private amplitude;
    private noiseLevel;
    private walkAround;
    constructor(data?: number[], lengthScale?: number, amplitude?: number, noiseLevel?: number, walkAround?: boolean);
    generate(options?: KernelGenerationOptions): number[];
    rbfKernel(x1: number[], x2: number[]): number;
    setData(data: number[]): void;
    getData(): number[];
    setLengthScale(lengthScale: number): void;
    setAmplitude(amplitude: number): void;
    setNoiseLevel(noiseLevel: number): void;
}
