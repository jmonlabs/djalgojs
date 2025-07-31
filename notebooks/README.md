# djalgojs Starboard Notebooks

Interactive JavaScript notebooks demonstrating algorithmic music composition with djalgojs.

## Notebooks

### Completed
1. **[01_getting-started.nb](01_getting-started.nb)** - Introduction to djalgojs and basic setup
2. **[02_harmony.nb](02_harmony.nb)** - Music theory, scales, chords, and harmony
3. **[06_fractals.nb](06_fractals.nb)** - Fractal music generation with cellular automata, logistic maps
4. **[08_ai.nb](08_ai.nb)** - Machine learning with Gaussian Processes for music generation

### To Be Created
3. **03_loops.nb** - Polyloops and advanced rhythmic patterns
4. **04_minimalism.nb** - Minimalist composition techniques
5. **05_walks.nb** - Random walks and algorithmic pathfinding
7. **07_genetic.nb** - Genetic algorithms and evolutionary composition

## How to Use

### Option 1: Starboard Notebook
1. Install [Starboard Notebook](https://starboard.gg/) or use the web version
2. Open any `.nb` file in Starboard
3. Run cells sequentially to explore the examples

### Option 2: Node.js
1. Install djalgojs: `npm install djalgojs`
2. Extract JavaScript code from the notebooks
3. Run in your preferred JavaScript environment

### Option 3: Browser
1. Load djalgojs from CDN: `https://cdn.skypack.dev/djalgojs`
2. Copy code sections into browser console or CodePen/JSFiddle

## Key Differences from Python marimo Notebooks

### Data Structures
**Python (tuples):**
```python
note = (60, 1.0, 0.0)  # (pitch, duration, offset)
track = [(60, 1, 0), (62, 1, 1)]
```

**JavaScript (objects):**
```javascript
const note = { pitch: 60, duration: 1.0, time: 0.0, velocity: 0.8 };
const sequence = { notes: [note1, note2], label: 'My Sequence' };
```

### JMON Integration
The JavaScript version includes native JMON (JSON Music Object Notation) support:
```javascript
const composition = JMonConverter.createComposition(sequences, {
  bpm: 120,
  effects: [{ type: 'Reverb', options: { wet: 0.3 } }],
  metadata: { name: 'My Composition' }
});
```

### Real-Time Capabilities
JavaScript notebooks can include:
- Web Audio API integration
- Real-time synthesis and effects
- Interactive visualizations
- Browser-based audio playback

## Example Code Patterns

### Basic Scale Generation
```javascript
import { Scale, JMonConverter } from 'djalgojs';

const scale = new Scale('C', 'major');
const jmonSequence = scale.toJMonSequence({
  length: 8,
  octave: 4,
  duration: '4n'
});
```

### Gaussian Process Music
```javascript
import { GaussianProcessRegressor, RBF } from 'djalgojs';

const gp = new GaussianProcessRegressor(new RBF(1.0, 1.0));
gp.fit(trainingTimes, trainingPitches);
const prediction = gp.predict(testTimes, true);
```

### Cellular Automata
```javascript
import { CellularAutomata } from 'djalgojs';

const ca = new CellularAutomata({ width: 32, ruleNumber: 30 });
const pattern = ca.generate(16);
```

## Features Demonstrated

- **Music Theory**: Scales, progressions, harmony
- **Algorithmic Generation**: Cellular automata, fractals, chaos theory
- **Machine Learning**: Gaussian Process regression for music
- **Data Formats**: JMON export for professional audio tools
- **Real-Time**: Browser-compatible audio synthesis concepts

## Contributing

To create additional notebooks:

1. Follow the existing notebook structure
2. Use `# %% [markdown]` for documentation cells
3. Use `# %% [javascript]` for code cells
4. Include practical examples with console output
5. Maintain the navigation footer

## Original Python Source

These notebooks are adapted from the original Python marimo notebooks by Essi Parent:
- Original repository: [jmonlabs/djalgo](https://github.com/jmonlabs/djalgo)
- Python notebooks: `docs/source/*.py`

---

*© 2024 djalgojs - TypeScript adaptation of djalgo by Essi Parent*