import { Duration } from '../../types/common';
import { RhythmPattern } from '../../types/music';
export interface RhythmOptions {
    measureLength?: number;
    complexity?: number;
    swing?: boolean;
}
export declare class Rhythm {
    readonly measureLength: number;
    durations: Duration[];
    constructor(measureLength?: number, durations?: Duration[]);
    random(options?: RhythmOptions): RhythmPattern;
    static beatcycle(cycles: number[], measures?: number): RhythmPattern[];
    static isorhythm(talea: Duration[], color: number[], repetitions?: number): RhythmPattern;
    darwin(options?: RhythmOptions): RhythmPattern;
    private generateBasicPattern;
    private generateAccents;
    private calculateFitness;
    private mutateRhythm;
}
