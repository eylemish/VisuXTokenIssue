class VisualizationManager {
    // A function that analyzes the file and extracts feature names
    static extractFeaturesFromCSV(file) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        
        reader.onload = (e) => {
          const content = e.target.result;
          const rows = content.split("\n").map(row => row.trim());
          
          // Get the column names in the first row
          const header = rows[0].split(",");
          resolve(header); //Returning the feature names
        };
        
        reader.onerror = (err) => {
          reject("Error reading file");
        };
        
        reader.readAsText(file);
      });
    }
  }
  
  export default VisualizationManager;
