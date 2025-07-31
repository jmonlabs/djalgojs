import { PolyloopPoint, PolyloopLayer, PolyloopConfig, PolyloopTrigger } from '../../types/polyloop';
import { JMonSequence, JMonNote } from '../../types/jmon';
import { JMonConverter } from '../../io/jmon/conversion';

export class Polyloop {
  private config: PolyloopConfig;
  private currentTime: number = 0;
  private rotationAngles: Map<string, number> = new Map();

  constructor(config: PolyloopConfig) {
    this.config = config;
    // Initialize rotation angles for each layer
    this.config.layers.forEach(layer => {
      this.rotationAngles.set(layer.label, 0);
    });
  }

  /**
   * Create a simple polyloop layer from rhythmic pattern
   */
  public static fromRhythm(
    durations: number[],
    pitches: number[] = [60],
    options: {
      instrument?: string;
      color?: string;
      label?: string;
      speed?: number;
      radius?: number;
    } = {}
  ): PolyloopLayer {
    const {
      instrument = 'synth',
      color = 'steelblue',
      label = 'Polyloop',
      speed = 1,
      radius = 0.8
    } = options;

    const totalDuration = durations.reduce((sum, dur) => sum + dur, 0);
    const points: PolyloopPoint[] = [];
    
    let currentAngle = 0;
    durations.forEach((duration, index) => {
      const angleStep = (duration / totalDuration) * 360;
      
      points.push({
        angle: currentAngle,
        radius,
        active: duration > 0,
        pitch: duration > 0 ? pitches[index % pitches.length] : undefined,
        velocity: 0.8,
        instrument
      });
      
      currentAngle += angleStep;
    });

    return {
      points,
      color,
      label,
      instrument,
      divisions: durations.length,
      speed
    };
  }

  /**
   * Create polyloop layer from Euclidean rhythm
   */
  public static euclidean(
    beats: number,
    pulses: number,
    pitches: number[] = [60],
    options: {
      instrument?: string;
      color?: string;
      label?: string;
      speed?: number;
      radius?: number;
    } = {}
  ): PolyloopLayer {
    const {
      instrument = 'synth',
      color = 'steelblue', 
      label = `Euclidean ${pulses}/${beats}`,
      speed = 1,
      radius = 0.8
    } = options;

    // Generate Euclidean rhythm
    const pattern = this.generateEuclideanRhythm(beats, pulses);
    const points: PolyloopPoint[] = [];
    
    pattern.forEach((active, index) => {
      const angle = (index / beats) * 360;
      
      points.push({
        angle,
        radius,
        active,
        pitch: active ? pitches[index % pitches.length] : undefined,
        velocity: 0.8,
        instrument
      });
    });

    return {
      points,
      color,
      label,
      instrument,
      divisions: beats,
      speed
    };
  }

  /**
   * Generate Euclidean rhythm pattern
   */
  private static generateEuclideanRhythm(beats: number, pulses: number): boolean[] {
    if (pulses >= beats) {
      return Array(beats).fill(true);
    }
    
    const pattern: boolean[] = Array(beats).fill(false);
    const interval = beats / pulses;
    
    for (let i = 0; i < pulses; i++) {
      const index = Math.round(i * interval) % beats;
      pattern[index] = true;
    }
    
    return pattern;
  }

  /**
   * Create polyloop with mathematical function
   */
  public static fromFunction(
    func: (angle: number) => number,
    divisions: number = 16,
    pitchRange: [number, number] = [60, 72],
    options: {
      instrument?: string;
      color?: string;
      label?: string;
      speed?: number;
      activeThreshold?: number;
    } = {}
  ): PolyloopLayer {
    const {
      instrument = 'synth',
      color = 'purple',
      label = 'Function Polyloop',
      speed = 1,
      activeThreshold = 0.5
    } = options;

    const points: PolyloopPoint[] = [];
    const [minPitch, maxPitch] = pitchRange;
    
    for (let i = 0; i < divisions; i++) {
      const angle = (i / divisions) * 360;
      const angleRad = (angle * Math.PI) / 180;
      const value = func(angleRad);
      const normalizedValue = Math.abs(value) % 1;
      
      points.push({
        angle,
        radius: 0.3 + normalizedValue * 0.5, // Vary radius based on function
        active: normalizedValue > activeThreshold,
        pitch: Math.round(minPitch + normalizedValue * (maxPitch - minPitch)),
        velocity: 0.5 + normalizedValue * 0.5,
        instrument
      });
    }

    return {
      points,
      color,
      label,
      instrument,
      divisions,
      speed
    };
  }

