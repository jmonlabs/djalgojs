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

export class FractalVisualizer {
  
  /**
   * Visualize logistic map bifurcation diagram
   */
  public static plotLogisticMap(
    rMin: number = 2.8,
    rMax: number = 4.0,
    rSteps: number = 1000,
    iterations: number = 1000,
    skipTransient: number = 500,
    options: FractalVisualizationOptions = {}
  ): ReturnType<typeof PlotRenderer.scatter> {
    const { 
      title = 'Logistic Map Bifurcation',
      width = 800,
      height = 600,
      colorScheme = 'viridis'
    } = options;

    const plotData: Array<{x: number, y: number, color: string}> = [];
    
    for (let i = 0; i < rSteps; i++) {
      const r = rMin + (i / rSteps) * (rMax - rMin);
      let x = 0.5; // Initial condition
      
      // Skip transient behavior
      for (let j = 0; j < skipTransient; j++) {
        x = r * x * (1 - x);
      }
      
      // Collect attractors
      const attractors = new Set<number>();
      for (let j = 0; j < iterations; j++) {
        x = r * x * (1 - x);
        attractors.add(Math.round(x * 10000) / 10000); // Round for stability
      }
      
      // Plot each attractor value
      attractors.forEach(value => {
        plotData.push({
          x: r,
          y: value,
          color: this.getColorForValue(value, colorScheme)
        });
      });
    }

    const data = {
      x: plotData.map(d => d.x),
      y: plotData.map(d => d.y),
      color: plotData.map(d => d.color)
    };

    return PlotRenderer.scatter(data, {
      title,
      width,
      height,
      showAxis: true
    });
  }

  /**
   * Generate Mandelbrot set visualization
   */
  public static plotMandelbrot(
    xMin: number = -2.5,
    xMax: number = 1.0,
    yMin: number = -1.25,
    yMax: number = 1.25,
    resolution: number = 400,
    maxIterations: number = 100,
    options: FractalVisualizationOptions = {}
  ): ReturnType<typeof PlotRenderer.heatmap> {
    const { 
      title = 'Mandelbrot Set',
      width = 600,
      height = 600,
      colorScheme = 'plasma'
    } = options;

    const matrix: number[][] = [];
    const dx = (xMax - xMin) / resolution;
    const dy = (yMax - yMin) / resolution;

    for (let py = 0; py < resolution; py++) {
      const row: number[] = [];
      const y = yMin + py * dy;
      
      for (let px = 0; px < resolution; px++) {
        const x = xMin + px * dx;
        const iterations = this.mandelbrotIterations(x, y, maxIterations);
        row.push(iterations / maxIterations);
      }
      matrix.push(row);
    }

    return PlotRenderer.heatmap(matrix, {
      title,
      width,
      height,
      showAxis: false
    });
  }

  /**
   * Create Julia set visualization
   */
  public static plotJuliaSet(
    cReal: number = -0.7,
    cImag: number = 0.27015,
    xMin: number = -1.5,
    xMax: number = 1.5,
    yMin: number = -1.5,
    yMax: number = 1.5,
    resolution: number = 400,
    maxIterations: number = 100,
    options: FractalVisualizationOptions = {}
  ): ReturnType<typeof PlotRenderer.heatmap> {
    const { 
      title = `Julia Set (c = ${cReal} + ${cImag}i)`,
      width = 600,
      height = 600,
      colorScheme = 'turbo'
    } = options;

    const matrix: number[][] = [];
    const dx = (xMax - xMin) / resolution;
    const dy = (yMax - yMin) / resolution;

    for (let py = 0; py < resolution; py++) {
      const row: number[] = [];
      const y = yMin + py * dy;
      
      for (let px = 0; px < resolution; px++) {
        const x = xMin + px * dx;
        const iterations = this.juliaIterations(x, y, cReal, cImag, maxIterations);
        row.push(iterations / maxIterations);
      }
      matrix.push(row);
    }

    return PlotRenderer.heatmap(matrix, {
      title,
      width,
      height,
      showAxis: false
    });
  }

