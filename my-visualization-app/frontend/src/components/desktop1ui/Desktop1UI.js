import React, { useState, useRef } from "react";
import Plot from "react-plotly.js";
import Papa from "papaparse";
import GraphManager from '../graphs/GraphManager'; 
import "./Desktop1UI.css";

const Desktop1UI = () => {
  const [fileData, setFileData] = useState(null);
  const [graphManager] = useState(new GraphManager());
  const fileInputRef = useRef(null);

  const handleUploadClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.name.endsWith(".csv")) {
      alert("Please upload only csv now");
      return;
    }

    Papa.parse(file, {
      complete: (result) => {
        const data = result.data;
        if (data.length < 2) {
          alert("no enough data");
          return;
        }

        const columns = data[0];
        const rows = data.slice(1).map((row) => row.map(Number));

        const mean = columns.map((_, i) =>
          rows.reduce((sum, row) => sum + row[i], 0) / rows.length
        );
        const std = columns.map((_, i) => {
          const avg = mean[i];
          const variance =
            rows.reduce((sum, row) => sum + Math.pow(row[i] - avg, 2), 0) /
            rows.length;
          return Math.sqrt(variance);
        });

        setFileData({ columns, mean, std });
      },
      header: false,
      skipEmptyLines: true,
    });
  };

  return (
    <div className="desktop1-container">
      {/* navigator */}
      <div className="navbar">
        <span className="title">VisuX</span>
        <img
          className="icon logo"
          src="https://ide.code.fun/api/image?token=679cb304defdb1001113adff&name=f210430c8139347a3931e8632c1a156d.png"
          alt="Logo"
        />
        <img
          className="icon menu"
          src="https://ide.code.fun/api/image?token=679cb304defdb1001113adff&name=ed972cc1071dd946184183d53c2971f9.png"
          alt="Menu Icon"
        />
      </div>

      {/* main */}
      <div className="main-content">
        {/* side */}
        <div className="sidebar">
          <img
              className="upload-folder"
              src="https://ide.code.fun/api/image?token=679cb304defdb1001113adff&name=c86c16bc02b71b9757aae220923c8652.png"
              alt="Upload Folder"
              onClick={handleUploadClick}
          />
          <input
              type="file"
              accept=".csv"
              ref={fileInputRef}
              style={{display: "none"}}
              onChange={handleFileChange}
          />
          <div className="sidebar-menu">
            {/* menu */}
            <img
                className="menu-item"
                src="https://ide.code.fun/api/image?token=679cb304defdb1001113adff&name=e15aa2f64c4ac9f8af2f6659b056ec70.png"
                alt="Menu Item 1"
            />
            <img
              className="menu-item"
              src="https://ide.code.fun/api/image?token=679cb304defdb1001113adff&name=4372127d7244c4cef2ee145ebb658a3f.png"
              alt="Menu Item 2"
            />
          </div>
        </div>

        {/* middle */}
        <div className="content">
          <span className="content-title">Graph List</span>
          <ul className="graph-list">
            <li>graph1</li>
            <li>graph2</li>
            <li>graph3</li>
          </ul>

          {/* graph show on right */}
          <div className="plot-container">
            {fileData && (
              <Plot
                data={[
                  {
                    x: fileData.columns,
                    y: fileData.mean,
                    type: "bar",
                    name: "Mean",
                  },
                  {
                    x: fileData.columns,
                    y: fileData.std,
                    type: "bar",
                    name: "Standard Deviation",
                  },
                ]}
                layout={{ title: "Data Visualization" }}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Desktop1UI;
