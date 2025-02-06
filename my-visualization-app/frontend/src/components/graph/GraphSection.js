import React from 'react';
import { Card, Empty, Typography } from 'antd';

const { Title } = Typography;

const GraphSection = () => {
  return (
    <Card style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <Title level={4} style={{ textAlign: "left" }}>Graph</Title>
      <div style={{ flex: 1, display: "flex", justifyContent: "center", alignItems: "center" }}>
        <Empty description="No Graph Available" />
      </div>
    </Card>
  );
};

export default GraphSection;
