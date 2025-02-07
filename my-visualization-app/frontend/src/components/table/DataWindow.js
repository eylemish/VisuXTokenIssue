// import React, { useState } from "react";
// import { Table, Button, Card, message } from "antd";
// import { DownloadOutlined, DeleteOutlined } from "@ant-design/icons";

// const DataWindow = ({ uploadedData = [] }) => {
//   const [tableData, setTableData] = useState(uploadedData.length > 0 ? uploadedData : [
//     { key: "1", rank: "1", keyword: "Example A", users: "1000", weeklyRange: "+5" },
//     { key: "2", rank: "2", keyword: "Example B", users: "800", weeklyRange: "-2" },
//     { key: "3", rank: "3", keyword: "Example C", users: "600", weeklyRange: "+3" },
//     { key: "4", rank: "4", keyword: "Example D", users: "500", weeklyRange: "-1" },
//     { key: "5", rank: "5", keyword: "Example E", users: "400", weeklyRange: "+2" },
//     { key: "6", rank: "6", keyword: "Example F", users: "300", weeklyRange: "-3" },
//     { key: "7", rank: "7", keyword: "Example G", users: "200", weeklyRange: "+4" }
//   ]);
//   const [selectedRowKeys, setSelectedRowKeys] = useState([]);

//   // 处理行选择
//   const rowSelection = {
//     selectedRowKeys,
//     onChange: setSelectedRowKeys,
//   };

//   // 删除选中行
//   const handleDelete = () => {
//     if (selectedRowKeys.length === 0) {
//       message.warning("Please select rows to delete!");
//       return;
//     }
//     setTableData(tableData.filter((_, index) => !selectedRowKeys.includes(index)));
//     setSelectedRowKeys([]);
//     message.success("Selected rows deleted successfully!");
//   };

//   // 导出数据为 CSV
//   const handleExport = () => {
//     if (tableData.length === 0) {
//       message.warning("No data to export!");
//       return;
//     }
//     const csvContent = [
//       Object.keys(tableData[0]).join(","),
//       ...tableData.map((row) => Object.values(row).join(",")),
//     ].join("\n");

//     const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
//     const link = document.createElement("a");
//     link.href = URL.createObjectURL(blob);
//     link.download = "data_table.csv";
//     document.body.appendChild(link);
//     link.click();
//     document.body.removeChild(link);
//     message.success("Data exported successfully!");
//   };

//   const columns = [
//     { title: "Rank", dataIndex: "rank", key: "rank" },
//     { title: "Keyword", dataIndex: "keyword", key: "keyword" },
//     { title: "Users", dataIndex: "users", key: "users" },
//     { title: "Weekly Range", dataIndex: "weeklyRange", key: "weeklyRange" },
//   ];

//   return (
//     <Card title="Data Table" style={{ width: "100%", minWidth: "450px", minHeight: "360px", display: "flex", flexDirection: "column", overflow: "hidden" }}>
//       <div style={{ flex: 1, overflow: "auto", minHeight: "250px", maxHeight: "500px" }}>
//         <Table
//           rowKey={(record) => record.key}
//           dataSource={tableData}
//           columns={columns}
//           rowSelection={rowSelection}
//           pagination={{ pageSize: 5}}
//           scroll={{ x: "max-content" }}
//           style={{ fontSize: "8px" }}
//           size={"small"}
//         />
//       </div>
//       <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 10, padding: "10px", flexShrink: 0, background: "#fff", borderTop: "1px solid #ddd", minHeight: "50px" }}>
//         <Button type="danger" icon={<DeleteOutlined />} style={{ marginRight: 10 }} onClick={handleDelete}>
//           Delete Selected Rows
//         </Button>
//         <Button type="primary" icon={<DownloadOutlined />} onClick={handleExport}>
//           Export Data
//         </Button>
//       </div>
//     </Card>
//   );
// };

// export default DataWindow;

import { useState, useEffect } from "react";
import './DataWindow.css';

const DataWindow = () => {
    const [data, setData] = useState(null); // empty at first
    const [selectedFeatures, setSelectedFeatures] = useState([0, 1]);
    const features = ["id", "name", "age", "city", "salary"];

    useEffect(() => {
        const exampleData = [
            { "id": 1, "name": "Alice", "age": 25, "city": "New York", "salary": 50000 },
            { "id": 2, "name": "Bob", "age": 30, "city": "Los Angeles", "salary": 60000 },
            { "id": 3, "name": "Charlie", "age": 28, "city": "Chicago", "salary": 55000 },
            { "id": 4, "name": "David", "age": 35, "city": "Houston", "salary": 70000 },
            { "id": 5, "name": "Eve", "age": 27, "city": "San Francisco", "salary": 65000 },
            { "id": 6, "name": "Frank", "age": 32, "city": "Seattle", "salary": 62000 },
            { "id": 7, "name": "Grace", "age": 29, "city": "Boston", "salary": 58000 },
            { "id": 8, "name": "Hank", "age": 33, "city": "Denver", "salary": 63000 }
        ];

        setData(exampleData);
    }, []);

    if (!data) return <p>Data Uploading...</p>; // Veri gelene kadar beklet

    const handleFeatureClick = (index) => {
        let updatedFeatures = [];

        // If the clicked feature is already selected, bring it to the front and reorder the others
        if (selectedFeatures.includes(index)) {
            updatedFeatures = [index, ...selectedFeatures.filter(f => f !== index)];
        } else {
            // If it's a new feature, bring it to the front and add the others in order
            updatedFeatures = [index, ...selectedFeatures];
        }

        // Limit the selected features to a maximum of 2
        if (updatedFeatures.length > 2) {
            updatedFeatures = updatedFeatures.slice(0, 2);
        }

        setSelectedFeatures(updatedFeatures);
        //we need logging somewhere to save feature change
    };

    const FeatureTable = ({ data, features, selectedFeatures, onFeatureClick }) => {
        return (
            <div className="feature-table">
                <h3>Feature List</h3>
                <table>
                    <thead>
                        <tr>
                            <th>Data</th>
                            {features.map((feature, index) => (
                                <th key={index} onClick={() => onFeatureClick(index)}>
                                    {feature}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {data.map((row, rowIndex) => (
                            <tr key={rowIndex}>
                                <td>Data {rowIndex + 1}</td>
                                {features.map((feature, featureIndex) => (
                                    <td key={featureIndex}>
                                        {row[feature]}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    };

    return (
        <FeatureTable
            features={features}
            data={data}
            selectedFeatures={selectedFeatures}
            onFeatureClick={handleFeatureClick}
        />
    );
};

export default DataWindow;
