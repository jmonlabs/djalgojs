// Music Theory and Harmony
export { MusicTheoryConstants } from './music/theory/MusicTheoryConstants';
export { Scale } from './music/theory/Scale';
export { Progression } from './music/theory/Progression';
export { Voice, Ornament } from './music/harmony';
export { Rhythm, AdvancedRhythm, GeneticRhythm } from './music/rhythm';
export { MotifBank } from './music/motifs';

// Algorithms
export { GaussianProcessRegressor, KernelGenerator } from './algorithms/gaussian-processes';
export { RBF, RationalQuadratic, Periodic } from './algorithms/gaussian-processes/kernels';
export { CellularAutomata } from './algorithms/cellular-automata';
export { Polyloop } from './algorithms/polyloops';
export { GeneticAlgorithm } from './algorithms/genetic';
export { RandomWalk } from './algorithms/walks';
export { Mandelbrot, LogisticMap } from './algorithms/fractals';
export { MinimalismProcess, Tintinnabuli } from './algorithms/minimalism';

// Analysis
export { MusicalAnalysis } from './analysis';

// I/O and Conversion
export { JMonConverter } from './io/jmon/conversion';

// Utilities
export { MusicUtils } from './utils/music';

// Type exports
export type { JMonComposition, JMonNote, JMonSequence } from './types/jmon';
export type { VoicingOptions, ChordVoicing, OrnamentOptions, OrnamentedNote } from './music/harmony';
export type { GeneticOptions, Individual } from './algorithms/genetic';
export type { WalkOptions, WalkState } from './algorithms/walks';
export type { MandelbrotOptions, LogisticMapOptions } from './algorithms/fractals';
export type { MinimalismOptions, MinimalismOperation, MinimalismDirection } from './algorithms/minimalism';
export type { Motif, MotifSearchOptions } from './music/motifs';
export type { AnalysisOptions, AnalysisResult } from './analysis';