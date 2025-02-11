import React, {useEffect, useState} from "react";
import { Modal, Button, Select, message, Typography } from "antd";
import Action from "../Action";

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

const CorrelationModal = ({ visible, onCancel, uiController }) => {
  const [method, setMethod] = useState("pearson");
  const [datasetId, setDatasetId] = useState(null);
  const [xColumn, setXColumn] = useState(null);
  const [yColumn, setYColumn] = useState(null);

  const [columns, setColumns] = useState([]); // store the columns
  const [correlation, setCorrelation] = useState(null);

  const datasetManager = uiController.getDatasetManager();
  const availableDatasets = datasetManager.getAllDatasetsId();

  // **when user select a dataset, get the column**
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
  }, [datasetId]); // rely on `datasetId`，will be triggered if changed

  const handleCorrelate = async () => {
    if (!datasetId || !xColumn || !yColumn) {
      message.error("Please select a dataset and two columns!");
      return;
    }

    const requestData = {
      dataset_id: datasetId, 
      feature_1: xColumn,
      feature_2: yColumn,
      method: method,
    };

    try {
      const result = await fetch("http://127.0.0.1:8000/api/correlation/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": getCSRFToken(),  // send CSRF Token
        },
        body: JSON.stringify(requestData),
        credentials: "include", // allow to include Cookie
      });
  
      const resultData = await result.json(); 
      setCorrelation(resultData.correlation);
      message.success("correlation calculation started!");
    } catch (error) {
      message.error(`Error: ${error.message}`);
    }
  };

  return (
    <Modal title="Correlation" open={visible} onCancel={onCancel} footer={null}>
      <Select
        style={{ width: "100%" }}
        placeholder="Choose a dataset"
        onChange={setDatasetId}
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

      <Select defaultValue="pearson" onChange={setMethod} style={{ width: "100%", marginTop: "10px" }}>
        <Select.Option value="pearson">Pearson</Select.Option>
        <Select.Option value="spearman">Spearman</Select.Option>
        <Select.Option value="kendall">Kendall</Select.Option>
      </Select>

      <Button type="primary" onClick={handleCorrelate} block style={{ marginTop: "10px" }}>
        Run Correlation
      </Button>

      {/* Display correlation result if available */}
      {correlation !== null && (
        <div style={{ marginTop: "20px" }}>
          <Typography.Title level={4}>Correlation Result</Typography.Title>
          <Typography.Text>
            The correlation coefficient between <strong>{xColumn}</strong> and{" "}
            <strong>{yColumn}</strong> using <strong>{method}</strong> method is:{" "}
            <strong>{correlation}</strong>
          </Typography.Text>
        </div>
      )}
    </Modal>
  );
};

export default CorrelationModal;
