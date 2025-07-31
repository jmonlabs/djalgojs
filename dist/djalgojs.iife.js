var dj = (function (exports, Plotly) {
    'use strict';

    function _interopNamespaceDefault(e) {
        var n = Object.create(null);
        if (e) {
            Object.keys(e).forEach(function (k) {
                if (k !== 'default') {
                    var d = Object.getOwnPropertyDescriptor(e, k);
                    Object.defineProperty(n, k, d.get ? d : {
                        enumerable: true,
                        get: function () { return e[k]; }
                    });
                }
            });
        }
        n.default = e;
        return Object.freeze(n);
    }

    var Plotly__namespace = /*#__PURE__*/_interopNamespaceDefault(Plotly);

    class MusicTheoryConstants {
        static convertFlatToSharp(note) {
            const flatToSharp = {
                'Db': 'C#',
                'Eb': 'D#',
                'Gb': 'F#',
                'Ab': 'G#',
                'Bb': 'A#',
            };
            return flatToSharp[note] || note;
        }
        static scaleToTriad(mode) {
            const intervals = this.scaleIntervals[mode];
            return [intervals[0], intervals[2], intervals[4]]; // 1st, 3rd, 5th degrees
        }
        static getChromaticIndex(note) {
            return this.chromaticScale.indexOf(note);
        }
        static getNoteFromIndex(index) {
            const normalizedIndex = ((index % 12) + 12) % 12;
            return this.chromaticScale[normalizedIndex];
        }
        static transposeNote(note, semitones) {
            const currentIndex = this.getChromaticIndex(note);
            const newIndex = currentIndex + semitones;
            return this.getNoteFromIndex(newIndex);
        }
        static getInterval(note1, note2) {
            const index1 = this.getChromaticIndex(note1);
            const index2 = this.getChromaticIndex(note2);
            return ((index2 - index1) + 12) % 12;
        }
    }
    MusicTheoryConstants.chromaticScale = [
        'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'
    ];
    MusicTheoryConstants.intervals = {
        unison: 0,
        minor2nd: 1,
        major2nd: 2,
        minor3rd: 3,
        major3rd: 4,
        perfect4th: 5,
        tritone: 6,
        perfect5th: 7,
        minor6th: 8,
        major6th: 9,
        minor7th: 10,
        major7th: 11,
        octave: 12,
    };
    MusicTheoryConstants.scaleIntervals = {
        major: [0, 2, 4, 5, 7, 9, 11],
        minor: [0, 2, 3, 5, 7, 8, 10],
        dorian: [0, 2, 3, 5, 7, 9, 10],
        phrygian: [0, 1, 3, 5, 7, 8, 10],
        lydian: [0, 2, 4, 6, 7, 9, 11],
        mixolydian: [0, 2, 4, 5, 7, 9, 10],
        locrian: [0, 1, 3, 5, 6, 8, 10],
    };

    class JMonConverter {
        /**
         * Convert a numeric time (in beats) to JMON bars:beats:ticks format
         * Assumes 4/4 time signature and 480 ticks per beat
         */
        static timeToMusicalTime(time, timeSignature = [4, 4]) {
            const [beatsPerBar] = timeSignature;
            const ticksPerBeat = 480; // Standard MIDI resolution
            const bars = Math.floor(time / beatsPerBar);
            const beats = Math.floor(time % beatsPerBar);
            const ticks = Math.round((time % 1) * ticksPerBeat);
            return `${bars}:${beats}:${ticks}`;
        }
        /**
         * Convert a duration in beats to note value format
         */
        static durationToNoteValue(duration) {
            // Common duration mappings (assuming 4/4 time)
            const durationsMap = {
                4: '1n', // whole note
                3: '2n.', // dotted half
                2: '2n', // half note
                1.5: '4n.', // dotted quarter
                1: '4n', // quarter note
                0.75: '8n.', // dotted eighth
                0.5: '8n', // eighth note
                0.25: '16n', // sixteenth note
                0.125: '32n', // thirty-second note
            };
            // Find closest match
            const closest = Object.keys(durationsMap)
                .map(Number)
                .reduce((prev, curr) => Math.abs(curr - duration) < Math.abs(prev - duration) ? curr : prev);
            return durationsMap[closest] || `${duration}n`;
        }
        /**
         * Convert a simple Note to JMonNote
         */
        static noteToJMonNote(note, timeSignature = [4, 4]) {
            return {
                note: note.pitch,
                time: note.time !== undefined ? this.timeToMusicalTime(note.time, timeSignature) : '0:0:0',
                duration: this.durationToNoteValue(note.duration),
                velocity: note.velocity || 0.8,
            };
        }
        /**
         * Convert a Sequence to JMonSequence
         */
        static sequenceToJMonSequence(sequence, label = 'Generated Sequence', timeSignature = [4, 4]) {
            return {
                label,
                notes: sequence.notes.map(note => this.noteToJMonNote(note, timeSignature)),
                synth: {
                    type: 'Synth',
                    options: {
                        oscillator: { type: 'triangle' },
                        envelope: { attack: 0.02, decay: 0.1, sustain: 0.3, release: 1 }
                    }
                }
            };
        }
        /**
         * Convert a RhythmPattern to JMonSequence
         */
        static rhythmPatternToJMonSequence(pattern, pitches = [60], // Default to middle C
        label = 'Rhythm Pattern') {
            const notes = [];
            let currentTime = 0;
            pattern.durations.forEach((duration, index) => {
                const pitch = pitches[index % pitches.length] || 60;
                const isAccented = pattern.accents?.[index] || false;
                if (duration > 0) { // Only add notes for non-zero durations
                    notes.push({
                        note: pitch,
                        time: this.timeToMusicalTime(currentTime),
                        duration: this.durationToNoteValue(duration),
                        velocity: isAccented ? 0.9 : 0.7,
                    });
                }
                currentTime += duration;
            });
            return {
                label,
                notes,
                synth: {
                    type: 'Synth',
                    options: {
                        oscillator: { type: 'sawtooth' },
                        envelope: { attack: 0.01, decay: 0.1, sustain: 0.5, release: 0.3 }
                    }
                }
            };
        }
        /**
         * Create a basic JMON composition from sequences
         */
        static createBasicComposition(sequences, bpm = 120, metadata) {
            return {
                format: 'jmonTone',
                version: '1.0',
                bpm,
                audioGraph: [
                    {
                        id: 'master',
                        type: 'Destination',
                        options: {}
                    }
                ],
                connections: [], // Direct to master for now
                sequences,
                ...(metadata && { metadata })
            };
        }
        /**
         * Create a complete JMON composition with effects
         */
        static createComposition(sequences, options = {}) {
            const { bpm = 120, keySignature = 'C', timeSignature = '4/4', effects = [], metadata } = options;
            const audioGraph = [
                {
                    id: 'master',
                    type: 'Destination',
                    options: {}
                }
            ];
            const connections = [];
            // Add global effects
            effects.forEach((effect, index) => {
                const effectId = `effect${index}`;
                audioGraph.push({
                    id: effectId,
                    type: effect.type,
                    options: effect.options
                });
                connections.push([effectId, 'master']);
            });
            return {
                format: 'jmonTone',
                version: '1.0',
                bpm,
                keySignature,
                timeSignature,
                audioGraph,
                connections,
                sequences,
                ...(metadata && { metadata })
            };
        }
        /**
         * Convert MIDI note number to note name
         */
        static midiToNoteName(midiNote) {
            const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
            const octave = Math.floor(midiNote / 12) - 1;
            const noteIndex = midiNote % 12;
            return `${notes[noteIndex]}${octave}`;
        }
        /**
         * Convert note name to MIDI note number
         */
        static noteNameToMidi(noteName) {
            const noteRegex = /^([A-G])(#|b)?(-?\d+)$/;
            const match = noteName.match(noteRegex);
            if (!match) {
                throw new Error(`Invalid note name: ${noteName}`);
            }
            const [, note, accidental, octaveStr] = match;
            if (!note || !octaveStr) {
                throw new Error(`Invalid note name: ${noteName}`);
            }
            const octave = parseInt(octaveStr, 10);
            const noteValues = {
                'C': 0, 'D': 2, 'E': 4, 'F': 5, 'G': 7, 'A': 9, 'B': 11
            };
            let midiNote = noteValues[note] + (octave + 1) * 12;
            if (accidental === '#') {
                midiNote += 1;
            }
            else if (accidental === 'b') {
                midiNote -= 1;
            }
            return midiNote;
        }
        /**
         * Convert a musical time string back to numeric time
         */
        static musicalTimeToTime(musicalTime, timeSignature = [4, 4]) {
            const [beatsPerBar] = timeSignature;
            const ticksPerBeat = 480;
            const parts = musicalTime.split(':');
            if (parts.length !== 3) {
                throw new Error(`Invalid musical time format: ${musicalTime}`);
            }
            const bars = parseInt(parts[0], 10);
            const beats = parseFloat(parts[1]);
            const ticks = parseInt(parts[2], 10);
            return bars * beatsPerBar + beats + (ticks / ticksPerBeat);
        }
        /**
         * Validate JMON composition
         */
        static validateComposition(composition) {
            const errors = [];
            if (composition.format !== 'jmonTone') {
                errors.push('Format must be "jmonTone"');
            }
            if (composition.bpm < 20 || composition.bpm > 400) {
                errors.push('BPM must be between 20 and 400');
            }
            if (!composition.sequences || composition.sequences.length === 0) {
                errors.push('At least one sequence is required');
            }
            composition.sequences.forEach((seq, index) => {
                if (!seq.label) {
                    errors.push(`Sequence ${index} missing label`);
                }
                if (!seq.notes || seq.notes.length === 0) {
                    errors.push(`Sequence ${index} has no notes`);
                }
            });
            return {
                valid: errors.length === 0,
                errors
            };
        }
    }

    class Scale {
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

    // import { MusicTheoryConstants } from './MusicTheoryConstants.js';
    class Progression {
        constructor(tonic, mode = 'major') {
            this.scale = new Scale(tonic, mode);
        }
        generate(options = {}) {
            const { length = 4, voicing = 'triad' } = options;
            // Common chord progressions by mode
            const progressionPatterns = {
                major: [[1, 4, 5, 1], [1, 6, 4, 5], [1, 5, 6, 4], [2, 5, 1, 1]],
                minor: [[1, 4, 5, 1], [1, 6, 4, 5], [1, 7, 6, 7], [1, 3, 7, 1]],
                dorian: [[1, 4, 1, 4], [1, 7, 4, 1], [1, 2, 7, 1]],
                phrygian: [[1, 2, 1, 2], [1, 7, 6, 1]],
                lydian: [[1, 2, 1, 2], [1, 5, 4, 1]],
                mixolydian: [[1, 7, 4, 1], [1, 4, 7, 1]],
                locrian: [[1, 2, 1, 2]],
            };
            const patterns = progressionPatterns[this.scale.mode];
            const selectedPattern = patterns[Math.floor(Math.random() * patterns.length)];
            // Adjust pattern length to match requested length
            const chords = [];
            for (let i = 0; i < length; i++) {
                const degree = selectedPattern[i % selectedPattern.length];
                const chord = this.generateChord(degree, voicing);
                chords.push(chord);
            }
            return {
                chords,
                key: this.scale.tonic,
                mode: this.scale.mode,
            };
        }
        generateChord(degree, voicing = 'triad') {
            const scaleNotes = this.scale.getNoteNames();
            const rootNote = scaleNotes[(degree - 1) % scaleNotes.length];
            // Determine chord quality based on scale degree and mode
            const chordQuality = this.getChordQuality(degree);
            let chordSymbol = rootNote;
            switch (voicing) {
                case 'triad':
                    chordSymbol += chordQuality;
                    break;
                case 'seventh':
                    chordSymbol += chordQuality;
                    chordSymbol += this.getSeventhQuality(degree);
                    break;
                case 'extended':
                    chordSymbol += chordQuality;
                    chordSymbol += this.getSeventhQuality(degree);
                    if (Math.random() > 0.5) {
                        chordSymbol += this.getExtension();
                    }
                    break;
            }
            return chordSymbol;
        }
        computeCircle(steps = 8) {
            // Circle of fifths progression
            const chords = [];
            let currentDegree = 1;
            for (let i = 0; i < steps; i++) {
                const chord = this.generateChord(currentDegree, 'triad');
                chords.push(chord);
                // Move by fifth (4 scale degrees up)
                currentDegree = ((currentDegree + 3) % 7) + 1;
            }
            return {
                chords,
                key: this.scale.tonic,
                mode: this.scale.mode,
            };
        }
        getChordPitches(degree, octave = 4, voicing = 'triad') {
            const intervals = voicing === 'triad' ? [0, 2, 4] : [0, 2, 4, 6];
            return intervals.map(interval => {
                const scaleDegree = ((degree - 1 + interval) % 7) + 1;
                return this.scale.getDegree(scaleDegree, octave);
            });
        }
        getChordQuality(degree) {
            const qualityMap = {
                major: { 1: '', 2: 'm', 3: 'm', 4: '', 5: '', 6: 'm', 7: 'dim' },
                minor: { 1: 'm', 2: 'dim', 3: '', 4: 'm', 5: 'm', 6: '', 7: '' },
                dorian: { 1: 'm', 2: 'm', 3: '', 4: '', 5: 'm', 6: 'dim', 7: '' },
                phrygian: { 1: 'm', 2: '', 3: '', 4: 'm', 5: 'dim', 6: '', 7: 'm' },
                lydian: { 1: '', 2: '', 3: 'm', 4: 'dim', 5: '', 6: 'm', 7: 'm' },
                mixolydian: { 1: '', 2: 'm', 3: 'dim', 4: '', 5: 'm', 6: 'm', 7: '' },
                locrian: { 1: 'dim', 2: '', 3: 'm', 4: 'm', 5: '', 6: '', 7: 'm' },
            };
            return qualityMap[this.scale.mode]?.[degree] || '';
        }
        getSeventhQuality(degree) {
            // Simplified seventh quality logic
            const quality = this.getChordQuality(degree);
            if (quality === 'm')
                return '7';
            if (quality === 'dim')
                return 'ø7';
            if (degree === 5 || degree === 7)
                return '7';
            return 'maj7';
        }
        getExtension() {
            const extensions = ['add9', 'sus2', 'sus4', '6'];
            return extensions[Math.floor(Math.random() * extensions.length)];
        }
        toJMonSequence(options = {}) {
            const { length = 4, octave = 4, duration = '1n', velocity = 0.8, label = `${this.scale.tonic} ${this.scale.mode} progression`, voicing = 'triad', strumPattern = false } = options;
            const progression = this.generate({ length, voicing });
            const notes = [];
            progression.chords.forEach((_, chordIndex) => {
                const chordDegree = ((chordIndex % 7) + 1);
                const chordPitches = this.getChordPitches(chordDegree, octave, voicing);
                if (strumPattern) {
                    // Arpeggiate the chord
                    chordPitches.forEach((pitch, noteIndex) => {
                        notes.push({
                            note: JMonConverter.midiToNoteName(pitch),
                            time: JMonConverter.timeToMusicalTime(chordIndex + noteIndex * 0.1),
                            duration: '8n',
                            velocity: velocity * (noteIndex === 0 ? 1 : 0.8)
                        });
                    });
                }
                else {
                    // Play chord as block
                    notes.push({
                        note: chordPitches.map(pitch => JMonConverter.midiToNoteName(pitch)),
                        time: JMonConverter.timeToMusicalTime(chordIndex),
                        duration,
                        velocity
                    });
                }
            });
            return {
                label,
                notes,
                synth: {
                    type: 'PolySynth',
                    options: {
                        oscillator: { type: 'sawtooth' },
                        envelope: { attack: 0.02, decay: 0.1, sustain: 0.5, release: 1.0 }
                    }
                }
            };
        }
    }

    /**
     * Voice leading and harmonization system
     * Based on the Python djalgo harmony module (Voice class)
     */
    class Voice {
        constructor(scale, options = {}) {
            this.scale = scale;
            this.options = {
                voiceCount: options.voiceCount || 4,
                voiceRange: options.voiceRange || [48, 84], // C3 to C6
                intervalLimits: options.intervalLimits || [3, 12], // Minor 3rd to octave
                doubling: options.doubling || true,
                inversion: options.inversion || 0
            };
        }
        /**
         * Harmonize a melody with chords
         */
        harmonizeMelody(melody, chordProgression) {
            const harmonizedChords = [];
            for (let i = 0; i < melody.length; i++) {
                const melodyNote = melody[i];
                const chordRoot = chordProgression ? chordProgression[i % chordProgression.length] : this.findBestChordRoot(melodyNote);
                const chord = this.buildChord(chordRoot, melodyNote);
                harmonizedChords.push(chord);
            }
            return harmonizedChords;
        }
        /**
         * Find the best chord root for a given melody note
         */
        findBestChordRoot(melodyNote) {
            const scaleDegrees = this.scale.getScaleDegrees();
            const melodyPitchClass = ((melodyNote % 12) + 12) % 12;
            // Find scale degrees that contain the melody note
            const possibleRoots = [];
            for (let i = 0; i < scaleDegrees.length; i++) {
                const triad = this.getTriadForDegree(i);
                if (triad.some(note => ((note % 12) + 12) % 12 === melodyPitchClass)) {
                    possibleRoots.push(scaleDegrees[i]);
                }
            }
            // Return the first valid root, or default to tonic
            return possibleRoots.length > 0 ? possibleRoots[0] : scaleDegrees[0];
        }
        /**
         * Get triad for a scale degree
         */
        getTriadForDegree(degree) {
            const scaleDegrees = this.scale.getScaleDegrees();
            const root = scaleDegrees[degree % scaleDegrees.length];
            const third = scaleDegrees[(degree + 2) % scaleDegrees.length];
            const fifth = scaleDegrees[(degree + 4) % scaleDegrees.length];
            return [root, third, fifth];
        }
        /**
         * Build a chord with proper voicing
         */
        buildChord(root, melodyNote) {
            const triad = this.getTriadFromRoot(root);
            const chordTones = this.distributeVoices(triad, melodyNote);
            return {
                notes: chordTones,
                root: root,
                quality: this.determineChordQuality(triad),
                inversion: this.options.inversion
            };
        }
        /**
         * Get triad notes from a root
         */
        getTriadFromRoot(root) {
            const scaleDegrees = this.scale.getScaleDegrees();
            const rootIndex = scaleDegrees.indexOf(root % 12);
            if (rootIndex === -1)
                return [root, root + 4, root + 7]; // Default major triad
            return this.getTriadForDegree(rootIndex);
        }
        /**
         * Distribute chord tones across voices
         */
        distributeVoices(triad, melodyNote) {
            const voices = [];
            const [root, third, fifth] = triad;
            const melodyOctave = Math.floor(melodyNote / 12);
            // Ensure melody note is the highest voice
            voices.push(melodyNote);
            // Add lower voices
            for (let i = 1; i < this.options.voiceCount; i++) {
                const targetOctave = melodyOctave - Math.ceil(i / triad.length);
                let chordTone;
                switch (i % 3) {
                    case 1:
                        chordTone = targetOctave * 12 + fifth;
                        break;
                    case 2:
                        chordTone = targetOctave * 12 + third;
                        break;
                    default:
                        chordTone = targetOctave * 12 + root;
                }
                // Ensure voice is within range
                chordTone = this.constrainToRange(chordTone);
                voices.unshift(chordTone); // Add to beginning (lower voices first)
            }
            return this.applyVoiceLeadingRules(voices);
        }
        /**
         * Constrain note to voice range
         */
        constrainToRange(note) {
            const [minNote, maxNote] = this.options.voiceRange;
            while (note < minNote)
                note += 12;
            while (note > maxNote)
                note -= 12;
            return note;
        }
        /**
         * Apply voice leading rules
         */
        applyVoiceLeadingRules(voices) {
            const improvedVoices = [...voices];
            // Check and fix voice crossing
            for (let i = 1; i < improvedVoices.length; i++) {
                if (improvedVoices[i] <= improvedVoices[i - 1]) {
                    // Voice crossing detected, adjust upper voice
                    improvedVoices[i] = improvedVoices[i - 1] + this.options.intervalLimits[0];
                }
            }
            // Check interval limits
            for (let i = 1; i < improvedVoices.length; i++) {
                const interval = improvedVoices[i] - improvedVoices[i - 1];
                const [minInterval, maxInterval] = this.options.intervalLimits;
                if (interval < minInterval) {
                    improvedVoices[i] = improvedVoices[i - 1] + minInterval;
                }
                else if (interval > maxInterval) {
                    improvedVoices[i] = improvedVoices[i - 1] + maxInterval;
                }
            }
            return improvedVoices;
        }
        /**
         * Determine chord quality from triad
         */
        determineChordQuality(triad) {
            if (triad.length < 3)
                return 'unknown';
            const [root, third, fifth] = triad.map(note => note % 12);
            const thirdInterval = ((third - root + 12) % 12);
            const fifthInterval = ((fifth - root + 12) % 12);
            if (thirdInterval === 4 && fifthInterval === 7)
                return 'major';
            if (thirdInterval === 3 && fifthInterval === 7)
                return 'minor';
            if (thirdInterval === 4 && fifthInterval === 6)
                return 'augmented';
            if (thirdInterval === 3 && fifthInterval === 6)
                return 'diminished';
            return 'unknown';
        }
        /**
         * Create smooth voice leading between two chords
         */
        smoothVoiceLeading(fromChord, toChord) {
            const improvedToChord = { ...toChord };
            const fromNotes = fromChord.notes;
            const toNotes = [...toChord.notes];
            // Find the best voice leading by minimizing total voice movement
            const bestVoicing = this.findMinimalMovement(fromNotes, toNotes);
            improvedToChord.notes = bestVoicing;
            return improvedToChord;
        }
        /**
         * Find voicing with minimal voice movement
         */
        findMinimalMovement(fromNotes, toNotes) {
            const result = new Array(fromNotes.length);
            const usedIndices = new Set();
            // For each voice in the from chord, find the closest note in the to chord
            for (let fromIndex = 0; fromIndex < fromNotes.length; fromIndex++) {
                let minDistance = Infinity;
                let bestToIndex = 0;
                for (let toIndex = 0; toIndex < toNotes.length; toIndex++) {
                    if (usedIndices.has(toIndex))
                        continue;
                    const distance = Math.abs(fromNotes[fromIndex] - toNotes[toIndex]);
                    if (distance < minDistance) {
                        minDistance = distance;
                        bestToIndex = toIndex;
                    }
                }
                result[fromIndex] = toNotes[bestToIndex];
                usedIndices.add(bestToIndex);
            }
            return result;
        }
        /**
         * Add seventh to a chord
         */
        addSeventh(chord) {
            const scaleDegrees = this.scale.getScaleDegrees();
            const rootIndex = scaleDegrees.indexOf(chord.root % 12);
            if (rootIndex !== -1) {
                const seventh = scaleDegrees[(rootIndex + 6) % scaleDegrees.length];
                const seventhNote = Math.floor(chord.root / 12) * 12 + seventh;
                return {
                    ...chord,
                    notes: [...chord.notes, seventhNote],
                    quality: chord.quality + '7'
                };
            }
            return chord;
        }
        /**
         * Create chord inversions
         */
        invert(chord, inversion) {
            const notes = [...chord.notes].sort((a, b) => a - b);
            const inversionCount = inversion % notes.length;
            for (let i = 0; i < inversionCount; i++) {
                const lowestNote = notes.shift();
                notes.push(lowestNote + 12);
            }
            return {
                ...chord,
                notes: notes,
                inversion: inversionCount
            };
        }
        /**
         * Generate four-part harmony for a melody
         */
        fourPartHarmony(melody) {
            const oldVoiceCount = this.options.voiceCount;
            this.options.voiceCount = 4;
            const harmony = this.harmonizeMelody(melody);
            // Apply smooth voice leading
            for (let i = 1; i < harmony.length; i++) {
                harmony[i] = this.smoothVoiceLeading(harmony[i - 1], harmony[i]);
            }
            this.options.voiceCount = oldVoiceCount;
            return harmony;
        }
    }

    /**
     * Musical ornamentation system
     * Based on the Python djalgo harmony module (Ornament class)
     */
    class Ornament {
        constructor(options = {}) {
            this.options = {
                density: options.density || 0.3,
                maxInterval: options.maxInterval || 7,
                rhythmicVariation: options.rhythmicVariation || true,
                graceNoteDuration: options.graceNoteDuration || 0.125
            };
        }
        /**
         * Apply ornamentation to a melody
         */
        ornament(melody, durations) {
            const ornamentedMelody = [];
            for (let i = 0; i < melody.length; i++) {
                const note = melody[i];
                const duration = durations?.[i] || 1;
                if (Math.random() < this.options.density) {
                    const ornamentType = this.selectOrnamentType(note, melody[i + 1], i === melody.length - 1);
                    const ornamented = this.applyOrnament(note, melody[i + 1], ornamentType, duration);
                    ornamentedMelody.push(ornamented);
                }
                else {
                    // No ornamentation
                    ornamentedMelody.push({
                        originalNote: note,
                        ornamentedSequence: [note],
                        durations: [duration],
                        type: 'none'
                    });
                }
            }
            return ornamentedMelody;
        }
        /**
         * Select appropriate ornament type based on context
         */
        selectOrnamentType(currentNote, nextNote, isLast = false) {
            const ornamentTypes = ['grace', 'trill', 'mordent', 'turn'];
            // Filter based on context
            const availableTypes = ornamentTypes.filter(type => {
                switch (type) {
                    case 'grace':
                        return !isLast && nextNote !== undefined;
                    case 'trill':
                    case 'mordent':
                    case 'turn':
                        return true;
                    default:
                        return false;
                }
            });
            return availableTypes[Math.floor(Math.random() * availableTypes.length)];
        }
        /**
         * Apply specific ornament to a note
         */
        applyOrnament(note, nextNote, type, duration) {
            switch (type) {
                case 'grace':
                    return this.addGraceNote(note, nextNote, duration);
                case 'trill':
                    return this.addTrill(note, duration);
                case 'mordent':
                    return this.addMordent(note, duration);
                case 'turn':
                    return this.addTurn(note, duration);
                case 'arpeggio':
                    return this.addArpeggio(note, duration);
                case 'slide':
                    return this.addSlide(note, nextNote, duration);
                default:
                    return {
                        originalNote: note,
                        ornamentedSequence: [note],
                        durations: [duration],
                        type: 'none'
                    };
            }
        }
        /**
         * Add grace note ornamentation
         */
        addGraceNote(note, nextNote, duration) {
            if (nextNote === undefined) {
                return {
                    originalNote: note,
                    ornamentedSequence: [note],
                    durations: [duration],
                    type: 'none'
                };
            }
            const graceNote = this.getAuxiliaryNote(note, nextNote);
            const graceDuration = this.options.graceNoteDuration;
            const mainDuration = duration - graceDuration;
            return {
                originalNote: note,
                ornamentedSequence: [graceNote, note],
                durations: [graceDuration, Math.max(0.125, mainDuration)],
                type: 'grace'
            };
        }
        /**
         * Add trill ornamentation
         */
        addTrill(note, duration) {
            const upperNote = note + this.getTrillInterval();
            const trillDuration = duration / 8; // 8 alternations
            const sequence = [];
            const durations = [];
            for (let i = 0; i < 8; i++) {
                sequence.push(i % 2 === 0 ? note : upperNote);
                durations.push(trillDuration);
            }
            return {
                originalNote: note,
                ornamentedSequence: sequence,
                durations: durations,
                type: 'trill'
            };
        }
        /**
         * Add mordent ornamentation (quick alternation)
         */
        addMordent(note, duration) {
            const auxiliary = note + (Math.random() < 0.5 ? 1 : -1); // Upper or lower mordent
            const ornamentDuration = Math.min(duration / 4, this.options.graceNoteDuration);
            const mainDuration = duration - ornamentDuration * 2;
            return {
                originalNote: note,
                ornamentedSequence: [note, auxiliary, note],
                durations: [ornamentDuration, ornamentDuration, Math.max(0.125, mainDuration)],
                type: 'mordent'
            };
        }
        /**
         * Add turn ornamentation (four-note figure)
         */
        addTurn(note, duration) {
            const upper = note + 1;
            const lower = note - 1;
            const noteDuration = duration / 4;
            return {
                originalNote: note,
                ornamentedSequence: [upper, note, lower, note],
                durations: [noteDuration, noteDuration, noteDuration, noteDuration],
                type: 'turn'
            };
        }
        /**
         * Add arpeggio ornamentation (broken chord)
         */
        addArpeggio(note, duration) {
            const chord = this.buildArpeggioChord(note);
            const noteDuration = duration / chord.length;
            const durations = Array(chord.length).fill(noteDuration);
            return {
                originalNote: note,
                ornamentedSequence: chord,
                durations: durations,
                type: 'arpeggio'
            };
        }
        /**
         * Add slide ornamentation (glissando effect)
         */
        addSlide(note, nextNote, duration) {
            if (nextNote === undefined || Math.abs(nextNote - note) <= 1) {
                return {
                    originalNote: note,
                    ornamentedSequence: [note],
                    durations: [duration],
                    type: 'none'
                };
            }
            const steps = Math.min(Math.abs(nextNote - note), 5); // Limit slide length
            const sequence = [];
            const stepDuration = duration / (steps + 1);
            const durations = [];
            const direction = nextNote > note ? 1 : -1;
            for (let i = 0; i <= steps; i++) {
                sequence.push(note + i * direction);
                durations.push(stepDuration);
            }
            return {
                originalNote: note,
                ornamentedSequence: sequence,
                durations: durations,
                type: 'slide'
            };
        }
        /**
         * Get auxiliary note for grace notes
         */
        getAuxiliaryNote(note, nextNote) {
            const interval = nextNote - note;
            if (Math.abs(interval) <= 2) {
                // Small interval - use step in opposite direction
                return note + (interval > 0 ? -1 : 1);
            }
            else {
                // Large interval - use step towards target
                return note + (interval > 0 ? 1 : -1);
            }
        }
        /**
         * Get trill interval (usually whole or half step)
         */
        getTrillInterval() {
            return Math.random() < 0.7 ? 1 : 2; // 70% half step, 30% whole step
        }
        /**
         * Build arpeggio chord from root note
         */
        buildArpeggioChord(root) {
            // Simple triad arpeggio
            const chord = [root, root + 4, root + 7, root + 12]; // Root, third, fifth, octave
            // Randomize direction
            if (Math.random() < 0.5) {
                return chord.reverse();
            }
            return chord;
        }
        /**
         * Apply rhythmic ornamentation (syncopation, etc.)
         */
        rhythmicOrnamentation(durations) {
            if (!this.options.rhythmicVariation)
                return durations;
            const ornamentedDurations = [...durations];
            for (let i = 0; i < ornamentedDurations.length - 1; i++) {
                if (Math.random() < this.options.density / 2) {
                    // Create syncopation by borrowing time from next note
                    const borrowAmount = Math.min(ornamentedDurations[i + 1] * 0.25, 0.25);
                    ornamentedDurations[i] += borrowAmount;
                    ornamentedDurations[i + 1] -= borrowAmount;
                }
            }
            return ornamentedDurations;
        }
        /**
         * Create compound ornamentation (multiple ornaments)
         */
        compoundOrnamentation(melody, durations) {
            let ornamentedMelody = this.ornament(melody, durations);
            // Apply second layer of ornamentation to some notes
            for (let i = 0; i < ornamentedMelody.length; i++) {
                if (Math.random() < this.options.density / 3 && ornamentedMelody[i].type === 'none') {
                    const secondOrnamentation = this.applyOrnament(ornamentedMelody[i].originalNote, melody[i + 1], 'grace', ornamentedMelody[i].durations[0]);
                    ornamentedMelody[i] = secondOrnamentation;
                }
            }
            return ornamentedMelody;
        }
        /**
         * Get ornamentation statistics
         */
        getStatistics(ornamentedMelody) {
            const stats = {
                totalNotes: ornamentedMelody.length,
                ornamentedNotes: 0,
                ornamentationRate: 0,
                ornamentTypes: {}
            };
            for (const note of ornamentedMelody) {
                if (note.type !== 'none') {
                    stats.ornamentedNotes++;
                }
                stats.ornamentTypes[note.type] = (stats.ornamentTypes[note.type] || 0) + 1;
            }
            stats.ornamentationRate = stats.ornamentedNotes / stats.totalNotes;
            return stats;
        }
    }

    class Rhythm {
        constructor(measureLength = 4.0, durations = []) {
            this.measureLength = measureLength;
            this.durations = durations.length > 0 ? [...durations] : this.generateBasicPattern();
        }
        random(options = {}) {
            const { measureLength = this.measureLength, complexity = 0.5 } = options;
            const possibleDurations = [0.25, 0.5, 1.0, 1.5, 2.0];
            const durations = [];
            let currentLength = 0;
            while (currentLength < measureLength) {
                const remaining = measureLength - currentLength;
                const validDurations = possibleDurations.filter(d => d <= remaining);
                if (validDurations.length === 0) {
                    // Fill remaining with rest
                    if (remaining > 0) {
                        durations.push(remaining);
                    }
                    break;
                }
                // Choose duration based on complexity
                let chosenDuration;
                if (Math.random() < complexity) {
                    // More complex rhythms favor shorter durations
                    chosenDuration = validDurations[0];
                }
                else {
                    // Simpler rhythms favor longer durations
                    chosenDuration = validDurations[validDurations.length - 1];
                }
                durations.push(chosenDuration);
                currentLength += chosenDuration;
            }
            return {
                durations,
                measureLength,
                accents: this.generateAccents(durations),
            };
        }
        static beatcycle(cycles, measures = 4) {
            const patterns = [];
            for (let m = 0; m < measures; m++) {
                const durations = [];
                let totalLength = 0;
                for (const cycle of cycles) {
                    const beatLength = 4.0 / cycle; // Assuming 4/4 time
                    for (let i = 0; i < cycle; i++) {
                        durations.push(beatLength);
                        totalLength += beatLength;
                    }
                    if (totalLength >= 4.0)
                        break; // Don't exceed measure length
                }
                patterns.push({
                    durations,
                    measureLength: 4.0,
                    accents: durations.map((_, i) => i % cycles[0] === 0),
                });
            }
            return patterns;
        }
        static isorhythm(talea, color, repetitions = 4) {
            const durations = [];
            let colorIndex = 0;
            for (let rep = 0; rep < repetitions; rep++) {
                for (const duration of talea) {
                    durations.push(duration);
                    colorIndex = (colorIndex + 1) % color.length;
                }
            }
            const totalLength = durations.reduce((sum, dur) => sum + dur, 0);
            return {
                durations,
                measureLength: totalLength,
                accents: durations.map((_, i) => color[i % color.length] === 1),
            };
        }
        darwin(options = {}) {
            // Simplified genetic algorithm for rhythm evolution
            const { measureLength = this.measureLength } = options;
            // Start with current rhythm or random
            let bestRhythm = this.durations.length > 0 ?
                { durations: [...this.durations], measureLength, accents: this.generateAccents(this.durations) } :
                this.random(options);
            let bestFitness = this.calculateFitness(bestRhythm);
            // Evolve for several generations
            for (let gen = 0; gen < 10; gen++) {
                // Create variations
                const variations = Array.from({ length: 5 }, () => this.mutateRhythm(bestRhythm));
                for (const variation of variations) {
                    const fitness = this.calculateFitness(variation);
                    if (fitness > bestFitness) {
                        bestRhythm = variation;
                        bestFitness = fitness;
                    }
                }
            }
            return bestRhythm;
        }
        generateBasicPattern() {
            return [1.0, 1.0, 1.0, 1.0]; // Four quarter notes
        }
        generateAccents(durations) {
            return durations.map((_, i) => i === 0 || (i % 4 === 0)); // Accent first beat and strong beats
        }
        calculateFitness(rhythm) {
            let fitness = 0;
            // Prefer rhythms that fill the measure completely
            const totalDuration = rhythm.durations.reduce((sum, dur) => sum + dur, 0);
            if (Math.abs(totalDuration - rhythm.measureLength) < 0.01) {
                fitness += 10;
            }
            // Prefer some variation in duration
            const uniqueDurations = new Set(rhythm.durations).size;
            fitness += uniqueDurations * 2;
            // Prefer reasonable number of notes (not too sparse, not too dense)
            const noteCount = rhythm.durations.length;
            if (noteCount >= 2 && noteCount <= 16) {
                fitness += 5;
            }
            return fitness;
        }
        mutateRhythm(rhythm) {
            const durations = [...rhythm.durations];
            const possibleDurations = [0.25, 0.5, 1.0, 1.5, 2.0];
            // Randomly modify one duration
            if (durations.length > 0) {
                const index = Math.floor(Math.random() * durations.length);
                durations[index] = possibleDurations[Math.floor(Math.random() * possibleDurations.length)];
            }
            // Normalize to fit measure
            const total = durations.reduce((sum, dur) => sum + dur, 0);
            if (total !== rhythm.measureLength && total > 0) {
                const factor = rhythm.measureLength / total;
                for (let i = 0; i < durations.length; i++) {
                    durations[i] *= factor;
                }
            }
            return {
                durations,
                measureLength: rhythm.measureLength,
                accents: this.generateAccents(durations),
            };
        }
    }

    /**
     * Advanced rhythm algorithms matching the Python djalgo implementation
     */
    class AdvancedRhythm {
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
     * Genetic algorithm for rhythm generation
     */
    class GeneticRhythm {
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

    /**
     * Motif bank system for storing and searching musical patterns
     * Based on the Python djalgo MotifBank implementation
     */
    class MotifBank {
        constructor(motifs = []) {
            this.motifs = motifs;
        }
        /**
         * Load motifs from JSON data
         */
        static fromJSON(jsonData) {
            const motifs = jsonData.map(data => ({
                id: data.id || Math.random().toString(36).substr(2, 9),
                name: data.name || 'Untitled',
                artist: data.artist,
                instrument: data.instrument || 'piano',
                scale: data.scale || 'major',
                tags: data.tags || [],
                measures: data.measures || 1,
                notes: data.notes || [],
                metadata: data.metadata
            }));
            return new MotifBank(motifs);
        }
        /**
         * Get total number of motifs
         */
        get length() {
            return this.motifs.length;
        }
        /**
         * Get motif by index
         */
        get(index) {
            return this.motifs[index];
        }
        /**
         * Get motif by ID
         */
        getById(id) {
            return this.motifs.find(motif => motif.id === id);
        }
        /**
         * Get all motifs
         */
        all() {
            return [...this.motifs];
        }
        /**
         * Add a new motif
         */
        add(motif) {
            // Ensure unique ID
            if (this.motifs.some(m => m.id === motif.id)) {
                motif.id = Math.random().toString(36).substr(2, 9);
            }
            this.motifs.push(motif);
        }
        /**
         * Remove motif by ID
         */
        remove(id) {
            const index = this.motifs.findIndex(motif => motif.id === id);
            if (index !== -1) {
                this.motifs.splice(index, 1);
                return true;
            }
            return false;
        }
        /**
         * Update existing motif
         */
        update(id, updates) {
            const motif = this.getById(id);
            if (motif) {
                Object.assign(motif, updates);
                return true;
            }
            return false;
        }
        /**
         * Find motifs by artist
         */
        byArtist(artist) {
            const artistLower = artist.toLowerCase();
            return this.motifs.filter(motif => motif.artist?.toLowerCase() === artistLower);
        }
        /**
         * Find motifs by instrument
         */
        byInstrument(instrument) {
            const instrumentLower = instrument.toLowerCase();
            return this.motifs.filter(motif => motif.instrument.toLowerCase().includes(instrumentLower));
        }
        /**
         * Find motifs by scale
         */
        byScale(scale) {
            const scaleLower = scale.toLowerCase();
            return this.motifs.filter(motif => motif.scale.toLowerCase() === scaleLower);
        }
        /**
         * Find motifs by tag
         */
        byTag(tag) {
            const tagLower = tag.toLowerCase();
            return this.motifs.filter(motif => motif.tags.some(t => t.toLowerCase().includes(tagLower)));
        }
        /**
         * Find motifs by measure range
         */
        byMeasureRange(minMeasures, maxMeasures) {
            return this.motifs.filter(motif => {
                if (minMeasures !== undefined && motif.measures < minMeasures) {
                    return false;
                }
                if (maxMeasures !== undefined && motif.measures > maxMeasures) {
                    return false;
                }
                return true;
            });
        }
        /**
         * Comprehensive search with multiple criteria
         */
        search(options) {
            let results = [...this.motifs];
            if (options.artist) {
                const artistLower = options.artist.toLowerCase();
                results = results.filter(motif => motif.artist?.toLowerCase() === artistLower);
            }
            if (options.instrument) {
                const instrumentLower = options.instrument.toLowerCase();
                results = results.filter(motif => motif.instrument.toLowerCase().includes(instrumentLower));
            }
            if (options.scale) {
                const scaleLower = options.scale.toLowerCase();
                results = results.filter(motif => motif.scale.toLowerCase() === scaleLower);
            }
            if (options.tag) {
                const tagLower = options.tag.toLowerCase();
                results = results.filter(motif => motif.tags.some(t => t.toLowerCase().includes(tagLower)));
            }
            if (options.minMeasures !== undefined) {
                results = results.filter(motif => motif.measures >= options.minMeasures);
            }
            if (options.maxMeasures !== undefined) {
                results = results.filter(motif => motif.measures <= options.maxMeasures);
            }
            return results;
        }
        /**
         * Get random motif
         */
        random() {
            if (this.motifs.length === 0)
                return undefined;
            const index = Math.floor(Math.random() * this.motifs.length);
            return this.motifs[index];
        }
        /**
         * Get random motifs matching criteria
         */
        randomSearch(options, count = 1) {
            const candidates = this.search(options);
            if (candidates.length === 0)
                return [];
            const results = [];
            const used = new Set();
            for (let i = 0; i < Math.min(count, candidates.length); i++) {
                let motif;
                do {
                    motif = candidates[Math.floor(Math.random() * candidates.length)];
                } while (used.has(motif.id) && used.size < candidates.length);
                if (!used.has(motif.id)) {
                    results.push(motif);
                    used.add(motif.id);
                }
            }
            return results;
        }
        /**
         * Find similar motifs based on musical characteristics
         */
        findSimilar(targetMotif, threshold = 0.7) {
            return this.motifs.filter(motif => {
                if (motif.id === targetMotif.id)
                    return false;
                let similarity = 0;
                let factors = 0;
                // Scale similarity
                if (motif.scale === targetMotif.scale) {
                    similarity += 0.3;
                }
                factors += 0.3;
                // Instrument similarity
                if (motif.instrument === targetMotif.instrument) {
                    similarity += 0.2;
                }
                factors += 0.2;
                // Measure similarity
                const measureDiff = Math.abs(motif.measures - targetMotif.measures);
                const measureSimilarity = Math.max(0, 1 - measureDiff / Math.max(motif.measures, targetMotif.measures));
                similarity += measureSimilarity * 0.2;
                factors += 0.2;
                // Tag similarity
                const commonTags = motif.tags.filter(tag => targetMotif.tags.includes(tag));
                const tagSimilarity = commonTags.length / Math.max(motif.tags.length, targetMotif.tags.length, 1);
                similarity += tagSimilarity * 0.3;
                factors += 0.3;
                return (similarity / factors) >= threshold;
            });
        }
        /**
         * Group motifs by a specific property
         */
        groupBy(property) {
            const groups = {};
            for (const motif of this.motifs) {
                const key = String(motif[property] || 'unknown');
                if (!groups[key]) {
                    groups[key] = [];
                }
                groups[key].push(motif);
            }
            return groups;
        }
        /**
         * Get statistics about the motif collection
         */
        getStats() {
            const byInstrument = {};
            const byScale = {};
            const byArtist = {};
            const tagCounts = {};
            let totalMeasures = 0;
            for (const motif of this.motifs) {
                // Instrument stats
                byInstrument[motif.instrument] = (byInstrument[motif.instrument] || 0) + 1;
                // Scale stats
                byScale[motif.scale] = (byScale[motif.scale] || 0) + 1;
                // Artist stats
                if (motif.artist) {
                    byArtist[motif.artist] = (byArtist[motif.artist] || 0) + 1;
                }
                // Tag stats
                for (const tag of motif.tags) {
                    tagCounts[tag] = (tagCounts[tag] || 0) + 1;
                }
                totalMeasures += motif.measures;
            }
            const mostCommonTags = Object.entries(tagCounts)
                .map(([tag, count]) => ({ tag, count }))
                .sort((a, b) => b.count - a.count)
                .slice(0, 10);
            return {
                total: this.motifs.length,
                byInstrument,
                byScale,
                byArtist,
                averageMeasures: this.motifs.length > 0 ? totalMeasures / this.motifs.length : 0,
                mostCommonTags
            };
        }
        /**
         * Export motifs to JSON
         */
        toJSON() {
            return this.motifs.map(motif => ({ ...motif }));
        }
        /**
         * Clear all motifs
         */
        clear() {
            this.motifs = [];
        }
        /**
         * Clone the motif bank
         */
        clone() {
            const clonedMotifs = this.motifs.map(motif => ({
                ...motif,
                notes: motif.notes.map(note => ({ ...note })),
                tags: [...motif.tags],
                metadata: motif.metadata ? { ...motif.metadata } : undefined
            }));
            return new MotifBank(clonedMotifs);
        }
    }

    class Matrix {
        constructor(data, columns) {
            if (typeof data === 'number') {
                if (columns === undefined) {
                    throw new Error('Columns parameter required when creating matrix from dimensions');
                }
                this.rows = data;
                this.columns = columns;
                this.data = Array(this.rows).fill(0).map(() => Array(this.columns).fill(0));
            }
            else {
                this.data = data.map(row => [...row]);
                this.rows = this.data.length;
                this.columns = this.data[0]?.length || 0;
            }
        }
        static zeros(rows, columns) {
            return new Matrix(rows, columns);
        }
        static from2DArray(data) {
            return new Matrix(data);
        }
        get(row, column) {
            if (row < 0 || row >= this.rows || column < 0 || column >= this.columns) {
                throw new Error(`Index out of bounds: (${row}, ${column})`);
            }
            return this.data[row][column];
        }
        set(row, column, value) {
            if (row < 0 || row >= this.rows || column < 0 || column >= this.columns) {
                throw new Error(`Index out of bounds: (${row}, ${column})`);
            }
            this.data[row][column] = value;
        }
        getRow(row) {
            if (row < 0 || row >= this.rows) {
                throw new Error(`Row index out of bounds: ${row}`);
            }
            return [...this.data[row]];
        }
        getColumn(column) {
            if (column < 0 || column >= this.columns) {
                throw new Error(`Column index out of bounds: ${column}`);
            }
            return this.data.map(row => row[column]);
        }
        transpose() {
            const transposed = Array(this.columns).fill(0).map(() => Array(this.rows).fill(0));
            for (let i = 0; i < this.rows; i++) {
                for (let j = 0; j < this.columns; j++) {
                    transposed[j][i] = this.data[i][j];
                }
            }
            return new Matrix(transposed);
        }
        clone() {
            return new Matrix(this.data);
        }
        toArray() {
            return this.data.map(row => [...row]);
        }
    }
    function ensure2D(X) {
        if (Array.isArray(X[0])) {
            return Matrix.from2DArray(X);
        }
        else {
            return Matrix.from2DArray([X]);
        }
    }
    function choleskyDecomposition(matrix) {
        if (matrix.rows !== matrix.columns) {
            throw new Error('Matrix must be square for Cholesky decomposition');
        }
        const n = matrix.rows;
        const L = Matrix.zeros(n, n);
        for (let i = 0; i < n; i++) {
            for (let j = 0; j <= i; j++) {
                if (i === j) {
                    let sum = 0;
                    for (let k = 0; k < j; k++) {
                        sum += L.get(j, k) * L.get(j, k);
                    }
                    const diagonal = matrix.get(j, j) - sum;
                    if (diagonal <= 0) {
                        throw new Error(`Matrix is not positive definite at position (${j}, ${j})`);
                    }
                    L.set(j, j, Math.sqrt(diagonal));
                }
                else {
                    let sum = 0;
                    for (let k = 0; k < j; k++) {
                        sum += L.get(i, k) * L.get(j, k);
                    }
                    L.set(i, j, (matrix.get(i, j) - sum) / L.get(j, j));
                }
            }
        }
        return L;
    }

    class GaussianProcessRegressor {
        constructor(kernel, options = {}) {
            this.kernel = kernel;
            this.alpha = options.alpha || 1e-10;
        }
        fit(X, y) {
            this.XTrain = ensure2D(X);
            this.yTrain = [...y];
            const K = this.kernel.call(this.XTrain);
            // Add noise to diagonal
            for (let i = 0; i < K.rows; i++) {
                K.set(i, i, K.get(i, i) + this.alpha);
            }
            try {
                this.L = choleskyDecomposition(K);
            }
            catch (error) {
                throw new Error(`Failed to compute Cholesky decomposition: ${error instanceof Error ? error.message : 'Unknown error'}`);
            }
            // Solve L * L^T * alpha = y using forward and back substitution
            this.alphaVector = this.solveCholesky(this.L, this.yTrain);
        }
        predict(X, returnStd = false) {
            if (!this.XTrain || !this.yTrain || !this.L || !this.alphaVector) {
                throw new Error('Model must be fitted before prediction');
            }
            const XTest = ensure2D(X);
            const KStar = this.kernel.call(this.XTrain, XTest);
            // Compute mean prediction
            const mean = new Array(XTest.rows);
            for (let i = 0; i < XTest.rows; i++) {
                mean[i] = 0;
                for (let j = 0; j < this.XTrain.rows; j++) {
                    mean[i] += KStar.get(j, i) * this.alphaVector[j];
                }
            }
            const result = { mean };
            if (returnStd) {
                const std = this.computeStd(XTest, KStar);
                result.std = std;
            }
            return result;
        }
        sampleY(X, nSamples = 1) {
            if (!this.XTrain || !this.yTrain || !this.L || !this.alphaVector) {
                throw new Error('Model must be fitted before sampling');
            }
            const XTest = ensure2D(X);
            const prediction = this.predict(X, true);
            if (!prediction.std) {
                throw new Error('Standard deviation computation failed');
            }
            const samples = [];
            for (let i = 0; i < nSamples; i++) {
                const sample = new Array(XTest.rows);
                for (let j = 0; j < XTest.rows; j++) {
                    const mean = prediction.mean[j];
                    const std = prediction.std[j];
                    sample[j] = mean + std * this.sampleStandardNormal();
                }
                samples.push(sample);
            }
            return samples;
        }
        logMarginalLikelihood() {
            if (!this.XTrain || !this.yTrain || !this.L || !this.alphaVector) {
                throw new Error('Model must be fitted before computing log marginal likelihood');
            }
            let logLikelihood = 0;
            // -0.5 * y^T * K^{-1} * y
            for (let i = 0; i < this.yTrain.length; i++) {
                logLikelihood -= 0.5 * this.yTrain[i] * this.alphaVector[i];
            }
            // -0.5 * log|K|
            for (let i = 0; i < this.L.rows; i++) {
                logLikelihood -= Math.log(this.L.get(i, i));
            }
            // -n/2 * log(2π)
            logLikelihood -= 0.5 * this.yTrain.length * Math.log(2 * Math.PI);
            return logLikelihood;
        }
        computeStd(XTest, KStar) {
            if (!this.L) {
                throw new Error('Cholesky decomposition not available');
            }
            const std = new Array(XTest.rows);
            for (let i = 0; i < XTest.rows; i++) {
                // K_** diagonal element
                const kStarStar = this.kernel.compute(XTest.getRow(i), XTest.getRow(i));
                // Solve L * v = k_*
                const kStarColumn = KStar.getColumn(i);
                const v = this.forwardSubstitution(this.L, kStarColumn);
                // Compute v^T * v
                let vTv = 0;
                for (let j = 0; j < v.length; j++) {
                    vTv += v[j] * v[j];
                }
                const variance = kStarStar - vTv;
                std[i] = Math.sqrt(Math.max(0, variance));
            }
            return std;
        }
        solveCholesky(L, y) {
            // Forward substitution: L * z = y
            const z = this.forwardSubstitution(L, y);
            // Back substitution: L^T * alpha = z
            return this.backSubstitution(L, z);
        }
        forwardSubstitution(L, b) {
            const n = L.rows;
            const x = new Array(n);
            for (let i = 0; i < n; i++) {
                x[i] = b[i];
                for (let j = 0; j < i; j++) {
                    x[i] -= L.get(i, j) * x[j];
                }
                x[i] /= L.get(i, i);
            }
            return x;
        }
        backSubstitution(L, b) {
            const n = L.rows;
            const x = new Array(n);
            for (let i = n - 1; i >= 0; i--) {
                x[i] = b[i];
                for (let j = i + 1; j < n; j++) {
                    x[i] -= L.get(j, i) * x[j];
                }
                x[i] /= L.get(i, i);
            }
            return x;
        }
        sampleStandardNormal() {
            const u1 = Math.random();
            const u2 = Math.random();
            return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
        }
    }

    class Kernel {
        constructor(params = {}) {
            this.params = { ...params };
        }
        call(X1, X2) {
            const X2_actual = X2 || X1;
            const K = Matrix.zeros(X1.rows, X2_actual.rows);
            for (let i = 0; i < X1.rows; i++) {
                for (let j = 0; j < X2_actual.rows; j++) {
                    K.set(i, j, this.compute(X1.getRow(i), X2_actual.getRow(j)));
                }
            }
            return K;
        }
        getParams() {
            return { ...this.params };
        }
        setParams(newParams) {
            Object.assign(this.params, newParams);
        }
        euclideanDistance(x1, x2) {
            let sum = 0;
            for (let i = 0; i < x1.length; i++) {
                sum += Math.pow(x1[i] - x2[i], 2);
            }
            return Math.sqrt(sum);
        }
        squaredEuclideanDistance(x1, x2) {
            let sum = 0;
            for (let i = 0; i < x1.length; i++) {
                sum += Math.pow(x1[i] - x2[i], 2);
            }
            return sum;
        }
    }

    class RBF extends Kernel {
        constructor(lengthScale = 1.0, variance = 1.0) {
            super({ length_scale: lengthScale, variance });
            this.lengthScale = lengthScale;
            this.variance = variance;
        }
        compute(x1, x2) {
            const distance = this.euclideanDistance(x1, x2);
            return this.variance * Math.exp(-0.5 * Math.pow(distance / this.lengthScale, 2));
        }
        getParams() {
            return {
                length_scale: this.lengthScale,
                variance: this.variance,
            };
        }
    }

    function sampleNormal(mean = 0, std = 1) {
        const u1 = Math.random();
        const u2 = Math.random();
        const z0 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
        return mean + std * z0;
    }
    function sampleMultivariateNormal(mean, covariance) {
        const n = mean.length;
        const L = choleskyDecomposition(covariance);
        const z = Array.from({ length: n }, () => sampleNormal());
        const sample = new Array(n);
        for (let i = 0; i < n; i++) {
            sample[i] = mean[i];
            for (let j = 0; j <= i; j++) {
                sample[i] += L.get(i, j) * z[j];
            }
        }
        return sample;
    }

    class KernelGenerator {
        constructor(data = [], lengthScale = 1.0, amplitude = 1.0, noiseLevel = 0.1, walkAround = false) {
            this.data = [...data];
            this.lengthScale = lengthScale;
            this.amplitude = amplitude;
            this.noiseLevel = noiseLevel;
            this.walkAround = walkAround;
        }
        generate(options = {}) {
            const length = options.length || 100;
            const lengthScale = options.lengthScale || this.lengthScale;
            const amplitude = options.amplitude || this.amplitude;
            const noiseLevel = options.noiseLevel || this.noiseLevel;
            // Create input points
            const X = Array.from({ length }, (_, i) => [i]);
            const XMatrix = new Matrix(X);
            // Create RBF kernel
            const kernel = new RBF(lengthScale, amplitude);
            const K = kernel.call(XMatrix);
            // Add noise to diagonal
            for (let i = 0; i < K.rows; i++) {
                K.set(i, i, K.get(i, i) + noiseLevel);
            }
            // Sample from multivariate normal
            const mean = new Array(length).fill(0);
            const sample = sampleMultivariateNormal(mean, K);
            if (this.walkAround && this.data.length > 0) {
                // Modify sample to walk around existing data
                const dataLength = this.data.length;
                for (let i = 0; i < Math.min(length, dataLength); i++) {
                    sample[i] = this.data[i] + sample[i] * 0.1;
                }
            }
            return sample;
        }
        rbfKernel(x1, x2) {
            let distanceSquared = 0;
            for (let i = 0; i < x1.length; i++) {
                distanceSquared += Math.pow(x1[i] - x2[i], 2);
            }
            return this.amplitude * Math.exp(-distanceSquared / (2 * Math.pow(this.lengthScale, 2)));
        }
        setData(data) {
            this.data = [...data];
        }
        getData() {
            return [...this.data];
        }
        setLengthScale(lengthScale) {
            this.lengthScale = lengthScale;
        }
        setAmplitude(amplitude) {
            this.amplitude = amplitude;
        }
        setNoiseLevel(noiseLevel) {
            this.noiseLevel = noiseLevel;
        }
    }

    class RationalQuadratic extends Kernel {
        constructor(lengthScale = 1.0, alpha = 1.0, variance = 1.0) {
            super({ length_scale: lengthScale, alpha, variance });
            this.lengthScale = lengthScale;
            this.alpha = alpha;
            this.variance = variance;
        }
        compute(x1, x2) {
            const distanceSquared = this.squaredEuclideanDistance(x1, x2);
            const term = 1 + distanceSquared / (2 * this.alpha * Math.pow(this.lengthScale, 2));
            return this.variance * Math.pow(term, -this.alpha);
        }
        getParams() {
            return {
                length_scale: this.lengthScale,
                alpha: this.alpha,
                variance: this.variance,
            };
        }
    }

    class Periodic extends Kernel {
        constructor(lengthScale = 1.0, periodicity = 1.0, variance = 1.0) {
            super({ length_scale: lengthScale, periodicity, variance });
            this.lengthScale = lengthScale;
            this.periodicity = periodicity;
            this.variance = variance;
        }
        compute(x1, x2) {
            const distance = this.euclideanDistance(x1, x2);
            const sinTerm = Math.sin(Math.PI * distance / this.periodicity);
            return this.variance * Math.exp(-2 * Math.pow(sinTerm / this.lengthScale, 2));
        }
        getParams() {
            return {
                length_scale: this.lengthScale,
                periodicity: this.periodicity,
                variance: this.variance,
            };
        }
    }

    class CellularAutomata {
        constructor(options = {}) {
            this.history = [];
            this.width = options.width || 51;
            this.ruleNumber = options.ruleNumber || 30;
            this.initialState = options.initialState || this.generateRandomInitialState();
            this.state = [...this.initialState];
            this.rules = this.loadRules(this.ruleNumber);
        }
        generate(steps) {
            this.history = [];
            this.state = [...this.initialState];
            this.history.push([...this.state]);
            for (let step = 0; step < steps; step++) {
                this.updateState();
                this.history.push([...this.state]);
            }
            return this.history;
        }
        generate01(steps) {
            const result = this.generate(steps);
            return result.map(row => row.map(cell => cell > 0 ? 1 : 0));
        }
        loadRules(ruleNumber) {
            const binary = ruleNumber.toString(2).padStart(8, '0');
            const rules = {};
            // Map binary neighborhoods to rule outputs
            const neighborhoods = ['111', '110', '101', '100', '011', '010', '001', '000'];
            for (let i = 0; i < 8; i++) {
                rules[neighborhoods[i]] = parseInt(binary[i], 10);
            }
            return rules;
        }
        updateState() {
            const newState = new Array(this.width);
            for (let i = 0; i < this.width; i++) {
                const left = this.state[(i - 1 + this.width) % this.width];
                const center = this.state[i];
                const right = this.state[(i + 1) % this.width];
                const neighborhood = `${left}${center}${right}`;
                newState[i] = this.rules[neighborhood] || 0;
            }
            this.state = newState;
        }
        validateStrips(strips) {
            if (!Array.isArray(strips) || strips.length === 0) {
                return false;
            }
            const width = strips[0]?.length;
            if (!width)
                return false;
            return strips.every(strip => Array.isArray(strip) &&
                strip.length === width &&
                strip.every(cell => typeof cell === 'number' && (cell === 0 || cell === 1)));
        }
        validateValues(values) {
            return Array.isArray(values) &&
                values.length === this.width &&
                values.every(val => typeof val === 'number' && (val === 0 || val === 1));
        }
        setInitialState(state) {
            if (this.validateValues(state)) {
                this.initialState = [...state];
                this.state = [...state];
            }
            else {
                throw new Error('Invalid initial state');
            }
        }
        setRuleNumber(ruleNumber) {
            if (ruleNumber >= 0 && ruleNumber <= 255) {
                this.ruleNumber = ruleNumber;
                this.rules = this.loadRules(ruleNumber);
            }
            else {
                throw new Error('Rule number must be between 0 and 255');
            }
        }
        getHistory() {
            return this.history.map(row => [...row]);
        }
        getCurrentState() {
            return [...this.state];
        }
        generateRandomInitialState() {
            const state = new Array(this.width).fill(0);
            // Single cell in center
            state[Math.floor(this.width / 2)] = 1;
            return state;
        }
        generateRandomState() {
            return Array.from({ length: this.width }, () => Math.random() > 0.5 ? 1 : 0);
        }
        plot() {
            return {
                data: this.getHistory(),
                width: this.width,
                height: this.history.length,
            };
        }
        /**
         * Create Observable Plot visualization of CA evolution
         */
        plotEvolution(options) {
            const { CAVisualizer } = require('../../visualization/cellular-automata/CAVisualizer.js');
            return CAVisualizer.plotEvolution(this.getHistory(), options);
        }
        /**
         * Create Observable Plot visualization of current generation
         */
        plotGeneration(options) {
            const { CAVisualizer } = require('../../visualization/cellular-automata/CAVisualizer.js');
            return CAVisualizer.plotGeneration(this.getCurrentState(), options);
        }
        /**
         * Create Observable Plot density visualization
         */
        plotDensity(options) {
            const { CAVisualizer } = require('../../visualization/cellular-automata/CAVisualizer.js');
            return CAVisualizer.plotDensity(this.getHistory(), options);
        }
    }

    class Polyloop {
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

    /**
     * Musical analysis tools inspired by the Python djalgo analysis module
     * Provides statistical and musical evaluation metrics for sequences
     */
    class MusicalAnalysis {
        /**
         * Calculate Gini coefficient for inequality measurement
         */
        static gini(values, weights) {
            if (values.length === 0)
                return 0;
            const n = values.length;
            const w = weights || Array(n).fill(1);
            // Sort values with corresponding weights
            const pairs = values.map((v, i) => ({ value: v, weight: w[i] }))
                .sort((a, b) => a.value - b.value);
            const sortedValues = pairs.map(p => p.value);
            const sortedWeights = pairs.map(p => p.weight);
            const totalWeight = sortedWeights.reduce((sum, w) => sum + w, 0);
            let numerator = 0;
            let denominator = 0;
            for (let i = 0; i < n; i++) {
                const cumWeight = sortedWeights.slice(0, i + 1).reduce((sum, w) => sum + w, 0);
                numerator += sortedWeights[i] * (2 * cumWeight - sortedWeights[i] - totalWeight) * sortedValues[i];
                denominator += sortedWeights[i] * sortedValues[i] * totalWeight;
            }
            return denominator === 0 ? 0 : numerator / denominator;
        }
        /**
         * Calculate center of mass (balance point) of a sequence
         */
        static balance(values, weights) {
            if (values.length === 0)
                return 0;
            const w = weights || Array(values.length).fill(1);
            const weightedSum = values.reduce((sum, val, i) => sum + val * w[i], 0);
            const totalWeight = w.reduce((sum, weight) => sum + weight, 0);
            return totalWeight === 0 ? 0 : weightedSum / totalWeight;
        }
        /**
         * Calculate autocorrelation for pattern detection
         */
        static autocorrelation(values, maxLag) {
            const n = values.length;
            const lag = maxLag || Math.floor(n / 2);
            const result = [];
            const mean = values.reduce((sum, val) => sum + val, 0) / n;
            const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / n;
            for (let k = 0; k <= lag; k++) {
                let covariance = 0;
                for (let i = 0; i < n - k; i++) {
                    covariance += (values[i] - mean) * (values[i + k] - mean);
                }
                covariance /= (n - k);
                result.push(variance === 0 ? 0 : covariance / variance);
            }
            return result;
        }
        /**
         * Detect and score musical motifs
         */
        static motif(values, patternLength = 3) {
            if (values.length < patternLength * 2)
                return 0;
            const patterns = new Map();
            for (let i = 0; i <= values.length - patternLength; i++) {
                const pattern = values.slice(i, i + patternLength).join(',');
                patterns.set(pattern, (patterns.get(pattern) || 0) + 1);
            }
            const maxOccurrences = Math.max(...patterns.values());
            const totalPatterns = patterns.size;
            return totalPatterns === 0 ? 0 : maxOccurrences / totalPatterns;
        }
        /**
         * Calculate dissonance/scale conformity
         */
        static dissonance(pitches, scale = [0, 2, 4, 5, 7, 9, 11]) {
            if (pitches.length === 0)
                return 0;
            let conformingNotes = 0;
            for (const pitch of pitches) {
                const pitchClass = ((pitch % 12) + 12) % 12;
                if (scale.includes(pitchClass)) {
                    conformingNotes++;
                }
            }
            return 1 - (conformingNotes / pitches.length);
        }
        /**
         * Calculate rhythmic fit to a grid
         */
        static rhythmic(onsets, gridDivision = 16) {
            if (onsets.length === 0)
                return 0;
            let gridAlignedCount = 0;
            const tolerance = 0.1; // Allow slight timing variations
            for (const onset of onsets) {
                const gridPosition = onset * gridDivision;
                const nearestGrid = Math.round(gridPosition);
                const deviation = Math.abs(gridPosition - nearestGrid);
                if (deviation <= tolerance) {
                    gridAlignedCount++;
                }
            }
            return gridAlignedCount / onsets.length;
        }
        /**
         * Calculate Fibonacci/golden ratio index
         */
        static fibonacciIndex(values) {
            if (values.length < 2)
                return 0;
            const goldenRatio = (1 + Math.sqrt(5)) / 2;
            let fibonacciScore = 0;
            for (let i = 1; i < values.length; i++) {
                if (values[i - 1] !== 0) {
                    const ratio = values[i] / values[i - 1];
                    const deviation = Math.abs(ratio - goldenRatio);
                    fibonacciScore += 1 / (1 + deviation);
                }
            }
            return fibonacciScore / (values.length - 1);
        }
        /**
         * Calculate syncopation (off-beat emphasis)
         */
        static syncopation(onsets, beatDivision = 4) {
            if (onsets.length === 0)
                return 0;
            let syncopatedCount = 0;
            for (const onset of onsets) {
                const beatPosition = (onset * beatDivision) % 1;
                // Strong beats are at 0, 0.5; weak beats are at 0.25, 0.75
                const isOffBeat = beatPosition > 0.2 && beatPosition < 0.8 &&
                    Math.abs(beatPosition - 0.5) > 0.2;
                if (isOffBeat) {
                    syncopatedCount++;
                }
            }
            return syncopatedCount / onsets.length;
        }
        /**
         * Calculate contour entropy (melodic direction randomness)
         */
        static contourEntropy(pitches) {
            if (pitches.length < 2)
                return 0;
            const directions = [];
            for (let i = 1; i < pitches.length; i++) {
                const diff = pitches[i] - pitches[i - 1];
                if (diff > 0)
                    directions.push(1); // Up
                else if (diff < 0)
                    directions.push(-1); // Down
                else
                    directions.push(0); // Same
            }
            const counts = { up: 0, down: 0, same: 0 };
            for (const dir of directions) {
                if (dir > 0)
                    counts.up++;
                else if (dir < 0)
                    counts.down++;
                else
                    counts.same++;
            }
            const total = directions.length;
            const probabilities = [counts.up / total, counts.down / total, counts.same / total]
                .filter(p => p > 0);
            return -probabilities.reduce((entropy, p) => entropy + p * Math.log2(p), 0);
        }
        /**
         * Calculate interval variance (pitch stability)
         */
        static intervalVariance(pitches) {
            if (pitches.length < 2)
                return 0;
            const intervals = [];
            for (let i = 1; i < pitches.length; i++) {
                intervals.push(Math.abs(pitches[i] - pitches[i - 1]));
            }
            const mean = intervals.reduce((sum, interval) => sum + interval, 0) / intervals.length;
            const variance = intervals.reduce((sum, interval) => sum + Math.pow(interval - mean, 2), 0) / intervals.length;
            return variance;
        }
        /**
         * Calculate note density (notes per unit time)
         */
        static density(notes, timeWindow = 1) {
            if (notes.length === 0)
                return 0;
            // Convert time to numeric for calculation
            const numericTimes = notes.map(note => {
                if (typeof note.time === 'string') {
                    // Simple conversion for demonstration - would need proper time parsing
                    return parseFloat(note.time) || 0;
                }
                return note.time;
            });
            const minTime = Math.min(...numericTimes);
            const maxTime = Math.max(...numericTimes);
            const totalTime = maxTime - minTime || 1;
            return notes.length / (totalTime / timeWindow);
        }
        /**
         * Calculate gap variance (timing consistency)
         */
        static gapVariance(onsets) {
            if (onsets.length < 2)
                return 0;
            const gaps = [];
            for (let i = 1; i < onsets.length; i++) {
                gaps.push(onsets[i] - onsets[i - 1]);
            }
            const mean = gaps.reduce((sum, gap) => sum + gap, 0) / gaps.length;
            const variance = gaps.reduce((sum, gap) => sum + Math.pow(gap - mean, 2), 0) / gaps.length;
            return variance;
        }
        /**
         * Comprehensive analysis of a musical sequence
         */
        static analyze(notes, options = {}) {
            const { scale = [0, 2, 4, 5, 7, 9, 11] } = options;
            // Extract pitch and timing data
            const pitches = notes.map(note => {
                if (typeof note.note === 'number')
                    return note.note;
                if (typeof note.note === 'string') {
                    // Simple MIDI note conversion - would need proper note parsing
                    return 60; // Default to middle C
                }
                return Array.isArray(note.note) ? note.note[0] : 60;
            });
            const onsets = notes.map(note => {
                if (typeof note.time === 'number')
                    return note.time;
                return parseFloat(note.time) || 0;
            });
            return {
                gini: this.gini(pitches),
                balance: this.balance(pitches),
                motif: this.motif(pitches),
                dissonance: this.dissonance(pitches, scale),
                rhythmic: this.rhythmic(onsets),
                fibonacciIndex: this.fibonacciIndex(pitches),
                syncopation: this.syncopation(onsets),
                contourEntropy: this.contourEntropy(pitches),
                intervalVariance: this.intervalVariance(pitches),
                density: this.density(notes),
                gapVariance: this.gapVariance(onsets)
            };
        }
    }

    /**
     * Genetic Algorithm for evolving musical phrases
     * Based on the Python djalgo genetic module (Darwin class)
     */
    class GeneticAlgorithm {
        constructor(options = {}) {
            this.options = {
                populationSize: options.populationSize || 50,
                generations: options.generations || 100,
                mutationRate: options.mutationRate || 0.1,
                crossoverRate: options.crossoverRate || 0.8,
                elitismRate: options.elitismRate || 0.1,
                fitnessWeights: {
                    gini: 0.2,
                    balance: 0.15,
                    motif: 0.25,
                    dissonance: 0.2,
                    rhythmic: 0.2,
                    ...options.fitnessWeights
                },
                scale: options.scale || [0, 2, 4, 5, 7, 9, 11], // C major
                durations: options.durations || ['4n', '8n', '2n', '16n'],
                lengthRange: options.lengthRange || [8, 16]
            };
            this.population = [];
            this.generation = 0;
            this.bestFitness = -Infinity;
            this.bestIndividual = null;
        }
        /**
         * Initialize random population
         */
        initializePopulation() {
            this.population = [];
            for (let i = 0; i < this.options.populationSize; i++) {
                const individual = this.createRandomIndividual();
                this.population.push(individual);
            }
            this.evaluatePopulation();
        }
        /**
         * Run the genetic algorithm
         */
        evolve() {
            this.initializePopulation();
            for (let gen = 0; gen < this.options.generations; gen++) {
                this.generation = gen;
                // Selection and reproduction
                const newPopulation = this.createNextGeneration();
                // Replace population
                this.population = newPopulation;
                // Evaluate new population
                this.evaluatePopulation();
                // Track best individual
                const currentBest = this.getBestIndividual();
                if (currentBest.fitness > this.bestFitness) {
                    this.bestFitness = currentBest.fitness;
                    this.bestIndividual = { ...currentBest };
                }
            }
            return this.getBestIndividual();
        }
        /**
         * Create a random individual
         */
        createRandomIndividual() {
            const length = Math.floor(Math.random() * (this.options.lengthRange[1] - this.options.lengthRange[0] + 1)) + this.options.lengthRange[0];
            const genes = [];
            let currentTime = 0;
            for (let i = 0; i < length; i++) {
                const pitch = this.randomPitch();
                const duration = this.randomDuration();
                genes.push({
                    note: pitch,
                    time: `${Math.floor(currentTime)}:${Math.floor((currentTime % 1) * 4)}:0`, // Simple time format
                    duration: duration,
                    velocity: Math.random() * 0.5 + 0.5 // 0.5 to 1.0
                });
                // Advance time (simplified duration parsing)
                currentTime += this.parseDuration(duration);
            }
            return {
                genes,
                fitness: 0,
                age: 0
            };
        }
        /**
         * Generate random pitch from scale
         */
        randomPitch() {
            const octave = Math.floor(Math.random() * 3) + 4; // Octaves 4-6
            const scaleNote = this.options.scale[Math.floor(Math.random() * this.options.scale.length)];
            return 12 * octave + scaleNote;
        }
        /**
         * Generate random duration
         */
        randomDuration() {
            return this.options.durations[Math.floor(Math.random() * this.options.durations.length)];
        }
        /**
         * Parse duration to numeric value (simplified)
         */
        parseDuration(duration) {
            const durationMap = {
                '1n': 4,
                '2n': 2,
                '4n': 1,
                '8n': 0.5,
                '16n': 0.25,
                '32n': 0.125
            };
            return durationMap[duration] || 1;
        }
        /**
         * Evaluate fitness for all individuals
         */
        evaluatePopulation() {
            for (const individual of this.population) {
                individual.fitness = this.calculateFitness(individual.genes);
            }
            // Sort by fitness (descending)
            this.population.sort((a, b) => b.fitness - a.fitness);
        }
        /**
         * Calculate fitness using weighted musical analysis metrics
         */
        calculateFitness(genes) {
            const analysis = MusicalAnalysis.analyze(genes, { scale: this.options.scale });
            let fitness = 0;
            const weights = this.options.fitnessWeights;
            // Combine weighted metrics
            fitness += (weights.gini || 0) * (1 - analysis.gini); // Lower gini is better (more equal)
            fitness += (weights.balance || 0) * (1 - Math.abs(analysis.balance - 60) / 60); // Closer to middle C
            fitness += (weights.motif || 0) * analysis.motif;
            fitness += (weights.dissonance || 0) * (1 - analysis.dissonance); // Lower dissonance is better
            fitness += (weights.rhythmic || 0) * analysis.rhythmic;
            // Additional penalties/bonuses
            const length = genes.length;
            if (length < this.options.lengthRange[0] || length > this.options.lengthRange[1]) {
                fitness *= 0.5; // Penalty for wrong length
            }
            return Math.max(0, fitness); // Ensure non-negative
        }
        /**
         * Create next generation through selection, crossover, and mutation
         */
        createNextGeneration() {
            const newPopulation = [];
            const eliteCount = Math.floor(this.options.populationSize * this.options.elitismRate);
            // Elitism - keep best individuals
            for (let i = 0; i < eliteCount; i++) {
                const elite = { ...this.population[i] };
                elite.age++;
                newPopulation.push(elite);
            }
            // Generate offspring
            while (newPopulation.length < this.options.populationSize) {
                const parent1 = this.selectParent();
                const parent2 = this.selectParent();
                let offspring1, offspring2;
                if (Math.random() < this.options.crossoverRate) {
                    [offspring1, offspring2] = this.crossover(parent1, parent2);
                }
                else {
                    offspring1 = { ...parent1 };
                    offspring2 = { ...parent2 };
                }
                // Mutation
                if (Math.random() < this.options.mutationRate) {
                    this.mutate(offspring1);
                }
                if (Math.random() < this.options.mutationRate) {
                    this.mutate(offspring2);
                }
                offspring1.age = 0;
                offspring2.age = 0;
                newPopulation.push(offspring1);
                if (newPopulation.length < this.options.populationSize) {
                    newPopulation.push(offspring2);
                }
            }
            return newPopulation;
        }
        /**
         * Tournament selection
         */
        selectParent() {
            const tournamentSize = 3;
            const tournament = [];
            for (let i = 0; i < tournamentSize; i++) {
                const randomIndex = Math.floor(Math.random() * this.population.length);
                tournament.push(this.population[randomIndex]);
            }
            tournament.sort((a, b) => b.fitness - a.fitness);
            return { ...tournament[0] };
        }
        /**
         * Single-point crossover
         */
        crossover(parent1, parent2) {
            const minLength = Math.min(parent1.genes.length, parent2.genes.length);
            const crossoverPoint = Math.floor(Math.random() * minLength);
            const offspring1 = {
                genes: [
                    ...parent1.genes.slice(0, crossoverPoint),
                    ...parent2.genes.slice(crossoverPoint)
                ],
                fitness: 0,
                age: 0
            };
            const offspring2 = {
                genes: [
                    ...parent2.genes.slice(0, crossoverPoint),
                    ...parent1.genes.slice(crossoverPoint)
                ],
                fitness: 0,
                age: 0
            };
            return [offspring1, offspring2];
        }
        /**
         * Mutate an individual
         */
        mutate(individual) {
            const genes = individual.genes;
            const mutationType = Math.random();
            if (mutationType < 0.3) {
                // Pitch mutation
                const index = Math.floor(Math.random() * genes.length);
                genes[index].note = this.randomPitch();
            }
            else if (mutationType < 0.6) {
                // Duration mutation
                const index = Math.floor(Math.random() * genes.length);
                genes[index].duration = this.randomDuration();
            }
            else if (mutationType < 0.8) {
                // Velocity mutation
                const index = Math.floor(Math.random() * genes.length);
                genes[index].velocity = Math.random() * 0.5 + 0.5;
            }
            else {
                // Structure mutation (add/remove note)
                if (Math.random() < 0.5 && genes.length < this.options.lengthRange[1]) {
                    // Add note
                    const insertIndex = Math.floor(Math.random() * (genes.length + 1));
                    const newNote = {
                        note: this.randomPitch(),
                        time: '0:0:0', // Will be recalculated
                        duration: this.randomDuration(),
                        velocity: Math.random() * 0.5 + 0.5
                    };
                    genes.splice(insertIndex, 0, newNote);
                }
                else if (genes.length > this.options.lengthRange[0]) {
                    // Remove note
                    const removeIndex = Math.floor(Math.random() * genes.length);
                    genes.splice(removeIndex, 1);
                }
            }
            // Recalculate timing
            this.recalculateTiming(individual);
        }
        /**
         * Recalculate note timing after mutations
         */
        recalculateTiming(individual) {
            let currentTime = 0;
            for (const note of individual.genes) {
                note.time = `${Math.floor(currentTime)}:${Math.floor((currentTime % 1) * 4)}:0`;
                currentTime += this.parseDuration(note.duration);
            }
        }
        /**
         * Get the best individual from current population
         */
        getBestIndividual() {
            return { ...this.population[0] };
        }
        /**
         * Get population statistics
         */
        getStatistics() {
            const fitnesses = this.population.map(ind => ind.fitness);
            const avgFitness = fitnesses.reduce((sum, f) => sum + f, 0) / fitnesses.length;
            const maxFitness = Math.max(...fitnesses);
            const minFitness = Math.min(...fitnesses);
            return {
                generation: this.generation,
                avgFitness,
                maxFitness,
                minFitness,
                bestAllTime: this.bestFitness,
                populationSize: this.population.length
            };
        }
        /**
         * Set custom fitness function
         */
        setCustomFitness(fitnessFunction) {
            this.calculateFitness = fitnessFunction;
        }
    }

    /**
     * Multi-dimensional random walk generator with branching and merging
     * Based on the Python djalgo walk module (Chain class)
     */
    class RandomWalk {
        constructor(options = {}) {
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
        generate(startPosition) {
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
        initialize(startPosition) {
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
        updateWalkers() {
            for (const walker of this.walkers) {
                if (!walker.active)
                    continue;
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
                    }
                    else if (walker.position[dim] > this.options.bounds[1]) {
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
        recordState() {
            const activeWalkers = this.walkers.filter(w => w.active);
            if (activeWalkers.length > 0) {
                // Average position if multiple walkers, or just use the primary walker
                const avgPosition = Array(this.options.dimensions).fill(0);
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
        handleBranching() {
            const newBranches = [];
            for (const walker of this.walkers) {
                if (!walker.active)
                    continue;
                if (Math.random() < this.options.branchProbability) {
                    // Create a new branch
                    const branch = {
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
        handleMerging() {
            if (this.walkers.length <= 1)
                return;
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
        calculateDistance(pos1, pos2) {
            let sum = 0;
            for (let i = 0; i < pos1.length; i++) {
                sum += Math.pow(pos1[i] - pos2[i], 2);
            }
            return Math.sqrt(sum);
        }
        /**
         * Get 1D projection of multi-dimensional walk
         */
        getProjection(dimension = 0) {
            return this.history.map(state => state[dimension] || 0);
        }
        /**
         * Map walk to musical scale
         */
        mapToScale(dimension = 0, scale = [0, 2, 4, 5, 7, 9, 11], octaveRange = 3) {
            const projection = this.getProjection(dimension);
            if (projection.length === 0)
                return [];
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
        mapToRhythm(dimension = 0, durations = [0.25, 0.5, 1, 2]) {
            const projection = this.getProjection(dimension);
            if (projection.length === 0)
                return [];
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
        mapToVelocity(dimension = 0, minVel = 0.3, maxVel = 1.0) {
            const projection = this.getProjection(dimension);
            if (projection.length === 0)
                return [];
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
        generateCorrelated(targetWalk, correlation = 0.5, dimension = 0) {
            if (targetWalk.length === 0)
                return [];
            const correlatedWalk = [];
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
        analyze() {
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
        getWalkerStates() {
            return this.walkers.map(walker => ({ ...walker }));
        }
        /**
         * Reset the walk generator
         */
        reset() {
            this.walkers = [];
            this.history = [];
        }
    }

    /**
     * Mandelbrot set fractal generator for musical composition
     * Based on the Python djalgo fractal module
     */
    class Mandelbrot {
        constructor(options = {}) {
            this.width = options.width || 100;
            this.height = options.height || 100;
            this.maxIterations = options.maxIterations || 100;
            this.xMin = options.xMin || -2.5;
            this.xMax = options.xMax || 1.5;
            this.yMin = options.yMin || -2;
            this.yMax = options.yMax || 2.0;
        }
        /**
         * Generate Mandelbrot set data
         */
        generate() {
            const data = [];
            for (let y = 0; y < this.height; y++) {
                const row = [];
                for (let x = 0; x < this.width; x++) {
                    const real = this.xMin + (x / this.width) * (this.xMax - this.xMin);
                    const imaginary = this.yMin + (y / this.height) * (this.yMax - this.yMin);
                    const iterations = this.mandelbrotIterations({ real, imaginary });
                    row.push(iterations);
                }
                data.push(row);
            }
            return data;
        }
        /**
         * Extract sequence from Mandelbrot data using various methods
         */
        extractSequence(method = 'diagonal', index = 0) {
            const data = this.generate();
            switch (method) {
                case 'diagonal':
                    return this.extractDiagonal(data);
                case 'border':
                    return this.extractBorder(data);
                case 'spiral':
                    return this.extractSpiral(data);
                case 'column':
                    return this.extractColumn(data, index);
                case 'row':
                    return this.extractRow(data, index);
                default:
                    return this.extractDiagonal(data);
            }
        }
        /**
         * Calculate Mandelbrot iterations for a complex point
         */
        mandelbrotIterations(c) {
            let z = { real: 0, imaginary: 0 };
            for (let i = 0; i < this.maxIterations; i++) {
                // z = z^2 + c
                const zReal = z.real * z.real - z.imaginary * z.imaginary + c.real;
                const zImaginary = 2 * z.real * z.imaginary + c.imaginary;
                z.real = zReal;
                z.imaginary = zImaginary;
                // Check if point escapes
                if (z.real * z.real + z.imaginary * z.imaginary > 4) {
                    return i;
                }
            }
            return this.maxIterations;
        }
        /**
         * Extract diagonal sequence
         */
        extractDiagonal(data) {
            const sequence = [];
            const minDimension = Math.min(data.length, data[0]?.length || 0);
            for (let i = 0; i < minDimension; i++) {
                sequence.push(data[i][i]);
            }
            return sequence;
        }
        /**
         * Extract border sequence (clockwise)
         */
        extractBorder(data) {
            const sequence = [];
            const height = data.length;
            const width = data[0]?.length || 0;
            if (height === 0 || width === 0)
                return sequence;
            // Top row
            for (let x = 0; x < width; x++) {
                sequence.push(data[0][x]);
            }
            // Right column (excluding top corner)
            for (let y = 1; y < height; y++) {
                sequence.push(data[y][width - 1]);
            }
            // Bottom row (excluding right corner, reverse order)
            if (height > 1) {
                for (let x = width - 2; x >= 0; x--) {
                    sequence.push(data[height - 1][x]);
                }
            }
            // Left column (excluding corners, reverse order)
            if (width > 1) {
                for (let y = height - 2; y > 0; y--) {
                    sequence.push(data[y][0]);
                }
            }
            return sequence;
        }
        /**
         * Extract spiral sequence (from outside to inside)
         */
        extractSpiral(data) {
            const sequence = [];
            const height = data.length;
            const width = data[0]?.length || 0;
            if (height === 0 || width === 0)
                return sequence;
            let top = 0, bottom = height - 1;
            let left = 0, right = width - 1;
            while (top <= bottom && left <= right) {
                // Top row
                for (let x = left; x <= right; x++) {
                    sequence.push(data[top][x]);
                }
                top++;
                // Right column
                for (let y = top; y <= bottom; y++) {
                    sequence.push(data[y][right]);
                }
                right--;
                // Bottom row
                if (top <= bottom) {
                    for (let x = right; x >= left; x--) {
                        sequence.push(data[bottom][x]);
                    }
                    bottom--;
                }
                // Left column
                if (left <= right) {
                    for (let y = bottom; y >= top; y--) {
                        sequence.push(data[y][left]);
                    }
                    left++;
                }
            }
            return sequence;
        }
        /**
         * Extract specific column
         */
        extractColumn(data, columnIndex) {
            const sequence = [];
            const width = data[0]?.length || 0;
            const clampedIndex = Math.max(0, Math.min(columnIndex, width - 1));
            for (const row of data) {
                if (row[clampedIndex] !== undefined) {
                    sequence.push(row[clampedIndex]);
                }
            }
            return sequence;
        }
        /**
         * Extract specific row
         */
        extractRow(data, rowIndex) {
            const clampedIndex = Math.max(0, Math.min(rowIndex, data.length - 1));
            return data[clampedIndex] ? [...data[clampedIndex]] : [];
        }
        /**
         * Map fractal values to musical scale
         */
        mapToScale(sequence, scale = [0, 2, 4, 5, 7, 9, 11], octaveRange = 3) {
            if (sequence.length === 0)
                return [];
            const minVal = Math.min(...sequence);
            const maxVal = Math.max(...sequence);
            const range = maxVal - minVal || 1;
            return sequence.map(value => {
                // Normalize to 0-1
                const normalized = (value - minVal) / range;
                // Map to scale indices
                const scaleIndex = Math.floor(normalized * scale.length * octaveRange);
                const octave = Math.floor(scaleIndex / scale.length);
                const noteIndex = scaleIndex % scale.length;
                // Convert to MIDI note (C4 = 60)
                return 60 + octave * 12 + scale[noteIndex];
            });
        }
        /**
         * Generate rhythmic pattern from fractal data
         */
        mapToRhythm(sequence, subdivisions = [1, 2, 4, 8, 16]) {
            if (sequence.length === 0)
                return [];
            const minVal = Math.min(...sequence);
            const maxVal = Math.max(...sequence);
            const range = maxVal - minVal || 1;
            return sequence.map(value => {
                const normalized = (value - minVal) / range;
                const subdivisionIndex = Math.floor(normalized * subdivisions.length);
                const clampedIndex = Math.max(0, Math.min(subdivisionIndex, subdivisions.length - 1));
                return 1 / subdivisions[clampedIndex];
            });
        }
    }

    /**
     * Logistic Map chaotic sequence generator
     * Based on the equation: x(n+1) = r * x(n) * (1 - x(n))
     */
    class LogisticMap {
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

    /**
     * Implementation of musical minimalism processes based on the Python djalgo library
     * Supports additive and subtractive operations in four directions
     */
    class MinimalismProcess {
        constructor(options) {
            this.sequence = [];
            const { operation, direction, repetition } = options;
            if (!['additive', 'subtractive'].includes(operation)) {
                throw new Error("Invalid operation. Choose 'additive' or 'subtractive'.");
            }
            if (!['forward', 'backward', 'inward', 'outward'].includes(direction)) {
                throw new Error("Invalid direction. Choose 'forward', 'backward', 'inward' or 'outward'.");
            }
            if (repetition < 0 || !Number.isInteger(repetition)) {
                throw new Error("Invalid repetition value. Must be an integer greater than or equal to 0.");
            }
            this.operation = operation;
            this.direction = direction;
            this.repetition = repetition;
        }
        /**
         * Generate processed sequence based on operation and direction
         */
        generate(sequence) {
            this.sequence = sequence;
            let processed;
            if (this.operation === 'additive' && this.direction === 'forward') {
                processed = this.additiveForward();
            }
            else if (this.operation === 'additive' && this.direction === 'backward') {
                processed = this.additiveBackward();
            }
            else if (this.operation === 'additive' && this.direction === 'inward') {
                processed = this.additiveInward();
            }
            else if (this.operation === 'additive' && this.direction === 'outward') {
                processed = this.additiveOutward();
            }
            else if (this.operation === 'subtractive' && this.direction === 'forward') {
                processed = this.subtractiveForward();
            }
            else if (this.operation === 'subtractive' && this.direction === 'backward') {
                processed = this.subtractiveBackward();
            }
            else if (this.operation === 'subtractive' && this.direction === 'inward') {
                processed = this.subtractiveInward();
            }
            else if (this.operation === 'subtractive' && this.direction === 'outward') {
                processed = this.subtractiveOutward();
            }
            else {
                throw new Error('Invalid operation/direction combination');
            }
            // Adjust offsets based on durations
            return this.adjustOffsets(processed);
        }
        additiveForward() {
            const processed = [];
            for (let i = 0; i < this.sequence.length; i++) {
                const segment = this.sequence.slice(0, i + 1);
                for (let rep = 0; rep <= this.repetition; rep++) {
                    processed.push(...segment);
                }
            }
            return processed;
        }
        additiveBackward() {
            const processed = [];
            for (let i = this.sequence.length; i > 0; i--) {
                const segment = this.sequence.slice(i - 1);
                for (let rep = 0; rep <= this.repetition; rep++) {
                    processed.push(...segment);
                }
            }
            return processed;
        }
        additiveInward() {
            const processed = [];
            const n = this.sequence.length;
            for (let i = 0; i < Math.ceil(n / 2); i++) {
                let segment;
                if (i < n - i - 1) {
                    // Combine from start and end
                    const leftPart = this.sequence.slice(0, i + 1);
                    const rightPart = this.sequence.slice(n - i - 1);
                    segment = [...leftPart, ...rightPart];
                }
                else {
                    // Middle element(s)
                    segment = [...this.sequence];
                }
                for (let rep = 0; rep <= this.repetition; rep++) {
                    processed.push(...segment);
                }
            }
            return processed;
        }
        additiveOutward() {
            const processed = [];
            const n = this.sequence.length;
            if (n % 2 === 0) {
                // Even length
                const midLeft = Math.floor(n / 2) - 1;
                const midRight = Math.floor(n / 2);
                for (let i = 0; i < n / 2; i++) {
                    const segment = this.sequence.slice(midLeft - i, midRight + i + 1);
                    for (let rep = 0; rep <= this.repetition; rep++) {
                        processed.push(...segment);
                    }
                }
            }
            else {
                // Odd length
                const mid = Math.floor(n / 2);
                for (let i = 0; i <= mid; i++) {
                    const segment = this.sequence.slice(mid - i, mid + i + 1);
                    for (let rep = 0; rep <= this.repetition; rep++) {
                        processed.push(...segment);
                    }
                }
            }
            return processed;
        }
        subtractiveForward() {
            const processed = [];
            for (let i = 0; i < this.sequence.length; i++) {
                const segment = this.sequence.slice(i);
                for (let rep = 0; rep <= this.repetition; rep++) {
                    processed.push(...segment);
                }
            }
            return processed;
        }
        subtractiveBackward() {
            const processed = [];
            for (let i = this.sequence.length; i > 0; i--) {
                const segment = this.sequence.slice(0, i);
                for (let rep = 0; rep <= this.repetition; rep++) {
                    processed.push(...segment);
                }
            }
            return processed;
        }
        subtractiveInward() {
            const processed = [];
            const n = this.sequence.length;
            const steps = Math.floor(n / 2);
            // Start with full sequence
            for (let rep = 0; rep <= this.repetition; rep++) {
                processed.push(...this.sequence);
            }
            // Remove elements from both ends
            for (let i = 1; i <= steps; i++) {
                const segment = this.sequence.slice(i, n - i);
                if (segment.length > 0) {
                    for (let rep = 0; rep <= this.repetition; rep++) {
                        processed.push(...segment);
                    }
                }
            }
            return processed;
        }
        subtractiveOutward() {
            const processed = [];
            let segment = [...this.sequence];
            // Start with full sequence
            for (let rep = 0; rep <= this.repetition; rep++) {
                processed.push(...segment);
            }
            // Remove first and last elements iteratively
            while (segment.length > 2) {
                segment = segment.slice(1, -1);
                for (let rep = 0; rep <= this.repetition; rep++) {
                    processed.push(...segment);
                }
            }
            return processed;
        }
        adjustOffsets(processed) {
            let currentOffset = 0;
            return processed.map(note => {
                const newNote = {
                    ...note,
                    offset: currentOffset
                };
                currentOffset += note.duration;
                return newNote;
            });
        }
    }
    /**
     * Tintinnabuli style implementation for modal composition
     */
    class Tintinnabuli {
        constructor(tChord, direction = 'down', rank = 0) {
            if (!['up', 'down', 'any', 'alternate'].includes(direction)) {
                throw new Error("Invalid direction. Choose 'up', 'down', 'any' or 'alternate'.");
            }
            this.tChord = tChord;
            this.isAlternate = direction === 'alternate';
            this.currentDirection = this.isAlternate ? 'up' : direction;
            this.direction = direction;
            if (!Number.isInteger(rank) || rank < 0) {
                throw new Error("Rank must be a non-negative integer.");
            }
            this.rank = Math.min(rank, tChord.length - 1);
            if (this.rank >= tChord.length) {
                console.warn("Rank exceeds the length of the t-chord. Using last note of the t-chord.");
            }
        }
        /**
         * Generate t-voice from m-voice sequence
         */
        generate(sequence) {
            const tVoice = [];
            for (const note of sequence) {
                if (note.pitch === undefined) {
                    // Rest note
                    tVoice.push({
                        ...note,
                        pitch: undefined
                    });
                    continue;
                }
                const mPitch = note.pitch;
                const differences = this.tChord.map(t => t - mPitch);
                const sortedDifferences = differences
                    .map((diff, index) => ({ index, value: diff }))
                    .sort((a, b) => Math.abs(a.value) - Math.abs(b.value));
                let effectiveRank = this.rank;
                let tVoicePitch;
                if (this.currentDirection === 'up' || this.currentDirection === 'down') {
                    const filteredDifferences = sortedDifferences.filter(({ value }) => this.currentDirection === 'up' ? value >= 0 : value <= 0);
                    if (filteredDifferences.length === 0) {
                        // No notes in desired direction, use extreme note
                        tVoicePitch = this.currentDirection === 'up'
                            ? Math.max(...this.tChord)
                            : Math.min(...this.tChord);
                    }
                    else {
                        if (effectiveRank >= filteredDifferences.length) {
                            effectiveRank = filteredDifferences.length - 1;
                        }
                        const chosenIndex = filteredDifferences[effectiveRank].index;
                        tVoicePitch = this.tChord[chosenIndex];
                    }
                }
                else { // 'any'
                    if (effectiveRank >= sortedDifferences.length) {
                        effectiveRank = sortedDifferences.length - 1;
                    }
                    const chosenIndex = sortedDifferences[effectiveRank].index;
                    tVoicePitch = this.tChord[chosenIndex];
                }
                // Change direction if alternate
                if (this.isAlternate) {
                    this.currentDirection = this.currentDirection === 'up' ? 'down' : 'up';
                }
                tVoice.push({
                    ...note,
                    pitch: tVoicePitch
                });
            }
            return tVoice;
        }
    }

    /**
     * Musical utility functions matching the Python djalgo utils module
     */
    class MusicUtils {
        /**
         * Check input type of a sequence
         */
        static checkInput(sequence) {
            if (!Array.isArray(sequence))
                return 'unknown';
            if (sequence.length === 0)
                return 'list';
            const firstItem = sequence[0];
            if (Array.isArray(firstItem) || (typeof firstItem === 'object' && 'pitch' in firstItem)) {
                return 'list of tuples';
            }
            return 'list';
        }
        /**
         * Fill gaps with rests in a musical sequence
         */
        static fillGapsWithRests(notes, tolerance = 0.01) {
            if (notes.length === 0)
                return [];
            // Sort notes by offset
            const sortedNotes = [...notes].sort((a, b) => a.offset - b.offset);
            const result = [];
            let currentTime = 0;
            for (const note of sortedNotes) {
                // Check if there's a gap before this note
                if (note.offset > currentTime + tolerance) {
                    // Add a rest to fill the gap
                    result.push({
                        pitch: undefined, // Rest
                        duration: note.offset - currentTime,
                        offset: currentTime,
                        velocity: 0
                    });
                }
                result.push(note);
                currentTime = Math.max(currentTime, note.offset + note.duration);
            }
            return result;
        }
        /**
         * Set offsets according to durations (sequential timing)
         */
        static setOffsetsAccordingToDurations(notes) {
            let currentOffset = 0;
            return notes.map(note => {
                const newNote = {
                    ...note,
                    offset: currentOffset
                };
                currentOffset += note.duration;
                return newNote;
            });
        }
        /**
         * Convert CDE notation to MIDI (e.g., "C4" -> 60)
         */
        static cdeToMidi(note) {
            const noteRegex = /^([A-G][#b]?)(-?\d+)$/;
            const match = note.match(noteRegex);
            if (!match) {
                throw new Error(`Invalid note format: ${note}`);
            }
            const noteName = match[1];
            const octave = parseInt(match[2]);
            const noteToSemitone = {
                'C': 0, 'C#': 1, 'Db': 1, 'D': 2, 'D#': 3, 'Eb': 3,
                'E': 4, 'F': 5, 'F#': 6, 'Gb': 6, 'G': 7, 'G#': 8,
                'Ab': 8, 'A': 9, 'A#': 10, 'Bb': 10, 'B': 11
            };
            const semitone = noteToSemitone[noteName];
            if (semitone === undefined) {
                throw new Error(`Unknown note name: ${noteName}`);
            }
            return (octave + 1) * 12 + semitone;
        }
        /**
         * Convert MIDI to CDE notation (e.g., 60 -> "C4")
         */
        static midiToCde(midi) {
            const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
            const octave = Math.floor(midi / 12) - 1;
            const noteIndex = midi % 12;
            return noteNames[noteIndex] + octave;
        }
        /**
         * Get octave from MIDI note number
         */
        static getOctave(midi) {
            return Math.floor(midi / 12) - 1;
        }
        /**
         * Get degree from pitch in a scale
         */
        static getDegreeFromPitch(pitch, scaleList, tonicPitch) {
            // Convert to pitch classes
            const pitchClass = ((pitch % 12) + 12) % 12;
            const tonicClass = ((tonicPitch % 12) + 12) % 12;
            // Find the closest scale degree
            let minDistance = Infinity;
            let closestDegree = 1;
            for (let i = 0; i < scaleList.length; i++) {
                const scaleNoteClass = ((scaleList[i] % 12) + 12) % 12;
                const scaleDegreeClass = ((scaleNoteClass - tonicClass + 12) % 12);
                const distance = Math.abs(pitchClass - scaleDegreeClass);
                if (distance < minDistance) {
                    minDistance = distance;
                    closestDegree = i + 1; // Scale degrees start from 1
                }
            }
            // Adjust for octave
            const octaveOffset = Math.floor((pitch - tonicPitch) / 12) * scaleList.length;
            return closestDegree + octaveOffset;
        }
        /**
         * Quantize timing to a grid
         */
        static quantize(notes, gridDivision = 16) {
            const gridSize = 1 / gridDivision;
            return notes.map(note => ({
                ...note,
                offset: Math.round(note.offset / gridSize) * gridSize
            }));
        }
        /**
         * Transpose a sequence by semitones
         */
        static transpose(notes, semitones) {
            return notes.map(note => ({
                ...note,
                pitch: note.pitch !== undefined ? note.pitch + semitones : undefined
            }));
        }
        /**
         * Invert a melody around a pivot point
         */
        static invert(notes, pivot) {
            const pitches = notes.map(n => n.pitch).filter(p => p !== undefined);
            if (pitches.length === 0)
                return notes;
            const actualPivot = pivot !== undefined ? pivot :
                (Math.max(...pitches) + Math.min(...pitches)) / 2;
            return notes.map(note => ({
                ...note,
                pitch: note.pitch !== undefined ? 2 * actualPivot - note.pitch : undefined
            }));
        }
        /**
         * Retrograde (reverse) a sequence
         */
        static retrograde(notes) {
            const reversed = [...notes].reverse();
            notes.reduce((sum, note) => Math.max(sum, note.offset + note.duration), 0);
            return this.setOffsetsAccordingToDurations(reversed.map(note => ({
                ...note,
                offset: 0 // Will be recalculated
            })));
        }
        /**
         * Create augmentation (stretch) or diminution (compress) of durations
         */
        static augment(notes, factor) {
            let currentOffset = 0;
            return notes.map(note => {
                const newNote = {
                    ...note,
                    duration: note.duration * factor,
                    offset: currentOffset
                };
                currentOffset += newNote.duration;
                return newNote;
            });
        }
        /**
         * Remove duplicate consecutive notes
         */
        static removeDuplicates(notes) {
            if (notes.length <= 1)
                return notes;
            const result = [notes[0]];
            for (let i = 1; i < notes.length; i++) {
                const current = notes[i];
                const previous = result[result.length - 1];
                if (current.pitch !== previous.pitch ||
                    Math.abs(current.offset - (previous.offset + previous.duration)) > 0.01) {
                    result.push(current);
                }
                else {
                    // Extend duration of previous note instead of adding duplicate
                    previous.duration += current.duration;
                }
            }
            return result;
        }
        /**
         * Split long notes into smaller ones
         */
        static splitLongNotes(notes, maxDuration) {
            const result = [];
            for (const note of notes) {
                if (note.duration <= maxDuration) {
                    result.push(note);
                }
                else {
                    // Split into multiple notes
                    const numSplits = Math.ceil(note.duration / maxDuration);
                    const splitDuration = note.duration / numSplits;
                    for (let i = 0; i < numSplits; i++) {
                        result.push({
                            ...note,
                            duration: splitDuration,
                            offset: note.offset + i * splitDuration
                        });
                    }
                }
            }
            return result;
        }
        /**
         * Calculate the total duration of a sequence
         */
        static getTotalDuration(notes) {
            if (notes.length === 0)
                return 0;
            return Math.max(...notes.map(note => note.offset + note.duration));
        }
        /**
         * Get pitch range (lowest and highest pitches)
         */
        static getPitchRange(notes) {
            const pitches = notes.map(n => n.pitch).filter(p => p !== undefined);
            if (pitches.length === 0)
                return null;
            return {
                min: Math.min(...pitches),
                max: Math.max(...pitches)
            };
        }
        /**
         * Normalize velocities to a range
         */
        static normalizeVelocities(notes, min = 0.1, max = 1.0) {
            const velocities = notes.map(n => n.velocity || 0.8);
            const currentMin = Math.min(...velocities);
            const currentMax = Math.max(...velocities);
            const range = currentMax - currentMin;
            if (range === 0) {
                return notes.map(note => ({ ...note, velocity: (min + max) / 2 }));
            }
            return notes.map(note => {
                const normalizedVelocity = ((note.velocity || 0.8) - currentMin) / range;
                return {
                    ...note,
                    velocity: min + normalizedVelocity * (max - min)
                };
            });
        }
        /**
         * Create a rhythmic pattern from note onsets
         */
        static extractRhythm(notes) {
            return notes.map(note => note.offset).sort((a, b) => a - b);
        }
        /**
         * Apply swing timing to notes
         */
        static applySwing(notes, swingRatio = 0.67) {
            const beatDuration = 1; // Assuming quarter note beat
            const subdivisionDuration = beatDuration / 2;
            return notes.map(note => {
                const beatPosition = note.offset % beatDuration;
                const isOffBeat = Math.abs(beatPosition - subdivisionDuration) < 0.01;
                if (isOffBeat) {
                    const swingOffset = subdivisionDuration * swingRatio;
                    const beatStart = note.offset - beatPosition;
                    return {
                        ...note,
                        offset: beatStart + swingOffset
                    };
                }
                return note;
            });
        }
    }

    class PlotRenderer {
        /**
         * Create a line plot
         */
        static async line(data, options = {}, elementId = 'plot') {
            const { title, width = 640, height = 400, color = 'steelblue', xTitle = 'X', yTitle = 'Y' } = options;
            const trace = {
                x: data.x,
                y: data.y,
                type: 'scatter',
                mode: 'lines',
                line: { color, width: 2 },
                name: 'Line'
            };
            const layout = {
                title: title ? { text: title } : undefined,
                width,
                height,
                xaxis: { title: { text: xTitle } },
                yaxis: { title: { text: yTitle } }
            };
            await Plotly__namespace.newPlot(elementId, [trace], layout);
        }
        /**
         * Create a scatter plot
         */
        static async scatter(data, options = {}, elementId = 'plot') {
            const { title, width = 640, height = 400, color = 'steelblue', xTitle = 'X', yTitle = 'Y' } = options;
            const trace = {
                x: data.x,
                y: data.y,
                type: 'scatter',
                mode: 'markers',
                marker: {
                    color: data.color || color,
                    size: data.size || 8
                },
                name: 'Scatter'
            };
            const layout = {
                title: title ? { text: title } : undefined,
                width,
                height,
                xaxis: { title: { text: xTitle } },
                yaxis: { title: { text: yTitle } }
            };
            await Plotly__namespace.newPlot(elementId, [trace], layout);
        }
        /**
         * Create a heatmap from 2D matrix data
         */
        static async heatmap(matrix, options = {}, elementId = 'plot') {
            const { title, width = 640, height = 400, colorScale = 'Viridis', xTitle = 'X', yTitle = 'Y' } = options;
            const trace = {
                z: matrix,
                type: 'heatmap',
                colorscale: colorScale,
                showscale: true
            };
            const layout = {
                title: title ? { text: title } : undefined,
                width,
                height,
                xaxis: { title: { text: xTitle } },
                yaxis: { title: { text: yTitle } }
            };
            await Plotly__namespace.newPlot(elementId, [trace], layout);
        }
        /**
         * Create a bar chart
         */
        static async bar(data, options = {}, elementId = 'plot') {
            const { title, width = 640, height = 400, color = 'steelblue', xTitle = 'X', yTitle = 'Y' } = options;
            const trace = {
                x: data.x.map(x => x.toString()),
                y: data.y,
                type: 'bar',
                marker: { color: data.color || color },
                name: 'Bar'
            };
            const layout = {
                title: title ? { text: title } : undefined,
                width,
                height,
                xaxis: { title: { text: xTitle } },
                yaxis: { title: { text: yTitle } }
            };
            await Plotly__namespace.newPlot(elementId, [trace], layout);
        }
        /**
         * Create a polar/radar plot for polyloops
         */
        static async radar(data, options = {}, elementId = 'plot') {
            const { title, width = 400, height = 400, color = 'steelblue' } = options;
            // Close the loop by adding first point at the end
            const angles = [...data.x, data.x[0]];
            const values = [...data.y, data.y[0]];
            const trace = {
                r: values,
                theta: angles,
                type: 'scatterpolar',
                mode: 'lines+markers',
                fill: 'toself',
                line: { color },
                marker: { color, size: 8 },
                name: 'Radar'
            };
            const layout = {
                title: title ? { text: title } : undefined,
                width,
                height,
                polar: {
                    radialaxis: {
                        visible: true,
                        range: [0, Math.max(...data.y) * 1.1]
                    }
                }
            };
            await Plotly__namespace.newPlot(elementId, [trace], layout);
        }
        /**
         * Create a time series plot
         */
        static async timeSeries(data, options = {}, elementId = 'plot') {
            const { title, width = 640, height = 400, xTitle = 'Time', yTitle = 'Value' } = options;
            const trace = {
                x: data.x,
                y: data.y,
                type: 'scatter',
                mode: 'lines',
                line: { width: 2 },
                name: 'Time Series'
            };
            const layout = {
                title: title ? { text: title } : undefined,
                width,
                height,
                xaxis: { title: { text: xTitle } },
                yaxis: { title: { text: yTitle } }
            };
            await Plotly__namespace.newPlot(elementId, [trace], layout);
        }
        /**
         * Create a matrix visualization (for cellular automata)
         */
        static async matrix(matrix, options = {}, elementId = 'plot') {
            const { title, width = 640, height = 400, xTitle = 'Position', yTitle = 'Time Step' } = options;
            // Flip matrix vertically for proper display
            const flippedMatrix = matrix.slice().reverse();
            const trace = {
                z: flippedMatrix,
                type: 'heatmap',
                colorscale: [[0, 'white'], [1, 'black']],
                showscale: false,
                hoverinfo: 'none'
            };
            const layout = {
                title: title ? { text: title } : undefined,
                width,
                height,
                xaxis: {
                    title: { text: xTitle },
                    showticklabels: false
                },
                yaxis: {
                    title: { text: yTitle },
                    showticklabels: false
                }
            };
            await Plotly__namespace.newPlot(elementId, [trace], layout);
        }
        /**
         * Create a 3D surface plot
         */
        static async surface(data, options = {}, elementId = 'plot') {
            const { title, width = 640, height = 400, colorScale = 'Viridis', xTitle = 'X', yTitle = 'Y', zTitle = 'Z' } = options;
            const trace = {
                x: data.x,
                y: data.y,
                z: data.z,
                type: 'surface',
                colorscale: colorScale
            };
            const layout = {
                title: title ? { text: title } : undefined,
                width,
                height,
                scene: {
                    xaxis: { title: { text: xTitle } },
                    yaxis: { title: { text: yTitle } },
                    zaxis: { title: { text: zTitle } }
                }
            };
            await Plotly__namespace.newPlot(elementId, [trace], layout);
        }
        /**
         * Create multiple line plot
         */
        static async multiLine(datasets, options = {}, elementId = 'plot') {
            const { title, width = 640, height = 400, xTitle = 'X', yTitle = 'Y' } = options;
            const traces = datasets.map((data, i) => ({
                x: data.x,
                y: data.y,
                type: 'scatter',
                mode: 'lines',
                name: `Series ${i + 1}`,
                line: { width: 2 }
            }));
            const layout = {
                title: title ? { text: title } : undefined,
                width,
                height,
                xaxis: { title: { text: xTitle } },
                yaxis: { title: { text: yTitle } }
            };
            await Plotly__namespace.newPlot(elementId, traces, layout);
        }
        /**
         * Create histogram
         */
        static async histogram(data, options = {}, elementId = 'plot') {
            const { title, width = 640, height = 400, color = 'steelblue', xTitle = 'Value', yTitle = 'Frequency' } = options;
            const trace = {
                x: data.x,
                type: 'histogram',
                marker: { color },
                name: 'Histogram'
            };
            const layout = {
                title: title ? { text: title } : undefined,
                width,
                height,
                xaxis: { title: { text: xTitle } },
                yaxis: { title: { text: yTitle } }
            };
            await Plotly__namespace.newPlot(elementId, [trace], layout);
        }
        /**
         * Create box plot
         */
        static async boxPlot(data, options = {}, elementId = 'plot') {
            const { title, width = 640, height = 400, yTitle = 'Value' } = options;
            const traces = data.map((dataset, i) => ({
                y: dataset.y,
                type: 'box',
                name: `Dataset ${i + 1}`
            }));
            const layout = {
                title: title ? { text: title } : undefined,
                width,
                height,
                yaxis: { title: { text: yTitle } }
            };
            await Plotly__namespace.newPlot(elementId, traces, layout);
        }
        /**
         * Create a violin plot
         */
        static async violin(data, options = {}, elementId = 'plot') {
            const { title, width = 640, height = 400, yTitle = 'Value' } = options;
            const traces = data.map((dataset, i) => ({
                y: dataset.y,
                type: 'violin',
                name: `Dataset ${i + 1}`,
                box: { visible: true },
                meanline: { visible: true }
            }));
            const layout = {
                title: title ? { text: title } : undefined,
                width,
                height,
                yaxis: { title: { text: yTitle } }
            };
            await Plotly__namespace.newPlot(elementId, traces, layout);
        }
        /**
         * Create a contour plot
         */
        static async contour(data, options = {}, elementId = 'plot') {
            const { title, width = 640, height = 400, colorScale = 'Viridis', xTitle = 'X', yTitle = 'Y' } = options;
            const trace = {
                x: data.x,
                y: data.y,
                z: data.z,
                type: 'contour',
                colorscale: colorScale,
                showscale: true
            };
            const layout = {
                title: title ? { text: title } : undefined,
                width,
                height,
                xaxis: { title: { text: xTitle } },
                yaxis: { title: { text: yTitle } }
            };
            await Plotly__namespace.newPlot(elementId, [trace], layout);
        }
        /**
         * Create a 3D scatter plot
         */
        static async scatter3D(data, options = {}, elementId = 'plot') {
            const { title, width = 640, height = 400, color = 'steelblue', xTitle = 'X', yTitle = 'Y', zTitle = 'Z' } = options;
            const trace = {
                x: data.x,
                y: data.y,
                z: data.z,
                type: 'scatter3d',
                mode: 'markers',
                marker: {
                    color: data.color || color,
                    size: 4,
                    opacity: 0.8
                },
                name: '3D Scatter'
            };
            const layout = {
                title: title ? { text: title } : undefined,
                width,
                height,
                scene: {
                    xaxis: { title: { text: xTitle } },
                    yaxis: { title: { text: yTitle } },
                    zaxis: { title: { text: zTitle } }
                }
            };
            await Plotly__namespace.newPlot(elementId, [trace], layout);
        }
        /**
         * Create animated plot with frames
         */
        static async animate(frames, options = {}, elementId = 'plot') {
            const { title, width = 640, height = 400, duration = 500, transition = 100 } = options;
            const initialData = frames[0]?.data || [];
            const layout = {
                title: title ? { text: title } : undefined,
                width,
                height,
                updatemenus: [{
                        type: 'buttons',
                        showactive: false,
                        buttons: [{
                                label: 'Play',
                                method: 'animate',
                                args: [null, {
                                        frame: { duration, redraw: true },
                                        transition: { duration: transition },
                                        fromcurrent: true
                                    }]
                            }, {
                                label: 'Pause',
                                method: 'animate',
                                args: [[null], {
                                        frame: { duration: 0, redraw: false },
                                        mode: 'immediate',
                                        transition: { duration: 0 }
                                    }]
                            }]
                    }],
                ...frames[0]?.layout
            };
            const plotlyFrames = frames.map((frame, i) => ({
                name: i.toString(),
                data: frame.data,
                layout: frame.layout
            }));
            await Plotly__namespace.newPlot(elementId, initialData, layout);
            await Plotly__namespace.addFrames(elementId, plotlyFrames);
        }
        /**
         * Create candlestick chart
         */
        static async candlestick(data, options = {}, elementId = 'plot') {
            const { title, width = 640, height = 400, xTitle = 'Time', yTitle = 'Price' } = options;
            const trace = {
                x: data.x,
                open: data.open,
                high: data.high,
                low: data.low,
                close: data.close,
                type: 'candlestick',
                name: 'OHLC'
            };
            const layout = {
                title: title ? { text: title } : undefined,
                width,
                height,
                xaxis: { title: { text: xTitle } },
                yaxis: { title: { text: yTitle } }
            };
            await Plotly__namespace.newPlot(elementId, [trace], layout);
        }
    }

    class CAVisualizer {
        /**
         * Visualize cellular automata evolution over time
         */
        static plotEvolution(history, options = {}) {
            const { title = 'Cellular Automata Evolution', width = 600, height = 400, colorScheme = 'binary', showAxis = false } = options;
            // Convert to plot data format
            const plotData = [];
            history.forEach((row, timeStep) => {
                row.forEach((cell, position) => {
                    plotData.push({
                        x: position,
                        y: history.length - 1 - timeStep, // Flip Y to show time progression downward
                        value: cell
                    });
                });
            });
            return PlotRenderer.matrix(history, {
                title,
                width,
                height,
                showAxis
            });
        }
        /**
         * Visualize a single CA generation
         */
        static plotGeneration(generation, options = {}) {
            const { title = 'CA Generation', width = 600, height = 100,
            // colorScheme = 'binary' // supprimé car inutilisé
             } = options;
            const plotData = {
                x: generation.map((_, i) => i),
                y: generation.map(() => 0),
                color: generation.map(cell => cell ? 'black' : 'white')
            };
            return PlotRenderer.scatter(plotData, {
                title,
                width,
                height,
                showAxis: false
            });
        }
        /**
         * Compare multiple CA rules side by side
         */
        static compareRules(rules, options = {}) {
            const { width = 300, height = 200, colorScheme = 'binary' } = options;
            return rules.map(({ ruleNumber, history }) => this.plotEvolution(history, {
                title: `Rule ${ruleNumber}`,
                width,
                height,
                colorScheme,
                showAxis: false
            }));
        }
        /**
         * Create an animated visualization data structure
         */
        static createAnimationData(history) {
            return history.map((generation, frame) => ({
                frame,
                data: generation.map((cell, x) => ({
                    x,
                    y: 0,
                    value: cell
                }))
            }));
        }
        /**
         * Extract specific patterns from CA history
         */
        static extractPatterns(history) {
            const oscillators = [];
            const gliders = [];
            const stillLifes = [];
            // Simple pattern detection (can be enhanced)
            const width = history[0]?.length || 0;
            // Check for oscillators (patterns that repeat)
            for (let pos = 0; pos < width; pos++) {
                const column = history.map(row => row[pos]);
                const period = this.findPeriod(column.filter((v) => v !== undefined));
                if (period > 1 && period < 10) {
                    oscillators.push({ position: pos, period });
                }
            }
            // Check for still lifes (unchanging patterns)
            if (history.length > 5) {
                const lastGen = history[history.length - 1];
                const prevGen = history[history.length - 2];
                if (lastGen && prevGen) {
                    for (let pos = 0; pos < width - 3; pos++) {
                        const isStable = lastGen.slice(pos, pos + 3).every((cell, i) => cell === prevGen[pos + i] && cell === 1);
                        if (isStable) {
                            stillLifes.push({ position: pos, width: 3 });
                        }
                    }
                }
            }
            return { oscillators, gliders, stillLifes };
        }
        /**
         * Find the period of a repeating sequence
         */
        static findPeriod(sequence) {
            if (sequence.length < 4)
                return 1;
            for (let period = 1; period <= Math.floor(sequence.length / 2); period++) {
                let isRepeating = true;
                for (let i = period; i < sequence.length; i++) {
                    if (sequence[i] !== sequence[i - period]) {
                        isRepeating = false;
                        break;
                    }
                }
                if (isRepeating)
                    return period;
            }
            return 1;
        }
        /**
         * Create a density plot showing CA activity over time
         */
        static plotDensity(history, options = {}) {
            const { title = 'CA Density Over Time', width = 600, height = 300 } = options;
            const densityData = history.map((generation, time) => ({
                time,
                density: generation.reduce((sum, cell) => sum + cell, 0) / generation.length
            }));
            const plotData = {
                x: densityData.map(d => d.time),
                y: densityData.map(d => d.density)
            };
            return PlotRenderer.line(plotData, {
                title,
                width,
                height,
                color: 'steelblue',
                showAxis: true
            });
        }
        /**
         * Create a spacetime diagram with enhanced visualization
         */
        static plotSpacetime(history, options = {}) {
            const { title = 'Spacetime Diagram', width = 600, height = 400, showGrid = false } = options;
            // Enhanced visualization with cell borders and colors
            const plotData = [];
            history.forEach((row, timeStep) => {
                row.forEach((cell, position) => {
                    plotData.push({
                        x: position,
                        y: history.length - 1 - timeStep,
                        value: cell,
                        border: showGrid
                    });
                });
            });
            return PlotRenderer.matrix(history, {
                title,
                width,
                height,
                showAxis: false
            });
        }
    }

    class PolyloopVisualizer {
        /**
         * Create a polar radar chart visualization of polyloops using Plotly.js
         * Mirrors the functionality of the Python implementation
         */
        static plotPolyloop(layers, options = {}) {
            const { pulse = 1 / 4, colors, measureLength = 4, container = 'polyloop-plot', title = 'Polyloop Visualization' } = options;
            // Generate colors if not provided
            const layerColors = colors || this.generateColors(layers.length);
            const traces = [];
            const layerNames = layers.map(layer => layer.label);
            // Create traces for each layer
            layers.forEach((layer, layerIndex) => {
                const activePoints = layer.points.filter(point => point.active);
                if (activePoints.length === 0)
                    return;
                // Create duration arcs for each active point
                activePoints.forEach(point => {
                    const startTheta = point.angle;
                    const duration = this.calculateDuration(point, layer, measureLength);
                    const durationTheta = duration * 360 / measureLength;
                    // Generate arc points
                    const arcPoints = this.generateArcPoints(startTheta, durationTheta, 100);
                    const radius = Array(100).fill(layers.length - layerIndex - 1);
                    // Duration arc trace
                    traces.push({
                        type: 'scatterpolar',
                        r: radius,
                        theta: arcPoints,
                        mode: 'lines',
                        line: {
                            color: 'rgba(60, 60, 60, 0.65)',
                            width: 8
                        },
                        name: `${layer.label} Duration`,
                        showlegend: false
                    });
                    // Start and end markers
                    [startTheta, (startTheta + durationTheta) % 360].forEach(theta => {
                        traces.push({
                            type: 'scatterpolar',
                            r: [layers.length - layerIndex - 0.9, layers.length - layerIndex - 1.1],
                            theta: [theta, theta],
                            mode: 'lines',
                            line: {
                                color: 'Black',
                                width: 3
                            },
                            name: `${layer.label} Start/End`,
                            showlegend: false
                        });
                    });
                });
                // Main layer shape
                if (activePoints.length > 0) {
                    const startThetas = activePoints.map(point => point.angle);
                    startThetas.push(startThetas[0]); // Close the loop
                    traces.push({
                        type: 'scatterpolar',
                        r: Array(startThetas.length).fill(layers.length - layerIndex - 1),
                        theta: startThetas,
                        mode: 'lines',
                        line: {
                            color: 'rgba(0, 0, 0, 0.65)',
                            width: 1
                        },
                        fill: 'toself',
                        fillcolor: layerColors[layerIndex % layerColors.length],
                        name: layer.label,
                        showlegend: true
                    });
                }
            });
            // Reverse traces to match Python implementation layering
            const finalTraces = [...traces].reverse();
            // Generate tick values and labels
            const tickvals = this.generateTickValues(measureLength, pulse);
            const ticktext = this.generateTickLabels(measureLength, pulse);
            const radialTickvals = Array.from({ length: layers.length }, (_, i) => i);
            const layout = {
                title: { text: title },
                polar: {
                    radialaxis: {
                        visible: true,
                        range: [layers.length, -0.1],
                        tickvals: radialTickvals,
                        ticktext: layerNames
                    },
                    angularaxis: {
                        tickvals: tickvals,
                        ticktext: ticktext,
                        direction: 'clockwise',
                        rotation: 90
                    }
                },
                template: 'none',
                showlegend: true,
                annotations: [{
                        x: 0.5,
                        y: 0.5,
                        text: '�',
                        showarrow: false,
                        font: {
                            size: 30,
                            color: 'White'
                        },
                        xref: 'paper',
                        yref: 'paper'
                    }]
            };
            const config = {
                responsive: true,
                displayModeBar: true
            };
            return Plotly__namespace.newPlot(container, finalTraces, layout, config);
        }
        /**
         * Generate equally spaced colors using HSV color space
         */
        static generateColors(count) {
            const colors = [];
            for (let i = 0; i < count; i++) {
                const hue = i / count;
                const rgb = this.hsvToRgb(hue, 1, 1);
                colors.push(`rgba(${Math.round(rgb.r * 255)}, ${Math.round(rgb.g * 255)}, ${Math.round(rgb.b * 255)}, 0.5)`);
            }
            return colors;
        }
        /**
         * Convert HSV to RGB color space
         */
        static hsvToRgb(h, s, v) {
            let r, g, b;
            const i = Math.floor(h * 6);
            const f = h * 6 - i;
            const p = v * (1 - s);
            const q = v * (1 - f * s);
            const t = v * (1 - (1 - f) * s);
            switch (i % 6) {
                case 0:
                    r = v;
                    g = t;
                    b = p;
                    break;
                case 1:
                    r = q;
                    g = v;
                    b = p;
                    break;
                case 2:
                    r = p;
                    g = v;
                    b = t;
                    break;
                case 3:
                    r = p;
                    g = q;
                    b = v;
                    break;
                case 4:
                    r = t;
                    g = p;
                    b = v;
                    break;
                case 5:
                    r = v;
                    g = p;
                    b = q;
                    break;
                default: r = g = b = 0;
            }
            return { r, g, b };
        }
        /**
         * Generate arc points for smooth curves
         */
        static generateArcPoints(startTheta, durationTheta, numPoints) {
            const points = [];
            for (let i = 0; i < numPoints; i++) {
                const theta = startTheta + (i / (numPoints - 1)) * durationTheta;
                points.push(theta % 360);
            }
            return points;
        }
        /**
         * Calculate duration for a point (simplified for this implementation)
         */
        static calculateDuration(point, layer, measureLength) {
            // For simplicity, assume equal duration for all points
            // In a more sophisticated implementation, this could be derived from the point data
            return measureLength / layer.divisions;
        }
        /**
         * Generate tick values for angular axis
         */
        static generateTickValues(measureLength, pulse) {
            const tickvals = [];
            const numTicks = Math.floor(measureLength / pulse);
            for (let i = 0; i < numTicks; i++) {
                tickvals.push((i * 360) / numTicks);
            }
            return tickvals;
        }
        /**
         * Generate tick labels for angular axis
         */
        static generateTickLabels(measureLength, pulse) {
            const ticktext = [];
            const numTicks = Math.floor(measureLength / pulse);
            for (let i = 0; i < numTicks; i++) {
                const beat = (i * pulse) % measureLength;
                ticktext.push(beat.toString());
            }
            return ticktext;
        }
        /**
         * Create a timeline visualization of the polyloop triggers
         */
        static plotTimeline(layers, duration = 8, options = {}) {
            const { container = 'polyloop-timeline', title = 'Polyloop Timeline', colors } = options;
            const layerColors = colors || this.generateColors(layers.length);
            const traces = [];
            layers.forEach((layer, layerIndex) => {
                const activePoints = layer.points.filter(point => point.active);
                const times = [];
                const pitches = [];
                // Convert angles to time positions
                activePoints.forEach(point => {
                    const time = (point.angle / 360) * 4; // Assuming 4-beat measure
                    times.push(time);
                    pitches.push(point.pitch || 60);
                });
                if (times.length > 0) {
                    traces.push({
                        type: 'scatter',
                        x: times,
                        y: pitches,
                        mode: 'markers',
                        marker: {
                            color: layerColors[layerIndex % layerColors.length],
                            size: 10
                        },
                        name: layer.label
                    });
                }
            });
            const layout = {
                title: { text: title },
                xaxis: {
                    title: 'Time (beats)',
                    range: [0, duration]
                },
                yaxis: {
                    title: 'Pitch (MIDI)',
                    range: [20, 120]
                },
                showlegend: true
            };
            const config = {
                responsive: true,
                displayModeBar: true
            };
            return Plotly__namespace.newPlot(container, traces, layout, config);
        }
        /**
         * Create animated frames of the polyloop visualization
         */
        static plotAnimated(layers, numFrames = 12, options = {}) {
            const frames = [];
            for (let frame = 0; frame < numFrames; frame++) {
                const rotationAngle = (frame / numFrames) * 360;
                // Create rotated layers
                const rotatedLayers = layers.map(layer => ({
                    ...layer,
                    points: layer.points.map(point => ({
                        ...point,
                        angle: (point.angle + rotationAngle * layer.speed) % 360
                    }))
                }));
                const frameOptions = {
                    ...options,
                    container: `${options.container || 'polyloop-plot'}-frame-${frame}`,
                    title: `${options.title || 'Polyloop'} - Frame ${frame + 1}`
                };
                frames.push(this.plotPolyloop(rotatedLayers, frameOptions));
            }
            return Promise.all(frames);
        }
        /**
         * Convert polyloop data to format compatible with Python implementation
         */
        static convertToPolyloopData(layers) {
            const polyloopData = {};
            layers.forEach(layer => {
                const notes = layer.points.map(point => [
                    point.active ? point.pitch || null : null,
                    4 / layer.divisions, // duration
                    point.angle / 360 * 4 // offset in beats
                ]);
                polyloopData[layer.label] = notes;
            });
            return polyloopData;
        }
    }

    class FractalVisualizer {
        /**
         * Visualize logistic map bifurcation diagram
         */
        static plotLogisticMap(rMin = 2.8, rMax = 4.0, rSteps = 1000, iterations = 1000, skipTransient = 500, options = {}) {
            const { title = 'Logistic Map Bifurcation', width = 800, height = 600, colorScheme = 'viridis' } = options;
            const plotData = [];
            for (let i = 0; i < rSteps; i++) {
                const r = rMin + (i / rSteps) * (rMax - rMin);
                let x = 0.5; // Initial condition
                // Skip transient behavior
                for (let j = 0; j < skipTransient; j++) {
                    x = r * x * (1 - x);
                }
                // Collect attractors
                const attractors = new Set();
                for (let j = 0; j < iterations; j++) {
                    x = r * x * (1 - x);
                    attractors.add(Math.round(x * 10000) / 10000); // Round for stability
                }
                // Plot each attractor value
                attractors.forEach(value => {
                    plotData.push({
                        x: r,
                        y: value,
                        color: this.getColorForValue(value, colorScheme)
                    });
                });
            }
            const data = {
                x: plotData.map(d => d.x),
                y: plotData.map(d => d.y),
                color: plotData.map(d => d.color)
            };
            return PlotRenderer.scatter(data, {
                title,
                width,
                height,
                showAxis: true
            });
        }
        /**
         * Generate Mandelbrot set visualization
         */
        static plotMandelbrot(xMin = -2.5, xMax = 1.0, yMin = -1.25, yMax = 1.25, resolution = 400, maxIterations = 100, options = {}) {
            const { title = 'Mandelbrot Set', width = 600, height = 600, colorScheme = 'plasma' } = options;
            const matrix = [];
            const dx = (xMax - xMin) / resolution;
            const dy = (yMax - yMin) / resolution;
            for (let py = 0; py < resolution; py++) {
                const row = [];
                const y = yMin + py * dy;
                for (let px = 0; px < resolution; px++) {
                    const x = xMin + px * dx;
                    const iterations = this.mandelbrotIterations(x, y, maxIterations);
                    row.push(iterations / maxIterations);
                }
                matrix.push(row);
            }
            return PlotRenderer.heatmap(matrix, {
                title,
                width,
                height,
                showAxis: false
            });
        }
        /**
         * Create Julia set visualization
         */
        static plotJuliaSet(cReal = -0.7, cImag = 0.27015, xMin = -1.5, xMax = 1.5, yMin = -1.5, yMax = 1.5, resolution = 400, maxIterations = 100, options = {}) {
            const { title = `Julia Set (c = ${cReal} + ${cImag}i)`, width = 600, height = 600, colorScheme = 'turbo' } = options;
            const matrix = [];
            const dx = (xMax - xMin) / resolution;
            const dy = (yMax - yMin) / resolution;
            for (let py = 0; py < resolution; py++) {
                const row = [];
                const y = yMin + py * dy;
                for (let px = 0; px < resolution; px++) {
                    const x = xMin + px * dx;
                    const iterations = this.juliaIterations(x, y, cReal, cImag, maxIterations);
                    row.push(iterations / maxIterations);
                }
                matrix.push(row);
            }
            return PlotRenderer.heatmap(matrix, {
                title,
                width,
                height,
                showAxis: false
            });
        }
        /**
         * Visualize strange attractors (Lorenz, Rossler, etc.)
         */
        static plotAttractor(type, steps = 10000, options = {}) {
            const { title = `${type.charAt(0).toUpperCase() + type.slice(1)} Attractor`, width = 600, height = 600, colorScheme = 'viridis' } = options;
            const points = this.generateAttractor(type, steps);
            const data = {
                x: points.map(p => p.x),
                y: points.map(p => p.y),
                color: points.map((_, i) => this.getColorForValue(i / points.length, colorScheme))
            };
            return PlotRenderer.scatter(data, {
                title,
                width,
                height,
                showAxis: false
            });
        }
        /**
         * Create a chaos game visualization (Sierpinski triangle, etc.)
         */
        static plotChaosGame(vertices, ratio = 0.5, iterations = 10000, options = {}) {
            const { title = 'Chaos Game', width = 600, height = 600 } = options;
            const points = [];
            let current = { x: 0.5, y: 0.5 }; // Starting point
            for (let i = 0; i < iterations; i++) {
                const vertex = vertices[Math.floor(Math.random() * vertices.length)];
                current = {
                    x: current.x + ratio * (vertex.x - current.x),
                    y: current.y + ratio * (vertex.y - current.y)
                };
                if (i > 100) { // Skip initial transient
                    points.push({ ...current });
                }
            }
            const data = {
                x: points.map(p => p.x),
                y: points.map(p => p.y),
                color: points.map(() => 'steelblue')
            };
            return PlotRenderer.scatter(data, {
                title,
                width,
                height,
                showAxis: false
            });
        }
        /**
         * Plot fractal dimension analysis
         */
        static plotFractalDimension(data, options = {}) {
            const { title = 'Fractal Dimension Analysis', width = 600, height = 400 } = options;
            // Box-counting method
            const scales = [];
            const counts = [];
            for (let scale = 1; scale <= data.length / 10; scale *= 2) {
                const boxCount = this.boxCount(data, scale);
                scales.push(Math.log(1 / scale));
                counts.push(Math.log(boxCount));
            }
            const plotData = {
                x: scales,
                y: counts
            };
            return PlotRenderer.line(plotData, {
                title,
                width,
                height,
                showAxis: true
            });
        }
        /**
         * Create a phase space plot for time series
         */
        static plotPhaseSpace(data, delay = 1, embedding = 2, options = {}) {
            const { title = 'Phase Space Reconstruction', width = 600, height = 600, colorScheme = 'viridis' } = options;
            const points = [];
            for (let i = 0; i < data.length - delay * (embedding - 1); i++) {
                if (embedding === 2) {
                    points.push({
                        x: data[i],
                        y: data[i + delay]
                    });
                }
                else if (embedding === 3) {
                    points.push({
                        x: data[i],
                        y: data[i + delay],
                        z: data[i + 2 * delay]
                    });
                }
            }
            const plotData = {
                x: points.map(p => p.x),
                y: points.map(p => p.y),
                color: points.map((_, i) => this.getColorForValue(i / points.length, colorScheme))
            };
            return PlotRenderer.scatter(plotData, {
                title,
                width,
                height,
                showAxis: true
            });
        }
        /**
         * Helper: Calculate Mandelbrot iterations
         */
        static mandelbrotIterations(x, y, maxIterations) {
            let zx = 0;
            let zy = 0;
            let iteration = 0;
            while (zx * zx + zy * zy < 4 && iteration < maxIterations) {
                const temp = zx * zx - zy * zy + x;
                zy = 2 * zx * zy + y;
                zx = temp;
                iteration++;
            }
            return iteration;
        }
        /**
         * Helper: Calculate Julia set iterations
         */
        static juliaIterations(x, y, cReal, cImag, maxIterations) {
            let zx = x;
            let zy = y;
            let iteration = 0;
            while (zx * zx + zy * zy < 4 && iteration < maxIterations) {
                const temp = zx * zx - zy * zy + cReal;
                zy = 2 * zx * zy + cImag;
                zx = temp;
                iteration++;
            }
            return iteration;
        }
        /**
         * Helper: Generate strange attractor points
         */
        static generateAttractor(type, steps) {
            const points = [];
            if (type === 'lorenz') {
                let x = 1, y = 1, z = 1;
                const sigma = 10, rho = 28, beta = 8 / 3;
                const dt = 0.01;
                for (let i = 0; i < steps; i++) {
                    const dx = sigma * (y - x);
                    const dy = x * (rho - z) - y;
                    const dz = x * y - beta * z;
                    x += dx * dt;
                    y += dy * dt;
                    z += dz * dt;
                    points.push({ x, y, z });
                }
            }
            else if (type === 'rossler') {
                let x = 1, y = 1, z = 1;
                const a = 0.2, b = 0.2, c = 5.7;
                const dt = 0.01;
                for (let i = 0; i < steps; i++) {
                    const dx = -y - z;
                    const dy = x + a * y;
                    const dz = b + z * (x - c);
                    x += dx * dt;
                    y += dy * dt;
                    z += dz * dt;
                    points.push({ x, y, z });
                }
            }
            else if (type === 'henon') {
                let x = 0, y = 0;
                const a = 1.4, b = 0.3;
                for (let i = 0; i < steps; i++) {
                    const newX = 1 - a * x * x + y;
                    const newY = b * x;
                    x = newX;
                    y = newY;
                    points.push({ x, y });
                }
            }
            return points;
        }
        /**
         * Helper: Box counting for fractal dimension
         */
        static boxCount(data, scale) {
            const boxes = new Set();
            for (let i = 0; i < data.length; i++) {
                const box = Math.floor(data[i] / scale);
                boxes.add(box.toString());
            }
            return boxes.size;
        }
        /**
         * Helper: Get color for value based on color scheme
         */
        static getColorForValue(value, scheme) {
            const normalized = Math.max(0, Math.min(1, value));
            switch (scheme) {
                case 'viridis':
                    return `hsl(${240 + normalized * 120}, 60%, ${30 + normalized * 40}%)`;
                case 'plasma':
                    return `hsl(${300 - normalized * 60}, 80%, ${20 + normalized * 60}%)`;
                case 'turbo':
                    return `hsl(${normalized * 360}, 70%, 50%)`;
                case 'heat':
                    return `hsl(${(1 - normalized) * 60}, 100%, 50%)`;
                default:
                    return `hsl(${normalized * 240}, 70%, 50%)`;
            }
        }
        /**
         * Create musical fractal sequences from logistic map
         */
        static generateMusicalSequence(r, length, initialValue = 0.5) {
            const sequence = [];
            let x = initialValue;
            for (let i = 0; i < length; i++) {
                x = r * x * (1 - x);
                sequence.push(x);
            }
            return sequence;
        }
        /**
         * Create rhythm patterns from cellular automata
         */
        static rhythmFromCA(rule, width, generations, initialPattern) {
            const pattern = initialPattern || Array(width).fill(0).map(() => Math.random() > 0.5 ? 1 : 0);
            const history = [pattern];
            for (let gen = 0; gen < generations - 1; gen++) {
                const current = history[history.length - 1];
                const next = [];
                for (let i = 0; i < width; i++) {
                    const left = current[(i - 1 + width) % width];
                    const center = current[i];
                    const right = current[(i + 1) % width];
                    const index = (left << 2) | (center << 1) | right;
                    next.push((rule >> index) & 1);
                }
                history.push(next);
            }
            return history;
        }
    }

    exports.AdvancedRhythm = AdvancedRhythm;
    exports.CAVisualizer = CAVisualizer;
    exports.CellularAutomata = CellularAutomata;
    exports.FractalVisualizer = FractalVisualizer;
    exports.GaussianProcessRegressor = GaussianProcessRegressor;
    exports.GeneticAlgorithm = GeneticAlgorithm;
    exports.GeneticRhythm = GeneticRhythm;
    exports.JMonConverter = JMonConverter;
    exports.KernelGenerator = KernelGenerator;
    exports.LogisticMap = LogisticMap;
    exports.Mandelbrot = Mandelbrot;
    exports.MinimalismProcess = MinimalismProcess;
    exports.MotifBank = MotifBank;
    exports.MusicTheoryConstants = MusicTheoryConstants;
    exports.MusicUtils = MusicUtils;
    exports.MusicalAnalysis = MusicalAnalysis;
    exports.Ornament = Ornament;
    exports.Periodic = Periodic;
    exports.PlotRenderer = PlotRenderer;
    exports.Polyloop = Polyloop;
    exports.PolyloopVisualizer = PolyloopVisualizer;
    exports.Progression = Progression;
    exports.RBF = RBF;
    exports.RandomWalk = RandomWalk;
    exports.RationalQuadratic = RationalQuadratic;
    exports.Rhythm = Rhythm;
    exports.Scale = Scale;
    exports.Tintinnabuli = Tintinnabuli;
    exports.Voice = Voice;

    return exports;

})({}, Plotly);
//# sourceMappingURL=djalgojs.iife.js.map
