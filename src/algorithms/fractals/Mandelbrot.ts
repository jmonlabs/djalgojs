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
export class Mandelbrot {
  private width: number;
  private height: number;
  private maxIterations: number;
  private xMin: number;
  private xMax: number;
  private yMin: number;
  private yMax: number;

  constructor(options: MandelbrotOptions = {}) {
    this.width = options.width || 100;
    this.height = options.height || 100;
    this.maxIterations = options.maxIterations || 100;
    this.xMin = options.xMin || -2.5;
    this.xMax = options.xMax || 1.5;
    this.yMin = options.yMin || -2.0;
    this.yMax = options.yMax || 2.0;
  }

  /**
   * Generate Mandelbrot set data
   */
  public generate(): number[][] {
    const data: number[][] = [];
    
    for (let y = 0; y < this.height; y++) {
      const row: number[] = [];
      for (let x = 0; x < this.width; x++) {
        const real = this.xMin + (x / this.width) * (this.xMax - this.xMin);
        const imaginary = this.yMin + (y / this.height) * (this.yMax - this.yMin);
        
        const iterations = this.mandelbrotIterations({ real, imaginary });
        row.push(iterations);
      }
      data.push(row);
    }
    
    return data;
  }

  /**
   * Extract sequence from Mandelbrot data using various methods
   */
  public extractSequence(method: 'diagonal' | 'border' | 'spiral' | 'column' | 'row' = 'diagonal', index: number = 0): number[] {
    const data = this.generate();
    
    switch (method) {
      case 'diagonal':
        return this.extractDiagonal(data);
      
      case 'border':
        return this.extractBorder(data);
      
      case 'spiral':
        return this.extractSpiral(data);
      
      case 'column':
        return this.extractColumn(data, index);
      
      case 'row':
        return this.extractRow(data, index);
      
      default:
        return this.extractDiagonal(data);
    }
  }

  /**
   * Calculate Mandelbrot iterations for a complex point
   */
  private mandelbrotIterations(c: ComplexPoint): number {
    let z: ComplexPoint = { real: 0, imaginary: 0 };
    
    for (let i = 0; i < this.maxIterations; i++) {
      // z = z^2 + c
      const zReal = z.real * z.real - z.imaginary * z.imaginary + c.real;
      const zImaginary = 2 * z.real * z.imaginary + c.imaginary;
      
      z.real = zReal;
      z.imaginary = zImaginary;
      
      // Check if point escapes
      if (z.real * z.real + z.imaginary * z.imaginary > 4) {
        return i;
      }
    }
    
    return this.maxIterations;
  }

  /**
   * Extract diagonal sequence
   */
  private extractDiagonal(data: number[][]): number[] {
    const sequence: number[] = [];
    const minDimension = Math.min(data.length, data[0]?.length || 0);
    
    for (let i = 0; i < minDimension; i++) {
      sequence.push(data[i][i]);
    }
    
    return sequence;
  }

  /**
   * Extract border sequence (clockwise)
   */
  private extractBorder(data: number[][]): number[] {
    const sequence: number[] = [];
    const height = data.length;
    const width = data[0]?.length || 0;
    
    if (height === 0 || width === 0) return sequence;
    
    // Top row
    for (let x = 0; x < width; x++) {
      sequence.push(data[0][x]);
    }
    
    // Right column (excluding top corner)
    for (let y = 1; y < height; y++) {
      sequence.push(data[y][width - 1]);
    }
    
    // Bottom row (excluding right corner, reverse order)
    if (height > 1) {
      for (let x = width - 2; x >= 0; x--) {
        sequence.push(data[height - 1][x]);
      }
    }
    
    // Left column (excluding corners, reverse order)
    if (width > 1) {
      for (let y = height - 2; y > 0; y--) {
        sequence.push(data[y][0]);
      }
    }
    
    return sequence;
  }

  /**
   * Extract spiral sequence (from outside to inside)
   */
  private extractSpiral(data: number[][]): number[] {
    const sequence: number[] = [];
    const height = data.length;
    const width = data[0]?.length || 0;
    
    if (height === 0 || width === 0) return sequence;
    
    let top = 0, bottom = height - 1;
    let left = 0, right = width - 1;
    
    while (top <= bottom && left <= right) {
      // Top row
      for (let x = left; x <= right; x++) {
        sequence.push(data[top][x]);
      }
      top++;
      
      // Right column
      for (let y = top; y <= bottom; y++) {
        sequence.push(data[y][right]);
      }
      right--;
      
      // Bottom row
      if (top <= bottom) {
        for (let x = right; x >= left; x--) {
          sequence.push(data[bottom][x]);
        }
        bottom--;
      }
      
      // Left column
      if (left <= right) {
        for (let y = bottom; y >= top; y--) {
          sequence.push(data[y][left]);
        }
        left++;
      }
    }
    
    return sequence;
  }

  /**
   * Extract specific column
   */
  private extractColumn(data: number[][], columnIndex: number): number[] {
    const sequence: number[] = [];
    const width = data[0]?.length || 0;
    const clampedIndex = Math.max(0, Math.min(columnIndex, width - 1));
    
    for (const row of data) {
      if (row[clampedIndex] !== undefined) {
        sequence.push(row[clampedIndex]);
      }
    }
    
    return sequence;
  }

  /**
   * Extract specific row
   */
  private extractRow(data: number[][], rowIndex: number): number[] {
    const clampedIndex = Math.max(0, Math.min(rowIndex, data.length - 1));
    return data[clampedIndex] ? [...data[clampedIndex]] : [];
  }

  /**
   * Map fractal values to musical scale
   */
  public mapToScale(sequence: number[], scale: number[] = [0, 2, 4, 5, 7, 9, 11], octaveRange: number = 3): number[] {
    if (sequence.length === 0) return [];
    
    const minVal = Math.min(...sequence);
    const maxVal = Math.max(...sequence);
    const range = maxVal - minVal || 1;
    
    return sequence.map(value => {
      // Normalize to 0-1
      const normalized = (value - minVal) / range;
      
      // Map to scale indices
      const scaleIndex = Math.floor(normalized * scale.length * octaveRange);
      const octave = Math.floor(scaleIndex / scale.length);
      const noteIndex = scaleIndex % scale.length;
      
      // Convert to MIDI note (C4 = 60)
      return 60 + octave * 12 + scale[noteIndex];
    });
  }

  /**
   * Generate rhythmic pattern from fractal data
   */
  public mapToRhythm(sequence: number[], subdivisions: number[] = [1, 2, 4, 8, 16]): number[] {
    if (sequence.length === 0) return [];
    
    const minVal = Math.min(...sequence);
    const maxVal = Math.max(...sequence);
    const range = maxVal - minVal || 1;
    
    return sequence.map(value => {
      const normalized = (value - minVal) / range;
      const subdivisionIndex = Math.floor(normalized * subdivisions.length);
      const clampedIndex = Math.max(0, Math.min(subdivisionIndex, subdivisions.length - 1));
      return 1 / subdivisions[clampedIndex];
    });
  }
}