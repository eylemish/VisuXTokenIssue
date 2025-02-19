import React, {useState, useEffect} from "react";
import {Modal, Radio, InputNumber, Button, message, Table} from "antd";
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

const DimReductionModal = ({visible, onClose, onUpdateDataset, logAction, datasetId}) => {
    const [method, setMethod] = useState("pca");
    const [nComponents, setNComponents] = useState(2);
    const [isProcessing, setIsProcessing] = useState(false);
    const [reducedData, setReducedData] = useState(null);
    const [newDatasetId, setNewDatasetId] = useState(null);

    // Ensure that data is cleared when Modal is shut down
    useEffect(() => {
        if (!visible) {
            setReducedData(null);
            setNewDatasetId(null);
        }
    }, [visible]);

    // do dim reduction
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

            console.log("API Response:", response.data);

            const {reduced_features, reduced_records} = response.data;

            if (Array.isArray(reduced_records) && reduced_records.length) {
                setReducedData({
                    features: reduced_features,
                    records: reduced_records.map((row, index) => ({key: index, ...row})),
                });
                //setNewDatasetId(new_dataset_id);
            } else {
                setReducedData(null);
            }
            logAction(datasetManager.getDatasetNameById(datasetManager.getCurrentDatasetId()) + "_" + nComponents + "_" + method, method.toUpperCase())
            message.success("Dimensionality reduction successful!");
        } catch (error) {
            console.error("Error during dimensionality reduction:", error.response?.data || error.message);
            message.error(error.response?.data?.error || "Dimensionality reduction failed.");
        } finally {
            setIsProcessing(false);
        }
    };

    // apply result
    const handleApplyReduction = async () => {
        const requestData = {
            dataset_id: datasetManager.getCurrentDatasetId(), 
            features: reducedData.features,
            records: reducedData.records,
            new_dataset_name: datasetManager.getDatasetNameById(datasetManager.getCurrentDatasetId())+"_dim_reduced_" + method
          };
          const result = await fetch("http://127.0.0.1:8000/api/create_dataset/", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "X-CSRFToken": getCSRFToken(),  // send CSRF Token
              },
              body: JSON.stringify(requestData),
              credentials: "include", // allow to include Cookie
            });
          const resultData = await result.json();
          setNewDatasetId(resultData.new_dataset_id);
        if (!resultData.new_dataset_id || !reducedData) {
            message.error("No reduced dataset available to apply.");
            return;
        }

        datasetManager.addDatasetId(resultData.new_dataset_id, resultData.name);
        datasetManager.setCurrentDatasetId(resultData.new_dataset_id);
        onUpdateDataset(reducedData.records, resultData.new_dataset_id);
        message.success("Dimensionality reduction applied successfully!");

        logAction(`new_dataset_id_${resultData.new_dataset_id}`,"Apply DimReduction");
        onClose();
    };

    // render table
    const renderTable = () => {
        if (!reducedData || !Array.isArray(reducedData.records) || reducedData.records.length === 0) {
            return <p style={{textAlign: "center", color: "gray"}}>No data available</p>;
        }

        // Ensure that column names and data match
        const firstRow = reducedData.records[0] || {};
        const actualKeys = Object.keys(firstRow);

        const columns = actualKeys.map((key) => ({
            title: key,
            dataIndex: key,
            key: key,
        }));

        const dataSource = reducedData.records.map((row, index) => ({
            key: index,
            ...row,
        }));

        console.log("Generated Table Columns:", columns);
        console.log("Rendering table with dataSource:", dataSource);

        return <Table dataSource={dataSource} columns={columns} pagination={{pageSize: 10}}/>;
    };

    return (
        <Modal title="Dimensionality Reduction" visible={visible} onCancel={onClose} footer={null} width={600}>
            {/* Selection of methods */}
            <div style={{marginBottom: "15px"}}>
                <Radio.Group onChange={(e) => setMethod(e.target.value)} value={method}>
                    <Radio value="pca">PCA</Radio>
                    <Radio value="tsne">t-SNE</Radio>
                    <Radio value="umap">UMAP</Radio>
                </Radio.Group>
            </div>

            {/* Selection of number of components */}
            <div style={{marginBottom: "15px"}}>
                <label>Number of Components:</label>
                <InputNumber
                    min={1}
                    max={10}
                    value={nComponents}
                    onChange={(value) => setNComponents(value)}
                    style={{marginLeft: "10px", width: "80px"}}
                />
            </div>

            {/* Confirm, Apply button */}
            <div style={{textAlign: "right", marginBottom: "15px"}}>
                <Button onClick={onClose} style={{marginRight: 10}}>Cancel</Button>
                <Button type="primary" onClick={handleReduce} loading={isProcessing}
                        style={{marginRight: 10}}>Confirm</Button>
                {reducedData && <Button type="primary" onClick={handleApplyReduction}>Apply Reduction</Button>}
            </div>

            {reducedData && renderTable()}
        </Modal>
    );
};

export default DimReductionModal;
