import React, { useState, useEffect } from "react";
import {
  Card,
  Typography,
  Row,
  Col,
  Tag,
  Spin,
  Divider,
  List,
  Button,
  Select,
} from "antd";
import Plot from "react-plotly.js";
import VisualizationManager from "./VisualizationManager";
import GraphManager from "./GraphManager";

// react-color kütüphanesini import et
import { ChromePicker } from "react-color";

const { Title, Paragraph } = Typography;
const visualizationManager = new VisualizationManager();

const GraphSection = () => {
  const [graphDetails, setGraphDetails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [visibleGraphs, setVisibleGraphs] = useState({});
  // Edit Graph bölümünde seçilen grafik ve renk için state'ler
  const [selectedGraphForEdit, setSelectedGraphForEdit] = useState(null);
  const [editColor, setEditColor] = useState("#ffffff"); // Başlangıçta beyaz

  useEffect(() => {
    const handleGraphChange = (data) => {
      if (data.type === "graphUpdated") {
        setGraphDetails((prevState) =>
          prevState.map((graph) =>
            graph.graphId === data.graphId
              ? {
                  ...graph,
                  graphScript: visualizationManager.visualize(graph),
                }
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
            color: graph.style?.colorScheme || "#ffffff", // Varsayılan renk (beyaz)
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
      GraphManager.onChange(() => {});
    };
  }, []);

  const toggleGraphVisibility = (graphId) => {
    setVisibleGraphs((prevState) => ({
      ...prevState,
      [graphId]: !prevState[graphId],
    }));
  };

  // Handler: Seçilen grafiğin ID'sini state'e aktarır ve o grafiğin mevcut rengini alır.
  const handleGraphSelect = (graphId) => {
    setSelectedGraphForEdit(graphId);
    const graph = graphDetails.find((g) => g.graphId === graphId);
    if (graph) {
      setEditColor(graph.color);
    } else {
      setEditColor("#ffffff");
    }
  };

  // Handler: Seçilen renk bilgisini state'e aktarır.
  const handleColorChange = (color) => {
    setEditColor(color.hex);
  };

  // Handler: "Update Graph" butonuna basıldığında ilgili grafik için rengi günceller.
  const handleEditGraphSubmit = () => {
    if (!selectedGraphForEdit) return;
    // GraphManager üzerinden grafiğin rengini değiştiriyoruz.
    GraphManager.changeGraphColor(selectedGraphForEdit, editColor);
    // Yerel state'te de güncelleme yapıyoruz.
    setGraphDetails((prevState) =>
      prevState.map((graph) =>
        graph.graphId === selectedGraphForEdit
          ? {
              ...graph,
              color: editColor,
              style: { ...graph.style, colorScheme: editColor },
              graphScript: visualizationManager.visualize({
                ...graph,
                style: { ...graph.style, colorScheme: editColor },
              }),
            }
          : graph
      )
    );
  };

  return (
    <Card style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <Title level={4} style={{ textAlign: "left" }}>
        Graphs
      </Title>

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
                          {`Graph ID: ${graph.graphId} - ${graph.graphType}`}
                        </span>
                        <Button
                          onClick={() => toggleGraphVisibility(graph.graphId)}
                          style={{ marginLeft: "auto" }}
                        >
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
                          <Paragraph strong>
                            Type: {graph.graphType}
                          </Paragraph>
                          <div>
                            <Paragraph strong>
                              Selected Features:
                            </Paragraph>
                            {graph.selectedFeatures &&
                            graph.selectedFeatures.length > 0 ? (
                              <Row gutter={[8, 8]}>
                                {graph.selectedFeatures.map(
                                  (feature, featureIndex) => (
                                    <Col span={8} key={featureIndex}>
                                      <Tag color="blue">{feature}</Tag>
                                    </Col>
                                  )
                                )}
                              </Row>
                            ) : (
                              <Tag color="red">No features selected</Tag>
                            )}
                          </div>

                          <Divider />

                          {data && layout ? (
                            <div
                              style={{
                                maxWidth: "600px",
                                margin: "0 auto",
                              }}
                            >
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

              {/* Edit Graph Bölümü */}
              <div style={{ marginTop: "20px", width: "100%" }}>
                <Card title="Edit Graph">
                  <div style={{ marginBottom: "10px" }}>
                    <label style={{ marginRight: "8px" }}>Graph: </label>
                    <Select
                      style={{ width: 250 }}
                      placeholder="Select a graph"
                      value={selectedGraphForEdit}
                      onChange={handleGraphSelect}
                    >
                      {graphDetails.map((graph) => (
                        <Select.Option key={graph.graphId} value={graph.graphId}>
                          {`Graph ${graph.graphId} - ${graph.graphType}`}
                        </Select.Option>
                      ))}
                    </Select>
                  </div>
                  <div style={{ marginBottom: "10px" }}>
                    <label style={{ marginRight: "8px" }}>Color: </label>
                    {/* Renk seçici */}
                    <ChromePicker
                      color={editColor}
                      onChange={handleColorChange}
                    />
                  </div>
                  <Button type="primary" onClick={handleEditGraphSubmit}>
                    Update Graph
                  </Button>
                </Card>
              </div>
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
