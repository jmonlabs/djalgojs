import { MusicalNote } from '../../types/music';

export type MinimalismOperation = 'additive' | 'subtractive';
export type MinimalismDirection = 'forward' | 'backward' | 'inward' | 'outward';

export interface MinimalismOptions {
  operation: MinimalismOperation;
  direction: MinimalismDirection;
  repetition: number;
}

/**
 * Implementation of musical minimalism processes based on the Python djalgo library
 * Supports additive and subtractive operations in four directions
 */
export class MinimalismProcess {
  private operation: MinimalismOperation;
  private direction: MinimalismDirection;
  private repetition: number;
  private sequence: MusicalNote[] = [];

  constructor(options: MinimalismOptions) {
    const { operation, direction, repetition } = options;
    
    if (!['additive', 'subtractive'].includes(operation)) {
      throw new Error("Invalid operation. Choose 'additive' or 'subtractive'.");
    }
    
    if (!['forward', 'backward', 'inward', 'outward'].includes(direction)) {
      throw new Error("Invalid direction. Choose 'forward', 'backward', 'inward' or 'outward'.");
    }
    
    if (repetition < 0 || !Number.isInteger(repetition)) {
      throw new Error("Invalid repetition value. Must be an integer greater than or equal to 0.");
    }
    
    this.operation = operation;
    this.direction = direction;
    this.repetition = repetition;
  }

  /**
   * Generate processed sequence based on operation and direction
   */
  public generate(sequence: MusicalNote[]): MusicalNote[] {
    this.sequence = sequence;
    
    let processed: MusicalNote[];
    
    if (this.operation === 'additive' && this.direction === 'forward') {
      processed = this.additiveForward();
    } else if (this.operation === 'additive' && this.direction === 'backward') {
      processed = this.additiveBackward();
    } else if (this.operation === 'additive' && this.direction === 'inward') {
      processed = this.additiveInward();
    } else if (this.operation === 'additive' && this.direction === 'outward') {
      processed = this.additiveOutward();
    } else if (this.operation === 'subtractive' && this.direction === 'forward') {
      processed = this.subtractiveForward();
    } else if (this.operation === 'subtractive' && this.direction === 'backward') {
      processed = this.subtractiveBackward();
    } else if (this.operation === 'subtractive' && this.direction === 'inward') {
      processed = this.subtractiveInward();
    } else if (this.operation === 'subtractive' && this.direction === 'outward') {
      processed = this.subtractiveOutward();
    } else {
      throw new Error('Invalid operation/direction combination');
    }

    // Adjust offsets based on durations
    return this.adjustOffsets(processed);
  }

  private additiveForward(): MusicalNote[] {
    const processed: MusicalNote[] = [];
    
    for (let i = 0; i < this.sequence.length; i++) {
      const segment = this.sequence.slice(0, i + 1);
      for (let rep = 0; rep <= this.repetition; rep++) {
        processed.push(...segment);
      }
    }
    
    return processed;
  }

  private additiveBackward(): MusicalNote[] {
    const processed: MusicalNote[] = [];
    
    for (let i = this.sequence.length; i > 0; i--) {
      const segment = this.sequence.slice(i - 1);
      for (let rep = 0; rep <= this.repetition; rep++) {
        processed.push(...segment);
      }
    }
    
    return processed;
  }

  private additiveInward(): MusicalNote[] {
    const processed: MusicalNote[] = [];
    const n = this.sequence.length;
    
    for (let i = 0; i < Math.ceil(n / 2); i++) {
      let segment: MusicalNote[];
      
      if (i < n - i - 1) {
        // Combine from start and end
        const leftPart = this.sequence.slice(0, i + 1);
        const rightPart = this.sequence.slice(n - i - 1);
        segment = [...leftPart, ...rightPart];
      } else {
        // Middle element(s)
        segment = [...this.sequence];
      }
      
      for (let rep = 0; rep <= this.repetition; rep++) {
        processed.push(...segment);
      }
    }
    
    return processed;
  }

  private additiveOutward(): MusicalNote[] {
    const processed: MusicalNote[] = [];
    const n = this.sequence.length;
    
    if (n % 2 === 0) {
      // Even length
      const midLeft = Math.floor(n / 2) - 1;
      const midRight = Math.floor(n / 2);
      
      for (let i = 0; i < n / 2; i++) {
        const segment = this.sequence.slice(midLeft - i, midRight + i + 1);
        for (let rep = 0; rep <= this.repetition; rep++) {
          processed.push(...segment);
        }
      }
    } else {
      // Odd length
      const mid = Math.floor(n / 2);
      
      for (let i = 0; i <= mid; i++) {
        const segment = this.sequence.slice(mid - i, mid + i + 1);
        for (let rep = 0; rep <= this.repetition; rep++) {
          processed.push(...segment);
        }
      }
    }
    
    return processed;
  }

  private subtractiveForward(): MusicalNote[] {
    const processed: MusicalNote[] = [];
    
    for (let i = 0; i < this.sequence.length; i++) {
      const segment = this.sequence.slice(i);
      for (let rep = 0; rep <= this.repetition; rep++) {
        processed.push(...segment);
      }
    }
    
    return processed;
  }

