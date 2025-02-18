import React, {useEffect, useState} from "react";
import {Modal, Button, Input, Select, message, Table, InputNumber, Radio} from "antd";
import Action from "../Action";
import {ConsoleSqlOutlined} from "@ant-design/icons";

// Get CSRF Token（fit Django）
function getCSRFToken() {
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
}

const ExtrapolationModal = ({visible, onCancel, uiController, logAction, onUpdateDataset, onClose}) => {
    const [method, setMethod] = useState("linear");
    const [datasetId, setDatasetId] = useState(null);
    const [xColumn, setXColumn] = useState(null);
    const [yColumn, setYColumn] = useState(null);
    const [extrapolateRange, setExtrapolateRange] = useState("");
    const [extrapolatedData, setExtrapolatedData] = useState([]);
    const [originalData, setOriginalData] = useState([]);
    const [columns, setColumns] = useState([]); // Store column names
    const [showResultModal, setShowResultModal] = useState(false); // Control result modal visibility
    const [inputMode, setInputMode] = useState("dots"); // "dots" or "range"
    const [numPoints, setNumPoints] = useState(null);
    const [minValue, setMinValue] = useState(null);
    const [maxValue, setMaxValue] = useState(null);
    const [newDatasetId, setNewDatasetId] = useState(null);

    const datasetManager = uiController.getDatasetManager();
    const availableDatasets = datasetManager.getAllDatasetsId();

    // **Get column names when the user selects a dataset**
    useEffect(() => {
        if (!datasetId) {
            setColumns([]);
            return;
        }

        const fetchColumns = async () => {
            const cols = await datasetManager.getDatasetColumns(datasetId);
            setColumns(cols);
        };

        fetchColumns();
    }, [datasetId]); // Dependent on `datasetId`, triggered on change

    useEffect(() => {
        if (inputMode === "range" && minValue !== null && maxValue !== null && numPoints) {
            const step = (maxValue - minValue) / (numPoints - 1);
            const rangeValues = Array.from({length: numPoints}, (_, i) => (minValue + i * step).toFixed(2));
            setExtrapolateRange(rangeValues.join(", "));
        }
    }, [inputMode, minValue, maxValue, numPoints]);

    const handleExtrapolate = async () => {
        if (!datasetId || !xColumn || !yColumn || !extrapolateRange) {
            message.error("Please select a dataset, two columns, and enter extrapolation range!");
            return;
        }

        const requestData = {
            dataset_id: datasetId,
            x_feature: xColumn,
            y_feature: yColumn,
            kind: method,
            params: {
                extrapolateRange: extrapolateRange
                    .split(",")
                    .map(val => val.trim())
                    .map(val => parseFloat(val))
                    .filter(val => !isNaN(val))
            }
        };
        try {
            const result = await fetch("http://127.0.0.1:8000/api/extrapolate/", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-CSRFToken": getCSRFToken(),  // send CSRF Token
                },
                body: JSON.stringify(requestData),
                credentials: "include", // allow to include Cookie
            });

            const resultData = await result.json();
            setExtrapolatedData(resultData.extrapolated_data);
            setOriginalData(resultData.original_data);
            message.success("Extrapolation started!");
            setShowResultModal(true); // Display result modal when data is ready
            logAction(`Extrapolation performed using ${requestData.kind} on dataset ID ${datasetId}.`, "Extrapolate")
        } catch (error) {
            message.error(`Error: ${error.message}`);
        }
    };

    const handleCloseResultModal = () => {
        setShowResultModal(false);
    };

    const handleCreateGraph = () => {
        if (!xColumn || !yColumn) {
            message.error("Please select X and Y columns before creating a graph!");
            return;
        }

        if (!Array.isArray(extrapolatedData) || extrapolatedData.length === 0) {
            message.error("Extrapolated data is empty or not properly structured!");
            return;
        }

        console.log("extrapolatedData structure:", extrapolatedData);

        // Getting the first data to check the structure
        const firstEntry = extrapolatedData[0];
        if (!firstEntry) {
            message.error("Extrapolated data is empty!");
            return;
        }

        // Ensure that xColumn and yColumn exist in the data structure.
        if (!(xColumn in firstEntry) || !(yColumn in firstEntry)) {
            console.error("Mismatch between selected columns and data structure:", firstEntry);
            message.error(`Columns "${xColumn}" and/or "${yColumn}" do not exist in the dataset!`);
            return;
        }

        // build dataset
        const dataset = {
            features: [xColumn, yColumn],
            records: extrapolatedData.map(dataPoint => ({
                [xColumn]: dataPoint[xColumn],
                [yColumn]: dataPoint[yColumn],
            })),
        };

        console.log("Final dataset:", dataset);

        if (!dataset.records.length) {
            message.error("No valid data available for creating a graph.");
            return;
        }

        const graphInfo = {
            graphName: "Extrapolation Graph",
            graphType: "line",
            dataset: dataset,
            selectedFeatures: [xColumn, yColumn],
        };

        uiController.handleUserAction({
            type: "CREATE_GRAPH",
            graphInfo,
        });

        message.success("Graph created successfully!");
    };

    const resultColumns = [
        {title: xColumn || "X Value", dataIndex: xColumn, key: xColumn},
        {title: yColumn || "Y Value", dataIndex: yColumn, key: yColumn},
    ];

    const renderTable = () => {
        if (!extrapolatedData || !Array.isArray(extrapolatedData) || extrapolatedData.length === 0) {
            return <p style={{textAlign: "center", color: "gray"}}>No data available</p>;
        }

        const firstRow = extrapolatedData[0] || {};
        const columns = Object.keys(firstRow).map((key) => ({
            title: key,
            dataIndex: key,
            key: key,
        }));

        const dataSource = extrapolatedData.map((row, index) => ({
            key: index,
            ...row,
        }));

        console.log("Generated Table Columns:", columns);
        console.log("Rendering table with dataSource:", dataSource);

        return <Table dataSource={dataSource} columns={columns} pagination={{pageSize: 10}}/>;
    };

    // apply result
    const handleApplyExtrapolate = async () => {
        const requestData = {
            dataset_id: datasetId,
            features: [xColumn, yColumn],
            records: extrapolatedData,
            new_dataset_name: "Extrapolated Dataset"
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

        if (!resultData.new_dataset_id || !extrapolatedData) {
            message.error("No reduced dataset available to apply.");
            return;
        }
        datasetManager.addDatasetId(resultData.new_dataset_id);
        datasetManager.setCurrentDatasetId(resultData.new_dataset_id);
        onUpdateDataset(extrapolatedData, resultData.new_dataset_id);
        message.success("Interpolate applied successfully!");
        logAction(`Applied extrapolated dataset ID ${resultData.new_dataset_id} as the new active dataset.`, "Extrapolate");
        setShowResultModal(false);
        onClose();
    };

    return (
        <>
            <Modal title="Extrapolation" open={visible} onCancel={onCancel} footer={null}>
                <Select
                    style={{width: "100%"}}
                    placeholder="Choose a dataset"
                    onChange={setDatasetId}
                >
                    {availableDatasets.map((id) => (
                        <Select.Option key={id} value={id}>{id}</Select.Option>
                    ))}
                </Select>

                <Select
                    style={{width: "100%", marginTop: "10px"}}
                    placeholder="Select X Column"
                    disabled={!datasetId}
                    onChange={setXColumn}
                >
                    {columns.map((col) => (
                        <Select.Option key={col} value={col}>{col}</Select.Option>
                    ))}
                </Select>

                <Select
                    style={{width: "100%", marginTop: "10px"}}
                    placeholder="Select Y Column"
                    disabled={!datasetId}
                    onChange={setYColumn}
                >
                    {columns.map((col) => (
                        <Select.Option key={col} value={col}>{col}</Select.Option>
                    ))}
                </Select>

                <Select defaultValue="linear" onChange={setMethod} style={{width: "100%", marginTop: "10px"}}>
                    <Select.Option value="linear">Linear</Select.Option>
                    <Select.Option value="polynomial">Polynomial</Select.Option>
                    <Select.Option value="exponential">Exponential</Select.Option>
                </Select>

                {/* Input Mode Selection */}
                <Radio.Group
                    value={inputMode}
                    onChange={(e) => setInputMode(e.target.value)}
                    style={{marginTop: "10px", width: "100%"}}
                >
                    <Radio.Button value="dots">Dots</Radio.Button>
                    <Radio.Button value="range">Range</Radio.Button>
                </Radio.Group>

                {/* Manual Input Fields */}
                {inputMode === "range" && (
                    <>
                        <InputNumber
                            style={{width: "100%", marginTop: "10px"}}
                            placeholder="Number of Points"
                            min={1}
                            value={numPoints}
                            onChange={setNumPoints}
                        />
                        <InputNumber
                            style={{width: "100%", marginTop: "10px"}}
                            placeholder="Min Value"
                            value={minValue}
                            onChange={setMinValue}
                        />
                        <InputNumber
                            style={{width: "100%", marginTop: "10px"}}
                            placeholder="Max Value"
                            value={maxValue}
                            onChange={setMaxValue}
                        />
                    </>
                )}
                {inputMode === "dots" && (
                    <>
                        <Input
                            type="text"
                            placeholder="Enter X values for extrapolation (comma-separated)"
                            value={extrapolateRange}
                            onChange={(e) => setExtrapolateRange(e.target.value)}
                            style={{marginTop: "10px"}}
                        />
                    </>
                )}


                <Button type="primary" onClick={handleExtrapolate} block style={{marginTop: "10px"}}>
                    Run Extrapolation
                </Button>
            </Modal>

            {/* Results Show Modal */}
            <Modal title="Extrapolation Results" open={showResultModal} onCancel={() => setShowResultModal(false)}
                   footer={null} width={600}>
                {extrapolatedData && renderTable()}
                <Button onClick={handleCreateGraph} style={{marginTop: "10px", marginRight: "10px"}}>
                    Create Graph
                </Button>
                <Button type="primary" onClick={handleApplyExtrapolate} style={{marginTop: "10px"}}>
                    Apply Interpolation
                </Button>
            </Modal>
        </>
    );
};

export default ExtrapolationModal;
