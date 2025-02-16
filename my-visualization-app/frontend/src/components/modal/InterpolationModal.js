import React, { useEffect, useState } from "react";
import { Modal, Button, Select, message, Table, Input, Checkbox, InputNumber, Radio } from "antd";
import Action from "../Action";

// Get CSRF Token（fit Django）
function getCSRFToken() {
  let cookieValue = null;
  if (document.cookie) {
    document.cookie.split(";").forEach((cookie) => {
      const [name, value] = cookie.trim().split("=");
      if (name === "csrftoken") {
        cookieValue = decodeURIComponent(value);
      }
    });
  }
  return cookieValue;
}

const InterpolationModal = ({ visible, onCancel, uiController, logAction }) => {
  const [method, setMethod] = useState("linear");
  const [datasetId, setDatasetId] = useState(null);
  const [xColumn, setXColumn] = useState(null);
  const [yColumn, setYColumn] = useState(null);
  const [interpolatedData, setInterpolatedData] = useState([]);
  const [numPoints, setNumPoints] = useState(null);
  const [minValue, setMinValue] = useState(null);
  const [maxValue, setMaxValue] = useState(null);
  const [inputMode, setInputMode] = useState("auto"); // "auto" or "manual"

  const [columns, setColumns] = useState([]); // Store column names
  const [showResultModal, setShowResultModal] = useState(false); // Control result modal visibility

  const datasetManager = uiController.getDatasetManager();
  const availableDatasets = datasetManager.getAllDatasetsId();

  useEffect(() => {
    if (!datasetId) {
      setColumns([]);
      return;
    }

    const fetchColumns = async () => {
      const cols = await datasetManager.getDatasetColumns(datasetId);
      setColumns(cols);
    };

    fetchColumns();
  }, [datasetId]); // Dependent on `datasetId`, triggered on change

  const handleInterpolate = async () => {
    if (!datasetId || !xColumn || !yColumn) {
      message.error("Please select a dataset and two columns!");
      return;
    }

    const requestData = {
      dataset_id: datasetId, 
      x_feature: xColumn,
      y_feature: yColumn,
      kind: method,
      numPoints: numPoints,
      minValue: minValue,
      maxValue: maxValue,
    };
    try {
      const result = await fetch("http://127.0.0.1:8000/api/interpolate/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": getCSRFToken(),  // send CSRF Token
        },
        body: JSON.stringify(requestData),
        credentials: "include", // allow to include Cookie
      });
  
      const resultData = await result.json(); 
      setInterpolatedData(resultData.interpolated_data);
      message.success("Interpolation started!");
      setShowResultModal(true); // Display result modal when data is ready
      logAction(`Interpolation performed using ${requestData.kind} on dataset ID ${datasetId}.`, "Interpolate")
    } catch (error) {
      message.error(`Error: ${error.message}`);
    }
  };

  const handleCloseResultModal = () => {
    setShowResultModal(false);
  };

  const handleCreateGraph = () => {
    if (!xColumn || !yColumn || interpolatedData.length === 0) {
      message.error("Please select X and Y columns before creating a graph!");
      return;
    }

    const dataset = {
      features: [xColumn, yColumn],
      records: interpolatedData.map(dataPoint => ({
        [xColumn]: dataPoint.x,
        [yColumn]: dataPoint.y,
      })),
    };

    console.log(dataset);

    const graphInfo = {
      graphName: "Interpolation Graph",
      graphType: "line",
      dataset: dataset,
      selectedFeatures: [xColumn, yColumn],
    };

    uiController.handleUserAction({
      type: "CREATE_GRAPH",
      graphInfo,
    });

    message.success("Graph created successfully!");
  };
  const resultColumns = [
    { title: xColumn || "X Value", dataIndex: xColumn, key: xColumn },
    { title: yColumn || "Y Value", dataIndex: yColumn, key: yColumn },
  ];

  return (
    <>
      <Modal title="Interpolation" open={visible} onCancel={onCancel} footer={null}>
        <Select
          style={{ width: "100%" }}
          placeholder="Choose a dataset"
          onChange={(value) => setDatasetId(value)}
        >
          {availableDatasets.map((id) => (
            <Select.Option key={id} value={id}>{id}</Select.Option>
          ))}
        </Select>

        <Select
          style={{ width: "100%", marginTop: "10px" }}
          placeholder="Select X Column"
          disabled={!datasetId}
          onChange={setXColumn}
        >
          {columns.map((col) => (
            <Select.Option key={col} value={col}>{col}</Select.Option>
          ))}
        </Select>

        <Select
          style={{ width: "100%", marginTop: "10px" }}
          placeholder="Select Y Column"
          disabled={!datasetId}
          onChange={setYColumn}
        >
          {columns.map((col) => (
            <Select.Option key={col} value={col}>{col}</Select.Option>
          ))}
        </Select>

        <Select defaultValue="linear" onChange={setMethod} style={{ width: "100%", marginTop: "10px" }}>
          <Select.Option value="linear">Linear</Select.Option>
          <Select.Option value="polynomial">Polynomial</Select.Option>
          <Select.Option value="spline">Spline</Select.Option>
        </Select>

        {/* Input Mode Selection */}
        <Radio.Group
          value={inputMode}
          onChange={(e) => setInputMode(e.target.value)}
          style={{ marginTop: "10px", width: "100%" }}
        >
          <Radio.Button value="auto">Auto(100 points based on dataset)</Radio.Button>
          <Radio.Button value="manual">Manual Input</Radio.Button>
        </Radio.Group>

        {/* Manual Input Fields */}
        {inputMode === "manual" && (
          <>
            <InputNumber
              style={{ width: "100%", marginTop: "10px" }}
              placeholder="Number of Points"
              min={1}
              value={numPoints}
              onChange={setNumPoints}
            />
            <InputNumber
              style={{ width: "100%", marginTop: "10px" }}
              placeholder="Min Value"
              value={minValue}
              onChange={setMinValue}
            />
            <InputNumber
              style={{ width: "100%", marginTop: "10px" }}
              placeholder="Max Value"
              value={maxValue}
              onChange={setMaxValue}
            />
          </>
        )}


        <Button type="primary" onClick={handleInterpolate} block style={{ marginTop: "10px" }}>
          Run Interpolation
        </Button>
      </Modal>

      {/* Modal to display interpolation result */}
      <Modal
        title="Interpolation Results"
        visible={showResultModal}
        onCancel={handleCloseResultModal}
        footer={null}
      >
        <Table
          columns={resultColumns}
          dataSource={interpolatedData}
          rowKey="x"
          pagination={false}
          size="small"
        />
        <Button type="primary" onClick={handleCreateGraph} block style={{ marginTop: "10px" }}>
          See results a Graph
        </Button>
      </Modal>
    </>
  );
};

export default InterpolationModal;