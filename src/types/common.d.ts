export type Pitch = number;
export type Duration = number;
export type Velocity = number;
export type Time = number;

export interface Note {
  pitch: Pitch;
  duration: Duration;
  velocity?: Velocity;
  time?: Time;
}

export interface Sequence {
  notes: Note[];
  tempo?: number;
  timeSignature?: [number, number];
}

export type Matrix2D = number[][];
export type Vector = number[];

export interface PlotData {
  x: number[];
  y: number[];
  [key: string]: unknown;
}

export interface GenerationOptions {
  length?: number;
  seed?: number;
  [key: string]: unknown;
}