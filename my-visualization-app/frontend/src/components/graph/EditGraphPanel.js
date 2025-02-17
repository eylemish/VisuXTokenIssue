import React, {useState, useEffect} from "react";
import {Card, Select, Button} from "antd";
import {ChromePicker} from "react-color";
import GraphManager from "./GraphManager";
import CurveFittingModal from "../modal/CurveFittingModal";

const EditGraphPanel = () => {
    const [graphDetails, setGraphDetails] = useState([]);
    const [selectedGraphForEdit, setSelectedGraphForEdit] = useState(null);
    const [editColor, setEditColor] = useState("#ffffff");
    const [curveFitVisible, setCurveFitVisible] = useState(false);

    useEffect(() => {
        const fetchGraphs = () => {
            const graphs = GraphManager.getAllGraphs().map((graph) => ({
                graphId: graph.id,
                graphName: graph.name,
                graphType: graph.type,
                xColumn: graph.xAxis,
                yColumn: graph.yAxis,
                dataset: graph.dataset || {},
                color: graph.style?.colorScheme || "#ffffff",
                style: graph.style,
            }));
            setGraphDetails(graphs);
        };

        fetchGraphs();
        GraphManager.onChange(fetchGraphs);

        return () => GraphManager.offChange(fetchGraphs);
    }, []);

    // Update colours after selecting charts
    const handleGraphSelect = (graphId) => {
        setSelectedGraphForEdit(graphId);
        const graph = graphDetails.find((g) => g.graphId === graphId);
        setEditColor(graph ? graph.color : "#ffffff");
    };

    // Colour Selection
    const handleColorChange = (color) => {
        setEditColor(color.hex);
    };

    // Submitting colour changes
    const handleEditGraphSubmit = () => {
        if (!selectedGraphForEdit) return;
        GraphManager.changeGraphColor(selectedGraphForEdit, editColor);
        setGraphDetails((prevState) =>
            prevState.map((graph) =>
                graph.graphId === selectedGraphForEdit
                    ? {...graph, color: editColor, style: {...graph.style, colorScheme: editColor}}
                    : graph
            )
        );
    };

    // Get the currently selected chart
    const selectedGraph = graphDetails.find((graph) => graph.graphId === selectedGraphForEdit);

    return (
        <Card title="Edit Graph" style={{width: "100%"}}>
            {/* Select chart */}
            <div style={{marginBottom: "10px"}}>
                <label style={{marginRight: "8px"}}>Graph: </label>
                <Select
                    style={{width: 250}}
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

            {/* Colour selection */}
            <div style={{marginBottom: "10px"}}>
                <label style={{marginRight: "8px"}}>Color: </label>
                <ChromePicker color={editColor} onChange={handleColorChange}/>
            </div>

            {/* Update colour button */}
            <Button type="primary" onClick={handleEditGraphSubmit}>
                Update Graph
            </Button>

            {/* Fit curve button */}
            <Button type="default" onClick={() => setCurveFitVisible(true)} style={{marginLeft: "10px"}}>
                Fit Curve
            </Button>

            {/* Curve Fitting Popup */}
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
