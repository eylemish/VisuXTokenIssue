import React, { useState, useEffect } from "react";
import { Card, Typography } from "antd";
import VisualizationManager from "./VisualizationManager";
import GraphManager from "./GraphManager"; // Direkt instance olarak import ediliyor

const { Title } = Typography;

const visualizationManager = new VisualizationManager();

const GraphSection = () => {
  const [graphScripts, setGraphScripts] = useState([]);

  useEffect(() => {
    const graphs = GraphManager.getAllGraphs(); // Use Singleton GraphManager
    const scripts = graphs.map((graph) => visualizationManager.visualize(graph));
    setGraphScripts(scripts);
  }, [GraphManager.graphs]); // Update when graphs change

  return (
    <Card style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <Title level={4} style={{ textAlign: "left" }}>Graphs</Title>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center" }}>
        {graphScripts.length > 0 ? (
          graphScripts.map((script, index) => (
            <div key={index} dangerouslySetInnerHTML={{ __html: `<script>${script}</script>` }} />
          ))
        ) : (
          <p>No Graphs Available</p>
        )}
      </div>
    </Card>
  );
};

export default GraphSection;
