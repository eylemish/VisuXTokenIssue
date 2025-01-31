import Graph from './Graph';
class GraphManager {
    constructor() {
        this.graphs = [];
    }

    addGraph(title, data, type) {
        const newGraph = new Graph(title, data, type);  // Graph sınıfından yeni bir grafik oluşturuyoruz
        this.graphs.push(newGraph);  // Grafiği graphs dizisine ekliyoruz
    }

    deleteGraph(graphId) {
        this.graphs = this.graphs.filter(graph => graph.id !== graphId);
    }

    getGraphs() {
        return this.graphs;
    }
}

export default GraphManager;
