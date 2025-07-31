import { ChromaticNote, ScaleMode, MusicalScale } from '../../types/music';
import { Pitch } from '../../types/common';
import { JMonSequence } from '../../types/jmon';
export declare class Scale {
    readonly tonic: ChromaticNote;
    readonly mode: ScaleMode;
    constructor(tonic: ChromaticNote, mode: ScaleMode);
    generate(octave?: number, length?: number): Pitch[];
    getMusicalScale(): MusicalScale;
    getDegree(degree: number, octave?: number): Pitch;
    getNoteNames(): ChromaticNote[];
    isInScale(pitch: Pitch): boolean;
    /**
     * Get the scale degrees as MIDI note numbers
     * Returns the pitches of the scale in the default octave
     */
    getScaleDegrees(octave?: number): Pitch[];
    getClosestScalePitch(pitch: Pitch): Pitch;
    toJMonSequence(options?: {
        length?: number;
        octave?: number;
        duration?: string;
        velocity?: number;
        label?: string;
    }): JMonSequence;
    /**
     * Create Observable Plot visualization of scale pitches
     */
    plotScale(octave?: number, length?: number, options?: any): ReturnType<typeof import('../../visualization/plots/PlotRenderer').PlotRenderer.bar>;
    /**
     * Create Observable Plot radar chart of scale intervals
     */
    plotIntervals(options?: any): ReturnType<typeof import('../../visualization/plots/PlotRenderer').PlotRenderer.radar>;
}
