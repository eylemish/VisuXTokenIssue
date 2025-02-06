import React from 'react';
import { Layout, Button } from 'antd';
import FileManager from "../file/FileManager";

const { Header } = Layout;

const HeaderNav = ({ uiController }) => {
  return (
      <Header style={{background: '#fff', padding: '0 20px', display: 'flex', justifyContent: 'space-between'}}>
          <div style={{margin: '-20px'}}>
              <h2>APP LOGO</h2>
          </div>
          <div style={{marginLeft: "auto"}}>
              <FileManager uiController={uiController}/>
          </div>
      </Header>
  );
};

export default HeaderNav;