  private subtractiveBackward(): MusicalNote[] {
    const processed: MusicalNote[] = [];
    
    for (let i = this.sequence.length; i > 0; i--) {
      const segment = this.sequence.slice(0, i);
      for (let rep = 0; rep <= this.repetition; rep++) {
        processed.push(...segment);
      }
    }
    
    return processed;
  }

  private subtractiveInward(): MusicalNote[] {
    const processed: MusicalNote[] = [];
    const n = this.sequence.length;
    const steps = Math.floor(n / 2);
    
    // Start with full sequence
    for (let rep = 0; rep <= this.repetition; rep++) {
      processed.push(...this.sequence);
    }
    
    // Remove elements from both ends
    for (let i = 1; i <= steps; i++) {
      const segment = this.sequence.slice(i, n - i);
      if (segment.length > 0) {
        for (let rep = 0; rep <= this.repetition; rep++) {
          processed.push(...segment);
        }
      }
    }
    
    return processed;
  }

  private subtractiveOutward(): MusicalNote[] {
    const processed: MusicalNote[] = [];
    let segment = [...this.sequence];
    
    // Start with full sequence
    for (let rep = 0; rep <= this.repetition; rep++) {
      processed.push(...segment);
    }
    
    // Remove first and last elements iteratively
    while (segment.length > 2) {
      segment = segment.slice(1, -1);
      for (let rep = 0; rep <= this.repetition; rep++) {
        processed.push(...segment);
      }
    }
    
    return processed;
  }

  private adjustOffsets(processed: MusicalNote[]): MusicalNote[] {
    let currentOffset = 0;
    
    return processed.map(note => {
      const newNote: MusicalNote = {
        ...note,
        offset: currentOffset
      };
      currentOffset += note.duration;
      return newNote;
    });
  }
}

/**
 * Tintinnabuli style implementation for modal composition
 */
export class Tintinnabuli {
  private tChord: number[];
  private direction: 'up' | 'down' | 'any' | 'alternate';
  private rank: number;
  private isAlternate: boolean;
  private currentDirection: 'up' | 'down';

  constructor(
    tChord: number[],
    direction: 'up' | 'down' | 'any' | 'alternate' = 'down',
    rank: number = 0
  ) {
    if (!['up', 'down', 'any', 'alternate'].includes(direction)) {
      throw new Error("Invalid direction. Choose 'up', 'down', 'any' or 'alternate'.");
    }
    
    this.tChord = tChord;
    this.isAlternate = direction === 'alternate';
    this.currentDirection = this.isAlternate ? 'up' : direction as 'up' | 'down';
    this.direction = direction;
    
    if (!Number.isInteger(rank) || rank < 0) {
      throw new Error("Rank must be a non-negative integer.");
    }
    
    this.rank = Math.min(rank, tChord.length - 1);
    
    if (this.rank >= tChord.length) {
      console.warn("Rank exceeds the length of the t-chord. Using last note of the t-chord.");
    }
  }

  /**
   * Generate t-voice from m-voice sequence
   */
  public generate(sequence: MusicalNote[]): MusicalNote[] {
    const tVoice: MusicalNote[] = [];
    
    for (const note of sequence) {
      if (note.pitch === undefined) {
        // Rest note
        tVoice.push({
          ...note,
          pitch: undefined
        });
        continue;
      }
      
      const mPitch = note.pitch;
      const differences = this.tChord.map(t => t - mPitch);
      const sortedDifferences = differences
        .map((diff, index) => ({ index, value: diff }))
        .sort((a, b) => Math.abs(a.value) - Math.abs(b.value));
      
      let effectiveRank = this.rank;
      let tVoicePitch: number;
      
      if (this.currentDirection === 'up' || this.currentDirection === 'down') {
        const filteredDifferences = sortedDifferences.filter(({ value }) =>
          this.currentDirection === 'up' ? value >= 0 : value <= 0
        );
        
        if (filteredDifferences.length === 0) {
          // No notes in desired direction, use extreme note
          tVoicePitch = this.currentDirection === 'up' 
            ? Math.max(...this.tChord) 
            : Math.min(...this.tChord);
        } else {
          if (effectiveRank >= filteredDifferences.length) {
            effectiveRank = filteredDifferences.length - 1;
          }
          const chosenIndex = filteredDifferences[effectiveRank].index;
          tVoicePitch = this.tChord[chosenIndex];
        }
      } else { // 'any'
        if (effectiveRank >= sortedDifferences.length) {
          effectiveRank = sortedDifferences.length - 1;
        }
        const chosenIndex = sortedDifferences[effectiveRank].index;
        tVoicePitch = this.tChord[chosenIndex];
      }
      
      // Change direction if alternate
      if (this.isAlternate) {
        this.currentDirection = this.currentDirection === 'up' ? 'down' : 'up';
      }
      
      tVoice.push({
        ...note,
        pitch: tVoicePitch
      });
    }
    
    return tVoice;
  }
}