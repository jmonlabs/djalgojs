// Visualization module that uses global Plotly
// This module expects Plotly to be available globally
// Simple visualization functions that use global Plotly
export class PlotlyVisualization {
    /**
     * Create a simple scatter plot
     */
    static scatter(x, y, element, title = 'Scatter Plot') {
        const Plotly = globalThis.Plotly || window?.Plotly;
        if (typeof Plotly === 'undefined') {
            throw new Error('Plotly.js must be loaded globally before using visualization functions');
        }
        const data = [{
                x: x,
                y: y,
                mode: 'markers',
                type: 'scatter'
            }];
        const layout = {
            title: { text: title },
            xaxis: { title: 'X' },
            yaxis: { title: 'Y' }
        };
        return Plotly.newPlot(element, data, layout);
    }
    /**
     * Create a line plot
     */
    static line(x, y, element, title = 'Line Plot') {
        const Plotly = globalThis.Plotly || window?.Plotly;
        if (typeof Plotly === 'undefined') {
            throw new Error('Plotly.js must be loaded globally before using visualization functions');
        }
        const data = [{
                x: x,
                y: y,
                mode: 'lines',
                type: 'scatter'
            }];
        const layout = {
            title: { text: title },
            xaxis: { title: 'X' },
            yaxis: { title: 'Y' }
        };
        return Plotly.newPlot(element, data, layout);
    }
    /**
     * Create a polar plot for polyloops
     */
    static polyloop(layers, element, title = 'Polyloop') {
        const Plotly = globalThis.Plotly || window?.Plotly;
        if (typeof Plotly === 'undefined') {
            throw new Error('Plotly.js must be loaded globally before using visualization functions');
        }
        const traces = layers.map((layer, i) => ({
            r: layer.values || layer.durations,
            theta: layer.angles || layer.positions,
            mode: 'markers',
            type: 'scatterpolar',
            name: `Layer ${i + 1}`,
            marker: {
                size: 8,
                opacity: 0.7
            }
        }));
        const layout = {
            title: { text: title },
            polar: {
                radialaxis: {
                    visible: true,
                    range: [0, Math.max(...layers.flatMap(l => l.values || l.durations || [1]))]
                }
            }
        };
        return Plotly.newPlot(element, traces, layout);
    }
}
export { PlotlyVisualization as Viz };
