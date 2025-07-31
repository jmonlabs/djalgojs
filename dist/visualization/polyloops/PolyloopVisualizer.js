import * as Plotly from 'plotly.js';
export class PolyloopVisualizer {
    /**
     * Create a polar radar chart visualization of polyloops using Plotly.js
     * Mirrors the functionality of the Python implementation
     */
    static plotPolyloop(layers, options = {}) {
        const { pulse = 1 / 4, colors, measureLength = 4, container = 'polyloop-plot', title = 'Polyloop Visualization' } = options;
        // Generate colors if not provided
        const layerColors = colors || this.generateColors(layers.length);
        const traces = [];
        const layerNames = layers.map(layer => layer.label);
        // Create traces for each layer
        layers.forEach((layer, layerIndex) => {
            const activePoints = layer.points.filter(point => point.active);
            if (activePoints.length === 0)
                return;
            // Create duration arcs for each active point
            activePoints.forEach(point => {
                const startTheta = point.angle;
                const duration = this.calculateDuration(point, layer, measureLength);
                const durationTheta = duration * 360 / measureLength;
                // Generate arc points
                const arcPoints = this.generateArcPoints(startTheta, durationTheta, 100);
                const radius = Array(100).fill(layers.length - layerIndex - 1);
                // Duration arc trace
                traces.push({
                    type: 'scatterpolar',
                    r: radius,
                    theta: arcPoints,
                    mode: 'lines',
                    line: {
                        color: 'rgba(60, 60, 60, 0.65)',
                        width: 8
                    },
                    name: `${layer.label} Duration`,
                    showlegend: false
                });
                // Start and end markers
                [startTheta, (startTheta + durationTheta) % 360].forEach(theta => {
                    traces.push({
                        type: 'scatterpolar',
                        r: [layers.length - layerIndex - 0.9, layers.length - layerIndex - 1.1],
                        theta: [theta, theta],
                        mode: 'lines',
                        line: {
                            color: 'Black',
                            width: 3
                        },
                        name: `${layer.label} Start/End`,
                        showlegend: false
                    });
                });
            });
            // Main layer shape
            if (activePoints.length > 0) {
                const startThetas = activePoints.map(point => point.angle);
                startThetas.push(startThetas[0]); // Close the loop
                traces.push({
                    type: 'scatterpolar',
                    r: Array(startThetas.length).fill(layers.length - layerIndex - 1),
                    theta: startThetas,
                    mode: 'lines',
                    line: {
                        color: 'rgba(0, 0, 0, 0.65)',
                        width: 1
                    },
                    fill: 'toself',
                    fillcolor: layerColors[layerIndex % layerColors.length],
                    name: layer.label,
                    showlegend: true
                });
            }
        });
        // Reverse traces to match Python implementation layering
        const finalTraces = [...traces].reverse();
        // Generate tick values and labels
        const tickvals = this.generateTickValues(measureLength, pulse);
        const ticktext = this.generateTickLabels(measureLength, pulse);
        const radialTickvals = Array.from({ length: layers.length }, (_, i) => i);
        const layout = {
            title: { text: title },
            polar: {
                radialaxis: {
                    visible: true,
                    range: [layers.length, -0.1],
                    tickvals: radialTickvals,
                    ticktext: layerNames
                },
                angularaxis: {
                    tickvals: tickvals,
                    ticktext: ticktext,
                    direction: 'clockwise',
                    rotation: 90
                }
            },
            template: 'none',
            showlegend: true,
            annotations: [{
                    x: 0.5,
                    y: 0.5,
                    text: '�',
                    showarrow: false,
                    font: {
                        size: 30,
                        color: 'White'
                    },
                    xref: 'paper',
                    yref: 'paper'
                }]
        };
        const config = {
            responsive: true,
            displayModeBar: true
        };
        return Plotly.newPlot(container, finalTraces, layout, config);
    }
    /**
     * Generate equally spaced colors using HSV color space
     */
    static generateColors(count) {
        const colors = [];
        for (let i = 0; i < count; i++) {
            const hue = i / count;
            const rgb = this.hsvToRgb(hue, 1, 1);
            colors.push(`rgba(${Math.round(rgb.r * 255)}, ${Math.round(rgb.g * 255)}, ${Math.round(rgb.b * 255)}, 0.5)`);
        }
        return colors;
    }
    /**
     * Convert HSV to RGB color space
     */
    static hsvToRgb(h, s, v) {
        let r, g, b;
        const i = Math.floor(h * 6);
        const f = h * 6 - i;
        const p = v * (1 - s);
        const q = v * (1 - f * s);
        const t = v * (1 - (1 - f) * s);
        switch (i % 6) {
            case 0:
                r = v;
                g = t;
                b = p;
                break;
            case 1:
                r = q;
                g = v;
                b = p;
                break;
            case 2:
                r = p;
                g = v;
                b = t;
                break;
            case 3:
                r = p;
                g = q;
                b = v;
                break;
            case 4:
                r = t;
                g = p;
                b = v;
                break;
            case 5:
                r = v;
                g = p;
                b = q;
                break;
            default: r = g = b = 0;
        }
        return { r, g, b };
    }
    /**
     * Generate arc points for smooth curves
     */
    static generateArcPoints(startTheta, durationTheta, numPoints) {
        const points = [];
        const endTheta = startTheta + durationTheta;
        for (let i = 0; i < numPoints; i++) {
            const theta = startTheta + (i / (numPoints - 1)) * durationTheta;
            points.push(theta % 360);
        }
        return points;
    }
    /**
     * Calculate duration for a point (simplified for this implementation)
     */
    static calculateDuration(point, layer, measureLength) {
        // For simplicity, assume equal duration for all points
        // In a more sophisticated implementation, this could be derived from the point data
        return measureLength / layer.divisions;
    }
    /**
     * Generate tick values for angular axis
     */
    static generateTickValues(measureLength, pulse) {
        const tickvals = [];
        const numTicks = Math.floor(measureLength / pulse);
        for (let i = 0; i < numTicks; i++) {
            tickvals.push((i * 360) / numTicks);
        }
        return tickvals;
    }
    /**
     * Generate tick labels for angular axis
     */
    static generateTickLabels(measureLength, pulse) {
        const ticktext = [];
        const numTicks = Math.floor(measureLength / pulse);
        for (let i = 0; i < numTicks; i++) {
            const beat = (i * pulse) % measureLength;
            ticktext.push(beat.toString());
        }
        return ticktext;
    }
    /**
     * Create a timeline visualization of the polyloop triggers
     */
    static plotTimeline(layers, duration = 8, options = {}) {
        const { container = 'polyloop-timeline', title = 'Polyloop Timeline', colors } = options;
        const layerColors = colors || this.generateColors(layers.length);
        const traces = [];
        layers.forEach((layer, layerIndex) => {
            const activePoints = layer.points.filter(point => point.active);
            const times = [];
            const pitches = [];
            // Convert angles to time positions
            activePoints.forEach(point => {
                const time = (point.angle / 360) * 4; // Assuming 4-beat measure
                times.push(time);
                pitches.push(point.pitch || 60);
            });
            if (times.length > 0) {
                traces.push({
                    type: 'scatter',
                    x: times,
                    y: pitches,
                    mode: 'markers',
                    marker: {
                        color: layerColors[layerIndex % layerColors.length],
                        size: 10
                    },
                    name: layer.label
                });
            }
        });
        const layout = {
            title: { text: title },
            xaxis: {
                title: 'Time (beats)',
                range: [0, duration]
            },
            yaxis: {
                title: 'Pitch (MIDI)',
                range: [20, 120]
            },
            showlegend: true
        };
        const config = {
            responsive: true,
            displayModeBar: true
        };
        return Plotly.newPlot(container, traces, layout, config);
    }
    /**
     * Create animated frames of the polyloop visualization
     */
    static plotAnimated(layers, numFrames = 12, options = {}) {
        const frames = [];
        for (let frame = 0; frame < numFrames; frame++) {
            const rotationAngle = (frame / numFrames) * 360;
            // Create rotated layers
            const rotatedLayers = layers.map(layer => ({
                ...layer,
                points: layer.points.map(point => ({
                    ...point,
                    angle: (point.angle + rotationAngle * layer.speed) % 360
                }))
            }));
            const frameOptions = {
                ...options,
                container: `${options.container || 'polyloop-plot'}-frame-${frame}`,
                title: `${options.title || 'Polyloop'} - Frame ${frame + 1}`
            };
            frames.push(this.plotPolyloop(rotatedLayers, frameOptions));
        }
        return Promise.all(frames);
    }
    /**
     * Convert polyloop data to format compatible with Python implementation
     */
    static convertToPolyloopData(layers) {
        const polyloopData = {};
        layers.forEach(layer => {
            const notes = layer.points.map(point => [
                point.active ? point.pitch || null : null,
                4 / layer.divisions, // duration
                point.angle / 360 * 4 // offset in beats
            ]);
            polyloopData[layer.label] = notes;
        });
        return polyloopData;
    }
}
