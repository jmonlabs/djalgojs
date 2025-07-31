import { PlotRenderer, PlotOptions } from '../plots/PlotRenderer';
export interface FractalVisualizationOptions extends PlotOptions {
    colorScheme?: 'viridis' | 'plasma' | 'turbo' | 'rainbow' | 'heat';
    iterations?: number;
    threshold?: number;
    zoom?: number;
    centerX?: number;
    centerY?: number;
}
export interface LogisticMapData {
    r: number;
    x: number;
    iteration: number;
}
export interface MandelbrotPoint {
    x: number;
    y: number;
    iterations: number;
    escaped: boolean;
}
export declare class FractalVisualizer {
    /**
     * Visualize logistic map bifurcation diagram
     */
    static plotLogisticMap(rMin?: number, rMax?: number, rSteps?: number, iterations?: number, skipTransient?: number, options?: FractalVisualizationOptions): ReturnType<typeof PlotRenderer.scatter>;
    /**
     * Generate Mandelbrot set visualization
     */
    static plotMandelbrot(xMin?: number, xMax?: number, yMin?: number, yMax?: number, resolution?: number, maxIterations?: number, options?: FractalVisualizationOptions): ReturnType<typeof PlotRenderer.heatmap>;
    /**
     * Create Julia set visualization
     */
    static plotJuliaSet(cReal?: number, cImag?: number, xMin?: number, xMax?: number, yMin?: number, yMax?: number, resolution?: number, maxIterations?: number, options?: FractalVisualizationOptions): ReturnType<typeof PlotRenderer.heatmap>;
    /**
     * Visualize strange attractors (Lorenz, Rossler, etc.)
     */
    static plotAttractor(type: 'lorenz' | 'rossler' | 'henon', steps?: number, options?: FractalVisualizationOptions): ReturnType<typeof PlotRenderer.scatter>;
    /**
     * Create a chaos game visualization (Sierpinski triangle, etc.)
     */
    static plotChaosGame(vertices: Array<{
        x: number;
        y: number;
    }>, ratio?: number, iterations?: number, options?: FractalVisualizationOptions): ReturnType<typeof PlotRenderer.scatter>;
    /**
     * Plot fractal dimension analysis
     */
    static plotFractalDimension(data: number[], options?: FractalVisualizationOptions): ReturnType<typeof PlotRenderer.line>;
    /**
     * Create a phase space plot for time series
     */
    static plotPhaseSpace(data: number[], delay?: number, embedding?: number, options?: FractalVisualizationOptions): ReturnType<typeof PlotRenderer.scatter>;
    /**
     * Helper: Calculate Mandelbrot iterations
     */
    private static mandelbrotIterations;
    /**
     * Helper: Calculate Julia set iterations
     */
    private static juliaIterations;
    /**
     * Helper: Generate strange attractor points
     */
    private static generateAttractor;
    /**
     * Helper: Box counting for fractal dimension
     */
    private static boxCount;
    /**
     * Helper: Get color for value based on color scheme
     */
    private static getColorForValue;
    /**
     * Create musical fractal sequences from logistic map
     */
    static generateMusicalSequence(r: number, length: number, initialValue?: number): number[];
    /**
     * Create rhythm patterns from cellular automata
     */
    static rhythmFromCA(rule: number, width: number, generations: number, initialPattern?: number[]): number[][];
}
