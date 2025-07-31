export interface WalkOptions {
    length?: number;
    dimensions?: number;
    stepSize?: number;
    bounds?: [number, number];
    branchProbability?: number;
    mergeProbability?: number;
    attractorStrength?: number;
    attractorPosition?: number[];
}
export interface WalkState {
    position: number[];
    velocity: number[];
    branches: WalkState[];
    age: number;
    active: boolean;
}
/**
 * Multi-dimensional random walk generator with branching and merging
 * Based on the Python djalgo walk module (Chain class)
 */
export declare class RandomWalk {
    private options;
    private walkers;
    private history;
    constructor(options?: WalkOptions);
    /**
     * Generate random walk sequence
     */
    generate(startPosition?: number[]): number[][];
    /**
     * Initialize walker(s)
     */
    private initialize;
    /**
     * Update all active walkers
     */
    private updateWalkers;
    /**
     * Record current state of all walkers
     */
    private recordState;
    /**
     * Handle branching (walker splitting)
     */
    private handleBranching;
    /**
     * Handle merging (walker combining)
     */
    private handleMerging;
    /**
     * Calculate Euclidean distance between two positions
     */
    private calculateDistance;
    /**
     * Get 1D projection of multi-dimensional walk
     */
    getProjection(dimension?: number): number[];
    /**
     * Map walk to musical scale
     */
    mapToScale(dimension?: number, scale?: number[], octaveRange?: number): number[];
    /**
     * Map walk to rhythmic durations
     */
    mapToRhythm(dimension?: number, durations?: number[]): number[];
    /**
     * Map walk to velocities
     */
    mapToVelocity(dimension?: number, minVel?: number, maxVel?: number): number[];
    /**
     * Generate correlated walk (walk that follows another walk with some correlation)
     */
    generateCorrelated(targetWalk: number[], correlation?: number, dimension?: number): number[];
    /**
     * Analyze walk properties
     */
    analyze(): {
        meanDisplacement: number;
        meanSquaredDisplacement: number;
        totalDistance: number;
        fractalDimension: number;
    };
    /**
     * Get current walker states
     */
    getWalkerStates(): WalkState[];
    /**
     * Reset the walk generator
     */
    reset(): void;
}
