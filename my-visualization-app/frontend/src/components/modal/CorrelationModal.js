import React, { useState } from "react";
import axios from "axios";
import Plot from "react-plotly.js";
import { Modal, Button, Select, message } from "antd";

const CorrelationModal = ({ visible, onCancel }) => {
  const [method, setMethod] = useState("pearson");  // 相关性计算方法
  const [xData, setXData] = useState([]);  // 变量 A 数据
  const [yData, setYData] = useState([]);  // 变量 B 数据
  const [result, setResult] = useState(null);  // 相关性结果

  // 运行相关性计算
  const handleCorrelate = async () => {
    if (xData.length === 0 || yData.length === 0) {
      message.error("请提供数据！");
      return;
    }

    try {
      const response = await axios.post("http://127.0.0.1:8000/api/correlate/", {
        correlation_method: method,
        data_x: xData,
        data_y: yData,
      });
      setResult(response.data);
    } catch (error) {
      message.error("计算失败，请检查数据！");
    }
  };

  return (
    <Modal title="Correlate Data" open={visible} onCancel={onCancel} footer={null}>
      {/* 选择相关性计算方法 */}
      <Select defaultValue="pearson" onChange={(value) => setMethod(value)}>
        <Select.Option value="pearson">Pearson Correlation</Select.Option>
        <Select.Option value="spearman">Spearman Correlation</Select.Option>
        <Select.Option value="kendall">Kendall Correlation</Select.Option>
      </Select>

      {/* 运行相关性计算按钮 */}
      <Button type="primary" onClick={handleCorrelate} style={{ marginTop: "10px" }}>
        Run Correlation
      </Button>

      {/* 显示相关性结果 */}
      {result && (
        <div style={{ marginTop: "20px" }}>
          <p><strong>Correlation Coefficient (r):</strong> {result.correlation.toFixed(4)}</p>
          <p><strong>p-value:</strong> {result.p_value.toFixed(4)}</p>

          {/* 显示散点图和拟合线 */}
          <Plot
            data={[
              {
                x: result.data_x,
                y: result.data_y,
                mode: "markers",
                type: "scatter",
                name: "Original Data",
              },
              {
                x: result.data_x,
                y: result.regression_line,
                mode: "lines",
                name: "Regression Line",
              }
            ]}
            layout={{ title: "Correlation Scatter Plot" }}
          />
        </div>
      )}
    </Modal>
  );
};

export default CorrelationModal;
