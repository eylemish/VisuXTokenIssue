import React, { useState } from "react";
import { Modal, Radio, InputNumber, Button, message } from "antd";
import axios from "axios";

const DimReductionModal = ({ visible, onClose, onUpdateDataset, logAction }) => {
  const [method, setMethod] = useState("pca"); // 默认选择 PCA
  const [nComponents, setNComponents] = useState(2); // 目标维度
  const [isProcessing, setIsProcessing] = useState(false); // 处理状态

  const handleReduce = async () => {
    if (!nComponents || nComponents <= 0) {
      message.error("Please enter a valid number of components.");
      return;
    }

    setIsProcessing(true);
    try {
      const response = await axios.post("http://127.0.0.1:8000/api/dimensionality_reduction/", {
        method,
        n_components: nComponents,
      });

      // 更新数据集
      onUpdateDataset(response.data.dataset);

      // 记录日志
      logAction(`Dimensionality reduction performed using ${method.toUpperCase()} to ${nComponents} dimensions.`);

      message.success("Dimensionality reduction successful!");
      onClose(); // 关闭弹窗
    } catch (error) {
      console.error("Error during dimensionality reduction:", error);
      message.error("Dimensionality reduction failed.");
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
      width={400}
    >
      <div style={{ marginBottom: "15px" }}>
        <Radio.Group onChange={(e) => setMethod(e.target.value)} value={method}>
          <Radio value="pca">PCA</Radio>
          <Radio value="tsne">t-SNE</Radio>
          <Radio value="umap">UMAP</Radio>
        </Radio.Group>
      </div>
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
      <div style={{ textAlign: "right" }}>
        <Button onClick={onClose} style={{ marginRight: 10 }}>Cancel</Button>
        <Button type="primary" onClick={handleReduce} loading={isProcessing}>
          Confirm
        </Button>
      </div>
    </Modal>
  );
};

export default DimReductionModal;
