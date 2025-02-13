import React, {useEffect, useState} from "react";
import { Modal, Button, InputNumber, Select, message, Table } from "antd";
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
  const [method, setMethod] = useState("smote"); // Select oversampling method
  const [datasetId, setDatasetId] = useState(null);
  const [xColumn, setXColumn] = useState(null);
  const [yColumn, setYColumn] = useState(null);
  const [factor, setOversamplingFactor] = useState(2); // Default oversampling multiplier

  const [columns, setColumns] = useState([]); // Store column names
  const [originalData, setOriginalData] = useState([]);
  const [oversampledData, setOversampledData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showResultModal, setShowResultModal] = useState(false);

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
    if (!datasetId || !xColumn || !yColumn || factor <= 0) {
      message.error("Please select a dataset, two columns, and enter a valid oversampling factor!");
      return;
    }
    const requestData = {
      datasetId: datasetId,
      params:{
        xColumn: xColumn,
        yColumn: yColumn,
        method: method,
        factor: factor
      }
    }

    console.log("Request data:", requestData);
    setLoading(true);
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
      const resultData = await result.json(); // to JSON
      console.log(resultData)
      if (resultData.error) {
        message.error(`Oversampling failed: ${resultData.error}`);
        return
      }  

      console.log(resultData.original_data);
      setOriginalData(resultData.original_data); // Store original data
      setOversampledData(resultData.oversampled_data);
      console.log(resultData.oversampledData);  // Output generated data

      message.success("Oversampling completed!");
      setShowResultModal(true);
      } catch (error) {
          message.error(`Error: ${error.message}`);
      } finally {
          setLoading(false);
      }

      
  };

  const handleCloseResultModal = () => {
    setShowResultModal(false);
  };

  const handleCreateGraph = () => {
      if (!xColumn || !yColumn || oversampledData.length === 0) {
        message.error("Please select X and Y columns before creating a graph!");
        return;
      }
  
      const dataset = {
        features: [xColumn, yColumn],
        records: oversampledData.map(dataPoint => ({
          [xColumn]: dataPoint.x,
          [yColumn]: dataPoint.y,
        })),
      };
  
      console.log(dataset);
  
      const graphInfo = {
        graphName: "Oversample Graph",
        graphType: "line",
        dataset: dataset,
        selectedFeatures: [xColumn, yColumn],
      };
  
      uiController.handleUserAction({
        type: "CREATE_GRAPH",
        graphInfo,
      });
  
      message.success("Graph created successfully!");
    };
    const resultColumns = [
      { title: xColumn || "X Value", dataIndex: xColumn, key: xColumn },
      { title: yColumn || "Y Value", dataIndex: yColumn, key: yColumn },
    ];

  return (
    <>
      <Modal title="Oversampling" open={visible} onCancel={onCancel} footer={null}>
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
          value={factor}
          onChange={setOversamplingFactor}
          style={{ width: "100%", marginTop: "10px" }}
        />

        <Button type="primary" onClick={handleOversample} block style={{ marginTop: "10px" }}>
          Run Oversampling
        </Button>
      </Modal>

      <Modal
        title="Oversample Results"
        visible={showResultModal}
        onCancel={handleCloseResultModal}
        footer={null}
      >
        <Table
          columns={resultColumns}
          dataSource={oversampledData}
          rowKey="x"
          pagination={false}
          size="small"
        />
        {/*<Button type="primary" onClick={handleCreateGraph} block style={{ marginTop: "10px" }}>
          See results a Graph
        </Button>
        */}
      </Modal>
    </>
    
  );
};

export default OversampleModal;
