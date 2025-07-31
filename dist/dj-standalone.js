// Self-contained djalgojs for starboard.gg
import * as djalgojs from './djalgojs.standalone.min.js';

// Export everything as dj
export const dj = djalgojs;

// Export individual items for convenience
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
  MusicUtils
} = djalgojs;

// Default export
export default dj;