  /**
   * Visualize strange attractors (Lorenz, Rossler, etc.)
   */
  public static plotAttractor(
    type: 'lorenz' | 'rossler' | 'henon',
    steps: number = 10000,
    options: FractalVisualizationOptions = {}
  ): ReturnType<typeof PlotRenderer.scatter> {
    const { 
      title = `${type.charAt(0).toUpperCase() + type.slice(1)} Attractor`,
      width = 600,
      height = 600,
      colorScheme = 'viridis'
    } = options;

    const points = this.generateAttractor(type, steps);
    
    const data = {
      x: points.map(p => p.x),
      y: points.map(p => p.y),
      color: points.map((_, i) => this.getColorForValue(i / points.length, colorScheme))
    };

    return PlotRenderer.scatter(data, {
      title,
      width,
      height,
      showAxis: false
    });
  }

  /**
   * Create a chaos game visualization (Sierpinski triangle, etc.)
   */
  public static plotChaosGame(
    vertices: Array<{x: number, y: number}>,
    ratio: number = 0.5,
    iterations: number = 10000,
    options: FractalVisualizationOptions = {}
  ): ReturnType<typeof PlotRenderer.scatter> {
    const { 
      title = 'Chaos Game',
      width = 600,
      height = 600
    } = options;

    const points: Array<{x: number, y: number}> = [];
    let current = { x: 0.5, y: 0.5 }; // Starting point

    for (let i = 0; i < iterations; i++) {
      const vertex = vertices[Math.floor(Math.random() * vertices.length)]!;
      current = {
        x: current.x + ratio * (vertex.x - current.x),
        y: current.y + ratio * (vertex.y - current.y)
      };
      
      if (i > 100) { // Skip initial transient
        points.push({ ...current });
      }
    }

    const data = {
      x: points.map(p => p.x),
      y: points.map(p => p.y),
      color: points.map(() => 'steelblue')
    };

    return PlotRenderer.scatter(data, {
      title,
      width,
      height,
      showAxis: false
    });
  }

  /**
   * Plot fractal dimension analysis
   */
  public static plotFractalDimension(
    data: number[],
    options: FractalVisualizationOptions = {}
  ): ReturnType<typeof PlotRenderer.line> {
    const { 
      title = 'Fractal Dimension Analysis',
      width = 600,
      height = 400
    } = options;

    // Box-counting method
    const scales: number[] = [];
    const counts: number[] = [];
    
    for (let scale = 1; scale <= data.length / 10; scale *= 2) {
      const boxCount = this.boxCount(data, scale);
      scales.push(Math.log(1 / scale));
      counts.push(Math.log(boxCount));
    }

    const plotData = {
      x: scales,
      y: counts
    };

    return PlotRenderer.line(plotData, {
      title,
      width,
      height,
      showAxis: true
    });
  }

  /**
   * Create a phase space plot for time series
   */
  public static plotPhaseSpace(
    data: number[],
    delay: number = 1,
    embedding: number = 2,
    options: FractalVisualizationOptions = {}
  ): ReturnType<typeof PlotRenderer.scatter> {
    const { 
      title = 'Phase Space Reconstruction',
      width = 600,
      height = 600,
      colorScheme = 'viridis'
    } = options;

    const points: Array<{x: number, y: number, z?: number}> = [];
    
    for (let i = 0; i < data.length - delay * (embedding - 1); i++) {
      if (embedding === 2) {
        points.push({
          x: data[i]!,
          y: data[i + delay]!
        });
      } else if (embedding === 3) {
        points.push({
          x: data[i]!,
          y: data[i + delay]!,
          z: data[i + 2 * delay]!
        });
      }
    }

    const plotData = {
      x: points.map(p => p.x),
      y: points.map(p => p.y),
      color: points.map((_, i) => this.getColorForValue(i / points.length, colorScheme))
    };

    return PlotRenderer.scatter(plotData, {
      title,
      width,
      height,
      showAxis: true
    });
  }

  /**
   * Helper: Calculate Mandelbrot iterations
   */
  private static mandelbrotIterations(x: number, y: number, maxIterations: number): number {
    let zx = 0;
    let zy = 0;
    let iteration = 0;

    while (zx * zx + zy * zy < 4 && iteration < maxIterations) {
      const temp = zx * zx - zy * zy + x;
      zy = 2 * zx * zy + y;
      zx = temp;
      iteration++;
    }

    return iteration;
  }

