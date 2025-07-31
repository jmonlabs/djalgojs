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

export class PlotRenderer {
  
  /**
   * Create a line plot
   */
  public static async line(data: PlotData, options: PlotOptions = {}, elementId: string = 'plot'): Promise<void> {
    const { 
      title, 
      width = 640, 
      height = 400, 
      color = 'steelblue',
      xTitle = 'X',
      yTitle = 'Y'
    } = options;
    
    const trace: Plotly.Data = {
      x: data.x,
      y: data.y,
      type: 'scatter',
      mode: 'lines',
      line: { color, width: 2 },
      name: 'Line'
    };

    const layout: Partial<Plotly.Layout> = {
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
  public static async scatter(data: PlotData, options: PlotOptions = {}, elementId: string = 'plot'): Promise<void> {
    const { 
      title, 
      width = 640, 
      height = 400, 
      color = 'steelblue',
      xTitle = 'X',
      yTitle = 'Y'
    } = options;
    
    const trace: Plotly.Data = {
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

    const layout: Partial<Plotly.Layout> = {
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
  public static async heatmap(matrix: Matrix2D, options: PlotOptions = {}, elementId: string = 'plot'): Promise<void> {
    const { 
      title, 
      width = 640, 
      height = 400,
      colorScale = 'Viridis',
      xTitle = 'X',
      yTitle = 'Y'
    } = options;
    
    const trace: Plotly.Data = {
      z: matrix,
      type: 'heatmap',
      colorscale: colorScale,
      showscale: true
    };

    const layout: Partial<Plotly.Layout> = {
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
  public static async bar(data: PlotData, options: PlotOptions = {}, elementId: string = 'plot'): Promise<void> {
    const { 
      title, 
      width = 640, 
      height = 400, 
      color = 'steelblue',
      xTitle = 'X',
      yTitle = 'Y'
    } = options;
    
    const trace: Plotly.Data = {
      x: data.x.map(x => x.toString()),
      y: data.y,
      type: 'bar',
      marker: { color: data.color || color },
      name: 'Bar'
    };

    const layout: Partial<Plotly.Layout> = {
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
  public static async radar(data: PlotData, options: PlotOptions = {}, elementId: string = 'plot'): Promise<void> {
    const { title, width = 400, height = 400, color = 'steelblue' } = options;
    
    // Close the loop by adding first point at the end
    const angles = [...data.x, data.x[0]];
    const values = [...data.y, data.y[0]];
    
    const trace: Plotly.Data = {
      r: values,
      theta: angles,
      type: 'scatterpolar',
      mode: 'lines+markers',
      fill: 'toself',
      line: { color },
      marker: { color, size: 8 },
      name: 'Radar'
    };

    const layout: Partial<Plotly.Layout> = {
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
  public static async timeSeries(data: PlotData, options: PlotOptions = {}, elementId: string = 'plot'): Promise<void> {
    const { 
      title, 
      width = 640, 
      height = 400,
      xTitle = 'Time',
      yTitle = 'Value'
    } = options;
    
    const trace: Plotly.Data = {
      x: data.x,
      y: data.y,
      type: 'scatter',
      mode: 'lines',
      line: { width: 2 },
      name: 'Time Series'
    };

    const layout: Partial<Plotly.Layout> = {
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
  public static async matrix(matrix: Matrix2D, options: PlotOptions = {}, elementId: string = 'plot'): Promise<void> {
    const { 
      title, 
      width = 640, 
      height = 400,
      xTitle = 'Position',
      yTitle = 'Time Step'
    } = options;
    
    // Flip matrix vertically for proper display
    const flippedMatrix = matrix.slice().reverse();
    
    const trace: Plotly.Data = {
      z: flippedMatrix,
      type: 'heatmap',
      colorscale: [[0, 'white'], [1, 'black']],
      showscale: false,
      hoverinfo: 'none'
    };

    const layout: Partial<Plotly.Layout> = {
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
  public static async surface(
    data: { x: number[], y: number[], z: number[][] }, 
    options: PlotOptions = {}, 
    elementId: string = 'plot'
  ): Promise<void> {
    const { 
      title, 
      width = 640, 
      height = 400,
      colorScale = 'Viridis',
      xTitle = 'X',
      yTitle = 'Y',
      zTitle = 'Z'
    } = options;
    
    const trace: Plotly.Data = {
      x: data.x,
      y: data.y,
      z: data.z,
      type: 'surface',
      colorscale: colorScale
    };

    const layout: Partial<Plotly.Layout> = {
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
  public static async multiLine(datasets: PlotData[], options: PlotOptions = {}, elementId: string = 'plot'): Promise<void> {
    const { 
      title, 
      width = 640, 
      height = 400,
      xTitle = 'X',
      yTitle = 'Y'
    } = options;
    
    const traces: Plotly.Data[] = datasets.map((data, i) => ({
      x: data.x,
      y: data.y,
      type: 'scatter',
      mode: 'lines',
      name: `Series ${i + 1}`,
      line: { width: 2 }
    }));

    const layout: Partial<Plotly.Layout> = {
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
  public static async histogram(data: PlotData, options: PlotOptions = {}, elementId: string = 'plot'): Promise<void> {
    const { 
      title, 
      width = 640, 
      height = 400, 
      color = 'steelblue',
      xTitle = 'Value',
      yTitle = 'Frequency'
    } = options;
    
    const trace: Plotly.Data = {
      x: data.x,
      type: 'histogram',
      marker: { color },
      name: 'Histogram'
    };

    const layout: Partial<Plotly.Layout> = {
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
  public static async boxPlot(data: PlotData[], options: PlotOptions = {}, elementId: string = 'plot'): Promise<void> {
    const { 
      title, 
      width = 640, 
      height = 400,
      yTitle = 'Value'
    } = options;
    
    const traces: Plotly.Data[] = data.map((dataset, i) => ({
      y: dataset.y,
      type: 'box',
      name: `Dataset ${i + 1}`
    }));

    const layout: Partial<Plotly.Layout> = {
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
  public static async violin(data: PlotData[], options: PlotOptions = {}, elementId: string = 'plot'): Promise<void> {
    const { 
      title, 
      width = 640, 
      height = 400,
      yTitle = 'Value'
    } = options;
    
    const traces: Plotly.Data[] = data.map((dataset, i) => ({
      y: dataset.y,
      type: 'violin',
      name: `Dataset ${i + 1}`,
      box: { visible: true },
      meanline: { visible: true }
    }));

    const layout: Partial<Plotly.Layout> = {
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
  public static async contour(
    data: { x: number[], y: number[], z: number[][] }, 
    options: PlotOptions = {}, 
    elementId: string = 'plot'
  ): Promise<void> {
    const { 
      title, 
      width = 640, 
      height = 400,
      colorScale = 'Viridis',
      xTitle = 'X',
      yTitle = 'Y'
    } = options;
    
    const trace: Plotly.Data = {
      x: data.x,
      y: data.y,
      z: data.z,
      type: 'contour',
      colorscale: colorScale,
      showscale: true
    };

    const layout: Partial<Plotly.Layout> = {
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
  public static async scatter3D(
    data: { x: number[], y: number[], z: number[], color?: string[] }, 
    options: PlotOptions = {}, 
    elementId: string = 'plot'
  ): Promise<void> {
    const { 
      title, 
      width = 640, 
      height = 400,
      color = 'steelblue',
      xTitle = 'X',
      yTitle = 'Y',
      zTitle = 'Z'
    } = options;
    
    const trace: Plotly.Data = {
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

    const layout: Partial<Plotly.Layout> = {
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
  public static async animate(
    frames: Array<{ data: Plotly.Data[], layout?: Partial<Plotly.Layout> }>,
    options: PlotOptions & { duration?: number, transition?: number } = {},
    elementId: string = 'plot'
  ): Promise<void> {
    const { 
      title, 
      width = 640, 
      height = 400,
      duration = 500,
      transition = 100
    } = options;

    const initialData = frames[0]?.data || [];
    const layout: Partial<Plotly.Layout> = {
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
  public static async candlestick(
    data: { x: (string | number)[], open: number[], high: number[], low: number[], close: number[] },
    options: PlotOptions = {},
    elementId: string = 'plot'
  ): Promise<void> {
    const { 
      title, 
      width = 640, 
      height = 400,
      xTitle = 'Time',
      yTitle = 'Price'
    } = options;
    
    const trace: Plotly.Data = {
      x: data.x,
      open: data.open,
      high: data.high,
      low: data.low,
      close: data.close,
      type: 'candlestick',
      name: 'OHLC'
    };

    const layout: Partial<Plotly.Layout> = {
      title: title ? { text: title } : undefined,
      width,
      height,
      xaxis: { title: { text: xTitle } },
      yaxis: { title: { text: yTitle } }
    };

    await Plotly.newPlot(elementId, [trace], layout);
  }
}