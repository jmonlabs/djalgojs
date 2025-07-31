import { MusicalNote } from '../../types/music';

export interface RhythmNote {
  duration: number;
  offset: number;
}

/**
 * Advanced rhythm algorithms matching the Python djalgo implementation
 */
export class AdvancedRhythm {
  
  /**
   * Isorhythm implementation - merges durations and pitches cyclically
   */
  public static isorhythm(pitches: (number | null)[], durations: number[]): MusicalNote[] {
    // Calculate LCM to find the cycle length
    const lcm = this.lcm(pitches.length, durations.length);
    
    // Repeat patterns to match LCM
    const pRepeated = this.repeatToLength(pitches, lcm);
    const dRepeated = this.repeatToLength(durations, lcm);
    
    // Create notes with proper offsets
    const notes: MusicalNote[] = [];
    let currentOffset = 0;
    
    for (let i = 0; i < lcm; i++) {
      notes.push({
        pitch: pRepeated[i] || undefined,
        duration: dRepeated[i]!,
        offset: currentOffset,
        velocity: 0.8
      });
      currentOffset += dRepeated[i]!;
    }
    
    return notes;
  }

  /**
   * Beat cycle implementation - maps pitches to durations cyclically
   */
  public static beatcycle(pitches: (number | null)[], durations: number[]): MusicalNote[] {
    const notes: MusicalNote[] = [];
    let currentOffset = 0;
    let durationIndex = 0;
    
    for (const pitch of pitches) {
      const duration = durations[durationIndex % durations.length]!;
      
      notes.push({
        pitch: pitch || undefined,
        duration,
        offset: currentOffset,
        velocity: 0.8
      });
      
      currentOffset += duration;
      durationIndex++;
    }
    
    return notes;
  }

  /**
   * Simple LCM calculation
   */
  private static lcm(a: number, b: number): number {
    return Math.abs(a * b) / this.gcd(a, b);
  }

  /**
   * Simple GCD calculation
   */
  private static gcd(a: number, b: number): number {
    while (b !== 0) {
      const temp = b;
      b = a % b;
      a = temp;
    }
    return a;
  }

  /**
   * Repeat array to specific length
   */
  private static repeatToLength<T>(array: T[], length: number): T[] {
    const result: T[] = [];
    for (let i = 0; i < length; i++) {
      result.push(array[i % array.length]!);
    }
    return result;
  }
}

/**
 * Enhanced Rhythm class with genetic algorithm support
 */
export class Rhythm {
  public measureLength: number;
  public durations: number[];

  constructor(measureLength: number, durations: number[]) {
    this.measureLength = measureLength;
    this.durations = durations;
  }

  /**
   * Generate random rhythm with constraints
   */
  public random(
    seed?: number, 
    restProbability: number = 0, 
    maxIter: number = 100
  ): RhythmNote[] {
    if (seed !== undefined) {
      // Simple seed-based random (for reproducibility)
      Math.random = this.seededRandom(seed);
    }

    const rhythm: RhythmNote[] = [];
    let totalLength = 0;
    let nIter = 0;

    while (totalLength < this.measureLength) {
      if (nIter >= maxIter) {
        console.warn('Max iterations reached. The sum of the durations is not equal to the measure length.');
        break;
      }

      const duration = this.durations[Math.floor(Math.random() * this.durations.length)]!;
      
      if (totalLength + duration > this.measureLength) {
        continue;
      }
      
      if (Math.random() < restProbability) {
        continue;
      }

      rhythm.push({
        duration,
        offset: totalLength
      });
      
      totalLength += duration;
      nIter++;
    }

    return rhythm;
  }

  /**
   * Genetic algorithm for rhythm evolution
   */
  public darwin(
    seed?: number,
    populationSize: number = 10,
    maxGenerations: number = 50,
    mutationRate: number = 0.1
  ): RhythmNote[] {
    const ga = new GeneticRhythm(
      seed,
      populationSize,
      this.measureLength,
      maxGenerations,
      mutationRate,
      this.durations
    );
    return ga.generate();
  }

  /**
   * Simple seeded random number generator
   */
  private seededRandom(seed: number): () => number {
    let m = 0x80000000; // 2**31
    let a = 1103515245;
    let c = 12345;
    let state = seed;
    
    return function() {
      state = (a * state + c) % m;
      return state / (m - 1);
    };
  }
}

/**
 * Genetic algorithm for rhythm generation
 */
export class GeneticRhythm {
  private populationSize: number;
  private measureLength: number;
  private maxGenerations: number;
  private mutationRate: number;
  private durations: number[];
  private population: RhythmNote[][];

  constructor(
    seed: number | undefined,
    populationSize: number,
    measureLength: number,
    maxGenerations: number,
    mutationRate: number,
    durations: number[]
  ) {
    if (seed !== undefined) {
      // Set up seeded random
      Math.random = this.seededRandom(seed);
    }

    this.populationSize = populationSize;
    this.measureLength = measureLength;
    this.maxGenerations = maxGenerations;
    this.mutationRate = mutationRate;
    this.durations = durations;
    this.population = this.initializePopulation();
  }

