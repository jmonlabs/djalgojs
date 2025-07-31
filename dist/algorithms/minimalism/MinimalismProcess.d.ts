import { MusicalNote } from '../../types/music';
export type MinimalismOperation = 'additive' | 'subtractive';
export type MinimalismDirection = 'forward' | 'backward' | 'inward' | 'outward';
export interface MinimalismOptions {
    operation: MinimalismOperation;
    direction: MinimalismDirection;
    repetition: number;
}
/**
 * Implementation of musical minimalism processes based on the Python djalgo library
 * Supports additive and subtractive operations in four directions
 */
export declare class MinimalismProcess {
    private operation;
    private direction;
    private repetition;
    private sequence;
    constructor(options: MinimalismOptions);
    /**
     * Generate processed sequence based on operation and direction
     */
    generate(sequence: MusicalNote[]): MusicalNote[];
    private additiveForward;
    private additiveBackward;
    private additiveInward;
    private additiveOutward;
    private subtractiveForward;
    private subtractiveBackward;
    private subtractiveInward;
    private subtractiveOutward;
    private adjustOffsets;
}
/**
 * Tintinnabuli style implementation for modal composition
 */
export declare class Tintinnabuli {
    private tChord;
    private direction;
    private rank;
    private isAlternate;
    private currentDirection;
    constructor(tChord: number[], direction?: 'up' | 'down' | 'any' | 'alternate', rank?: number);
    /**
     * Generate t-voice from m-voice sequence
     */
    generate(sequence: MusicalNote[]): MusicalNote[];
}
