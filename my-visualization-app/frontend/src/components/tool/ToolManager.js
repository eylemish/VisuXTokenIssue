class ToolManager {
  constructor(uiController) {
    this.uiController = uiController;
  }

  async executeTool(toolName, datasetId, params) {
    console.log(`Executing tool: ${toolName} on dataset: ${datasetId}`);

    try {
      // 通过 UIController 发送 API 请求
      const result = await this.uiController.postRequest(`/api/tools/${toolName}`, {
        dataset_id: datasetId,
        params: params,
      });

      if (result.new_dataset_id) {
        // **数据集变更，更新 UI**
        this.handleDatasetChange(toolName, datasetId, result.new_dataset_id, params);
      } else if (result.generated_data) {
        // **计算工具（不变更数据集）**
        this.displayGeneratedResult(toolName, result.generated_data);
      }
    } catch (error) {
      console.error(`Error executing tool ${toolName}:`, error);
      this.uiController.notifyUser("Tool execution failed.");
    }
  }

  // **情况 1：数据集被修改，更新 UI**
  handleDatasetChange(toolName, oldDatasetId, newDatasetId, params) {
    console.log(`Dataset updated: ${newDatasetId}`);

    // **更新 DatasetManager（只存了ID）**
    this.uiController.getDatasetManager().addDatasetId(newDatasetId);

    // **通知 UI 更新表格和图表**
    this.updateUIForDatasetChange(oldDatasetId, newDatasetId);

    // **记录日志**
    this.uiController.getLogManager().logOperation(toolName, params, oldDatasetId, newDatasetId);

    // **通知用户** 这个待修改，是打开新modal吗
    this.uiController.notifyUser(`Dataset updated successfully! New dataset ID: ${newDatasetId}`);
  }

  // **情况 2：计算工具（如 Curve Fitting）生成新数据** 可能还有其他类型数据会生成，后期添加。
  displayGeneratedResult(toolName, generatedData) {
    console.log(`Displaying results for tool: ${toolName}`, generatedData);

    //这里需不需要再加个给用户的通知？
    //因为没有改变数据集所以不记日志？
    switch (toolName) {
      case "Curve Fitting":
        this.uiController.getGraphManager().createGraph(generatedData, "Curve Fitting Result");
        break;
      case "Correlation":
        this.uiController.getGraphManager().createGraph(generatedData, "Correlation Analysis");
        break;
      case "Extrapolation":
        this.uiController.getGraphManager().createGraph(generatedData, "Extrapolated Data");
        break;
      case "Interpolation":
        this.uiController.getGraphManager().createGraph(generatedData, "Interpolated Data");
        break;
      case "Oversampling":
        this.uiController.getGraphManager().createGraph(generatedData, "Oversampled Data");
        break;
      default:
        console.warn(`No specific visualization for tool: ${toolName}`);
    }
  }

  // **更新 UI：更新表格和图表**
  updateUIForDatasetChange(oldDatasetId, newDatasetId) {
    console.log(`Updating UI: replacing dataset ${oldDatasetId} → ${newDatasetId}`);

    // 更新 TableManager
    this.uiController.getTableManager().updateTableDataset(newDatasetId);

    // 更新 GraphManager
    this.uiController.getGraphManager().updateGraphsForDataset(newDatasetId);
  }
}

export default ToolManager;
