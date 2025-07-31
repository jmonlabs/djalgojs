import { Matrix } from '../../../utils/matrix.js';
export class Kernel {
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
