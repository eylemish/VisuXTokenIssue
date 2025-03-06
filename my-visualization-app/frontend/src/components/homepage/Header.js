import React from 'react';
import { Layout, Button } from 'antd';
import FileComponent from "../file/FileComponent";
import UIComponent from '../UIComponent';

const { Header } = Layout;

const HeaderNav = ({ uiController }) => {
  return (
      <Header style={{background: '#fff', padding: '0 20px', display: 'flex', justifyContent: 'space-between'}}>
          <div style={{margin: '-20px'}}>
              <h2>Visux</h2>
          </div>
          <div style={{marginLeft: "auto"}}>
              <FileComponent uiController={uiController}/>
          </div>
          <div style={{marginLeft: "auto"}}>
              <UIComponent uiController={uiController}/>
          </div>
      </Header>
  );
};

export default HeaderNav;
