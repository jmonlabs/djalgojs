import * as Plotly from 'plotly.js';
import { Matrix2D } from '../../types/common';
export interface PlotOptions {
    title?: string;
    width?: number;
    height?: number;
    color?: string;
    showAxis?: boolean;
    colorScale?: string;
    xTitle?: string;
    yTitle?: string;
    zTitle?: string;
    style?: Record<string, any>;
}
export interface PlotData {
    x: number[];
    y: number[];
    z?: number[];
    color?: string[];
    size?: number[];
    [key: string]: any;
}
export declare class PlotRenderer {
    /**
     * Create a line plot
     */
    static line(data: PlotData, options?: PlotOptions, elementId?: string): Promise<void>;
    /**
     * Create a scatter plot
     */
    static scatter(data: PlotData, options?: PlotOptions, elementId?: string): Promise<void>;
    /**
     * Create a heatmap from 2D matrix data
     */
    static heatmap(matrix: Matrix2D, options?: PlotOptions, elementId?: string): Promise<void>;
    /**
     * Create a bar chart
     */
    static bar(data: PlotData, options?: PlotOptions, elementId?: string): Promise<void>;
    /**
     * Create a polar/radar plot for polyloops
     */
    static radar(data: PlotData, options?: PlotOptions, elementId?: string): Promise<void>;
    /**
     * Create a time series plot
     */
    static timeSeries(data: PlotData, options?: PlotOptions, elementId?: string): Promise<void>;
    /**
     * Create a matrix visualization (for cellular automata)
     */
    static matrix(matrix: Matrix2D, options?: PlotOptions, elementId?: string): Promise<void>;
    /**
     * Create a 3D surface plot
     */
    static surface(data: {
        x: number[];
        y: number[];
        z: number[][];
    }, options?: PlotOptions, elementId?: string): Promise<void>;
    /**
     * Create multiple line plot
     */
    static multiLine(datasets: PlotData[], options?: PlotOptions, elementId?: string): Promise<void>;
    /**
     * Create histogram
     */
    static histogram(data: PlotData, options?: PlotOptions, elementId?: string): Promise<void>;
    /**
     * Create box plot
     */
    static boxPlot(data: PlotData[], options?: PlotOptions, elementId?: string): Promise<void>;
    /**
     * Create a violin plot
     */
    static violin(data: PlotData[], options?: PlotOptions, elementId?: string): Promise<void>;
    /**
     * Create a contour plot
     */
    static contour(data: {
        x: number[];
        y: number[];
        z: number[][];
    }, options?: PlotOptions, elementId?: string): Promise<void>;
    /**
     * Create a 3D scatter plot
     */
    static scatter3D(data: {
        x: number[];
        y: number[];
        z: number[];
        color?: string[];
    }, options?: PlotOptions, elementId?: string): Promise<void>;
    /**
     * Create animated plot with frames
     */
    static animate(frames: Array<{
        data: Plotly.Data[];
        layout?: Partial<Plotly.Layout>;
    }>, options?: PlotOptions & {
        duration?: number;
        transition?: number;
    }, elementId?: string): Promise<void>;
    /**
     * Create candlestick chart
     */
    static candlestick(data: {
        x: (string | number)[];
        open: number[];
        high: number[];
        low: number[];
        close: number[];
    }, options?: PlotOptions, elementId?: string): Promise<void>;
}
