import React, { useEffect, useState } from "react";
import { Modal, Button, Select, message, Table } from "antd";
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

const InterpolationModal = ({ visible, onCancel, uiController }) => {
  const [method, setMethod] = useState("linear");
  const [datasetId, setDatasetId] = useState(null);
  const [xColumn, setXColumn] = useState(null);
  const [yColumn, setYColumn] = useState(null);
  const [interpolatedData, setInterpolatedData] = useState([]);

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
    } catch (error) {
      message.error(`Error: ${error.message}`);
    }
  };

  const handleCloseResultModal = () => {
    setShowResultModal(false);
  };

  const resultColumns = [
    { title: "X Value", dataIndex: "x", key: "x" },
    { title: "Y Value", dataIndex: "y", key: "y" },
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
      </Modal>
    </>
  );
};

export default InterpolationModal;