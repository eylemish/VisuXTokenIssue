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
  rowHeight: 80, // 适配窗口高度，避免变成竖长条
  width: window.innerWidth - 200, // 让网格适配屏幕宽度
};

const defaultLayout = [
    //最开始的设置尺寸，看最后需不需要删掉
  { i: "dataTable", x: 0, y: 0, w: 6, h: 5, minW: 5, minH: 5, maxW: 8, maxH: 8 },
  { i: "graphSection", x: 0, y: 0, w: 6, h: 4, minW: 4, minH: 2 },
  { i: "logWindow", x: 0, y: 0, w: 6, h: 5, minW: 4, minH: 4 },

  { i: "graphWindow", x: 0, y: 5, w: 6, h: 5, minW: 6, minH: 4 },
];

//这个函数是为了布局，普通布局是往下排列，这个保证右侧有空间时会向右排列
const getDefaultLayout = ({ showGraph, showData, showLog }) => {
  const layout = [];
  let lastX = 0, lastY = 0; // 记录当前布局中最右边和最下面的窗口位置

  const addWindow = (key, width, height) => {
    // **如果右侧有空间**，优先往右排
    if (lastX + width <= gridConfig.cols) {
      layout.push({ i: key, x: lastX, y: lastY, w: width, h: height, minW: 4, minH: 4 });
      lastX += width; // 更新 lastX
    } else {
      // **否则换到下一行**
      lastX = 0;
      lastY += height; // 向下排列
      layout.push({ i: key, x: lastX, y: lastY, w: width, h: height, minW: 4, minH: 4 });
      lastX += width; // 更新 lastX
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

  const logManager = uiController.getLogManager(); // 通过 UIController 访问日志管理器
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

  // 当 `showGraph`、`showData`、`showLog` 变化时，更新 layout
  useEffect(() => {
    setLayout(getDefaultLayout({ showGraph, showData, showLog }));
  }, [showGraph, showData, showLog]);




  const openGraph = (graphId) => {
  const newWindow = uiController.openGraphWindow(graphId);
  console.log("New Graph Window:", newWindow); // 确保 window 数据正确
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




  return (
    <div>
      <GridLayout
          className="layout"
          layout={layout}
          cols={gridConfig.cols}
          rowHeight={gridConfig.rowHeight}
          width={gridWidth}
          margin={[16, 16]} // 窗口之间的距离
          containerPadding={[24, 24]} //距离content边界的距离
          onLayoutChange={onLayoutChange}
          draggableHandle=".drag-handle"
      >

        {/* 仅在 showData 为 true 时渲染 DataWindow */}
        {showData && (
          <div key="dataTable" className="drag-handle" style={{ height: "100%", width: "100%", display:"flex", minWidth: "400px", minHeight: "300px" }}>
            <DataWindow style={{ flex: 1 }} isVisible={true} />
          </div>
        )}

        {/* 仅在 showGraph 为 true 时渲染 GraphSection */}
        {showGraph && (
          <div key="graphSection" className="drag-handle" style={{ height: "100%", width: "100%" }}>
            <GraphSection style={{ flex: 1 }} />
          </div>
        )}

            {/* 仅在 showLog 为 true 时渲染 LogWindow */}
        {showLog && (
          <div key="logWindow"
               className="drag-handle"
               style={{
                 height: "100%", // 让窗口适应内容高度
                 width: "100%",
                 minHeight: "300px", //确保最小高度合适
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
