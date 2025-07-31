/**
 * Advanced rhythm algorithms matching the Python djalgo implementation
 */
export class AdvancedRhythm {
    /**
     * Isorhythm implementation - merges durations and pitches cyclically
     */
    static isorhythm(pitches, durations) {
        // Calculate LCM to find the cycle length
        const lcm = this.lcm(pitches.length, durations.length);
        // Repeat patterns to match LCM
        const pRepeated = this.repeatToLength(pitches, lcm);
        const dRepeated = this.repeatToLength(durations, lcm);
        // Create notes with proper offsets
        const notes = [];
        let currentOffset = 0;
        for (let i = 0; i < lcm; i++) {
            notes.push({
                pitch: pRepeated[i] || undefined,
                duration: dRepeated[i],
                offset: currentOffset,
                velocity: 0.8
            });
            currentOffset += dRepeated[i];
        }
        return notes;
    }
    /**
     * Beat cycle implementation - maps pitches to durations cyclically
     */
    static beatcycle(pitches, durations) {
        const notes = [];
        let currentOffset = 0;
        let durationIndex = 0;
        for (const pitch of pitches) {
            const duration = durations[durationIndex % durations.length];
            notes.push({
                pitch: pitch || undefined,
                duration,
                offset: currentOffset,
                velocity: 0.8
            });
            currentOffset += duration;
            durationIndex++;
        }
        return notes;
    }
    /**
     * Simple LCM calculation
     */
    static lcm(a, b) {
        return Math.abs(a * b) / this.gcd(a, b);
    }
    /**
     * Simple GCD calculation
     */
    static gcd(a, b) {
        while (b !== 0) {
            const temp = b;
            b = a % b;
            a = temp;
        }
        return a;
    }
    /**
     * Repeat array to specific length
     */
    static repeatToLength(array, length) {
        const result = [];
        for (let i = 0; i < length; i++) {
            result.push(array[i % array.length]);
        }
        return result;
    }
}
/**
 * Enhanced Rhythm class with genetic algorithm support
 */
export class Rhythm {
    constructor(measureLength, durations) {
        this.measureLength = measureLength;
        this.durations = durations;
    }
    /**
     * Generate random rhythm with constraints
     */
    random(seed, restProbability = 0, maxIter = 100) {
        if (seed !== undefined) {
            // Simple seed-based random (for reproducibility)
            Math.random = this.seededRandom(seed);
        }
        const rhythm = [];
        let totalLength = 0;
        let nIter = 0;
        while (totalLength < this.measureLength) {
            if (nIter >= maxIter) {
                console.warn('Max iterations reached. The sum of the durations is not equal to the measure length.');
                break;
            }
            const duration = this.durations[Math.floor(Math.random() * this.durations.length)];
            if (totalLength + duration > this.measureLength) {
                continue;
            }
            if (Math.random() < restProbability) {
                continue;
            }
            rhythm.push({
                duration,
                offset: totalLength
            });
            totalLength += duration;
            nIter++;
        }
        return rhythm;
    }
    /**
     * Genetic algorithm for rhythm evolution
     */
    darwin(seed, populationSize = 10, maxGenerations = 50, mutationRate = 0.1) {
        const ga = new GeneticRhythm(seed, populationSize, this.measureLength, maxGenerations, mutationRate, this.durations);
        return ga.generate();
    }
    /**
     * Simple seeded random number generator
     */
    seededRandom(seed) {
        let m = 0x80000000; // 2**31
        let a = 1103515245;
        let c = 12345;
        let state = seed;
        return function () {
            state = (a * state + c) % m;
            return state / (m - 1);
        };
    }
}
/**
 * Genetic algorithm for rhythm generation
 */
