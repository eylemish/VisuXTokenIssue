class DatasetManager {
  constructor() {
    if (!DatasetManager.instance) {
      this.datasetIds = new Set(); // Store the dataset ID
      DatasetManager.instance = this; // Ensure global uniqueness
    }
    return DatasetManager.instance; // Returns the global instance
  }

  // Add the dataset ID
  addDatasetId(datasetId) {
    if (!datasetId) {
      console.warn("Cannot add an empty dataset ID.");
      return;
    }
    this.datasetIds.add(datasetId);
    console.log(`Dataset ID ${datasetId} added. Current IDs:`, Array.from(this.datasetIds));
  }

  // Get all dataset IDs
  getAllDatasetsId() {
    return Array.from(this.datasetIds);
  }

  // Get the current latest dataset ID
  getCurrentDatasetId() {
    if (this.datasetIds.size === 0) {
      console.warn("No dataset ID available. Did you upload a dataset?");
      return null;
    }
    const latestId = [...this.datasetIds].pop();
    console.log(`Returning latest dataset ID: ${latestId}`);
    return latestId;
  }

  // Remove the dataset ID
  removeDatasetId(datasetId) {
    if (this.datasetIds.has(datasetId)) {
      this.datasetIds.delete(datasetId);
      console.log(`Dataset ID ${datasetId} removed.`);
    } else {
      console.warn(`Dataset ID ${datasetId} not found.`);
    }
  }

  // **Get the column names of the dataset** (request to the backend)
  async getDatasetColumns(datasetId) {
    if (!datasetId) {
        console.warn("Cannot fetch columns. Dataset ID is missing.");
        return [];
    }

    try {
        console.log(`Fetching columns for dataset ID ${datasetId}...`);

        const url = `http://127.0.0.1:8000/api/dataset/${datasetId}/columns/`;
        console.log(`Requesting: ${url}`);

        const response = await fetch(url, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json"
            }
        });

        console.log("Response status:", response.status);

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`Server Response: ${errorText}`);
            throw new Error(`Failed to fetch dataset columns (HTTP ${response.status})`);
        }

        const data = await response.json();
        console.log(`Columns for dataset ID ${datasetId}:`, data.columns);
        return data.columns || [];
    } catch (error) {
        console.error(`Error fetching columns for dataset ${datasetId}:`, error);
        return [];
    }
  }

  async getDatasetById(datasetId) {
  try {
    const response = await fetch(`http://127.0.0.1:8000/api/datasets/${datasetId}/`);
    if (!response.ok) {
      throw new Error(`Failed to fetch dataset: ${response.statusText}`);
    }
    const dataset = await response.json();

    // Convert records to { feature1: [], feature2: [] } form
    const transformedDataset = {};
    dataset.features.forEach(feature => {
      transformedDataset[feature] = dataset.records.map(record => record[feature]);
    });

    console.log(`Transformed dataset for ID ${datasetId}:`, transformedDataset);
    return { ...dataset, data: transformedDataset }; // Add converted data
  } catch (error) {
    console.error("Error fetching dataset:", error);
    return null;
  }
}

}

// **Export single case**
const datasetManager = new DatasetManager();
export default datasetManager;
