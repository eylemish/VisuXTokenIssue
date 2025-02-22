import GraphStyle from "./GraphStyle";
import { chartCategories } from "./ChartCategories";

class VisualizationManager {
  constructor() {
    this.graphStyle = new GraphStyle();
  }

  chartCategories = chartCategories;

  visualize(graph) {
    const { dataset, type, selectedFeatures = [], name, fittedCurve, moreYAxes } = graph;

    if (!type || !dataset || typeof dataset !== "object") {
      return null;
    }

    const featureData = this.#extractFeatureData(dataset, selectedFeatures);
    if (!featureData) return null;

    // Filtering data points
    const filteredData = this.#filterDataByShowedDatapoints(
      featureData,
      graph.showedDatapoints
    );

    // First trace
    let plotData = this.#applyGraphStyle(graph, filteredData);
    let traces = [plotData];

    // Curve fitting
    let fittedTrace = this.#applyFittedCurve(fittedCurve);
    if (fittedTrace) {
      traces.push(fittedTrace);
    }

    // More Traces for Y Axes
    const moreTraces = this.#applyMoreTraces(graph);
    if (moreTraces && moreTraces.length > 0) {
      traces = traces.concat(moreTraces);
    }

    // Layout
    const layout = this.#buildLayout(name, selectedFeatures);

