export const enableMock = true; // 设置为 false 以禁用 mockData

export const mockGraphs = Array.from({ length: 50 }, (_, index) => ({
  id: `graph_${index + 1}`,
  name: `Graph ${index + 1}`,
  type: index % 2 === 0 ? "scatter" : "line",
  dataset: {
    x: Array.from({ length: 100 }, () => Math.random() * 100),
    y: Array.from({ length: 100 }, () => Math.random() * 100),
  },
  style: {
    color: index % 2 === 0 ? "blue" : "red",
    markerSize: 6 + Math.random() * 4,
  },
}));
