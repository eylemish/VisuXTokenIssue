import GraphStyle from "./GraphStyle";

class Graph {
  constructor(id, name, dataset, type, selectedFeatures, style = new GraphStyle()) {
    console.log("📊 Graph constructor received dataset:", dataset);
    this.id = id;
    this.name = name;
    this.dataset = dataset; // { x: [...], y: [...] }
    this.type = type; // 'scatter', 'bar', 'line', etc.
    this.selectedFeatures = selectedFeatures;
    this.xAxis = selectedFeatures[0];
    this.yAxis = selectedFeatures[1];
    this.zAxis = selectedFeatures[2];
    this.style = style instanceof GraphStyle ? style : new GraphStyle();
    this.metadata = {};
    this.createdAt = new Date();
    this.updatedAt = new Date();
    this.visible = true;
    this.fittedCurve = null;  // Used to store curve-fitting data
  }

  updateDataset(newDataset) {
    this.dataset = newDataset;
    this.updatedAt = new Date();
  }

  changeColor(newColor) {
    this.style.setColorScheme(newColor);
    this.updatedAt = new Date();
  }

  updateStyle(newStyle) {
    if (newStyle instanceof GraphStyle) {
      this.style = newStyle;
    } else {
      Object.assign(this.style, newStyle);
    }
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

  toggleVisibility() {
    this.visible = !this.visible;
    this.updatedAt = new Date();
  }

  getXAxis() {
    return this.xAxis;
  }

  setXAxis(xAxis) {
    this.selectedFeatures[0] = xAxis;
    this.xAxis = xAxis;
  }

  getYAxis() {
    return this.yAxis;
  }

  setYAxis(yAxis) {
    this.selectedFeatures[1] = yAxis;
    this.yAxis = yAxis;
  }

  getZAxis() {
    return this.zAxis;
  }

  setZAxis(zAxis) {
    this.selectedFeatures[2] = zAxis;
    this.zAxis = zAxis;
  }

  getDataset() {
    return this.dataset;
  }

  setDataset(newDataset) {
    this.dataset = newDataset;
  }

  // 设置拟合曲线数据
  setFittedCurve(fittedCurve) {
    this.fittedCurve = fittedCurve;
    this.updatedAt = new Date();
  }

  // 获取拟合曲线数据
  getFittedCurve() {
    return this.fittedCurve;
  }
}

export default Graph;
