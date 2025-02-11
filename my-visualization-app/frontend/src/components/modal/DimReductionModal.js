import React, { useState } from "react";
import { Modal, Radio, InputNumber, Button, message } from "antd";
import axios from "axios";
import datasetManager from "../file/DatasetManager";

// Getting a CSRF Token (for Django)
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
  const [method, setMethod] = useState("pca"); // PCA is selected by default
  const [nComponents, setNComponents] = useState(2); // Target dimension
  const [isProcessing, setIsProcessing] = useState(false); // Processing status
  const [reducedData, setReducedData] = useState(null); // Store the downsized data

  const handleReduce = async () => {
    if (!nComponents || nComponents <= 0) {
      message.error("Please enter a valid number of components.");
      return;
    }

    // Get the latest datasetId.
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
          dataset_id: currentDatasetId, // Pass the dataset ID
          method,
          n_components: nComponents,
        },
        {
          headers: {
            "X-CSRFToken": getCSRFToken(), // Add a CSRF token
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );

      // Update front-end data
      setReducedData(response.data.reduced_data); // Storing Results
      onUpdateDataset(response.data.reduced_data); // Trigger external updates

      // log
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

  return (
    <Modal
      title="Dimensionality Reduction"
      visible={visible}
      onCancel={onClose}
      footer={null}
      width={500}
    >
      {/* Choosing a method */}
      <div style={{ marginBottom: "15px" }}>
        <Radio.Group onChange={(e) => setMethod(e.target.value)} value={method}>
          <Radio value="pca">PCA</Radio>
          <Radio value="tsne">t-SNE</Radio>
          <Radio value="umap">UMAP</Radio>
        </Radio.Group>
      </div>

      {/* Select components of dimensionality reduction */}
      <div style={{ marginBottom: "15px" }}>
        <label>Number of Components:</label>
        <InputNumber
          min={1}
          max={10}
          value={nComponents}
          onChange={(value) => setNComponents(value)}
          style={{ marginLeft: "10px", width: "80px" }}
        />
      </div>

      {/* Confirmation button */}
      <div style={{ textAlign: "right", marginBottom: "15px" }}>
        <Button onClick={onClose} style={{ marginRight: 10 }}>
          Cancel
        </Button>
        <Button type="primary" onClick={handleReduce} loading={isProcessing}>
          Confirm
        </Button>
      </div>

      {/* Show results */}
      {reducedData && (
        <div style={{ marginTop: "20px", padding: "10px", background: "#f7f7f7", borderRadius: "5px" }}>
          <h3>Reduced Data:</h3>
          <pre style={{ maxHeight: "200px", overflowY: "auto" }}>
            {JSON.stringify(reducedData, null, 2)}
          </pre>
        </div>
      )}
    </Modal>
  );
};

export default DimReductionModal;
