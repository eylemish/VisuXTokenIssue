import { useState, useEffect } from "react";
import { Modal, Tabs, Card, Row, Col, Button, Checkbox, message } from "antd";
import {
  BarChartOutlined,
  LineChartOutlined,
  PieChartOutlined,
  AreaChartOutlined,
  HeatMapOutlined,
  RadarChartOutlined,
  PictureOutlined,
  DotChartOutlined,
} from "@ant-design/icons";
import datasetManager from "../file/DatasetManager";

const { TabPane } = Tabs;

// Definition of chart categories
const chartCategories = {
  "Basic Charts": [
    { type: "scatter", name: "Scatter Plot", icon: <PictureOutlined />, requiredFeatures: 2 },
    { type: "line", name: "Line Chart", icon: <LineChartOutlined />, requiredFeatures: 2 },
    { type: "bar", name: "Bar Chart", icon: <BarChartOutlined />, requiredFeatures: 2 },
    { type: "pie", name: "Pie Chart", icon: <PieChartOutlined />, requiredFeatures: 1 },
  ],
  "Advanced Charts": [
    { type: "heatmap", name: "Heatmap", icon: <HeatMapOutlined />, requiredFeatures: 3 },
    { type: "radar", name: "Radar Chart", icon: <RadarChartOutlined />, requiredFeatures: 3 },
    { type: "dot", name: "Dot Chart", icon: <DotChartOutlined />, requiredFeatures: 2 },
    { type: "area", name: "Area Chart", icon: <AreaChartOutlined />, requiredFeatures: 2 },
  ],
};

const GraphModal = ({ visible, onCancel, uiController }) => {
  const [features, setFeatures] = useState([]); // 特征列
  const [selectedGraphType, setSelectedGraphType] = useState(null);
  const [selectedFeatures, setSelectedFeatures] = useState([]);
  const [numFeatures, setNumFeatures] = useState(0);
  const [loading, setLoading] = useState(false);

  // Get the feature columns of the current dataset
  useEffect(() => {
    const fetchFeatures = async () => {
      const datasetId = datasetManager.getCurrentDatasetId();
      if (!datasetId) {
        message.warning("No dataset ID found. Please upload a dataset.");
        return;
      }

      setLoading(true);
      try {
        const columns = await datasetManager.getDatasetColumns(datasetId);
        setFeatures(columns);
      } catch (error) {
        message.error("Failed to load dataset features.");
      } finally {
        setLoading(false);
      }
    };

    if (visible) {
      fetchFeatures();
    }
  }, [visible]);

  // Get the number of features needed for the selected chart.
  const getRequiredFeatures = (graphType) => {
    for (let category in chartCategories) {
      const chart = chartCategories[category].find((chart) => chart.type === graphType);
      if (chart) return chart.requiredFeatures;
    }
    return 0; // Default
  };

  // Listen to the selected chart type, update the required number of features and clear the selection
  useEffect(() => {
    if (selectedGraphType) {
      const required = getRequiredFeatures(selectedGraphType);
      setNumFeatures(required);
      setSelectedFeatures([]); // Clear selection when switching charts
    }
  }, [selectedGraphType]);

  // Confirm the creation of the chart
  const handleConfirm = async () => {
    if (selectedFeatures.length !== numFeatures) {
      message.warning(`Please select exactly ${numFeatures} features.`);
      return;
    }

    const datasetId = datasetManager.getCurrentDatasetId();
    if (!datasetId) {
      message.error("No dataset available.");
      return;
    }

    // Get the full dataset
    const dataset = await datasetManager.getDatasetById(datasetId);
    if (!dataset) {
      message.error("Failed to load dataset.");
      return;
    }

    // Build GraphInfo
    const graphInfo = {
      id: `graph-${Date.now()}`, // Generate a unique ID
      name: `New ${selectedGraphType} Chart`,
      type: selectedGraphType,
      dataset,
      selectedFeatures,
      style: { color: "blue" }, // Can be selected by the user in the UI
    };

    // Trigger UI controller actions
    uiController.handleUserAction({
      type: "CREATE_GRAPH",
      graphInfo,
    });

    onCancel(); // Close Modal
  };

  // Process feature selection
  const handleFeatureSelect = (checkedValues) => {
    setSelectedFeatures(checkedValues);
  };

  return (
    <Modal
      title="Create New Graph"
      visible={visible}
      onCancel={onCancel}
      footer={[
        <Button key="cancel" onClick={onCancel}>
          Cancel
        </Button>,
        <Button key="confirm" type="primary" disabled={!selectedGraphType || selectedFeatures.length !== numFeatures} onClick={handleConfirm}>
          Confirm
        </Button>,
      ]}
    >
      {loading ? (
        <p>Loading dataset features...</p>
      ) : (
        <>
          {/* Chart Selection Tabs */}
          <Tabs defaultActiveKey="1">
            {Object.entries(chartCategories).map(([category, charts]) => (
              <TabPane tab={category} key={category}>
                <Row gutter={[16, 16]}>
                  {charts.map((chart) => (
                    <Col span={6} key={chart.type}>
                      <Card
                        hoverable
                        style={{
                          textAlign: "center",
                          border: selectedGraphType === chart.type ? "2px solid #1890ff" : "1px solid #ccc",
                        }}
                        onClick={() => setSelectedGraphType(chart.type)}
                      >
                        <div style={{ fontSize: "24px", marginBottom: "8px" }}>{chart.icon}</div>
                        <p>{chart.name}</p>
                      </Card>
                    </Col>
                  ))}
                </Row>
              </TabPane>
            ))}
          </Tabs>

          {/* Display feature selection */}
          {selectedGraphType && (
            <div>
              <h3>Select {numFeatures} Features:</h3>
              <Checkbox.Group
                options={features.map((feature) => ({ label: feature, value: feature }))}
                value={selectedFeatures}
                onChange={handleFeatureSelect}
              />
            </div>
          )}
        </>
      )}
    </Modal>
  );
};

export default GraphModal;
