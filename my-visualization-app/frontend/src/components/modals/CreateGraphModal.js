import React, { useState } from "react";

const CreateGraphModal = ({ onClose }) => {
  const [inputValue, setInputValue] = useState(""); // Kullanıcıdan alınan metin
  const [submittedName, setSubmittedName] = useState(""); // "Tamam" butonuna basıldığında gösterilecek isim

  // Kullanıcı input değerini güncelleyen fonksiyon
  const handleInputChange = (event) => {
    setInputValue(event.target.value);
  };

  // "Tamam" butonuna tıklanıldığında tetiklenen fonksiyon
  const handleSubmit = () => {
    setSubmittedName(inputValue); // Girilen metni submittedName'e kaydediyoruz
    setInputValue(""); // Input'u sıfırlıyoruz
  };

  return (
    <div className="modal-container">
      <div className="modal-content">
        <h2>Create Graph</h2>
        <div>
          <label>Enter your name:</label>
          <input
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            placeholder="Enter something"
          />
        </div>

        <button onClick={handleSubmit}>Tamam</button>

        {/* Eğer bir isim yazılmışsa, aşağıda gösteriyoruz */}
        {submittedName && <p>Bu kişinin ismi: "{submittedName}"</p>}

        <button onClick={onClose}>Close</button>
      </div>
    </div>
  );
};

export default CreateGraphModal;