    return { data: traces, layout };
  }

  #extractFeatureData(dataset, selectedFeatures) {
    const featureData = selectedFeatures.map(
      (feature) => dataset?.[feature] || []
    );
    if (
      !featureData.every(Array.isArray) ||
      featureData.some((arr) => arr.length === 0)
    ) {
      console.error(
        "Error: One or more selected features are not valid arrays.",
        featureData
      );
      return null;
    }
    return featureData;
  }

  #filterDataByShowedDatapoints(featureData, showedDatapoints) {
    return featureData.map((feature) => {
      return feature.filter((_, idx) => showedDatapoints.includes(idx + 1));
    });
  }

  #applyGraphStyle(graph, featureData) {
    switch (graph.type) {
      case "scatter":
        return this.#scatterPlot(featureData, graph);
      case "bar":
        return this.#barChart(featureData, graph);
      case "line":
        return this.#lineChart(featureData, graph);
      case "scatterpolar":
        return this.#polarChart(featureData, graph);
      case "heatmap":
        return this.#heatmapChart(featureData, graph);
      case "scatter3d":
        return this.#scatter3DPlot(featureData, graph);
      case "pie":
        return this.#pieChart(featureData, graph);
      case "area":
        return this.#areaChart(featureData, graph);
      default:
        console.warn("Unsupported graph type:", graph.type);
        return null;
    }
  }

  #scatterPlot(featureData, graph) {
    return {
      type: "scatter",
      mode: "markers",
      x: featureData[0],
      y: featureData[1],
      marker: {
        color: graph.style?.getMarkerStyle()?.color || "blue",
        size: graph.style?.getMarkerStyle()?.size || 8,
      },
    };
  }

  #barChart(featureData, graph) {
    return {
      type: "bar",
      x: featureData[0],
      y: featureData[1],
      marker: {
        color: graph.style?.getMarkerStyle()?.color || "blue",
      },
    };
  }

  #lineChart(featureData, graph) {
    return {
      type: "scatter",
      mode: "lines+markers",
      x: featureData[0],
      y: featureData[1],
      line: {
        color: graph.style?.getMarkerStyle()?.color || "green",
        width: 2,
      },
      marker: {
        color: graph.style?.getMarkerStyle()?.color,
        size: 8,
        symbol: "circle",
      },
      name: graph.selectedFeatures[1],
    };
  }

  #polarChart(featureData, graph) {
    return {
      type: "scatterpolar",
      r: featureData[0],
      theta: featureData[1],
      marker: {
        color: graph.style?.getMarkerStyle()?.color || "purple",
        size: graph.style?.getMarkerStyle()?.size || 8,
      },
    };
  }

  #scatter3DPlot(featureData, graph) {
    return {
      type: "scatter3d",
      mode: "markers",
      x: featureData[0],
      y: featureData[1],
      z: featureData[2],
      marker: {
        color: graph.style?.getMarkerStyle()?.color || "red",
        size: graph.style?.getMarkerStyle()?.size || 8,
      },
    };
  }

  #heatmapChart(featureData, graph) {
    return {
      type: "heatmap",
      x: featureData[0],
      y: featureData[1],
      z: featureData[2],
      colorscale: "Viridis",
    };
  }

  #pieChart(featureData, graph) {
    const labels = featureData[0] || [];
    const values = featureData[0] || [];
    return {
      type: "pie",
      labels: labels,
      values: values,
      marker: {
        colors:
          graph.style?.getMarkerStyle()?.color ||
          [
            "#FF7F0E",
            "#1F77B4",
            "#2CA02C",
            "#D62728",
            "#9467BD",
          ],
      },
      hole: 0.3,
    };
  }

  #areaChart(featureData, graph) {
    return {
      type: "scatter",
      mode: "lines",
      fill: "tozeroy",
      x: featureData[0],
      y: featureData[1],
      line: {
        color: graph.style?.getMarkerStyle()?.color || "blue",
        width: 2,
      },
    };
  }

  #applyFittedCurve(fittedCurve) {
    let fittedX = [];
    let fittedY = [];

    if (Array.isArray(fittedCurve) && fittedCurve.length > 0) {
      fittedX = fittedCurve.map((point) => point.x);
      fittedY = fittedCurve.map((point) => point.y);
    }

    if (fittedX.length > 0 && fittedY.length > 0) {
      return {
        type: "scatter",
        mode: "lines",
        x: fittedX,
        y: fittedY,
        line: { color: "red", width: 2 },
        name: "Fitted Curve",
      };
    } else {
      console.warn("No valid fitted curve data found.");
      return null;
    }
  }

  #buildLayout(name, selectedFeatures) {
    const layout = {
      xaxis: {
        title: selectedFeatures[0] || "X",
        gridcolor: "#DDDDDD",
        zerolinecolor: "#BBBBBB",
      },
      ...(selectedFeatures.length >= 2 && {
        yaxis: {
          title: selectedFeatures[1] || "Y",
          gridcolor: "#DDDDDD",
          zerolinecolor: "#BBBBBB",
        },
      }),
      ...(selectedFeatures.length === 3 && {
        zaxis: {
          title: selectedFeatures[2] || "Z",
          gridcolor: "#DDDDDD",
          zerolinecolor: "#BBBBBB",
        },
      }),
      plot_bgcolor: "rgba(245, 245, 245, 0.9)",
      paper_bgcolor: "white",
      margin: { l: 50, r: 50, t: 50, b: 50 },
    };

    return layout;
  }

  #applyMoreTraces(graph) {
    const additionalTraces = [];
    if (graph.moreYAxes && Array.isArray(graph.moreYAxes)) {
      graph.moreYAxes.forEach((axisName) => {
        if (graph.dataset && graph.dataset[axisName]) {
          let axisData = graph.dataset[axisName];
          if (
            graph.showedDatapoints &&
            Array.isArray(graph.showedDatapoints) &&
            graph.showedDatapoints.length > 0
          ) {
            axisData = axisData.filter((_, idx) =>
              graph.showedDatapoints.includes(idx + 1)
            );
          }
          const xFeature = graph.selectedFeatures[0];
          const xData = graph.dataset[xFeature] || [];
          const trace = {
            type: "scatter",
            mode: "lines+markers",
            x: xData,
            y: axisData,
            line: {
              color: graph.style?.getMarkerStyle()?.color || "blue",
              width: 2,
            },
            marker: {
              size: 8,
            },
            name: axisName,
          };
          additionalTraces.push(trace);
        }
      });
    }
    return additionalTraces;
  }
}

export default VisualizationManager;
