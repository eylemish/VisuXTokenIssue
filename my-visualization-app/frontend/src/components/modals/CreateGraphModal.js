
import React, { useState } from "react";
import WindowManager from "../windows/WindowManager";
import CreateGraphWindow from "../windows/CreateGraphWindow"; 
import VisualizationManager from "../graphs/VisualizationManager"; // VisualizationManager'ı ekledik

const CreateGraphModal = ({ onClose }) => {
  const [inputValue, setInputValue] = useState(""); // Graph name
  const [file, setFile] = useState(null); // File uploaded
  const [features, setFeatures] = useState([]); // CSV'den alınan feature'lar

  // Dosya değişikliği
  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile && selectedFile.name.endsWith(".csv")) {
      setFile(selectedFile);
      // Dosyayı VisualizationManager'a gönderip feature'ları alıyoruz
      VisualizationManager.extractFeaturesFromCSV(selectedFile)
        .then((features) => {
          setFeatures(features); // Feature isimlerini state'e kaydediyoruz
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
      // Create the window content using CreateGraphWindow function
      const windowContent = CreateGraphWindow(inputValue, file.name, features);
      // Open the new window and pass the content (graph name, file name, and features)
      WindowManager.openWindow(windowContent, "Create Graph Window");
    } else {
      alert("Please upload a CSV file and ensure it has valid features.");
    }

    // Clear input and file selection after submit
    setInputValue("");
    setFile(null);
    setFeatures([]);
    onClose(); // Close the modal
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
