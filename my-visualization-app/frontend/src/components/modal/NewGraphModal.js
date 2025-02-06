import React, { useState } from "react";
import { Modal, Tabs, Card, Row, Col, Button } from "antd";
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

const { TabPane } = Tabs;

// 定义图表选项 后期添加更多种类图表
const chartCategories = {
  "Basic Charts": [
    { type: "scatter", name: "Scatter Plot", icon: <PictureOutlined /> },
    { type: "line", name: "Line Chart", icon: <LineChartOutlined /> },
    { type: "bar", name: "Bar Chart", icon: <BarChartOutlined /> },
    { type: "pie", name: "Pie Chart", icon: <PieChartOutlined /> },
  ],
  "Advanced Charts": [
    { type: "heatmap", name: "Heatmap", icon: <HeatMapOutlined /> },
    { type: "radar", name: "Radar Chart", icon: <RadarChartOutlined /> },
    { type: "dot", name: "Dot Chart", icon: <DotChartOutlined /> },
    { type: "area", name: "Area Chart", icon: <AreaChartOutlined /> },
  ],
};

const GraphModal = ({ visible, onCancel, uiController }) => {
  const [selectedGraph, setSelectedGraph] = useState(null);

  const handleConfirm = () => {
    if (!selectedGraph) return;

    const action = {
      type: "CREATE_GRAPH",
      data: { graphType: selectedGraph },
    };

    uiController.handleUserAction(action);
    onCancel(); // 关闭 Modal
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
        <Button key="confirm" type="primary" disabled={!selectedGraph} onClick={handleConfirm}>
          Confirm
        </Button>,
      ]}
    >
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
                      border: selectedGraph === chart.type ? "2px solid #1890ff" : "1px solid #ccc",
                    }}
                    onClick={() => setSelectedGraph(chart.type)}
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
    </Modal>
  );
};

export default GraphModal;
