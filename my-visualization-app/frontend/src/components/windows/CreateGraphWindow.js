

const CreateGraphWindow = (graphName, fileName, features) => {
  return `
    <h2>Graph Name: ${graphName}</h2>
    <p>${fileName ? `File Uploaded: ${fileName}` : "No file uploaded"}</p>
    <p><strong>Features:</strong></p>
    <ul>
      ${features.map(feature => `<li>${feature}</li>`).join('')}
    </ul>
  `;
};

export default CreateGraphWindow;
