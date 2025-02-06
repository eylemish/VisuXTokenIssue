import React, { useState } from "react";
import axios from "axios";
import Plot from "react-plotly.js";
import { Modal, Button, Input, Select } from "antd";

const CurveFittingModal = ({ visible, onCancel }) => {
  const [degree, setDegree] = useState(2);
  const [fitType, setFitType] = useState("polynomial");
  const [data, setData] = useState(null);
  const [xData, setXData] = useState([]);
  const [yData, setYData] = useState([]);

  //向后端的请求不写在这里，待改
  const handleFit = async () => {
    const response = await axios.post("http://127.0.0.1:8000/api/curve-fitting/", {
      fit_type: fitType,
      degree: degree,
      x_data: xData,
      y_data: yData,
    });
    setData(response.data);
  };

  return (
    <Modal title="Curve Fitting" open={visible} onCancel={onCancel} footer={null}>
      <Select defaultValue="polynomial" onChange={(value) => setFitType(value)}>
        <Select.Option value="linear">Linear</Select.Option>
        <Select.Option value="polynomial">Polynomial</Select.Option>
        <Select.Option value="exponential">Exponential</Select.Option>
      </Select>
      {fitType === "polynomial" && (
        <Input type="number" placeholder="Degree" value={degree} onChange={(e) => setDegree(e.target.value)} />
      )}
      <Button type="primary" onClick={handleFit}>Run Curve Fitting</Button>



      {/*这部分不写在这里，之后删除*/}
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
              x: data.x,
              y: data.y_fit,
              mode: "lines",
              name: "Fitted Curve",
            },
          ]}
          layout={{ title: "Curve Fitting Result" }}
        />
      )}
    </Modal>
  );
};

export default CurveFittingModal;
