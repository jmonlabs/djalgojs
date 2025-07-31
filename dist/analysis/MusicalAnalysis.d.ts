import { JMonNote } from '../types/jmon';
export interface AnalysisOptions {
    scale?: number[];
    weights?: number[];
    sampleRate?: number;
}
export interface AnalysisResult {
    [metric: string]: number;
}
/**
 * Musical analysis tools inspired by the Python djalgo analysis module
 * Provides statistical and musical evaluation metrics for sequences
 */
export declare class MusicalAnalysis {
    /**
     * Calculate Gini coefficient for inequality measurement
     */
    static gini(values: number[], weights?: number[]): number;
    /**
     * Calculate center of mass (balance point) of a sequence
     */
    static balance(values: number[], weights?: number[]): number;
    /**
     * Calculate autocorrelation for pattern detection
     */
    static autocorrelation(values: number[], maxLag?: number): number[];
    /**
     * Detect and score musical motifs
     */
    static motif(values: number[], patternLength?: number): number;
    /**
     * Calculate dissonance/scale conformity
     */
    static dissonance(pitches: number[], scale?: number[]): number;
    /**
     * Calculate rhythmic fit to a grid
     */
    static rhythmic(onsets: number[], gridDivision?: number): number;
    /**
     * Calculate Fibonacci/golden ratio index
     */
    static fibonacciIndex(values: number[]): number;
    /**
     * Calculate syncopation (off-beat emphasis)
     */
    static syncopation(onsets: number[], beatDivision?: number): number;
    /**
     * Calculate contour entropy (melodic direction randomness)
     */
    static contourEntropy(pitches: number[]): number;
    /**
     * Calculate interval variance (pitch stability)
     */
    static intervalVariance(pitches: number[]): number;
    /**
     * Calculate note density (notes per unit time)
     */
    static density(notes: JMonNote[], timeWindow?: number): number;
    /**
     * Calculate gap variance (timing consistency)
     */
    static gapVariance(onsets: number[]): number;
    /**
     * Comprehensive analysis of a musical sequence
     */
    static analyze(notes: JMonNote[], options?: AnalysisOptions): AnalysisResult;
}
