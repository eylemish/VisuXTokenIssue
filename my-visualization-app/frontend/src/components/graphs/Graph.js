// class Graph {
//     constructor(title, data, type) {
//         this.title = title; 
//         this.data = data;    // Graph Data
//         this.type = type;    
//         this.id = Date.now(); // Unique graph id
//     }

//     // Non finished Graph Methods
//     updateTitle(newTitle) {
//         this.title = newTitle;
//     }

//     updateData(newData) {
//         this.data = newData;
//     }
// }

// export default Graph;




// class Graph {
//     constructor(name, columns, rows, type = 'scatter') {
//       this.name = name;
//       this.columns = columns; // CSV başlıkları
//       this.rows = rows;       // CSV veri satırları
//       this.type = type;       // scatter (nokta grafiği) varsayılan
//     }
  
//     // X ve Y eksenlerini ayarla (ilk sütun X, ikinci sütun Y)
//     getPlotlyData() {
//       const xData = this.rows.map(row => row[0]); // İlk sütun
//       const yData = this.rows.map(row => row[1]); // İkinci sütun
  
//       return {
//         data: [
//           {
//             x: xData,
//             y: yData,
//             mode: 'lines+markers',
//             type: this.type,
//             name: this.name
//           }
//         ],
//         layout: { title: this.name }
//       };
//     }
//   }
  
//   export default Graph;
  

// Graph.js
class Graph {
    constructor(name, csvContent, selectedFeatures) {
      this.name = name;
      this.csvContent = csvContent;
      this.selectedFeatures = selectedFeatures;
    }
  
  }
  
  export default Graph;
  