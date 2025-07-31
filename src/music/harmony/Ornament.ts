export interface OrnamentOptions {
  density?: number;        // Probability of ornamentation (0-1)
  maxInterval?: number;    // Maximum interval for ornaments
  rhythmicVariation?: boolean;
  graceNoteDuration?: number;
}

export interface OrnamentedNote {
  originalNote: number;
  ornamentedSequence: number[];
  durations: number[];
  type: string;
}

/**
 * Musical ornamentation system
 * Based on the Python djalgo harmony module (Ornament class)
 */
export class Ornament {
  private options: Required<OrnamentOptions>;

  constructor(options: OrnamentOptions = {}) {
    this.options = {
      density: options.density || 0.3,
      maxInterval: options.maxInterval || 7,
      rhythmicVariation: options.rhythmicVariation || true,
      graceNoteDuration: options.graceNoteDuration || 0.125
    };
  }

  /**
   * Apply ornamentation to a melody
   */
  public ornament(melody: number[], durations?: number[]): OrnamentedNote[] {
    const ornamentedMelody: OrnamentedNote[] = [];
    
    for (let i = 0; i < melody.length; i++) {
      const note = melody[i];
      const duration = durations?.[i] || 1;
      
      if (Math.random() < this.options.density) {
        const ornamentType = this.selectOrnamentType(note, melody[i + 1], i === melody.length - 1);
        const ornamented = this.applyOrnament(note, melody[i + 1], ornamentType, duration);
        ornamentedMelody.push(ornamented);
      } else {
        // No ornamentation
        ornamentedMelody.push({
          originalNote: note,
          ornamentedSequence: [note],
          durations: [duration],
          type: 'none'
        });
      }
    }
    
    return ornamentedMelody;
  }

  /**
   * Select appropriate ornament type based on context
   */
  private selectOrnamentType(currentNote: number, nextNote?: number, isLast: boolean = false): string {
    const ornamentTypes = ['grace', 'trill', 'mordent', 'turn'];
    
    // Filter based on context
    const availableTypes = ornamentTypes.filter(type => {
      switch (type) {
        case 'grace':
          return !isLast && nextNote !== undefined;
        case 'trill':
        case 'mordent':
        case 'turn':
          return true;
        default:
          return false;
      }
    });
    
    return availableTypes[Math.floor(Math.random() * availableTypes.length)];
  }

  /**
   * Apply specific ornament to a note
   */
  private applyOrnament(note: number, nextNote: number | undefined, type: string, duration: number): OrnamentedNote {
    switch (type) {
      case 'grace':
        return this.addGraceNote(note, nextNote, duration);
      case 'trill':
        return this.addTrill(note, duration);
      case 'mordent':
        return this.addMordent(note, duration);
      case 'turn':
        return this.addTurn(note, duration);
      case 'arpeggio':
        return this.addArpeggio(note, duration);
      case 'slide':
        return this.addSlide(note, nextNote, duration);
      default:
        return {
          originalNote: note,
          ornamentedSequence: [note],
          durations: [duration],
          type: 'none'
        };
    }
  }

  /**
   * Add grace note ornamentation
   */
  private addGraceNote(note: number, nextNote: number | undefined, duration: number): OrnamentedNote {
    if (nextNote === undefined) {
      return {
        originalNote: note,
        ornamentedSequence: [note],
        durations: [duration],
        type: 'none'
      };
    }
    
    const graceNote = this.getAuxiliaryNote(note, nextNote);
    const graceDuration = this.options.graceNoteDuration;
    const mainDuration = duration - graceDuration;
    
    return {
      originalNote: note,
      ornamentedSequence: [graceNote, note],
      durations: [graceDuration, Math.max(0.125, mainDuration)],
      type: 'grace'
    };
  }

  /**
   * Add trill ornamentation
   */
  private addTrill(note: number, duration: number): OrnamentedNote {
    const upperNote = note + this.getTrillInterval();
    const trillDuration = duration / 8; // 8 alternations
    const sequence: number[] = [];
    const durations: number[] = [];
    
    for (let i = 0; i < 8; i++) {
      sequence.push(i % 2 === 0 ? note : upperNote);
      durations.push(trillDuration);
    }
    
    return {
      originalNote: note,
      ornamentedSequence: sequence,
      durations: durations,
      type: 'trill'
    };
  }

  /**
   * Add mordent ornamentation (quick alternation)
   */
  private addMordent(note: number, duration: number): OrnamentedNote {
    const auxiliary = note + (Math.random() < 0.5 ? 1 : -1); // Upper or lower mordent
    const ornamentDuration = Math.min(duration / 4, this.options.graceNoteDuration);
    const mainDuration = duration - ornamentDuration * 2;
    
    return {
      originalNote: note,
      ornamentedSequence: [note, auxiliary, note],
      durations: [ornamentDuration, ornamentDuration, Math.max(0.125, mainDuration)],
      type: 'mordent'
    };
  }

