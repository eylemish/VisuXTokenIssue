import React, {useEffect, useState} from "react";
import { Modal, Button, Select, message } from "antd";
import Action from "../Action";

const CorrelationModal = ({ visible, onCancel, uiController }) => {
  const [method, setMethod] = useState("pearson");
  const [datasetId, setDatasetId] = useState(null);
  const [xColumn, setXColumn] = useState(null);
  const [yColumn, setYColumn] = useState(null);

  const [columns, setColumns] = useState([]); // 存储列名

  const datasetManager = uiController.getDatasetManager();
  const availableDatasets = datasetManager.getAllDatasetsId();

  // **当用户选择数据集时，获取列名**
  useEffect(() => {
    if (!datasetId) {
      setColumns([]);
      return;
    }

    const fetchColumns = async () => {
      const cols = await datasetManager.getDatasetColumns(datasetId);
      setColumns(cols);
    };

    fetchColumns();
  }, [datasetId]); // 依赖 `datasetId`，变更时触发

  const handleCorrelate = () => {
    if (!datasetId || !xColumn || !yColumn) {
      message.error("Please select a dataset and two columns!");
      return;
    }

    const action = new Action("EXECUTE_TOOL", "user", {
      toolName: "Correlation",
      datasetId,
      xColumn,
      yColumn,
      method
    });

    uiController.handleUserAction(action);
    message.success("Correlation started!");
    onCancel();
  };

  return (
    <Modal title="Correlation" open={visible} onCancel={onCancel} footer={null}>
      <Select
        style={{ width: "100%" }}
        placeholder="Choose a dataset"
        onChange={setDatasetId}
      >
        {availableDatasets.map((id) => (
          <Select.Option key={id} value={id}>{id}</Select.Option>
        ))}
      </Select>

      <Select
        style={{ width: "100%", marginTop: "10px" }}
        placeholder="Select X Column"
        disabled={!datasetId}
        onChange={setXColumn}
      >
        {columns.map((col) => (
          <Select.Option key={col} value={col}>{col}</Select.Option>
        ))}
      </Select>

      <Select
        style={{ width: "100%", marginTop: "10px" }}
        placeholder="Select Y Column"
        disabled={!datasetId}
        onChange={setYColumn}
      >
        {columns.map((col) => (
          <Select.Option key={col} value={col}>{col}</Select.Option>
        ))}
      </Select>

      <Select defaultValue="pearson" onChange={setMethod} style={{ width: "100%", marginTop: "10px" }}>
        <Select.Option value="pearson">Pearson</Select.Option>
        <Select.Option value="spearman">Spearman</Select.Option>
        <Select.Option value="kendall">Kendall</Select.Option>
      </Select>

      <Button type="primary" onClick={handleCorrelate} block style={{ marginTop: "10px" }}>
        Run Correlation
      </Button>
    </Modal>
  );
};

export default CorrelationModal;
