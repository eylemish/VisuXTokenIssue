import React, { useState } from "react";
import WindowManager from "../windows/WindowManager";
import CreateGraphWindow from "../windows/CreateGraphWindow"; 
import VisualizationManager from "../graphs/VisualizationManager";

const CreateGraphModal = ({ onClose }) => {
  const [inputValue, setInputValue] = useState("");
  const [file, setFile] = useState(null);
  const [features, setFeatures] = useState([]);
  const [graphScript, setGraphScript] = useState(""); 

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile && selectedFile.name.endsWith(".csv")) {
      setFile(selectedFile);
      VisualizationManager.extractFeaturesFromCSV(selectedFile)
        .then((features) => {
          setFeatures(features);

          // CSV'den verileri okuyup grafiği oluşturacak scripti hazırlıyoruz
          const reader = new FileReader();
          reader.onload = (e) => {
            const content = e.target.result;
            const rows = content.split("\n").map(row => row.trim().split(","));

            const dataRows = rows.slice(1); // Başlık dışında kalan veriler
            const xValues = dataRows.map(row => parseFloat(row[0])); // İlk feature X
            const yValues = dataRows.map(row => parseFloat(row[1])); // İkinci feature Y

            const script = `
              Plotly.newPlot('graph', [{
                x: ${JSON.stringify(xValues)},
                y: ${JSON.stringify(yValues)},
                type: 'scatter',
                mode: 'lines+markers',
                marker: { color: 'blue' }
              }], {
                title: 'Graph Visualization'
              });
            `;
            setGraphScript(script);
          };
          reader.readAsText(selectedFile);
        })
        .catch((err) => {
          alert(err);
        });
    } else {
      alert("Please upload a valid CSV file.");
    }
  };

  const handleSubmit = () => {
    if (!inputValue.trim()) {
      alert("Please enter a graph name.");
      return;
    }

    if (file && features.length > 0) {
      const windowContent = CreateGraphWindow(inputValue, file.name); // Feature'ları buradan kaldırdık
      WindowManager.openWindow(windowContent, graphScript, "Create Graph Window");
    } else {
      alert("Please upload a CSV file and ensure it has valid features.");
    }

    setInputValue("");
    setFile(null);
    setFeatures([]);
    setGraphScript("");
    onClose();
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <h2>Create Graph</h2>
        <div>
          <label>Enter your graph name:</label>
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Enter graph name"
          />
        </div>

        <div>
          <label>Upload CSV file:</label>
          <input
            type="file"
            accept=".csv"
            onChange={handleFileChange}
          />
        </div>

        {/* Feature Listesi */}
        {features.length > 0 && (
          <div>
            <h3>Features:</h3>
            <ul>
              {features.map((feature, index) => (
                <li key={index}>{feature}</li>
              ))}
            </ul>
          </div>
        )}

        <button onClick={handleSubmit}>OK</button>
        <button onClick={onClose}>Close</button>
      </div>
    </div>
  );
};

const styles = {
  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  modal: {
    backgroundColor: "white",
    padding: "20px",
    borderRadius: "5px",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
    textAlign: "center",
    width: "300px",
  },
};

export default CreateGraphModal;
