
class Graph {
  constructor(id, name, dataset, type, selectedFeatures, style = {}) {
    this.id = id;
    this.name = name;
    this.dataset = dataset; // { x: [...], y: [...] }
    this.type = type; // 'scatter', 'bar', 'line', etc.
    this.selectedFeatures = selectedFeatures;
    this.style = style;
    this.metadata = {};
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }

  updateDataset(newDataset) {
    this.dataset = newDataset;
    this.updatedAt = new Date();
  }

  updateStyle(newStyle) {
    this.style = { ...this.style, ...newStyle };
    this.updatedAt = new Date();
  }

  switchType(newType) {
    this.type = newType;
    this.updatedAt = new Date();
  }

  setMetadata(metadata) {
    this.metadata = { ...this.metadata, ...metadata };
  }

  getMetadata() {
    return this.metadata;
  }

  // needs update
  // getGraphInfo() { 
  //   return {
  //     id: this.id,
  //     name: this.name,
  //     type: this.type,
  //     xAxisLabel: this.xAxisLabel,
  //     yAxisLabel: this.yAxisLabel,
  //     dataset: this.dataset,
  //     style: this.style,
  //     metadata: this.metadata,
  //     createdAt: this.createdAt,
  //     updatedAt: this.updatedAt,
  //   };
  // }
}

export default Graph;
