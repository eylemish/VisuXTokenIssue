import Plot from 'react-plotly.js';

class VisualizationManager {
  constructor() {
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
    const { dataset, type, selectedFeatures = [], name, style } = Graph;

    // Make sure selectedFeatures is not undefined
    if (!Array.isArray(selectedFeatures) || selectedFeatures.length === 0) {
        console.error(`Error: selectedFeatures is invalid`, selectedFeatures);
        return null;
    }

    // Get the number of features required for this chart type
    let requiredFeatures = this.getRequiredFeatures(type);

    // Check that the number of features matches
    if (selectedFeatures.length !== requiredFeatures) {
        console.error(`Error: ${type} requires ${requiredFeatures} features, but received ${selectedFeatures.length}.`);
        return null;
    }

    // Get feature data
    const featureData = selectedFeatures.map(feature => dataset?.[feature] || []);

    // Ensure that all items in featureData are arrays
    if (!featureData.every(Array.isArray) || featureData.some(arr => arr.length === 0)) {
        console.error(`Error: One or more selected features are not valid arrays.`, featureData);
        return null;
    }

    // Building Plotly Data
    let plotData = {
        type: type,
        marker: { color: style?.color || "red" }
    };

    if (requiredFeatures >= 1) plotData.x = featureData[0];
    if (requiredFeatures >= 2) plotData.y = featureData[1];
    if (requiredFeatures >= 3) plotData.z = featureData[2];

    // Build Layout
    const layout = {
        title: name,
        xaxis: { title: selectedFeatures[0] || "X" },
        yaxis: { title: selectedFeatures[1] || "Y" },
        ...(requiredFeatures >= 3 ? { zaxis: { title: selectedFeatures[2] || "Z" } } : {})
    };

    return { data: [plotData], layout };
  }

  renderChart(graph) {
    if (!graph.dataset || !graph.selectedFeatures || graph.selectedFeatures.length === 0) {
      console.error("Error: Graph dataset or selected features are invalid.");
      return null;
    }

    // Getting Plotly Configuration Data
    const plotConfig = this.visualize(graph);
    if (!plotConfig) {
      console.error("Error: Failed to generate visualization data.");
      return null;
    }

    return (
      <Plot
        data={plotConfig.data}
        layout={plotConfig.layout}
        style={{ width: "100%", height: "100%" }}
      />
    );
  }

  getRequiredFeatures(type) {
    for (const category of Object.values(this.chartCategories)) {
      const chart = category.find(chart => chart.type === type);
      if (chart) return chart.requiredFeatures;
    }
    return 0;
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
