import React, { useState } from "react";
import CreateGraphModal from "./CreateGraphModal";
import AddDatasetModal from "./AddDatasetModal";
import TestModal from "./TestModal";
//Will add more Modal later

const ModalController = ({ activeTool , onClose, onCreate }) => {
    console.log("ModalController Rendered - Active Tool:", activeTool);

  switch (activeTool) {
    case "Create Graph":
        console.log("Rendering CreateGraphModal");
        return <CreateGraphModal onClose={onClose} onCreate={onCreate} />;
    case "addDataset":
      return <AddDatasetModal onClose={onClose} onCreate={onCreate} />;
    case "Test Modal":
        return <TestModal onClose={onClose} />;
    default:
        console.log("No active modal");
      return null;
  }
};

export default ModalController;
