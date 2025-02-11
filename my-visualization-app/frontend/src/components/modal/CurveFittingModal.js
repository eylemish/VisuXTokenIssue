import React, {useEffect, useState} from "react";
import { Modal, Button, Input, Select, message, Table } from "antd";
import Action from "../Action";
import CurveFitPlot from "../graph/CurveFitPlot";

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

const CurveFittingModal = ({ visible, onCancel, uiController }) => {
  const [degree, setDegree] = useState(2);
  const [fitType, setFitType] = useState("polynomial");
  const [datasetId, setDatasetId] = useState(null);
  const [xColumn, setXColumn] = useState(null);
  const [yColumn, setYColumn] = useState(null);
  const [loading, setLoading] = useState(false);



  //这个部分是因为前端部分完全不存数据集了，为了能调用列
  const [columns, setColumns] = useState([]); // 存储列名
  const [originalData, setOriginalData] = useState([]);
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
  
    const requestData = {
      dataset_id: datasetId,  // 确保 datasetId 是有效的
      params: {
        xColumn: xColumn,
        yColumn: yColumn,
        type: fitType,
        degree: degree
      }
    };
    
    setLoading(true);
    try {
      const result = await fetch("http://127.0.0.1:8000/api/fit_curve/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-CSRFToken": getCSRFToken()  // 确保发送 CSRF Token
      },
      body: JSON.stringify(requestData),
      credentials: "include", // allow to include Cookie
      });
  
      const resultData = await result.json(); // 解析为JSON格式

      if (resultData.error) {
        message.error(`Curve fitting failed: ${resultData.error}`);
        return;
      }

      
      setOriginalData(resultData.original_data); // 存储原始数据
      setFittedData(resultData.generated_data);
      setParams(resultData.params);
      setCovariance(resultData.covariance);
      message.success("Curve fitting completed!");
    } catch (error) {
      message.error(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
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

      {fittedData.length > 0 && (
      <div style={{ marginTop: "20px" }}>
        <h3>Fitting Results</h3>
        <CurveFitPlot originalData={originalData} fittedData={fittedData} />

        <div style={{ marginTop: "20px" }}>
        <h4>Fitting Parameters</h4>
        <pre>{JSON.stringify(params, null, 2)}</pre> {/* 以 JSON 格式显示 params */}
        </div>
      </div>
    )}
    </Modal>
    
  );
};

export default CurveFittingModal;
