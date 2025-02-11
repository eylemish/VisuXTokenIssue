import React, { useState, useEffect } from "react";
import { Card, Select, Spin, message } from "antd";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import datasetManager from "../file/DatasetManager"; // Import the singleton instance of DatasetManager

const { Option } = Select;

const DataWindow = () => {
    const [features, setFeatures] = useState([]); // Stores dataset feature names
    const [data, setData] = useState([]); // Stores dataset records
    const [selectedFeatures, setSelectedFeatures] = useState([]); // Stores selected features for visualization
    const [loading, setLoading] = useState(true); // Loading state indicator
    const [datasetId, setDatasetId] = useState(null); // Stores current dataset ID

    // Fetch the current dataset ID from DatasetManager on component mount
    useEffect(() => {
        const id = datasetManager.getCurrentDatasetId();
        if (!id) {
            message.warning("No dataset ID available. Did you upload a dataset?");
            setLoading(false);
            return;
        }
        setDatasetId(id);
    }, []);

    // Fetch dataset records when datasetId is set
    useEffect(() => {
        if (!datasetId) return;

        fetch(`http://127.0.0.1:8000/api/datasets/${datasetId}/`)
            .then((response) => response.json())
            .then((result) => {
                console.log("Fetched dataset:", result); // Debugging log
                if (!result || result.error) {
                    message.error("Dataset not found.");
                    setLoading(false);
                    return;
                }

                if (!result.records || result.records.length === 0) {
                    console.error("Dataset has no records:", result);
                    message.error("Dataset is empty.");
                    setLoading(false);
                    return;
                }

                setFeatures(result.features || []);  // Extract feature names
                setData(result.records);  // Extract dataset records
                setLoading(false);
            })
            .catch((error) => {
                console.error("Error fetching dataset:", error);
                message.error("Failed to fetch dataset.");
                setLoading(false);
            });
    }, [datasetId]);

    // Handles feature selection for visualization
    const handleFeatureChange = (values) => {
        setSelectedFeatures(values);
    };

    return (
        <Card title="Data Preview" style={{ width: "100%", minHeight: "400px" }}>
            {loading ? (
                <Spin tip="Loading data..." />
            ) : (
                <>
                    {features.length === 0 ? (
                        <p>No data available.</p>
                    ) : (
                        <>
                            <Select
                                mode="multiple"
                                placeholder="Select up to 2 features"
                                style={{ width: "100%", marginBottom: "16px" }}
                                onChange={handleFeatureChange}
                                maxTagCount={2}
                            >
                                {features.map((feature) => (
                                    <Option key={feature} value={feature}>{feature}</Option>
                                ))}
                            </Select>
                            <ResponsiveContainer width="100%" height={300}>
                                <LineChart data={data}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="id" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    {selectedFeatures.length > 0 ? (
                                        selectedFeatures.map((feature, index) => (
                                            <Line key={index} type="monotone" dataKey={feature} stroke={index === 0 ? "#8884d8" : "#82ca9d"} />
                                        ))
                                    ) : (
                                        <p style={{ textAlign: 'center' }}>Please select features to visualize.</p>
                                    )}
                                </LineChart>
                            </ResponsiveContainer>
                        </>
                    )}
                </>
            )}
        </Card>
    );
};

export default DataWindow;
