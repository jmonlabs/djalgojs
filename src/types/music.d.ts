export type ScaleMode = 
  | 'major' 
  | 'minor' 
  | 'dorian' 
  | 'phrygian' 
  | 'lydian' 
  | 'mixolydian' 
  | 'locrian';

export type ChromaticNote = 
  | 'C' | 'C#' | 'Db' | 'D' | 'D#' | 'Eb' | 'E' | 'F' 
  | 'F#' | 'Gb' | 'G' | 'G#' | 'Ab' | 'A' | 'A#' | 'Bb' | 'B';

export type Interval = 
  | 'unison' | 'minor2nd' | 'major2nd' | 'minor3rd' | 'major3rd' 
  | 'perfect4th' | 'tritone' | 'perfect5th' | 'minor6th' | 'major6th'
  | 'minor7th' | 'major7th' | 'octave';

export interface ChordProgression {
  chords: string[];
  key: ChromaticNote;
  mode: ScaleMode;
}

export interface MusicalScale {
  tonic: ChromaticNote;
  mode: ScaleMode;
  pitches: Pitch[];
}

export interface RhythmPattern {
  durations: Duration[];
  accents?: boolean[];
  measureLength: number;
}

export interface VoiceLeading {
  voices: Pitch[][];
  ranges: [Pitch, Pitch][];
}

export interface MusicalNote {
  pitch?: number; // MIDI note number, undefined for rests
  duration: number; // Duration in beats
  offset: number; // Start time in beats
  velocity?: number; // Velocity 0-1
  channel?: number; // MIDI channel
}