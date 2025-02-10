import ModalController from './modal/ModalController';
import GraphManager from './graph/GraphManager';
import GraphWindowController from './graph/GraphWindowController';
import ToolManager from './tool/ToolManager';
import LogManager from "./log/LogManager";
import TableManager from "./table/TableManager";
import datasetManager from "./file/DatasetManager";

class UIController {
  constructor() {
    this.modalController = new ModalController(); // Manages modal windows
    this.graphManager = new GraphManager(); // Manages graph creation and modification
    this.graphWindowController = new GraphWindowController(this.graphManager); // Manages graph windows
    this.toolManager = new ToolManager(this); // Manages UI tools //change toolManager add uiController in its param
    this.logManager = new LogManager(); // 确保 logManager 全局可用
    this.tableManager = new TableManager(this);
    this.datasetManager = datasetManager;
  }

  // 下载文件
  async downloadFile(format) {
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/download?format=${format}`);
      if (!response.ok) {
        throw new Error("Download failed.");
      }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `dataset.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      alert("Download started!");
    } catch (error) {
      alert("Download failed. Please try again.");
    }
  }


  handleUserAction(action) {
    switch (action.type) {
      case 'OPEN_MODAL':
        this.modalController.openModal(action.modalType, action.data);
        break;
      case 'CLOSE_MODAL':
        this.modalController.closeModal();
        break;
      case 'OPEN_GRAPH_WINDOW':
        this.graphWindowController.openGraphWindow(action.graphData);
        break;
      case 'CLOSE_GRAPH_WINDOW':
        this.graphWindowController.closeGraphWindow(action.windowId);
        break;
      case 'DISPLAY_ERROR':
        alert(`Error: ${action.errorDetails}`);
        break;
      case 'DISPATCH_REQUEST':
        console.log('Dispatching request to backend:', action);
        break;

      {/*来自NewGraphModal的Action，注意这里的参数还没写完*/}
      case 'CREATE_GRAPH':
        this.graphManager.createGraph(action.type);
        this.graphWindowController.openGraphWindow();
        break;

        {/*来自各个tool的Action，注意这里的参数还没写完*/}
      case 'EXECUTE_TOOL':
        this.toolManager.executeTool(action.data.toolName, action.data.datasetId, action.data.params);
        break;

      default:
        console.warn('Unhandled action:', action);
    }
  }


  //这个是前后端用post连接的地方，这个只负责传入传出这个动作,toolmamager里可改一部分url
  async postRequest(url, data, headers = {}) {
  try {
    console.log(`📡 Sending POST request to: ${url}`, data);

    // 获取 CSRF Token（适用于 Django 后端）
    const csrfToken = this.getCSRFToken();
    if (csrfToken) {
      headers["X-CSRFToken"] = csrfToken;
    }

    // 发送请求
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...headers, // 允许自定义 headers
      },
      body: JSON.stringify(data),
      credentials: "include", // 允许携带 Cookie（跨域需要）
    });

    // 检查 HTTP 响应状态码
    if (!response.ok) {
      const errorMessage = await response.text();
      console.error(`❌ API request failed: ${url} (${response.status})`, errorMessage);
      throw new Error(`Request failed: ${response.status} - ${errorMessage}`);
    }

    // 解析 JSON 响应
    const responseData = await response.json();
    console.log(`✅ Response received from ${url}:`, responseData);
    return responseData;
  } catch (error) {
    console.error(`🚨 Network/API error for ${url}:`, error);
    throw error;
  }
}

// 获取 CSRF Token（适用于 Django）
getCSRFToken() {
  let cookieValue = null;
  if (document.cookie) {
    document.cookie.split(";").forEach((cookie) => {
      const [name, value] = cookie.trim().split("=");
      if (name === "csrftoken") {
        cookieValue = decodeURIComponent(value);
      }
    });
  }
  return cookieValue;
}


  setModalController(modalController) {
    this.modalController = modalController;
  }

  setGraphWindowController(graphWindowController) {
    this.graphWindowController = graphWindowController;
  }

  setGraphManager(graphManager) {
    this.graphManager = graphManager;
  }

  setToolManager(toolManager) {
    this.toolManager = toolManager;
  }

  setImageDisplayArea(imageDisplayArea) {
    this.imageDisplayArea = imageDisplayArea;
  }

  getGraphManager() {
    return this.graphManager;
  }

  getModalController() {
    return this.modalController;
  }

  getGraphWindowController() {
    return this.graphWindowController;
  }

  getToolManager() {
    return this.toolManager;
  }


  getImageDisplayArea() {
    return this.imageDisplayArea;
  }

  openGraphWindow(graphId) {
    return this.graphWindowController.openGraphWindowById(graphId);
  }

  closeGraphWindow(windowId) {
    return this.graphWindowController.closeGraphWindow(windowId);
  }

  getGraphWindows() {
    return this.graphWindowController.getGraphWindows();
  }

  getLogManager() {
    return this.logManager;
  }

  getDatasetManager() {
    return this.datasetManager;
  }

  getTableManager() {
    return this.tableManager;
  }

}

export default UIController;
