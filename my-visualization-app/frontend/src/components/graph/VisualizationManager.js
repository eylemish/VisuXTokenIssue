import Plot from "react-plotly.js";
import Plotly from 'plotly.js-dist';
import GraphStyle from "./GraphStyle";

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

  /**
   * Generate Plotly visualisation data
   */
  visualize(graph) {
    const { dataset, type, selectedFeatures = [], name, style } = graph;

    if (!type) {
      console.error("❌ Graph type is undefined!");
      return null;
    }

    // Get the number of features required for this chart type
    const requiredFeatures = this.getRequiredFeatures(type);
    if (selectedFeatures.length !== requiredFeatures) {
      console.error(
        `❌ Error: ${type} requires ${requiredFeatures} features, but received ${selectedFeatures.length}.`
      );
      return null;
    }

    // Make sure the dataset exists
    if (!dataset || typeof dataset !== "object") {
      console.error(`❌ Error: Invalid dataset format`, dataset);
      return null;
    }

    // parsing data
    const featureData = selectedFeatures.map((feature) => dataset?.[feature] || []);
    if (!featureData.every(Array.isArray) || featureData.some((arr) => arr.length === 0)) {
      console.error(`❌ Error: One or more selected features are not valid arrays.`, featureData);
      return null;
    }

    // Generate Plotly data
    let plotData;
    if (type === "pie") {
      plotData = {
        type: "pie",
        labels: featureData[0],
        values: featureData[0].map(() => 1), // Pie needs `values`, this is just a placeholder.
      };
    } else {
      plotData = {
        type: type === "scatter3d" ? "scatter3d" : type, // 3D Scatterplot
        mode: type === "scatter" || type === "scatter3d" ? "markers" : undefined,
        marker: { color: style?.color || "blue" },
      };

      if (requiredFeatures >= 1) plotData.x = featureData[0]; // X-axis
      if (requiredFeatures >= 2) plotData.y = featureData[1]; // Y-axis
      if (requiredFeatures >= 3) plotData.z = featureData[2]; // Z-axis (3D)
    }

    // Build the layout
    const layout = {
      title: name,
      xaxis: { title: selectedFeatures[0] || "X" },
      yaxis: { title: selectedFeatures[1] || "Y" },
      ...this.graphStyle.getLayout(),
    };

    // 3D chart layout
    if (type === "scatter3d" || requiredFeatures >= 3) {
      layout.scene = {
        xaxis: { title: selectedFeatures[0] || "X" },
        yaxis: { title: selectedFeatures[1] || "Y" },
        zaxis: { title: selectedFeatures[2] || "Z" },
      };
    }

    return { data: [plotData], layout };
  }

  /**
   * Rendering Plotly Charts
   */
  renderChart(graph) {
  console.log(`Rendering Graph: ${graph.id}`, graph);

  const plotConfig = this.visualize(graph);
  if (!plotConfig) {
    console.error(`Failed to generate visualization data for Graph: ${graph.id}`);
    return;
  }

  const graphContainer = document.getElementById(`plot_${graph.id}`);
  if (!graphContainer) {
    console.error(`Graph container not found: plot_${graph.id}`);
    return;
  }

  console.log(`Rendering Plotly chart in: plot_${graph.id}`);

  Plotly.newPlot(graphContainer, plotConfig.data, plotConfig.layout);
}

  /**
   * Get the number of features required for the chart type
   */
  getRequiredFeatures(type) {
    if (!type) {
      console.error("Graph type is undefined!");
      return 0;
    }

    for (const category of Object.values(this.chartCategories)) {
      const chart = category.find((chart) => chart.type === type);
      if (chart) return chart.requiredFeatures;
    }

    console.warn(`No matching chart type found for: ${type}`);
    return 0;
  }
}

export default VisualizationManager;
