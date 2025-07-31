# djalgojs

djalgojs is a JavaScript library for algorithmic music composition and visualization designed to be the successor of the Python library djalgo. djalgojs was mostly translated from Python to Typescript using AI.

## Installation

### CDN

```html
<!-- First, load Plotly.js (required for visualization) -->
<script src="https://cdn.plot.ly/plotly-2.24.1.min.js"></script>

<!-- Then load djalgojs -->
<script type="module">
  import { dj, viz } from "https://cdn.jsdelivr.net/gh/jmonlabs/djalgojs@main/dist/djalgojs.min.js";
  
  // Now you can use dj and viz
  console.log(dj);
  console.log(viz);
</script>
```

### In Starboard.gg Notebooks

```javascript
// First, import Plotly.js
import Plotly from "https://cdn.plot.ly/plotly-2.24.1.min.js";
window.Plotly = Plotly;  // Make it available globally

// Then import djalgojs
import { dj, viz } from "https://cdn.jsdelivr.net/gh/jmonlabs/djalgojs@main/dist/djalgojs.min.js";

// Now you can use both dj and viz
const scale = new dj.Scale('C', 'major');
const notes = scale.generate(4, 8);
console.log(notes);

// Create a visualization
const x = Array.from({length: 20}, (_, i) => i);
const y = x.map(x => Math.sin(x * 0.5));
viz.line(x, y, element, 'Sine Wave');
```

## Features

- Music theory and harmony utilities
- Algorithmic composition tools
- Data visualization with Plotly.js
- Cellular automata, fractals, and other generative algorithms

## Documentation

See the examples directory for usage examples.
