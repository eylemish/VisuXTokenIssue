import Plot from "react-plotly.js";
import Plotly from 'plotly.js-dist';
import GraphStyle from "./GraphStyle";

class VisualizationManager {
    constructor() {
        this.graphStyle = new GraphStyle();
    }

    chartCategories = {
        "Basic Charts": [
            {type: "scatter", name: "Scatter Plot", requiredFeatures: 2},
            {type: "line", name: "Line Chart", requiredFeatures: 2},
            {type: "bar", name: "Bar Chart", requiredFeatures: 2},
            {type: "pie", name: "Pie Chart", requiredFeatures: 1},
        ],
        "Advanced Charts": [
            {type: "heatmap", name: "Heatmap", requiredFeatures: 3},
            {type: "radar", name: "Radar Chart", requiredFeatures: 3},
            {type: "dot", name: "Dot Chart", requiredFeatures: 2},
            {type: "area", name: "Area Chart", requiredFeatures: 2},
        ],
    };

    /**
     * Generate Plotly visualization data
     */
    visualize(graph) {
        const {dataset, type, selectedFeatures = [], name, style, fittedCurve} = graph;

        if (!type) {
            return null;
        }
        if (!dataset || typeof dataset !== "object") {
            return null;
        }

        // Extraction of `x` and `y` axis data
        const featureData = selectedFeatures.map((feature) => dataset?.[feature] || []);
        if (!featureData.every(Array.isArray) || featureData.some((arr) => arr.length === 0)) {
            console.error("Error: One or more selected features are not valid arrays.", featureData);
            return null;
        }

        // Getting the latest `GraphStyle`
        const graphStyle = graph.style instanceof GraphStyle ? graph.style : new GraphStyle();

        // raw data
        let plotData = {
            type: type === "scatter3d" ? "scatter3d" : type,
            mode: type === "scatter" || type === "scatter3d" ? "markers" : undefined,
            marker: {
                color: graphStyle.getMarkerStyle()?.color || "blue",
                size: graphStyle.getMarkerStyle()?.size || 8
            },
        };

        if (featureData.length >= 1) plotData.x = featureData[0];
        if (featureData.length >= 2) plotData.y = featureData[1];
        if (featureData.length >= 3) plotData.z = featureData[2];

        let traces = [plotData];

        // Amendments to the `fittedCurve` data format
        let fittedX = [];
        let fittedY = [];

        if (Array.isArray(fittedCurve) && fittedCurve.length > 0) {
            fittedX = fittedCurve.map(point => point.x);
            fittedY = fittedCurve.map(point => point.y);
        }

        // The fitted curve is plotted only if `fittedX` and `fittedY` are present.
        if (fittedX.length > 0 && fittedY.length > 0) {
            let fittedTrace = {
                type: "scatter",
                mode: "lines",
                x: fittedX,
                y: fittedY,
                line: {color: "red", width: 2},
                name: "Fitted Curve",
            };

            traces.push(fittedTrace);
        } else {
            console.warn("No valid fitted curve data found.");
        }

        // Build `layout`
        const layout = {
            title: name,
            xaxis: {title: selectedFeatures[0] || "X"},
            yaxis: {title: selectedFeatures[1] || "Y"},
            ...graphStyle.getLayout(),
        };

        // if (type === "scatter3d" || featureData.length >= 3) {
        //     layout.scene = {
        //         xaxis: {title: selectedFeatures[0] || "X"},
        //         yaxis: {title: selectedFeatures[1] || "Y"},
        //         zaxis: {title: selectedFeatures[2] || "Z"},
        //     };
        // }

        return {data: traces, layout};
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
