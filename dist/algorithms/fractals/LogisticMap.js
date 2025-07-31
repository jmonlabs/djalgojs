/**
 * Logistic Map chaotic sequence generator
 * Based on the equation: x(n+1) = r * x(n) * (1 - x(n))
 */
export class LogisticMap {
    constructor(options = {}) {
        this.r = options.r || 3.8; // Chaotic regime
        this.x0 = options.x0 || 0.5; // Initial condition
        this.iterations = options.iterations || 1000; // Total iterations
        this.skipTransient = options.skipTransient || 100; // Skip initial settling
    }
    /**
     * Generate logistic map sequence
     */
    generate() {
        const sequence = [];
        let x = this.x0;
        // Generate iterations including transients
        for (let i = 0; i < this.iterations + this.skipTransient; i++) {
            x = this.r * x * (1 - x);
            // Only collect after transient period
            if (i >= this.skipTransient) {
                sequence.push(x);
            }
        }
        return sequence;
    }
    /**
     * Generate bifurcation data for different r values
     */
    bifurcationDiagram(rMin = 2.5, rMax = 4.0, rSteps = 1000) {
        const rValues = [];
        const xValues = [];
        const rStep = (rMax - rMin) / rSteps;
        for (let i = 0; i < rSteps; i++) {
            const r = rMin + i * rStep;
            // Generate sequence for this r value
            const originalR = this.r;
            this.r = r;
            const sequence = this.generate();
            this.r = originalR;
            // Take last few values (settled state)
            const settledValues = sequence.slice(-50);
            for (const x of settledValues) {
                rValues.push(r);
                xValues.push(x);
            }
        }
        return { r: rValues, x: xValues };
    }
    /**
     * Map chaotic values to musical scale
     */
    mapToScale(sequence, scale = [0, 2, 4, 5, 7, 9, 11], octaveRange = 3) {
        if (sequence.length === 0)
            return [];
        return sequence.map(value => {
            // value is already in range [0, 1]
            const scaleIndex = Math.floor(value * scale.length * octaveRange);
            const octave = Math.floor(scaleIndex / scale.length);
            const noteIndex = scaleIndex % scale.length;
            // Convert to MIDI note (C4 = 60)
            return 60 + octave * 12 + scale[noteIndex];
        });
    }
    /**
     * Map to rhythmic durations
     */
    mapToRhythm(sequence, durations = [0.25, 0.5, 1, 2]) {
        if (sequence.length === 0)
            return [];
        return sequence.map(value => {
            const durationIndex = Math.floor(value * durations.length);
            const clampedIndex = Math.max(0, Math.min(durationIndex, durations.length - 1));
            return durations[clampedIndex];
        });
    }
    /**
     * Map to velocities
     */
    mapToVelocity(sequence, minVel = 0.3, maxVel = 1.0) {
        if (sequence.length === 0)
            return [];
        const range = maxVel - minVel;
        return sequence.map(value => minVel + value * range);
    }
    /**
     * Detect periodic cycles in the sequence
     */
    detectCycles(sequence, tolerance = 0.01) {
        const cycles = [];
        for (let period = 1; period <= Math.floor(sequence.length / 2); period++) {
            let isPeriodic = true;
            for (let i = period; i < Math.min(sequence.length, period * 3); i++) {
                if (Math.abs(sequence[i] - sequence[i - period]) > tolerance) {
                    isPeriodic = false;
                    break;
                }
            }
            if (isPeriodic) {
                cycles.push(period);
            }
        }
        return cycles;
    }
    /**
     * Calculate Lyapunov exponent (measure of chaos)
     */
    lyapunovExponent(iterations = 10000) {
        let x = this.x0;
        let sum = 0;
        for (let i = 0; i < iterations; i++) {
            // Derivative of logistic map: r * (1 - 2*x)
            const derivative = this.r * (1 - 2 * x);
            sum += Math.log(Math.abs(derivative));
            x = this.r * x * (1 - x);
        }
        return sum / iterations;
    }
    /**
     * Generate multiple correlated sequences
     */
    generateCoupled(numSequences = 2, coupling = 0.1) {
        const sequences = Array(numSequences).fill(null).map(() => []);
        const states = Array(numSequences).fill(this.x0);
        for (let i = 0; i < this.iterations + this.skipTransient; i++) {
            const newStates = [...states];
            // Update each sequence with coupling
            for (let j = 0; j < numSequences; j++) {
                let coupledTerm = 0;
                // Calculate coupling influence from other sequences
                for (let k = 0; k < numSequences; k++) {
                    if (k !== j) {
                        coupledTerm += coupling * (states[k] - states[j]);
                    }
                }
                // Standard logistic map update with coupling
                newStates[j] = this.r * states[j] * (1 - states[j]) + coupledTerm;
                // Keep values in valid range
                newStates[j] = Math.max(0, Math.min(1, newStates[j]));
            }
            states.splice(0, numSequences, ...newStates);
            // Collect after transient period
            if (i >= this.skipTransient) {
                for (let j = 0; j < numSequences; j++) {
                    sequences[j].push(states[j]);
                }
            }
        }
        return sequences;
    }
    /**
     * Apply different chaotic regimes
     */
    setRegime(regime, customR) {
        switch (regime) {
            case 'periodic':
                this.r = 3.2; // Period-2 cycle
                break;
            case 'chaotic':
                this.r = 3.9; // Full chaos
                break;
            case 'edge':
                this.r = 3.57; // Edge of chaos
                break;
            case 'custom':
                if (customR !== undefined) {
                    this.r = Math.max(0, Math.min(4, customR));
                }
                break;
        }
    }
    /**
     * Get current parameters
     */
    getParameters() {
        return {
            r: this.r,
            x0: this.x0,
            iterations: this.iterations,
            skipTransient: this.skipTransient
        };
    }
}
