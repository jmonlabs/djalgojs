import { MusicTheoryConstants } from './MusicTheoryConstants.js';
import { JMonConverter } from '../../io/jmon/conversion.js';
export class Scale {
    constructor(tonic, mode) {
        this.tonic = tonic;
        this.mode = mode;
    }
    generate(octave = 4, length) {
        const intervals = MusicTheoryConstants.scaleIntervals[this.mode];
        const tonicIndex = MusicTheoryConstants.getChromaticIndex(this.tonic);
        const basePitches = intervals.map(interval => {
            const noteIndex = (tonicIndex + interval) % 12;
            return 60 + (octave - 4) * 12 + noteIndex; // MIDI note number
        });
        if (length === undefined) {
            return basePitches;
        }
        const result = [];
        let currentOctave = octave;
        for (let i = 0; i < length; i++) {
            const scaleIndex = i % intervals.length;
            if (scaleIndex === 0 && i > 0) {
                currentOctave++;
            }
            const interval = intervals[scaleIndex];
            const noteIndex = (tonicIndex + interval) % 12;
            const pitch = 60 + (currentOctave - 4) * 12 + noteIndex;
            result.push(pitch);
        }
        return result;
    }
    getMusicalScale() {
        const pitches = this.generate();
        return {
            tonic: this.tonic,
            mode: this.mode,
            pitches,
        };
    }
    getDegree(degree, octave = 4) {
        const intervals = MusicTheoryConstants.scaleIntervals[this.mode];
        const normalizedDegree = ((degree - 1) % intervals.length);
        const octaveOffset = Math.floor((degree - 1) / intervals.length);
        const interval = intervals[normalizedDegree];
        const tonicIndex = MusicTheoryConstants.getChromaticIndex(this.tonic);
        const noteIndex = (tonicIndex + interval) % 12;
        return 60 + (octave + octaveOffset - 4) * 12 + noteIndex;
    }
    getNoteNames() {
        const intervals = MusicTheoryConstants.scaleIntervals[this.mode];
        const tonicIndex = MusicTheoryConstants.getChromaticIndex(this.tonic);
        return intervals.map(interval => {
            const noteIndex = (tonicIndex + interval) % 12;
            return MusicTheoryConstants.chromaticScale[noteIndex];
        });
    }
    isInScale(pitch) {
        const pitchClass = pitch % 12;
        const scalePitches = this.generate().map(p => p % 12);
        return scalePitches.includes(pitchClass);
    }
    /**
     * Get the scale degrees as MIDI note numbers
     * Returns the pitches of the scale in the default octave
     */
    getScaleDegrees(octave = 4) {
        return this.generate(octave);
    }
    getClosestScalePitch(pitch) {
        const scalePitches = this.generate(Math.floor(pitch / 12), 8); // Generate enough pitches
        let closest = scalePitches[0];
        let minDistance = Math.abs(pitch - closest);
        for (const scalePitch of scalePitches) {
            const distance = Math.abs(pitch - scalePitch);
            if (distance < minDistance) {
                minDistance = distance;
                closest = scalePitch;
            }
        }
        return closest;
    }
    toJMonSequence(options = {}) {
        const { length = 8, octave = 4, duration = '4n', velocity = 0.8, label = `${this.tonic} ${this.mode} scale` } = options;
        const pitches = this.generate(octave, length);
        const notes = pitches.map((pitch, index) => ({
            note: JMonConverter.midiToNoteName(pitch),
            time: JMonConverter.timeToMusicalTime(index),
            duration,
            velocity
        }));
        return {
            label,
            notes,
            synth: {
                type: 'Synth',
                options: {
                    oscillator: { type: 'sine' },
                    envelope: { attack: 0.02, decay: 0.1, sustain: 0.3, release: 0.5 }
                }
            }
        };
    }
    /**
     * Create Observable Plot visualization of scale pitches
     */
    plotScale(octave = 4, length = 8, options) {
        const { PlotRenderer } = require('../../visualization/plots/PlotRenderer.js');
        const pitches = this.generate(octave, length);
        const noteNames = this.getNoteNames();
        const data = {
            x: pitches.map((_, i) => noteNames[i % noteNames.length] || `${i + 1}`),
            y: pitches,
            color: pitches.map(() => 'steelblue')
        };
        return PlotRenderer.bar(data, {
            title: `${this.tonic} ${this.mode} Scale`,
            width: 600,
            height: 300,
            showAxis: true,
            ...options
        });
    }
    /**
     * Create Observable Plot radar chart of scale intervals
     */
    plotIntervals(options) {
        const { PlotRenderer } = require('../../visualization/plots/PlotRenderer.js');
        const intervals = MusicTheoryConstants.scaleIntervals[this.mode];
        const noteNames = this.getNoteNames();
        const data = {
            x: intervals.map((_, i) => i * (360 / intervals.length)), // Convert to angles
            y: intervals.map(() => 1), // All points at same radius
            color: noteNames.map(() => 'steelblue')
        };
        return PlotRenderer.radar(data, {
            title: `${this.tonic} ${this.mode} Scale Intervals`,
            width: 400,
            height: 400,
            ...options
        });
    }
}
