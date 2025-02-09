import React, { useState } from "react";
import { Upload, Button, message } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import Action from "../Action";

// 获取 CSRF Token（适用于 Django）
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

const FileUpload = ({ datasetManager }) => {
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState("No file selected");
  const [uploading, setUploading] = useState(false);

  // 处理文件选择
  const uploadProps = {
    beforeUpload: (file) => {
      const isSupportedFormat = ["csv", "xlsx"].includes(file.name.split(".").pop().toLowerCase());
      if (!isSupportedFormat) {
        message.error("Only CSV and XLSX files are supported.");
        return false;
      }
      if (file.size === 0) {
        message.error("File is empty.");
        return false;
      }
      setFile(file);
      setFileName(file.name);
      console.log("📁 File selected:", file.name);
      return false; // 阻止自动上传
    },
    onRemove: () => {
      setFile(null);
      setFileName("No file selected");
      console.log("❌ File removed.");
    },
    showUploadList: false,
  };

  // 处理上传
  const handleUpload = async () => {
    if (!file) {
      message.error("Please select a file first.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    setUploading(true);
    try {
      const response = await fetch("http://127.0.0.1:8000/api/upload/", {
        method: "POST",
        headers: { "X-CSRFToken": getCSRFToken() }, // 发送 CSRF Token
        body: formData,
        credentials: "include", // 允许携带 Cookie
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.status}`);
      }

      const data = await response.json();
      console.log("✅ Upload response:", data);

      if (data.dataset_id) {
        // 将 dataset_id 添加到 DatasetManager
        datasetManager.addDatasetId(data.dataset_id);
        message.success(`File uploaded successfully. Dataset ID: ${data.dataset_id}`);
      } else {
        message.warning("No dataset ID returned from backend.");
      }
    } catch (error) {
      console.error("❌ Upload failed:", error);
      message.error("File upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <span
          style={{
            minWidth: "250px",
            maxWidth: "400px",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {fileName}
        </span>
        <Upload {...uploadProps} maxCount={1}>
          <Button type="primary" icon={<UploadOutlined />}>
            Select File
          </Button>
        </Upload>
        <Button type="primary" onClick={handleUpload} disabled={!file || uploading} loading={uploading}>
          {uploading ? "Uploading..." : "Upload"}
        </Button>
      </div>
    </div>
  );
};

export default FileUpload;
