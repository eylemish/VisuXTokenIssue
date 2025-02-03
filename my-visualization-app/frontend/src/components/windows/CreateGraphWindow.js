// const CreateGraphWindow = (graphName, fileName) => {
//   return `
//     <h2>Graph Name: ${graphName}</h2>
//     <p>${fileName ? `File Uploaded: ${fileName}` : "No file uploaded"}</p>
//     <div id="graph" style="width:100%;height:400px;"></div> <!-- empty div for Graph -->
//   `;
// };

// export default CreateGraphWindow;
const CreateGraphWindow = (graphName, fileName, onClose) => {
  return `
    <h2>Graph Name: ${graphName}</h2>
    <p>${fileName ? `File Uploaded: ${fileName}` : "No file uploaded"}</p>
    <div id="graph" style="width:100%;height:400px;"></div> <!-- Grafik için boş div -->
    
    <!-- Butonlar burada yer alacak -->
    <button id="addToImageBtn">Add to image display area</button>
    <button id="closeBtn">Close</button>
    
    <script>
      // Butonlara tıklanma olaylarını ekliyoruz
      document.getElementById('addToImageBtn').onclick = function() {
        console.log("Add to image display area button clicked");
        window.close();  // Yeni açılan pencereyi kapatmak için
      };
      
      document.getElementById('closeBtn').onclick = function() {
        window.close();  // Yeni açılan pencereyi kapatmak için
      };
    </script>
  `;
};

export default CreateGraphWindow;
