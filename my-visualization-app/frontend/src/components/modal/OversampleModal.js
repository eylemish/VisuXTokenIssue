import React, {useEffect, useState} from "react";
import { Modal, Button, InputNumber, Select, message } from "antd";
import Action from "../Action";

const OversampleModal = ({ visible, onCancel, uiController }) => {
  const [method, setMethod] = useState("linear"); // Select oversampling method
  const [datasetId, setDatasetId] = useState(null);
  const [xColumn, setXColumn] = useState(null);
  const [yColumn, setYColumn] = useState(null);
  const [oversamplingFactor, setOversamplingFactor] = useState(2); // Default oversampling multiplier

  const [columns, setColumns] = useState([]); // Store column names

  const datasetManager = uiController.getDatasetManager();
  const availableDatasets = datasetManager.getAllDatasetsId();

  // **Get column names when the user selects a dataset**
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
  }, [datasetId]); // Dependent on `datasetId`, triggered on change

  const handleOversample = () => {
    if (!datasetId || !xColumn || !yColumn || oversamplingFactor <= 0) {
      message.error("Please select a dataset, two columns, and enter a valid oversampling factor!");
      return;
    }

    const action = new Action("EXECUTE_TOOL", "user", {
      toolName: "Oversampling",
      datasetId,
      xColumn,
      yColumn,
      method,
      params: { oversamplingFactor }
    });

    uiController.handleUserAction(action);
    message.success("Oversampling started!");
    onCancel();
  };

  return (
    <Modal title="Oversampling" open={visible} onCancel={onCancel} footer={null}>
      {/* 选择数据集 */}
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

      {/* Selection of oversampling method */}
      <Select defaultValue="linear" onChange={setMethod} style={{ width: "100%", marginTop: "10px" }}>
        <Select.Option value="linear">Linear Interpolation</Select.Option>
        <Select.Option value="spline">Spline Interpolation</Select.Option>
        <Select.Option value="polynomial">Polynomial Interpolation</Select.Option>
      </Select>

      {/* Input oversampling multiplier */}
      <InputNumber
        min={1}
        max={10}
        value={oversamplingFactor}
        onChange={setOversamplingFactor}
        style={{ width: "100%", marginTop: "10px" }}
      />

      <Button type="primary" onClick={handleOversample} block style={{ marginTop: "10px" }}>
        Run Oversampling
      </Button>
    </Modal>
  );
};

export default OversampleModal;
