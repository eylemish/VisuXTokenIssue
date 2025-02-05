// import React, { useState, useRef } from "react";
// import Plot from "react-plotly.js";
// import Papa from "papaparse";
// import GraphManager from '../graphs/GraphManager'; 
// import ToolManager from '../tools/ToolManager'; 
// import ModalController from '../modals/ModalController'; 
// import "./Desktop1UI.css";

// const ToolList = ({ tools, onToolClick }) => {
//   return (
//     <div className="tool-list">
//       {tools.map((tool) => (
//         <button
//           key={tool.name}
//           onClick={() => {
//             onToolClick(tool);
//           }}
//           className="tool-button"
//         >
//           {tool.name}
//         </button>
//       ))}
//     </div>
//   );
// };



// const Desktop1UI = () => {
//   const [fileData, setFileData] = useState(null);
//   const [graphNames, setGraphNames] = useState([]);
//   const [activeTool, setActiveTool] = useState(null); //for modal
//   const fileInputRef = useRef(null);

//   //const graphManager = new GraphManager();
//   const toolManager = new ToolManager();


//   const handleToolClick = (tool) => {
//    setActiveTool(tool.name);
//   };

//   const handleModalClose = () => {
//     setActiveTool(null);
//   };

//   const handleCreateGraph = ({ graphName, selectedXFeature, selectedYFeature }) => {
//    console.log(`Graph Created: ${graphName} - X: ${selectedXFeature} Y: ${selectedYFeature}`);
//    handleModalClose();
//   };

//   const handleAddDataset = ({ datasetName }) => {
//     console.log(`Dataset Added: ${datasetName}`);
//     handleModalClose();
//   };


//   const handleUploadClick = () => {
//     fileInputRef.current.click();
//   };

//   const handleFileChange = (event) => {
//     const file = event.target.files[0];
//     if (!file) return;

//     if (!file.name.endsWith(".csv")) {
//       alert("Please upload only csv now");
//       return;
//     }

//     Papa.parse(file, {
//       complete: (result) => {
//         const data = result.data;
//         if (data.length < 2) {
//           alert("no enough data");
//           return;
//         }

//         const columns = data[0];
//         const rows = data.slice(1).map((row) => row.map(Number));

//         const mean = columns.map((_, i) =>
//           rows.reduce((sum, row) => sum + row[i], 0) / rows.length
//         );
//         const std = columns.map((_, i) => {
//           const avg = mean[i];
//           const variance =
//             rows.reduce((sum, row) => sum + Math.pow(row[i] - avg, 2), 0) /
//             rows.length;
//           return Math.sqrt(variance);
//         });

//         setFileData({ columns, mean, std });

//         //graphManager.addGraph({ name: `Graph ${graphManager.getGraphs().length + 1}`, data: { columns, mean, std } });
//         //setGraphNames(graphManager.getGraphs().map(graph => graph.name));
//       },
//       header: false,
//       skipEmptyLines: true,
//     });
//   };

//   return (
//     <div className="desktop1-container">
//       {/* navigator */}
//       <div className="navbar">
//         <span className="title">VisuX</span>
//         <img
//           className="icon logo"
//           src="https://ide.code.fun/api/image?token=679cb304defdb1001113adff&name=f210430c8139347a3931e8632c1a156d.png"
//           alt="Logo"
//         />
//         <img
//           className="icon menu"
//           src="https://ide.code.fun/api/image?token=679cb304defdb1001113adff&name=ed972cc1071dd946184183d53c2971f9.png"
//           alt="Menu Icon"
//         />
//       </div>

//       {/* main */}
//       <div className="main-content">
//         {/* side */}
//         <div className="sidebar">
//           <img
//               className="upload-folder"
//               src="https://ide.code.fun/api/image?token=679cb304defdb1001113adff&name=c86c16bc02b71b9757aae220923c8652.png"
//               alt="Upload Folder"
//               onClick={handleUploadClick}
//           />
//           <input
//               type="file"
//               accept=".csv"
//               ref={fileInputRef}
//               style={{display: "none"}}
//               onChange={handleFileChange}
//           />
//           <div className="sidebar-menu">
//             {/* menu */}
//             <img
//                 className="menu-item"
//                 src="https://ide.code.fun/api/image?token=679cb304defdb1001113adff&name=e15aa2f64c4ac9f8af2f6659b056ec70.png"
//                 alt="Menu Item 1"
//             />
//             <img
//               className="menu-item"
//               src="https://ide.code.fun/api/image?token=679cb304defdb1001113adff&name=4372127d7244c4cef2ee145ebb658a3f.png"
//               alt="Menu Item 2"
//             />
//           </div>
//           {/* Tool Listing */}
//           <ToolList tools={toolManager.getTools()} onToolClick={handleToolClick} />
//         </div>


