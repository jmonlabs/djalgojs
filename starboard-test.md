# djalgojs Starboard.gg Test

Copy this into starboard.gg to test the CDN import:

## Option 1: Self-contained bundle (recommended)
```javascript
import { dj } from "https://cdn.jsdelivr.net/gh/jmonlabs/djalgojs@main/dist/dj-standalone.js";

// Test basic functionality
console.log('dj loaded:', dj);

// Create a polyloop
const polyloop = new dj.Polyloop([3, 5, 7]);
console.log('Polyloop created:', polyloop);

// Generate some music
const notes = dj.MusicUtils.generateScale('C', 'major', 4);
console.log('C major scale:', notes);

// Test genetic algorithm
const ga = new dj.GeneticAlgorithm({ populationSize: 10 });
console.log('GeneticAlgorithm created:', ga);
```

## Option 2: Direct standalone import
```javascript
import { 
  Polyloop, 
  MusicUtils, 
  GeneticAlgorithm,
  MusicalAnalysis
} from "https://cdn.jsdelivr.net/gh/jmonlabs/djalgojs@main/dist/djalgojs.standalone.min.js";

// Test functionality
const polyloop = new Polyloop([3, 5, 7]);
const notes = MusicUtils.generateScale('C', 'major', 4);
const analysis = new MusicalAnalysis();
console.log('Direct import works:', { polyloop, notes, analysis });
```

## Option 3: Full library with visualization dependencies
```javascript
// First load Plotly.js
import("https://cdn.plot.ly/plotly-latest.min.js").then(() => {
  // Then load full djalgojs
  import("https://cdn.jsdelivr.net/gh/jmonlabs/djalgojs@main/dist/index.js").then(dj => {
    // Use with visualization features
    const polyloop = new dj.Polyloop([3, 5, 7]);
    console.log('Full library loaded:', dj);
  });
});
```

**Note**: Option 1 is recommended as it's self-contained and doesn't require external dependencies.