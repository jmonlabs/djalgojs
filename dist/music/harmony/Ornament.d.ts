export interface OrnamentOptions {
    density?: number;
    maxInterval?: number;
    rhythmicVariation?: boolean;
    graceNoteDuration?: number;
}
export interface OrnamentedNote {
    originalNote: number;
    ornamentedSequence: number[];
    durations: number[];
    type: string;
}
/**
 * Musical ornamentation system
 * Based on the Python djalgo harmony module (Ornament class)
 */
export declare class Ornament {
    private options;
    constructor(options?: OrnamentOptions);
    /**
     * Apply ornamentation to a melody
     */
    ornament(melody: number[], durations?: number[]): OrnamentedNote[];
    /**
     * Select appropriate ornament type based on context
     */
    private selectOrnamentType;
    /**
     * Apply specific ornament to a note
     */
    private applyOrnament;
    /**
     * Add grace note ornamentation
     */
    private addGraceNote;
    /**
     * Add trill ornamentation
     */
    private addTrill;
    /**
     * Add mordent ornamentation (quick alternation)
     */
    private addMordent;
    /**
     * Add turn ornamentation (four-note figure)
     */
    private addTurn;
    /**
     * Add arpeggio ornamentation (broken chord)
     */
    private addArpeggio;
    /**
     * Add slide ornamentation (glissando effect)
     */
    private addSlide;
    /**
     * Get auxiliary note for grace notes
     */
    private getAuxiliaryNote;
    /**
     * Get trill interval (usually whole or half step)
     */
    private getTrillInterval;
    /**
     * Build arpeggio chord from root note
     */
    private buildArpeggioChord;
    /**
     * Apply rhythmic ornamentation (syncopation, etc.)
     */
    rhythmicOrnamentation(durations: number[]): number[];
    /**
     * Create compound ornamentation (multiple ornaments)
     */
    compoundOrnamentation(melody: number[], durations?: number[]): OrnamentedNote[];
    /**
     * Get ornamentation statistics
     */
    getStatistics(ornamentedMelody: OrnamentedNote[]): {
        totalNotes: number;
        ornamentedNotes: number;
        ornamentationRate: number;
        ornamentTypes: Record<string, number>;
    };
}
