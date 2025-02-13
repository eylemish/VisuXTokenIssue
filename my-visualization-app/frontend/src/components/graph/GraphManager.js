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
      this.eventListeners = [];
      GraphManager.instance = this; // Saving the only instance
    }
    return GraphManager.instance;
  }

  //dont need this now
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

  createGraph(graphInfo) {
  const graphId = `graph_${Date.now()}`;

  if (!graphInfo.graphType) {
    console.error("Missing `graphType` in graphInfo.");
    return null;
  }

  const transformedDataset = {};
  if (graphInfo.dataset && graphInfo.dataset.records && graphInfo.dataset.features) {
    graphInfo.dataset.features.forEach(feature => {
      transformedDataset[feature] = graphInfo.dataset.records.map(record => record[feature]);
    });
  } else {
    console.error("Invalid dataset structure.");
    return null;
  }

  console.log(`Transformed dataset for Graph ID ${graphId}:`, transformedDataset);

  const newGraph = new Graph(
    graphId,
    graphInfo.graphName || graphId,
    transformedDataset,
    graphInfo.graphType, // Ensure that types are passed correctly
    graphInfo.selectedFeatures || [],
    {}
  );

  console.log(`Graph name ${newGraph.name}:`);
  this.addGraphToMap(newGraph);
  this.notify({ type: "graphUpdated" });

  return newGraph;
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
      console.log(`Switched Graph (ID: ${graphId}) to type: ${newType}`);
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
      this.notify({ type: "graphUpdated" });
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

  changeGraphColor(graphId, newColor) {
    const graph = this.graphs.get(graphId);
    if (graph) {
      graph.changeColor(newColor);
      console.log(`Graph (ID: ${graphId}) color changed to ${newColor}`);
      this.notify({ type: "graphUpdated" });
      return true;
    } else {
      console.warn(`GraphManager: Graph ID ${graphId} not found.`);
      return false;
    }
  }

  changeAxis(graphId, selectedAxis, newFeature) {
    const graph = this.graphs.get(graphId);
    let changedAxis;

    if (graph) {
      switch (selectedAxis) {
        case "x": 
          changedAxis = graph.setXAxis(newFeature);
          break;
        case "y":
          changedAxis = graph.setYAxis(newFeature);
          break;
        case "z":
          changedAxis = graph.setZAxis(newFeature);
          break;
        default:
          console.log("ERROR WITH AXIS");
          return false;
      }
      
      console.log(`Graph (ID: ${graphId}) changed feature of ${selectedAxis} to ${newFeature}`);
      this.notify({ type: "graphUpdated" });
      return true;
    } else {
      console.warn(`GraphManager: Graph ID ${graphId} not found.`);
      return false;
    }
}


  notify(data) {
    console.log("GraphManager triggered", data)
    this.eventListeners.forEach(callback => callback(data));
  }

  // Subscribe to changes
  onChange(callback) {
    this.eventListeners.push(callback);
  }
  
}

export default GraphManager.getInstance();
