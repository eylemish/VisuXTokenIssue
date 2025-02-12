class GraphStyle {
  constructor() {
    this.colorScheme = 'blue';
    this.markerStyle = { size: 8, color: 'blue' };
    this.lineStyle = { width: 2, dash: 'solid' };
    this.layoutSize = { width: 600, height: 400 };
  }

  getLayout() {
    return {
      width: this.layoutSize.width,
      height: this.layoutSize.height,
      title: 'Graph Visualization',
    };
  }

  getMarkerStyle() {
    return this.markerStyle;
  }

  getLineStyle() {
    return this.lineStyle;
  }

  setColorScheme(colorScheme) {
    this.colorScheme = colorScheme;
    this.markerStyle.color = colorScheme;
  }

  updateMarkerStyle(style) {
    this.markerStyle = { ...this.markerStyle, ...style };
  }

  updateLineStyle(style) {
    this.lineStyle = { ...this.lineStyle, ...style };
  }

  resizeLayout(width, height) {
    this.layoutSize = { width, height };
  }


  applyToGraph(graph) {
    graph.style = { ...graph.style, ...this };
  }


}

export default GraphStyle;
