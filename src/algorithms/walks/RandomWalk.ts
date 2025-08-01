export interface WalkOptions {
  length?: number;
  dimensions?: number;
  stepSize?: number;
  bounds?: [number, number];
  branchProbability?: number;
  mergeProbability?: number;
  attractorStrength?: number;
  attractorPosition?: number[];
}

export interface WalkState {
  position: number[];
  velocity: number[];
  branches: WalkState[];
  age: number;
  active: boolean;
}

/**
 * Multi-dimensional random walk generator with branching and merging
 * Based on the Python djalgo walk module (Chain class)
 */
export class RandomWalk {
  private options: Required<WalkOptions>;
  private walkers: WalkState[];
  private history: number[][];

  constructor(options: WalkOptions = {}) {
    this.options = {
      length: options.length || 100,
      dimensions: options.dimensions || 1,
      stepSize: options.stepSize || 1,
      bounds: options.bounds || [-100, 100],
      branchProbability: options.branchProbability || 0.05,
      mergeProbability: options.mergeProbability || 0.02,
      attractorStrength: options.attractorStrength || 0,
      attractorPosition: options.attractorPosition || Array(options.dimensions || 1).fill(0)
    };

    this.walkers = [];
    this.history = [];
  }

  /**
   * Generate random walk sequence
   */
  public generate(startPosition?: number[]): number[][] {
    this.initialize(startPosition);
    this.history = [];

    for (let step = 0; step < this.options.length; step++) {
      this.updateWalkers();
      this.recordState();
      this.handleBranching();
      this.handleMerging();
    }

    return this.history;
  }

  /**
   * Initialize walker(s)
   */
  private initialize(startPosition?: number[]): void {
    const initialPosition = startPosition || Array(this.options.dimensions).fill(0);
    
    this.walkers = [{
      position: [...initialPosition],
      velocity: Array(this.options.dimensions).fill(0),
      branches: [],
      age: 0,
      active: true
    }];
  }

  /**
   * Update all active walkers
   */
  private updateWalkers(): void {
    for (const walker of this.walkers) {
      if (!walker.active) continue;

      // Random step in each dimension
      for (let dim = 0; dim < this.options.dimensions; dim++) {
        const randomStep = (Math.random() - 0.5) * 2 * this.options.stepSize;
        
        // Apply attractor force if enabled
        let attractorForce = 0;
        if (this.options.attractorStrength > 0) {
          const distance = walker.position[dim] - this.options.attractorPosition[dim];
          attractorForce = -this.options.attractorStrength * distance;
        }
        
        // Update velocity and position
        walker.velocity[dim] = walker.velocity[dim] * 0.9 + randomStep + attractorForce;
        walker.position[dim] += walker.velocity[dim];
        
        // Apply bounds
        if (walker.position[dim] < this.options.bounds[0]) {
          walker.position[dim] = this.options.bounds[0];
          walker.velocity[dim] *= -0.5; // Bounce with damping
        } else if (walker.position[dim] > this.options.bounds[1]) {
          walker.position[dim] = this.options.bounds[1];
          walker.velocity[dim] *= -0.5;
        }
      }

      walker.age++;
    }
  }

  /**
   * Record current state of all walkers
   */
  private recordState(): void {
    const activeWalkers = this.walkers.filter(w => w.active);
    
    if (activeWalkers.length > 0) {
      // Average position if multiple walkers, or just use the primary walker
      const avgPosition: number[] = Array(this.options.dimensions).fill(0);
      
      for (const walker of activeWalkers) {
        for (let dim = 0; dim < this.options.dimensions; dim++) {
          avgPosition[dim] += walker.position[dim];
        }
      }
      
      for (let dim = 0; dim < this.options.dimensions; dim++) {
        avgPosition[dim] /= activeWalkers.length;
      }
      
      this.history.push([...avgPosition]);
    }
  }

  /**
   * Handle branching (walker splitting)
   */
  private handleBranching(): void {
    const newBranches: WalkState[] = [];
    
    for (const walker of this.walkers) {
      if (!walker.active) continue;
      
      if (Math.random() < this.options.branchProbability) {
        // Create a new branch
        const branch: WalkState = {
          position: [...walker.position],
          velocity: walker.velocity.map(v => v + (Math.random() - 0.5) * this.options.stepSize),
          branches: [],
          age: 0,
          active: true
        };
        
        newBranches.push(branch);
        walker.branches.push(branch);
      }
    }
    
    this.walkers.push(...newBranches);
  }

  /**
   * Handle merging (walker combining)
   */
  private handleMerging(): void {
    if (this.walkers.length <= 1) return;
    
    const activeWalkers = this.walkers.filter(w => w.active);
    const mergeThreshold = this.options.stepSize * 2;
    
    for (let i = 0; i < activeWalkers.length; i++) {
      for (let j = i + 1; j < activeWalkers.length; j++) {
        if (Math.random() < this.options.mergeProbability) {
          const distance = this.calculateDistance(activeWalkers[i].position, activeWalkers[j].position);
          
          if (distance < mergeThreshold) {
            // Merge walkers - average their properties
            for (let dim = 0; dim < this.options.dimensions; dim++) {
              activeWalkers[i].position[dim] = (activeWalkers[i].position[dim] + activeWalkers[j].position[dim]) / 2;
              activeWalkers[i].velocity[dim] = (activeWalkers[i].velocity[dim] + activeWalkers[j].velocity[dim]) / 2;
            }
            
            activeWalkers[j].active = false;
          }
        }
      }
    }
    
    // Remove inactive walkers
    this.walkers = this.walkers.filter(w => w.active);
  }

