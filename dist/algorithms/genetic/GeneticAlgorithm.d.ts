import { JMonNote } from '../../types/jmon';
export interface GeneticOptions {
    populationSize?: number;
    generations?: number;
    mutationRate?: number;
    crossoverRate?: number;
    elitismRate?: number;
    fitnessWeights?: FitnessWeights;
    scale?: number[];
    durations?: string[];
    lengthRange?: [number, number];
}
export interface FitnessWeights {
    gini?: number;
    balance?: number;
    motif?: number;
    dissonance?: number;
    rhythmic?: number;
    [key: string]: number | undefined;
}
export interface Individual {
    genes: JMonNote[];
    fitness: number;
    age: number;
}
/**
 * Genetic Algorithm for evolving musical phrases
 * Based on the Python djalgo genetic module (Darwin class)
 */
export declare class GeneticAlgorithm {
    private options;
    private population;
    private generation;
    private bestFitness;
    private bestIndividual;
    constructor(options?: GeneticOptions);
    /**
     * Initialize random population
     */
    initializePopulation(): void;
    /**
     * Run the genetic algorithm
     */
    evolve(): Individual;
    /**
     * Create a random individual
     */
    private createRandomIndividual;
    /**
     * Generate random pitch from scale
     */
    private randomPitch;
    /**
     * Generate random duration
     */
    private randomDuration;
    /**
     * Parse duration to numeric value (simplified)
     */
    private parseDuration;
    /**
     * Evaluate fitness for all individuals
     */
    private evaluatePopulation;
    /**
     * Calculate fitness using weighted musical analysis metrics
     */
    private calculateFitness;
    /**
     * Create next generation through selection, crossover, and mutation
     */
    private createNextGeneration;
    /**
     * Tournament selection
     */
    private selectParent;
    /**
     * Single-point crossover
     */
    private crossover;
    /**
     * Mutate an individual
     */
    private mutate;
    /**
     * Recalculate note timing after mutations
     */
    private recalculateTiming;
    /**
     * Get the best individual from current population
     */
    getBestIndividual(): Individual;
    /**
     * Get population statistics
     */
    getStatistics(): {
        generation: number;
        avgFitness: number;
        maxFitness: number;
        minFitness: number;
        bestAllTime: number;
        populationSize: number;
    };
    /**
     * Set custom fitness function
     */
    setCustomFitness(fitnessFunction: (genes: JMonNote[]) => number): void;
}
