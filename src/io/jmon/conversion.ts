import { Note, Sequence, Pitch, Duration } from '../../types/common';
import { RhythmPattern } from '../../types/music';
import { 
  JMonNote, 
  JMonSequence, 
  JMonComposition, 
  BasicJMonComposition,
  MusicalTime,
  NoteDuration,
  AudioNode
} from '../../types/jmon';

export class JMonConverter {
  
  /**
   * Convert a numeric time (in beats) to JMON bars:beats:ticks format
   * Assumes 4/4 time signature and 480 ticks per beat
   */
  public static timeToMusicalTime(time: number, timeSignature: [number, number] = [4, 4]): MusicalTime {
    const [beatsPerBar] = timeSignature;
    const ticksPerBeat = 480; // Standard MIDI resolution
    
    const bars = Math.floor(time / beatsPerBar);
    const beats = Math.floor(time % beatsPerBar);
    const ticks = Math.round((time % 1) * ticksPerBeat);
    
    return `${bars}:${beats}:${ticks}`;
  }

  /**
   * Convert a duration in beats to note value format
   */
  public static durationToNoteValue(duration: Duration): NoteDuration {
    // Common duration mappings (assuming 4/4 time)
    const durationsMap: Record<number, string> = {
      4: '1n',    // whole note
      3: '2n.',   // dotted half
      2: '2n',    // half note
      1.5: '4n.', // dotted quarter
      1: '4n',    // quarter note
      0.75: '8n.', // dotted eighth
      0.5: '8n',   // eighth note
      0.25: '16n', // sixteenth note
      0.125: '32n', // thirty-second note
    };

    // Find closest match
    const closest = Object.keys(durationsMap)
      .map(Number)
      .reduce((prev, curr) => 
        Math.abs(curr - duration) < Math.abs(prev - duration) ? curr : prev
      );

    return durationsMap[closest] || `${duration}n`;
  }

  /**
   * Convert a simple Note to JMonNote
   */
  public static noteToJMonNote(note: Note, timeSignature: [number, number] = [4, 4]): JMonNote {
    return {
      note: note.pitch,
      time: note.time !== undefined ? this.timeToMusicalTime(note.time, timeSignature) : '0:0:0',
      duration: this.durationToNoteValue(note.duration),
      velocity: note.velocity || 0.8,
    };
  }

  /**
   * Convert a Sequence to JMonSequence
   */
  public static sequenceToJMonSequence(
    sequence: Sequence, 
    label: string = 'Generated Sequence',
    timeSignature: [number, number] = [4, 4]
  ): JMonSequence {
    return {
      label,
      notes: sequence.notes.map(note => this.noteToJMonNote(note, timeSignature)),
      synth: {
        type: 'Synth',
        options: {
          oscillator: { type: 'triangle' },
          envelope: { attack: 0.02, decay: 0.1, sustain: 0.3, release: 1 }
        }
      }
    };
  }

  /**
   * Convert a RhythmPattern to JMonSequence
   */
  public static rhythmPatternToJMonSequence(
    pattern: RhythmPattern,
    pitches: Pitch[] = [60], // Default to middle C
    label: string = 'Rhythm Pattern'
  ): JMonSequence {
    const notes: JMonNote[] = [];
    let currentTime = 0;
    
    pattern.durations.forEach((duration, index) => {
      const pitch = pitches[index % pitches.length] || 60;
      const isAccented = pattern.accents?.[index] || false;
      
      if (duration > 0) { // Only add notes for non-zero durations
        notes.push({
          note: pitch,
          time: this.timeToMusicalTime(currentTime),
          duration: this.durationToNoteValue(duration),
          velocity: isAccented ? 0.9 : 0.7,
        });
      }
      
      currentTime += duration;
    });

    return {
      label,
      notes,
      synth: {
        type: 'Synth',
        options: {
          oscillator: { type: 'sawtooth' },
          envelope: { attack: 0.01, decay: 0.1, sustain: 0.5, release: 0.3 }
        }
      }
    };
  }

