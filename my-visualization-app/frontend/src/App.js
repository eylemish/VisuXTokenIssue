import React, { useState } from 'react';
import Desktop1UI from "./components/desktop1ui/Desktop1UI";
import { Layout } from 'antd';
import UIController from './components/UIController';
import Sidebar from './components/homepage/Sidebar';
import HeaderNav from './components/homepage/Header';
import LayoutContainer from './components/homepage/Layout';
import ModalCollection from "./components/modal/ModalCollection";

const { Header, Sider, Content } = Layout;

const App = () => {
  const [uiController] = useState(new UIController());

  //这些是管理graph data log 三类界面的开闭，其中graph应该能管理所有graph窗口的开关 之后改
  const [showGraph, setShowGraph] = useState(false);
  const [showData, setShowData] = useState(false);
  const [showLog, setShowLog] = useState(false);

  return (
    <Layout style={{ minHeight: '100vh', overflow: 'hidden' }}>
      {/* 固定 Header */}
      <Header style={{ background: '#fff', color: '#000', padding: '0 20px', position: 'fixed', width: '100%', zIndex: 1000, boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)' }}>
        <HeaderNav uiController={uiController}/>
      </Header>

      <Layout style={{ marginTop: 64 }}>
        {/* 固定 Sidebar */}
        <Sider width={220} style={{ background: '#fff', position: 'fixed', height: '100vh', left: 0, top: 64, zIndex: 999, boxShadow: '2px 0 8px rgba(0, 0, 0, 0.1)' }}>
          <Sidebar uiController={uiController}
            showGraph={showGraph} setShowGraph={setShowGraph}
            showData={showData} setShowData={setShowData}
            showLog={showLog} setShowLog={setShowLog}/>
        </Sider>

        {/* Content 可滚动 */}
        <Layout style={{ marginLeft: 200 }}>
          <Content style={{
              overflowX: "hidden",
              overflowY: 'auto',
              height: 'calc(100vh - 64px)',
              padding: 0,
              display: 'flex',
              flexDirection: 'column' }}>
            <LayoutContainer uiController={uiController}
                             showGraph={showGraph}
                             showData={showData}
                             showLog={showLog} />
              <Desktop1UI />
          </Content>
        </Layout>
      </Layout>
        <ModalCollection uiController={uiController} />
    </Layout>
  );
};

export default App;
