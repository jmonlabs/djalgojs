import { PolyloopLayer, PolyloopConfig, PolyloopTrigger } from '../../types/polyloop';
import { JMonSequence } from '../../types/jmon';
export declare class Polyloop {
    private config;
    private currentTime;
    private rotationAngles;
    constructor(config: PolyloopConfig);
    /**
     * Create a simple polyloop layer from rhythmic pattern
     */
    static fromRhythm(durations: number[], pitches?: number[], options?: {
        instrument?: string;
        color?: string;
        label?: string;
        speed?: number;
        radius?: number;
    }): PolyloopLayer;
    /**
     * Create polyloop layer from Euclidean rhythm
     */
    static euclidean(beats: number, pulses: number, pitches?: number[], options?: {
        instrument?: string;
        color?: string;
        label?: string;
        speed?: number;
        radius?: number;
    }): PolyloopLayer;
    /**
     * Generate Euclidean rhythm pattern
     */
    private static generateEuclideanRhythm;
    /**
     * Create polyloop with mathematical function
     */
    static fromFunction(func: (angle: number) => number, divisions?: number, pitchRange?: [number, number], options?: {
        instrument?: string;
        color?: string;
        label?: string;
        speed?: number;
        activeThreshold?: number;
    }): PolyloopLayer;
    /**
     * Advance time and calculate triggers
     */
    step(deltaTime: number): PolyloopTrigger[];
    /**
     * Generate a sequence of triggers for a given duration
     */
    generateSequence(duration: number, stepsPerBeat?: number): PolyloopTrigger[];
    /**
     * Reset all rotation angles
     */
    resetRotations(): void;
    /**
     * Convert triggers to JMON sequences
     */
    toJMonSequences(duration?: number): JMonSequence[];
    /**
     * Get current state for visualization
     */
    getVisualizationState(): {
        layers: PolyloopLayer[];
        rotationAngles: Map<string, number>;
        currentTime: number;
    };
    /**
     * Add a new layer to the polyloop
     */
    addLayer(layer: PolyloopLayer): void;
    /**
     * Remove a layer from the polyloop
     */
    removeLayer(label: string): boolean;
    /**
     * Create Observable Plot visualization of the polyloop
     */
    plot(options?: any): ReturnType<typeof import('../../visualization/polyloops/PolyloopVisualizer').PolyloopVisualizer.plotPolyloop>;
    /**
     * Create Observable Plot timeline visualization
     */
    plotTimeline(duration?: number, options?: any): ReturnType<typeof import('../../visualization/polyloops/PolyloopVisualizer').PolyloopVisualizer.plotTimeline>;
    /**
     * Create animated visualization frames
     */
    plotAnimated(numFrames?: number, options?: any): Array<ReturnType<typeof import('../../visualization/polyloops/PolyloopVisualizer').PolyloopVisualizer.plotPolyloop>>;
}
