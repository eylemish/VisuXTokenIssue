import React, {useEffect, useState} from "react";
import { Modal, Button, Input, Select, message, Table } from "antd";
import Action from "../Action";

const CurveFittingModal = ({ visible, onCancel, uiController }) => {
  const [degree, setDegree] = useState(2);
  const [fitType, setFitType] = useState("polynomial");
  const [datasetId, setDatasetId] = useState(null);
  const [xColumn, setXColumn] = useState(null);
  const [yColumn, setYColumn] = useState(null);
  const [loading, setLoading] = useState(false);



  //这个部分是因为前端部分完全不存数据集了，为了能调用列
  const [columns, setColumns] = useState([]); // 存储列名
  const [fittedData, setFittedData] = useState([]);
  const [params, setParams] = useState([]);
  const [covariance, setCovariance] = useState([]);

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



  const handleFit = async () => {
    if (!datasetId || !xColumn || !yColumn) {
      message.error("Please select a dataset and two columns!");
      return;
    }

    const action = new Action("EXECUTE_TOOL", "user", {
      toolName: "Curve Fitting",
      datasetId,
      xColumn,
      yColumn,
      type: fitType,
      params: { degree },
    });

    uiController.handleUserAction(action);
    message.success("Curve fitting started!");
    onCancel();
  };

  
  return (
    <Modal title="Curve Fitting" open={visible} onCancel={onCancel} footer={null}>
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

      <Select defaultValue="polynomial" onChange={setFitType} style={{ width: "100%", marginTop: "10px" }}>
        <Select.Option value="linear">Linear</Select.Option>
        <Select.Option value="polynomial">Polynomial</Select.Option>
        <Select.Option value="exponential">Exponential</Select.Option>
      </Select>

      {fitType === "polynomial" && (
        <Input
          type="number"
          placeholder="Degree"
          value={degree}
          onChange={(e) => setDegree(e.target.value)}
          min={1}
          max={10}
          style={{ marginTop: "10px" }}
        />
      )}

      <Button type="primary" onClick={handleFit} block style={{ marginTop: "10px" }}>
        Run Curve Fitting
      </Button>
    </Modal>
  );
};

export default CurveFittingModal;
