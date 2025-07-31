import { ChromaticNote, ScaleMode, Interval } from '../../types/music';

export class MusicTheoryConstants {
  public static readonly chromaticScale: ChromaticNote[] = [
    'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'
  ];

  public static readonly intervals: Record<Interval, number> = {
    unison: 0,
    minor2nd: 1,
    major2nd: 2,
    minor3rd: 3,
    major3rd: 4,
    perfect4th: 5,
    tritone: 6,
    perfect5th: 7,
    minor6th: 8,
    major6th: 9,
    minor7th: 10,
    major7th: 11,
    octave: 12,
  };

  public static readonly scaleIntervals: Record<ScaleMode, number[]> = {
    major: [0, 2, 4, 5, 7, 9, 11],
    minor: [0, 2, 3, 5, 7, 8, 10],
    dorian: [0, 2, 3, 5, 7, 9, 10],
    phrygian: [0, 1, 3, 5, 7, 8, 10],
    lydian: [0, 2, 4, 6, 7, 9, 11],
    mixolydian: [0, 2, 4, 5, 7, 9, 10],
    locrian: [0, 1, 3, 5, 6, 8, 10],
  };

  public static convertFlatToSharp(note: string): ChromaticNote {
    const flatToSharp: Record<string, ChromaticNote> = {
      'Db': 'C#',
      'Eb': 'D#',
      'Gb': 'F#',
      'Ab': 'G#',
      'Bb': 'A#',
    };

    return flatToSharp[note] || (note as ChromaticNote);
  }

  public static scaleToTriad(mode: ScaleMode): number[] {
    const intervals = this.scaleIntervals[mode];
    return [intervals[0]!, intervals[2]!, intervals[4]!]; // 1st, 3rd, 5th degrees
  }

  public static getChromaticIndex(note: ChromaticNote): number {
    return this.chromaticScale.indexOf(note);
  }

  public static getNoteFromIndex(index: number): ChromaticNote {
    const normalizedIndex = ((index % 12) + 12) % 12;
    return this.chromaticScale[normalizedIndex]!;
  }

  public static transposeNote(note: ChromaticNote, semitones: number): ChromaticNote {
    const currentIndex = this.getChromaticIndex(note);
    const newIndex = currentIndex + semitones;
    return this.getNoteFromIndex(newIndex);
  }

  public static getInterval(note1: ChromaticNote, note2: ChromaticNote): number {
    const index1 = this.getChromaticIndex(note1);
    const index2 = this.getChromaticIndex(note2);
    return ((index2 - index1) + 12) % 12;
  }
}