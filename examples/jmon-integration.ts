import {
  Scale,
  Progression,
  Rhythm,
  CellularAutomata,
  GaussianProcessRegressor,
  RBF,
} from '../src';

import { JMonConverter } from '../src/io/jmon/conversion';
import { JMonComposition } from '../src/types/jmon';

// Example 1: Generate a scale sequence in JMON format
console.log('=== Scale to JMON ===');
const scale = new Scale('C', 'major');
const scaleSequence = scale.toJMonSequence({
  length: 8,
  octave: 4,
  duration: '4n',
  velocity: 0.8,
  label: 'C Major Scale'
});

console.log('Scale sequence:', JSON.stringify(scaleSequence, null, 2));

// Example 2: Generate chord progression in JMON format
console.log('\n=== Progression to JMON ===');
const progression = new Progression('C', 'major');
const progressionSequence = progression.toJMonSequence({
  length: 4,
  octave: 3,
  duration: '1n',
  velocity: 0.9,
  label: 'C Major Progression',
  voicing: 'triad',
  strumPattern: false
});

console.log('Progression sequence:', JSON.stringify(progressionSequence, null, 2));

// Example 3: Convert rhythm pattern to JMON
console.log('\n=== Rhythm Pattern to JMON ===');
const rhythm = new Rhythm(4.0);
const rhythmPattern = rhythm.random({ complexity: 0.7 });
const rhythmSequence = JMonConverter.rhythmPatternToJMonSequence(
  rhythmPattern,
  [60, 64, 67], // C, E, G
  'Random Rhythm Pattern'
);

console.log('Rhythm sequence:', JSON.stringify(rhythmSequence, null, 2));

// Example 4: Use Cellular Automata for rhythm and convert to JMON
console.log('\n=== Cellular Automata Rhythm to JMON ===');
const ca = new CellularAutomata({ width: 16, ruleNumber: 30 });
const caPattern = ca.generate(4);

// Convert CA pattern to rhythm
const caRhythm = {
  durations: caPattern[0]!.map(cell => cell ? 0.25 : 0.125),
  measureLength: 4.0,
  accents: caPattern[0]!.map(cell => cell === 1)
};

const caSequence = JMonConverter.rhythmPatternToJMonSequence(
  caRhythm,
  [48, 52, 55, 60], // Bass line
  'Cellular Automata Rhythm'
);

console.log('CA rhythm sequence:', JSON.stringify(caSequence, null, 2));

// Example 5: Create a complete JMON composition
console.log('\n=== Complete JMON Composition ===');
const composition = JMonConverter.createComposition(
  [scaleSequence, progressionSequence, rhythmSequence, caSequence],
  {
    bpm: 120,
    keySignature: 'C',
    timeSignature: '4/4',
    effects: [
      {
        type: 'Reverb',
        options: { wet: 0.3, roomSize: 0.7, dampening: 0.5 }
      },
      {
        type: 'Delay',
        options: { wet: 0.2, delayTime: '8n', feedback: 0.4 }
      }
    ],
    metadata: {
      name: 'Algorithmic Composition',
      author: 'djalgojs',
      description: 'Generated using various algorithmic techniques'
    }
  }
);

console.log('Complete composition:', JSON.stringify(composition, null, 2));

// Example 6: Gaussian Process melody generation with JMON output
console.log('\n=== GP Melody to JMON ===');
const kernel = new RBF(1.0, 1.0);
const gp = new GaussianProcessRegressor(kernel);

// Train on C major scale
const X = [[0], [1], [2], [3], [4], [5], [6], [7]];
const y = [60, 62, 64, 65, 67, 69, 71, 72]; // C major scale

gp.fit(X, y);

// Generate melody variations
const testPoints = [[0.5], [1.5], [2.5], [3.5], [4.5], [5.5], [6.5], [7.5]];
const prediction = gp.predict(testPoints);

// Convert to JMON notes
const gpNotes = prediction.mean.map((pitch, index) => ({
  note: JMonConverter.midiToNoteName(Math.round(pitch)),
  time: JMonConverter.timeToMusicalTime(index * 0.5),
  duration: '8n',
  velocity: 0.8
}));

const gpSequence = {
  label: 'GP Generated Melody',
  notes: gpNotes,
  synth: {
    type: 'Synth' as const,
    options: {
      oscillator: { type: 'triangle' },
      envelope: { attack: 0.02, decay: 0.1, sustain: 0.3, release: 0.5 }
    }
  }
};

console.log('GP melody sequence:', JSON.stringify(gpSequence, null, 2));

// Example 7: Validation
console.log('\n=== JMON Validation ===');
const validation = JMonConverter.validateComposition(composition);
console.log('Composition validation:', validation);

// Example 8: Time conversion utilities
console.log('\n=== Time Conversion Examples ===');
console.log('2.5 beats to musical time:', JMonConverter.timeToMusicalTime(2.5));
console.log('0.5 duration to note value:', JMonConverter.durationToNoteValue(0.5));
console.log('C4 to MIDI:', JMonConverter.noteNameToMidi('C4'));
console.log('MIDI 60 to note name:', JMonConverter.midiToNoteName(60));

// Example 9: Advanced composition with modulation
console.log('\n=== Advanced JMON with Modulation ===');
const modulatedSequence = {
  label: 'Modulated Sequence',
  notes: [
    {
      note: 'C4',
      time: '0:0:0',
      duration: '2n',
      velocity: 0.8,
      modulations: [
        { type: 'pitchBend' as const, value: -4096, time: '0:0:0' },
        { type: 'pitchBend' as const, value: 4096, time: '0:1:0' }
      ]
    },
    {
      note: 'G4',
      time: '0:2:0',
      duration: '2n',
      velocity: 0.8,
      modulations: [
        { type: 'cc' as const, controller: 1, value: 0, time: '0:0:0' },
        { type: 'cc' as const, controller: 1, value: 127, time: '0:1:0' }
      ]
    }
  ],
  synth: {
    type: 'Synth' as const,
    modulationTarget: 'vibrato' as const,
    options: {
      oscillator: { type: 'sine' },
      envelope: { attack: 0.02, decay: 0.1, sustain: 0.5, release: 1.0 }
    }
  }
};

const advancedComposition = JMonConverter.createComposition([modulatedSequence], {
  bpm: 120,
  keySignature: 'C',
  metadata: {
    name: 'Modulated Composition',
    description: 'Example with pitch bend and modulation wheel'
  }
});

console.log('Advanced composition with modulation:', JSON.stringify(advancedComposition, null, 2));