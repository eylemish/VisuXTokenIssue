import React, { useState } from "react";
import { Table, Button, Card, message } from "antd";
import { DownloadOutlined, DeleteOutlined } from "@ant-design/icons";

const DataWindow = ({ uploadedData = [] }) => {
  const [tableData, setTableData] = useState(uploadedData.length > 0 ? uploadedData : [
    { key: "1", rank: "1", keyword: "Example A", users: "1000", weeklyRange: "+5" },
    { key: "2", rank: "2", keyword: "Example B", users: "800", weeklyRange: "-2" },
    { key: "3", rank: "3", keyword: "Example C", users: "600", weeklyRange: "+3" },
    { key: "4", rank: "4", keyword: "Example D", users: "500", weeklyRange: "-1" },
    { key: "5", rank: "5", keyword: "Example E", users: "400", weeklyRange: "+2" },
    { key: "6", rank: "6", keyword: "Example F", users: "300", weeklyRange: "-3" },
    { key: "7", rank: "7", keyword: "Example G", users: "200", weeklyRange: "+4" }
  ]);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);

  // 处理行选择
  const rowSelection = {
    selectedRowKeys,
    onChange: setSelectedRowKeys,
  };

  // 删除选中行
  const handleDelete = () => {
    if (selectedRowKeys.length === 0) {
      message.warning("Please select rows to delete!");
      return;
    }
    setTableData(tableData.filter((_, index) => !selectedRowKeys.includes(index)));
    setSelectedRowKeys([]);
    message.success("Selected rows deleted successfully!");
  };

  // 导出数据为 CSV
  const handleExport = () => {
    if (tableData.length === 0) {
      message.warning("No data to export!");
      return;
    }
    const csvContent = [
      Object.keys(tableData[0]).join(","),
      ...tableData.map((row) => Object.values(row).join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "data_table.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    message.success("Data exported successfully!");
  };

  const columns = [
    { title: "Rank", dataIndex: "rank", key: "rank" },
    { title: "Keyword", dataIndex: "keyword", key: "keyword" },
    { title: "Users", dataIndex: "users", key: "users" },
    { title: "Weekly Range", dataIndex: "weeklyRange", key: "weeklyRange" },
  ];

  return (
    <Card title="Data Table" style={{ width: "100%", minWidth: "450px", minHeight: "360px", display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <div style={{ flex: 1, overflow: "auto", minHeight: "250px", maxHeight: "500px" }}>
        <Table
          rowKey={(record) => record.key}
          dataSource={tableData}
          columns={columns}
          rowSelection={rowSelection}
          pagination={{ pageSize: 5}}
          scroll={{ x: "max-content" }}
          style={{ fontSize: "8px" }}
          size={"small"}
        />
      </div>
      <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 10, padding: "10px", flexShrink: 0, background: "#fff", borderTop: "1px solid #ddd", minHeight: "50px" }}>
        <Button type="danger" icon={<DeleteOutlined />} style={{ marginRight: 10 }} onClick={handleDelete}>
          Delete Selected Rows
        </Button>
        <Button type="primary" icon={<DownloadOutlined />} onClick={handleExport}>
          Export Data
        </Button>
      </div>
    </Card>
  );
};

export default DataWindow;
