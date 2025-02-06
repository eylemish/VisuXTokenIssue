import React, { useState } from "react";
import axios from "axios";
import Plot from "react-plotly.js";
import { Modal, Button, Input, Select } from "antd";

const OversampleModal = ({ visible, onCancel }) => {
  const [method, setMethod] = useState("linear");  // 过采样方法
  const [oversamplingFactor, setOversamplingFactor] = useState(2);  // 过采样倍数
  const [xData, setXData] = useState([]);  // 原始 X 数据
  const [yData, setYData] = useState([]);  // 原始 Y 数据
  const [data, setData] = useState(null);  // 过采样后的数据

  // 运行过采样计算
  const handleOversample = async () => {
    const response = await axios.post("http://127.0.0.1:8000/api/oversample/", {
      method: method,
      x_data: xData,
      y_data: yData,
      oversampling_factor: parseInt(oversamplingFactor),
    });
    setData(response.data);
  };

  return (
    <Modal title="Oversample Data" open={visible} onCancel={onCancel} footer={null}>
      {/* 选择过采样方法 */}
      <Select defaultValue="linear" onChange={(value) => setMethod(value)}>
        <Select.Option value="linear">Linear Interpolation</Select.Option>
        <Select.Option value="spline">Spline Interpolation</Select.Option>
        <Select.Option value="polynomial">Polynomial Interpolation</Select.Option>
      </Select>

      {/* 输入过采样倍数 */}
      <Input
        type="number"
        placeholder="Oversampling Factor (e.g., 2, 5, 10)"
        value={oversamplingFactor}
        onChange={(e) => setOversamplingFactor(e.target.value)}
      />

      {/* 运行过采样按钮 */}
      <Button type="primary" onClick={handleOversample}>Run Oversampling</Button>

      {/* 显示过采样结果 */}
      {data && (
        <Plot
          data={[
            {
              x: data.x_original,
              y: data.y_original,
              mode: "markers",
              type: "scatter",
              name: "Original Data",
            },
            {
              x: data.x_oversampled,
              y: data.y_oversampled,
              mode: "lines",
              name: "Oversampled Data",
            }
          ]}
          layout={{ title: "Oversampling Result" }}
        />
      )}
    </Modal>
  );
};

export default OversampleModal;
