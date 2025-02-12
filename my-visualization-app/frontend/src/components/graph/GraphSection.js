import React, { useState, useEffect } from "react";
import { Card, Typography, Row, Col, Tag, Spin, Divider, List, Button } from "antd";
import Plot from "react-plotly.js";
import VisualizationManager from "./VisualizationManager";
import GraphManager from "./GraphManager";
import EditGraphModal from "../modal/EditGraphModal";

const { Title, Paragraph } = Typography;

const visualizationManager = new VisualizationManager();

const GraphSection = () => {
  const [graphDetails, setGraphDetails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [visibleGraphs, setVisibleGraphs] = useState({});
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedGraph, setSelectedGraph] = useState(null);

  useEffect(() => {
    const handleGraphChange = (data) => {
      if (data.type === 'graphColorChanged') {
        setGraphDetails((prevState) =>
          prevState.map((graph) =>
            graph.graphId === data.graphId
              ? { ...graph, graphScript: visualizationManager.visualize(graph) }
              : graph
          )
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
            graphType: graph.type,
            selectedFeatures: graph.selectedFeatures,
            graphScript: graphScript,
            visible: graph.visible, 
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
      GraphManager.onChange(() => {}); 
    };
  }, []);

  const toggleGraphVisibility = (graphId) => {
    setVisibleGraphs((prevState) => ({
      ...prevState,
      [graphId]: !prevState[graphId],
    }));
  };

  const handleEditGraph = (graphId) => {
    const graphToEdit = graphDetails.find((graph) => graph.graphId === graphId);
    setSelectedGraph(graphToEdit);
    setIsModalVisible(true);
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
  };

  const handleModalSave = (updatedGraph) => {
    setGraphDetails((prevState) =>
      prevState.map((graph) =>
        graph.graphId === updatedGraph.graphId ? updatedGraph : graph
      )
    );

    setGraphDetails((prevState) =>
      prevState.map((graph) => {
        if (graph.graphId === updatedGraph.graphId) {
          const updatedGraphScript = visualizationManager.visualize(updatedGraph);
          return { ...graph, graphScript: updatedGraphScript };
        }
        return graph;
      })
    );

    setIsModalVisible(false);
  };

  return (
    <Card style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <Title level={4} style={{ textAlign: "left" }}>Graphs</Title>

      {loading ? (
        <Spin size="large" />
      ) : (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center" }}>
          {graphDetails.length > 0 ? (
            <Row style={{ width: "100%" }}>
              <Col span={24}>
                <List
                  size="large"
                  bordered
                  dataSource={graphDetails}
                  renderItem={(graph) => (
                    <List.Item>
                      <span style={{ cursor: "pointer" }} onClick={() => toggleGraphVisibility(graph.graphId)}>
                        {`Graph ID: ${graph.graphId} - ${graph.graphType}`}
                      </span>
                      <Button onClick={() => toggleGraphVisibility(graph.graphId)} style={{ marginLeft: "auto" }}>
                        {visibleGraphs[graph.graphId] ? "Hide" : "Show"}
                      </Button>
                    </List.Item>
                  )}
                />
              </Col>

              {graphDetails.map((graph) => {
                const { graphScript, graphId } = graph;
                const { data, layout } = graphScript || {};

                return (
                  <Col span={24} key={graphId} style={{ marginTop: "20px" }}>
                    {visibleGraphs[graphId] && (
                      <Card
                        style={{ width: "100%", padding: "10px" }}
                        title={`Graph ID: ${graph.graphId}`}
                        bordered={true}
                      >
                        <Paragraph strong>Type: {graph.graphType}</Paragraph>

                        <div>
                          <Paragraph strong>Selected Features:</Paragraph>
                          {graph.selectedFeatures && graph.selectedFeatures.length > 0 ? (
                            <Row gutter={[8, 8]}>
                              {graph.selectedFeatures.map((feature, featureIndex) => (
                                <Col span={8} key={featureIndex}>
                                  <Tag color="blue">{feature}</Tag>
                                </Col>
                              ))}
                            </Row>
                          ) : (
                            <Tag color="red">No features selected</Tag>
                          )}
                        </div>

                        <Divider />

                        {data && layout ? (
                          <div style={{ maxWidth: "600px", margin: "0 auto" }}>
                            <Plot
                              data={data}
                              layout={layout}
                              config={{ responsive: true }}
                              style={{ width: "100%", height: "300px" }}
                            />
                          </div>
                        ) : (
                          <p>Graph data could not be visualized.</p>
                        )}

                        <Button
                          type="primary"
                          style={{ marginTop: "10px" }}
                          onClick={() => handleEditGraph(graphId)}
                        >
                          Edit Graph
                        </Button>
                      </Card>
                    )}
                  </Col>
                );
              })}
            </Row>
          ) : (
            <p>No Graphs Available</p>
          )}
        </div>
      )}

      {selectedGraph && (
        <EditGraphModal
          visible={isModalVisible}
          onCancel={handleModalCancel}
          onSave={handleModalSave}
          graphId={selectedGraph.graphId}
          graphDetails={selectedGraph}
        />
      )}
    </Card>
  );
};

export default GraphSection;
