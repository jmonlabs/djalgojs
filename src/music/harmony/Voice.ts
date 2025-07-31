import { Scale } from '../theory/Scale';

export interface VoicingOptions {
  voiceCount?: number;
  voiceRange?: [number, number];
  intervalLimits?: [number, number];
  doubling?: boolean;
  inversion?: number;
}

export interface ChordVoicing {
  notes: number[];
  root: number;
  quality: string;
  inversion: number;
}

/**
 * Voice leading and harmonization system
 * Based on the Python djalgo harmony module (Voice class)
 */
export class Voice {
  private scale: Scale;
  private options: Required<VoicingOptions>;

  constructor(scale: Scale, options: VoicingOptions = {}) {
    this.scale = scale;
    this.options = {
      voiceCount: options.voiceCount || 4,
      voiceRange: options.voiceRange || [48, 84], // C3 to C6
      intervalLimits: options.intervalLimits || [3, 12], // Minor 3rd to octave
      doubling: options.doubling || true,
      inversion: options.inversion || 0
    };
  }

  /**
   * Harmonize a melody with chords
   */
  public harmonizeMelody(melody: number[], chordProgression?: number[]): ChordVoicing[] {
    const harmonizedChords: ChordVoicing[] = [];
    
    for (let i = 0; i < melody.length; i++) {
      const melodyNote = melody[i];
      const chordRoot = chordProgression ? chordProgression[i % chordProgression.length] : this.findBestChordRoot(melodyNote);
      
      const chord = this.buildChord(chordRoot, melodyNote);
      harmonizedChords.push(chord);
    }
    
    return harmonizedChords;
  }

  /**
   * Find the best chord root for a given melody note
   */
  private findBestChordRoot(melodyNote: number): number {
    const scaleDegrees = this.scale.getScaleDegrees();
    const melodyPitchClass = ((melodyNote % 12) + 12) % 12;
    
    // Find scale degrees that contain the melody note
    const possibleRoots: number[] = [];
    
    for (let i = 0; i < scaleDegrees.length; i++) {
      const triad = this.getTriadForDegree(i);
      if (triad.some(note => ((note % 12) + 12) % 12 === melodyPitchClass)) {
        possibleRoots.push(scaleDegrees[i]);
      }
    }
    
    // Return the first valid root, or default to tonic
    return possibleRoots.length > 0 ? possibleRoots[0] : scaleDegrees[0];
  }

  /**
   * Get triad for a scale degree
   */
  private getTriadForDegree(degree: number): number[] {
    const scaleDegrees = this.scale.getScaleDegrees();
    const root = scaleDegrees[degree % scaleDegrees.length];
    const third = scaleDegrees[(degree + 2) % scaleDegrees.length];
    const fifth = scaleDegrees[(degree + 4) % scaleDegrees.length];
    
    return [root, third, fifth];
  }

  /**
   * Build a chord with proper voicing
   */
  private buildChord(root: number, melodyNote: number): ChordVoicing {
    const triad = this.getTriadFromRoot(root);
    const chordTones = this.distributeVoices(triad, melodyNote);
    
    return {
      notes: chordTones,
      root: root,
      quality: this.determineChordQuality(triad),
      inversion: this.options.inversion
    };
  }

  /**
   * Get triad notes from a root
   */
  private getTriadFromRoot(root: number): number[] {
    const scaleDegrees = this.scale.getScaleDegrees();
    const rootIndex = scaleDegrees.indexOf(root % 12);
    
    if (rootIndex === -1) return [root, root + 4, root + 7]; // Default major triad
    
    return this.getTriadForDegree(rootIndex);
  }

  /**
   * Distribute chord tones across voices
   */
  private distributeVoices(triad: number[], melodyNote: number): number[] {
    const voices: number[] = [];
    const [root, third, fifth] = triad;
    const melodyOctave = Math.floor(melodyNote / 12);
    
    // Ensure melody note is the highest voice
    voices.push(melodyNote);
    
    // Add lower voices
    for (let i = 1; i < this.options.voiceCount; i++) {
      const targetOctave = melodyOctave - Math.ceil(i / triad.length);
      let chordTone: number;
      
      switch (i % 3) {
        case 1:
          chordTone = targetOctave * 12 + fifth;
          break;
        case 2:
          chordTone = targetOctave * 12 + third;
          break;
        default:
          chordTone = targetOctave * 12 + root;
      }
      
      // Ensure voice is within range
      chordTone = this.constrainToRange(chordTone);
      voices.unshift(chordTone); // Add to beginning (lower voices first)
    }
    
    return this.applyVoiceLeadingRules(voices);
  }

  /**
   * Constrain note to voice range
   */
  private constrainToRange(note: number): number {
    const [minNote, maxNote] = this.options.voiceRange;
    
    while (note < minNote) note += 12;
    while (note > maxNote) note -= 12;
    
    return note;
  }

