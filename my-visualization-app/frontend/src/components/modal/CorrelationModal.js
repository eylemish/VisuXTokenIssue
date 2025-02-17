import React, { useEffect, useState } from "react";
import { Modal, Button, Select, message, Typography, Spin } from "antd";
import Plot from "react-plotly.js";

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

const CorrelationModal = ({ visible, onCancel, uiController, logAction }) => {
  const [method, setMethod] = useState("pearson");
  const [datasetId, setDatasetId] = useState(null);
  const [selectedColumns, setSelectedColumns] = useState([]); // multiple
  const [columns, setColumns] = useState([]); // column info
  const [correlationMatrix, setCorrelationMatrix] = useState(null);
  const [loading, setLoading] = useState(false);

  const datasetManager = uiController.getDatasetManager();
  const availableDatasets = datasetManager.getAllDatasetsId();

   // **when user select a dataset, get the column**
  useEffect(() => {
    if (!datasetId) {
      setColumns([]);
      setSelectedColumns([]);
      return;
    }

    const fetchColumns = async () => {
      const cols = await datasetManager.getDatasetColumns(datasetId);
      setColumns(cols);
    };

    fetchColumns();
  }, [datasetId]); // rely on `datasetId`，will be triggered if changed

  const handleCorrelate = async () => {
    if (!datasetId || selectedColumns.length < 2) {
      message.error("Please select a dataset and at least two columns!");
      return;
    }

    const requestData = {
      dataset_id: datasetId,
      features: selectedColumns, // multiple
      method: method,
    };

    setLoading(true); //

    try {
      const result = await fetch("http://127.0.0.1:8000/api/correlation/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": getCSRFToken(), //  CSRF Token
        },
        body: JSON.stringify(requestData),
        credentials: "include", // Cookie
      });

      const resultData = await result.json();
      setCorrelationMatrix(resultData.correlation_matrix); // Storage correlation matrix
      message.success("Correlation matrix generated!");
      logAction(`Correlation performed using ${requestData.kind} on dataset ID ${datasetId}.`, "Correlate")
    } catch (error) {
      message.error(`Error: ${error.message}`);
    } finally {
      setLoading(false); //
    }
  };

  return (
    <Modal title="Correlation Matrix" open={visible} onCancel={onCancel} footer={null} width={700}>
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
        mode="multiple" // allow multiple
        style={{ width: "100%", marginTop: "10px" }}
        placeholder="Select Columns"
        disabled={!datasetId}
        onChange={setSelectedColumns}
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

      {/* Display correlation result */}
      {loading && <Spin size="large" style={{ display: "block", margin: "20px auto" }} />}

      {/* heatmap */}
      {correlationMatrix && (
        <div style={{ marginTop: "20px" }}>
          <Typography.Title level={4}>Correlation Heatmap</Typography.Title>
          <Plot
              data={[
                  {
                    z: correlationMatrix.values, // correlation values
                    x: correlationMatrix.columns, // X-axis labels
                    y: correlationMatrix.columns, // Y-axis labels
                    type: "heatmap",
                    colorscale: "Viridis",
                    text: correlationMatrix.values.map(row => row.map(value => value.toFixed(2))), // format numbers
                    texttemplate: "%{text}", // display values
                    showscale: true, // display color scale
                  },
              ]}
              layout={{
                title: "Feature Correlation Heatmap",
                width: 600,
                height: 500,
              }}
          />

        </div>
      )}
    </Modal>
  );
};

export default CorrelationModal;
