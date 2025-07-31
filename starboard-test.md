# djalgojs Starboard.gg Usage Guide

## Cell 1: Import djalgojs (run this first)
```javascript
import { dj } from "https://cdn.jsdelivr.net/gh/jmonlabs/djalgojs@main/dist/dj.js";

// dj is now available globally across all cells
console.log('djalgojs loaded:', Object.keys(dj));
```

## Cell 2: Basic Usage (run after Cell 1)
```javascript
// Create a polyloop - dj is available from Cell 1
const polyloop = new dj.Polyloop([3, 5, 7]);
console.log('Polyloop layers:', polyloop.layers);

// Generate music scales
const cMajor = dj.MusicUtils.generateScale('C', 'major', 4);
console.log('C Major scale:', cMajor.slice(0, 8));

// Create genetic algorithm
const ga = new dj.GeneticAlgorithm({ 
  populationSize: 20, 
  mutationRate: 0.1 
});
console.log('Genetic Algorithm created');
```

## Cell 3: Advanced Features (run after Cell 1)
```javascript
// Musical analysis
const analysis = new dj.MusicalAnalysis();
const testNotes = [60, 64, 67, 72]; // C, E, G, C
const metrics = analysis.analyze(testNotes.map(pitch => ({ pitch, duration: 1, offset: 0 })));
console.log('Musical metrics:', metrics);

// Fractal patterns
const mandelbrot = new dj.Mandelbrot({ width: 100, height: 100 });
const fractalData = mandelbrot.generate();
console.log('Fractal generated, size:', fractalData.length);

// Cellular automata
const ca = new dj.CellularAutomata([1, 0, 1, 0, 1], 30);
const generations = ca.evolve(10);
console.log('CA generations:', generations.length);
```

## With Plotly Visualization

### Cell 1: Load Plotly + djalgojs
```javascript
// Load Plotly first
await import("https://cdn.plot.ly/plotly-latest.min.js");

// Then load djalgojs with visualization
import { dj } from "https://cdn.jsdelivr.net/gh/jmonlabs/djalgojs@main/dist/dj.js";
import { Viz } from "https://cdn.jsdelivr.net/gh/jmonlabs/djalgojs@main/dist/djalgojs.viz.js";

// Make available globally
globalThis.dj = dj;
globalThis.Viz = Viz;

console.log('djalgojs + Plotly loaded');
```

### Cell 2: Create visualizations
```javascript
// Create some data
const x = Array.from({length: 50}, (_, i) => i);
const y = x.map(i => Math.sin(i * 0.1) + Math.random() * 0.2);

// Create plot element
const plotDiv = document.createElement('div');
plotDiv.id = 'myplot';
plotDiv.style.width = '600px';
plotDiv.style.height = '400px';

// Add to DOM
document.body.appendChild(plotDiv);

// Create scatter plot
Viz.scatter(x, y, plotDiv, 'My Data');
```

## Key Points:
- **Import in Cell 1**: The `dj.js` file makes `dj` available globally
- **Use in other cells**: All classes available as `dj.ClassName`
- **No external dependencies**: Core functionality works without Plotly
- **Visualization**: Load Plotly separately if you need charts