  /**
   * Apply voice leading rules
   */
  private applyVoiceLeadingRules(voices: number[]): number[] {
    const improvedVoices = [...voices];
    
    // Check and fix voice crossing
    for (let i = 1; i < improvedVoices.length; i++) {
      if (improvedVoices[i] <= improvedVoices[i - 1]) {
        // Voice crossing detected, adjust upper voice
        improvedVoices[i] = improvedVoices[i - 1] + this.options.intervalLimits[0];
      }
    }
    
    // Check interval limits
    for (let i = 1; i < improvedVoices.length; i++) {
      const interval = improvedVoices[i] - improvedVoices[i - 1];
      const [minInterval, maxInterval] = this.options.intervalLimits;
      
      if (interval < minInterval) {
        improvedVoices[i] = improvedVoices[i - 1] + minInterval;
      } else if (interval > maxInterval) {
        improvedVoices[i] = improvedVoices[i - 1] + maxInterval;
      }
    }
    
    return improvedVoices;
  }

  /**
   * Determine chord quality from triad
   */
  private determineChordQuality(triad: number[]): string {
    if (triad.length < 3) return 'unknown';
    
    const [root, third, fifth] = triad.map(note => note % 12);
    const thirdInterval = ((third - root + 12) % 12);
    const fifthInterval = ((fifth - root + 12) % 12);
    
    if (thirdInterval === 4 && fifthInterval === 7) return 'major';
    if (thirdInterval === 3 && fifthInterval === 7) return 'minor';
    if (thirdInterval === 4 && fifthInterval === 6) return 'augmented';
    if (thirdInterval === 3 && fifthInterval === 6) return 'diminished';
    
    return 'unknown';
  }

  /**
   * Create smooth voice leading between two chords
   */
  public smoothVoiceLeading(fromChord: ChordVoicing, toChord: ChordVoicing): ChordVoicing {
    const improvedToChord = { ...toChord };
    const fromNotes = fromChord.notes;
    const toNotes = [...toChord.notes];
    
    // Find the best voice leading by minimizing total voice movement
    const bestVoicing = this.findMinimalMovement(fromNotes, toNotes);
    improvedToChord.notes = bestVoicing;
    
    return improvedToChord;
  }

  /**
   * Find voicing with minimal voice movement
   */
  private findMinimalMovement(fromNotes: number[], toNotes: number[]): number[] {
    const result = new Array(fromNotes.length);
    const usedIndices = new Set<number>();
    
    // For each voice in the from chord, find the closest note in the to chord
    for (let fromIndex = 0; fromIndex < fromNotes.length; fromIndex++) {
      let minDistance = Infinity;
      let bestToIndex = 0;
      
      for (let toIndex = 0; toIndex < toNotes.length; toIndex++) {
        if (usedIndices.has(toIndex)) continue;
        
        const distance = Math.abs(fromNotes[fromIndex] - toNotes[toIndex]);
        if (distance < minDistance) {
          minDistance = distance;
          bestToIndex = toIndex;
        }
      }
      
      result[fromIndex] = toNotes[bestToIndex];
      usedIndices.add(bestToIndex);
    }
    
    return result;
  }

  /**
   * Add seventh to a chord
   */
  public addSeventh(chord: ChordVoicing): ChordVoicing {
    const scaleDegrees = this.scale.getScaleDegrees();
    const rootIndex = scaleDegrees.indexOf(chord.root % 12);
    
    if (rootIndex !== -1) {
      const seventh = scaleDegrees[(rootIndex + 6) % scaleDegrees.length];
      const seventhNote = Math.floor(chord.root / 12) * 12 + seventh;
      
      return {
        ...chord,
        notes: [...chord.notes, seventhNote],
        quality: chord.quality + '7'
      };
    }
    
    return chord;
  }

  /**
   * Create chord inversions
   */
  public invert(chord: ChordVoicing, inversion: number): ChordVoicing {
    const notes = [...chord.notes].sort((a, b) => a - b);
    const inversionCount = inversion % notes.length;
    
    for (let i = 0; i < inversionCount; i++) {
      const lowestNote = notes.shift()!;
      notes.push(lowestNote + 12);
    }
    
    return {
      ...chord,
      notes: notes,
      inversion: inversionCount
    };
  }

  /**
   * Generate four-part harmony for a melody
   */
  public fourPartHarmony(melody: number[]): ChordVoicing[] {
    const oldVoiceCount = this.options.voiceCount;
    this.options.voiceCount = 4;
    
    const harmony = this.harmonizeMelody(melody);
    
    // Apply smooth voice leading
    for (let i = 1; i < harmony.length; i++) {
      harmony[i] = this.smoothVoiceLeading(harmony[i - 1], harmony[i]);
    }
    
    this.options.voiceCount = oldVoiceCount;
    return harmony;
  }
}