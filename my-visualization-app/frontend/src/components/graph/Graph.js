
class Graph {
  constructor(id, name, type, dataset, xAxisLabel = 'X-Axis', yAxisLabel = 'Y-Axis', style = {}) {
    this.id = id;
    this.name = name;
    this.type = type; // 'scatter', 'bar', 'line', etc.
    this.dataset = dataset; // { x: [...], y: [...] }
    this.xAxisLabel = xAxisLabel;
    this.yAxisLabel = yAxisLabel;
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

  getGraphInfo() {
    return {
      id: this.id,
      name: this.name,
      type: this.type,
      xAxisLabel: this.xAxisLabel,
      yAxisLabel: this.yAxisLabel,
      dataset: this.dataset,
      style: this.style,
      metadata: this.metadata,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}

export default Graph;
