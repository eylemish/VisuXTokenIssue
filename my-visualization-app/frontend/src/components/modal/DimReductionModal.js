import React, { useState } from "react";
import { Modal, Radio, InputNumber, Button, message } from "antd";
import axios from "axios";
import datasetManager from "../file/DatasetManager"; // ✅ 确保路径正确

// 获取 CSRF Token（适用于 Django ）
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
  const [method, setMethod] = useState("pca"); // 默认选择 PCA
  const [nComponents, setNComponents] = useState(2); // 目标维度
  const [isProcessing, setIsProcessing] = useState(false); // 处理状态
  const [reducedData, setReducedData] = useState(null); // 存储降维后的数据

  const handleReduce = async () => {
    if (!nComponents || nComponents <= 0) {
      message.error("Please enter a valid number of components.");
      return;
    }

    // 获取最新的 datasetId
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
          dataset_id: currentDatasetId, // 传递数据集 ID
          method,
          n_components: nComponents,
        },
        {
          headers: {
            "X-CSRFToken": getCSRFToken(), // 添加 CSRF 令牌
            "Content-Type": "application/json",
          },
          withCredentials: true, // 确保请求携带 Cookie
        }
      );

      // 更新前端数据
      setReducedData(response.data.reduced_data); // ✅ 存储降维结果
      onUpdateDataset(response.data.reduced_data); // ✅ 触发外部更新

      // 记录日志
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
      {/* 选择降维方法 */}
      <div style={{ marginBottom: "15px" }}>
        <Radio.Group onChange={(e) => setMethod(e.target.value)} value={method}>
          <Radio value="pca">PCA</Radio>
          <Radio value="tsne">t-SNE</Radio>
          <Radio value="umap">UMAP</Radio>
        </Radio.Group>
      </div>

      {/* 选择降维维度 */}
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

      {/* 确认按钮 */}
      <div style={{ textAlign: "right", marginBottom: "15px" }}>
        <Button onClick={onClose} style={{ marginRight: 10 }}>
          Cancel
        </Button>
        <Button type="primary" onClick={handleReduce} loading={isProcessing}>
          Confirm
        </Button>
      </div>

      {/* 显示降维结果 */}
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
