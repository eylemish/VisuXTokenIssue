import VisualizationManager from "./VisualizationManager";

class GraphWindowController {
  constructor(graphManager) {
    this.graphManager = graphManager; // 让它可以访问 GraphManager
    this.windows = new Map(); // 存储所有的窗口
    this.visualizationManager = new VisualizationManager(); // 可视化管理器
  }

  /**
   * 创建新图表窗口
   */
  openGraphWindow(graphData) {
    if (!graphData || !graphData.id) {
      console.error("❌ Invalid graphData. Missing ID.");
      return null;
    }

    const windowId = `graph_window_${graphData.id}`;
    console.log(`🖼️ Creating Graph Window for ID: ${windowId}`);

    if (document.getElementById(windowId)) {
      console.warn(`⚠️ Graph window ${windowId} already exists.`);
      return;
    }

    const graphContainer = document.createElement("div");
    graphContainer.id = windowId;
    graphContainer.className = "graph-window";
    graphContainer.style.position = "absolute";
    graphContainer.style.top = "100px";
    graphContainer.style.left = "250px";
    graphContainer.style.width = "600px";
    graphContainer.style.height = "400px";
    graphContainer.style.background = "#fff";
    graphContainer.style.border = "1px solid #ccc";
    graphContainer.style.boxShadow = "2px 2px 10px rgba(0, 0, 0, 0.2)";
    graphContainer.style.padding = "10px";
    graphContainer.style.zIndex = "1000";

    // 关闭按钮
    const closeButton = document.createElement("button");
    closeButton.innerText = "×";
    closeButton.style.position = "absolute";
    closeButton.style.top = "5px";
    closeButton.style.right = "10px";
    closeButton.style.background = "red";
    closeButton.style.color = "white";
    closeButton.style.border = "none";
    closeButton.style.cursor = "pointer";
    closeButton.onclick = () => this.closeGraphWindow(windowId);

    graphContainer.appendChild(closeButton);

    // 渲染 Plotly 图表
    const graphContent = document.createElement("div");
    graphContent.id = `plot_${graphData.id}`;
    graphContent.style.width = "100%";
    graphContent.style.height = "90%";
    graphContainer.appendChild(graphContent);

    document.body.appendChild(graphContainer);

    // 调用 VisualizationManager 渲染图表
    setTimeout(() => {
      this.visualizationManager.renderChart(graphData);
    }, 200);

    // 存储窗口
    const newWindow = {
      id: windowId,
      graphData,
      isOpen: true,
      element: graphContainer,
    };
    this.windows.set(windowId, newWindow);
    return newWindow;
  }

  /**
   * 通过 Graph ID 打开窗口
   */
  openGraphWindowById(graphId) {
    const graphData = this.graphManager.getGraphById(graphId);
    if (!graphData) {
      console.error(`❌ Graph ID ${graphId} not found.`);
      return null;
    }
    return this.openGraphWindow(graphData);
  }

  /**
   * 关闭窗口并移除 DOM
   */
  closeGraphWindow(windowId) {
    if (this.windows.has(windowId)) {
      const windowData = this.windows.get(windowId);
      document.body.removeChild(windowData.element);
      this.windows.delete(windowId);
      console.log(`✅ Closed Graph Window (ID: ${windowId})`);
      return true;
    }
    console.warn(`❌ Cannot close window. ID ${windowId} not found.`);
    return false;
  }

  /**
   * 获取窗口对象
   */
  getGraphWindowById(windowId) {
    return this.windows.get(windowId) || null;
  }

  /**
   * 获取所有窗口
   */
  getAllGraphWindows() {
    return Array.from(this.windows.values());
  }

  /**
   * 更新窗口的 Graph 数据
   */
  updateGraphWindow(windowId, newGraphData) {
    if (this.windows.has(windowId)) {
      const window = this.windows.get(windowId);
      window.graphData = newGraphData;
      this.visualizationManager.renderChart(newGraphData); // 重新渲染
      return true;
    }
    return false;
  }
}

export default GraphWindowController;
