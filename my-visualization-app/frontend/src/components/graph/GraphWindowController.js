class GraphWindowController {
  constructor(graphManager) {
    this.graphManager = graphManager; // 让它可以访问 GraphManager
    this.windows = new Map(); // 存储所有的窗口
  }

  openGraphWindow(graphData) {
    const windowId = `graph_window_${Date.now()}`;
    const newWindow = {
      id: windowId,
      graphData,
      isOpen: true,
    };
    this.windows.set(windowId, newWindow);
    return newWindow;
  }

  openGraphWindowById(graphId) {
    const graphData = this.graphManager.getGraphById(graphId);
    if (!graphData) {
      console.error(`GraphWindowController: Graph ID ${graphId} not found.`);
      return null;
    }

    const windowId = `graph_window_${Date.now()}`;
    const newWindow = {
      id: windowId,
      graphData,
      isOpen: true,
      position: { x: 100, y: 100 },
      width: 600,
      height: 400,
    };

    this.windows.set(windowId, newWindow);
    return newWindow;
  }

  closeGraphWindow(windowId) {
    if (this.windows.has(windowId)) {
      this.windows.get(windowId).isOpen = false;
      this.windows.delete(windowId);
      return true;
    }
    return false;
  }

  getGraphWindowById(windowId) {
    return this.windows.get(windowId) || null;
  }

  getAllGraphWindows() {
    return Array.from(this.windows.values());
  }

  updateGraphWindow(windowId, newGraphData) {
    if (this.windows.has(windowId)) {
      const window = this.windows.get(windowId);
      window.graphData = newGraphData;
      return true;
    }
    return false;
  }
}

export default GraphWindowController;
