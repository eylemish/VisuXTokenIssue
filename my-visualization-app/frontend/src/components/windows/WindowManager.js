import React from "react";

class WindowManager {
  static openWindow(content, title = "New Window", width = 400, height = 300) {
    const newWindow = window.open("", title, `width=${width},height=${height}`);
    if (newWindow) {
      newWindow.document.write(`
        <html>
          <head>
            <title>${title}</title>
          </head>
          <body>
            <div id="root"></div>
          </body>
        </html>
      `);
      newWindow.document.close();
      newWindow.document.getElementById("root").innerHTML = content;
    }
  }
}

export default WindowManager;
