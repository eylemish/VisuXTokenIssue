class TableManager {
    constructor(datasetManager) {
        this.datasetManager = datasetManager;
        this.tables = new Map(); // 记录 UI 上的表格
    }

    updateTableDataset(oldDatasetId, newDatasetId) {
        if (this.tables.has(oldDatasetId)) {
            this.tables.set(newDatasetId, this.tables.get(oldDatasetId));
            this.tables.delete(oldDatasetId);
            console.log(`Table updated: ${oldDatasetId} -> ${newDatasetId}`);
        }
    }

    registerTable(tableId, datasetId) {
        this.tables.set(tableId, datasetId);
    }

    //
    createTable(name, values) {
    const tableId = `table_${Date.now()}`;
    this.tables.set(tableId, { name, values });
}

}

export default TableManager;
