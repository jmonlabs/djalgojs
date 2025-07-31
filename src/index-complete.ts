// Complete djalgojs bundle with both algorithms and visualization

// Re-export all core functionality
export * from './index-no-viz';

// Export all core functionality as dj
import * as core from './index-no-viz';
export const dj = core;

// Helper function to get Plotly instance
const getPlotly = () => {
  const Plotly = (globalThis as any).Plotly || (window as any)?.Plotly;
  if (typeof Plotly === 'undefined') {
    throw new Error('Plotly.js must be loaded globally before using visualization functions');
  }
  return Plotly;
};

// Export visualization as viz (expects global Plotly)
export const viz = {
  scatter(x: number[], y: number[], element: string | HTMLElement, title = 'Scatter Plot') {
    const Plotly = getPlotly();
    
    const data = [{
      x, y,
      mode: 'markers',
      type: 'scatter'
    }];
    
    const layout = {
      title: { text: title },
      xaxis: { title: 'X' },
      yaxis: { title: 'Y' }
    };
    
    return Plotly.newPlot(element, data, layout);
  },
  
  line(x: number[], y: number[], element: string | HTMLElement, title = 'Line Plot') {
    const Plotly = getPlotly();
    
    const data = [{
      x, y,
      mode: 'lines',
      type: 'scatter'
    }];
    
    const layout = {
      title: { text: title },
      xaxis: { title: 'X' },
      yaxis: { title: 'Y' }
    };
    
    return Plotly.newPlot(element, data, layout);
  },
  
  polyloop(layers: any[], element: string | HTMLElement, title = 'Polyloop') {
    const Plotly = getPlotly();
    
    const traces = layers.map((layer, i) => ({
      r: layer.values || layer.durations || [1],
      theta: layer.angles || layer.positions || [0],
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
};