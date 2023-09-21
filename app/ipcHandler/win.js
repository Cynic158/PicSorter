const { app, ipcMain } = require("electron");

const winHandler = (mainWindow) => {
  ipcMain.handle("quitApp", () => {
    app.quit();
  });
  ipcMain.handle("hideApp", () => {
    mainWindow.minimize();
  });
  ipcMain.handle("maxApp", () => {
    if (mainWindow.isMaximized()) {
      mainWindow.unmaximize();
    } else {
      mainWindow.maximize();
    }
  });
};

module.exports = winHandler;
