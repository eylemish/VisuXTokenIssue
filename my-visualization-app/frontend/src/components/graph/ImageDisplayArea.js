import React, { useState } from "react";
import { Card, Button, List, message } from "antd";
import { DownloadOutlined, DeleteOutlined } from "@ant-design/icons";
import Plot from "react-plotly.js";

const ImageDisplayArea = () => {
  const [graphs, setGraphs] = useState([]); // 存储显示的 Graph
  const [selectedGraph, setSelectedGraph] = useState(null); // 当前选中的 Graph

  // 1. 添加 Graph
  const addGraph = (graph) => {
    setGraphs((prevGraphs) => [...prevGraphs, graph]);
    message.success(`Graph "${graph.name}" added to Image Display Area.`);
  };

  // 2. 删除 Graph
  const removeGraph = (graphId) => {
    setGraphs((prevGraphs) => prevGraphs.filter((g) => g.id !== graphId));
    if (selectedGraph?.id === graphId) setSelectedGraph(null);
    message.success("Graph removed.");
  };

  // 3. 选择 Graph
  const selectGraph = (graphId) => {
    const graph = graphs.find((g) => g.id === graphId);
    if (graph) {
      setSelectedGraph(graph);
      message.info(`Selected graph: ${graph.name}`);
    }
  };

  // 4. 取消选择
  const deselectGraph = () => {
    setSelectedGraph(null);
    message.info("Deselected graph.");
  };

  // 5. 下载 Graph
  const downloadGraph = (graph) => {
    const filename = `${graph.name}.png`;
    Plot.downloadImage(`graph-container-${graph.id}`, { format: "png", filename });
    message.success(`Graph "${graph.name}" downloaded.`);
  };

  return (
    <Card title="Image Display Area" style={{ width: "100%", minHeight: "300px" }}>
      <List
        dataSource={graphs}
        renderItem={(graph) => (
          <List.Item
            key={graph.id}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "10px",
              background: selectedGraph?.id === graph.id ? "#f0f0f0" : "white",
              borderBottom: "1px solid #ddd",
            }}
            onClick={() => selectGraph(graph.id)}
          >
            <span>{graph.name}</span>
            <div>
              <Button
                icon={<DownloadOutlined />}
                onClick={(e) => {
                  e.stopPropagation(); // 避免触发选择操作
                  downloadGraph(graph);
                }}
                style={{ marginRight: 8 }}
              />
              <Button
                icon={<DeleteOutlined />}
                onClick={(e) => {
                  e.stopPropagation();
                  removeGraph(graph.id);
                }}
                danger
              />
            </div>
          </List.Item>
        )}
      />
      {selectedGraph && (
        <div style={{ marginTop: "10px", padding: "10px", background: "#fafafa" }}>
          <p>Selected Graph: {selectedGraph.name}</p>
          <Button onClick={deselectGraph}>Deselect</Button>
        </div>
      )}
    </Card>
  );
};

export default ImageDisplayArea;
