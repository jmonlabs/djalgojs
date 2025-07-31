import * as Plotly from 'plotly.js';
export class PlotRenderer {
    /**
     * Create a line plot
     */
    static async line(data, options = {}, elementId = 'plot') {
        const { title, width = 640, height = 400, color = 'steelblue', xTitle = 'X', yTitle = 'Y' } = options;
        const trace = {
            x: data.x,
            y: data.y,
            type: 'scatter',
            mode: 'lines',
            line: { color, width: 2 },
            name: 'Line'
        };
        const layout = {
            title: title ? { text: title } : undefined,
            width,
            height,
            xaxis: { title: { text: xTitle } },
            yaxis: { title: { text: yTitle } }
        };
        await Plotly.newPlot(elementId, [trace], layout);
    }
    /**
     * Create a scatter plot
     */
    static async scatter(data, options = {}, elementId = 'plot') {
        const { title, width = 640, height = 400, color = 'steelblue', xTitle = 'X', yTitle = 'Y' } = options;
        const trace = {
            x: data.x,
            y: data.y,
            type: 'scatter',
            mode: 'markers',
            marker: {
                color: data.color || color,
                size: data.size || 8
            },
            name: 'Scatter'
        };
        const layout = {
            title: title ? { text: title } : undefined,
            width,
            height,
            xaxis: { title: { text: xTitle } },
            yaxis: { title: { text: yTitle } }
        };
        await Plotly.newPlot(elementId, [trace], layout);
    }
    /**
     * Create a heatmap from 2D matrix data
     */
    static async heatmap(matrix, options = {}, elementId = 'plot') {
        const { title, width = 640, height = 400, colorScale = 'Viridis', xTitle = 'X', yTitle = 'Y' } = options;
        const trace = {
            z: matrix,
            type: 'heatmap',
            colorscale: colorScale,
            showscale: true
        };
        const layout = {
            title: title ? { text: title } : undefined,
            width,
            height,
            xaxis: { title: { text: xTitle } },
            yaxis: { title: { text: yTitle } }
        };
        await Plotly.newPlot(elementId, [trace], layout);
    }
    /**
     * Create a bar chart
     */
    static async bar(data, options = {}, elementId = 'plot') {
        const { title, width = 640, height = 400, color = 'steelblue', xTitle = 'X', yTitle = 'Y' } = options;
        const trace = {
            x: data.x.map(x => x.toString()),
            y: data.y,
            type: 'bar',
            marker: { color: data.color || color },
            name: 'Bar'
        };
        const layout = {
            title: title ? { text: title } : undefined,
            width,
            height,
            xaxis: { title: { text: xTitle } },
            yaxis: { title: { text: yTitle } }
        };
        await Plotly.newPlot(elementId, [trace], layout);
    }
    /**
     * Create a polar/radar plot for polyloops
     */
    static async radar(data, options = {}, elementId = 'plot') {
        const { title, width = 400, height = 400, color = 'steelblue' } = options;
        // Close the loop by adding first point at the end
        const angles = [...data.x, data.x[0]];
        const values = [...data.y, data.y[0]];
        const trace = {
            r: values,
            theta: angles,
            type: 'scatterpolar',
            mode: 'lines+markers',
            fill: 'toself',
            line: { color },
            marker: { color, size: 8 },
            name: 'Radar'
        };
        const layout = {
            title: title ? { text: title } : undefined,
            width,
            height,
            polar: {
                radialaxis: {
                    visible: true,
                    range: [0, Math.max(...data.y) * 1.1]
                }
            }
        };
        await Plotly.newPlot(elementId, [trace], layout);
    }
    /**
     * Create a time series plot
     */
    static async timeSeries(data, options = {}, elementId = 'plot') {
        const { title, width = 640, height = 400, xTitle = 'Time', yTitle = 'Value' } = options;
        const trace = {
            x: data.x,
            y: data.y,
            type: 'scatter',
            mode: 'lines',
            line: { width: 2 },
            name: 'Time Series'
        };
        const layout = {
            title: title ? { text: title } : undefined,
            width,
            height,
            xaxis: { title: { text: xTitle } },
            yaxis: { title: { text: yTitle } }
        };
        await Plotly.newPlot(elementId, [trace], layout);
    }
    /**
     * Create a matrix visualization (for cellular automata)
     */
    static async matrix(matrix, options = {}, elementId = 'plot') {
        const { title, width = 640, height = 400, xTitle = 'Position', yTitle = 'Time Step' } = options;
        // Flip matrix vertically for proper display
        const flippedMatrix = matrix.slice().reverse();
        const trace = {
            z: flippedMatrix,
            type: 'heatmap',
            colorscale: [[0, 'white'], [1, 'black']],
            showscale: false,
            hoverinfo: 'none'
        };
        const layout = {
            title: title ? { text: title } : undefined,
            width,
            height,
            xaxis: {
                title: { text: xTitle },
                showticklabels: false
            },
            yaxis: {
                title: { text: yTitle },
                showticklabels: false
            }
        };
        await Plotly.newPlot(elementId, [trace], layout);
    }
    /**
     * Create a 3D surface plot
     */
    static async surface(data, options = {}, elementId = 'plot') {
        const { title, width = 640, height = 400, colorScale = 'Viridis', xTitle = 'X', yTitle = 'Y', zTitle = 'Z' } = options;
        const trace = {
            x: data.x,
            y: data.y,
            z: data.z,
            type: 'surface',
            colorscale: colorScale
        };
        const layout = {
            title: title ? { text: title } : undefined,
            width,
            height,
            scene: {
                xaxis: { title: { text: xTitle } },
                yaxis: { title: { text: yTitle } },
                zaxis: { title: { text: zTitle } }
            }
        };
        await Plotly.newPlot(elementId, [trace], layout);
    }
    /**
     * Create multiple line plot
     */
    static async multiLine(datasets, options = {}, elementId = 'plot') {
        const { title, width = 640, height = 400, xTitle = 'X', yTitle = 'Y' } = options;
        const traces = datasets.map((data, i) => ({
            x: data.x,
            y: data.y,
            type: 'scatter',
            mode: 'lines',
            name: `Series ${i + 1}`,
            line: { width: 2 }
        }));
        const layout = {
            title: title ? { text: title } : undefined,
            width,
            height,
            xaxis: { title: { text: xTitle } },
            yaxis: { title: { text: yTitle } }
        };
        await Plotly.newPlot(elementId, traces, layout);
    }
    /**
     * Create histogram
     */
    static async histogram(data, options = {}, elementId = 'plot') {
        const { title, width = 640, height = 400, color = 'steelblue', xTitle = 'Value', yTitle = 'Frequency' } = options;
        const trace = {
            x: data.x,
            type: 'histogram',
            marker: { color },
            name: 'Histogram'
        };
        const layout = {
            title: title ? { text: title } : undefined,
            width,
            height,
            xaxis: { title: { text: xTitle } },
            yaxis: { title: { text: yTitle } }
        };
        await Plotly.newPlot(elementId, [trace], layout);
    }
    /**
     * Create box plot
     */
    static async boxPlot(data, options = {}, elementId = 'plot') {
        const { title, width = 640, height = 400, yTitle = 'Value' } = options;
        const traces = data.map((dataset, i) => ({
            y: dataset.y,
            type: 'box',
            name: `Dataset ${i + 1}`
        }));
        const layout = {
            title: title ? { text: title } : undefined,
            width,
            height,
            yaxis: { title: { text: yTitle } }
        };
        await Plotly.newPlot(elementId, traces, layout);
    }
    /**
     * Create a violin plot
     */
    static async violin(data, options = {}, elementId = 'plot') {
        const { title, width = 640, height = 400, yTitle = 'Value' } = options;
        const traces = data.map((dataset, i) => ({
            y: dataset.y,
            type: 'violin',
            name: `Dataset ${i + 1}`,
            box: { visible: true },
            meanline: { visible: true }
        }));
        const layout = {
            title: title ? { text: title } : undefined,
            width,
            height,
            yaxis: { title: { text: yTitle } }
        };
        await Plotly.newPlot(elementId, traces, layout);
    }
    /**
     * Create a contour plot
     */
    static async contour(data, options = {}, elementId = 'plot') {
        const { title, width = 640, height = 400, colorScale = 'Viridis', xTitle = 'X', yTitle = 'Y' } = options;
        const trace = {
            x: data.x,
            y: data.y,
            z: data.z,
            type: 'contour',
            colorscale: colorScale,
            showscale: true
        };
        const layout = {
            title: title ? { text: title } : undefined,
            width,
            height,
            xaxis: { title: { text: xTitle } },
            yaxis: { title: { text: yTitle } }
        };
        await Plotly.newPlot(elementId, [trace], layout);
    }
    /**
     * Create a 3D scatter plot
     */
    static async scatter3D(data, options = {}, elementId = 'plot') {
        const { title, width = 640, height = 400, color = 'steelblue', xTitle = 'X', yTitle = 'Y', zTitle = 'Z' } = options;
        const trace = {
            x: data.x,
            y: data.y,
            z: data.z,
            type: 'scatter3d',
            mode: 'markers',
            marker: {
                color: data.color || color,
                size: 4,
                opacity: 0.8
            },
            name: '3D Scatter'
        };
        const layout = {
            title: title ? { text: title } : undefined,
            width,
            height,
            scene: {
                xaxis: { title: { text: xTitle } },
                yaxis: { title: { text: yTitle } },
                zaxis: { title: { text: zTitle } }
            }
        };
        await Plotly.newPlot(elementId, [trace], layout);
    }
    /**
     * Create animated plot with frames
     */
    static async animate(frames, options = {}, elementId = 'plot') {
        const { title, width = 640, height = 400, duration = 500, transition = 100 } = options;
        const initialData = frames[0]?.data || [];
        const layout = {
            title: title ? { text: title } : undefined,
            width,
            height,
            updatemenus: [{
                    type: 'buttons',
                    showactive: false,
                    buttons: [{
                            label: 'Play',
                            method: 'animate',
                            args: [null, {
                                    frame: { duration, redraw: true },
                                    transition: { duration: transition },
                                    fromcurrent: true
                                }]
                        }, {
                            label: 'Pause',
                            method: 'animate',
                            args: [[null], {
                                    frame: { duration: 0, redraw: false },
                                    mode: 'immediate',
                                    transition: { duration: 0 }
                                }]
                        }]
                }],
            ...frames[0]?.layout
        };
        const plotlyFrames = frames.map((frame, i) => ({
            name: i.toString(),
            data: frame.data,
            layout: frame.layout
        }));
        await Plotly.newPlot(elementId, initialData, layout);
        await Plotly.addFrames(elementId, plotlyFrames);
    }
    /**
     * Create candlestick chart
     */
    static async candlestick(data, options = {}, elementId = 'plot') {
        const { title, width = 640, height = 400, xTitle = 'Time', yTitle = 'Price' } = options;
        const trace = {
            x: data.x,
            open: data.open,
            high: data.high,
            low: data.low,
            close: data.close,
            type: 'candlestick',
            name: 'OHLC'
        };
        const layout = {
            title: title ? { text: title } : undefined,
            width,
            height,
            xaxis: { title: { text: xTitle } },
            yaxis: { title: { text: yTitle } }
        };
        await Plotly.newPlot(elementId, [trace], layout);
    }
}
