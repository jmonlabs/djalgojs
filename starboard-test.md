# djalgojs Starboard.gg Test

Copy this into starboard.gg to test the CDN import:

## Option 1: Using dj wrapper
```javascript
import { dj } from "https://cdn.jsdelivr.net/gh/jmonlabs/djalgojs@main/dist/dj.js";

// Test basic functionality
console.log('dj loaded:', dj);

// Create a polyloop
const polyloop = new dj.Polyloop([3, 5, 7]);
console.log('Polyloop created:', polyloop);

// Generate some music
const notes = dj.MusicUtils.generateScale('C', 'major', 4);
console.log('C major scale:', notes);
```

## Option 2: Direct ES module import
```javascript
import { 
  Polyloop, 
  MusicUtils, 
  GeneticAlgorithm 
} from "https://cdn.jsdelivr.net/gh/jmonlabs/djalgojs@main/dist/djalgojs.esm.min.js";

// Test functionality
const polyloop = new Polyloop([3, 5, 7]);
const notes = MusicUtils.generateScale('C', 'major', 4);
console.log('Direct import works:', { polyloop, notes });
```

## Option 3: Import map (recommended)
```html
<script type="importmap">
{
  "imports": {
    "djalgojs": "https://cdn.jsdelivr.net/gh/jmonlabs/djalgojs@main/dist/dj.js",
    "plotly.js": "https://cdn.plot.ly/plotly-latest.min.js"
  }
}
</script>
```

```javascript
import { dj } from "djalgojs";
```