//         {/* middle */}
//         <div className="content">
//           <span className="content-title">Graph List</span>
//           <ul className="graph-list">
//             {/* Dinamik olarak grafikleri listele */}
//             {graphNames.map((graphName, index) => (
//               <li key={index}>{graphName}</li>
//             ))}
//             <li>graph1</li>
//             <li>graph2</li>
//             <li>graph3</li>
//           </ul>

//           {/* graph show on right */}
//           <div className="plot-container">
//             {fileData && (
//               <Plot
//                 data={[
//                   {
//                     x: fileData.columns,
//                     y: fileData.mean,
//                     type: "bar",
//                     name: "Mean",
//                   },
//                   {
//                     x: fileData.columns,
//                     y: fileData.std,
//                     type: "bar",
//                     name: "Standard Deviation",
//                   },
//                 ]}
//                 layout={{ title: "Data Visualization" }}
//               />
//             )}
//           </div>
//         </div>
//       </div>

//       {/* ModalController */}
//       <ModalController
//         activeTool={activeTool}
//         onClose={handleModalClose}
//         onCreate={handleCreateGraph}
//       />


//     </div>
//   );
// };

// export default Desktop1UI;

import React, { useState, useRef, useEffect } from "react";
import Papa from "papaparse";
import GraphManager from "../graphs/GraphManager"; 
import ToolManager from "../tools/ToolManager"; 
import ModalController from "../modals/ModalController"; 
import VisualizationManager from "../graphs/VisualizationManager"; 
import "./Desktop1UI.css";

const ToolList = ({ tools, onToolClick }) => {
  return (
    <div className="tool-list">
      {tools.map((tool) => (
        <button
          key={tool.name}
          onClick={() => onToolClick(tool)}
          className="tool-button"
        >
          {tool.name}
        </button>
      ))}
    </div>
  );
};

