import React, {useEffect, useState} from "react";
import { Modal, Button, InputNumber, Select, message } from "antd";
import Action from "../Action";

// Get CSRF Token（fit Django）
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

const OversampleModal = ({ visible, onCancel, uiController }) => {
  const [method, setMethod] = useState("linear"); // Select oversampling method
  const [datasetId, setDatasetId] = useState(null);
  const [xColumn, setXColumn] = useState(null);
  const [yColumn, setYColumn] = useState(null);
  const [oversamplingFactor, setOversamplingFactor] = useState(2); // Default oversampling multiplier

  const [columns, setColumns] = useState([]); // Store column names
  const [originalData, setOriginalData] = useState([]);
  const [oversampledData, setOversampledData] = useState([]);

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

  const handleOversample = async () => {
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

    const requestData = {
      datasetId: datasetId,
      params:{
      xColumn: xColumn,
      yColumn: yColumn,
      method: method,
      factor :oversamplingFactor
      }
    }

    console.log("Request data:", requestData);

    try {
      const result = await fetch("http://127.0.0.1:8000/api/oversample_data/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-CSRFToken": getCSRFToken()  // ensure send CSRF Token
      },
      body: JSON.stringify(requestData),
      credentials: "include", // allow to include Cookie
      });
      console.log(result.generated_data);
      
      const resultData = await result.json(); // to JSON
    
      if (resultData.error) {
        message.error(`Oversampling failed: ${resultData.error}`);
        return;
      }
    
          
      console.log(resultData.original_data);
      setOriginalData(resultData.original_data); // 存储原始数据
      setOversampledData(resultData.generated_data);
      console.log(fittedData);  // 输出生成的数据
      message.success("Oversampling completed!");
      } catch (error) {
          message.error(`Error: ${error.message}`);
      } finally {
          setLoading(false);
      }

    uiController.handleUserAction(action);
    message.success("Oversampling started!");
    onCancel();
  };

  return (
    <Modal title="Oversampling" open={visible} onCancel={onCancel} footer={null}>
      {/* select dataset */}
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
      <Select defaultValue="smote" onChange={setMethod} style={{ width: "100%", marginTop: "10px" }}>
        <Select.Option value="smote">SMOTE</Select.Option>
        <Select.Option value="random">Random Oversampling</Select.Option>
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
