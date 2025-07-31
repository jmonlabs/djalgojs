// Simple djalgojs bundle - algorithms only, no visualization dependencies

// Re-export everything from the core algorithms
export * from './index-no-viz';

// Also create a default export object for easier access
import * as algorithms from './index-no-viz';

const dj = {
  ...algorithms
};

export { dj };
export default dj;