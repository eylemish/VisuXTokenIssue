import React, { useState } from "react";
import { Layout, Menu, Modal } from "antd";
import {
  BarChartOutlined,
  DatabaseOutlined,
  FileTextOutlined,
  TableOutlined,
  SettingOutlined,
  SlidersOutlined,
} from "@ant-design/icons";
import DimReductionModal from "../modal/DimReductionModal";
import modalController from "../modal/ModalController";
import NewGraphModal from "../modal/NewGraphModal";
import CurveFittingModal from "../modal/CurveFittingModal";
import InterpolationModal from "../modal/InterpolationModal";
import ExtrapolationModal from "../modal/ExtrapolationModal";
import OversampleModal from "../modal/OversampleModal";
import CorrelationModal from "../modal/CorrelationModal";

const { Sider } = Layout;
const { SubMenu } = Menu;

const Sidebar = ({ uiController, setShowGraph, setShowData, setShowLog, showGraph, showData, showLog }) => {
  // 直接管理窗口开关 这些开闭不用经过uicontroller 下面的工具需要uicontroller，也需要注册工具类
  const [openKeys, setOpenKeys] = useState([]); // 控制展开菜单
  const [newGraphModalVisible, setNewGraphModalVisible] = useState(false);
  const [dimReductionModalVisible, setDimReductionModalVisible] = useState(false);
  const [curveFittingModalVisible, setCurveFittingModalVisible] = useState(false);
  const [interpolationModalVisible, setInterpolationModalVisible] = useState(false);
  const [extrapolationModalVisible, setExtrapolationModalVisible] = useState(false);
  const [oversampleModalVisible, setOversampleModalVisible] = useState(false);
  const [correlationModalVisible, setCorrelationModalVisible] = useState(false);

  const handleOpenChange = (keys) => {
    setOpenKeys(keys);
  };

  return (
    <Sider width={220} style={{ background: "#fff" }}>
      <Menu
        mode="inline"
        openKeys={openKeys}
        onOpenChange={handleOpenChange}
        defaultSelectedKeys={["graphOverview"]}
        style={{ height: "100%", borderRight: 0 }}
      >
        {/* 窗口开关（Graph / DataTable / Log） */}
        <Menu.Item
          key="toggleGraph"
          icon={<BarChartOutlined />}
          onClick={() => setShowGraph(!showGraph)}
        >
          {showGraph ? "Close Graph Window" : "Open Graph Window"}
        </Menu.Item>

        <Menu.Item
          key="toggleDataTable"
          icon={<TableOutlined />}
          onClick={() => setShowData(!showData)}
        >
          {showData ? "Close Data Table" : "Open Data Table"}
        </Menu.Item>

        <Menu.Item
          key="toggleLog"
          icon={<FileTextOutlined />}
          onClick={() => setShowLog(!showLog)}
        >
          {showLog ? "Close Log Window" : "Open Log Window"}
        </Menu.Item>

        {/* Graph Manager */}
        <SubMenu key="graphManager" icon={<BarChartOutlined />} title="Graph Manager">
          <Menu.Item key="newGraph" onClick={() => setNewGraphModalVisible(true)}>
            New Graph
          </Menu.Item>
        </SubMenu>

        {/* Data Processing */}
        <SubMenu key="dataProcessing" icon={<SettingOutlined />} title="Data Processing">
          <Menu.Item key="dimReduction" onClick={() => setDimReductionModalVisible(true)}>
            Dimensionality Reduction
          </Menu.Item>
        </SubMenu>

      {/* Data Analysis */}
        <SubMenu key="dataAnalysis" icon={<SettingOutlined />} title="Data Analysis">
          <Menu.Item key="Curve Fitting" onClick={() => setCurveFittingModalVisible(true)}>
            Curve Fitting
          </Menu.Item>
          <Menu.Item key="Interpolate Data" onClick={() => setInterpolationModalVisible(true)}>
            Interpolate Data
          </Menu.Item>
          <Menu.Item key="Extrapolate Data" onClick={() => setExtrapolationModalVisible(true)}>
            Extrapolate Data
          </Menu.Item>
          <Menu.Item key="Oversample Data" onClick={() => setOversampleModalVisible(true)}>
            Oversample Data
          </Menu.Item>
          <Menu.Item key="Correlate Data" onClick={() => setCorrelationModalVisible(true)}>
            Correlate Data
          </Menu.Item>
        </SubMenu>
      </Menu>




      {/* modal将来要移动到别处 可能是放在modalmanager里 manager是组件 controller是逻辑*/}
      {/* 新建 Graph 的 Modal */}
      <NewGraphModal
        visible={newGraphModalVisible}
        onCancel={() => setNewGraphModalVisible(false)}
        uiController={uiController}
      />

      {/* curve fitting 的 Modal */}
      <CurveFittingModal
        visible={curveFittingModalVisible}
        onCancel={() => setCurveFittingModalVisible(false)}
        uiController={uiController}
      />

      {/* interpolation 的 Modal */}
      <InterpolationModal
        visible={interpolationModalVisible}
        onCancel={() => setInterpolationModalVisible(false)}
        uiController={uiController}
      />

      {/* extrapolation 的 Modal */}
      <ExtrapolationModal
        visible={extrapolationModalVisible}
        onCancel={() => setExtrapolationModalVisible(false)}
        uiController={uiController}
      />

      {/* oversample data 的 Modal */}
      <OversampleModal
        visible={oversampleModalVisible}
        onCancel={() => setOversampleModalVisible(false)}
        uiController={uiController}
      />


      {/* correlate data 的 Modal */}
      <CorrelationModal
        visible={correlationModalVisible}
        onCancel={() => setCorrelationModalVisible(false)}
        uiController={uiController}
      />


      {/* 降维 Modal */}
       <DimReductionModal
           title="Dimensionality Reduction"
           visible={dimReductionModalVisible}
           onCancel={() => setDimReductionModalVisible(false)}
           onClose={() => setDimReductionModalVisible(false)}
           onUpdateDataset={(newData) => console.log("Updated dataset:", newData)}
           logAction={(log) => console.log("Log:", log)}
       />

    </Sider>
  );
};

export default Sidebar;
