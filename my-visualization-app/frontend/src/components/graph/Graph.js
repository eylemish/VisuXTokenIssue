import GraphStyle from "./GraphStyle";
import { chartCategories } from "./ChartCategories";

class Graph {
  constructor(id, name, dataset, type, selectedFeatures, style = new GraphStyle()) {
    console.log("Graph constructor received dataset:", dataset);
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
    this.fittedCurve = null; // Stores curve-fitting data
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
    this.setType(newType);
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

  setFittedCurve(fittedCurve) {
    this.fittedCurve = fittedCurve;
    this.updatedAt = new Date();
  }

  getFittedCurve() {
    return this.fittedCurve;
  }

  getType() {
    return this.type;
  }

  setType(newType) {
    const oldType = this.type;
    this.type = newType;

    const oldRequiredFeatures = this.getRequiredFeatures(oldType);
    const newRequiredFeatures = this.getRequiredFeatures(newType);

    if (newRequiredFeatures > oldRequiredFeatures) {
      for (let i = 0; i < newRequiredFeatures - oldRequiredFeatures; i++) {
        this.selectedFeatures.push(this.selectedFeatures[0]);
      }
    } else if (newRequiredFeatures < oldRequiredFeatures) {
      this.selectedFeatures = this.selectedFeatures.slice(0, newRequiredFeatures);
    }
  }

  getRequiredFeatures(graphType) {
    for (let category in chartCategories) {
      const searchedType = chartCategories[category].find((searchedType) => searchedType.type === graphType);
      if (searchedType) return searchedType.requiredFeatures;
    }
    return 0;
  }
}

export default Graph;
