import Plotly from 'react-plotly.js';

class VisualizationManager {
  constructor() {
    this.renderer = new PlotlyRenderer();
    this.graphStyle = new GraphStyle();
  }

  chartCategories = {
    "Basic Charts": [
      { type: "scatter", name: "Scatter Plot", requiredFeatures: 2 },
      { type: "line", name: "Line Chart", requiredFeatures: 2 },
      { type: "bar", name: "Bar Chart", requiredFeatures: 2 },
      { type: "pie", name: "Pie Chart", requiredFeatures: 1 },
    ],
    "Advanced Charts": [
      { type: "heatmap", name: "Heatmap", requiredFeatures: 3 },
      { type: "radar", name: "Radar Chart", requiredFeatures: 3 },
      { type: "dot", name: "Dot Chart", requiredFeatures: 2 },
      { type: "area", name: "Area Chart", requiredFeatures: 2 },
    ],
  };

  visualize(Graph) {
    const { dataset, type, selectedFeatures, name, style } = Graph;

    // finding the required feature number depending on the graph type
    let requiredFeatures = 0;
    Object.values(this.chartCategories).forEach(category => {
      const chart = category.find(chart => chart.type === type);
      if (chart) requiredFeatures = chart.requiredFeatures;
    });

    // controllong features
    if (selectedFeatures.length !== requiredFeatures) {
      console.error(`Error: ${type} requires ${requiredFeatures} features, but ${selectedFeatures.length} selected.`);
      return null;
    }

    // taking data values from selected features
    const featureData = selectedFeatures.map(feature => dataset[feature]);

    // 4️⃣ Plotly verisini oluştur
    let plotData = {
      type: type,
      marker: { color: style.color || "red" }
    };

    // X,Y and Z (depending on the type)
    if (requiredFeatures >= 1) plotData.x = featureData[0]; // X axis
    if (requiredFeatures >= 2) plotData.y = featureData[1]; // Y axis
    if (requiredFeatures >= 3) plotData.z = featureData[2]; // 3D graph Z axis

    // Graph\Plotly script
    const graphScript = `
      Plotly.newPlot('graph', [${JSON.stringify(plotData)}], {
        title: '${name}',
        xaxis: { title: '${selectedFeatures[0] || "X"}' },
        yaxis: { title: '${selectedFeatures[1] || "Y"}' }
        ${requiredFeatures >= 3 ? `, zaxis: { title: '${selectedFeatures[2] || "Z"}' }` : ""}
      });
    `;

    return graphScript;
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
