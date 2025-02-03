// class WindowManager {
//   static openWindow(content, script = "", title = "New Window", width = 500, height = 500) {
//     const newWindow = window.open("", title, `width=${width},height=${height}`);
//     if (newWindow) {
//       newWindow.document.write(`
//         <html>
//           <head>
//             <title>${title}</title>
//             <script src="https://cdn.plot.ly/plotly-latest.min.js"></script>
//           </head>
//           <body>
//             <div id="root">${content}</div>
//             <script>${script}</script>
//           </body>
//         </html>
//       `);
//       newWindow.document.close();
//     }
//   }
// }

// export default WindowManager;
class WindowManager {
  static openWindow(content, script = "", title = "New Window", width = 500, height = 500, onClose) {
    const newWindow = window.open("", title, `width=${width},height=${height}`);
    if (newWindow) {
      newWindow.document.write(`
        <html>
          <head>
            <title>${title}</title>
            <script src="https://cdn.plot.ly/plotly-latest.min.js"></script>
          </head>
          <body>
            <div id="root">${content}</div>
            <script>
              // onClose fonksiyonunu global bir değişken olarak tanımlıyoruz
              const onClose = ${onClose};
              ${script}
            </script>
          </body>
        </html>
      `);
      newWindow.document.close();
    }
  }
}

export default WindowManager;
