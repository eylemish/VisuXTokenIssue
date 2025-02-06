import React, { useState } from "react";
import axios from "axios";
import Plot from "react-plotly.js";
import { Modal, Button, Input, Select } from "antd";

const InterpolationModal = ({ visible, onCancel }) => {
  const [method, setMethod] = useState("linear");  // 选择插值方法
  const [xData, setXData] = useState([]);  // 用户提供的 X 数据
  const [yData, setYData] = useState([]);  // 用户提供的 Y 数据
  const [interpX, setInterpX] = useState("");  // 用户输入的 X 值
  const [data, setData] = useState(null);  // 后端返回的插值结果

  // 运行插值计算
  const handleInterpolate = async () => {
    const response = await axios.post("http://127.0.0.1:8000/api/interpolate/", {
      method: method,
      x_data: xData,
      y_data: yData,
      interp_x: interpX.split(",").map(val => parseFloat(val.trim())),  // 解析输入的插值点
    });
    setData(response.data);
  };

  return (
    <Modal title="Interpolate Data" open={visible} onCancel={onCancel} footer={null}>
      {/* 选择插值方法 */}
      <Select defaultValue="linear" onChange={(value) => setMethod(value)}>
        <Select.Option value="linear">Linear Interpolation</Select.Option>
        <Select.Option value="polynomial">Polynomial Interpolation</Select.Option>
        <Select.Option value="spline">Spline Interpolation</Select.Option>
      </Select>

      {/* 让用户输入要计算插值的X值 */}
      <Input
        type="text"
        placeholder="Enter X values (comma-separated)"
        value={interpX}
        onChange={(e) => setInterpX(e.target.value)}
      />

      {/* 运行插值按钮 */}
      <Button type="primary" onClick={handleInterpolate}>Run Interpolation</Button>

      {/* 显示插值结果 */}
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
              x: data.x_interp,
              y: data.y_interp,
              mode: "markers",
              marker: { color: "red", size: 8 },
              name: "Interpolated Points",
            }
          ]}
          layout={{ title: "Interpolation Result" }}
        />
      )}
    </Modal>
  );
};

export default InterpolationModal;
