import { choleskyDecomposition } from '../../utils/matrix.js';
export function sampleNormal(mean = 0, std = 1) {
    const u1 = Math.random();
    const u2 = Math.random();
    const z0 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
    return mean + std * z0;
}
export function sampleMultivariateNormal(mean, covariance) {
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
