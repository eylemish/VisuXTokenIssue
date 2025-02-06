import React, { useEffect } from "react";
import { Card } from "antd";
import VisualizationManager from "./VisualizationManager";

const GraphComponent = ({ graph }) => {

  useEffect(() => {
    const visualizationManager = new VisualizationManager();
    visualizationManager.renderChart(graph);
  }, [graph]);

  return (
    <Card title={graph.name} style={{ width: "100%", marginBottom: "16px" }}>
      <div id={`graph-container-${graph.id}`} style={{ width: "100%", height: "400px" }}></div>
    </Card>
  );
};

export default GraphComponent;
