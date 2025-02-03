const CreateGraphWindow = (graphName, fileName) => {
  return `
    <h2>Graph Name: ${graphName}</h2>
    <p>${fileName ? `File Uploaded: ${fileName}` : "No file uploaded"}</p>
    <div id="graph" style="width:100%;height:400px;"></div> <!-- Grafik için boş div -->
  `;
};

export default CreateGraphWindow;

