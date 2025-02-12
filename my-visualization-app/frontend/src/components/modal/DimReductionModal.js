import React, { useState } from "react";
import { Modal, Radio, InputNumber, Button, message, Table } from "antd";
import axios from "axios";
import datasetManager from "../file/DatasetManager";

const getCSRFToken = () => {
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
};

const DimReductionModal = ({ visible, onClose, onUpdateDataset, logAction, datasetId }) => {
  const [method, setMethod] = useState("pca");
  const [nComponents, setNComponents] = useState(2);
  const [isProcessing, setIsProcessing] = useState(false);
  const [reducedData, setReducedData] = useState(null);

  const handleReduce = async () => {
    if (!nComponents || nComponents <= 0) {
      message.error("Please enter a valid number of components.");
      return;
    }

    const currentDatasetId = datasetId || datasetManager.getCurrentDatasetId();
    if (!currentDatasetId) {
      message.error("No valid dataset ID found. Please upload a dataset first.");
      return;
    }

    setIsProcessing(true);
    try {
      const response = await axios.post(
        "http://127.0.0.1:8000/api/dimensional_reduction/",
        {
          dataset_id: currentDatasetId,
          method,
          n_components: nComponents,
        },
        {
          headers: {
            "X-CSRFToken": getCSRFToken(),
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );

      const receivedData = response.data.reduced_data;
      if (Array.isArray(receivedData) && receivedData.length) {
        setReducedData(receivedData);
      } else {
        setReducedData(null);
      }

      onUpdateDataset(receivedData);
      logAction(
        `Dimensionality reduction performed using ${method.toUpperCase()} to ${nComponents} dimensions on dataset ID ${currentDatasetId}.`
      );
      message.success("Dimensionality reduction successful!");
    } catch (error) {
      console.error("Error during dimensionality reduction:", error.response?.data || error.message);
      message.error(error.response?.data?.error || "Dimensionality reduction failed.");
    } finally {
      setIsProcessing(false);
    }
  };

  const renderTable = () => {
    if (!reducedData) return null;

    const columns = Object.keys(reducedData[0] || {}).map((key) => ({
      title: key,
      dataIndex: key,
      key: key,
    }));

    const dataSource = reducedData.map((row, index) => ({ key: index, ...row }));

    return <Table dataSource={dataSource} columns={columns} pagination={{ pageSize: 10 }} />;
  };

  return (
    <Modal title="Dimensionality Reduction" visible={visible} onCancel={onClose} footer={null} width={600}>
      <div style={{ marginBottom: "15px" }}>
        <Radio.Group onChange={(e) => setMethod(e.target.value)} value={method}>
          <Radio value="pca">PCA</Radio>
          <Radio value="tsne">t-SNE</Radio>
          <Radio value="umap">UMAP</Radio>
        </Radio.Group>
      </div>

      <div style={{ marginBottom: "15px" }}>
        <label>Number of Components:</label>
        <InputNumber min={1} max={10} value={nComponents} onChange={(value) => setNComponents(value)} style={{ marginLeft: "10px", width: "80px" }} />
      </div>

      <div style={{ textAlign: "right", marginBottom: "15px" }}>
        <Button onClick={onClose} style={{ marginRight: 10 }}>Cancel</Button>
        <Button type="primary" onClick={handleReduce} loading={isProcessing}>Confirm</Button>
      </div>

      {reducedData && renderTable()}
    </Modal>
  );
};

export default DimReductionModal;
