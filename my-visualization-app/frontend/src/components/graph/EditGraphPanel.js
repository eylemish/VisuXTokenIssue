import React, { useState, useEffect } from "react";
import { Card, Select, Button, Dropdown, Space, Menu } from "antd";
import { ChromePicker } from "react-color";
import GraphManager from "./GraphManager";
import VisualizationManager from "./VisualizationManager";
import CurveFittingModal from "../modal/CurveFittingModal";
import { chartCategories } from "./ChartCategories";

const visualizationManager = new VisualizationManager();

const EditGraphPanel = () => {
  const [graphDetails, setGraphDetails] = useState([]);
  const [selectedGraphForEdit, setSelectedGraphForEdit] = useState(null);
  const [editColor, setEditColor] = useState("#ffffff");
  const [selectedX, setSelectedX] = useState(null);
  const [selectedY, setSelectedY] = useState(null);
  const [selectedZ, setSelectedZ] = useState(null);
  const [selectedType, setSelectedType] = useState(null);
  const [curveFitVisible, setCurveFitVisible] = useState(false);

  // Fetch and update graph details on component mount and when graphs change
  useEffect(() => {
    const fetchGraphs = () => {
      const graphs = GraphManager.getAllGraphs().map((graph) => ({
        graphId: graph.id,
        graphName: graph.name,
        graphType: graph.type,
        graphFeatures: graph.selectedFeatures,
        xColumn: graph.xAxis,
        yColumn: graph.yAxis,
        dataset: graph.dataset || {},
        color: graph.style?.colorScheme || "#ffffff",
        style: graph.style,
        graphObject: graph,
      }));
      setGraphDetails(graphs);
    };

    fetchGraphs();
    GraphManager.onChange(fetchGraphs);

    return () => GraphManager.offChange(fetchGraphs);
  }, []);

  // Handle graph selection and update related properties
  const handleGraphSelect = (graphId) => {
    setSelectedGraphForEdit(graphId);
    const graph = graphDetails.find((g) => g.graphId === graphId);
    setEditColor(graph ? graph.color : "#ffffff");
    setSelectedX(graph?.graphFeatures[0] || null);
    setSelectedY(graph?.graphFeatures[1] || null);
    setSelectedZ(graph?.graphFeatures[2] || null);
  };

  // Handle color selection change
  const handleColorChange = (color) => {
    setEditColor(color.hex);
  };

  // Submit color changes to the graph
  const handleEditGraphSubmit = () => {
    if (!selectedGraphForEdit) return;
    GraphManager.changeGraphColor(selectedGraphForEdit, editColor);
    setGraphDetails((prevState) =>
      prevState.map((graph) =>
        graph.graphId === selectedGraphForEdit
          ? { ...graph, color: editColor, style: { ...graph.style, colorScheme: editColor } }
          : graph
      )
    );
  };

  const selectedGraph = graphDetails.find((graph) => graph.graphId === selectedGraphForEdit);

  return (
    <Card title="Edit Graph" style={{ width: "100%" }}>
      {/* Graph selection dropdown */}
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

      {/* Color selection using ChromePicker */}
      <div style={{ marginBottom: "10px" }}>
        <label style={{ marginRight: "8px" }}>Color: </label>
        <ChromePicker color={editColor} onChange={handleColorChange} />
      </div>

      {/* Button to update graph color */}
      <Button type="primary" onClick={handleEditGraphSubmit}>Update Graph</Button>

      {/* Button to open curve fitting modal */}
      <Button type="default" onClick={() => setCurveFitVisible(true)} style={{ marginLeft: "10px" }}>Fit Curve</Button>

      {/* Curve fitting modal popup */}
      {curveFitVisible && selectedGraph && (
        <CurveFittingModal
          visible={curveFitVisible}
          onCancel={() => setCurveFitVisible(false)}
          graph={selectedGraph || {}}
        />
      )}
    </Card>
  );
};

export default EditGraphPanel;