const FeatureTable = ({ features, selectedFeatures, onFeatureClick }) => {
  return (
    <div className="feature-table">
      <h3>Feature List</h3>
      <table>
        <thead>
          <tr>
            <th>Feature Name</th>
          </tr>
        </thead>
        <tbody>
          {features.map((feature, index) => (
            <tr
              key={index}
              className={selectedFeatures.includes(index) ? 'selected-feature' : ''}
              onClick={() => onFeatureClick(index)}
            >
              <td>{feature}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};


const Desktop1UI = () => {
  const [fileData, setFileData] = useState(null);
  const [graphNames, setGraphNames] = useState([]);
  const [activeGraph, setActiveGraph] = useState(null);
  const [graphScript, setGraphScript] = useState(null); // VisualizationManager'dan gelen script
  const [activeTool, setActiveTool] = useState(null);
  const [features, setFeatures] = useState([]);  // CSV'den gelen tüm özellikler
  const [selectedFeatures, setSelectedFeatures] = useState([0, 1]);  // Varsayılan ilk iki özellik

  const fileInputRef = useRef(null);

  const toolManager = new ToolManager();

  useEffect(() => {
    const interval = setInterval(() => {
      const graphs = GraphManager.getAllGraphs();
      setGraphNames(graphs.map(graph => graph.name));
    }, 1000); 

    return () => clearInterval(interval);
  }, []);

  // activeGraph değiştiğinde grafiği güncelle
  useEffect(() => {
    if (activeGraph) {
      const selectedGraph = GraphManager.getGraph(activeGraph);
      if (selectedGraph) {
        setFileData(selectedGraph.csvContent);
  
        // CSV'nin başlığından (header) özellik isimlerini çıkar
        Papa.parse(selectedGraph.csvContent, {
          header: true,
          complete: (result) => {
            const featureNames = result.meta.fields;
            setFeatures(featureNames);
          },
        });
  
        // Grafik için seçili özellikleri güncelle
        const initialFeatures = selectedGraph.selectedFeatures || [0, 1];
        setSelectedFeatures(initialFeatures);
  
        const script = VisualizationManager.visualize(
          selectedGraph.csvContent,
          initialFeatures,
          activeGraph
        );
        setGraphScript(script);
      }
    }
  }, [activeGraph]);
  
  

  // graphScript değiştiğinde Plotly grafiğini oluşturmak için scripti çalıştır
  useEffect(() => {
    if (graphScript) {
      // "graph" id'li div'in hazır olduğundan emin olun
      try {
        // Dikkat: eval kullanmak güvenlik riskleri taşıyabilir. Bu örnekte mantığı göstermek için kullanıyoruz.
        // Alternatif olarak new Function() da kullanılabilir.
        eval(graphScript);
      } catch (err) {
        console.error("Grafik oluşturulurken hata:", err);
      }
    }
  }, [graphScript]);

  const handleToolClick = (tool) => {
    setActiveTool(tool.name);
  };

  const handleModalClose = () => {
    setActiveTool(null);
  };

  const handleCreateGraph = ({ graphName, selectedXFeature, selectedYFeature }) => {
    console.log(`Graph Created: ${graphName} - X: ${selectedXFeature} Y: ${selectedYFeature}`);
    handleModalClose();
  };

  const handleUploadClick = () => {
    fileInputRef.current.click();
  };

  const handleFeatureClick = (index) => {
    let updatedFeatures = [];
  
    // Eğer tıklanan özellik zaten seçilmişse, onu başa al ve diğerlerini sırala
    if (selectedFeatures.includes(index)) {
      updatedFeatures = [index, ...selectedFeatures.filter(f => f !== index)];
    } else {
      // Tıklanan yeni bir özellikse, onu başa al ve diğerlerini sırayla ekle
      updatedFeatures = [index, ...selectedFeatures];
    }
  
    // Seçili özellikleri maksimum 2 ile sınırla
    if (updatedFeatures.length > 2) {
      updatedFeatures = updatedFeatures.slice(0, 2);
    }
  
    setSelectedFeatures(updatedFeatures);
  
    // Grafiği güncelle
    const selectedGraph = GraphManager.getGraph(activeGraph);
    if (selectedGraph) {
      const script = VisualizationManager.visualize(
        selectedGraph.csvContent,
        updatedFeatures,
        activeGraph
      );
      setGraphScript(script);
    }
  };
  
  

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.name.endsWith(".csv")) {
      alert("Please upload only csv now");
      return;
    }

    Papa.parse(file, {
      complete: (result) => {
        const data = result.data;
        if (data.length < 2) {
          alert("Not enough data");
          return;
        }

        const columns = data[0];
        const rows = data.slice(1).map((row) => row.map(Number));

        const mean = columns.map((_, i) =>
          rows.reduce((sum, row) => sum + row[i], 0) / rows.length
        );
        const std = columns.map((_, i) => {
          const avg = mean[i];
          const variance =
            rows.reduce((sum, row) => sum + Math.pow(row[i] - avg, 2), 0) /
            rows.length;
          return Math.sqrt(variance);
        });

        const graphName = `Graph ${GraphManager.getAllGraphs().length + 1}`;
        // GraphManager'a eklerken csvContent bilgisini de ekleyin
        GraphManager.addGraph({ name: graphName, csvContent: data.join("\n"), data: { columns, mean, std } });

        setFileData({ columns, mean, std });
        setActiveGraph(graphName);
      },
      header: false,
      skipEmptyLines: true,
    });
  };

  const handleGraphClick = (graphName) => {
    setActiveGraph(graphName);  // Seçili grafiği güncelle
  };

  return (
    <div className="desktop1-container">
      {/* Navigator */}
      <div className="navbar">
        <span className="title">VisuX</span>
        <img className="icon logo" src="https://ide.code.fun/api/image?token=679cb304defdb1001113adff&name=f210430c8139347a3931e8632c1a156d.png" alt="Logo" />
        <img className="icon menu" src="https://ide.code.fun/api/image?token=679cb304defdb1001113adff&name=ed972cc1071dd946184183d53c2971f9.png" alt="Menu Icon" />
      </div>

      {/* Main Content */}
      <div className="main-content">
        {/* Sidebar */}
        <div className="sidebar">
          <img className="upload-folder" src="https://ide.code.fun/api/image?token=679cb304defdb1001113adff&name=c86c16bc02b71b9757aae220923c8652.png" alt="Upload Folder" onClick={handleUploadClick} />
          <input type="file" accept=".csv" ref={fileInputRef} style={{ display: "none" }} onChange={handleFileChange} />

          {/* Tools */}
          <ToolList tools={toolManager.getTools()} onToolClick={handleToolClick} />
        </div>

        {/* Content */}
        <div className="content">
          <span className="content-title">Graph List</span>
          <ul className="graph-list">
            {graphNames.map((graphName, index) => (
              <li
                key={index}
                onClick={() => handleGraphClick(graphName)}
                className={activeGraph === graphName ? "active-graph" : ""}
              >
                {graphName}
              </li>
            ))}
          </ul>

          {/* Feature Table */}
           {activeGraph && (
           <FeatureTable
             features={features}
             selectedFeatures={selectedFeatures}
             onFeatureClick={handleFeatureClick}
            />
          )}

          {/* Graph Visualization */}
          <div className="plot-container">
            {/* VisualizationManager'ın scriptinin çalışacağı div */}
            <div id="graph" style={{ width: "100%", height: "100%" }}></div>
          </div>
        </div>
      </div>

      {/* Modal Controller */}
      <ModalController activeTool={activeTool} onClose={handleModalClose} onCreate={handleCreateGraph} />
    </div>
  );
};

export default Desktop1UI;
