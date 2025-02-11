import React, {useEffect, useState} from "react";
import { Modal, Button, Input, Select, message } from "antd";
import Action from "../Action";

const ExtrapolationModal = ({ visible, onCancel, uiController }) => {
  const [method, setMethod] = useState("linear");
  const [datasetId, setDatasetId] = useState(null);
  const [xColumn, setXColumn] = useState(null);
  const [yColumn, setYColumn] = useState(null);
  const [extrapolateRange, setExtrapolateRange] = useState("");

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

  const handleExtrapolate = () => {
    if (!datasetId || !xColumn || !yColumn || !extrapolateRange) {
      message.error("Please select a dataset, two columns, and enter extrapolation range!");
      return;
    }

    const action = new Action("EXECUTE_TOOL", "user", {
      toolName: "Extrapolation",
      datasetId,
      xColumn,
      yColumn,
      method,
      params: { extrapolateRange: extrapolateRange.split(",").map(val => parseFloat(val.trim())) }
    });

    uiController.handleUserAction(action);
    message.success("Extrapolation started!");
    onCancel();
  };

  return (
    <Modal title="Extrapolation" open={visible} onCancel={onCancel} footer={null}>
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

      <Select defaultValue="linear" onChange={setMethod} style={{ width: "100%", marginTop: "10px" }}>
        <Select.Option value="linear">Linear</Select.Option>
        <Select.Option value="polynomial">Polynomial</Select.Option>
        <Select.Option value="exponential">Exponential</Select.Option>
      </Select>

      <Input
        type="text"
        placeholder="Enter X values for extrapolation (comma-separated)"
        value={extrapolateRange}
        onChange={(e) => setExtrapolateRange(e.target.value)}
        style={{ marginTop: "10px" }}
      />

      <Button type="primary" onClick={handleExtrapolate} block style={{ marginTop: "10px" }}>
        Run Extrapolation
      </Button>
    </Modal>
  );
};

export default ExtrapolationModal;
