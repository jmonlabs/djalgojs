export class CellularAutomata {
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
