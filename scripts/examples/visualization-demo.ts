/**
 * Demonstration of Plotly.js visualization integration
 * Shows usage of all translated visualization functions
 */

import { PlotRenderer } from '../src/visualization/plots/PlotRenderer';
import { CAVisualizer } from '../src/visualization/cellular-automata/CAVisualizer';
import { FractalVisualizer } from '../src/visualization/fractals/FractalVisualizer';
import { PolyloopVisualizer } from '../src/visualization/polyloops/PolyloopVisualizer';
import { Polyloop } from '../src/algorithms/polyloops/Polyloop';

async function demonstrateVisualization() {
  console.log('Starting Plotly.js visualization demonstrations...');

  // 1. Basic PlotRenderer Examples
  console.log('1. Creating basic plots...');
  
  // Line plot
  const lineData = {
    x: Array.from({length: 100}, (_, i) => i / 10),
    y: Array.from({length: 100}, (_, i) => Math.sin(i / 10))
  };
  await PlotRenderer.line(lineData, { 
    title: 'Sine Wave', 
    xTitle: 'Time', 
    yTitle: 'Amplitude' 
  }, 'line-plot');

  // Scatter plot with colors
  const scatterData = {
    x: Array.from({length: 50}, () => Math.random() * 10),
    y: Array.from({length: 50}, () => Math.random() * 10),
    color: Array.from({length: 50}, () => `hsl(${Math.random() * 360}, 70%, 50%)`)
  };
  await PlotRenderer.scatter(scatterData, { 
    title: 'Random Scatter Plot',
    xTitle: 'X Values',
    yTitle: 'Y Values'
  }, 'scatter-plot');

  // Heatmap
  const matrix = Array.from({length: 20}, () => 
    Array.from({length: 20}, () => Math.random())
  );
  await PlotRenderer.heatmap(matrix, { 
    title: 'Random Heatmap',
    colorScale: 'Viridis'
  }, 'heatmap-plot');

  // 2. Cellular Automata Visualization
  console.log('2. Creating cellular automata visualizations...');
  
  // Generate Rule 30 evolution
  const rule30History = generateCAHistory(30, 101, 50);
  await CAVisualizer.plotEvolution(rule30History, {
    title: 'Elementary Cellular Automaton - Rule 30',
    width: 800,
    height: 400
  });

  // Compare multiple rules
  const rules = [30, 90, 110, 184];
  const ruleHistories = rules.map(rule => ({
    ruleNumber: rule,
    history: generateCAHistory(rule, 51, 25)
  }));
  
  const comparisons = CAVisualizer.compareRules(ruleHistories, {
    width: 300,
    height: 200
  });
  console.log(`Generated ${comparisons.length} rule comparison plots`);

  // 3. Fractal Visualizations
  console.log('3. Creating fractal visualizations...');
  
  // Logistic map bifurcation
  await FractalVisualizer.plotLogisticMap(2.8, 4.0, 500, 1000, 500, {
    title: 'Logistic Map Bifurcation Diagram',
    width: 800,
    height: 600
  });

  // Mandelbrot set
  await FractalVisualizer.plotMandelbrot(-2.5, 1.0, -1.25, 1.25, 200, 100, {
    title: 'Mandelbrot Set',
    width: 600,
    height: 600,
    colorScale: 'Plasma'
  });

  // Julia set
  await FractalVisualizer.plotJuliaSet(-0.7, 0.27015, -1.5, 1.5, -1.5, 1.5, 200, 100, {
    title: 'Julia Set',
    width: 600,
    height: 600,
    colorScale: 'Turbo'
  });

  // Strange attractors
  await FractalVisualizer.plotAttractor('lorenz', 5000, {
    title: 'Lorenz Attractor',
    width: 600,
    height: 600
  });

  // 4. Polyloop Visualizations
  console.log('4. Creating polyloop visualizations...');
  
  // Create some example polyloop layers
  const euclideanLayer = Polyloop.euclidean(16, 5, [60, 64, 67], {
    label: 'Euclidean 5/16',
    color: 'steelblue',
    speed: 1
  });

  const rhythmLayer = Polyloop.fromRhythm([1, 0.5, 0.5, 1], [72, 76, 79], {
    label: 'Rhythm Pattern',
    color: 'crimson',
    speed: 0.75
  });

  const functionLayer = Polyloop.fromFunction(
    (angle) => Math.sin(angle * 3) + Math.cos(angle * 2),
    12,
    [48, 60],
    {
      label: 'Mathematical Function',
      color: 'forestgreen',
      speed: 1.5
    }
  );

  const layers = [euclideanLayer, rhythmLayer, functionLayer];

  // Main polar visualization
  await PolyloopVisualizer.plotPolyloop(layers, {
    title: 'Polyloop Visualization',
    measureLength: 4,
    container: 'polyloop-main'
  });

  // Timeline visualization
  await PolyloopVisualizer.plotTimeline(layers, 8, {
    title: 'Polyloop Timeline',
    container: 'polyloop-timeline'
  });

  // 5. Advanced PlotRenderer Features
  console.log('5. Creating advanced plots...');
  
  // 3D Surface plot
  const surfaceData = {
    x: Array.from({length: 20}, (_, i) => i),
    y: Array.from({length: 20}, (_, i) => i),
    z: Array.from({length: 20}, (_, i) => 
      Array.from({length: 20}, (_, j) => Math.sin(i/5) * Math.cos(j/5))
    )
  };
  await PlotRenderer.surface(surfaceData, {
    title: '3D Surface Plot',
    colorScale: 'Viridis'
  }, '3d-surface');

  // 3D Scatter plot
  const scatter3DData = {
    x: Array.from({length: 100}, () => Math.random() * 10),
    y: Array.from({length: 100}, () => Math.random() * 10),
    z: Array.from({length: 100}, () => Math.random() * 10),
    color: Array.from({length: 100}, (_, i) => `hsl(${(i * 3.6) % 360}, 70%, 50%)`)
  };
  await PlotRenderer.scatter3D(scatter3DData, {
    title: '3D Scatter Plot',
    xTitle: 'X Axis',
    yTitle: 'Y Axis',
    zTitle: 'Z Axis'
  }, '3d-scatter');

  // Multi-line plot
  const multiLineData = [
    {
      x: Array.from({length: 50}, (_, i) => i),
      y: Array.from({length: 50}, (_, i) => Math.sin(i / 5))
    },
    {
      x: Array.from({length: 50}, (_, i) => i),
      y: Array.from({length: 50}, (_, i) => Math.cos(i / 5))
    },
    {
      x: Array.from({length: 50}, (_, i) => i),
      y: Array.from({length: 50}, (_, i) => Math.sin(i / 5) * Math.cos(i / 10))
    }
  ];
  await PlotRenderer.multiLine(multiLineData, {
    title: 'Multiple Time Series',
    xTitle: 'Time',
    yTitle: 'Amplitude'
  }, 'multi-line');

  // Histogram
  const histogramData = {
    x: Array.from({length: 1000}, () => Math.random() * 100 + Math.random() * 50)
  };
  await PlotRenderer.histogram(histogramData, {
    title: 'Random Distribution Histogram',
    color: 'darkblue'
  }, 'histogram');

  console.log('All visualizations completed successfully!');
}

/**
 * Helper function to generate cellular automaton history
 */
function generateCAHistory(rule: number, width: number, generations: number): number[][] {
  const history: number[][] = [];
  
  // Initial condition - single cell in the middle
  let current = Array(width).fill(0);
  current[Math.floor(width / 2)] = 1;
  history.push([...current]);
  
  // Evolve according to the rule
  for (let gen = 0; gen < generations - 1; gen++) {
    const next = Array(width).fill(0);
    
    for (let i = 0; i < width; i++) {
      const left = current[(i - 1 + width) % width]!;
      const center = current[i]!;
      const right = current[(i + 1) % width]!;
      const index = (left << 2) | (center << 1) | right;
      next[i] = (rule >> index) & 1;
    }
    
    current = next;
    history.push([...current]);
  }
  
  return history;
}

/**
 * Export for use in web browsers or Node.js
 */
export { demonstrateVisualization };

// If running directly in Node.js
if (typeof window === 'undefined') {
  console.log('Note: This demo requires a DOM environment (browser) to display plots.');
  console.log('Import this module in a web application to see the visualizations.');
}