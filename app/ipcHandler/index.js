const winHandler = require("./win");
const picHandler = require("./pic");

const ipcHandler = (mainWindow, appPath) => {
  winHandler(mainWindow);
  picHandler(appPath);
};

module.exports = ipcHandler;
