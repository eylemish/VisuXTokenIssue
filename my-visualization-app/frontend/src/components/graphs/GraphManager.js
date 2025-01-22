class GraphManager {
    constructor() {
        this.graphs = [];
    }

    addGraph(graphData) {
        const newGraph = { id: Date.now(), data: graphData };
        this.graphs.push(newGraph);
    }

    deleteGraph(graphId) {
        this.graphs = this.graphs.filter(graph => graph.id !== graphId);
    }

    getGraphs() {
        return this.graphs;
    }
}

export default GraphManager;
