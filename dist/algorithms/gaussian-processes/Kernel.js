import { Matrix } from '../../utils/matrix.js';
import { RBF } from './kernels/rbf.js';
import { sampleMultivariateNormal } from './utils.js';
export class KernelGenerator {
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
