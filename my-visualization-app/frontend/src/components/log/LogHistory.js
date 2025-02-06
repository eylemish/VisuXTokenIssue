import React from "react";
import { Table } from "antd";

const LogHistory = ({ logs }) => {
  const columns = [
    {
      title: "Timestamp",
      dataIndex: "timestamp",
      key: "timestamp",
      width: 200,
    },
    {
      title: "Tool",
      dataIndex: "tool",
      key: "tool",
      width: 120,
    },
    {
      title: "Params",
      dataIndex: "params",
      key: "params",
      render: (params) => JSON.stringify(params),
    },
  ];

  return (
    <Table
      dataSource={logs.length > 0 ? logs : [{ key: "empty", timestamp: "", tool: "No Logs", params: "" }]}
      columns={columns}
      pagination={{
        pageSize: 5,
        showSizeChanger: false,
      }}
      rowKey="timestamp"
    />
  );
};

export default LogHistory;
