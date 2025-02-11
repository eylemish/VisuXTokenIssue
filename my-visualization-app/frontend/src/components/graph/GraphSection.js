import React, { useState, useEffect } from "react";
import { Card, Typography, Row, Col, Tag, Spin, Divider, List } from "antd";
import Plot from "react-plotly.js";
import VisualizationManager from "./VisualizationManager";
import GraphManager from "./GraphManager"; // Directly importing the instance

const { Title, Paragraph } = Typography;

const visualizationManager = new VisualizationManager();

const GraphSection = () => {
  const [graphDetails, setGraphDetails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [visibleGraphs, setVisibleGraphs] = useState({}); // Tracks visibility of graphs by their IDs

  useEffect(() => {
    const graphs = GraphManager.getAllGraphs(); // Singleton GraphManager used
    const validGraphDetails = graphs
      .map((graph) => {
        // Generate graph details and attempt to visualize
        const graphScript = visualizationManager.visualize(graph);

        // Only include graphs with valid visualization data
        if (graphScript) {
          return {
            graphId: graph.id,
            graphType: graph.type,
            selectedFeatures: graph.selectedFeatures,
            graphScript: graphScript, // Store the valid graph script
          };
        }
        return null; // Skip invalid graphs
      })
      .filter((graph) => graph !== null); // Remove any null values (invalid graphs)

    setGraphDetails(validGraphDetails);
    setLoading(false);
  }, []); // Empty dependency array means this will only run once after mount

  const toggleGraphVisibility = (graphId) => {
    setVisibleGraphs((prevState) => ({
      ...prevState,
      [graphId]: !prevState[graphId], // Toggle the visibility of the graph
    }));
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
              {/* List of graph names */}
              <Col span={24}>
                <List
                  size="large"
                  bordered
                  dataSource={graphDetails}
                  renderItem={(graph) => (
                    <List.Item
                      style={{ cursor: "pointer" }}
                      onClick={() => toggleGraphVisibility(graph.graphId)}
                    >
                      {`Graph ID: ${graph.graphId} - ${graph.graphType}`}
                    </List.Item>
                  )}
                />
              </Col>

              {/* Render graph images if visible */}
              {graphDetails.map((graph, index) => {
                const { graphScript, graphId } = graph;
                const { data, layout } = graphScript || {}; // Destructure the data and layout from visualization

                return (
                  <Col span={24} key={graphId} style={{ marginTop: "20px" }}>
                    {visibleGraphs[graphId] && ( // Check visibility state
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

                        {/* Render the Plotly graph here */}
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
    </Card>
  );
};

export default GraphSection;
