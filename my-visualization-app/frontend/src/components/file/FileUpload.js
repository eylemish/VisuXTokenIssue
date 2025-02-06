import React, { useState } from "react";
import { Upload, Button, message } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import axios from "axios";

// ✅ 获取 CSRF Token（Django 会在 Cookie 中设置）
function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== "") {
        const cookies = document.cookie.split(";");
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.startsWith(name + "=")) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

const csrfToken = getCookie("csrftoken");

const FileUpload = ({ uiController }) => {
    const [file, setFile] = useState(null); // 当前选中的文件
    const [fileName, setFileName] = useState("No file selected"); // 显示文件名
    const [uploading, setUploading] = useState(false); // 是否正在上传
    const [filePreview, setFilePreview] = useState(null); // 文件数据预览

    const uploadProps = {
        beforeUpload: (file) => {
            setFile(file); // 保存文件到 state
            setFileName(file.name); // 设置文件名
            return false; // 阻止自动上传
        },
        onRemove: () => {
            setFile(null); // 清空文件
            setFileName("No file selected"); // 重置文件名
            setFilePreview(null); // 清空预览数据
        },
        showUploadList: false, // 不显示文件列表
    };

    const handleUpload = async () => {
        if (!file) {
            message.error("Please select a file first.");
            return;
        }

        const formData = new FormData();
        formData.append("file", file); // 添加文件
        formData.append("db_path", "database.sqlite3"); // 可选，提供数据库路径给后端

        setUploading(true);
        try {
            // ✅ 发送 CSRF Token + 允许 Cookie 传输
            const response = await axios.post("http://127.0.0.1:8000/api/upload/", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                    "X-CSRFToken": csrfToken, // ✅ 发送 CSRF Token
                },
                withCredentials: true, // ✅ 允许跨域携带 Cookie
            });

            // 显示成功消息并处理响应数据
            message.success(response.data.message || "Upload successful!");
            setFilePreview(response.data.data_preview || []); // 设置文件预览数据
            setFile(null); // 清空文件
            setFileName("No file selected");
        } catch (error) {
            // 显示错误消息
            message.error("Upload failed: " + (error.response?.data.error || error.message));
        } finally {
            setUploading(false); // 恢复上传状态
        }
    };

    if (!uiController || !uiController.getModalController) {
        console.error("uiController is undefined in FileUpload!");
        return null; // 避免 `undefined` 访问
    }

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                {/* 文件名，设置最小宽度，防止按钮挤压它 */}
                <span style={{ minWidth: "150px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {fileName}
                </span>

                {/* 选择文件按钮 */}
                <Upload {...uploadProps} maxCount={1}>
                    <Button type="primary" icon={<UploadOutlined />}>Select File</Button>
                </Upload>

                {/* 上传按钮 */}
                <Button
                    type="primary"
                    onClick={handleUpload}
                    disabled={!file || uploading}
                    loading={uploading}
                >
                    {uploading ? "Uploading..." : "Upload"}
                </Button>
            </div>

            {/* 显示文件预览数据 */}
            {filePreview && filePreview.length > 0 && (
                <div style={{ marginTop: "12px" }}>
                    <h4>Data Preview:</h4>
                    <table border="1" style={{ width: "100%", borderCollapse: "collapse" }}>
                        <thead>
                            <tr>
                                {Object.keys(filePreview[0]).map((key) => (
                                    <th key={key} style={{ padding: "8px" }}>{key}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {filePreview.map((row, index) => (
                                <tr key={index}>
                                    {Object.values(row).map((value, i) => (
                                        <td key={i} style={{ padding: "8px" }}>{value}</td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default FileUpload;
