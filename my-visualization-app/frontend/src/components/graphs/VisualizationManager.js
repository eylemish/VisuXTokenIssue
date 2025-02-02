// class VisualizationManager {
//     // Dosyayı analiz edip feature isimlerini çıkaran bir fonksiyon
//     static extractFeaturesFromCSV(file) {
//       return new Promise((resolve, reject) => {
//         const reader = new FileReader();
        
//         reader.onload = (e) => {
//           const content = e.target.result;
//           const rows = content.split("\n").map(row => row.trim());
          
//           // İlk satırdaki kolon isimlerini alalım
//           const header = rows[0].split(",");
//           resolve(header); // Feature isimlerini döndürüyoruz
//         };
        
//         reader.onerror = (err) => {
//           reject("Error reading file");
//         };
        
//         reader.readAsText(file);
//       });
//     }
//   }
  
//   export default VisualizationManager;
import Plot from "react-plotly.js";

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

  // Grafiği oluşturan fonksiyon
  static createGraph(features, data) {
    if (features.length < 2) {
      throw new Error("Not enough features to create a graph.");
    }

    const xFeature = features[0]; // İlk feature X ekseni
    const yFeature = features[1]; // İkinci feature Y ekseni

    // X ve Y verilerini çıkartıyoruz
    const xData = data.map(row => parseFloat(row[0])); // X verisi
    const yData = data.map(row => parseFloat(row[1])); // Y verisi

    // Plotly grafiği oluşturuyoruz
    return (
      <Plot
        data={[
          {
            x: xData,
            y: yData,
            type: 'scatter',
            mode: 'lines+markers',
            marker: { color: 'blue' },
          },
        ]}
        layout={{
          width: 500,
          height: 500,
          title: `${xFeature} vs ${yFeature}`,
          xaxis: { title: xFeature },
          yaxis: { title: yFeature },
        }}
      />
    );
  }
}

export default VisualizationManager;
