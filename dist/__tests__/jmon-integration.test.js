import { Scale, Progression, JMonConverter } from '../index.js';
describe('JMON Integration', () => {
    test('should convert Scale to JMON sequence', () => {
        const scale = new Scale('C', 'major');
        const jmonSequence = scale.toJMonSequence({
            length: 4,
            octave: 4,
            duration: '4n',
            velocity: 0.8
        });
        expect(jmonSequence.label).toContain('C major');
        expect(jmonSequence.notes).toHaveLength(4);
        expect(jmonSequence.notes[0]?.note).toBe('C4');
        expect(jmonSequence.notes[0]?.time).toBe('0:0:0');
        expect(jmonSequence.notes[0]?.duration).toBe('4n');
        expect(jmonSequence.synth?.type).toBe('Synth');
    });
    test('should convert Progression to JMON sequence', () => {
        const progression = new Progression('C', 'major');
        const jmonSequence = progression.toJMonSequence({
            length: 2,
            octave: 3,
            duration: '1n',
            voicing: 'triad'
        });
        expect(jmonSequence.label).toContain('C major');
        expect(jmonSequence.notes).toHaveLength(2);
        expect(jmonSequence.synth?.type).toBe('PolySynth');
        expect(Array.isArray(jmonSequence.notes[0]?.note)).toBe(true);
    });
    test('should convert time formats correctly', () => {
        expect(JMonConverter.timeToMusicalTime(0)).toBe('0:0:0');
        expect(JMonConverter.timeToMusicalTime(1)).toBe('0:1:0');
        expect(JMonConverter.timeToMusicalTime(4)).toBe('1:0:0');
        expect(JMonConverter.timeToMusicalTime(2.5)).toBe('0:2:240');
    });
    test('should convert note names correctly', () => {
        expect(JMonConverter.midiToNoteName(60)).toBe('C4');
        expect(JMonConverter.midiToNoteName(61)).toBe('C#4');
        expect(JMonConverter.noteNameToMidi('C4')).toBe(60);
        expect(JMonConverter.noteNameToMidi('C#4')).toBe(61);
    });
    test('should create valid JMON composition', () => {
        const scale = new Scale('C', 'major');
        const scaleSeq = scale.toJMonSequence({ length: 4 });
        const composition = JMonConverter.createComposition([scaleSeq], {
            bpm: 120,
            keySignature: 'C',
            metadata: { name: 'Test Composition' }
        });
        expect(composition.format).toBe('jmonTone');
        expect(composition.bpm).toBe(120);
        expect(composition.keySignature).toBe('C');
        expect(composition.sequences).toHaveLength(1);
        expect(composition.audioGraph).toBeDefined();
        expect(composition.connections).toBeDefined();
    });
    test('should validate JMON composition', () => {
        const scale = new Scale('C', 'major');
        const scaleSeq = scale.toJMonSequence({ length: 4 });
        const composition = JMonConverter.createBasicComposition([scaleSeq]);
        const validation = JMonConverter.validateComposition(composition);
        expect(validation.valid).toBe(true);
        expect(validation.errors).toHaveLength(0);
    });
    test('should detect invalid JMON composition', () => {
        const invalidComposition = {
            format: 'invalid',
            version: '1.0',
            bpm: 500, // Invalid BPM
            audioGraph: [],
            connections: [],
            sequences: [] // No sequences
        };
        const validation = JMonConverter.validateComposition(invalidComposition);
        expect(validation.valid).toBe(false);
        expect(validation.errors.length).toBeGreaterThan(0);
    });
});
