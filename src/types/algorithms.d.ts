import { Matrix } from '../utils/Matrix';

export interface KernelParams {
  [key: string]: number;
}

export interface GaussianProcessOptions {
  alpha?: number;
  optimizer?: 'fmin_l_bfgs_b' | null;
  n_restarts_optimizer?: number;
  normalize_y?: boolean;
  copy_X_train?: boolean;
  random_state?: number | null;
}

export interface PredictionResult {
  mean: number[];
  std?: number[];
}

export interface FitnessFunction<T> {
  (individual: T): number;
}

export interface GeneticAlgorithmOptions {
  populationSize: number;
  generations: number;
  mutationRate: number;
  crossoverRate: number;
  eliteSize?: number;
}

export interface CellularAutomataRule {
  [pattern: string]: number;
}

export interface ChaoticSystemOptions {
  iterations: number;
  initialConditions?: number[];
  parameters?: { [key: string]: number };
}

export interface MarkovChainOptions {
  order: number;
  walkLength: number;
  startState?: number | number[];
}