export interface LogisticMapOptions {
    r?: number;
    x0?: number;
    iterations?: number;
    skipTransient?: number;
}
/**
 * Logistic Map chaotic sequence generator
 * Based on the equation: x(n+1) = r * x(n) * (1 - x(n))
 */
export declare class LogisticMap {
    private r;
    private x0;
    private iterations;
    private skipTransient;
    constructor(options?: LogisticMapOptions);
    /**
     * Generate logistic map sequence
     */
    generate(): number[];
    /**
     * Generate bifurcation data for different r values
     */
    bifurcationDiagram(rMin?: number, rMax?: number, rSteps?: number): {
        r: number[];
        x: number[];
    };
    /**
     * Map chaotic values to musical scale
     */
    mapToScale(sequence: number[], scale?: number[], octaveRange?: number): number[];
    /**
     * Map to rhythmic durations
     */
    mapToRhythm(sequence: number[], durations?: number[]): number[];
    /**
     * Map to velocities
     */
    mapToVelocity(sequence: number[], minVel?: number, maxVel?: number): number[];
    /**
     * Detect periodic cycles in the sequence
     */
    detectCycles(sequence: number[], tolerance?: number): number[];
    /**
     * Calculate Lyapunov exponent (measure of chaos)
     */
    lyapunovExponent(iterations?: number): number;
    /**
     * Generate multiple correlated sequences
     */
    generateCoupled(numSequences?: number, coupling?: number): number[][];
    /**
     * Apply different chaotic regimes
     */
    setRegime(regime: 'periodic' | 'chaotic' | 'edge' | 'custom', customR?: number): void;
    /**
     * Get current parameters
     */
    getParameters(): LogisticMapOptions;
}
