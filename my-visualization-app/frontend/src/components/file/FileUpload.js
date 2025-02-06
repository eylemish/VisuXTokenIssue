import React, { useState } from "react";
import { Upload, Button } from "antd";
import { UploadOutlined } from "@ant-design/icons";

const FileUpload = ({ uiController }) => {
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState("No file selected");

  const uploadProps = {
    beforeUpload: (file) => {
      setFile(file);
      setFileName(file.name);
      return false; // 阻止自动上传
    },
    onRemove: () => {
      setFile(null);
      setFileName("No file selected");
    },
    showUploadList: false,
  };

  if (!uiController || !uiController.getModalController) {
    console.error("uiController is undefined in FileDownload!");
    return null; // 避免 `undefined` 访问
  }

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
      {/* 文件名，设置最小宽度，防止按钮挤压它 */}
      <span style={{ minWidth: "150px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
        {fileName}
      </span>

      {/* 选择文件按钮 */}
      <Upload {...uploadProps} maxCount={1}>
        <Button type="primary" icon={<UploadOutlined />}>Select File</Button>
      </Upload>

      {/* 上传按钮，加 `marginLeft: 10px` 确保间距 */}
      <Button type="primary" onClick={() => uiController.uploadFile(file, setFileName)} disabled={!file}>
        Upload
      </Button>
    </div>
  );
};

export default FileUpload;
