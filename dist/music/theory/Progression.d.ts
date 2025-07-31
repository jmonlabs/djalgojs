import { ChromaticNote, ScaleMode, ChordProgression } from '../../types/music';
import { Pitch } from '../../types/common';
import { JMonSequence } from '../../types/jmon';
export interface ProgressionOptions {
    length?: number;
    octave?: number;
    voicing?: 'triad' | 'seventh' | 'extended';
}
export declare class Progression {
    private scale;
    constructor(tonic: ChromaticNote, mode?: ScaleMode);
    generate(options?: ProgressionOptions): ChordProgression;
    generateChord(degree: number, voicing?: 'triad' | 'seventh' | 'extended'): string;
    computeCircle(steps?: number): ChordProgression;
    getChordPitches(degree: number, octave?: number, voicing?: 'triad' | 'seventh'): Pitch[];
    private getChordQuality;
    private getSeventhQuality;
    private getExtension;
    toJMonSequence(options?: {
        length?: number;
        octave?: number;
        duration?: string;
        velocity?: number;
        label?: string;
        voicing?: 'triad' | 'seventh';
        strumPattern?: boolean;
    }): JMonSequence;
}
