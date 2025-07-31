// JMON (JSON Music Object Notation) TypeScript definitions
// Based on jmon-schema.json

export type MusicalTime = string; // "bars:beats:ticks" format (e.g., "2:1:240")
export type NoteDuration = string; // "4n", "8n", "2t", etc. or "bars:beats:ticks"
export type LegacyTime = number; // Deprecated numeric time
export type FlexibleTime = MusicalTime | NoteDuration | LegacyTime;

export type NoteValue = string | number | Array<string | number>;
export type KeySignature = string; // "C", "Am", "F#", etc.
export type TimeSignature = string; // "4/4", "3/4", etc.

export interface ModulationEvent {
  type: 'cc' | 'pitchBend' | 'aftertouch';
  controller?: number; // Required for CC
  value: number; // 0-127 for CC/aftertouch, -8192 to +8192 for pitchBend
  time: FlexibleTime; // Relative to note start
}

export interface JMonNote {
  note: NoteValue;
  time: FlexibleTime;
  duration: NoteDuration | MusicalTime | number;
  velocity?: number; // 0-1
  articulation?: string;
  microtuning?: number;
  channel?: number; // 0-15
  modulations?: ModulationEvent[];
}

export interface TempoChange {
  time: FlexibleTime;
  bpm: number; // 20-400
}

export interface KeySignatureChange {
  time: FlexibleTime;
  keySignature: KeySignature;
}

export interface TimeSignatureChange {
  time: FlexibleTime;
  timeSignature: TimeSignature;
}

export interface Transport {
  startOffset?: FlexibleTime;
  globalLoop?: boolean;
  globalLoopEnd?: MusicalTime;
  swing?: number; // 0-1
}

export interface Metadata {
  name?: string;
  author?: string;
  description?: string;
  [key: string]: any; // Allow arbitrary fields
}

export interface CustomPreset {
  id: string;
  type: string;
  options: Record<string, any>;
}

export interface SynthConfig {
  type: 'Synth' | 'PolySynth' | 'MonoSynth' | 'AMSynth' | 'FMSynth' | 'DuoSynth' | 'PluckSynth' | 'NoiseSynth' | 'Sampler';
  options?: Record<string, any>;
  presetRef?: string;
  modulationTarget?: 'vibrato' | 'tremolo' | 'glissando' | 'filter';
}

export interface Effect {
  type: string;
  options?: Record<string, any>;
  presetRef?: string;
}

export interface AudioNode {
  id: string;
  type: 'Synth' | 'PolySynth' | 'MonoSynth' | 'AMSynth' | 'FMSynth' | 'DuoSynth' | 'PluckSynth' | 'NoiseSynth' | 'Sampler' | 
        'Filter' | 'AutoFilter' | 'Reverb' | 'FeedbackDelay' | 'PingPongDelay' | 'Delay' | 'Chorus' | 'Phaser' | 'Tremolo' | 
        'Vibrato' | 'AutoWah' | 'Distortion' | 'Chebyshev' | 'BitCrusher' | 'Compressor' | 'Limiter' | 'Gate' | 
        'FrequencyShifter' | 'PitchShift' | 'JCReverb' | 'Freeverb' | 'StereoWidener' | 'MidSideCompressor' | 'Destination';
  options: Record<string, any>;
  target?: string;
  presetRef?: string;
}

export interface JMonSequence {
  label: string;
  midiChannel?: number; // 0-15
  synth?: SynthConfig;
  synthRef?: string;
  notes: JMonNote[];
  loop?: boolean | string;
  loopEnd?: MusicalTime;
  effects?: Effect[];
}

export interface AutomationEvent {
  target: string; // e.g., 'synth.frequency', 'effect.mix', 'midi.cc1'
  time: FlexibleTime;
  value: number;
}

export interface Annotation {
  text: string;
  time: FlexibleTime;
  type?: string; // 'lyric', 'marker', 'comment', 'rehearsal'
  duration?: NoteDuration | MusicalTime | number;
}

export interface ConverterHints {
  tone?: {
    [ccController: string]: {
      target: string;
      parameter?: string;
      frequency?: number;
      depthRange?: [number, number];
    };
  };
  midi?: {
    channel?: number; // 0-15
    port?: string;
  };
}

export interface JMonComposition {
  format: 'jmonTone';
  version: string;
  bpm: number; // 20-400
  keySignature?: KeySignature;
  keySignatureMap?: KeySignatureChange[];
  timeSignature?: TimeSignature;
  timeSignatureMap?: TimeSignatureChange[];
  tempoMap?: TempoChange[];
  transport?: Transport;
  metadata?: Metadata;
  customPresets?: CustomPreset[];
  audioGraph: AudioNode[];
  connections: [string, string][]; // [source, target] pairs
  sequences: JMonSequence[];
  automation?: AutomationEvent[];
  annotations?: Annotation[];
  synthConfig?: SynthConfig; // Global default synth config
  converterHints?: ConverterHints;
}

// Utility types for common patterns
export interface BasicJMonComposition {
  format: 'jmonTone';
  version: string;
  bpm: number;
  audioGraph: AudioNode[];
  connections: [string, string][];
  sequences: JMonSequence[];
}

export interface JMonSequenceBuilder {
  label: string;
  notes: JMonNote[];
  synth?: SynthConfig;
  effects?: Effect[];
}

// Helper types for specific use cases
export interface SimpleNote {
  note: string | number;
  time: string;
  duration: string;
  velocity?: number;
}

export interface ChordNote extends SimpleNote {
  note: Array<string | number>;
}

export interface ModulatedNote extends SimpleNote {
  modulations: ModulationEvent[];
}