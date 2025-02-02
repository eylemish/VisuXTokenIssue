import React, { useState } from "react";
import WindowManager from "../windows/WindowManager";
const CreateGraphModal = ({ onClose }) => {
  const [inputValue, setInputValue] = useState(""); // Graph name
  const [submittedName, setSubmittedName] = useState(""); // Graph name by user
  const [file, setFile] = useState(null); // File uploaded

  // Uploading file
  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile && selectedFile.name.endsWith(".csv")) {
      setFile(selectedFile);
    } else {
      alert("Please upload a valid CSV file.");
    }
  };

  const handleSubmit = () => {
    setSubmittedName(inputValue);
    
    // If the file is uploaded, we open the new window and show the message "File Uploaded"
    if (file) {
      WindowManager.openWindow(
        `<h2>Graph Name: ${inputValue}</h2><p>File Uploaded: ${file.name}</p>`,
        "Create Graph Window"
      );
    } else {
      alert("Please upload a CSV file.");
    }
    setInputValue(""); // We clear the input field
    onClose(); // Closing the modal
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

        {submittedName && <p>The name of this graph: "{submittedName}"</p>}

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
