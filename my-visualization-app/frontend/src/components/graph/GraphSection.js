import React, {useState, useEffect} from "react";
import {
    Card,
    Row,
    Col,
    Spin,
    List,
    Button,
} from "antd";
import { CloseOutlined } from "@ant-design/icons";
import Plot from "react-plotly.js";
import VisualizationManager from "./VisualizationManager";
import GraphManager from "./GraphManager";
const visualizationManager = new VisualizationManager();

const GraphSection = () => {
    const [graphDetails, setGraphDetails] = useState([]);
    const [loading, setLoading] = useState(true);
    const [visibleGraphs, setVisibleGraphs] = useState({});
    const [combineGraphs, setCombineGraphs] = useState(false);

    useEffect(() => {
        const handleGraphChange = (data) => {
            console.log("GraphSection received update event:", data);
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
        const validGraphDetails = graphs
            .map((graph) => {
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
            })
            .filter((graph) => graph !== null);

        setGraphDetails(validGraphDetails);

        const initialVisibleGraphs = validGraphDetails.reduce((acc, graph) => {
            acc[graph.graphId] = graph.visible;
            return acc;
        }, {});
        setVisibleGraphs(initialVisibleGraphs);
        setLoading(false);

        return () => {
            GraphManager.offChange(handleGraphChange);
        };
    }, []);

    const toggleGraphVisibility = (graphId) => {
        setVisibleGraphs((prevState) => ({
            ...prevState,
            [graphId]: !prevState[graphId],
        }));

        GraphManager.changeVisibility(graphId);
    };


    const deleteGraph = (graphId) => {
      setGraphDetails((prevGraphs) => prevGraphs.filter(graph => graph.graphId !== graphId));
      GraphManager.deleteGraph(graphId);
  };


    const handleLayerGraphs = () => {
        setCombineGraphs(!combineGraphs);
      };
    
      const combineGraphData = () => {
        const combinedData = graphDetails
          .filter((graph) => visibleGraphs[graph.graphId])
          .map((graph, index) => {
            const color = graph.color || `hsl(${(index * 50) % 360}, 100%, 50%)`;
            return {
              ...graph.graphScript?.data[0],
              name: graph.graphName,
              line: { color: color },
            };
          });
    
        const layout = {
          title: "Combined Graphs",
          xaxis: { title: graphDetails[0]?.xAxis },
          yaxis: { title: graphDetails[0]?.yAxis },
          showlegend: true,
        };
        return { data: combinedData, layout };
      };

      return (
        <Card style={{ height: "100%", display: "flex", flexDirection: "column" }}>
          <Button onClick={handleLayerGraphs} style={{ marginBottom: "20px" }}>
            {combineGraphs ? "Show Individual Graphs" : "Layer Graphs"}
          </Button>
    
          {loading ? (
            <Spin size="large" />
          ) : (
            <div
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              {graphDetails.length > 0 ? (
                <>
                  <Row style={{ width: "100%" }}>
                    <Col span={24}>
                      <List
                        size="large"
                        bordered
                        dataSource={graphDetails}
                        renderItem={(graph) => (
                          <List.Item
                            style={{ display: "flex", alignItems: "center" }}
                          >
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
    
                    <Col span={24} style={{ marginTop: "20px" }}>
                      <Card style={{ width: "100%", padding: "10px" }} bordered={true}>
                        {combineGraphs ? (
                          <div
                            style={{
                              maxWidth: "600px",
                              margin: "0 auto",
                            }}
                          >
                            <Plot
                              key={Math.random()}
                              data={combineGraphData().data}
                              layout={combineGraphData().layout}
                              config={{ responsive: true }}
                              style={{
                                width: "100%",
                                height: "300px",
                              }}
                            />
                          </div>
                        ) : (
                          graphDetails.map((graph) => {
                            const { graphScript, graphId, graphName } = graph;
                            const { data, layout } = graphScript || {};
                            return (
                              <div key={graphId}>
                                {visibleGraphs[graphId] && (
                                  <Card
                                    style={{
                                      width: "100%",
                                      padding: "10px",
                                      marginTop: "20px",
                                    }}
                                    title={`Graph ID: ${graphName}`}
                                    bordered={true}
                                  >
                                    <Plot
                                      key={Math.random()}
                                      data={data}
                                      layout={layout}
                                      config={{ responsive: true }}
                                      style={{
                                        width: "100%",
                                        height: "300px",
                                      }}
                                    />
                                  </Card>
                                )}
                              </div>
                            );
                          })
                        )}
                      </Card>
                    </Col>
                  </Row>
                </>
              ) : (
                <p>No Graphs Available</p>
              )}
            </div>
          )}
        </Card>
      );
    };
    
    export default GraphSection;