import { JMonNote } from '../../types/jmon';
import { MusicalAnalysis } from '../../analysis/MusicalAnalysis';

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
export class GeneticAlgorithm {
  private options: Required<GeneticOptions>;
  private population: Individual[];
  private generation: number;
  private bestFitness: number;
  private bestIndividual: Individual | null;

  constructor(options: GeneticOptions = {}) {
    this.options = {
      populationSize: options.populationSize || 50,
      generations: options.generations || 100,
      mutationRate: options.mutationRate || 0.1,
      crossoverRate: options.crossoverRate || 0.8,
      elitismRate: options.elitismRate || 0.1,
      fitnessWeights: {
        gini: 0.2,
        balance: 0.15,
        motif: 0.25,
        dissonance: 0.2,
        rhythmic: 0.2,
        ...options.fitnessWeights
      },
      scale: options.scale || [0, 2, 4, 5, 7, 9, 11], // C major
      durations: options.durations || ['4n', '8n', '2n', '16n'],
      lengthRange: options.lengthRange || [8, 16]
    };

    this.population = [];
    this.generation = 0;
    this.bestFitness = -Infinity;
    this.bestIndividual = null;
  }

  /**
   * Initialize random population
   */
  public initializePopulation(): void {
    this.population = [];
    
    for (let i = 0; i < this.options.populationSize; i++) {
      const individual = this.createRandomIndividual();
      this.population.push(individual);
    }
    
    this.evaluatePopulation();
  }

  /**
   * Run the genetic algorithm
   */
  public evolve(): Individual {
    this.initializePopulation();
    
    for (let gen = 0; gen < this.options.generations; gen++) {
      this.generation = gen;
      
      // Selection and reproduction
      const newPopulation = this.createNextGeneration();
      
      // Replace population
      this.population = newPopulation;
      
      // Evaluate new population
      this.evaluatePopulation();
      
      // Track best individual
      const currentBest = this.getBestIndividual();
      if (currentBest.fitness > this.bestFitness) {
        this.bestFitness = currentBest.fitness;
        this.bestIndividual = { ...currentBest };
      }
    }
    
    return this.getBestIndividual();
  }

  /**
   * Create a random individual
   */
  private createRandomIndividual(): Individual {
    const length = Math.floor(Math.random() * (this.options.lengthRange[1] - this.options.lengthRange[0] + 1)) + this.options.lengthRange[0];
    const genes: JMonNote[] = [];
    
    let currentTime = 0;
    
    for (let i = 0; i < length; i++) {
      const pitch = this.randomPitch();
      const duration = this.randomDuration();
      
      genes.push({
        note: pitch,
        time: `${Math.floor(currentTime)}:${Math.floor((currentTime % 1) * 4)}:0`, // Simple time format
        duration: duration,
        velocity: Math.random() * 0.5 + 0.5 // 0.5 to 1.0
      });
      
      // Advance time (simplified duration parsing)
      currentTime += this.parseDuration(duration);
    }
    
    return {
      genes,
      fitness: 0,
      age: 0
    };
  }

  /**
   * Generate random pitch from scale
   */
  private randomPitch(): number {
    const octave = Math.floor(Math.random() * 3) + 4; // Octaves 4-6
    const scaleNote = this.options.scale[Math.floor(Math.random() * this.options.scale.length)];
    return 12 * octave + scaleNote;
  }

  /**
   * Generate random duration
   */
  private randomDuration(): string {
    return this.options.durations[Math.floor(Math.random() * this.options.durations.length)];
  }

  /**
   * Parse duration to numeric value (simplified)
   */
  private parseDuration(duration: string): number {
    const durationMap: Record<string, number> = {
      '1n': 4,
      '2n': 2,
      '4n': 1,
      '8n': 0.5,
      '16n': 0.25,
      '32n': 0.125
    };
    return durationMap[duration] || 1;
  }

  /**
   * Evaluate fitness for all individuals
   */
  private evaluatePopulation(): void {
    for (const individual of this.population) {
      individual.fitness = this.calculateFitness(individual.genes);
    }
    
    // Sort by fitness (descending)
    this.population.sort((a, b) => b.fitness - a.fitness);
  }

  /**
   * Calculate fitness using weighted musical analysis metrics
   */
  private calculateFitness(genes: JMonNote[]): number {
    const analysis = MusicalAnalysis.analyze(genes, { scale: this.options.scale });
    let fitness = 0;
    
    const weights = this.options.fitnessWeights;
    
    // Combine weighted metrics
    fitness += (weights.gini || 0) * (1 - analysis.gini); // Lower gini is better (more equal)
    fitness += (weights.balance || 0) * (1 - Math.abs(analysis.balance - 60) / 60); // Closer to middle C
    fitness += (weights.motif || 0) * analysis.motif;
    fitness += (weights.dissonance || 0) * (1 - analysis.dissonance); // Lower dissonance is better
    fitness += (weights.rhythmic || 0) * analysis.rhythmic;
    
    // Additional penalties/bonuses
    const length = genes.length;
    if (length < this.options.lengthRange[0] || length > this.options.lengthRange[1]) {
      fitness *= 0.5; // Penalty for wrong length
    }
    
    return Math.max(0, fitness); // Ensure non-negative
  }

