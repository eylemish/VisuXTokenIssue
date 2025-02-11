import React from "react";
import { Card, Table, Button } from "antd";

const LogWindow = ({ logs }) => {
  const pageSize = 5; //Limit up to 5 entries per page
  const emptyRows = Array(Math.max(0, pageSize - logs.length)).fill({
    key: "empty",
    timestamp: "-",
    tool: "-",
    params: "-",
  });

  const displayedLogs = [...logs.slice(0, pageSize), ...emptyRows]; // Make sure the table always has 5 rows

  return (
      <Card title="Operation Log"
            style={{
                width: "100%",
                minWidth: "400px",  // Limit the minimum width to avoid being too narrow
                minHeight: "300px", // Limit the minimum height
                overflow: "hidden",
            }}>
          <div style={{flex: 1, overflow: "auto", minHeight: "250px", maxHeight: "500px"}}>
              <Table
                  dataSource={displayedLogs}
                  columns={[
                      {
                          title: "Timestamp",
                          dataIndex: "timestamp",
                          key: "timestamp",
                          width: 120,
                          align: "center",
                      },
                      {
                          title: "Tool",
                          dataIndex: "tool",
                          key: "tool",
                          width: 100,
                          align: "center",
                      },
                      {
                          title: "Params",
                          dataIndex: "params",
                          key: "params",
                          width: 200,
                          align: "center",
                          render: (params) => (params !== "-" ? JSON.stringify(params) : "-"),
                      },
                  ]}
                  pagination={{ pageSize: 5}}
                  size="small"
                  rowKey={(record, index) => index} // 避免 key 重复
              />
          </div>
              {/* Buttons are placed below the form */}
              <div style={{marginTop: "10px", textAlign: "center", borderTop: "1px solid #ddd", padding: "10px"}}>
                  <Button style={{margin: "0 5px"}}>Undo</Button>
                  <Button style={{margin: "0 5px"}}>Redo</Button>
                  <Button style={{margin: "0 5px"}}>Rollback</Button>
              </div>
      </Card>
);
};

export default LogWindow;
