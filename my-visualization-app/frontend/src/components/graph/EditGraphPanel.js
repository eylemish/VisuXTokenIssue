import React, { useState, useEffect } from "react";
import { Card, Select, Button } from "antd";
import { ChromePicker } from "react-color";
import GraphManager from "./GraphManager";
import VisualizationManager from "./VisualizationManager";

const visualizationManager = new VisualizationManager();

const EditGraphPanel = () => {
  const [graphDetails, setGraphDetails] = useState([]);
  const [selectedGraphForEdit, setSelectedGraphForEdit] = useState(null);
  const [editColor, setEditColor] = useState("#ffffff");

  useEffect(() => {
    const fetchGraphs = () => {
      const graphs = GraphManager.getAllGraphs().map((graph) => ({
        graphId: graph.id,
        graphName: graph.name,
        graphType: graph.type,
        color: graph.style?.colorScheme || "#ffffff",
        style: graph.style,
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
    </Card>
  );
};

export default EditGraphPanel;
