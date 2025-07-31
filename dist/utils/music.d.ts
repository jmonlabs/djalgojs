import { MusicalNote } from '../types/music';
/**
 * Musical utility functions matching the Python djalgo utils module
 */
export declare class MusicUtils {
    /**
     * Check input type of a sequence
     */
    static checkInput(sequence: any): 'list of tuples' | 'list' | 'unknown';
    /**
     * Fill gaps with rests in a musical sequence
     */
    static fillGapsWithRests(notes: MusicalNote[], tolerance?: number): MusicalNote[];
    /**
     * Set offsets according to durations (sequential timing)
     */
    static setOffsetsAccordingToDurations(notes: MusicalNote[]): MusicalNote[];
    /**
     * Convert CDE notation to MIDI (e.g., "C4" -> 60)
     */
    static cdeToMidi(note: string): number;
    /**
     * Convert MIDI to CDE notation (e.g., 60 -> "C4")
     */
    static midiToCde(midi: number): string;
    /**
     * Get octave from MIDI note number
     */
    static getOctave(midi: number): number;
    /**
     * Get degree from pitch in a scale
     */
    static getDegreeFromPitch(pitch: number, scaleList: number[], tonicPitch: number): number;
    /**
     * Quantize timing to a grid
     */
    static quantize(notes: MusicalNote[], gridDivision?: number): MusicalNote[];
    /**
     * Transpose a sequence by semitones
     */
    static transpose(notes: MusicalNote[], semitones: number): MusicalNote[];
    /**
     * Invert a melody around a pivot point
     */
    static invert(notes: MusicalNote[], pivot?: number): MusicalNote[];
    /**
     * Retrograde (reverse) a sequence
     */
    static retrograde(notes: MusicalNote[]): MusicalNote[];
    /**
     * Create augmentation (stretch) or diminution (compress) of durations
     */
    static augment(notes: MusicalNote[], factor: number): MusicalNote[];
    /**
     * Remove duplicate consecutive notes
     */
    static removeDuplicates(notes: MusicalNote[]): MusicalNote[];
    /**
     * Split long notes into smaller ones
     */
    static splitLongNotes(notes: MusicalNote[], maxDuration: number): MusicalNote[];
    /**
     * Calculate the total duration of a sequence
     */
    static getTotalDuration(notes: MusicalNote[]): number;
    /**
     * Get pitch range (lowest and highest pitches)
     */
    static getPitchRange(notes: MusicalNote[]): {
        min: number;
        max: number;
    } | null;
    /**
     * Normalize velocities to a range
     */
    static normalizeVelocities(notes: MusicalNote[], min?: number, max?: number): MusicalNote[];
    /**
     * Create a rhythmic pattern from note onsets
     */
    static extractRhythm(notes: MusicalNote[]): number[];
    /**
     * Apply swing timing to notes
     */
    static applySwing(notes: MusicalNote[], swingRatio?: number): MusicalNote[];
}
