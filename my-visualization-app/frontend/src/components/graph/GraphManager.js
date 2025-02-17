import { enableMock, mockGraphs } from "./mockData";
import VisualizationManager from "./VisualizationManager";
import Graph from "./Graph";
import { chartCategories } from "./ChartCategories";

class GraphManager {
  constructor() {
    if (!GraphManager.instance) {
      this.graphs = new Map();
      this.currentGraph = null;
      this.visualizationManager = new VisualizationManager();
      this.eventListeners = [];
      GraphManager.instance = this;
    }
    return GraphManager.instance;
  }

  /**
   * Create a new graph and add it to the graph map.
   */
  createGraph(graphInfo) {
    const graphId = `graph_${Date.now()}`;

    if (!graphInfo.graphType) {
      console.error("Missing `graphType` in graphInfo.");
      return null;
    }

    const transformedDataset = {};
    if (graphInfo.dataset && graphInfo.dataset.records && graphInfo.dataset.features) {
      graphInfo.dataset.features.forEach((feature) => {
        transformedDataset[feature] = graphInfo.dataset.records.map((record) => record[feature]);
      });
    } else {
      console.error("Invalid dataset structure.");
      return null;
    }

    const newGraph = new Graph(
      graphId,
      graphInfo.graphName || graphId,
      transformedDataset,
      graphInfo.graphType,
      graphInfo.selectedFeatures || [],
      {}
    );

    this.addGraphToMap(newGraph);
    this.notify({ type: "graphUpdated" });
    return newGraph;
  }

  /**
   * Add a graph object to the internal graph map.
   */
  addGraphToMap(graph) {
    if (!(graph instanceof Graph)) {
      console.error("Invalid Graph object.");
      return false;
    }
    if (this.graphs.has(graph.id)) {
      console.warn(`Graph with ID ${graph.id} already exists.`);
      return false;
    }
    this.graphs.set(graph.id, graph);
    return true;
  }

  /**
   * Apply curve fitting to a graph and notify listeners.
   */
  applyCurveFitting(graphId, fittedData) {
    const graph = this.graphs.get(graphId);
    if (!graph) {
      console.warn(`Graph ID ${graphId} not found.`);
      return false;
    }
    graph.setFittedCurve(fittedData);
    this.notify({ type: "graphUpdated", graphId });
    return true;
  }

  deleteGraph(graphId) {
    if (this.graphs.has(graphId)) {
      this.graphs.delete(graphId);
      if (this.currentGraph?.id === graphId) {
        this.currentGraph = null;
      }
      return true;
    }
    return false;
  }

  replaceGraph(graphId, newGraph) {
    if (this.graphs.has(graphId)) {
      this.graphs.set(graphId, newGraph);
      if (this.currentGraph?.id === graphId) {
        this.currentGraph = newGraph;
      }
      return true;
    }
    return false;
  }

  getGraphById(graphId) {
    const graph = this.graphs.get(graphId);
    if (!graph) {
      console.warn(`Graph ID ${graphId} not found.`);
    }
    return graph || null;
  }

  setCurrentGraph(graphId) {
    if (this.graphs.has(graphId)) {
      this.currentGraph = this.graphs.get(graphId);
      return true;
    }
    return false;
  }

  updateGraph(graphId, dataset, style) {
    const graph = this.graphs.get(graphId);
    if (graph) {
      graph.setDataset(dataset);
      graph.updateStyle(style);
      this.notify({ type: "graphUpdated" });
      return true;
    }
    return false;
  }

  getAllGraphs() {
    return Array.from(this.graphs.values());
  }

  changeGraphColor(graphId, newColor) {
    const graph = this.graphs.get(graphId);
    if (graph) {
      graph.changeColor(newColor);
      this.notify({ type: "graphUpdated" });
      return true;
    }
    return false;
  }

  changeAxis(graphId, selectedAxis, newFeature) {
    const graph = this.graphs.get(graphId);
    if (graph) {
      if (selectedAxis === "x") graph.setXAxis(newFeature);
      if (selectedAxis === "y") graph.setYAxis(newFeature);
      if (selectedAxis === "z") graph.setZAxis(newFeature);
      this.notify({ type: "graphUpdated" });
      return true;
    }
    return false;
  }

  changeType(graphId, newType) {
    const graph = this.graphs.get(graphId);
    if (graph) {
      graph.setType(newType);
      this.notify({ type: "graphUpdated" });
    }
  }

  notify(data) {
    console.log("GraphManager triggered", data);
    this.eventListeners.forEach((callback) => callback(data));
  }

  onChange(callback) {
    this.eventListeners.push(callback);
  }

  offChange(callback) {
    this.eventListeners = this.eventListeners.filter((fn) => fn !== callback);
  }
}

export default GraphManager.getInstance();
