import React, { useState } from "react";
import { Button, Modal, Input, message } from "antd";

const TextRead = () => {
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [inputText, setInputText] = useState("");
  const [result, setResult] = useState("");

  const handleSendText = async () => {
    if (!inputText.trim()) {
      message.error("Please a text.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("http://127.0.0.1:8000/api/find-letters/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: inputText }),
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      const data = await response.json();
      setResult(data.letters.join(", "));
      message.success("Text analized.");
    } catch (error) {
      message.error("Error: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
      <Button onClick={() => setIsModalOpen(true)}>Text Read</Button>

      <Modal
        title="Text Analysis"
        open={isModalOpen}
        onOk={handleSendText}
        onCancel={() => setIsModalOpen(false)}
        confirmLoading={loading}
      >
        <Input
          placeholder="Please write something..."
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
        />
        {result && <p>The sententence includes letters: {result}</p>}
      </Modal>
    </div>
  );
};

export default TextRead;
