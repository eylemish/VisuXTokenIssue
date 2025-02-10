class DatasetManager {
  constructor() {
    if (!DatasetManager.instance) {
      this.datasetIds = new Set(); // 存储数据集 ID
      DatasetManager.instance = this; // 确保全局唯一
    }
    return DatasetManager.instance; // 返回全局实例
  }

  // 添加数据集 ID
  addDatasetId(datasetId) {
    if (!datasetId) {
      console.warn("⚠️ Cannot add an empty dataset ID.");
      return;
    }
    this.datasetIds.add(datasetId);
    console.log(`✅ Dataset ID ${datasetId} added. Current IDs:`, Array.from(this.datasetIds));
  }

  // 获取所有数据集 ID
  getAllDatasetsId() {
    return Array.from(this.datasetIds);
  }

  // 获取当前最新的数据集 ID
  getCurrentDatasetId() {
    if (this.datasetIds.size === 0) {
      console.warn("⚠️ No dataset ID available. Did you upload a dataset?");
      return null;
    }
    const latestId = [...this.datasetIds].pop(); // 获取最新 ID
    console.log(`🔄 Returning latest dataset ID: ${latestId}`);
    return latestId;
  }

  // 移除数据集 ID
  removeDatasetId(datasetId) {
    if (this.datasetIds.has(datasetId)) {
      this.datasetIds.delete(datasetId);
      console.log(`❌ Dataset ID ${datasetId} removed.`);
    } else {
      console.warn(`⚠️ Dataset ID ${datasetId} not found.`);
    }
  }

  // **获取数据集的列名**（向后端请求）
  async getDatasetColumns(datasetId) {
    if (!datasetId) {
      console.warn("⚠️ Cannot fetch columns. Dataset ID is missing.");
      return [];
    }

    try {
      console.log(`📡 Fetching columns for dataset ID ${datasetId}...`);
      const response = await fetch(`http://127.0.0.1:8000/api/dataset/${datasetId}/columns`);

      if (!response.ok) {
        throw new Error(`Failed to fetch dataset columns (HTTP ${response.status})`);
      }

      const data = await response.json();
      console.log(`📊 Columns for dataset ID ${datasetId}:`, data.columns);
      return data.columns || []; // 确保返回数组
    } catch (error) {
      console.error(`❌ Error fetching columns for dataset ${datasetId}:`, error);
      return [];
    }
  }
}

// **导出单例**
const datasetManager = new DatasetManager();
export default datasetManager;
