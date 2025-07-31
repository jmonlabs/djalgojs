import { ChromaticNote, ScaleMode, Interval } from '../../types/music';
export declare class MusicTheoryConstants {
    static readonly chromaticScale: ChromaticNote[];
    static readonly intervals: Record<Interval, number>;
    static readonly scaleIntervals: Record<ScaleMode, number[]>;
    static convertFlatToSharp(note: string): ChromaticNote;
    static scaleToTriad(mode: ScaleMode): number[];
    static getChromaticIndex(note: ChromaticNote): number;
    static getNoteFromIndex(index: number): ChromaticNote;
    static transposeNote(note: ChromaticNote, semitones: number): ChromaticNote;
    static getInterval(note1: ChromaticNote, note2: ChromaticNote): number;
}
