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

const CurveFittingModal = ({ visible, onCancel, uiController, xColumn, yColumn }) => {
  const [degree, setDegree] = useState(2);
  const [fitType, setFitType] = useState("polynomial");
  //const [datasetId, setDatasetId] = useState(null);
  //const [xColumn, setXColumn] = useState(null);
  //const [yColumn, setYColumn] = useState(null);
  const [loading, setLoading] = useState(false);


  //const [columns, setColumns] = useState([]); 
  const [originalData, setOriginalData] = useState([]);
  const [fittedData, setFittedData] = useState([]);
  const [params, setParams] = useState([]);
  const [covariance, setCovariance] = useState([]);

  //const datasetManager = uiController.getDatasetManager();
  //const availableDatasets = datasetManager.getAllDatasetsId();

  /**
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
 */


  const handleFit = async () => {
    //if (!datasetId || !xColumn || !yColumn) {
    //  message.error("Please select a dataset and two columns!");
     // return;
    //}
  
    console.log(xColumn);
    const requestData = {
      //dataset_id: datasetId,  // ensure valid datasetID
      params: {
        xColumn,
        yColumn,
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
        "X-CSRFToken": getCSRFToken()  // make sure send CSRF Token
      },
      body: JSON.stringify(requestData),
      credentials: "include", // allow to include Cookie
      });
  
      const resultData = await result.json(); // to JSON
      if (resultData.error) {
        message.error(`Curve fitting failed: ${resultData.error}`);
        return;
      }

      
      setOriginalData(resultData.original_data); // store original data
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
      <p><strong>X Column:</strong> {xColumn}</p>
      <p><strong>Y Column:</strong> {yColumn}</p>

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
        <pre>{JSON.stringify(params, null, 2)}</pre> {/* show params in JSON format */}
        </div>
      </div>
    )}
    </Modal>
    
  );
};

export default CurveFittingModal;
