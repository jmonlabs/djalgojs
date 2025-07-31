import { CellularAutomataRule } from '../../types/algorithms';
import { Matrix2D } from '../../types/common';
export interface CellularAutomataOptions {
    width?: number;
    ruleNumber?: number;
    initialState?: number[];
}
export declare class CellularAutomata {
    readonly width: number;
    ruleNumber: number;
    initialState: number[];
    state: number[];
    rules: CellularAutomataRule;
    private history;
    constructor(options?: CellularAutomataOptions);
    generate(steps: number): Matrix2D;
    generate01(steps: number): Matrix2D;
    loadRules(ruleNumber: number): CellularAutomataRule;
    updateState(): void;
    validateStrips(strips: Matrix2D): boolean;
    validateValues(values: number[]): boolean;
    setInitialState(state: number[]): void;
    setRuleNumber(ruleNumber: number): void;
    getHistory(): Matrix2D;
    getCurrentState(): number[];
    private generateRandomInitialState;
    generateRandomState(): number[];
    plot(): {
        data: Matrix2D;
        width: number;
        height: number;
    };
    /**
     * Create Observable Plot visualization of CA evolution
     */
    plotEvolution(options?: any): ReturnType<typeof import('../../visualization/cellular-automata/CAVisualizer').CAVisualizer.plotEvolution>;
    /**
     * Create Observable Plot visualization of current generation
     */
    plotGeneration(options?: any): ReturnType<typeof import('../../visualization/cellular-automata/CAVisualizer').CAVisualizer.plotGeneration>;
    /**
     * Create Observable Plot density visualization
     */
    plotDensity(options?: any): ReturnType<typeof import('../../visualization/cellular-automata/CAVisualizer').CAVisualizer.plotDensity>;
}
