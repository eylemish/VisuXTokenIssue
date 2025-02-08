import ModalController from './modal/ModalController';
import GraphManager from './graph/GraphManager';
import GraphWindowController from './graph/GraphWindowController';
import ToolManager from './tool/ToolManager';
import LogManager from "./log/LogManager";
import DatasetManager from "./file/DatasetManager";
import TableManager from "./table/TableManager";

class UIController {
  constructor() {
    this.datasetManager = new DatasetManager();
    this.modalController = new ModalController(); // Manages modal windows
    this.graphManager = new GraphManager(); // Manages graph creation and modification
    this.graphWindowController = new GraphWindowController(this.graphManager); // Manages graph windows
    this.toolManager = new ToolManager(this); // Manages UI tools //change toolManager add uiController in its param
    this.logManager = new LogManager(); // 确保 logManager 全局可用
    this.tableManager = new TableManager(this);
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


  //这个是前后端用post连接的地方，待完善，这个只负责传入传出这个动作,toolmamager里可改一部分url
  async postRequest(url, data) {
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      return await response.json();
    } catch (error) {
      console.error(`API request failed: ${url}`, error);
      throw error;
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

  getDatasetManager() {
    return this.datasetManager;
  }

  getTableManager() {
    return this.tableManager;
  }

}

export default UIController;