export class GeneticRhythm {
    constructor(seed, populationSize, measureLength, maxGenerations, mutationRate, durations) {
        if (seed !== undefined) {
            // Set up seeded random
            Math.random = this.seededRandom(seed);
        }
        this.populationSize = populationSize;
        this.measureLength = measureLength;
        this.maxGenerations = maxGenerations;
        this.mutationRate = mutationRate;
        this.durations = durations;
        this.population = this.initializePopulation();
    }
    /**
     * Initialize random population
     */
    initializePopulation() {
        const population = [];
        for (let i = 0; i < this.populationSize; i++) {
            population.push(this.createRandomRhythm());
        }
        return population;
    }
    /**
     * Create a single random rhythm
     */
    createRandomRhythm() {
        const rhythm = [];
        let totalLength = 0;
        while (totalLength < this.measureLength) {
            const remaining = this.measureLength - totalLength;
            const noteLength = this.durations[Math.floor(Math.random() * this.durations.length)];
            if (noteLength <= remaining) {
                rhythm.push({
                    duration: noteLength,
                    offset: totalLength
                });
                totalLength += noteLength;
            }
            else {
                break;
            }
        }
        return rhythm;
    }
    /**
     * Evaluate fitness of a rhythm
     */
    evaluateFitness(rhythm) {
        const totalLength = rhythm.reduce((sum, note) => sum + note.duration, 0);
        return Math.abs(this.measureLength - totalLength);
    }
    /**
     * Select parent for reproduction
     */
    selectParent() {
        const parent1 = this.population[Math.floor(Math.random() * this.population.length)];
        const parent2 = this.population[Math.floor(Math.random() * this.population.length)];
        return this.evaluateFitness(parent1) < this.evaluateFitness(parent2) ? parent1 : parent2;
    }
    /**
     * Crossover two parent rhythms
     */
    crossover(parent1, parent2) {
        if (parent1.length === 0 || parent2.length === 0) {
            return parent1.length > parent2.length ? [...parent1] : [...parent2];
        }
        const crossoverPoint = Math.floor(Math.random() * Math.min(parent1.length, parent2.length));
        const child = [
            ...parent1.slice(0, crossoverPoint),
            ...parent2.slice(crossoverPoint)
        ];
        return this.ensureMeasureLength(child);
    }
    /**
     * Ensure rhythm fits within measure length
     */
    ensureMeasureLength(rhythm) {
        let totalLength = 0;
        const adjustedRhythm = [];
        for (let i = 0; i < rhythm.length; i++) {
            const note = rhythm[i];
            if (totalLength + note.duration <= this.measureLength) {
                adjustedRhythm.push({
                    duration: note.duration,
                    offset: totalLength
                });
                totalLength += note.duration;
            }
            else {
                break;
            }
        }
        return adjustedRhythm;
    }
    /**
     * Mutate a rhythm
     */
    mutate(rhythm) {
        if (Math.random() > this.mutationRate || rhythm.length === 0) {
            return [...rhythm];
        }
        const mutatedRhythm = [...rhythm];
        const index = Math.floor(Math.random() * mutatedRhythm.length);
        const note = mutatedRhythm[index];
        // Calculate maximum possible duration for this position
        const nextOffset = index < mutatedRhythm.length - 1
            ? mutatedRhythm[index + 1].offset
            : this.measureLength;
        const maxNewDuration = nextOffset - note.offset;
        // Find valid durations
        const validDurations = this.durations.filter(d => d <= maxNewDuration);
        if (validDurations.length > 0) {
            const newDuration = validDurations[Math.floor(Math.random() * validDurations.length)];
            mutatedRhythm[index] = {
                duration: newDuration,
                offset: note.offset
            };
        }
        return mutatedRhythm;
    }
    /**
     * Run the genetic algorithm
     */
    generate() {
        for (let generation = 0; generation < this.maxGenerations; generation++) {
            const newPopulation = [];
            for (let i = 0; i < this.populationSize; i++) {
                const parent1 = this.selectParent();
                const parent2 = this.selectParent();
                let child = this.crossover(parent1, parent2);
                child = this.mutate(child);
                // Sort by offset
                child.sort((a, b) => a.offset - b.offset);
                newPopulation.push(child);
            }
            this.population = newPopulation;
        }
        // Return best rhythm
        const bestRhythm = this.population.reduce((best, current) => this.evaluateFitness(current) < this.evaluateFitness(best) ? current : best);
        return bestRhythm.sort((a, b) => a.offset - b.offset);
    }
    /**
     * Simple seeded random number generator
     */
    seededRandom(seed) {
        let m = 0x80000000;
        let a = 1103515245;
        let c = 12345;
        let state = seed;
        return function () {
            state = (a * state + c) % m;
            return state / (m - 1);
        };
    }
}
