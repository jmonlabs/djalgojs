import { Polyloop, PolyloopVisualizer } from '../src';

// Example of creating and visualizing polyloops
console.log('=== Polyloop Visualization Example ===');

// Create a basic polyloop from rhythm pattern
const kickPattern = [1, 0, 0, 0, 1, 0, 0, 0]; // Simple kick pattern
const kickLayer = Polyloop.fromRhythm(
  kickPattern,
  [36], // C1 kick drum
  {
    instrument: 'kick',
    color: 'red',
    label: 'Kick Drum',
    speed: 1
  }
);

// Create hihat pattern using Euclidean rhythm
const hihatLayer = Polyloop.euclidean(
  16, // 16 steps
  5,  // 5 hits
  [42], // F#1 hihat
  {
    instrument: 'hihat',
    color: 'blue',
    label: 'Hi-Hat',
    speed: 1,
    radius: 0.6
  }
);

// Create a snare pattern
const snarePattern = [0, 0, 1, 0, 0, 0, 1, 0];
const snareLayer = Polyloop.fromRhythm(
  snarePattern,
  [38], // D1 snare
  {
    instrument: 'snare',
    color: 'green',
    label: 'Snare',
    speed: 1,
    radius: 0.9
  }
);

// Create bass pattern using mathematical function
const bassLayer = Polyloop.fromFunction(
  (angle) => Math.sin(angle * 2) * 0.5 + 0.5, // Sine wave with 2 cycles
  8, // 8 steps
  [36, 48], // C1 to C2 range
  {
    instrument: 'bass',
    color: 'purple',
    label: 'Bass Line',
    speed: 0.5, // Half speed
    activeThreshold: 0.3
  }
);

// Create polyloop configuration
const polyloopConfig = {
  layers: [kickLayer, snareLayer, hihatLayer, bassLayer],
  bpm: 120,
  timeSignature: [4, 4] as [number, number],
  measures: 4
};

// Create the polyloop instance
const polyloop = new Polyloop(polyloopConfig);

console.log('Created polyloop with layers:', polyloop.getVisualizationState().layers.map(l => l.label));

// Generate sequence for 8 beats
const triggers = polyloop.generateSequence(8);
console.log(`Generated ${triggers.length} triggers over 8 beats`);

// Show first few triggers
triggers.slice(0, 10).forEach(trigger => {
  console.log(`Time: ${trigger.time.toFixed(2)}, Layer: ${trigger.layer}, Pitch: ${trigger.point.pitch}`);
});

// Convert to JMON sequences
const jmonSequences = polyloop.toJMonSequences(8);
console.log('\nJMON Sequences created:');
jmonSequences.forEach(seq => {
  console.log(`- ${seq.label}: ${seq.notes.length} notes`);
});

// Visualization examples (these would create HTML elements in a browser environment)
console.log('\n=== Visualization Methods Available ===');
console.log('1. polyloop.plot() - Main circular polyloop view');
console.log('2. polyloop.plotTimeline(8) - Timeline showing triggers over time');
console.log('3. polyloop.plotAnimated(12) - 12 animation frames');
console.log('4. PolyloopVisualizer.plotPolyloop(layers) - Direct visualization');

// Example of creating different polyloop patterns
console.log('\n=== Different Polyloop Patterns ===');

// Fibonacci rhythm
const fibNumbers = [1, 1, 2, 3, 5, 8];
const fibRhythm = fibNumbers.map(n => n / 8); // Normalize
const fibLayer = Polyloop.fromRhythm(fibRhythm, [60, 64, 67], {
  label: 'Fibonacci',
  color: 'orange'
});

// Prime number rhythm
const primes = [2, 3, 5, 7, 11, 13];
const primeRhythm = primes.map(p => p / 16); // Normalize
const primeLayer = Polyloop.fromRhythm(primeRhythm, [48, 52, 55], {
  label: 'Prime Numbers',
  color: 'cyan'
});

console.log('Fibonacci layer points:', fibLayer.points.length);
console.log('Prime layer points:', primeLayer.points.length);

// Complex mathematical pattern
const complexLayer = Polyloop.fromFunction(
  (angle) => {
    // Combination of sine and cosine with different frequencies
    return Math.sin(angle * 3) * Math.cos(angle * 5) * 0.5 + 0.5;
  },
  24, // More steps for complex pattern
  [72, 84], // Higher pitch range
  {
    label: 'Complex Wave',
    color: 'magenta',
    activeThreshold: 0.6,
    speed: 2 // Double speed
  }
);

console.log('Complex layer active points:', complexLayer.points.filter(p => p.active).length);

console.log('\n=== Polyloop Features Demonstrated ===');
console.log('✓ Rhythm pattern conversion to circular representation');
console.log('✓ Euclidean rhythm generation');
console.log('✓ Mathematical function-based patterns');
console.log('✓ Multi-layer composition with different speeds');
console.log('✓ JMON export for professional audio tools');
console.log('✓ Observable Plot visualization integration');
console.log('✓ Animation frame generation for web interfaces');
console.log('✓ Timeline view for rhythm analysis');