// Core plotting functionality
export * from './plots/PlotRenderer';

// Specialized visualizers
export * from './cellular-automata/CAVisualizer';
export * from './polyloops/PolyloopVisualizer';
export * from './fractals/FractalVisualizer';

// Re-export types for convenience
export type { 
  PlotOptions, 
  PlotData 
} from './plots/PlotRenderer';

export type { 
  CAVisualizationOptions 
} from './cellular-automata/CAVisualizer';

// PolyloopVisualizer doesn't export these types yet, but PlotRenderer and others do

export type { 
  PolyloopPoint,
  PolyloopLayer
} from '../types/polyloop';

export type { 
  FractalVisualizationOptions,
  LogisticMapData,
  MandelbrotPoint 
} from './fractals/FractalVisualizer';