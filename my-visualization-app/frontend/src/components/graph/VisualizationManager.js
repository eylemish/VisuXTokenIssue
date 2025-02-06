import Plotly from 'react-plotly.js';

class VisualizationManager {
  constructor() {
    this.renderer = new PlotlyRenderer();
    this.graphStyle = new GraphStyle();
  }

  renderChart(graph) {
    const graphContainer = document.getElementById(graph.id);
    if (!graphContainer) {
      console.error(`Graph container with ID ${graph.id} not found.`);
      return;
    }

    const layout = {
      title: graph.name,
      xaxis: { title: graph.xAxisLabel },
      yaxis: { title: graph.yAxisLabel },
      showlegend: true,
      ...this.graphStyle.getLayout(),
    };

    const trace = {
      x: graph.dataset.x,
      y: graph.dataset.y,
      type: graph.type,
      mode: 'markers',
      marker: this.graphStyle.getMarkerStyle(),
    };

    Plotly.newPlot(graphContainer, [trace], layout);
  }

  highlightFeature(featureId) {
    console.log(`Highlighting feature: ${featureId}`);
    // Implement logic to highlight a specific feature on the graph
  }
}

class PlotlyRenderer {
  static render(graph) {
    const graphContainer = document.getElementById(graph.id);
    if (!graphContainer) return;

    Plotly.react(graphContainer, graph.data, graph.layout);
  }
}

class GraphStyle {
  constructor() {
    this.colorScheme = 'blue';
    this.markerStyle = { size: 8, color: 'blue' };
    this.layoutSize = { width: 600, height: 400 };
  }

  getLayout() {
    return {
      width: this.layoutSize.width,
      height: this.layoutSize.height,
      title: 'Graph Visualization',
    };
  }

  getMarkerStyle() {
    return this.markerStyle;
  }

  setColorScheme(colorScheme) {
    this.colorScheme = colorScheme;
    this.markerStyle.color = colorScheme;
  }

  updateMarkerStyle(style) {
    this.markerStyle = { ...this.markerStyle, ...style };
  }

  resizeLayout(width, height) {
    this.layoutSize = { width, height };
  }
}

export default VisualizationManager;
