import { PlotRenderer, PlotOptions } from '../plots/PlotRenderer';
import { Matrix2D } from '../../types/common';

export interface CAVisualizationOptions extends PlotOptions {
  colorScheme?: 'binary' | 'viridis' | 'plasma' | 'greys';
  cellSize?: number;
  showGrid?: boolean;
  animate?: boolean;
}

export class CAVisualizer {
  
  /**
   * Visualize cellular automata evolution over time
   */
  public static plotEvolution(
    history: Matrix2D, 
    options: CAVisualizationOptions = {}
  ): ReturnType<typeof PlotRenderer.matrix> {
    const { 
      title = 'Cellular Automata Evolution',
      width = 600,
      height = 400,
      colorScheme = 'binary',
      showAxis = false
    } = options;

    // Convert to plot data format
    const plotData: Array<{x: number, y: number, value: number}> = [];
    
    history.forEach((row, timeStep) => {
      row.forEach((cell, position) => {
        plotData.push({ 
          x: position, 
          y: history.length - 1 - timeStep, // Flip Y to show time progression downward
          value: cell 
        });
      });
    });

    return PlotRenderer.matrix(history, {
      title,
      width,
      height,
      showAxis
    });
  }

  /**
   * Visualize a single CA generation
   */
  public static plotGeneration(
    generation: number[], 
    options: CAVisualizationOptions = {}
  ): ReturnType<typeof PlotRenderer.scatter> {
    const { 
      title = 'CA Generation',
      width = 600,
      height = 100,
      // colorScheme = 'binary' // supprimé car inutilisé
    } = options;

    const plotData = {
      x: generation.map((_, i) => i),
      y: generation.map(() => 0),
      color: generation.map(cell => cell ? 'black' : 'white')
    };

    return PlotRenderer.scatter(plotData, {
      title,
      width,
      height,
      showAxis: false
    });
  }

  /**
   * Compare multiple CA rules side by side
   */
  public static compareRules(
    rules: Array<{ ruleNumber: number; history: Matrix2D }>,
    options: CAVisualizationOptions = {}
  ): Array<ReturnType<typeof PlotRenderer.matrix>> {
    const { 
      width = 300,
      height = 200,
      colorScheme = 'binary'
    } = options;

    return rules.map(({ ruleNumber, history }) => 
      this.plotEvolution(history, {
        title: `Rule ${ruleNumber}`,
        width,
        height,
        colorScheme,
        showAxis: false
      })
    );
  }

  /**
   * Create an animated visualization data structure
   */
  public static createAnimationData(history: Matrix2D): Array<{
    frame: number;
    data: Array<{x: number, y: number, value: number}>;
  }> {
    return history.map((generation, frame) => ({
      frame,
      data: generation.map((cell, x) => ({
        x,
        y: 0,
        value: cell
      }))
    }));
  }

  /**
   * Extract specific patterns from CA history
   */
  public static extractPatterns(history: Matrix2D): {
    oscillators: Array<{position: number, period: number}>;
    gliders: Array<{startPosition: number, direction: number}>;
    stillLifes: Array<{position: number, width: number}>;
  } {
    const oscillators: Array<{position: number, period: number}> = [];
    const gliders: Array<{startPosition: number, direction: number}> = [];
    const stillLifes: Array<{position: number, width: number}> = [];

    // Simple pattern detection (can be enhanced)
    const width = history[0]?.length || 0;
    
    // Check for oscillators (patterns that repeat)
    for (let pos = 0; pos < width; pos++) {
      const column = history.map(row => row[pos]);
      const period = this.findPeriod(column.filter((v): v is number => v !== undefined));
      if (period > 1 && period < 10) {
        oscillators.push({ position: pos, period });
      }
    }

    // Check for still lifes (unchanging patterns)
    if (history.length > 5) {
      const lastGen = history[history.length - 1];
      const prevGen = history[history.length - 2];
      
      if (lastGen && prevGen) {
        for (let pos = 0; pos < width - 3; pos++) {
          const isStable = lastGen.slice(pos, pos + 3).every((cell, i) => 
            cell === prevGen[pos + i] && cell === 1
          );
          if (isStable) {
            stillLifes.push({ position: pos, width: 3 });
          }
        }
      }
    }

    return { oscillators, gliders, stillLifes };
  }

  /**
   * Find the period of a repeating sequence
   */
  private static findPeriod(sequence: number[]): number {
    if (sequence.length < 4) return 1;
    
    for (let period = 1; period <= Math.floor(sequence.length / 2); period++) {
      let isRepeating = true;
      for (let i = period; i < sequence.length; i++) {
        if (sequence[i] !== sequence[i - period]) {
          isRepeating = false;
          break;
        }
      }
      if (isRepeating) return period;
    }
    return 1;
  }

  /**
   * Create a density plot showing CA activity over time
   */
  public static plotDensity(history: Matrix2D, options: CAVisualizationOptions = {}): ReturnType<typeof PlotRenderer.line> {
    const { 
      title = 'CA Density Over Time',
      width = 600,
      height = 300
    } = options;

    const densityData = history.map((generation, time) => ({
      time,
      density: generation.reduce((sum, cell) => sum + cell, 0) / generation.length
    }));

    const plotData = {
      x: densityData.map(d => d.time),
      y: densityData.map(d => d.density)
    };

    return PlotRenderer.line(plotData, {
      title,
      width,
      height,
      color: 'steelblue',
      showAxis: true
    });
  }

  /**
   * Create a spacetime diagram with enhanced visualization
   */
  public static plotSpacetime(
    history: Matrix2D, 
    options: CAVisualizationOptions = {}
  ): ReturnType<typeof PlotRenderer.matrix> {
    const { 
      title = 'Spacetime Diagram',
      width = 600,
      height = 400,
      showGrid = false
    } = options;

    // Enhanced visualization with cell borders and colors
    const plotData: Array<{x: number, y: number, value: number, border: boolean}> = [];
    
    history.forEach((row, timeStep) => {
      row.forEach((cell, position) => {
        plotData.push({ 
          x: position, 
          y: history.length - 1 - timeStep,
          value: cell,
          border: showGrid
        });
      });
    });

    return PlotRenderer.matrix(history, {
      title,
      width,
      height,
      showAxis: false
    });
  }
}