class LogManager {
  constructor() {
    this.logs = [];
    this.redoStack = [];
    this.lastSyncTime = null;
    this.datasetVersions = []; // Store all data versions

    // Automatic synchronisation of logs (every 10 seconds)
    setInterval(() => this.autoSyncLogs(), 10000);
  }

  logOperation(tool, params, datasetBefore, datasetAfter) {
    const logEntry = {
      tool,
      params,
      datasetBefore,
      datasetAfter,
      timestamp: new Date().toISOString(),
    };
    this.logs.push(logEntry);
    this.datasetVersions.push(datasetAfter); // Store the data version
    this.redoStack = [];

    console.log("Logged operation:", logEntry);
  }

  // **Add undo method**
  undo() {
    if (this.logs.length > 0) {
      const lastLog = this.logs.pop();
      this.redoStack.push(lastLog);
      console.log(`Undo: ${lastLog.tool}`);
      return lastLog.datasetBefore; // Return to previous dataset
    }
    console.warn("No actions to undo.");
    return null;
  }

  // **add redo method**
  redo() {
    if (this.redoStack.length > 0) {
      const lastRedo = this.redoStack.pop();
      this.logs.push(lastRedo);
      console.log(`Redo: ${lastRedo.tool}`);
      return lastRedo.datasetAfter; // return the redo dataset
    }
    console.warn("No actions to redo.");
    return null;
  }


  // **Automatic synchronisation of logs**
  async autoSyncLogs() {
    if (this.logs.length === 0) return;

    const now = Date.now();
    if (this.lastSyncTime && now - this.lastSyncTime < 10000) return; // Avoid frequent synchronisation

    this.lastSyncTime = now;
    await this.sendLogsToBackend();
  }

  async sendLogsToBackend() {
    try {
      const response = await fetch("http://127.0.0.1:8000/api/logs/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(this.logs),
      });

      if (!response.ok) throw new Error("Failed to send logs to backend");
      console.log("Logs successfully sent to backend.");
    } catch (error) {
      console.error("Error sending logs:", error);
    }
  }

  rollbackToVersion(index) {
    if (index < 0 || index >= this.datasetVersions.length) return null;
    return this.datasetVersions[index];
  }

  getDatasetVersions() {
    return this.datasetVersions;
  }

  getLogs(){
      return this.logs;
  }

}
export default LogManager;