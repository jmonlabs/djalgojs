import { Kernel } from './base.js';
export class Periodic extends Kernel {
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
