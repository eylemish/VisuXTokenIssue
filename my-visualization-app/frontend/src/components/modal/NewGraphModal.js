// import React, { useState } from "react";
// import { Modal, Tabs, Card, Row, Col, Button } from "antd";
// import {
//   BarChartOutlined,
//   LineChartOutlined,
//   PieChartOutlined,
//   AreaChartOutlined,
//   HeatMapOutlined,
//   RadarChartOutlined,
//   PictureOutlined,
//   DotChartOutlined,
// } from "@ant-design/icons";

// const { TabPane } = Tabs;

// // 定义图表选项 后期添加更多种类图表
// const chartCategories = {
//   "Basic Charts": [
//     { type: "scatter", name: "Scatter Plot", icon: <PictureOutlined /> },
//     { type: "line", name: "Line Chart", icon: <LineChartOutlined /> },
//     { type: "bar", name: "Bar Chart", icon: <BarChartOutlined /> },
//     { type: "pie", name: "Pie Chart", icon: <PieChartOutlined /> },
//   ],
//   "Advanced Charts": [
//     { type: "heatmap", name: "Heatmap", icon: <HeatMapOutlined /> },
//     { type: "radar", name: "Radar Chart", icon: <RadarChartOutlined /> },
//     { type: "dot", name: "Dot Chart", icon: <DotChartOutlined /> },
//     { type: "area", name: "Area Chart", icon: <AreaChartOutlined /> },
//   ],
// };

// const GraphModal = ({ visible, onCancel, uiController }) => {
//   const [data, setData] = useState(null);
//   const [selectedGraph, setSelectedGraph] = useState(null); //?
//   const [features, setFeatures] = useState([]);
//   const [selectedFeatures, setSelectedFeatures] = useState([]);
//   const [numFeatures, setNumFeatures] = useState(0);

//   const handleConfirm = () => {
//     if (!selectedGraph) return;

//     const action = {
//       type: "CREATE_GRAPH",
//       data: { graphType: selectedGraph },
//     };

//     uiController.handleUserAction(action);
//     onCancel(); // 关闭 Modal
//   };

//   return (
//     <Modal
//       title="Create New Graph"
//       visible={visible}
//       onCancel={onCancel}
//       footer={[
//         <Button key="cancel" onClick={onCancel}>
//           Cancel
//         </Button>,
//         <Button key="confirm" type="primary" disabled={!selectedGraph} onClick={handleConfirm}>
//           Confirm
//         </Button>,
//       ]}
//     >
//       <Tabs defaultActiveKey="1">
//         {Object.entries(chartCategories).map(([category, charts]) => (
//           <TabPane tab={category} key={category}>
//             <Row gutter={[16, 16]}>
//               {charts.map((chart) => (
//                 <Col span={6} key={chart.type}>
//                   <Card
//                     hoverable
//                     style={{
//                       textAlign: "center",
//                       border: selectedGraph === chart.type ? "2px solid #1890ff" : "1px solid #ccc",
//                     }}
//                     onClick={() => setSelectedGraph(chart.type)}
//                   >
//                     <div style={{ fontSize: "24px", marginBottom: "8px" }}>{chart.icon}</div>
//                     <p>{chart.name}</p>
//                   </Card>
//                 </Col>
//               ))}
//             </Row>
//           </TabPane>
//         ))}
//       </Tabs>
//     </Modal>
//   );
// };

// export default GraphModal;


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

// Define chart options (more can be added later)
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
  const [features, setFeatures] = useState([]); // Features from backend
  const [selectedGraphType, setSelectedGraphType] = useState(null);
  const [selectedFeatures, setSelectedFeatures] = useState([]);
  const [numFeatures, setNumFeatures] = useState(0);
  const [loading, setLoading] = useState(false);

  // Fetch dataset features from backend
  useEffect(() => {
    const fetchFeatures = async () => {
      const datasetId = datasetManager.getCurrentDatasetId(); // Get the latest dataset ID
      if (!datasetId) {
        message.warning("No dataset ID found. Please upload a dataset.");
        return;
      }

      setLoading(true);
      try {
        const columns = await datasetManager.getDatasetColumns(datasetId); // Fetch columns
        setFeatures(columns);
      } catch (error) {
        message.error("Failed to load dataset features.");
      } finally {
        setLoading(false);
      }
    };

    if (visible) {
      fetchFeatures(); // Only fetch when modal is visible
    }
  }, [visible]);

  const getRequiredFeatures = (graphType) => {
    for (let category in chartCategories) {
      const chart = chartCategories[category].find((chart) => chart.type === graphType);
      if (chart) return chart.requiredFeatures;
    }
    return 0; // Default if no match
  };

  useEffect(() => {
    if (selectedGraphType) {
      const required = getRequiredFeatures(selectedGraphType);
      setNumFeatures(required);
    }
  }, [selectedGraphType]);

  const handleConfirm = () => {
    if (selectedFeatures.length !== numFeatures) {
      message.warning(`Please select exactly ${numFeatures} features.`);
      return;
    }

    const datasetId = datasetManager.getCurrentDatasetId();
    if (!datasetId) {
      message.error("No dataset available.");
      return;
    }

    const action = {
      type: "CREATE_GRAPH",
      graphInfo: {
        graphName: "My New Graph",
        datasetId, // Include dataset ID
        graphType: selectedGraphType,
        features: selectedFeatures,
      },
    };

    uiController.handleUserAction(action);
    onCancel(); // Close Modal
  };

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

          {/* Display Feature Selection */}
          {selectedGraphType && (
            <div>
              <h3>Required Features ({numFeatures}):</h3>
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
