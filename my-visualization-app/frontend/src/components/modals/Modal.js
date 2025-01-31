import React, { useState } from 'react';

const Modal = ({ isOpen, onClose, children }) => {
  return (
    isOpen && (
      <div className="modal-overlay">
        <div className="modal-content">
          <button onClick={onClose} className="close-button">X</button>
          {children}
        </div>
      </div>
    )
  );
};

export default Modal;
