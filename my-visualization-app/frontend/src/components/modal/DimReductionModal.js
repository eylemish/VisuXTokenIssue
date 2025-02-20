import React, { useState, useEffect } from "react";
import { Modal, Radio, InputNumber, Button, message, Table, Tooltip } from "antd";
import axios from "axios";
import datasetManager from "../file/DatasetManager";

const getCSRFToken = () => {
    let cookieValue = null;
    if (document.cookie) {
        document.cookie.split(";").forEach((cookie) => {
            const [name, value] = cookie.trim().split("=");
            if (name === "csrftoken") {
                cookieValue = decodeURIComponent(value);
            }
        });
    }
    return cookieValue;
};

const DimReductionModal = ({ visible, onClose, onUpdateDataset, logAction, datasetId }) => {
    const [method, setMethod] = useState("pca");
    const [nComponents, setNComponents] = useState(2);
    const [isProcessing, setIsProcessing] = useState(false);
    const [reducedData, setReducedData] = useState(null);
    const [recommendedMethods, setRecommendedMethods] = useState([]);
    const [recommendedParams, setRecommendedParams] = useState({});

    useEffect(() => {
        if (visible) {
            fetchRecommendedMethods();
        }
    }, [visible]);

    const fetchRecommendedMethods = async () => {
        try {
            const response = await axios.get("http://127.0.0.1:8000/api/recommend_dim_reduction/", {
                params: { dataset_id: datasetId || datasetManager.getCurrentDatasetId() }
            });

            if (response.data && response.data.recommendations) {
                setRecommendedMethods(response.data.recommendations);
                setRecommendedParams(response.data.parameters);
            }
        } catch (error) {
            console.error("Error fetching recommended methods:", error);
        }
    };

    const handleReduce = async () => {
        if (!nComponents || nComponents <= 0) {
            message.error("Please enter a valid number of components.");
            return;
        }

        const currentDatasetId = datasetId || datasetManager.getCurrentDatasetId();
        if (!currentDatasetId) {
            message.error("No valid dataset ID found. Please upload a dataset first.");
            return;
        }

        setIsProcessing(true);
        try {
            const response = await axios.post(
                "http://127.0.0.1:8000/api/dimensional_reduction/",
                {
                    dataset_id: currentDatasetId,
                    method,
                    n_components: nComponents,
                },
                {
                    headers: {
                        "X-CSRFToken": getCSRFToken(),
                        "Content-Type": "application/json",
                    },
                    withCredentials: true,
                }
            );

            const { reduced_features, reduced_records } = response.data;

            if (Array.isArray(reduced_records) && reduced_records.length) {
                setReducedData({
                    features: reduced_features,
                    records: reduced_records.map((row, index) => ({ key: index, ...row })),
                });
            } else {
                setReducedData(null);
            }
            message.success("Dimensionality reduction successful!");
        } catch (error) {
            console.error("Error during dimensionality reduction:", error.response?.data || error.message);
            message.error(error.response?.data?.error || "Dimensionality reduction failed.");
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <Modal title="Dimensionality Reduction" visible={visible} onCancel={onClose} footer={null} width={600}>
            <div style={{ marginBottom: "15px" }}>
                <label>Recommended Methods:</label>
                <p style={{ color: "gray" }}>{recommendedMethods.length > 0 ? recommendedMethods.join(", ") : "No recommendations available"}</p>
                <Radio.Group onChange={(e) => setMethod(e.target.value)} value={method}>
                    <Radio value="pca">PCA</Radio>
                    <Radio value="tsne">t-SNE</Radio>
                    <Radio value="umap">UMAP</Radio>
                </Radio.Group>
            </div>

            <div style={{ marginBottom: "15px" }}>
                <label>Number of Components:</label>
                <p style={{ color: "gray" }}>{recommendedParams[method]?.n_components ? `Recommended: ${recommendedParams[method].n_components}` : "No recommendation available"}</p>
                <InputNumber
                    min={1}
                    max={10}
                    value={nComponents}
                    onChange={(value) => setNComponents(value)}
                    style={{ marginLeft: "10px", width: "80px" }}
                />
            </div>

            <div style={{ textAlign: "right", marginBottom: "15px" }}>
                <Button onClick={onClose} style={{ marginRight: 10 }}>Cancel</Button>
                <Button type="primary" onClick={handleReduce} loading={isProcessing} style={{ marginRight: 10 }}>Confirm</Button>
            </div>
        </Modal>
    );
};

export default DimReductionModal;