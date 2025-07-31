import { GaussianProcessRegressor, RBF } from '../algorithms/gaussian-processes.js';
describe('GaussianProcessRegressor', () => {
    test('should fit and predict simple data', () => {
        const kernel = new RBF(1.0, 1.0);
        const gp = new GaussianProcessRegressor(kernel);
        const X = [[0], [1], [2], [3], [4]];
        const y = [0, 1, 4, 9, 16]; // x^2
        gp.fit(X, y);
        const result = gp.predict([[2.5]], false);
        expect(result.mean).toHaveLength(1);
        expect(typeof result.mean[0]).toBe('number');
    });
    test('should predict with uncertainty', () => {
        const kernel = new RBF(1.0, 1.0);
        const gp = new GaussianProcessRegressor(kernel);
        const X = [[0], [1], [2]];
        const y = [0, 1, 4];
        gp.fit(X, y);
        const result = gp.predict([[1.5]], true);
        expect(result.mean).toHaveLength(1);
        expect(result.std).toHaveLength(1);
        expect(typeof result.std[0]).toBe('number');
    });
});
