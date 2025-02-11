import React, { useState, useEffect } from "react";
import { Card, Typography, Row, Col, Tag, Spin, Divider } from "antd";
import Plot from "react-plotly.js";
import VisualizationManager from "./VisualizationManager";
import GraphManager from "./GraphManager"; // Directly importing the instance

const { Title, Paragraph } = Typography;

const visualizationManager = new VisualizationManager();

const GraphSection = () => {
  const [graphDetails, setGraphDetails] = useState([]);
  const [loading, setLoading] = useState(true);

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

  return (
    <Card style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <Title level={4} style={{ textAlign: "left" }}>Graphs</Title>

      {loading ? (
        <Spin size="large" />
      ) : (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center" }}>
          {graphDetails.length > 0 ? (
            graphDetails.map((graph, index) => {
              const { graphScript } = graph;
              const { data, layout } = graphScript || {}; // Destructure the data and layout from visualization

              return (
                <Card
                  key={index}
                  style={{ width: "100%", marginBottom: "20px", padding: "10px" }}
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
                    <Plot
                      data={data}
                      layout={layout}
                      config={{ responsive: true }}
                      style={{ width: "100%", height: "400px" }} // Ensure responsive and fixed height
                    />
                  ) : (
                    <p>Graph data could not be visualized.</p>
                  )}
                </Card>
              );
            })
          ) : (
            <p>No Graphs Available</p>
          )}
        </div>
      )}
    </Card>
  );
};

export default GraphSection;
