import { PlotRenderer, PlotOptions } from '../plots/PlotRenderer';
import { Matrix2D } from '../../types/common';
export interface CAVisualizationOptions extends PlotOptions {
    colorScheme?: 'binary' | 'viridis' | 'plasma' | 'greys';
    cellSize?: number;
    showGrid?: boolean;
    animate?: boolean;
}
export declare class CAVisualizer {
    /**
     * Visualize cellular automata evolution over time
     */
    static plotEvolution(history: Matrix2D, options?: CAVisualizationOptions): ReturnType<typeof PlotRenderer.matrix>;
    /**
     * Visualize a single CA generation
     */
    static plotGeneration(generation: number[], options?: CAVisualizationOptions): ReturnType<typeof PlotRenderer.scatter>;
    /**
     * Compare multiple CA rules side by side
     */
    static compareRules(rules: Array<{
        ruleNumber: number;
        history: Matrix2D;
    }>, options?: CAVisualizationOptions): Array<ReturnType<typeof PlotRenderer.matrix>>;
    /**
     * Create an animated visualization data structure
     */
    static createAnimationData(history: Matrix2D): Array<{
        frame: number;
        data: Array<{
            x: number;
            y: number;
            value: number;
        }>;
    }>;
    /**
     * Extract specific patterns from CA history
     */
    static extractPatterns(history: Matrix2D): {
        oscillators: Array<{
            position: number;
            period: number;
        }>;
        gliders: Array<{
            startPosition: number;
            direction: number;
        }>;
        stillLifes: Array<{
            position: number;
            width: number;
        }>;
    };
    /**
     * Find the period of a repeating sequence
     */
    private static findPeriod;
    /**
     * Create a density plot showing CA activity over time
     */
    static plotDensity(history: Matrix2D, options?: CAVisualizationOptions): ReturnType<typeof PlotRenderer.line>;
    /**
     * Create a spacetime diagram with enhanced visualization
     */
    static plotSpacetime(history: Matrix2D, options?: CAVisualizationOptions): ReturnType<typeof PlotRenderer.matrix>;
}