  /**
   * Add turn ornamentation (four-note figure)
   */
  private addTurn(note: number, duration: number): OrnamentedNote {
    const upper = note + 1;
    const lower = note - 1;
    const noteDuration = duration / 4;
    
    return {
      originalNote: note,
      ornamentedSequence: [upper, note, lower, note],
      durations: [noteDuration, noteDuration, noteDuration, noteDuration],
      type: 'turn'
    };
  }

  /**
   * Add arpeggio ornamentation (broken chord)
   */
  private addArpeggio(note: number, duration: number): OrnamentedNote {
    const chord = this.buildArpeggioChord(note);
    const noteDuration = duration / chord.length;
    const durations = Array(chord.length).fill(noteDuration);
    
    return {
      originalNote: note,
      ornamentedSequence: chord,
      durations: durations,
      type: 'arpeggio'
    };
  }

  /**
   * Add slide ornamentation (glissando effect)
   */
  private addSlide(note: number, nextNote: number | undefined, duration: number): OrnamentedNote {
    if (nextNote === undefined || Math.abs(nextNote - note) <= 1) {
      return {
        originalNote: note,
        ornamentedSequence: [note],
        durations: [duration],
        type: 'none'
      };
    }
    
    const steps = Math.min(Math.abs(nextNote - note), 5); // Limit slide length
    const sequence: number[] = [];
    const stepDuration = duration / (steps + 1);
    const durations: number[] = [];
    
    const direction = nextNote > note ? 1 : -1;
    
    for (let i = 0; i <= steps; i++) {
      sequence.push(note + i * direction);
      durations.push(stepDuration);
    }
    
    return {
      originalNote: note,
      ornamentedSequence: sequence,
      durations: durations,
      type: 'slide'
    };
  }

  /**
   * Get auxiliary note for grace notes
   */
  private getAuxiliaryNote(note: number, nextNote: number): number {
    const interval = nextNote - note;
    
    if (Math.abs(interval) <= 2) {
      // Small interval - use step in opposite direction
      return note + (interval > 0 ? -1 : 1);
    } else {
      // Large interval - use step towards target
      return note + (interval > 0 ? 1 : -1);
    }
  }

  /**
   * Get trill interval (usually whole or half step)
   */
  private getTrillInterval(): number {
    return Math.random() < 0.7 ? 1 : 2; // 70% half step, 30% whole step
  }

  /**
   * Build arpeggio chord from root note
   */
  private buildArpeggioChord(root: number): number[] {
    // Simple triad arpeggio
    const chord = [root, root + 4, root + 7, root + 12]; // Root, third, fifth, octave
    
    // Randomize direction
    if (Math.random() < 0.5) {
      return chord.reverse();
    }
    
    return chord;
  }

  /**
   * Apply rhythmic ornamentation (syncopation, etc.)
   */
  public rhythmicOrnamentation(durations: number[]): number[] {
    if (!this.options.rhythmicVariation) return durations;
    
    const ornamentedDurations = [...durations];
    
    for (let i = 0; i < ornamentedDurations.length - 1; i++) {
      if (Math.random() < this.options.density / 2) {
        // Create syncopation by borrowing time from next note
        const borrowAmount = Math.min(ornamentedDurations[i + 1] * 0.25, 0.25);
        ornamentedDurations[i] += borrowAmount;
        ornamentedDurations[i + 1] -= borrowAmount;
      }
    }
    
    return ornamentedDurations;
  }

  /**
   * Create compound ornamentation (multiple ornaments)
   */
  public compoundOrnamentation(melody: number[], durations?: number[]): OrnamentedNote[] {
    let ornamentedMelody = this.ornament(melody, durations);
    
    // Apply second layer of ornamentation to some notes
    for (let i = 0; i < ornamentedMelody.length; i++) {
      if (Math.random() < this.options.density / 3 && ornamentedMelody[i].type === 'none') {
        const secondOrnamentation = this.applyOrnament(
          ornamentedMelody[i].originalNote,
          melody[i + 1],
          'grace',
          ornamentedMelody[i].durations[0]
        );
        ornamentedMelody[i] = secondOrnamentation;
      }
    }
    
    return ornamentedMelody;
  }

  /**
   * Get ornamentation statistics
   */
  public getStatistics(ornamentedMelody: OrnamentedNote[]): {
    totalNotes: number;
    ornamentedNotes: number;
    ornamentationRate: number;
    ornamentTypes: Record<string, number>;
  } {
    const stats = {
      totalNotes: ornamentedMelody.length,
      ornamentedNotes: 0,
      ornamentationRate: 0,
      ornamentTypes: {} as Record<string, number>
    };
    
    for (const note of ornamentedMelody) {
      if (note.type !== 'none') {
        stats.ornamentedNotes++;
      }
      
      stats.ornamentTypes[note.type] = (stats.ornamentTypes[note.type] || 0) + 1;
    }
    
    stats.ornamentationRate = stats.ornamentedNotes / stats.totalNotes;
    
    return stats;
  }
}