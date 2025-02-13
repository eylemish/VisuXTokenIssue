import React, { useState } from "react";
import { Button, Modal, Select, message } from "antd";
import { DownloadOutlined } from "@ant-design/icons";
import datasetManager from "../file/DatasetManager"; // 导入 DatasetManager

const FileDownload = () => {
  const [downloadFormat, setDownloadFormat] = useState("csv");
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleDownload = async () => {
    console.log("handleDownload triggered");

    // 在点击下载时获取最新 datasetId
    const datasetId = datasetManager.getCurrentDatasetId();
    console.log("Fetched dataset ID in handleDownload:", datasetId);

    if (!datasetId) {
      message.error("No dataset ID available");
      return;
    }

    const downloadUrl = `http://127.0.0.1:8000/api/download/${datasetId}/${downloadFormat}/`;
    console.log("Fetching:", downloadUrl); // 调试信息

    setLoading(true);
    try {
      const response = await fetch(downloadUrl);

      if (!response.ok) {
        throw new Error(`Failed to download file. Status: ${response.status}`);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `dataset.${downloadFormat}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      message.success("File downloaded successfully");
      setIsModalOpen(false);
    } catch (error) {
      message.error("Error downloading file: " + error.message);
      console.error("Download error:", error); // 调试信息
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
      <Button icon={<DownloadOutlined />} loading={loading} onClick={() => setIsModalOpen(true)}>
        Download File
      </Button>

      <Modal
        title="Select Download Format"
        open={isModalOpen}
        onOk={handleDownload}
        onCancel={() => setIsModalOpen(false)}
        confirmLoading={loading}
      >
        <Select defaultValue="csv" style={{ width: "100%" }} onChange={(value) => setDownloadFormat(value)}>
          <Select.Option value="csv">CSV</Select.Option>
          <Select.Option value="json">JSON</Select.Option>
          <Select.Option value="xlsx">Excel</Select.Option>
        </Select>
      </Modal>
    </div>
  );
};

export default FileDownload;
