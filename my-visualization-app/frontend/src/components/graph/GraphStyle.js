class GraphStyle {
  constructor() {
    this.colorScheme = '#0000FF';
    this.markerStyle = { size: 8, color: '#0000FF' };
    this.lineStyle = { width: 2, dash: 'solid' };
    this.layoutSize = { width: 600, height: 400 };
    this.backgroundColor = '#FFFFFF';
  }

  /**
   * Getting information about the layout of a chart
   */
  getLayout() {
    return {
      width: this.layoutSize.width,
      height: this.layoutSize.height,
      title: 'Graph Visualization',
      paper_bgcolor: this.backgroundColor, // 背景颜色
      plot_bgcolor: this.backgroundColor,
    };
  }

  /**
   * Setting the colour scheme
   */
  setColorScheme(colorScheme) {
    this.colorScheme = colorScheme;
    this.markerStyle.color = colorScheme;
  }

  /**
   * Get current colour scheme
   */
  getColorScheme() {
    return this.colorScheme;
  }

  /**
   * Change colour
   */
  changeColor(newColor) {
    this.setColorScheme(newColor);
  }

  /**
   * Get the current markup style
   */
  getMarkerStyle() {
    return this.markerStyle;
  }

  /**
   * Get the current line style
   */
  getLineStyle() {
    return this.lineStyle;
  }

  /**
   * Updating the markup style
   */
  updateMarkerStyle(style) {
    this.markerStyle = { ...this.markerStyle, ...style };
  }

  /**
   * Updated line styles
   */
  updateLineStyle(style) {
    this.lineStyle = { ...this.lineStyle, ...style };
  }

  /**
   * Resizing the Chart Layout
   */
  resizeLayout(width, height) {
    this.layoutSize = { width, height };
  }

  /**
   * Applying Styles to Graph Objects
   */
  applyToGraph(graph) {
    if (graph && typeof graph === "object") {
      graph.style = { ...graph.style, ...this };
    } else {
      console.warn("applyToGraph: Invalid graph object provided.");
    }
  }
}

export default GraphStyle;
