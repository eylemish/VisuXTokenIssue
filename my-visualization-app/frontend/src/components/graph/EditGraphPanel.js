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
        graphObject: graph, //to save the original object
      }));
      setGraphDetails(graphs);
    };

    fetchGraphs();

    const handleGraphChange = () => fetchGraphs();
    GraphManager.onChange(fetchGraphs);

    return () => GraphManager.offChange(fetchGraphs);
  }, []);

  const handleGraphSelect = (graphId) => {
    setSelectedGraphForEdit(graphId);
    const graph = graphDetails.find((g) => g.graphId === graphId);
    setEditColor(graph ? graph.color : "#ffffff");
    setSelectedX(graph?.graphFeatures[0] || null);
    setSelectedY(graph?.graphFeatures[1] || null);
    setSelectedZ(graph?.graphFeatures[2] || null);
  };

  const handleColorChange = (color) => {
    setEditColor(color.hex);
  };

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

  const handleAxisChange = (axis, newFeature) => {
    if (!selectedGraphForEdit) return;
    if (axis === "x") setSelectedX(newFeature);
    if (axis === "y") setSelectedY(newFeature);
    if (axis === "z") setSelectedZ(newFeature);
    GraphManager.changeAxis(selectedGraphForEdit, axis, newFeature);
  };


  const renderFeatureSelect = (axis, selectedValue, setSelectedValue) => {
    const dataset = selectedGraph?.graphObject?.getDataset
      ? selectedGraph.graphObject.getDataset()
      : null;
  
    if (!dataset) {
      return (
        <Select disabled placeholder="No Features Available" style={{ width: 200 }} />
      );
    }
  
    return (
      <Select
        showSearch
        style={{ width: 200 }}
        placeholder={`Select ${axis.toUpperCase()} Axis`}
        optionFilterProp="children"
        value={selectedValue}
        onChange={(value) => {
          setSelectedValue(value);
          handleAxisChange(axis, value);
        }}
        onSearch={(value) => console.log(`Search ${axis}:`, value)}
      >
        {Object.keys(dataset).map((feature) => (
          <Select.Option key={feature} value={feature}>
            {feature}
          </Select.Option>
        ))}
      </Select>
    );
  };
  

  const handleTypeChange = (newType) => {
    if (!selectedGraphForEdit) return;
    setSelectedType(newType);
    GraphManager.changeType(selectedGraphForEdit, newType);

     //rerendering is for when the new type has different amount of features than the old one
    const updatedGraph = graphDetails.find((graph) => graph.graphId === selectedGraphForEdit);
    if (updatedGraph) {
      setSelectedX(updatedGraph.graphFeatures[0] || null);
      setSelectedY(updatedGraph.graphFeatures[1] || null);
      setSelectedZ(updatedGraph.graphFeatures[2] || null);
    }
  };

  const renderChartCategories = () => (
    <Menu>
      {Object.entries(chartCategories).map(([category, charts]) => (
        <Menu.SubMenu key={category} title={category}>
          {charts.map((chart) => (
            <Menu.Item
              key={chart.type}
              onClick={() => handleTypeChange(chart.type)}
            >
              <Space>
                {chart.icon} {chart.name}
              </Space>
            </Menu.Item>
          ))}
        </Menu.SubMenu>
      ))}
    </Menu>
  );


  return (
    <Card title="Edit Graph" style={{ width: "100%" }}>
      <div style={{ marginBottom: "10px" }}>
        <label style={{ marginRight: "8px" }}>Graph: </label>
        <Select style={{ width: 250 }} placeholder="Select a graph" value={selectedGraphForEdit} onChange={handleGraphSelect}>
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

      <Button type="primary" onClick={handleEditGraphSubmit}>Recolour Graph</Button>
      <Button type="default" onClick={() => setCurveFitVisible(true)}>Fit Curve</Button>

      <div style={{ marginBottom: "10px" }}>
        <label style={{ marginRight: "8px" }}>Select Chart Type: </label>
        <Dropdown overlay={renderChartCategories}>
          <Button>Select Chart Type</Button>
        </Dropdown>
      </div>


     
  <div style={{ marginBottom: "10px" }}>
    <label style={{ marginRight: "8px" }}>X Axis: </label>
    {renderFeatureSelect("x", selectedX, setSelectedX)}
  </div>
  
  <div style={{ marginBottom: "10px" }}>
    <label style={{ marginRight: "8px" }}>Y Axis: </label>
    {renderFeatureSelect("y", selectedY, setSelectedY)}
  </div>
  
  <div style={{ marginBottom: "10px" }}>
    <label style={{ marginRight: "8px" }}>Z Axis: </label>
    {renderFeatureSelect("z", selectedZ, setSelectedZ)}
  </div>

      {curveFitVisible && selectedGraph && (
        <CurveFittingModal visible={curveFitVisible} onCancel={() => setCurveFitVisible(false)} graph={selectedGraph} />
      )}
    </Card>
  );
};

export default EditGraphPanel;
