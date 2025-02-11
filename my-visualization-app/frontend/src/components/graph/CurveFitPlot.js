import React, { useEffect, useRef } from "react";
import Plotly from "plotly.js-dist";

const CurveFitPlot = ({ originalData, fittedData }) => {
  const plotRef = useRef(null);

  useEffect(() => {
    if (originalData.length > 0 && fittedData.length > 0) {
      const originalTrace = {
        x: originalData.map((point) => point.x),
        y: originalData.map((point) => point.y),
        mode: "markers",
        type: "scatter",
        name: "Original Data",
        marker: { color: "blue" },
      };

      const fittedTrace = {
        x: fittedData.map((point) => point.x),
        y: fittedData.map((point) => point.y),
        mode: "lines",
        type: "scatter",
        name: "Fitted Curve",
        line: { color: "red" },
      };

      const layout = {
        title: "Curve Fitting Visualization",
        xaxis: { title: "X Axis" },
        yaxis: { title: "Y Axis" },
      };

      Plotly.newPlot(plotRef.current, [originalTrace, fittedTrace], layout);
    }
  }, [originalData, fittedData]);

  return <div ref={plotRef} style={{ width: "100%", height: "500px" }} />;
};

export default CurveFitPlot;