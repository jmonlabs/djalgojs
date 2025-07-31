// ES Module wrapper for starboard.gg compatibility
import * as djalgojs from './djalgojs.esm.min.js';

// Export as 'dj' for starboard.gg
export const dj = djalgojs;

// Also export individual items for convenience
export const {
  // Music Theory and Harmony
  MusicTheoryConstants,
  Scale,
  Progression,
  Voice,
  Ornament,
  Rhythm,
  AdvancedRhythm,
  GeneticRhythm,
  MotifBank,
  
  // Algorithms
  GaussianProcessRegressor,
  KernelGenerator,
  RBF,
  RationalQuadratic,
  Periodic,
  CellularAutomata,
  Polyloop,
  GeneticAlgorithm,
  RandomWalk,
  Mandelbrot,
  LogisticMap,
  MinimalismProcess,
  Tintinnabuli,
  
  // Analysis
  MusicalAnalysis,
  
  // I/O and Conversion
  JMonConverter,
  
  // Utilities
  MusicUtils,
  
  // Visualization - all exports
  PlotRenderer,
  PolyloopVisualizer,
  CAVisualizer,
  FractalVisualizer
} = djalgojs;

// Default export as dj
export default dj;