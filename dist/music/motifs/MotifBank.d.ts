import { MusicalNote } from '../../types/music';
export interface Motif {
    id: string;
    name: string;
    artist?: string;
    instrument: string;
    scale: string;
    tags: string[];
    measures: number;
    notes: MusicalNote[];
    metadata?: Record<string, any>;
}
export interface MotifSearchOptions {
    artist?: string;
    instrument?: string;
    scale?: string;
    tag?: string;
    minMeasures?: number;
    maxMeasures?: number;
}
/**
 * Motif bank system for storing and searching musical patterns
 * Based on the Python djalgo MotifBank implementation
 */
export declare class MotifBank {
    private motifs;
    constructor(motifs?: Motif[]);
    /**
     * Load motifs from JSON data
     */
    static fromJSON(jsonData: any[]): MotifBank;
    /**
     * Get total number of motifs
     */
    get length(): number;
    /**
     * Get motif by index
     */
    get(index: number): Motif | undefined;
    /**
     * Get motif by ID
     */
    getById(id: string): Motif | undefined;
    /**
     * Get all motifs
     */
    all(): Motif[];
    /**
     * Add a new motif
     */
    add(motif: Motif): void;
    /**
     * Remove motif by ID
     */
    remove(id: string): boolean;
    /**
     * Update existing motif
     */
    update(id: string, updates: Partial<Motif>): boolean;
    /**
     * Find motifs by artist
     */
    byArtist(artist: string): Motif[];
    /**
     * Find motifs by instrument
     */
    byInstrument(instrument: string): Motif[];
    /**
     * Find motifs by scale
     */
    byScale(scale: string): Motif[];
    /**
     * Find motifs by tag
     */
    byTag(tag: string): Motif[];
    /**
     * Find motifs by measure range
     */
    byMeasureRange(minMeasures?: number, maxMeasures?: number): Motif[];
    /**
     * Comprehensive search with multiple criteria
     */
    search(options: MotifSearchOptions): Motif[];
    /**
     * Get random motif
     */
    random(): Motif | undefined;
    /**
     * Get random motifs matching criteria
     */
    randomSearch(options: MotifSearchOptions, count?: number): Motif[];
    /**
     * Find similar motifs based on musical characteristics
     */
    findSimilar(targetMotif: Motif, threshold?: number): Motif[];
    /**
     * Group motifs by a specific property
     */
    groupBy(property: keyof Motif): Record<string, Motif[]>;
    /**
     * Get statistics about the motif collection
     */
    getStats(): {
        total: number;
        byInstrument: Record<string, number>;
        byScale: Record<string, number>;
        byArtist: Record<string, number>;
        averageMeasures: number;
        mostCommonTags: Array<{
            tag: string;
            count: number;
        }>;
    };
    /**
     * Export motifs to JSON
     */
    toJSON(): any[];
    /**
     * Clear all motifs
     */
    clear(): void;
    /**
     * Clone the motif bank
     */
    clone(): MotifBank;
}
