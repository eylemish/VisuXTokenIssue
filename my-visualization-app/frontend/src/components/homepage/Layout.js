import React, { useState, useEffect } from "react";
import GridLayout from "react-grid-layout";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
import DataWindow from "../table/DataWindow";
import GraphSection from "../graph/GraphSection";
import LogWindow from "../log/LogWindow";
import EditGraphPanel from "../graph/EditGraphPanel";
import DataTable from "../table/DataTable";

const gridConfig = {
  cols: 12,
  rowHeight: 80, // Adapt the height of the window to prevent it from becoming a vertical bar.
  width: window.innerWidth - 200, // Make the grid fit the width of the screen
};

const defaultLayout = [
  { i: "dataTable", x: 0, y: 0, w: 6, h: 5, minW: 5, minH: 5, maxW: 8, maxH: 8 },
  { i: "data", x: 0, y: 0, w: 6, h: 5, minW: 5, minH: 5, maxW: 8, maxH: 8 },
  { i: "graphSection", x: 0, y: 0, w: 6, h: 4, minW: 4, minH: 2 },
  { i: "logWindow", x: 0, y: 0, w: 6, h: 5, minW: 4, minH: 4 },

  { i: "graphWindow", x: 0, y: 5, w: 6, h: 5, minW: 6, minH: 4 },
  { i: "editWindow", x: 0, y: 0, w: 6, h: 5, minW: 4, minH: 4 },
];

//This function is for layout, the normal layout is downwards, this ensures that when there is space on the right side, it will be aligned to the right.
const getDefaultLayout = ({ showGraph, showData, showLog, showTable, showGraphEdit }) => {
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

  if (showTable) addWindow("dataTable", 6, 5);
  if (showData) addWindow("data", 6, 5);
  if (showGraph) addWindow("graphSection", 6, 4);
  if (showLog) addWindow("logWindow", 6, 5);
  if (showGraphEdit) addWindow("editWindow", 6, 5);



  return layout;
};



const LayoutContainer = ({uiController, showGraph, showData, showLog, showTable,showGraphEdit}) => {
  const [layout, setLayout] = useState(defaultLayout);
  const [gridWidth, setGridWidth] = useState(gridConfig.width);

  const [graphWindows, setGraphWindows] = useState([]);

 // const logManager = uiController.getLogManager(); // Access to the log manager via UIController

  const [logManager, setLogManager] = useState(() => uiController.getLogManager());
  const [logs, setLogs] = useState(logManager.getLogs());

  useEffect(() => {
    const interval = setInterval(() => {
      setLogs([...logManager.getLogs()]); // Get logs every 500ms
    }, 500);

    return () => clearInterval(interval); // clear the interval
  }, []);


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

  // Update the layout when `showGraph`, `showData`, `showLog` 'showTable' 'showgraphedit' change.
  useEffect(() => {
    setLayout(getDefaultLayout({ showGraph, showData, showLog, showTable, showGraphEdit }));
  }, [showGraph, showData, showLog, showTable, showGraphEdit]);




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
        {showTable && (
          <div key="dataTable" className="drag-handle" style={{ height: "100%", width: "100%", display:"flex", minWidth: "400px", minHeight: "300px" }}>
            <DataTable style={{ flex: 1 }} isVisible={true} />
          </div>
        )}


        {showData && (
          <div key="data" className="drag-handle" style={{ height: "100%", width: "100%", display:"flex", minWidth: "400px", minHeight: "300px" }}>
            <DataWindow style={{ flex: 1 }} isVisible={true} />
          </div>
        )}

        {/* Render GraphSection only if showGraph is true */}
        {showGraph && (
          <div key="graphSection" className="drag-handle" style={{ height: "100%", width: "100%" }}>
            <GraphSection style={{ flex: 1 }} />
          </div>
        )}


        {/* new graph edit */}
        {showGraphEdit && (
          <div key="editWindow" className="drag-handle" style={{ height: "100%", width: "100%" }}>
            <EditGraphPanel style={{ flex: 1 }} />
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
            <LogWindow style={{ flex: 1 }} logs={logManager.getLogs()} />
          </div>
        )}
      </GridLayout>
      
    </div>
  );
};

export default LayoutContainer;
