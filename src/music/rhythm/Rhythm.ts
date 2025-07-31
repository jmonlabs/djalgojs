import { Duration } from '../../types/common';
import { RhythmPattern } from '../../types/music';

export interface RhythmOptions {
  measureLength?: number;
  complexity?: number;
  swing?: boolean;
}

export class Rhythm {
  public readonly measureLength: number;
  public durations: Duration[];

  constructor(measureLength = 4.0, durations: Duration[] = []) {
    this.measureLength = measureLength;
    this.durations = durations.length > 0 ? [...durations] : this.generateBasicPattern();
  }

  public random(options: RhythmOptions = {}): RhythmPattern {
    const { measureLength = this.measureLength, complexity = 0.5 } = options;
    
    const possibleDurations = [0.25, 0.5, 1.0, 1.5, 2.0];
    const durations: Duration[] = [];
    let currentLength = 0;
    
    while (currentLength < measureLength) {
      const remaining = measureLength - currentLength;
      const validDurations = possibleDurations.filter(d => d <= remaining);
      
      if (validDurations.length === 0) {
        // Fill remaining with rest
        if (remaining > 0) {
          durations.push(remaining);
        }
        break;
      }
      
      // Choose duration based on complexity
      let chosenDuration: Duration;
      if (Math.random() < complexity) {
        // More complex rhythms favor shorter durations
        chosenDuration = validDurations[0]!;
      } else {
        // Simpler rhythms favor longer durations
        chosenDuration = validDurations[validDurations.length - 1]!;
      }
      
      durations.push(chosenDuration);
      currentLength += chosenDuration;
    }
    
    return {
      durations,
      measureLength,
      accents: this.generateAccents(durations),
    };
  }

  public static beatcycle(cycles: number[], measures = 4): RhythmPattern[] {
    const patterns: RhythmPattern[] = [];
    
    for (let m = 0; m < measures; m++) {
      const durations: Duration[] = [];
      let totalLength = 0;
      
      for (const cycle of cycles) {
        const beatLength = 4.0 / cycle; // Assuming 4/4 time
        
        for (let i = 0; i < cycle; i++) {
          durations.push(beatLength);
          totalLength += beatLength;
        }
        
        if (totalLength >= 4.0) break; // Don't exceed measure length
      }
      
      patterns.push({
        durations,
        measureLength: 4.0,
        accents: durations.map((_, i) => i % cycles[0]! === 0),
      });
    }
    
    return patterns;
  }

  public static isorhythm(talea: Duration[], color: number[], repetitions = 4): RhythmPattern {
    const durations: Duration[] = [];
    let colorIndex = 0;
    
    for (let rep = 0; rep < repetitions; rep++) {
      for (const duration of talea) {
        durations.push(duration);
        colorIndex = (colorIndex + 1) % color.length;
      }
    }
    
    const totalLength = durations.reduce((sum, dur) => sum + dur, 0);
    
    return {
      durations,
      measureLength: totalLength,
      accents: durations.map((_, i) => color[i % color.length] === 1),
    };
  }

  public darwin(options: RhythmOptions = {}): RhythmPattern {
    // Simplified genetic algorithm for rhythm evolution
    const { measureLength = this.measureLength } = options;
    
    // Start with current rhythm or random
    let bestRhythm = this.durations.length > 0 ? 
      { durations: [...this.durations], measureLength, accents: this.generateAccents(this.durations) } :
      this.random(options);
    
    let bestFitness = this.calculateFitness(bestRhythm);
    
    // Evolve for several generations
    for (let gen = 0; gen < 10; gen++) {
      // Create variations
      const variations = Array.from({ length: 5 }, () => this.mutateRhythm(bestRhythm));
      
      for (const variation of variations) {
        const fitness = this.calculateFitness(variation);
        if (fitness > bestFitness) {
          bestRhythm = variation;
          bestFitness = fitness;
        }
      }
    }
    
    return bestRhythm;
  }

  private generateBasicPattern(): Duration[] {
    return [1.0, 1.0, 1.0, 1.0]; // Four quarter notes
  }

  private generateAccents(durations: Duration[]): boolean[] {
    return durations.map((_, i) => i === 0 || (i % 4 === 0)); // Accent first beat and strong beats
  }

  private calculateFitness(rhythm: RhythmPattern): number {
    let fitness = 0;
    
    // Prefer rhythms that fill the measure completely
    const totalDuration = rhythm.durations.reduce((sum, dur) => sum + dur, 0);
    if (Math.abs(totalDuration - rhythm.measureLength) < 0.01) {
      fitness += 10;
    }
    
    // Prefer some variation in duration
    const uniqueDurations = new Set(rhythm.durations).size;
    fitness += uniqueDurations * 2;
    
    // Prefer reasonable number of notes (not too sparse, not too dense)
    const noteCount = rhythm.durations.length;
    if (noteCount >= 2 && noteCount <= 16) {
      fitness += 5;
    }
    
    return fitness;
  }

  private mutateRhythm(rhythm: RhythmPattern): RhythmPattern {
    const durations = [...rhythm.durations];
    const possibleDurations = [0.25, 0.5, 1.0, 1.5, 2.0];
    
    // Randomly modify one duration
    if (durations.length > 0) {
      const index = Math.floor(Math.random() * durations.length);
      durations[index] = possibleDurations[Math.floor(Math.random() * possibleDurations.length)]!;
    }
    
    // Normalize to fit measure
    const total = durations.reduce((sum, dur) => sum + dur, 0);
    if (total !== rhythm.measureLength && total > 0) {
      const factor = rhythm.measureLength / total;
      for (let i = 0; i < durations.length; i++) {
        durations[i] *= factor;
      }
    }
    
    return {
      durations,
      measureLength: rhythm.measureLength,
      accents: this.generateAccents(durations),
    };
  }
}