import React, { useState } from "react";
import { Upload, Button, message } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import axios from "axios";
import Action from "../Action";

// Get CSRF Token (Django will set it in a cookie)
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
    const [file, setFile] = useState(null);
    const [fileName, setFileName] = useState("No file selected");
    const [uploading, setUploading] = useState(false);
    const [filePreview, setFilePreview] = useState(null);

    const uploadProps = {
        beforeUpload: (file) => {
            const isSupportedFormat = ["csv", "xlsx"].includes(file.name.split(".").pop().toLowerCase());
            if (!isSupportedFormat) {
                message.error("Only CSV and XLSX files are supported.");
                return false;
            }
            if (file.size === 0) {
                message.error("File is empty.");
                return false;
            }
            setFile(file);
            setFileName(file.name);
            console.log("File selected:", file.name);
            return false; // Block automatic uploads
        },
        onRemove: () => {
            setFile(null);
            setFileName("No file selected");
            setFilePreview(null);
            console.log("File removed.");
        },
        showUploadList: false,
    };

    const handleUpload = async () => {

    if (!file) {
        message.error("Please select a file first.");
        return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
        const response = await axios.post(
            "http://127.0.0.1:8000/api/upload/",
            formData,
            {
                headers: { "Content-Type": "multipart/form-data" },
                withCredentials: true,
            }
        );

        // **检查 data_preview 是否有数据**
        if (response.data && response.data.data_preview) {
            setFilePreview(response.data.data_preview);
        } else {
            console.warn("No data preview returned from backend.");
        }

        message.success(response.data.message || "Upload successful!");
    } catch (error) {
        console.error("❌ Upload failed:", error.response || error.message);
        message.error("Upload failed.");
    }
};



    if (!uiController || !uiController.getModalController) {
        console.error("uiController is undefined in FileUpload!");
        return null;
    }

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <span style={{
                    minWidth: "250px",
                    maxWidth: "400px",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                }}>
                    {fileName}
                </span>
                <Upload {...uploadProps} maxCount={1}>
                    <Button type="primary" icon={<UploadOutlined />}>
                        Select File
                    </Button>
                </Upload>
                <Button
                    type="primary"
                    onClick={handleUpload}
                    disabled={!file || uploading}
                    loading={uploading}
                >
                    {uploading ? "Uploading..." : "Upload"}
                </Button>
            </div>
            {filePreview && filePreview.length > 0 && (
                <div style={{ marginTop: "12px" }}>
                    <h4>Data Preview:</h4>
                    <table border="1" style={{
                        width: "100%",
                        borderCollapse: "collapse",
                        textAlign: "left",
                        fontSize: "14px",
                    }}>
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
