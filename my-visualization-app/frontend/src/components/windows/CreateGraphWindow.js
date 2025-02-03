const CreateGraphWindow = (graphName, fileName, onClose) => {
  return `
    <h2>Graph Name: ${graphName}</h2>
    <p>${fileName ? `File Uploaded: ${fileName}` : "No file uploaded"}</p>
    <div id="graph" style="width:100%;height:400px;"></div> <!-- Empty div for the graph -->
    
    <!-- Buttons here -->
    <div style="text-align: center; margin-top: 20px;">
    <button id="addToImageBtn">Add to image display area</button>
    <button id="closeBtn">Close</button>
    </div>

    <script>
      // Clicking button functions
      document.getElementById('addToImageBtn').onclick = function() {
        console.log("Add to image display area button clicked");
        window.close();  // Closing the window
      };
      
      document.getElementById('closeBtn').onclick = function() {
        window.close();  // Closing the window
      };
    </script>
  `;
};

export default CreateGraphWindow;
