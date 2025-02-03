class VisualizationManager {
    // Dosyayı analiz edip feature isimlerini çıkaran bir fonksiyon
    static extractFeaturesFromCSV(file) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        
        reader.onload = (e) => {
          const content = e.target.result;
          const rows = content.split("\n").map(row => row.trim());
          
          // İlk satırdaki kolon isimlerini alalım
          const header = rows[0].split(",");
          resolve(header); // Feature isimlerini döndürüyoruz
        };
        
        reader.onerror = (err) => {
          reject("Error reading file");
        };
        
        reader.readAsText(file);
      });
    }
  }
  
  export default VisualizationManager;
