import React from "react";
import "./Desktop1UI.css"; // 引入样式文件

const Desktop1UI = () => {
  return (
    <div className="desktop1-container">
      {/* 顶部导航栏 */}
      <div className="navbar">
        <span className="title">VisuX</span>
        <img
          className="icon logo"
          src="https://ide.code.fun/api/image?token=679cb304defdb1001113adff&name=f210430c8139347a3931e8632c1a156d.png"
          alt="Logo"
        />
        <img
          className="icon menu"
          src="https://ide.code.fun/api/image?token=679cb304defdb1001113adff&name=ed972cc1071dd946184183d53c2971f9.png"
          alt="Menu Icon"
        />
      </div>

      {/* 侧边栏 + 内容区域 */}
      <div className="main-content">
        {/* 侧边栏 */}
        <div className="sidebar">
          <img
            className="sidebar-icon"
            src="https://ide.code.fun/api/image?token=679cb304defdb1001113adff&name=c86c16bc02b71b9757aae220923c8652.png"
            alt="Sidebar Icon"
          />
          <div className="sidebar-menu">
            <img
              className="menu-item"
              src="https://ide.code.fun/api/image?token=679cb304defdb1001113adff&name=e15aa2f64c4ac9f8af2f6659b056ec70.png"
              alt="Menu Item 1"
            />
            <img
              className="menu-item"
              src="https://ide.code.fun/api/image?token=679cb304defdb1001113adff&name=4372127d7244c4cef2ee145ebb658a3f.png"
              alt="Menu Item 2"
            />
          </div>
        </div>

        {/* 右侧内容 */}
        <div className="content">
          <span className="content-title">Graph List</span>
          <ul className="graph-list">
            <li>graph1</li>
            <li>graph2</li>
            <li>graph3</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Desktop1UI;
