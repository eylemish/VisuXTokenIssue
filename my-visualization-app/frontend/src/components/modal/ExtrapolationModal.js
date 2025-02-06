import React, { useState } from "react";
import axios from "axios";
import Plot from "react-plotly.js";
import { Modal, Button, Input, Select } from "antd";

const Extrapolation = ({ visible, onCancel }) => {
  const [method, setMethod] = useState("linear");  // 选择外推方法
  const [xData, setXData] = useState([]);  // 原始 X 数据
  const [yData, setYData] = useState([]);  // 原始 Y 数据
  const [extrapolateRange, setExtrapolateRange] = useState("");  // 外推范围
  const [data, setData] = useState(null);  // 存储后端返回的外推结果

  // 运行外推计算
  const handleExtrapolate = async () => {
    const response = await axios.post("http://127.0.0.1:8000/api/extrapolate/", {
      method: method,
      x_data: xData,
      y_data: yData,
      extrapolate_range: extrapolateRange.split(",").map(val => parseFloat(val.trim())),
    });
    setData(response.data);
  };

  return (
    <Modal title="Extrapolate Data" open={visible} onCancel={onCancel} footer={null}>
      {/* 选择外推方法 */}
      <Select defaultValue="linear" onChange={(value) => setMethod(value)}>
        <Select.Option value="linear">Linear Extrapolation</Select.Option>
        <Select.Option value="polynomial">Polynomial Extrapolation</Select.Option>
        <Select.Option value="exponential">Exponential Extrapolation</Select.Option>
      </Select>

      {/* 输入外推范围 */}
      <Input
        type="text"
        placeholder="Enter X values for extrapolation (comma-separated)"
        value={extrapolateRange}
        onChange={(e) => setExtrapolateRange(e.target.value)}
      />

      {/* 运行外推按钮 */}
      <Button type="primary" onClick={handleExtrapolate}>Run Extrapolation</Button>

      {/* 显示外推结果 */}
      {data && (
        <Plot
          data={[
            {
              x: data.x,
              y: data.y,
              mode: "markers",
              type: "scatter",
              name: "Original Data",
            },
            {
              x: data.x_extrapolated,
              y: data.y_extrapolated,
              mode: "lines",
              line: { dash: "dash", color: "red" },
              name: "Extrapolated Curve",
            }
          ]}
          layout={{ title: "Extrapolation Result" }}
        />
      )}
    </Modal>
  );
};

export default Extrapolation;