  /**
   * Create next generation through selection, crossover, and mutation
   */
  private createNextGeneration(): Individual[] {
    const newPopulation: Individual[] = [];
    const eliteCount = Math.floor(this.options.populationSize * this.options.elitismRate);
    
    // Elitism - keep best individuals
    for (let i = 0; i < eliteCount; i++) {
      const elite = { ...this.population[i] };
      elite.age++;
      newPopulation.push(elite);
    }
    
    // Generate offspring
    while (newPopulation.length < this.options.populationSize) {
      const parent1 = this.selectParent();
      const parent2 = this.selectParent();
      
      let offspring1, offspring2;
      
      if (Math.random() < this.options.crossoverRate) {
        [offspring1, offspring2] = this.crossover(parent1, parent2);
      } else {
        offspring1 = { ...parent1 };
        offspring2 = { ...parent2 };
      }
      
      // Mutation
      if (Math.random() < this.options.mutationRate) {
        this.mutate(offspring1);
      }
      if (Math.random() < this.options.mutationRate) {
        this.mutate(offspring2);
      }
      
      offspring1.age = 0;
      offspring2.age = 0;
      
      newPopulation.push(offspring1);
      if (newPopulation.length < this.options.populationSize) {
        newPopulation.push(offspring2);
      }
    }
    
    return newPopulation;
  }

  /**
   * Tournament selection
   */
  private selectParent(): Individual {
    const tournamentSize = 3;
    const tournament: Individual[] = [];
    
    for (let i = 0; i < tournamentSize; i++) {
      const randomIndex = Math.floor(Math.random() * this.population.length);
      tournament.push(this.population[randomIndex]);
    }
    
    tournament.sort((a, b) => b.fitness - a.fitness);
    return { ...tournament[0] };
  }

  /**
   * Single-point crossover
   */
  private crossover(parent1: Individual, parent2: Individual): [Individual, Individual] {
    const minLength = Math.min(parent1.genes.length, parent2.genes.length);
    const crossoverPoint = Math.floor(Math.random() * minLength);
    
    const offspring1: Individual = {
      genes: [
        ...parent1.genes.slice(0, crossoverPoint),
        ...parent2.genes.slice(crossoverPoint)
      ],
      fitness: 0,
      age: 0
    };
    
    const offspring2: Individual = {
      genes: [
        ...parent2.genes.slice(0, crossoverPoint),
        ...parent1.genes.slice(crossoverPoint)
      ],
      fitness: 0,
      age: 0
    };
    
    return [offspring1, offspring2];
  }

  /**
   * Mutate an individual
   */
  private mutate(individual: Individual): void {
    const genes = individual.genes;
    const mutationType = Math.random();
    
    if (mutationType < 0.3) {
      // Pitch mutation
      const index = Math.floor(Math.random() * genes.length);
      genes[index].note = this.randomPitch();
    } else if (mutationType < 0.6) {
      // Duration mutation
      const index = Math.floor(Math.random() * genes.length);
      genes[index].duration = this.randomDuration();
    } else if (mutationType < 0.8) {
      // Velocity mutation
      const index = Math.floor(Math.random() * genes.length);
      genes[index].velocity = Math.random() * 0.5 + 0.5;
    } else {
      // Structure mutation (add/remove note)
      if (Math.random() < 0.5 && genes.length < this.options.lengthRange[1]) {
        // Add note
        const insertIndex = Math.floor(Math.random() * (genes.length + 1));
        const newNote: JMonNote = {
          note: this.randomPitch(),
          time: '0:0:0', // Will be recalculated
          duration: this.randomDuration(),
          velocity: Math.random() * 0.5 + 0.5
        };
        genes.splice(insertIndex, 0, newNote);
      } else if (genes.length > this.options.lengthRange[0]) {
        // Remove note
        const removeIndex = Math.floor(Math.random() * genes.length);
        genes.splice(removeIndex, 1);
      }
    }
    
    // Recalculate timing
    this.recalculateTiming(individual);
  }

  /**
   * Recalculate note timing after mutations
   */
  private recalculateTiming(individual: Individual): void {
    let currentTime = 0;
    
    for (const note of individual.genes) {
      note.time = `${Math.floor(currentTime)}:${Math.floor((currentTime % 1) * 4)}:0`;
      currentTime += this.parseDuration(note.duration as string);
    }
  }

  /**
   * Get the best individual from current population
   */
  public getBestIndividual(): Individual {
    return { ...this.population[0] };
  }

  /**
   * Get population statistics
   */
  public getStatistics() {
    const fitnesses = this.population.map(ind => ind.fitness);
    const avgFitness = fitnesses.reduce((sum, f) => sum + f, 0) / fitnesses.length;
    const maxFitness = Math.max(...fitnesses);
    const minFitness = Math.min(...fitnesses);
    
    return {
      generation: this.generation,
      avgFitness,
      maxFitness,
      minFitness,
      bestAllTime: this.bestFitness,
      populationSize: this.population.length
    };
  }

  /**
   * Set custom fitness function
   */
  public setCustomFitness(fitnessFunction: (genes: JMonNote[]) => number): void {
    this.calculateFitness = fitnessFunction;
  }
}