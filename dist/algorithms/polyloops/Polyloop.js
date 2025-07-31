import { JMonConverter } from '../../io/jmon/conversion.js';
export class Polyloop {
    constructor(config) {
        this.currentTime = 0;
        this.rotationAngles = new Map();
        this.config = config;
        // Initialize rotation angles for each layer
        this.config.layers.forEach(layer => {
            this.rotationAngles.set(layer.label, 0);
        });
    }
    /**
     * Create a simple polyloop layer from rhythmic pattern
     */
    static fromRhythm(durations, pitches = [60], options = {}) {
        const { instrument = 'synth', color = 'steelblue', label = 'Polyloop', speed = 1, radius = 0.8 } = options;
        const totalDuration = durations.reduce((sum, dur) => sum + dur, 0);
        const points = [];
        let currentAngle = 0;
        durations.forEach((duration, index) => {
            const angleStep = (duration / totalDuration) * 360;
            points.push({
                angle: currentAngle,
                radius,
                active: duration > 0,
                pitch: duration > 0 ? pitches[index % pitches.length] : undefined,
                velocity: 0.8,
                instrument
            });
            currentAngle += angleStep;
        });
        return {
            points,
            color,
            label,
            instrument,
            divisions: durations.length,
            speed
        };
    }
    /**
     * Create polyloop layer from Euclidean rhythm
     */
    static euclidean(beats, pulses, pitches = [60], options = {}) {
        const { instrument = 'synth', color = 'steelblue', label = `Euclidean ${pulses}/${beats}`, speed = 1, radius = 0.8 } = options;
        // Generate Euclidean rhythm
        const pattern = this.generateEuclideanRhythm(beats, pulses);
        const points = [];
        pattern.forEach((active, index) => {
            const angle = (index / beats) * 360;
            points.push({
                angle,
                radius,
                active,
                pitch: active ? pitches[index % pitches.length] : undefined,
                velocity: 0.8,
                instrument
            });
        });
        return {
            points,
            color,
            label,
            instrument,
            divisions: beats,
            speed
        };
    }
    /**
     * Generate Euclidean rhythm pattern
     */
    static generateEuclideanRhythm(beats, pulses) {
        if (pulses >= beats) {
            return Array(beats).fill(true);
        }
        const pattern = Array(beats).fill(false);
        const interval = beats / pulses;
        for (let i = 0; i < pulses; i++) {
            const index = Math.round(i * interval) % beats;
            pattern[index] = true;
        }
        return pattern;
    }
    /**
     * Create polyloop with mathematical function
     */
    static fromFunction(func, divisions = 16, pitchRange = [60, 72], options = {}) {
        const { instrument = 'synth', color = 'purple', label = 'Function Polyloop', speed = 1, activeThreshold = 0.5 } = options;
        const points = [];
        const [minPitch, maxPitch] = pitchRange;
        for (let i = 0; i < divisions; i++) {
            const angle = (i / divisions) * 360;
            const angleRad = (angle * Math.PI) / 180;
            const value = func(angleRad);
            const normalizedValue = Math.abs(value) % 1;
            points.push({
                angle,
                radius: 0.3 + normalizedValue * 0.5, // Vary radius based on function
                active: normalizedValue > activeThreshold,
                pitch: Math.round(minPitch + normalizedValue * (maxPitch - minPitch)),
                velocity: 0.5 + normalizedValue * 0.5,
                instrument
            });
        }
        return {
            points,
            color,
            label,
            instrument,
            divisions,
            speed
        };
    }
    /**
     * Advance time and calculate triggers
     */
    step(deltaTime) {
        this.currentTime += deltaTime;
        const triggers = [];
        this.config.layers.forEach(layer => {
            const currentAngle = this.rotationAngles.get(layer.label) || 0;
            const newAngle = (currentAngle + (deltaTime * layer.speed * 360)) % 360;
            this.rotationAngles.set(layer.label, newAngle);
            // Check for triggers when the rotation line crosses points
            layer.points.forEach(point => {
                if (!point.active)
                    return;
                const angleDiff = Math.abs(newAngle - point.angle);
                const crossedPoint = angleDiff < (layer.speed * 360 * deltaTime) + 1; // Small tolerance
                if (crossedPoint) {
                    triggers.push({
                        time: this.currentTime,
                        layer: layer.label,
                        point,
                        angle: newAngle
                    });
                }
            });
        });
        return triggers;
    }
    /**
     * Generate a sequence of triggers for a given duration
     */
    generateSequence(duration, stepsPerBeat = 16) {
        const stepSize = 1 / stepsPerBeat; // Duration of each step in beats
        const totalSteps = Math.floor(duration / stepSize);
        const allTriggers = [];
        this.currentTime = 0;
        this.resetRotations();
        for (let step = 0; step < totalSteps; step++) {
            const triggers = this.step(stepSize);
            allTriggers.push(...triggers);
        }
        return allTriggers;
    }
    /**
     * Reset all rotation angles
     */
    resetRotations() {
        this.config.layers.forEach(layer => {
            this.rotationAngles.set(layer.label, 0);
        });
        this.currentTime = 0;
    }
    /**
     * Convert triggers to JMON sequences
     */
    toJMonSequences(duration = 4) {
        const triggers = this.generateSequence(duration);
        const sequencesByLayer = new Map();
        // Group triggers by layer
        triggers.forEach(trigger => {
            if (!sequencesByLayer.has(trigger.layer)) {
                sequencesByLayer.set(trigger.layer, []);
            }
            sequencesByLayer.get(trigger.layer).push(trigger);
        });
        // Convert each layer to JMON sequence
        const sequences = [];
        sequencesByLayer.forEach((layerTriggers, layerName) => {
            const notes = layerTriggers.map(trigger => ({
                note: JMonConverter.midiToNoteName(trigger.point.pitch || 60),
                time: JMonConverter.timeToMusicalTime(trigger.time),
                duration: '8n', // Default duration
                velocity: trigger.point.velocity || 0.8
            }));
            sequences.push({
                label: layerName,
                notes,
                synth: {
                    type: 'Synth',
                    options: {
                        oscillator: { type: 'sine' },
                        envelope: { attack: 0.01, decay: 0.1, sustain: 0.3, release: 0.5 }
                    }
                }
            });
        });
        return sequences;
    }
    /**
     * Get current state for visualization
     */
    getVisualizationState() {
        return {
            layers: this.config.layers,
            rotationAngles: new Map(this.rotationAngles),
            currentTime: this.currentTime
        };
    }
    /**
     * Add a new layer to the polyloop
     */
    addLayer(layer) {
        this.config.layers.push(layer);
        this.rotationAngles.set(layer.label, 0);
    }
    /**
     * Remove a layer from the polyloop
     */
    removeLayer(label) {
        const index = this.config.layers.findIndex(layer => layer.label === label);
        if (index !== -1) {
            this.config.layers.splice(index, 1);
            this.rotationAngles.delete(label);
            return true;
        }
        return false;
    }
    /**
     * Create Observable Plot visualization of the polyloop
     */
    plot(options) {
        const { PolyloopVisualizer } = require('../../visualization/polyloops/PolyloopVisualizer.js');
        return PolyloopVisualizer.plotPolyloop(this.config.layers, options);
    }
    /**
     * Create Observable Plot timeline visualization
     */
    plotTimeline(duration = 8, options) {
        const { PolyloopVisualizer } = require('../../visualization/polyloops/PolyloopVisualizer.js');
        return PolyloopVisualizer.plotTimeline(this.config.layers, duration, options);
    }
    /**
     * Create animated visualization frames
     */
    plotAnimated(numFrames = 12, options) {
        const { PolyloopVisualizer } = require('../../visualization/polyloops/PolyloopVisualizer.js');
        return PolyloopVisualizer.plotAnimated(this.config.layers, numFrames, options);
    }
}