  /**
   * Create a basic JMON composition from sequences
   */
  public static createBasicComposition(
    sequences: JMonSequence[],
    bpm: number = 120,
    metadata?: { name?: string; author?: string; description?: string }
  ): BasicJMonComposition {
    return {
      format: 'jmonTone',
      version: '1.0',
      bpm,
      audioGraph: [
        {
          id: 'master',
          type: 'Destination',
          options: {}
        }
      ],
      connections: [], // Direct to master for now
      sequences,
      ...(metadata && { metadata })
    };
  }

  /**
   * Create a complete JMON composition with effects
   */
  public static createComposition(
    sequences: JMonSequence[],
    options: {
      bpm?: number;
      keySignature?: string;
      timeSignature?: string;
      effects?: Array<{ type: string; options: Record<string, any> }>;
      metadata?: { name?: string; author?: string; description?: string };
    } = {}
  ): JMonComposition {
    const {
      bpm = 120,
      keySignature = 'C',
      timeSignature = '4/4',
      effects = [],
      metadata
    } = options;

    const audioGraph: AudioNode[] = [
      {
        id: 'master',
        type: 'Destination',
        options: {}
      }
    ];

    const connections: [string, string][] = [];

    // Add global effects
    effects.forEach((effect, index) => {
      const effectId = `effect${index}`;
      audioGraph.push({
        id: effectId,
        type: effect.type as any,
        options: effect.options
      });
      connections.push([effectId, 'master']);
    });

    return {
      format: 'jmonTone',
      version: '1.0',
      bpm,
      keySignature,
      timeSignature,
      audioGraph,
      connections,
      sequences,
      ...(metadata && { metadata })
    };
  }

  /**
   * Convert MIDI note number to note name
   */
  public static midiToNoteName(midiNote: number): string {
    const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const octave = Math.floor(midiNote / 12) - 1;
    const noteIndex = midiNote % 12;
    return `${notes[noteIndex]}${octave}`;
  }

  /**
   * Convert note name to MIDI note number
   */
  public static noteNameToMidi(noteName: string): number {
    const noteRegex = /^([A-G])(#|b)?(-?\d+)$/;
    const match = noteName.match(noteRegex);
    
    if (!match) {
      throw new Error(`Invalid note name: ${noteName}`);
    }

    const [, note, accidental, octaveStr] = match;
    if (!note || !octaveStr) {
      throw new Error(`Invalid note name: ${noteName}`);
    }
    const octave = parseInt(octaveStr, 10);
    
    const noteValues: Record<string, number> = {
      'C': 0, 'D': 2, 'E': 4, 'F': 5, 'G': 7, 'A': 9, 'B': 11
    };
    
    let midiNote = noteValues[note]! + (octave + 1) * 12;
    
    if (accidental === '#') {
      midiNote += 1;
    } else if (accidental === 'b') {
      midiNote -= 1;
    }
    
    return midiNote;
  }

  /**
   * Convert a musical time string back to numeric time
   */
  public static musicalTimeToTime(musicalTime: MusicalTime, timeSignature: [number, number] = [4, 4]): number {
    const [beatsPerBar] = timeSignature;
    const ticksPerBeat = 480;
    
    const parts = musicalTime.split(':');
    if (parts.length !== 3) {
      throw new Error(`Invalid musical time format: ${musicalTime}`);
    }
    
    const bars = parseInt(parts[0]!, 10);
    const beats = parseFloat(parts[1]!);
    const ticks = parseInt(parts[2]!, 10);
    
    return bars * beatsPerBar + beats + (ticks / ticksPerBeat);
  }

  /**
   * Validate JMON composition
   */
  public static validateComposition(composition: JMonComposition): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (composition.format !== 'jmonTone') {
      errors.push('Format must be "jmonTone"');
    }
    
    if (composition.bpm < 20 || composition.bpm > 400) {
      errors.push('BPM must be between 20 and 400');
    }
    
    if (!composition.sequences || composition.sequences.length === 0) {
      errors.push('At least one sequence is required');
    }
    
    composition.sequences.forEach((seq, index) => {
      if (!seq.label) {
        errors.push(`Sequence ${index} missing label`);
      }
      
      if (!seq.notes || seq.notes.length === 0) {
        errors.push(`Sequence ${index} has no notes`);
      }
    });
    
    return {
      valid: errors.length === 0,
      errors
    };
  }
}