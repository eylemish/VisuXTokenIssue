import React, { useState } from "react";

const CreateGraphModal = ({ onClose }) => {
  const [inputValue, setInputValue] = useState(""); // Text from user
  const [submittedName, setSubmittedName] = useState(""); // The name to be sended after clicking OK

  // Function to handle user interaction
  const handleInputChange = (event) => {
    setInputValue(event.target.value);
  };

  // The function that occurs after clicking OK
  const handleSubmit = () => {
    setSubmittedName(inputValue); // Saving the string written by the user
    setInputValue(""); // Reseting the input
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
            onChange={handleInputChange}
            placeholder="Enter something"
          />
        </div>

        <button onClick={handleSubmit}>OK</button>

        {/* Showing if the string is wriiten */}
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
