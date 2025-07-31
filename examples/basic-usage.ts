import {
  GaussianProcessRegressor,
  RBF,
  CellularAutomata,
  Scale,
  Progression,
  Rhythm,
  MusicTheoryConstants,
} from '../src';

// Example 1: Gaussian Process for melody generation
console.log('=== Gaussian Process Example ===');
const kernel = new RBF(1.0, 1.0);
const gp = new GaussianProcessRegressor(kernel);

// Training data: time -> pitch
const X = [[0], [1], [2], [3], [4]];
const y = [60, 62, 64, 65, 67]; // C major scale

gp.fit(X, y);

// Generate new melody points
const testPoints = [[0.5], [1.5], [2.5], [3.5], [4.5]];
const prediction = gp.predict(testPoints, true);

console.log('Predicted pitches:', prediction.mean);
console.log('Uncertainty:', prediction.std);

// Example 2: Cellular Automata for rhythm patterns
console.log('\n=== Cellular Automata Example ===');
const ca = new CellularAutomata({ width: 16, ruleNumber: 30 });
const rhythmPattern = ca.generate(8);

console.log('Cellular automata rhythm pattern:');
rhythmPattern.forEach((row, i) => {
  console.log(`Step ${i}: ${row.map(cell => cell ? '●' : '○').join(' ')}`);
});

// Example 3: Music theory - scales and progressions
console.log('\n=== Music Theory Example ===');
const scale = new Scale('C', 'major');
const scalePitches = scale.generate(4, 8);
console.log('C major scale:', scalePitches);

const progression = new Progression('C', 'major');
const chordProgression = progression.generate({ length: 4 });
console.log('Chord progression:', chordProgression);

// Example 4: Rhythm generation
console.log('\n=== Rhythm Example ===');
const rhythm = new Rhythm(4.0);
const randomRhythm = rhythm.random({ complexity: 0.7 });
console.log('Random rhythm pattern:');
console.log('Durations:', randomRhythm.durations);
console.log('Accents:', randomRhythm.accents);

// Example 5: Polyrhythmic patterns
const polyrhythm = Rhythm.beatcycle([3, 4], 2);
console.log('\nPolyrhythmic pattern (3 against 4):');
polyrhythm.forEach((pattern, i) => {
  console.log(`Measure ${i + 1}:`, pattern.durations);
});

// Example 6: Advanced GP sampling
console.log('\n=== Advanced GP Sampling ===');
const samples = gp.sampleY(testPoints, 3);
console.log('Multiple melody samples:');
samples.forEach((sample, i) => {
  console.log(`Sample ${i + 1}:`, sample.map(p => Math.round(p)));
});

console.log('\n=== Music Theory Constants ===');
console.log('Chromatic scale:', MusicTheoryConstants.chromaticScale);
console.log('Major scale intervals:', MusicTheoryConstants.scaleIntervals.major);
console.log('C# to D# interval:', MusicTheoryConstants.getInterval('C#', 'D#'));