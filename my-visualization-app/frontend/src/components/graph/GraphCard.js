import React, { useState, useEffect, useRef } from "react";
import { Card, Spin } from "antd";
import Plotly from "plotly.js-dist";
import Plot from "react-plotly.js";
import GraphManager from "./GraphManager";
import VisualizationManager from "./VisualizationManager";

const visualizationManager = new VisualizationManager();

const GraphCard = ({ graphId, graphData }) => {
    const [graphScript, setGraphScript] = useState(null);
    const [loading, setLoading] = useState(true);
    const plotRef = useRef(null);
    const cardRef = useRef(null);

    useEffect(() => {
        if (graphData) {
            setGraphScript(graphData.graphScript);
            setLoading(false);
        } else {
            const graph = GraphManager.getGraphById(graphId);
            if (graph) {
                setGraphScript(visualizationManager.visualize(graph));
            }
            setLoading(false);
        }
    }, [graphId, graphData]);

    //show graph name or graph id
    const graphTitle = graphData.graphName ? graphData.graphName : `Graph ID: ${graphId}`;

    return (
        <Card
            ref={cardRef}
            title={
                <div className="drag-handle"
                    style={{
                        fontSize: "14px",
                        fontWeight: "bold",
                        cursor: "grab",
                        width: "100%",
                        padding: "5px",
                    }}>
                    {graphTitle}
                </div>
            }
            style={{
                width: "100%",
                height: "100%",
                minWidth: "400px",
                minHeight: "300px",
                display: "flex",
                flexDirection: "column",
                overflow: "visible",
            }}
            bordered={true}
        >
            {loading ? (
                <Spin size="large" />
            ) : graphScript ? (
                <Plot
                    ref={plotRef}
                    data={graphScript.data}
                    layout={{
                        ...graphScript.layout,
                        autosize: true,
                        margin: { t: 30, b: 30, l: 30, r: 30 },
                    }}
                    config={{ responsive: true }}
                    useResizeHandler={true}
                    style={{ width: "100%", height: "100%" }}
                />
            ) : (
                <p>Error loading graph.</p>
            )}
        </Card>
    );
};

export default GraphCard;
