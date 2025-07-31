import { ChromaticNote, ScaleMode, ChordProgression } from '../../types/music';
import { Pitch } from '../../types/common';
// import { MusicTheoryConstants } from './MusicTheoryConstants';
import { Scale } from './Scale';
import { JMonSequence, JMonNote } from '../../types/jmon';
import { JMonConverter } from '../../io/jmon/conversion';

export interface ProgressionOptions {
  length?: number;
  octave?: number;
  voicing?: 'triad' | 'seventh' | 'extended';
}

export class Progression {
  private scale: Scale;

  constructor(tonic: ChromaticNote, mode: ScaleMode = 'major') {
    this.scale = new Scale(tonic, mode);
  }

  public generate(options: ProgressionOptions = {}): ChordProgression {
    const { length = 4, voicing = 'triad' } = options;
    
    // Common chord progressions by mode
    const progressionPatterns: Record<ScaleMode, number[][]> = {
      major: [[1, 4, 5, 1], [1, 6, 4, 5], [1, 5, 6, 4], [2, 5, 1, 1]],
      minor: [[1, 4, 5, 1], [1, 6, 4, 5], [1, 7, 6, 7], [1, 3, 7, 1]],
      dorian: [[1, 4, 1, 4], [1, 7, 4, 1], [1, 2, 7, 1]],
      phrygian: [[1, 2, 1, 2], [1, 7, 6, 1]],
      lydian: [[1, 2, 1, 2], [1, 5, 4, 1]],
      mixolydian: [[1, 7, 4, 1], [1, 4, 7, 1]],
      locrian: [[1, 2, 1, 2]],
    };

    const patterns = progressionPatterns[this.scale.mode];
    const selectedPattern = patterns[Math.floor(Math.random() * patterns.length)]!;
    
    // Adjust pattern length to match requested length
    const chords: string[] = [];
    for (let i = 0; i < length; i++) {
      const degree = selectedPattern[i % selectedPattern.length]!;
      const chord = this.generateChord(degree, voicing);
      chords.push(chord);
    }

    return {
      chords,
      key: this.scale.tonic,
      mode: this.scale.mode,
    };
  }

  public generateChord(degree: number, voicing: 'triad' | 'seventh' | 'extended' = 'triad'): string {
    const scaleNotes = this.scale.getNoteNames();
    const rootNote = scaleNotes[(degree - 1) % scaleNotes.length]!;
    
    // Determine chord quality based on scale degree and mode
    const chordQuality = this.getChordQuality(degree);
    
    let chordSymbol = rootNote;
    
    switch (voicing) {
      case 'triad':
        chordSymbol += chordQuality;
        break;
      case 'seventh':
        chordSymbol += chordQuality;
        chordSymbol += this.getSeventhQuality(degree);
        break;
      case 'extended':
        chordSymbol += chordQuality;
        chordSymbol += this.getSeventhQuality(degree);
        if (Math.random() > 0.5) {
          chordSymbol += this.getExtension();
        }
        break;
    }
    
    return chordSymbol;
  }

  public computeCircle(steps = 8): ChordProgression {
    // Circle of fifths progression
    const chords: string[] = [];
    let currentDegree = 1;
    
    for (let i = 0; i < steps; i++) {
      const chord = this.generateChord(currentDegree, 'triad');
      chords.push(chord);
      
      // Move by fifth (4 scale degrees up)
      currentDegree = ((currentDegree + 3) % 7) + 1;
    }
    
    return {
      chords,
      key: this.scale.tonic,
      mode: this.scale.mode,
    };
  }

  public getChordPitches(degree: number, octave = 4, voicing: 'triad' | 'seventh' = 'triad'): Pitch[] {
    const intervals = voicing === 'triad' ? [0, 2, 4] : [0, 2, 4, 6];
    
    return intervals.map(interval => {
      const scaleDegree = ((degree - 1 + interval) % 7) + 1;
      return this.scale.getDegree(scaleDegree, octave);
    });
  }

  private getChordQuality(degree: number): string {
    const qualityMap: Record<ScaleMode, Record<number, string>> = {
      major: { 1: '', 2: 'm', 3: 'm', 4: '', 5: '', 6: 'm', 7: 'dim' },
      minor: { 1: 'm', 2: 'dim', 3: '', 4: 'm', 5: 'm', 6: '', 7: '' },
      dorian: { 1: 'm', 2: 'm', 3: '', 4: '', 5: 'm', 6: 'dim', 7: '' },
      phrygian: { 1: 'm', 2: '', 3: '', 4: 'm', 5: 'dim', 6: '', 7: 'm' },
      lydian: { 1: '', 2: '', 3: 'm', 4: 'dim', 5: '', 6: 'm', 7: 'm' },
      mixolydian: { 1: '', 2: 'm', 3: 'dim', 4: '', 5: 'm', 6: 'm', 7: '' },
      locrian: { 1: 'dim', 2: '', 3: 'm', 4: 'm', 5: '', 6: '', 7: 'm' },
    };

    return qualityMap[this.scale.mode]?.[degree] || '';
  }

  private getSeventhQuality(degree: number): string {
    // Simplified seventh quality logic
    const quality = this.getChordQuality(degree);
    if (quality === 'm') return '7';
    if (quality === 'dim') return 'ø7';
    if (degree === 5 || degree === 7) return '7';
    return 'maj7';
  }

  private getExtension(): string {
    const extensions = ['add9', 'sus2', 'sus4', '6'];
    return extensions[Math.floor(Math.random() * extensions.length)]!;
  }

  public toJMonSequence(
    options: {
      length?: number;
      octave?: number;
      duration?: string;
      velocity?: number;
      label?: string;
      voicing?: 'triad' | 'seventh';
      strumPattern?: boolean;
    } = {}
  ): JMonSequence {
    const {
      length = 4,
      octave = 4,
      duration = '1n',
      velocity = 0.8,
      label = `${this.scale.tonic} ${this.scale.mode} progression`,
      voicing = 'triad',
      strumPattern = false
    } = options;

    const progression = this.generate({ length, voicing });
    const notes: JMonNote[] = [];

    progression.chords.forEach((_, chordIndex) => {
      const chordDegree = ((chordIndex % 7) + 1);
      const chordPitches = this.getChordPitches(chordDegree, octave, voicing);
      
      if (strumPattern) {
        // Arpeggiate the chord
        chordPitches.forEach((pitch, noteIndex) => {
          notes.push({
            note: JMonConverter.midiToNoteName(pitch),
            time: JMonConverter.timeToMusicalTime(chordIndex + noteIndex * 0.1),
            duration: '8n',
            velocity: velocity * (noteIndex === 0 ? 1 : 0.8)
          });
        });
      } else {
        // Play chord as block
        notes.push({
          note: chordPitches.map(pitch => JMonConverter.midiToNoteName(pitch)),
          time: JMonConverter.timeToMusicalTime(chordIndex),
          duration,
          velocity
        });
      }
    });

    return {
      label,
      notes,
      synth: {
        type: 'PolySynth',
        options: {
          oscillator: { type: 'sawtooth' },
          envelope: { attack: 0.02, decay: 0.1, sustain: 0.5, release: 1.0 }
        }
      }
    };
  }
}