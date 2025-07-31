type ScaleMode =
  | 'major'
  | 'minor'
  | 'diminished'
  | 'major pentatonic'
  | 'minor pentatonic'
  | 'chromatic'
  | 'lydian'
  | 'mixolydian'
  | 'dorian'
  | 'phrygian'
  | 'locrian'
  | 'harmonic minor'
  | 'melodic minor ascending'
  | 'melodic minor descending'
  | 'custom';

export class Scale {
  static chromaticScale = [
    'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'
  ];

  static scaleIntervals: Record<ScaleMode, number[]> = {
    major: [0, 2, 4, 5, 7, 9, 11],
    minor: [0, 2, 3, 5, 7, 8, 10],
    diminished: [0, 2, 3, 5, 6, 8, 9, 11],
    'major pentatonic': [0, 2, 4, 7, 9],
    'minor pentatonic': [0, 3, 5, 7, 10],
    chromatic: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
    lydian: [0, 2, 4, 6, 7, 9, 11],
    mixolydian: [0, 2, 4, 5, 7, 9, 10],
    dorian: [0, 2, 3, 5, 7, 9, 10],
    phrygian: [0, 1, 3, 5, 7, 8, 10],
    locrian: [0, 1, 3, 5, 6, 8, 10],
    'harmonic minor': [0, 2, 3, 5, 7, 8, 11],
    'melodic minor ascending': [0, 2, 3, 5, 7, 9, 11],
    'melodic minor descending': [0, 2, 3, 5, 7, 8, 10],
    custom: []
  };

  tonic: string;
  mode: ScaleMode;

  constructor(tonic: string, mode: ScaleMode | number[] = 'major') {
    if (!Scale.chromaticScale.includes(tonic)) {
      tonic = Scale.convertFlatToSharp(tonic);
      if (!Scale.chromaticScale.includes(tonic)) {
        throw new Error(
          `'${tonic}' is not a valid tonic note. Select one among '${Scale.chromaticScale.join(', ')}'.`
        );
      }
    }
    this.tonic = tonic;

    if (Array.isArray(mode)) {
      Scale.scaleIntervals['custom'] = mode;
      this.mode = 'custom';
    } else if (!(mode in Scale.scaleIntervals)) {
      throw new Error(
        `'${mode}' is not a valid scale. Select one among '${Object.keys(Scale.scaleIntervals).join(', ')}' or a list of half steps such as [0, 2, 4, 5, 7, 9, 11] for a major scale.`
      );
    } else {
      this.mode = mode;
    }
  }

  static convertFlatToSharp(note: string): string {
    const flatToSharp: Record<string, string> = {
      Bb: 'A#', Db: 'C#', Eb: 'D#', Gb: 'F#', Ab: 'G#',
      'B-': 'A#', 'D-': 'C#', 'E-': 'D#', 'G-': 'F#', 'A-': 'G#'
    };
    return flatToSharp[note] || note;
  }

  generate(): number[] {
    const tonicNote = Scale.chromaticScale.indexOf(this.tonic);
    const scale = Scale.scaleIntervals[this.mode] || Scale.scaleIntervals['major'];
    const fullRangeScale: number[] = [];
    const addedNotes = new Set<number>();

    for (let octave = 0; octave < 11; octave++) {
      for (const interval of scale) {
        const note = (tonicNote + interval) % 12 + octave * 12;
        if (note <= 127 && !addedNotes.has(note)) {
          fullRangeScale.push(note);
          addedNotes.add(note);
        }
      }
    }
    fullRangeScale.sort((a, b) => a - b);
    return fullRangeScale;
  }
}
