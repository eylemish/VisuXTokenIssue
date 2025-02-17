import React from "react";
import { Card, Table, Button } from "antd";

const LogWindow = ({ logs }) => {
  const pageSize = 5; // Limit up to 5 entries per page
  const emptyRows = Array(Math.max(0, pageSize - logs.length)).fill({
    key: "empty",
    timestamp: "-",
    tool: "-",
    params: "-",
  });

  const displayedLogs = [...logs.slice(0, pageSize), ...emptyRows]; // Ensure table always has 5 rows

  const handleExportLogs = () => {
    const jsonLogs = JSON.stringify(logs, null, 2);
    const blob = new Blob([jsonLogs], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "operation_logs.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <Card
      title="Operation Log"
      extra={<Button onClick={handleExportLogs} type="primary">Export Logs</Button>}
      style={{
        width: "100%",
        minWidth: "400px", // Limit the minimum width to avoid being too narrow
        minHeight: "300px", // Limit the minimum height
        overflow: "hidden",
      }}
    >
      <div style={{ flex: 1, overflow: "auto", minHeight: "250px", maxHeight: "500px" }}>
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
          pagination={{ pageSize: 5 }}
          size="small"
          rowKey={(record, index) => index} // Avoid duplicate keys
        />
      </div>
    </Card>
  );
};

export default LogWindow;