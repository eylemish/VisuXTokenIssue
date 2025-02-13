import React, {useEffect, useState} from "react";
import { Modal, Button, Input, Select, message, Table, InputNumber, Radio } from "antd";
import Action from "../Action";
import { ConsoleSqlOutlined } from "@ant-design/icons";

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

const ExtrapolationModal = ({ visible, onCancel, uiController }) => {
  const [method, setMethod] = useState("linear");
  const [datasetId, setDatasetId] = useState(null);
  const [xColumn, setXColumn] = useState(null);
  const [yColumn, setYColumn] = useState(null);
  const [extrapolateRange, setExtrapolateRange] = useState("");
  const [extrapolatedData, setExtrapolatedData] = useState([]);
  const [originalData, setOriginalData] = useState([]);
  const [columns, setColumns] = useState([]); // Store column names
  const [showResultModal, setShowResultModal] = useState(false); // Control result modal visibility
  const [inputMode, setInputMode] = useState("dots"); // "dots" or "range"
  const [numPoints, setNumPoints] = useState(null);
  const [minValue, setMinValue] = useState(null);
  const [maxValue, setMaxValue] = useState(null);

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

  useEffect(() => {
    if (inputMode === "range" && minValue !== null && maxValue !== null && numPoints) {
      const step = (maxValue - minValue) / (numPoints - 1);
      const rangeValues = Array.from({ length: numPoints }, (_, i) => (minValue + i * step).toFixed(2));
      setExtrapolateRange(rangeValues.join(", "));
    }
  }, [inputMode, minValue, maxValue, numPoints]);

  const handleExtrapolate = async () => {
    if (!datasetId || !xColumn || !yColumn || !extrapolateRange) {
      message.error("Please select a dataset, two columns, and enter extrapolation range!");
      return;
    }

    const requestData = {
      dataset_id: datasetId, 
      x_feature: xColumn,
      y_feature: yColumn,
      kind: method,
      params: {
        extrapolateRange: extrapolateRange
          .split(",")                       // 按逗号分割
          .map(val => val.trim())            // 去除每个值的前后空格
          .map(val => parseFloat(val))       // 转换为数字
          .filter(val => !isNaN(val))        // 过滤掉不是数字的值
      }
    };
    try {
      const result = await fetch("http://127.0.0.1:8000/api/extrapolate/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": getCSRFToken(),  // send CSRF Token
        },
        body: JSON.stringify(requestData),
        credentials: "include", // allow to include Cookie
      });
  

      const resultData = await result.json(); 
      setExtrapolatedData(resultData.extrapolated_data);
      console.log(extrapolatedData);
      setOriginalData(resultData.original_data);
      message.success("Extrapolation started!");
      setShowResultModal(true); // Display result modal when data is ready
    } catch (error) {
      message.error(`Error: ${error.message}`);
    }
  };

  const handleCloseResultModal = () => {
    setShowResultModal(false);
  };

  const handleCreateGraph = () => {
    if (!xColumn || !yColumn || extrapolatedData.length === 0) {
      message.error("Please select X and Y columns before creating a graph!");
      return;
    }

    const dataset = {
      features: [xColumn, yColumn],
      records: extrapolatedData.map(dataPoint => ({
        [xColumn]: dataPoint.x,
        [yColumn]: dataPoint.y,
      })),
    };

    console.log(dataset);

    const graphInfo = {
      graphName: "Extrapolation Graph",
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

      {/* Input Mode Selection */}
      <Radio.Group
          value={inputMode}
          onChange={(e) => setInputMode(e.target.value)}
          style={{ marginTop: "10px", width: "100%" }}
        >
          <Radio.Button value="dots">Dots</Radio.Button>
          <Radio.Button value="range">Range</Radio.Button>
        </Radio.Group>

        {/* Manual Input Fields */}
        {inputMode === "range" && (
          <>
            <InputNumber
              style={{ width: "100%", marginTop: "10px" }}
              placeholder="Number of Points"
              min={1}
              value={numPoints}
              onChange={setNumPoints}
            />
            <InputNumber
              style={{ width: "100%", marginTop: "10px" }}
              placeholder="Min Value"
              value={minValue}
              onChange={setMinValue}
            />
            <InputNumber
              style={{ width: "100%", marginTop: "10px" }}
              placeholder="Max Value"
              value={maxValue}
              onChange={setMaxValue}
            />
          </>
        )}
        {inputMode === "dots" && (
          <>
            <Input
              type="text"
              placeholder="Enter X values for extrapolation (comma-separated)"
              value={extrapolateRange}
              onChange={(e) => setExtrapolateRange(e.target.value)}
              style={{ marginTop: "10px" }}
              />
          </>
        )}

      

      <Button type="primary" onClick={handleExtrapolate} block style={{ marginTop: "10px" }}>
        Run Extrapolation
      </Button>
    </Modal>

    {/* Modal to display interpolation result */}
    <Modal
        title="Extrapolation Results"
        visible={showResultModal}
        onCancel={handleCloseResultModal}
        footer={null}
      >
        <Table
          columns={resultColumns}
          dataSource={extrapolatedData}
          rowKey="x"
          pagination={false}
          size="small"
        />
        <Button type="primary" onClick={handleCreateGraph} block style={{ marginTop: "10px" }}>
          See results a Graph
        </Button>
      </Modal>
    </>
  );
};

export default ExtrapolationModal;
