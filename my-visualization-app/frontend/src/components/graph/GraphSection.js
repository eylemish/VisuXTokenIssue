import React, { useState, useEffect } from "react";
import { Card, Row, Col, Spin, List, Button } from "antd";
import { CloseOutlined } from "@ant-design/icons";
import GraphManager from "./GraphManager";
import VisualizationManager from "./VisualizationManager";

const visualizationManager = new VisualizationManager();

// in GraphCard.js show individual graphs
const GraphSection = ({ updateGraphCards }) => {
    const [graphDetails, setGraphDetails] = useState([]);
    const [loading, setLoading] = useState(true);
    const [visibleGraphs, setVisibleGraphs] = useState({});
    const [combineGraphs, setCombineGraphs] = useState(false);

    useEffect(() => {
        const handleGraphChange = (data) => {
            if (data.type === "graphUpdated" || data.type === "curveFittingUpdated") {
                setGraphDetails((prevState) =>
                    prevState.map((graph) => {
                        if (graph.graphId === data.graphId) {
                            const updatedGraph = GraphManager.getGraphById(graph.graphId);
                            return {
                                ...graph,
                                graphScript: visualizationManager.visualize(updatedGraph),
                                key: Math.random(),
                            };
                        }
                        return graph;
                    })
                );
            }
        };

        GraphManager.onChange(handleGraphChange);

        const graphs = GraphManager.getAllGraphs();
        const validGraphDetails = graphs.map((graph) => {
            const graphScript = visualizationManager.visualize(graph);
            if (graphScript) {
                return {
                    graphId: graph.id,
                    graphName: graph.name,
                    graphType: graph.type,
                    selectedFeatures: graph.selectedFeatures,
                    graphScript: graphScript,
                    visible: graph.visible,
                    color: graph.style?.colorScheme || "#ffffff",
                    style: graph.style,
                };
            }
            return null;
        }).filter((graph) => graph !== null);

        setGraphDetails(validGraphDetails);

        const initialVisibleGraphs = validGraphDetails.reduce((acc, graph) => {
            acc[graph.graphId] = graph.visible;
            return acc;
        }, {});
        setVisibleGraphs(initialVisibleGraphs);

        // give `graphDetails` to `LayoutContainer`
        updateGraphCards(validGraphDetails.reduce((acc, graph) => {
            acc[graph.graphId] = graph;
            return acc;
        }, {}));

        setLoading(false);

        return () => {
            GraphManager.offChange(handleGraphChange);
        };
    }, []);

    // in `LayoutContainer` which graph to show
    const toggleGraphVisibility = (graphId) => {
        setVisibleGraphs((prevState) => ({
            ...prevState,
            [graphId]: !prevState[graphId],
        }));

        // `GraphCard` data
        updateGraphCards((prevCards) => ({
            ...prevCards,
            [graphId]: visibleGraphs[graphId] ? null : graphDetails.find(graph => graph.graphId === graphId),
        }));
    };

    const deleteGraph = (graphId) => {
        setGraphDetails((prevGraphs) => prevGraphs.filter(graph => graph.graphId !== graphId));
        GraphManager.deleteGraph(graphId);

        // delete
        updateGraphCards((prevCards) => {
            const newCards = { ...prevCards };
            delete newCards[graphId];
            return newCards;
        });
    };

    const handleLayerGraphs = () => {
        setCombineGraphs(!combineGraphs);

        if (!combineGraphs) {
            const combinedData = graphDetails
                .filter(graph => visibleGraphs[graph.graphId])
                .map((graph, index) => ({
                    ...graph.graphScript?.data[0],
                    name: graph.graphName,
                    line: { color: graph.color || `hsl(${(index * 50) % 360}, 100%, 50%)` },
                }));

            const layout = {
                title: "Combined Graphs",
                xaxis: { title: graphDetails[0]?.xAxis || "X-axis" },
                yaxis: { title: graphDetails[0]?.yAxis || "Y-axis" },
                showlegend: true,
            };

            //  `LayoutContainer` show combined graph，and hide individual `GraphCard`
            updateGraphCards({ combinedGraph: { graphId: "combinedGraph", graphScript: { data: combinedData, layout } } });

        } else {
                // show individual
    updateGraphCards((prevCards) => {
        const newCards = { ...prevCards };
        delete newCards["combinedGraph"];  // delete combined


        graphDetails.forEach(graph => {
            if (visibleGraphs[graph.graphId]) {
                newCards[graph.graphId] = graph;
            }
        });

        return newCards;
            });
        }
    };

    return (
        <Card style={{ height: "100%", display: "flex", flexDirection: "column" }}>
            <Button onClick={handleLayerGraphs} style={{ marginBottom: "20px" }}>
                {combineGraphs ? "Show Individual Graphs" : "Layer Graphs"}
            </Button>

            {loading ? <Spin size="large" /> : (
                <Row style={{ width: "100%" }}>
                    <Col span={24}>
                        <List
                            size="large"
                            bordered
                            dataSource={graphDetails}
                            renderItem={(graph) => (
                                <List.Item style={{ display: "flex", alignItems: "center" }}>
                                    <span
                                        style={{ cursor: "pointer" }}
                                        onClick={() => toggleGraphVisibility(graph.graphId)}
                                    >
                                        {`Graph ID: ${graph.graphName} - ${graph.graphType}`}
                                    </span>
                                    <Button
                                        onClick={() => toggleGraphVisibility(graph.graphId)}
                                        style={{ marginLeft: "auto" }}
                                    >
                                        {visibleGraphs[graph.graphId] ? "Hide" : "Show"}
                                    </Button>
                                    <Button
                                        type="primary"
                                        danger
                                        icon={<CloseOutlined />}
                                        onClick={() => deleteGraph(graph.graphId)}
                                    />
                                </List.Item>
                            )}
                        />
                    </Col>
                </Row>
            )}
        </Card>
    );
};

export default GraphSection;
