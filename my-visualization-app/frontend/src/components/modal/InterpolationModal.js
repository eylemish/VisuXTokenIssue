import React, {useEffect, useState} from "react";
import { Modal, Button, Select, message } from "antd";
import Action from "../Action";

const InterpolationModal = ({ visible, onCancel, uiController }) => {
  const [method, setMethod] = useState("linear");
  const [datasetId, setDatasetId] = useState(null);
  const [xColumn, setXColumn] = useState(null);
  const [yColumn, setYColumn] = useState(null);

  const [columns, setColumns] = useState([]); // Store column names

  const datasetManager = uiController.getDatasetManager();
  const availableDatasets = datasetManager.getAllDatasetsId();

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

  const handleInterpolate = () => {
    if (!datasetId || !xColumn || !yColumn) {
      message.error("Please select a dataset and two columns!");
      return;
    }

    const action = new Action("EXECUTE_TOOL", "user", {
      toolName: "Interpolation",
      datasetId,
      xColumn,
      yColumn,
      method,
    });

    uiController.handleUserAction(action);
    message.success("Interpolation started!");
    onCancel();
  };

  return (
    <Modal title="Interpolation" open={visible} onCancel={onCancel} footer={null}>
      <Select
        style={{ width: "100%" }}
        placeholder="Choose a dataset"
        onChange={(value) => setDatasetId(value)}
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

      <Select defaultValue="linear" onChange={setMethod} style={{ width: "100%", marginTop: "10px" }}>
        <Select.Option value="linear">Linear</Select.Option>
        <Select.Option value="polynomial">Polynomial</Select.Option>
        <Select.Option value="spline">Spline</Select.Option>
      </Select>

      <Button type="primary" onClick={handleInterpolate} block style={{ marginTop: "10px" }}>
        Run Interpolation
      </Button>
    </Modal>
  );
};

export default InterpolationModal;
