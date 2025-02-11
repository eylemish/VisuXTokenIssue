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

// 定义图表类别
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

  // 获取当前数据集的特征列
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

  // 获取所选图表所需的特征数量
  const getRequiredFeatures = (graphType) => {
    for (let category in chartCategories) {
      const chart = chartCategories[category].find((chart) => chart.type === graphType);
      if (chart) return chart.requiredFeatures;
    }
    return 0; // 默认
  };

  // 监听所选图表类型的变化，并更新所需的特征数量
  useEffect(() => {
    if (selectedGraphType) {
      const required = getRequiredFeatures(selectedGraphType);
      console.log(`🔄 Updated numFeatures for ${selectedGraphType}: ${required}`);
      setNumFeatures(required);
      setSelectedFeatures([]); // 切换图表时清空特征选择
    }
  }, [selectedGraphType]);

  // 确保 `selectedGraphType` 被记录
  const handleGraphSelection = (graphType) => {
    console.log(`✅ User selected graph type: ${graphType}`);
    setSelectedGraphType(graphType);
  };

  // 确保 `graphType` 在 `handleConfirm` 里正确传递
  const handleConfirm = async () => {
    console.log("🛠️ Creating graph with info:", {
      graphType: selectedGraphType,
      datasetId: datasetManager.getCurrentDatasetId(),
      selectedFeatures,
    });

    if (!selectedGraphType) {
      console.error("❌ No graph type selected! selectedGraphType:", selectedGraphType);
      return;
    }

    const datasetId = datasetManager.getCurrentDatasetId();
    if (!datasetId) {
      message.error("No dataset available.");
      return;
    }

    const dataset = await datasetManager.getDatasetById(datasetId);
    if (!dataset) {
      message.error("Failed to load dataset.");
      return;
    }

    const graphInfo = {
      graphName: `New ${selectedGraphType} Chart`,
      graphType: selectedGraphType, // ✅ 确保 graphType 传递正确
      dataset,
      selectedFeatures,
    };

    console.log("📡 Sending graphInfo to UIController:", graphInfo);

    uiController.handleUserAction({
      type: "CREATE_GRAPH",
      graphInfo,
    });

    onCancel();
  };

  // 处理特征选择
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
          {/* 选择图表类型 */}
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
                        onClick={() => handleGraphSelection(chart.type)}
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

          {/* 选择特征 */}
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
