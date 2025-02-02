// const CreateGraphWindow = (graphName, fileName, features) => {
//   return `
//     <h2>Graph Name: ${graphName}</h2>
//     <p>${fileName ? `File Uploaded: ${fileName}` : "No file uploaded"}</p>
//     <p><strong>Features:</strong></p>
//     <ul>
//       ${features.map(feature => `<li>${feature}</li>`).join('')}
//     </ul>
//   `;
// };

// export default CreateGraphWindow;

import React from "react";
import Plot from "react-plotly.js";

// CreateGraphWindow fonksiyonu, grafik içeriği ekler
const CreateGraphWindow = (graphName, fileName, features, graph) => {
  return `
    <h2>Graph Name: ${graphName}</h2>
    <p>${fileName ? `File Uploaded: ${fileName}` : "No file uploaded"}</p>
    <p><strong>Features:</strong></p>
    <ul>
      ${features.map(feature => `<li>${feature}</li>`).join('')}
    </ul>
    <div>
      ${graph ? `<div>${graph}</div>` : "No graph to display"}
    </div>
  `;
};

export default CreateGraphWindow;

