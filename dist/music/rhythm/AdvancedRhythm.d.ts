import { MusicalNote } from '../../types/music';
export interface RhythmNote {
    duration: number;
    offset: number;
}
/**
 * Advanced rhythm algorithms matching the Python djalgo implementation
 */
export declare class AdvancedRhythm {
    /**
     * Isorhythm implementation - merges durations and pitches cyclically
     */
    static isorhythm(pitches: (number | null)[], durations: number[]): MusicalNote[];
    /**
     * Beat cycle implementation - maps pitches to durations cyclically
     */
    static beatcycle(pitches: (number | null)[], durations: number[]): MusicalNote[];
    /**
     * Simple LCM calculation
     */
    private static lcm;
    /**
     * Simple GCD calculation
     */
    private static gcd;
    /**
     * Repeat array to specific length
     */
    private static repeatToLength;
}
/**
 * Enhanced Rhythm class with genetic algorithm support
 */
export declare class Rhythm {
    measureLength: number;
    durations: number[];
    constructor(measureLength: number, durations: number[]);
    /**
     * Generate random rhythm with constraints
     */
    random(seed?: number, restProbability?: number, maxIter?: number): RhythmNote[];
    /**
     * Genetic algorithm for rhythm evolution
     */
    darwin(seed?: number, populationSize?: number, maxGenerations?: number, mutationRate?: number): RhythmNote[];
    /**
     * Simple seeded random number generator
     */
    private seededRandom;
}
/**
 * Genetic algorithm for rhythm generation
 */
export declare class GeneticRhythm {
    private populationSize;
    private measureLength;
    private maxGenerations;
    private mutationRate;
    private durations;
    private population;
    constructor(seed: number | undefined, populationSize: number, measureLength: number, maxGenerations: number, mutationRate: number, durations: number[]);
    /**
     * Initialize random population
     */
    private initializePopulation;
    /**
     * Create a single random rhythm
     */
    private createRandomRhythm;
    /**
     * Evaluate fitness of a rhythm
     */
    private evaluateFitness;
    /**
     * Select parent for reproduction
     */
    private selectParent;
    /**
     * Crossover two parent rhythms
     */
    private crossover;
    /**
     * Ensure rhythm fits within measure length
     */
    private ensureMeasureLength;
    /**
     * Mutate a rhythm
     */
    private mutate;
    /**
     * Run the genetic algorithm
     */
    generate(): RhythmNote[];
    /**
     * Simple seeded random number generator
     */
    private seededRandom;
}
