import { CellularAutomataRule } from '../../types/algorithms';
import { Matrix2D } from '../../types/common';

export interface CellularAutomataOptions {
  width?: number;
  ruleNumber?: number;
  initialState?: number[];
}

export class CellularAutomata {
  public readonly width: number;
  public ruleNumber: number;
  public initialState: number[];
  public state: number[];
  public rules: CellularAutomataRule;
  private history: Matrix2D = [];

  constructor(options: CellularAutomataOptions = {}) {
    this.width = options.width || 51;
    this.ruleNumber = options.ruleNumber || 30;
    this.initialState = options.initialState || this.generateRandomInitialState();
    this.state = [...this.initialState];
    this.rules = this.loadRules(this.ruleNumber);
  }

  public generate(steps: number): Matrix2D {
    this.history = [];
    this.state = [...this.initialState];
    
    this.history.push([...this.state]);
    
    for (let step = 0; step < steps; step++) {
      this.updateState();
      this.history.push([...this.state]);
    }
    
    return this.history;
  }

  public generate01(steps: number): Matrix2D {
    const result = this.generate(steps);
    return result.map(row => row.map(cell => cell > 0 ? 1 : 0));
  }

  public loadRules(ruleNumber: number): CellularAutomataRule {
    const binary = ruleNumber.toString(2).padStart(8, '0');
    const rules: CellularAutomataRule = {};
    
    // Map binary neighborhoods to rule outputs
    const neighborhoods = ['111', '110', '101', '100', '011', '010', '001', '000'];
    
    for (let i = 0; i < 8; i++) {
      rules[neighborhoods[i]!] = parseInt(binary[i]!, 10);
    }
    
    return rules;
  }

  public updateState(): void {
    const newState = new Array(this.width);
    
    for (let i = 0; i < this.width; i++) {
      const left = this.state[(i - 1 + this.width) % this.width]!;
      const center = this.state[i]!;
      const right = this.state[(i + 1) % this.width]!;
      
      const neighborhood = `${left}${center}${right}`;
      newState[i] = this.rules[neighborhood] || 0;
    }
    
    this.state = newState;
  }

  public validateStrips(strips: Matrix2D): boolean {
    if (!Array.isArray(strips) || strips.length === 0) {
      return false;
    }
    
    const width = strips[0]?.length;
    if (!width) return false;
    
    return strips.every(strip => 
      Array.isArray(strip) && 
      strip.length === width &&
      strip.every(cell => typeof cell === 'number' && (cell === 0 || cell === 1))
    );
  }

  public validateValues(values: number[]): boolean {
    return Array.isArray(values) && 
           values.length === this.width &&
           values.every(val => typeof val === 'number' && (val === 0 || val === 1));
  }

  public setInitialState(state: number[]): void {
    if (this.validateValues(state)) {
      this.initialState = [...state];
      this.state = [...state];
    } else {
      throw new Error('Invalid initial state');
    }
  }

  public setRuleNumber(ruleNumber: number): void {
    if (ruleNumber >= 0 && ruleNumber <= 255) {
      (this as { ruleNumber: number }).ruleNumber = ruleNumber;
      this.rules = this.loadRules(ruleNumber);
    } else {
      throw new Error('Rule number must be between 0 and 255');
    }
  }

  public getHistory(): Matrix2D {
    return this.history.map(row => [...row]);
  }

  public getCurrentState(): number[] {
    return [...this.state];
  }

  private generateRandomInitialState(): number[] {
    const state = new Array(this.width).fill(0);
    // Single cell in center
    state[Math.floor(this.width / 2)] = 1;
    return state;
  }

  public generateRandomState(): number[] {
    return Array.from({ length: this.width }, () => Math.random() > 0.5 ? 1 : 0);
  }

  public plot(): { data: Matrix2D; width: number; height: number } {
    return {
      data: this.getHistory(),
      width: this.width,
      height: this.history.length,
    };
  }

  /**
   * Create Observable Plot visualization of CA evolution
   */
  public plotEvolution(options?: any): ReturnType<typeof import('../../visualization/cellular-automata/CAVisualizer').CAVisualizer.plotEvolution> {
    const { CAVisualizer } = require('../../visualization/cellular-automata/CAVisualizer');
    return CAVisualizer.plotEvolution(this.getHistory(), options);
  }

  /**
   * Create Observable Plot visualization of current generation
   */
  public plotGeneration(options?: any): ReturnType<typeof import('../../visualization/cellular-automata/CAVisualizer').CAVisualizer.plotGeneration> {
    const { CAVisualizer } = require('../../visualization/cellular-automata/CAVisualizer');
    return CAVisualizer.plotGeneration(this.getCurrentState(), options);
  }

  /**
   * Create Observable Plot density visualization
   */
  public plotDensity(options?: any): ReturnType<typeof import('../../visualization/cellular-automata/CAVisualizer').CAVisualizer.plotDensity> {
    const { CAVisualizer } = require('../../visualization/cellular-automata/CAVisualizer');
    return CAVisualizer.plotDensity(this.getHistory(), options);
  }
}