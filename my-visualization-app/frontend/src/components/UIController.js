import ModalController from './modal/ModalController';
import GraphManager from './graph/GraphManager';
import GraphWindowController from './graph/GraphWindowController';
import ToolManager from './tool/ToolManager';
import Tool from "./tool/Tool";
import LogManager from "./log/LogManager";

class UIController {
  constructor() {
    this.modalController = new ModalController(); // Manages modal windows
    this.graphManager = new GraphManager(); // Manages graph creation and modification
    this.graphWindowController = new GraphWindowController(this.graphManager); // Manages graph windows
    this.toolManager = new ToolManager(); // Manages UI tools
    this.logManager = new LogManager(); // 确保 logManager 全局可用
    this.initTools(); // 预先注册工具 需要吗？？？
    this.currentDatasetId = null; // 追踪当前数据集
  }

  // 上传文件并更新当前数据集
  async uploadFile(file, onFileUploaded) {
    if (!file) {
      alert("Please select a file first!");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("http://127.0.0.1:8000/api/upload/", {
        method: "POST",
        body: formData,
      });
      const data = await response.json();

      if (data.error) {
        alert(`Upload failed: ${data.error}`);
      } else {
        this.currentDatasetId = data.datasetId;
        onFileUploaded(data.fileName);
        alert(`File uploaded successfully! Dataset ID: ${data.datasetId}`);
      }
    } catch (error) {
      alert("Upload failed. Please try again.");
    }
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

  // 初始化工具 这个主要用于会打开弹窗的那些 这项暂时不用 看情况需不需要保留
  initTools() {
    const dataWindow = new Tool("DataWindow");
    const logWindow = new Tool("LogWindow");
    const graphWindow = new Tool("GraphWindow");

    this.toolManager.registerTool("DataWindow", dataWindow);
    this.toolManager.registerTool("LogWindow", logWindow);
    this.toolManager.registerTool("GraphWindow", graphWindow);
  }

  getToolManager() {
    return this.toolManager;
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
      default:
        console.warn('Unhandled action:', action);
    }
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

}

export default UIController;
