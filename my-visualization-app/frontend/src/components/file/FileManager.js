import React from "react";
import FileUpload from "./FileUpload";
import FileDownload from "./FileDownload";

const FileManager = ({ uiController }) => {
    if (!uiController) {
    console.error("uiController is undefined in FileManager!");
    return null; // Avoid rendering empty components that cause errors
  }

  return (

    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
      <FileUpload uiController={uiController} />
      <FileDownload uiController={uiController} />
    </div>
  );
};

export default FileManager;
