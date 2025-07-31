import { ChromaticNote, ScaleMode, MusicalScale } from '../../types/music';
import { Pitch } from '../../types/common';
import { MusicTheoryConstants } from './MusicTheoryConstants';
import { JMonSequence, JMonNote } from '../../types/jmon';
import { JMonConverter } from '../../io/jmon/conversion';

export class Scale {
  public readonly tonic: ChromaticNote;
  public readonly mode: ScaleMode;

  constructor(tonic: ChromaticNote, mode: ScaleMode) {
    this.tonic = tonic;
    this.mode = mode;
  }

  public generate(octave = 4, length?: number): Pitch[] {
    const intervals = MusicTheoryConstants.scaleIntervals[this.mode];
    const tonicIndex = MusicTheoryConstants.getChromaticIndex(this.tonic);
    
    const basePitches = intervals.map(interval => {
      const noteIndex = (tonicIndex + interval) % 12;
      return 60 + (octave - 4) * 12 + noteIndex; // MIDI note number
    });

    if (length === undefined) {
      return basePitches;
    }

    const result: Pitch[] = [];
    let currentOctave = octave;
    
    for (let i = 0; i < length; i++) {
      const scaleIndex = i % intervals.length;
      if (scaleIndex === 0 && i > 0) {
        currentOctave++;
      }
      
      const interval = intervals[scaleIndex]!;
      const noteIndex = (tonicIndex + interval) % 12;
      const pitch = 60 + (currentOctave - 4) * 12 + noteIndex;
      result.push(pitch);
    }

    return result;
  }

  public getMusicalScale(): MusicalScale {
    const pitches = this.generate();
    return {
      tonic: this.tonic,
      mode: this.mode,
      pitches,
    };
  }

  public getDegree(degree: number, octave = 4): Pitch {
    const intervals = MusicTheoryConstants.scaleIntervals[this.mode];
    const normalizedDegree = ((degree - 1) % intervals.length);
    const octaveOffset = Math.floor((degree - 1) / intervals.length);
    
    const interval = intervals[normalizedDegree]!;
    const tonicIndex = MusicTheoryConstants.getChromaticIndex(this.tonic);
    const noteIndex = (tonicIndex + interval) % 12;
    
    return 60 + (octave + octaveOffset - 4) * 12 + noteIndex;
  }

  public getNoteNames(): ChromaticNote[] {
    const intervals = MusicTheoryConstants.scaleIntervals[this.mode];
    const tonicIndex = MusicTheoryConstants.getChromaticIndex(this.tonic);
    
    return intervals.map(interval => {
      const noteIndex = (tonicIndex + interval) % 12;
      return MusicTheoryConstants.chromaticScale[noteIndex]!;
    });
  }

  public isInScale(pitch: Pitch): boolean {
    const pitchClass = pitch % 12;
    const scalePitches = this.generate().map(p => p % 12);
    return scalePitches.includes(pitchClass);
  }

  /**
   * Get the scale degrees as MIDI note numbers
   * Returns the pitches of the scale in the default octave
   */
  public getScaleDegrees(octave: number = 4): Pitch[] {
    return this.generate(octave);
  }

  public getClosestScalePitch(pitch: Pitch): Pitch {
    const scalePitches = this.generate(Math.floor(pitch / 12), 8); // Generate enough pitches
    
    let closest = scalePitches[0]!;
    let minDistance = Math.abs(pitch - closest);
    
    for (const scalePitch of scalePitches) {
      const distance = Math.abs(pitch - scalePitch);
      if (distance < minDistance) {
        minDistance = distance;
        closest = scalePitch;
      }
    }
    
    return closest;
  }

  public toJMonSequence(
    options: {
      length?: number;
      octave?: number;
      duration?: string;
      velocity?: number;
      label?: string;
    } = {}
  ): JMonSequence {
    const {
      length = 8,
      octave = 4,
      duration = '4n',
      velocity = 0.8,
      label = `${this.tonic} ${this.mode} scale`
    } = options;

    const pitches = this.generate(octave, length);
    const notes: JMonNote[] = pitches.map((pitch, index) => ({
      note: JMonConverter.midiToNoteName(pitch),
      time: JMonConverter.timeToMusicalTime(index),
      duration,
      velocity
    }));

    return {
      label,
      notes,
      synth: {
        type: 'Synth',
        options: {
          oscillator: { type: 'sine' },
          envelope: { attack: 0.02, decay: 0.1, sustain: 0.3, release: 0.5 }
        }
      }
    };
  }

  /**
   * Create Observable Plot visualization of scale pitches
   */
  public plotScale(octave: number = 4, length: number = 8, options?: any): ReturnType<typeof import('../../visualization/plots/PlotRenderer').PlotRenderer.bar> {
    const { PlotRenderer } = require('../../visualization/plots/PlotRenderer');
    const pitches = this.generate(octave, length);
    const noteNames = this.getNoteNames();
    
    const data = {
      x: pitches.map((_, i) => noteNames[i % noteNames.length] || `${i + 1}`),
      y: pitches,
      color: pitches.map(() => 'steelblue')
    };

    return PlotRenderer.bar(data, {
      title: `${this.tonic} ${this.mode} Scale`,
      width: 600,
      height: 300,
      showAxis: true,
      ...options
    });
  }

  /**
   * Create Observable Plot radar chart of scale intervals
   */
  public plotIntervals(options?: any): ReturnType<typeof import('../../visualization/plots/PlotRenderer').PlotRenderer.radar> {
    const { PlotRenderer } = require('../../visualization/plots/PlotRenderer');
    const intervals = MusicTheoryConstants.scaleIntervals[this.mode];
    const noteNames = this.getNoteNames();
    
    const data = {
      x: intervals.map((_, i) => i * (360 / intervals.length)), // Convert to angles
      y: intervals.map(() => 1), // All points at same radius
      color: noteNames.map(() => 'steelblue')
    };

    return PlotRenderer.radar(data, {
      title: `${this.tonic} ${this.mode} Scale Intervals`,
      width: 400,
      height: 400,
      ...options
    });
  }
}