  /**
   * Helper: Calculate Julia set iterations
   */
  private static juliaIterations(
    x: number, 
    y: number, 
    cReal: number, 
    cImag: number, 
    maxIterations: number
  ): number {
    let zx = x;
    let zy = y;
    let iteration = 0;

    while (zx * zx + zy * zy < 4 && iteration < maxIterations) {
      const temp = zx * zx - zy * zy + cReal;
      zy = 2 * zx * zy + cImag;
      zx = temp;
      iteration++;
    }

    return iteration;
  }

  /**
   * Helper: Generate strange attractor points
   */
  private static generateAttractor(
    type: 'lorenz' | 'rossler' | 'henon',
    steps: number
  ): Array<{x: number, y: number, z?: number}> {
    const points: Array<{x: number, y: number, z?: number}> = [];
    
    if (type === 'lorenz') {
      let x = 1, y = 1, z = 1;
      const sigma = 10, rho = 28, beta = 8/3;
      const dt = 0.01;
      
      for (let i = 0; i < steps; i++) {
        const dx = sigma * (y - x);
        const dy = x * (rho - z) - y;
        const dz = x * y - beta * z;
        
        x += dx * dt;
        y += dy * dt;
        z += dz * dt;
        
        points.push({ x, y, z });
      }
    } else if (type === 'rossler') {
      let x = 1, y = 1, z = 1;
      const a = 0.2, b = 0.2, c = 5.7;
      const dt = 0.01;
      
      for (let i = 0; i < steps; i++) {
        const dx = -y - z;
        const dy = x + a * y;
        const dz = b + z * (x - c);
        
        x += dx * dt;
        y += dy * dt;
        z += dz * dt;
        
        points.push({ x, y, z });
      }
    } else if (type === 'henon') {
      let x = 0, y = 0;
      const a = 1.4, b = 0.3;
      
      for (let i = 0; i < steps; i++) {
        const newX = 1 - a * x * x + y;
        const newY = b * x;
        
        x = newX;
        y = newY;
        
        points.push({ x, y });
      }
    }
    
    return points;
  }

  /**
   * Helper: Box counting for fractal dimension
   */
  private static boxCount(data: number[], scale: number): number {
    const boxes = new Set<string>();
    
    for (let i = 0; i < data.length; i++) {
      const box = Math.floor(data[i]! / scale);
      boxes.add(box.toString());
    }
    
    return boxes.size;
  }

  /**
   * Helper: Get color for value based on color scheme
   */
  private static getColorForValue(value: number, scheme: string): string {
    const normalized = Math.max(0, Math.min(1, value));
    
    switch (scheme) {
      case 'viridis':
        return `hsl(${240 + normalized * 120}, 60%, ${30 + normalized * 40}%)`;
      case 'plasma':
        return `hsl(${300 - normalized * 60}, 80%, ${20 + normalized * 60}%)`;
      case 'turbo':
        return `hsl(${normalized * 360}, 70%, 50%)`;
      case 'heat':
        return `hsl(${(1 - normalized) * 60}, 100%, 50%)`;
      default:
        return `hsl(${normalized * 240}, 70%, 50%)`;
    }
  }

  /**
   * Create musical fractal sequences from logistic map
   */
  public static generateMusicalSequence(
    r: number,
    length: number,
    initialValue: number = 0.5
  ): number[] {
    const sequence: number[] = [];
    let x = initialValue;
    
    for (let i = 0; i < length; i++) {
      x = r * x * (1 - x);
      sequence.push(x);
    }
    
    return sequence;
  }

  /**
   * Create rhythm patterns from cellular automata
   */
  public static rhythmFromCA(
    rule: number,
    width: number,
    generations: number,
    initialPattern?: number[]
  ): number[][] {
    const pattern = initialPattern || Array(width).fill(0).map(() => Math.random() > 0.5 ? 1 : 0);
    const history: number[][] = [pattern];
    
    for (let gen = 0; gen < generations - 1; gen++) {
      const current = history[history.length - 1];
      const next: number[] = [];
      
      for (let i = 0; i < width; i++) {
        const left = current![(i - 1 + width) % width]!;
        const center = current![i]!;
        const right = current![(i + 1) % width]!;
        const index = (left << 2) | (center << 1) | right;
        next.push((rule >> index) & 1);
      }
      
      history.push(next);
    }
    
    return history;
  }
}