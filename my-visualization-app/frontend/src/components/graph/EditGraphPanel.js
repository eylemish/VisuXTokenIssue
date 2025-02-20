import React, { useState, useEffect } from "react";
import { Card, Select, Button, Dropdown, Space, Menu, Input, Divider} from "antd";
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
  const [multipleY, setMultipleY] = useState(false);
  const [filterData, setFilterData] = useState({
    include: [],
    exclude: []
  });
  const [isFilterVisible, setIsFilterVisible] = useState(false);

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
        graphDatasetId: graph.datasetId,
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

  const toggleFilterVisibility = () => setIsFilterVisible(!isFilterVisible);

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

  const handleFilterChange = (type, startValue, endValue) => {
    const start = Number(startValue);
    const end = Number(endValue);
    if (start && end && start <= end) {
      
      setFilterData((prevData) => {
        const newFilters = { ...prevData };
  
        
        if (newFilters[type]) {
          newFilters[type] = newFilters[type].filter(
            (filter) => !(filter.start === start && filter.end === end)
          );
        }
  
        
        newFilters[type] = [...(newFilters[type] || []), { start, end }];
        return newFilters;
      });
  
      if (selectedGraphForEdit) {
        const graph = GraphManager.getGraphById(selectedGraphForEdit);
        if (!graph) return;
  
        if (type === "include") {
          // Include range: Filter data points within the range
          GraphManager.restoreRangeToGraph(selectedGraphForEdit, start, end);
          console.log('include');
        } else if (type === "exclude") {
          // Exclude range: Filter data points outside the range
          GraphManager.excludeRangeFromGraph(selectedGraphForEdit, start, end);
        }
      }
    }
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

  const handleAddMultipleYClick = () =>{
    if (!selectedGraphForEdit) return;

    if (selectedGraphForEdit.type === 'line') {
      console.log("Button clicked");
    }
  }

  const renderShowedDatapoints = () => {
    if (!selectedGraph) return null;
    const showedDatapoints = selectedGraph.graphObject.showedDatapoints || [];
  
    if (showedDatapoints.length === 0) return null;
  
    // Küçükten büyüğe sıralama
    const sortedPoints = [...showedDatapoints].sort((a, b) => a - b);
    let ranges = [];
    let start = sortedPoints[0];
    let prev = sortedPoints[0];
  
    sortedPoints.slice(1).forEach((num) => {
      if (num === prev + 1) {
        prev = num;
      } else {
        ranges.push(start === prev ? `${start}` : `${start}-${prev}`);
        start = num;
        prev = num;
      }
    });
  
    ranges.push(start === prev ? `${start}` : `${start}-${prev}`);
    
    return (
      <div style={{ marginTop: "10px" }}>
        <label>Showing Data Points: </label>
        <p>{ranges.join(", ")}</p>
      </div>
    );
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

      <div style={{ display: "flex", flexDirection: "row", alignItems: "flex-start", gap: "20px" }}>
  <div style={{ display: "flex", flexDirection: "column" }}>
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

    <div style={{ marginBottom: "10px" }}>
        <label style={{ marginRight: "8px" }}>Select Chart Type: </label>
        <Dropdown overlay={renderChartCategories}>
          <Button>Select Chart Type</Button>
        </Dropdown>
      </div>

      <div style={{ marginBottom: "10px" }}>
      <Button
        type="default"
        onClick={handleAddMultipleYClick}
        style={{ marginTop: "10px", backgroundColor: selectedGraph && selectedGraph.graphType !== 'line' ? '#d9d9d9' : '' }}
        disabled={selectedGraph && selectedGraph.graphType !== 'line'}
      >
        Add Multiple Y
      </Button>
      </div>

  </div>

  
  <div style={{ display: "flex", flexDirection: "column" }}>
    <div style={{ marginBottom: "10px" }}>
      <label style={{ marginRight: "8px" }}>Color: </label>
      <ChromePicker color={editColor} onChange={handleColorChange} disableAlpha />
    </div>
    <Button type="primary" onClick={handleEditGraphSubmit}>Recolour Graph</Button>
    <Button type="default" onClick={() => setCurveFitVisible(true)}>Fit Curve</Button>
  </div>
</div>



  {renderShowedDatapoints()}
      <Divider />

<div style={{ marginBottom: "10px" }}>
  <label style={{ marginRight: "8px" }}>Include Filter (Start - End): </label>
  <Input.Group compact>
    <Input 
      style={{ width: '120px' }} 
      placeholder="Start"
      onChange={(e) => setFilterData({ ...filterData, start: e.target.value })}
    />
    <Input 
      style={{ width: '120px' }} 
      placeholder="End"
      onChange={(e) => setFilterData({ ...filterData, end: e.target.value })}
    />
    <Button 
      type="default" 
      onClick={() => handleFilterChange('include', filterData.start, filterData.end)}
    >
      Apply Include
    </Button>
  </Input.Group>
</div>

<div style={{ marginBottom: "10px" }}>
  <label style={{ marginRight: "8px" }}>Exclude Filter (Start - End): </label>
  <Input.Group compact>
    <Input 
      style={{ width: '120px' }} 
      placeholder="Start"
      onChange={(e) => setFilterData({ ...filterData, start: e.target.value })}
    />
    <Input 
      style={{ width: '120px' }} 
      placeholder="End"
      onChange={(e) => setFilterData({ ...filterData, end: e.target.value })}
    />
    <Button 
      type="default" 
      onClick={() => handleFilterChange('exclude', filterData.start, filterData.end)}
    >
      Apply Exclude
    </Button>
  </Input.Group>
</div>


      {curveFitVisible && selectedGraph && (
        <CurveFittingModal visible={curveFitVisible} onCancel={() => setCurveFitVisible(false)} graph={selectedGraph} />
      )}
    </Card>
  );
};

export default EditGraphPanel;
