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
import { Modal, Tabs, Card, Row, Col, Button, Checkbox } from "antd";
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

// 定义图表选项 后期添加更多种类图表 // please comment in english
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
  const [data, setData] = useState(null);
  //const [features, setFeatures] = useState([]);
  const [selectedGraphType, setSelectedGraphType] = useState(null);
  const [selectedFeatures, setSelectedFeatures] = useState([]);
  const [numFeatures, setNumFeatures] = useState(0);

  // we need something to get actual data and features

  const features = ["id", "name", "age", "city", "salary"];

   useEffect(() => {
      const exampleData = [
            { "id": 1, "name": "Alice", "age": 25, "city": "New York", "salary": 50000 },
            { "id": 2, "name": "Bob", "age": 30, "city": "Los Angeles", "salary": 60000 },
            { "id": 3, "name": "Charlie", "age": 28, "city": "Chicago", "salary": 55000 },
            { "id": 4, "name": "David", "age": 35, "city": "Houston", "salary": 70000 },
            { "id": 5, "name": "Eve", "age": 27, "city": "San Francisco", "salary": 65000 },
            { "id": 6, "name": "Frank", "age": 32, "city": "Seattle", "salary": 62000 },
            { "id": 7, "name": "Grace", "age": 29, "city": "Boston", "salary": 58000 },
            { "id": 8, "name": "Hank", "age": 33, "city": "Denver", "salary": 63000 }
        ];
        setData(exampleData);
    }, []);

    const getRequiredFeatures = (graphType) => {
      for (let category in chartCategories) {
        const chart = chartCategories[category].find((chart) => chart.type === graphType);
        if (chart) return chart.requiredFeatures;
      }
      return 0; // Default to 0 if no chart type matches
    };
  
    // Update numFeatures whenever the selectedGraphType changes
    useEffect(() => {
      if (selectedGraphType) {
        const required = getRequiredFeatures(selectedGraphType);
        setNumFeatures(required);
      }
    }, [selectedGraphType]);

  const handleConfirm = () => {
    if (!data || selectedFeatures.length !== numFeatures) return;

    // Only trigger the action with the selected graph type and features
    const action = {
      type: "CREATE_GRAPH",
      graphInformation: {
        graphData: data,
        graphType: selectedGraphType,  // graph type
        features: selectedFeatures, // selected features
        graphTitle: "My New Graph", // selected graph name by user (will code it later)
        // xAxisLabel: "X-Axis",  maybe not now
        // yAxisLabel: "Y-Axis", 
        // colorScheme: "blue-red", 
    },
  };

    uiController.handleUserAction(action);
    onCancel(); // 关闭 Modal //please comment in english
  };

  const handleFeatureSelect = (checkedValues) => {
    setSelectedFeatures(checkedValues);  // Updating the selected features
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
    </Modal>
  );
};

export default GraphModal;