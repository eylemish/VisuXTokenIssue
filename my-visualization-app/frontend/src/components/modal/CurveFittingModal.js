import React, { useState, useEffect } from "react";
import { Modal, Button, Input, Select, message } from "antd";
import GraphManager from "../graph/GraphManager";

const CurveFittingModal = ({ visible, onCancel, graph }) => {

  const [degree, setDegree] = useState(2);
  const [fitType, setFitType] = useState("polynomial");
  const [loading, setLoading] = useState(false);
  const [selectedX, setSelectedX] = useState("");
  const [selectedY, setSelectedY] = useState("");

  // Update X / Y axis options when `graph` changes
  useEffect(() => {
    if (graph && graph.dataset && Object.keys(graph.dataset).length > 0) {
      setSelectedX(graph.xAxis || Object.keys(graph.dataset)[0]);
      setSelectedY(graph.yAxis || Object.keys(graph.dataset)[1]);
    } else {
      setSelectedX("");
      setSelectedY("");
    }
  }, [graph]);

  const handleFit = async () => {
    if (!selectedX || !selectedY) {
      message.error("Please select valid X and Y columns.");
      return;
    }

    const requestData = {
      params: {
        xColumn: selectedX,
        yColumn: selectedY,
        type: fitType,
        degree: fitType === "polynomial" ? degree : undefined,
      },
    };

    setLoading(true);
    try {
      const result = await fetch("http://127.0.0.1:8000/api/fit_curve/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestData),
      });

      const resultData = await result.json();
      if (resultData.error) {
        message.error(`Curve fitting failed: ${resultData.error}`);
        return;
      }
      console.log("test:", resultData.generated_data);

      GraphManager.applyCurveFitting(graph.graphId, resultData.generated_data);
      message.success("Curve fitting completed!");
      onCancel();
    } catch (error) {
      message.error(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal title="Curve Fitting" open={visible} onCancel={onCancel} footer={null}>
      {graph && graph.dataset && Object.keys(graph.dataset).length > 0 ? (
        <>
          <p><strong>Select X Column:</strong></p>
          <Select value={selectedX} onChange={setSelectedX} style={{ width: "100%" }}>
            {Object.keys(graph.dataset).map((feature) => (
              <Select.Option key={feature} value={feature}>{feature}</Select.Option>
            ))}
          </Select>

          <p style={{ marginTop: "10px" }}><strong>Select Y Column:</strong></p>
          <Select value={selectedY} onChange={setSelectedY} style={{ width: "100%" }}>
            {Object.keys(graph.dataset).map((feature) => (
              <Select.Option key={feature} value={feature}>{feature}</Select.Option>
            ))}
          </Select>

          <p style={{ marginTop: "10px" }}><strong>Fit Type:</strong></p>
          <Select value={fitType} onChange={setFitType} style={{ width: "100%" }}>
            <Select.Option value="linear">Linear</Select.Option>
            <Select.Option value="polynomial">Polynomial</Select.Option>
            <Select.Option value="exponential">Exponential</Select.Option>
          </Select>

          {fitType === "polynomial" && (
            <Input
              type="number"
              value={degree}
              onChange={(e) => setDegree(Number(e.target.value))}
              min={1}
              max={10}
              style={{ marginTop: "10px" }}
            />
          )}

          <Button type="primary" onClick={handleFit} block style={{ marginTop: "10px" }} loading={loading}>
            {loading ? "Fitting..." : "Run Curve Fitting"}
          </Button>
        </>
      ) : (
        <p style={{ color: "red" }}>Error: No data available for curve fitting.</p>
      )}
    </Modal>
  );
};

export default CurveFittingModal;
