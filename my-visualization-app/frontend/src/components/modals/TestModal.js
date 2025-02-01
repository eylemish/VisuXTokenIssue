import React from "react";

const TestModal = ({ onClose }) => {
  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <h2>Hello!</h2>
        <button onClick={onClose}>Kapat</button>
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
  },
};

export default TestModal;