  /**
   * Initialize random population
   */
  private initializePopulation(): RhythmNote[][] {
    const population: RhythmNote[][] = [];
    
    for (let i = 0; i < this.populationSize; i++) {
      population.push(this.createRandomRhythm());
    }
    
    return population;
  }

  /**
   * Create a single random rhythm
   */
  private createRandomRhythm(): RhythmNote[] {
    const rhythm: RhythmNote[] = [];
    let totalLength = 0;

    while (totalLength < this.measureLength) {
      const remaining = this.measureLength - totalLength;
      const noteLength = this.durations[Math.floor(Math.random() * this.durations.length)]!;
      
      if (noteLength <= remaining) {
        rhythm.push({
          duration: noteLength,
          offset: totalLength
        });
        totalLength += noteLength;
      } else {
        break;
      }
    }

    return rhythm;
  }

  /**
   * Evaluate fitness of a rhythm
   */
  private evaluateFitness(rhythm: RhythmNote[]): number {
    const totalLength = rhythm.reduce((sum, note) => sum + note.duration, 0);
    return Math.abs(this.measureLength - totalLength);
  }

  /**
   * Select parent for reproduction
   */
  private selectParent(): RhythmNote[] {
    const parent1 = this.population[Math.floor(Math.random() * this.population.length)]!;
    const parent2 = this.population[Math.floor(Math.random() * this.population.length)]!;
    
    return this.evaluateFitness(parent1) < this.evaluateFitness(parent2) ? parent1 : parent2;
  }

  /**
   * Crossover two parent rhythms
   */
  private crossover(parent1: RhythmNote[], parent2: RhythmNote[]): RhythmNote[] {
    if (parent1.length === 0 || parent2.length === 0) {
      return parent1.length > parent2.length ? [...parent1] : [...parent2];
    }

    const crossoverPoint = Math.floor(Math.random() * Math.min(parent1.length, parent2.length));
    const child = [
      ...parent1.slice(0, crossoverPoint),
      ...parent2.slice(crossoverPoint)
    ];

    return this.ensureMeasureLength(child);
  }

  /**
   * Ensure rhythm fits within measure length
   */
  private ensureMeasureLength(rhythm: RhythmNote[]): RhythmNote[] {
    let totalLength = 0;
    const adjustedRhythm: RhythmNote[] = [];

    for (let i = 0; i < rhythm.length; i++) {
      const note = rhythm[i]!;
      if (totalLength + note.duration <= this.measureLength) {
        adjustedRhythm.push({
          duration: note.duration,
          offset: totalLength
        });
        totalLength += note.duration;
      } else {
        break;
      }
    }

    return adjustedRhythm;
  }

  /**
   * Mutate a rhythm
   */
  private mutate(rhythm: RhythmNote[]): RhythmNote[] {
    if (Math.random() > this.mutationRate || rhythm.length === 0) {
      return [...rhythm];
    }

    const mutatedRhythm = [...rhythm];
    const index = Math.floor(Math.random() * mutatedRhythm.length);
    const note = mutatedRhythm[index]!;
    
    // Calculate maximum possible duration for this position
    const nextOffset = index < mutatedRhythm.length - 1 
      ? mutatedRhythm[index + 1]!.offset 
      : this.measureLength;
    const maxNewDuration = nextOffset - note.offset;
    
    // Find valid durations
    const validDurations = this.durations.filter(d => d <= maxNewDuration);
    
    if (validDurations.length > 0) {
      const newDuration = validDurations[Math.floor(Math.random() * validDurations.length)]!;
      mutatedRhythm[index] = {
        duration: newDuration,
        offset: note.offset
      };
    }

    return mutatedRhythm;
  }

  /**
   * Run the genetic algorithm
   */
  public generate(): RhythmNote[] {
    for (let generation = 0; generation < this.maxGenerations; generation++) {
      const newPopulation: RhythmNote[][] = [];
      
      for (let i = 0; i < this.populationSize; i++) {
        const parent1 = this.selectParent();
        const parent2 = this.selectParent();
        let child = this.crossover(parent1, parent2);
        child = this.mutate(child);
        
        // Sort by offset
        child.sort((a, b) => a.offset - b.offset);
        newPopulation.push(child);
      }
      
      this.population = newPopulation;
    }

    // Return best rhythm
    const bestRhythm = this.population.reduce((best, current) =>
      this.evaluateFitness(current) < this.evaluateFitness(best) ? current : best
    );

    return bestRhythm.sort((a, b) => a.offset - b.offset);
  }

  /**
   * Simple seeded random number generator
   */
  private seededRandom(seed: number): () => number {
    let m = 0x80000000;
    let a = 1103515245;
    let c = 12345;
    let state = seed;
    
    return function() {
      state = (a * state + c) % m;
      return state / (m - 1);
    };
  }
}