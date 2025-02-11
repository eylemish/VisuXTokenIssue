import React, { useState } from "react";
import { Modal, Radio, InputNumber, Button, message } from "antd";
import axios from "axios";
import datasetManager from "../file/DatasetManager"; //  ensure the path

// get CSRF Token（for Django ）
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
  const [method, setMethod] = useState("pca"); // default: PCA
  const [nComponents, setNComponents] = useState(2); // target dimension
  const [isProcessing, setIsProcessing] = useState(false); // process state
  const [reducedData, setReducedData] = useState(null); // store the data after reduction

  const handleReduce = async () => {
    if (!nComponents || nComponents <= 0) {
      message.error("Please enter a valid number of components.");
      return;
    }

    // get latest datasetId
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
          dataset_id: currentDatasetId, // pass dataset_id
          method,
          n_components: nComponents,
        },
        {
          headers: {
            "X-CSRFToken": getCSRFToken(), // add CSRF toekn
            "Content-Type": "application/json",
          },
          withCredentials: true, // ensure that the request contains Cookie
        }
      );

      // update frontend data
      setReducedData(response.data.reduced_data); // store the result
      onUpdateDataset(response.data.reduced_data); //  update the dataset

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
      {/* choose dimensionality reduction methods */}
      <div style={{ marginBottom: "15px" }}>
        <Radio.Group onChange={(e) => setMethod(e.target.value)} value={method}>
          <Radio value="pca">PCA</Radio>
          <Radio value="tsne">t-SNE</Radio>
          <Radio value="umap">UMAP</Radio>
        </Radio.Group>
      </div>

      {/* number of components */}
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

      {/* comfirmation button */}
      <div style={{ textAlign: "right", marginBottom: "15px" }}>
        <Button onClick={onClose} style={{ marginRight: 10 }}>
          Cancel
        </Button>
        <Button type="primary" onClick={handleReduce} loading={isProcessing}>
          Confirm
        </Button>
      </div>

      {/* show the result */}
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