  /**
   * Advance time and calculate triggers
   */
  public step(deltaTime: number): PolyloopTrigger[] {
    this.currentTime += deltaTime;
    const triggers: PolyloopTrigger[] = [];
    
    this.config.layers.forEach(layer => {
      const currentAngle = this.rotationAngles.get(layer.label) || 0;
      const newAngle = (currentAngle + (deltaTime * layer.speed * 360)) % 360;
      this.rotationAngles.set(layer.label, newAngle);
      
      // Check for triggers when the rotation line crosses points
      layer.points.forEach(point => {
        if (!point.active) return;
        
        const angleDiff = Math.abs(newAngle - point.angle);
        const crossedPoint = angleDiff < (layer.speed * 360 * deltaTime) + 1; // Small tolerance
        
        if (crossedPoint) {
          triggers.push({
            time: this.currentTime,
            layer: layer.label,
            point,
            angle: newAngle
          });
        }
      });
    });
    
    return triggers;
  }

  /**
   * Generate a sequence of triggers for a given duration
   */
  public generateSequence(duration: number, stepsPerBeat: number = 16): PolyloopTrigger[] {
    const stepSize = 1 / stepsPerBeat; // Duration of each step in beats
    const totalSteps = Math.floor(duration / stepSize);
    const allTriggers: PolyloopTrigger[] = [];
    
    this.currentTime = 0;
    this.resetRotations();
    
    for (let step = 0; step < totalSteps; step++) {
      const triggers = this.step(stepSize);
      allTriggers.push(...triggers);
    }
    
    return allTriggers;
  }

  /**
   * Reset all rotation angles
   */
  public resetRotations(): void {
    this.config.layers.forEach(layer => {
      this.rotationAngles.set(layer.label, 0);
    });
    this.currentTime = 0;
  }

  /**
   * Convert triggers to JMON sequences
   */
  public toJMonSequences(duration: number = 4): JMonSequence[] {
    const triggers = this.generateSequence(duration);
    const sequencesByLayer = new Map<string, PolyloopTrigger[]>();
    
    // Group triggers by layer
    triggers.forEach(trigger => {
      if (!sequencesByLayer.has(trigger.layer)) {
        sequencesByLayer.set(trigger.layer, []);
      }
      sequencesByLayer.get(trigger.layer)!.push(trigger);
    });
    
    // Convert each layer to JMON sequence
    const sequences: JMonSequence[] = [];
    
    sequencesByLayer.forEach((layerTriggers, layerName) => {
      const notes: JMonNote[] = layerTriggers.map(trigger => ({
        note: JMonConverter.midiToNoteName(trigger.point.pitch || 60),
        time: JMonConverter.timeToMusicalTime(trigger.time),
        duration: '8n', // Default duration
        velocity: trigger.point.velocity || 0.8
      }));
      
      sequences.push({
        label: layerName,
        notes,
        synth: {
          type: 'Synth',
          options: {
            oscillator: { type: 'sine' },
            envelope: { attack: 0.01, decay: 0.1, sustain: 0.3, release: 0.5 }
          }
        }
      });
    });
    
    return sequences;
  }

  /**
   * Get current state for visualization
   */
  public getVisualizationState(): {
    layers: PolyloopLayer[];
    rotationAngles: Map<string, number>;
    currentTime: number;
  } {
    return {
      layers: this.config.layers,
      rotationAngles: new Map(this.rotationAngles),
      currentTime: this.currentTime
    };
  }

  /**
   * Add a new layer to the polyloop
   */
  public addLayer(layer: PolyloopLayer): void {
    this.config.layers.push(layer);
    this.rotationAngles.set(layer.label, 0);
  }

  /**
   * Remove a layer from the polyloop
   */
  public removeLayer(label: string): boolean {
    const index = this.config.layers.findIndex(layer => layer.label === label);
    if (index !== -1) {
      this.config.layers.splice(index, 1);
      this.rotationAngles.delete(label);
      return true;
    }
    return false;
  }

  /**
   * Create Observable Plot visualization of the polyloop
   */
  public plot(options?: any): ReturnType<typeof import('../../visualization/polyloops/PolyloopVisualizer').PolyloopVisualizer.plotPolyloop> {
    const { PolyloopVisualizer } = require('../../visualization/polyloops/PolyloopVisualizer');
    return PolyloopVisualizer.plotPolyloop(this.config.layers, options);
  }

  /**
   * Create Observable Plot timeline visualization
   */
  public plotTimeline(duration: number = 8, options?: any): ReturnType<typeof import('../../visualization/polyloops/PolyloopVisualizer').PolyloopVisualizer.plotTimeline> {
    const { PolyloopVisualizer } = require('../../visualization/polyloops/PolyloopVisualizer');
    return PolyloopVisualizer.plotTimeline(this.config.layers, duration, options);
  }

  /**
   * Create animated visualization frames
   */
  public plotAnimated(numFrames: number = 12, options?: any): Array<ReturnType<typeof import('../../visualization/polyloops/PolyloopVisualizer').PolyloopVisualizer.plotPolyloop>> {
    const { PolyloopVisualizer } = require('../../visualization/polyloops/PolyloopVisualizer');
    return PolyloopVisualizer.plotAnimated(this.config.layers, numFrames, options);
  }
}