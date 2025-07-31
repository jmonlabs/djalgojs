export declare class PlotlyVisualization {
    /**
     * Create a simple scatter plot
     */
    static scatter(x: number[], y: number[], element: string | HTMLElement, title?: string): any;
    /**
     * Create a line plot
     */
    static line(x: number[], y: number[], element: string | HTMLElement, title?: string): any;
    /**
     * Create a polar plot for polyloops
     */
    static polyloop(layers: any[], element: string | HTMLElement, title?: string): any;
}
export { PlotlyVisualization as Viz };
