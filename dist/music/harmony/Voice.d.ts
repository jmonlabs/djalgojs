import { Scale } from '../theory/Scale';
export interface VoicingOptions {
    voiceCount?: number;
    voiceRange?: [number, number];
    intervalLimits?: [number, number];
    doubling?: boolean;
    inversion?: number;
}
export interface ChordVoicing {
    notes: number[];
    root: number;
    quality: string;
    inversion: number;
}
/**
 * Voice leading and harmonization system
 * Based on the Python djalgo harmony module (Voice class)
 */
export declare class Voice {
    private scale;
    private options;
    constructor(scale: Scale, options?: VoicingOptions);
    /**
     * Harmonize a melody with chords
     */
    harmonizeMelody(melody: number[], chordProgression?: number[]): ChordVoicing[];
    /**
     * Find the best chord root for a given melody note
     */
    private findBestChordRoot;
    /**
     * Get triad for a scale degree
     */
    private getTriadForDegree;
    /**
     * Build a chord with proper voicing
     */
    private buildChord;
    /**
     * Get triad notes from a root
     */
    private getTriadFromRoot;
    /**
     * Distribute chord tones across voices
     */
    private distributeVoices;
    /**
     * Constrain note to voice range
     */
    private constrainToRange;
    /**
     * Apply voice leading rules
     */
    private applyVoiceLeadingRules;
    /**
     * Determine chord quality from triad
     */
    private determineChordQuality;
    /**
     * Create smooth voice leading between two chords
     */
    smoothVoiceLeading(fromChord: ChordVoicing, toChord: ChordVoicing): ChordVoicing;
    /**
     * Find voicing with minimal voice movement
     */
    private findMinimalMovement;
    /**
     * Add seventh to a chord
     */
    addSeventh(chord: ChordVoicing): ChordVoicing;
    /**
     * Create chord inversions
     */
    invert(chord: ChordVoicing, inversion: number): ChordVoicing;
    /**
     * Generate four-part harmony for a melody
     */
    fourPartHarmony(melody: number[]): ChordVoicing[];
}
