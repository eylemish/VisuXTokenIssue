import React from "react";
import FileUpload from "./FileUpload";
import FileDownload from "./FileDownload";
import DatasetManager from "./DatasetManager";

const datasetManager = new DatasetManager();

const FileComponent = ({ uiController }) => {
    if (!uiController) {
    console.error("uiController is undefined in FileComponent!");
    return null; // Avoid rendering empty components that cause errors
  }

  return (

    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
      <FileUpload datasetManager={datasetManager} />
      <FileDownload uiController={uiController} />
    </div>
  );
};

export default FileComponent;
