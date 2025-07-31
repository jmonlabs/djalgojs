// Polyloop types for visualization and generation
export interface PolyloopPoint {
  angle: number;       // Position around the circle (0-360 degrees)
  radius: number;      // Distance from center (0-1)
  active: boolean;     // Whether this point triggers a note
  pitch?: number | undefined;      // MIDI note number when triggered
  velocity?: number;   // Note velocity (0-1)
  instrument?: string; // Instrument identifier
}

export interface PolyloopLayer {
  points: PolyloopPoint[];
  color: string;
  label: string;
  instrument: string;
  divisions: number;   // Number of divisions around the circle
  speed: number;       // Rotation speed (cycles per measure)
}

export interface PolyloopConfig {
  layers: PolyloopLayer[];
  bpm: number;
  timeSignature: [number, number];
  measures: number;
}

export interface PolyloopTrigger {
  time: number;        // Time in beats
  layer: string;       // Layer identifier
  point: PolyloopPoint; // The triggered point
  angle: number;       // Current rotation angle
}
