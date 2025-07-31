import { PolyloopLayer } from '../../types/polyloop';
export declare class PolyloopVisualizer {
    /**
     * Create a polar radar chart visualization of polyloops using Plotly.js
     * Mirrors the functionality of the Python implementation
     */
    static plotPolyloop(layers: PolyloopLayer[], options?: {
        pulse?: number;
        colors?: string[];
        measureLength?: number;
        container?: string | HTMLElement;
        title?: string;
    }): Promise<any>;
    /**
     * Generate equally spaced colors using HSV color space
     */
    private static generateColors;
    /**
     * Convert HSV to RGB color space
     */
    private static hsvToRgb;
    /**
     * Generate arc points for smooth curves
     */
    private static generateArcPoints;
    /**
     * Calculate duration for a point (simplified for this implementation)
     */
    private static calculateDuration;
    /**
     * Generate tick values for angular axis
     */
    private static generateTickValues;
    /**
     * Generate tick labels for angular axis
     */
    private static generateTickLabels;
    /**
     * Create a timeline visualization of the polyloop triggers
     */
    static plotTimeline(layers: PolyloopLayer[], duration?: number, options?: {
        container?: string | HTMLElement;
        title?: string;
        colors?: string[];
    }): Promise<any>;
    /**
     * Create animated frames of the polyloop visualization
     */
    static plotAnimated(layers: PolyloopLayer[], numFrames?: number, options?: {
        container?: string | HTMLElement;
        title?: string;
        colors?: string[];
        measureLength?: number;
    }): Promise<any[]>;
    /**
     * Convert polyloop data to format compatible with Python implementation
     */
    static convertToPolyloopData(layers: PolyloopLayer[]): Record<string, Array<[number | null, number, number]>>;
}