  /**
   * Calculate Euclidean distance between two positions
   */
  private calculateDistance(pos1: number[], pos2: number[]): number {
    let sum = 0;
    for (let i = 0; i < pos1.length; i++) {
      sum += Math.pow(pos1[i] - pos2[i], 2);
    }
    return Math.sqrt(sum);
  }

  /**
   * Get 1D projection of multi-dimensional walk
   */
  public getProjection(dimension: number = 0): number[] {
    return this.history.map(state => state[dimension] || 0);
  }

  /**
   * Map walk to musical scale
   */
  public mapToScale(dimension: number = 0, scale: number[] = [0, 2, 4, 5, 7, 9, 11], octaveRange: number = 3): number[] {
    const projection = this.getProjection(dimension);
    if (projection.length === 0) return [];
    
    const minVal = Math.min(...projection);
    const maxVal = Math.max(...projection);
    const range = maxVal - minVal || 1;
    
    return projection.map(value => {
      const normalized = (value - minVal) / range;
      const scaleIndex = Math.floor(normalized * scale.length * octaveRange);
      const octave = Math.floor(scaleIndex / scale.length);
      const noteIndex = scaleIndex % scale.length;
      
      return 60 + octave * 12 + scale[noteIndex];
    });
  }

  /**
   * Map walk to rhythmic durations
   */
  public mapToRhythm(dimension: number = 0, durations: number[] = [0.25, 0.5, 1, 2]): number[] {
    const projection = this.getProjection(dimension);
    if (projection.length === 0) return [];
    
    const minVal = Math.min(...projection);
    const maxVal = Math.max(...projection);
    const range = maxVal - minVal || 1;
    
    return projection.map(value => {
      const normalized = (value - minVal) / range;
      const durationIndex = Math.floor(normalized * durations.length);
      const clampedIndex = Math.max(0, Math.min(durationIndex, durations.length - 1));
      return durations[clampedIndex];
    });
  }

  /**
   * Map walk to velocities
   */
  public mapToVelocity(dimension: number = 0, minVel: number = 0.3, maxVel: number = 1.0): number[] {
    const projection = this.getProjection(dimension);
    if (projection.length === 0) return [];
    
    const minVal = Math.min(...projection);
    const maxVal = Math.max(...projection);
    const range = maxVal - minVal || 1;
    
    return projection.map(value => {
      const normalized = (value - minVal) / range;
      return minVel + normalized * (maxVel - minVel);
    });
  }

  /**
   * Generate correlated walk (walk that follows another walk with some correlation)
   */
  public generateCorrelated(targetWalk: number[], correlation: number = 0.5, dimension: number = 0): number[] {
    if (targetWalk.length === 0) return [];
    
    const correlatedWalk: number[] = [];
    let position = 0;
    
    for (let i = 0; i < targetWalk.length; i++) {
      const randomStep = (Math.random() - 0.5) * 2 * this.options.stepSize;
      const correlatedStep = correlation * (targetWalk[i] - position);
      
      position += randomStep + correlatedStep;
      
      // Apply bounds
      position = Math.max(this.options.bounds[0], Math.min(this.options.bounds[1], position));
      
      correlatedWalk.push(position);
    }
    
    return correlatedWalk;
  }

  /**
   * Analyze walk properties
   */
  public analyze(): {
    meanDisplacement: number;
    meanSquaredDisplacement: number;
    totalDistance: number;
    fractalDimension: number;
  } {
    if (this.history.length < 2) {
      return {
        meanDisplacement: 0,
        meanSquaredDisplacement: 0,
        totalDistance: 0,
        fractalDimension: 0
      };
    }
    
    const projection = this.getProjection(0);
    const startPos = projection[0];
    const endPos = projection[projection.length - 1];
    
    // Mean displacement
    const meanDisplacement = Math.abs(endPos - startPos);
    
    // Mean squared displacement
    const squaredDisplacements = projection.map(pos => Math.pow(pos - startPos, 2));
    const meanSquaredDisplacement = squaredDisplacements.reduce((sum, sq) => sum + sq, 0) / squaredDisplacements.length;
    
    // Total distance traveled
    let totalDistance = 0;
    for (let i = 1; i < projection.length; i++) {
      totalDistance += Math.abs(projection[i] - projection[i - 1]);
    }
    
    // Rough fractal dimension estimate (box-counting approximation)
    const fractalDimension = totalDistance > 0 ? Math.log(totalDistance) / Math.log(projection.length) : 0;
    
    return {
      meanDisplacement,
      meanSquaredDisplacement,
      totalDistance,
      fractalDimension
    };
  }

  /**
   * Get current walker states
   */
  public getWalkerStates(): WalkState[] {
    return this.walkers.map(walker => ({ ...walker }));
  }

  /**
   * Reset the walk generator
   */
  public reset(): void {
    this.walkers = [];
    this.history = [];
  }
}