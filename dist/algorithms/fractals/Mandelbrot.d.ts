export interface MandelbrotOptions {
    width?: number;
    height?: number;
    maxIterations?: number;
    xMin?: number;
    xMax?: number;
    yMin?: number;
    yMax?: number;
}
export interface ComplexPoint {
    real: number;
    imaginary: number;
}
/**
 * Mandelbrot set fractal generator for musical composition
 * Based on the Python djalgo fractal module
 */
export declare class Mandelbrot {
    private width;
    private height;
    private maxIterations;
    private xMin;
    private xMax;
    private yMin;
    private yMax;
    constructor(options?: MandelbrotOptions);
    /**
     * Generate Mandelbrot set data
     */
    generate(): number[][];
    /**
     * Extract sequence from Mandelbrot data using various methods
     */
    extractSequence(method?: 'diagonal' | 'border' | 'spiral' | 'column' | 'row', index?: number): number[];
    /**
     * Calculate Mandelbrot iterations for a complex point
     */
    private mandelbrotIterations;
    /**
     * Extract diagonal sequence
     */
    private extractDiagonal;
    /**
     * Extract border sequence (clockwise)
     */
    private extractBorder;
    /**
     * Extract spiral sequence (from outside to inside)
     */
    private extractSpiral;
    /**
     * Extract specific column
     */
    private extractColumn;
    /**
     * Extract specific row
     */
    private extractRow;
    /**
     * Map fractal values to musical scale
     */
    mapToScale(sequence: number[], scale?: number[], octaveRange?: number): number[];
    /**
     * Generate rhythmic pattern from fractal data
     */
    mapToRhythm(sequence: number[], subdivisions?: number[]): number[];
}
