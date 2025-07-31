import { Note, Sequence, Pitch, Duration } from '../../types/common';
import { RhythmPattern } from '../../types/music';
import { JMonNote, JMonSequence, JMonComposition, BasicJMonComposition, MusicalTime, NoteDuration } from '../../types/jmon';
export declare class JMonConverter {
    /**
     * Convert a numeric time (in beats) to JMON bars:beats:ticks format
     * Assumes 4/4 time signature and 480 ticks per beat
     */
    static timeToMusicalTime(time: number, timeSignature?: [number, number]): MusicalTime;
    /**
     * Convert a duration in beats to note value format
     */
    static durationToNoteValue(duration: Duration): NoteDuration;
    /**
     * Convert a simple Note to JMonNote
     */
    static noteToJMonNote(note: Note, timeSignature?: [number, number]): JMonNote;
    /**
     * Convert a Sequence to JMonSequence
     */
    static sequenceToJMonSequence(sequence: Sequence, label?: string, timeSignature?: [number, number]): JMonSequence;
    /**
     * Convert a RhythmPattern to JMonSequence
     */
    static rhythmPatternToJMonSequence(pattern: RhythmPattern, pitches?: Pitch[], // Default to middle C
    label?: string): JMonSequence;
    /**
     * Create a basic JMON composition from sequences
     */
    static createBasicComposition(sequences: JMonSequence[], bpm?: number, metadata?: {
        name?: string;
        author?: string;
        description?: string;
    }): BasicJMonComposition;
    /**
     * Create a complete JMON composition with effects
     */
    static createComposition(sequences: JMonSequence[], options?: {
        bpm?: number;
        keySignature?: string;
        timeSignature?: string;
        effects?: Array<{
            type: string;
            options: Record<string, any>;
        }>;
        metadata?: {
            name?: string;
            author?: string;
            description?: string;
        };
    }): JMonComposition;
    /**
     * Convert MIDI note number to note name
     */
    static midiToNoteName(midiNote: number): string;
    /**
     * Convert note name to MIDI note number
     */
    static noteNameToMidi(noteName: string): number;
    /**
     * Convert a musical time string back to numeric time
     */
    static musicalTimeToTime(musicalTime: MusicalTime, timeSignature?: [number, number]): number;
    /**
     * Validate JMON composition
     */
    static validateComposition(composition: JMonComposition): {
        valid: boolean;
        errors: string[];
    };
}
