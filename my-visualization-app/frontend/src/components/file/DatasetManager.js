class DatasetManager {
  constructor() {
    this.datasetIds = new Set(); // 只存储 dataset ID，不存数据
  }

  // 添加数据集 ID（从后端获取后添加）
  addDatasetId(datasetId) {
    this.datasetIds.add(datasetId);
    console.log(`Dataset ID ${datasetId} added.`);
  }

  // 获取所有数据集 ID
  getAllDatasetsId() {
    return Array.from(this.datasetIds);
  }

  // 移除数据集 ID
  removeDatasetId(datasetId) {
    if (this.datasetIds.has(datasetId)) {
      this.datasetIds.delete(datasetId);
      console.log(`Dataset ID ${datasetId} removed.`);
    } else {
      console.warn(`Dataset ID ${datasetId} not found.`);
    }
  }

  // **获取数据集的列名**（向后端请求）这个是因为curve fitting等五种工具都需要选择两列来计算,这个部分以后应该需要移动到uicontroller
  async getDatasetColumns(datasetId) {
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/dataset/${datasetId}/columns`);
      if (!response.ok) throw new Error("Failed to fetch dataset columns");

      const data = await response.json();
      return data.columns || []; // 确保返回数组
    } catch (error) {
      console.error(`Error fetching columns for dataset ${datasetId}:`, error);
      return [];
    }
  }
}

export default DatasetManager;
