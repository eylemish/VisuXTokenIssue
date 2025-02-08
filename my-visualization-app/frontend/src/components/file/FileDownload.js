import React, { useState,useEffect } from "react";
import { Button, Modal, Select } from "antd";
import { DownloadOutlined } from "@ant-design/icons";

const FileDownload = ({ uiController }) => {
  const [downloadFormat, setDownloadFormat] = useState("csv");

        // This part causes bug in frontend... Please dont push error code
        // useEffect(() => {
        //     uiController.downloadFile = (format) => {
        //         window.location.href = `/api/download/?format=${format}`;
        //     };
        // }, [uiController]);

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
      <Button icon={<DownloadOutlined />} onClick={() => uiController.getModalController().openModal("download", { format: "csv" })}>
        Download File
      </Button>

      <Modal
        title="Select Download Format"
        visible={uiController.getModalController().isModalActive("download")}
        onOk={() => {
          uiController.getModalController().closeModal();
          uiController.downloadFile(downloadFormat);
        }}
        onCancel={() => uiController.getModalController().closeModal()}
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
