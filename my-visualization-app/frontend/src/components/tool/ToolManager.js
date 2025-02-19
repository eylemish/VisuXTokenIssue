class ToolManager {
  constructor(uiController) {
    this.uiController = uiController;
  }

  async executeTool(toolName, datasetId, params) {
    console.log(`Executing tool: ${toolName} on dataset: ${datasetId}`);

    try {
      // Send API requests via UIController
      const result = await this.uiController.postRequest(`/api/tools/${toolName}`, {
        dataset_id: datasetId,
        params: params,
      });

      if (result.new_dataset_id) {
        // **Data set change, update UI**
        this.handleDatasetChange(toolName, datasetId, result.new_dataset_id, params);
      } else if (result.generated_data) {
        // **Calculation tool (no change in data set)**
        this.displayGeneratedResult(toolName, result.generated_data);
      }
    } catch (error) {
      console.error(`Error executing tool ${toolName}:`, error);
      this.uiController.notifyUser("Tool execution failed.");
    }
  }

  // **Scenario 1: dataset is modified, update UI**
  handleDatasetChange(toolName, oldDatasetId, newDatasetId, params, filename) {
    console.log(`Dataset updated: ${newDatasetId}`);

    // **Updated DatasetManager (only ID stored)**
    this.uiController.getDatasetManager().addDatasetId(newDatasetId, filename);

    // **Notify the UI to update tables and charts**
    this.updateUIForDatasetChange(oldDatasetId, newDatasetId);

    // **Recording log**
    this.uiController.getLogManager().logOperation(toolName, params, oldDatasetId, newDatasetId);

    // **Notify the user** This is to be modified, is it opening a new modal?
    this.uiController.notifyUser(`Dataset updated successfully! New dataset ID: ${newDatasetId}`);
  }

  // **Case 2: Calculation tool (e.g. Curve Fitting) generates new data** There may be other types of data that will be generated and added later.
  displayGeneratedResult(toolName, generatedData) {
    console.log(`Displaying results for tool: ${toolName}`, generatedData);

    // Do I need to add another notification to the user here?
    //No logging because no dataset was changed?
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

  // **Update UI: update tables and charts**
  updateUIForDatasetChange(oldDatasetId, newDatasetId) {
    console.log(`Updating UI: replacing dataset ${oldDatasetId} → ${newDatasetId}`);

    // Update TableManager
    this.uiController.getTableManager().updateTableDataset(newDatasetId);

    // Update the GraphManager
    this.uiController.getGraphManager().updateGraphsForDataset(newDatasetId);
  }
}

export default ToolManager;
