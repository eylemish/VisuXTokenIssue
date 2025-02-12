class GraphStyle {
  constructor() {
    this.colorScheme = "blue";
    this.markerStyle = { size: 8, color: "blue" };
    this.layoutSize = { width: 300, height: 150 };
    this.margin = { t: 20, b: 20, l: 20, r: 20 };
  }

  getLayout() {
    return {
      width: this.layoutSize.width,
      height: this.layoutSize.height,
      title: "Graph Visualization",
      margin: this.margin,
    };
  }

  getMarkerStyle() {
    return this.markerStyle;
  }

  setColorScheme(colorScheme) {
    this.colorScheme = colorScheme;
    this.markerStyle.color = colorScheme;
  }

  updateMarkerStyle(style) {
    this.markerStyle = { ...this.markerStyle, ...style };
  }

  resizeLayout(width, height) {
    this.layoutSize = { width, height };
  }

  setMargins(t, b, l, r) {
    this.margin = { t, b, l, r }; // Allow dynamic margin adjustments
  }
}

export default GraphStyle;
