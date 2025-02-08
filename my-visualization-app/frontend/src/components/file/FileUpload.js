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

const FileUpload = ({ uiController }) => {
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState("No file selected");
  const [uploading, setUploading] = useState(false);
  const [filePreview, setFilePreview] = useState(null);

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
      setFilePreview(null);
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

    // 组织上传操作
    const uploadAction = new Action(
      "UPLOAD_FILE",
      "user",
      { fileName: file.name, file },
      "user123", // 如果有动态 userId，可以替换
      async () => {
        console.log("📡 Uploading file:", file.name);
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

          if (data.data_preview) {
            setFilePreview(data.data_preview);
          } else {
            console.warn("⚠ No data preview returned from backend.");
          }

          message.success(data.message || "Upload successful!");
          uploadAction.updateStatus("success");
        } catch (error) {
          console.error("❌ Upload failed:", error);
          message.error("Upload failed.");
          uploadAction.updateStatus("failed");
        } finally {
          setUploading(false);
        }
      },
      () => {
        // 撤销操作（清除 UI）
        setFile(null);
        setFileName("No file selected");
        setFilePreview(null);
        message.info("Upload action undone.");
        console.log("↩ Undo upload action.");
      }
    );

    // 执行上传
    uploadAction.execute();
  };

  // 确保 uiController 存在
  if (!uiController || !uiController.getModalController) {
    console.error("⚠ uiController is undefined in FileUpload!");
    return null;
  }

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
      {filePreview && filePreview.length > 0 && (
        <div style={{ marginTop: "12px" }}>
          <h4>Data Preview:</h4>
          <table
            border="1"
            style={{
              width: "100%",
              borderCollapse: "collapse",
              textAlign: "left",
              fontSize: "14px",
            }}
          >
            <thead>
              <tr>
                {Object.keys(filePreview[0]).map((key) => (
                  <th key={key} style={{ padding: "8px" }}>
                    {key}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filePreview.map((row, index) => (
                <tr key={index}>
                  {Object.values(row).map((value, i) => (
                    <td key={i} style={{ padding: "8px" }}>
                      {value}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default FileUpload;
