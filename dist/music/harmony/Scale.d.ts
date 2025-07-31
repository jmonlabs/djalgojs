type ScaleMode = 'major' | 'minor' | 'diminished' | 'major pentatonic' | 'minor pentatonic' | 'chromatic' | 'lydian' | 'mixolydian' | 'dorian' | 'phrygian' | 'locrian' | 'harmonic minor' | 'melodic minor ascending' | 'melodic minor descending' | 'custom';
export declare class Scale {
    static chromaticScale: string[];
    static scaleIntervals: Record<ScaleMode, number[]>;
    tonic: string;
    mode: ScaleMode;
    constructor(tonic: string, mode?: ScaleMode | number[]);
    static convertFlatToSharp(note: string): string;
    generate(): number[];
}
export {};
