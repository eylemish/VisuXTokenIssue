import React, { useState, useEffect } from "react";
import GridLayout from "react-grid-layout";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
import DataWindow from "../table/DataWindow";
import GraphSection from "../graph/GraphSection";
import LogHistory from "../log/LogHistory";
import GraphComponent from "../graph/GraphComponent";
import GraphWindow from "../graph/GraphWindow";
import LogManager from "../log/LogManager";
import LogWindow from "../log/LogWindow";

const gridConfig = {
  cols: 12,
  rowHeight: 80, // Adapt the height of the window to prevent it from becoming a vertical bar.
  width: window.innerWidth - 200, // Make the grid fit the width of the screen
};

const defaultLayout = [
  { i: "dataTable", x: 0, y: 0, w: 6, h: 5, minW: 5, minH: 5, maxW: 8, maxH: 8 },
  { i: "graphSection", x: 0, y: 0, w: 6, h: 4, minW: 4, minH: 2 },
  { i: "logWindow", x: 0, y: 0, w: 6, h: 5, minW: 4, minH: 4 },

  { i: "graphWindow", x: 0, y: 5, w: 6, h: 5, minW: 6, minH: 4 },
];

//This function is for layout, the normal layout is downwards, this ensures that when there is space on the right side, it will be aligned to the right.
const getDefaultLayout = ({ showGraph, showData, showLog }) => {
  const layout = [];
  let lastX = 0, lastY = 0; // Record the positions of the right-most and bottom-most windows in the current layout.

  const addWindow = (key, width, height) => {
    // **If there is space on the right side**, prioritise right rows
    if (lastX + width <= gridConfig.cols) {
      layout.push({ i: key, x: lastX, y: lastY, w: width, h: height, minW: 4, minH: 4 });
      lastX += width; // Update lastX
    } else {
      // **Otherwise go to next line**
      lastX = 0;
      lastY += height; // downwards
      layout.push({ i: key, x: lastX, y: lastY, w: width, h: height, minW: 4, minH: 4 });
      lastX += width; // Update lastX
    }
  };

  if (showData) addWindow("dataTable", 6, 5);
  if (showGraph) addWindow("graphSection", 6, 4);
  if (showLog) addWindow("logWindow", 6, 5);

  return layout;
};



const LayoutContainer = ({uiController, showGraph, showData, showLog}) => {
  const [layout, setLayout] = useState(defaultLayout);
  const [gridWidth, setGridWidth] = useState(gridConfig.width);

  const [graphWindows, setGraphWindows] = useState([]);

  const logManager = uiController.getLogManager(); // Access to the log manager via UIController
  const [logs, setLogs] = useState(logManager.getLogs());



  useEffect(() => {
    const handleResize = () => {
      setGridWidth(window.innerWidth - 200);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const onLayoutChange = (newLayout) => {
    setLayout(newLayout);
    console.log("Updated Layout:", newLayout);
  };

  // Update the layout when `showGraph`, `showData`, `showLog` change.
  useEffect(() => {
    setLayout(getDefaultLayout({ showGraph, showData, showLog }));
  }, [showGraph, showData, showLog]);




  const openGraph = (graphId) => {
  const newWindow = uiController.openGraphWindow(graphId);
  console.log("New Graph Window:", newWindow); // Make sure the window data is correct
  if (newWindow) {
    setGraphWindows([...graphWindows, newWindow]);
  } else {
    console.error("Failed to open GraphWindow: Invalid graph ID");
  }
};

  const closeGraph = (windowId) => {
    uiController.closeGraphWindow(windowId);
    setGraphWindows(graphWindows.filter((win) => win.id !== windowId));
  };


  useEffect(() => {
  setLogs([...logManager.getLogs()]);
  }, [logManager]
  );

  const handleUndo = (index) => {
    logManager.undo();
    setLogs([...logManager.getLogs()]);
  };

  const handleRedo = (index) => {
    logManager.redo();
    setLogs([...logManager.getLogs()]);
  };

  const handleRollback = (index) => {
    const dataset = logManager.rollbackToVersion(index);
    if (dataset) {
      console.log("Rollback to version:", dataset);
    } else {
      console.error("Invalid rollback version.");
    }
  };

  useEffect(() => {
    const style = document.createElement("style");
    style.innerHTML = `
      .react-grid-placeholder {
        display: none !important;
      }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);


  return (
    <div>
      <GridLayout
          className="layout"
          layout={layout}
          cols={gridConfig.cols}
          rowHeight={gridConfig.rowHeight}
          width={gridWidth}
          margin={[16, 16]} // Distance between windows
          containerPadding={[24, 24]} // Distance from the border of the content
          onLayoutChange={onLayoutChange}
          draggableHandle=".drag-handle"
      >

        {/* Render DataWindow only if showData is true */}
        {showData && (
          <div key="dataTable" className="drag-handle" style={{ height: "100%", width: "100%", display:"flex", minWidth: "400px", minHeight: "300px" }}>
            <DataWindow style={{ flex: 1 }} isVisible={true} />
          </div>
        )}

        {/* Render GraphSection only if showGraph is true */}
        {showGraph && (
          <div key="graphSection" className="drag-handle" style={{ height: "100%", width: "100%" }}>
            <GraphSection style={{ flex: 1 }} />
          </div>
        )}

            {/* Render LogWindow only if showLog is true */}
        {showLog && (
          <div key="logWindow"
               className="drag-handle"
               style={{
                 height: "100%", // Make the window fit the height of the content
                 width: "100%",
                 minHeight: "300px",
                 minWidth: "400px",
                 display:"flex",
          }}>
            <LogWindow style={{ flex: 1 }} logs={logs} onUndo={handleUndo} onRedo={handleRedo} onRollback={handleRollback} />
          </div>
        )}

      </GridLayout>
    </div>
  );
};

export default LayoutContainer;
