import { enableMock, mockGraphs } from "./mockData";
import VisualizationManager from "./VisualizationManager";
import Graph from "./Graph";

class GraphManager {
  constructor() {
    if (!GraphManager.instance) {
      this.graphs = new Map();
      this.currentGraph = null;
      this.visualizationManager = new VisualizationManager();
      this.loadGraphs();
      GraphManager.instance = this; // Saving the only instance
    }
    return GraphManager.instance;
  }

  async loadGraphs() {
    if (enableMock) {
      console.log("Using Mock Data");
      mockGraphs.forEach((graph) => this.graphs.set(graph.id, graph));
    } else {
      try {
        const response = await fetch("http://localhost:5000/graphs");
        const data = await response.json();
        data.forEach((graph) => this.graphs.set(graph.id, graph));
        console.log("Loaded graphs from API:", data);
      } catch (error) {
        console.error("Failed to fetch graphs:", error);
      }
    }
  }

  // createGraph(name, type, dataset, style) {
  //   const graphId = `graph_${Date.now()}`;
  //   const newGraph = { id: graphId, name, type, dataset, style };
  //   this.graphs.set(graphId, newGraph);
  //   this.currentGraph = newGraph;
  //   console.log(`Created Graph: ${name} (ID: ${graphId})`);
  //   return newGraph;
  // }

  createGraph(graphInfo) {
    const graphId = `graph_${Date.now()}`;
    const newGraph = new Graph(
      graphId,
      graphInfo.graphName,
      graphInfo.graphData,
      graphInfo.graphType,
      graphInfo.selectedFeatures,
      {}
    )
    
    this.addGraphToMap(newGraph);
  }

  addGraphToMap(graph) {
    if (!(graph instanceof Graph)) {
      console.error("Invalid Graph object.");
      return false;
    }

    if (this.graphs.has(graph.id)) {
      console.warn(`Graph with ID ${graph.id} already exists in the map.`);
      return false;
    }

    this.graphs.set(graph.id, graph);
    console.log(`Graph (ID: ${graph.id}) added to map.`);
    return true;
  }


  deleteGraph(graphId) {
    if (this.graphs.has(graphId)) {
      this.graphs.delete(graphId);
      if (this.currentGraph?.id === graphId) {
        this.currentGraph = null;
      }
      console.log(`Deleted Graph (ID: ${graphId})`);
      return true;
    }
    console.warn(`Delete Failed: Graph (ID: ${graphId}) not found`);
    return false;
  }

  replaceGraph(graphId, newGraph) {
    if (this.graphs.has(graphId)) {
      this.graphs.set(graphId, newGraph);
      if (this.currentGraph?.id === graphId) {
        this.currentGraph = newGraph;
      }
      console.log(`Replaced Graph (ID: ${graphId})`);
      return true;
    }
    return false;
  }

  switchGraphType(graphId, newType) {
    const graph = this.graphs.get(graphId);
    if (graph) {
      graph.type = newType;
      console.log(`🔄 Switched Graph (ID: ${graphId}) to type: ${newType}`);
      if (this.visualizationManager) {
        this.visualizationManager.renderChart(graph);
      } else {
        console.warn("visualizationManager is undefined, cannot render chart");
      }
    }
  }

  getGraphById(graphId) {
  const graph = this.graphs.get(graphId);
  if (!graph) {
    console.warn(`GraphManager: Graph ID ${graphId} not found.`);
  }
  return graph || null;
}

  setCurrentGraph(graphId) {
    if (this.graphs.has(graphId)) {
      this.currentGraph = this.graphs.get(graphId);
      console.log(`Set Current Graph (ID: ${graphId})`);
      return true;
    }
    return false;
  }

  showDatasetPreview() {
    if (this.currentGraph) {
      console.log("Dataset Preview:", this.currentGraph.dataset);
    }
  }

  showFeatureSelectionMenu() {
    if (this.currentGraph) {
      console.log("Feature Selection Menu for:", this.currentGraph.name);
    }
  }

  updateGraph(graphId, dataset, style) {
    const graph = this.graphs.get(graphId);
    if (graph) {
      graph.dataset = dataset;
      graph.style = style;
      console.log(`Updated Graph (ID: ${graphId})`);
      return true;
    }
    return false;
  }

  getAllGraphs() {
    return Array.from(this.graphs.values());
  }

  static getInstance() {
    if (!GraphManager.instance) {
      GraphManager.instance = new GraphManager();
    }
    return GraphManager.instance;
  }
  
}

export default GraphManager.getInstance();
