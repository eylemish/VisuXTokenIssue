import { PictureOutlined, LineChartOutlined, BarChartOutlined, PieChartOutlined, HeatMapOutlined, RadarChartOutlined, DotChartOutlined, AreaChartOutlined } from '@ant-design/icons';
// i am not sure if the import is needed - ezgi
export const chartCategories = {
    "Basic Charts": [
      { type: "scatter", name: "Scatter Plot", icon: <PictureOutlined />, requiredFeatures: 2 },
      { type: "line", name: "Line Chart", icon: <LineChartOutlined />, requiredFeatures: 2 },
      { type: "bar", name: "Bar Chart", icon: <BarChartOutlined />, requiredFeatures: 2 },
      { type: "pie", name: "Pie Chart", icon: <PieChartOutlined />, requiredFeatures: 1 },
    ],
    "Advanced Charts": [
      { type: "heatmap", name: "Heatmap", icon: <HeatMapOutlined />, requiredFeatures: 3 },
      { type: "scatterpolar", name: "Radar Chart", icon: <RadarChartOutlined />, requiredFeatures: 3 },
      { type: "dot", name: "Dot Chart", icon: <DotChartOutlined />, requiredFeatures: 2 },
      { type: "area", name: "Area Chart", icon: <AreaChartOutlined />, requiredFeatures: 2 },
    ],
  };
  