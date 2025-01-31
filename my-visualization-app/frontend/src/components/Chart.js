import React, { useState } from 'react';
import axios from 'axios';
import Plot from 'react-plotly.js';

const Chart = () => {
    const [fileData, setFileData] = useState(null);
    const [uploadStatus, setUploadStatus] = useState(null);  // show upload state
    const [errorMessage, setErrorMessage] = useState(null);   // show error message

    const handleUpload = async (event) => {
        setUploadStatus(null);  // clear state
        setErrorMessage(null);   // clear error message

        const file = event.target.files[0];
        if (!file) {
            setErrorMessage("No file selected");
            return;
        }

        const reader = new FileReader();
        reader.onload = async (e) => {
            const text = e.target.result;
            const rows = text.split('\n').map((row) => row.split(','));

            const headers = rows[0];
            const body = rows.slice(1).map((row) =>
                headers.reduce((acc, header, i) => {
                    acc[header] = parseFloat(row[i]) || row[i];
                    return acc;
                }, {})
            );

            try {
                const response = await axios.post('http://127.0.0.1:8000/api/visualize/', {
                    data: body,
                });

                if (response.data) {
                    setFileData(response.data);
                    setUploadStatus('File processed successfully');
                } else {
                    setUploadStatus('No data to visualize');
                }
            } catch (error) {
                setErrorMessage('Error uploading the file');
                console.error('Error during API call:', error);
            }
        };

        reader.readAsText(file);
    };

    return (
        <div>
            <h1>Data Visualization</h1>

            <input type="file" accept=".csv" onChange={handleUpload} />

            {uploadStatus && <div className="status-message success">{uploadStatus}</div>}
            {errorMessage && <div className="status-message error">{errorMessage}</div>}

            {fileData && (
                <Plot
                    data={[
                        {
                            x: fileData.columns,
                            y: fileData.mean,
                            type: 'bar',
                            name: 'Mean',
                        },
                        {
                            x: fileData.columns,
                            y: fileData.std,
                            type: 'bar',
                            name: 'Standard Deviation',
                        },
                    ]}
                    layout={{ title: 'Data Summary' }}
                />
            )}
        </div>
    );
};

export default Chart;

