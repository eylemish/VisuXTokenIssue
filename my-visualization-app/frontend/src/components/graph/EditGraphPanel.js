import React, { useState, useEffect } from "react";
import { Card, Select, Button, Dropdown, Space, Menu } from "antd";
import { ChromePicker } from "react-color";
import GraphManager from "./GraphManager";
import VisualizationManager from "./VisualizationManager";
import CurveFittingModal from "../modal/CurveFittingModal";

const visualizationManager = new VisualizationManager();

const EditGraphPanel = () => {
  const [graphDetails, setGraphDetails] = useState([]);
  const [selectedGraphForEdit, setSelectedGraphForEdit] = useState(null);
  const [editColor, setEditColor] = useState("#ffffff");
  const [selectedX, setSelectedX] = useState(null);
  const [selectedY, setSelectedY] = useState(null);
  const [selectedZ, setSelectedZ] = useState(null);
  
  const [curveFitVisible, setCurveFitVisible] = useState(false);

  useEffect(() => {
    const fetchGraphs = () => {
      const graphs = GraphManager.getAllGraphs().map((graph) => ({
        graphId: graph.id,
        graphName: graph.name,
        graphType: graph.type,
        xColumn: graph.xAxis,
        yColumn: graph.yAxis,
        color: graph.style?.colorScheme || "#ffffff",
        style: graph.style,
        graphObject: graph, //to save the original object
      }));
      setGraphDetails(graphs);
    };

    fetchGraphs(); // 初次加载

    const handleGraphChange = () => fetchGraphs();
    GraphManager.onChange(handleGraphChange);

    return () => GraphManager.offChange(handleGraphChange);
  }, []);

  // 选择图表后，更新颜色
  const handleGraphSelect = (graphId) => {
    setSelectedGraphForEdit(graphId);
    const graph = graphDetails.find((g) => g.graphId === graphId);
    setEditColor(graph ? graph.color : "#ffffff");

    setSelectedX(graph?.xColumn || null);
    setSelectedY(graph?.yColumn || null);
    setSelectedZ(graph?.zColumn || null);
  };

  // 颜色选择
  const handleColorChange = (color) => {
    setEditColor(color.hex);
  };

  // 提交颜色修改
  const handleEditGraphSubmit = () => {
    if (!selectedGraphForEdit) return;

    GraphManager.changeGraphColor(selectedGraphForEdit, editColor);

    // 更新 UI
    setGraphDetails((prevState) =>
      prevState.map((graph) =>
        graph.graphId === selectedGraphForEdit
          ? {
              ...graph,
              color: editColor,
              style: { ...graph.style, colorScheme: editColor },
            }
          : graph
      )
    );
  };

  const selectedGraph = graphDetails.find((graph) => graph.graphId === selectedGraphForEdit);

  const handleAxisChange = (axis, newFeature) => {
    if (!selectedGraphForEdit) return;
  

    if (axis === "x") setSelectedX(newFeature);
    if (axis === "y") setSelectedY(newFeature);
    if (axis === "z") setSelectedZ(newFeature);
  
    GraphManager.changeAxis(selectedGraphForEdit, axis, newFeature);
  };

  // const renderFeatureMenu = (axis) => (
  //   <Menu>
  //     {Object.keys(selectedGraph?.graph?.getdataset()).map((feature) => (
  //       <Menu.Item key={feature} onClick={() => handleAxisChange(axis, feature)}>
  //         {feature}
  //       </Menu.Item>
  //     ))}
  //   </Menu>
  // );

  const renderFeatureMenu = (axis) => {
    const dataset = selectedGraph?.graphObject?.getDataset
      ? selectedGraph.graphObject.getDataset()
      : null;
  
    if (!dataset) {
      return (
        <Menu>
          <Menu.Item disabled>No Features Available</Menu.Item>
        </Menu>
      );
    }
  
    return (
      <Menu>
        {Object.keys(dataset).map((feature) => (
          <Menu.Item key={feature} onClick={() => handleAxisChange(axis, feature)}>
            {feature}
          </Menu.Item>
        ))}
      </Menu>
    );
  };
  
  

  return (
    <Card title="Edit Graph" style={{ width: "100%" }}>
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
              {`Graph ${graph.graphName} - ${graph.graphType}`}
            </Select.Option>
          ))}
        </Select>
      </div>

      <div style={{ marginBottom: "10px" }}>
        <label style={{ marginRight: "8px" }}>Color: </label>
        <ChromePicker color={editColor} onChange={handleColorChange} />
      </div>

      <Button type="primary" onClick={handleEditGraphSubmit}>
        Update Graph
      </Button>
      <Button type="default" onClick={() => setCurveFitVisible(true)}>
        Fit Curve
      </Button>

      <div style={{ marginBottom: "10px" }}>
        <label style={{ marginRight: "8px" }}>X Axis: </label>
        <Dropdown overlay={renderFeatureMenu("x")}>
          <Button disabled={selectedX === null}>{selectedX || "Select X Axis"}</Button>
        </Dropdown>
      </div>

      <div style={{ marginBottom: "10px" }}>
        <label style={{ marginRight: "8px" }}>Y Axis: </label>
        <Dropdown overlay={renderFeatureMenu("y")}>
          <Button disabled={selectedY === null}>{selectedY || "Select Y Axis"}</Button>
        </Dropdown>
      </div>

      <div style={{ marginBottom: "10px" }}>
        <label style={{ marginRight: "8px" }}>Z Axis: </label>
        <Dropdown overlay={renderFeatureMenu("z")}>
          <Button disabled={selectedZ === null}>{selectedZ || "Select Z Axis"}</Button>
        </Dropdown>
      </div>


      {/* CurveFittingModal */}
      {curveFitVisible && (
        <CurveFittingModal
          visible={curveFitVisible}
          onCancel={() => setCurveFitVisible(false)}
          xColumn={selectedGraph.xColumn} 
          yColumn={selectedGraph.yColumn}
          
        />
      )}
    </Card>
  );
};

export default EditGraphPanel;
