import Plot from "react-plotly.js";

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
   * 生成 Plotly 可视化数据
   */
  visualize(graph) {
    const { dataset, type, selectedFeatures = [], name, style } = graph;

    if (!type) {
      console.error("❌ Graph type is undefined!");
      return null;
    }

    // 获取该图表类型所需的特征数
    const requiredFeatures = this.getRequiredFeatures(type);
    if (selectedFeatures.length !== requiredFeatures) {
      console.error(
        `❌ Error: ${type} requires ${requiredFeatures} features, but received ${selectedFeatures.length}.`
      );
      return null;
    }

    // 确保 dataset 存在
    if (!dataset || typeof dataset !== "object") {
      console.error(`❌ Error: Invalid dataset format`, dataset);
      return null;
    }

    // 解析数据
    const featureData = selectedFeatures.map((feature) => dataset?.[feature] || []);
    if (!featureData.every(Array.isArray) || featureData.some((arr) => arr.length === 0)) {
      console.error(`❌ Error: One or more selected features are not valid arrays.`, featureData);
      return null;
    }

    // 生成 Plotly 数据
    let plotData;
    if (type === "pie") {
      plotData = {
        type: "pie",
        labels: featureData[0],
        values: featureData[0].map(() => 1), // Pie 需要 `values`，这里只是占位
      };
    } else {
      plotData = {
        type: type === "scatter3d" ? "scatter3d" : type, // 3D 散点图
        mode: type === "scatter" || type === "scatter3d" ? "markers" : undefined,
        marker: { color: style?.color || "blue" },
      };

      if (requiredFeatures >= 1) plotData.x = featureData[0]; // X 轴
      if (requiredFeatures >= 2) plotData.y = featureData[1]; // Y 轴
      if (requiredFeatures >= 3) plotData.z = featureData[2]; // Z 轴 (3D)
    }

    // 构建布局
    const layout = {
      title: name,
      xaxis: { title: selectedFeatures[0] || "X" },
      yaxis: { title: selectedFeatures[1] || "Y" },
      ...this.graphStyle.getLayout(),
    };

    // 3D 图表布局
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
   * 渲染 Plotly 图表
   */
  renderChart(graph) {
  console.log(`📊 Rendering Graph: ${graph.id}`, graph);

  const plotConfig = this.visualize(graph);
  if (!plotConfig) {
    console.error(`❌ Failed to generate visualization data for Graph: ${graph.id}`);
    return;
  }

  const graphContainer = document.getElementById(`plot_${graph.id}`);
  if (!graphContainer) {
    console.error(`❌ Graph container not found: plot_${graph.id}`);
    return;
  }

  console.log(`✅ Rendering Plotly chart in: plot_${graph.id}`);

  Plotly.newPlot(graphContainer, plotConfig.data, plotConfig.layout);
}

  /**
   * 获取图表类型所需的特征数
   */
  getRequiredFeatures(type) {
    if (!type) {
      console.error("❌ Graph type is undefined!");
      return 0;
    }

    for (const category of Object.values(this.chartCategories)) {
      const chart = category.find((chart) => chart.type === type);
      if (chart) return chart.requiredFeatures;
    }

    console.warn(`⚠️ No matching chart type found for: ${type}`);
    return 0;
  }
}

class GraphStyle {
  constructor() {
    this.colorScheme = "blue";
    this.markerStyle = { size: 8, color: "blue" };
    this.layoutSize = { width: 600, height: 400 };
  }

  getLayout() {
    return {
      width: this.layoutSize.width,
      height: this.layoutSize.height,
      title: "Graph Visualization",
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
