const { app, BrowserWindow, Tray } = require("electron");
const path = require("path");
const ipcHandler = require("./ipcHandler/index");

const express = require("express");
const koa = require("koa");
const serve = require("koa-static");

const expressapp = express();
const serveapp = new koa();

serveapp.use(serve(path.resolve(app.getAppPath(), "../webdist")));
serveapp.listen(7777, () => {
  // console.log("http://127.0.0.1:7777");
});
expressapp.use(
  "/pic",
  express.static(path.resolve(app.getAppPath(), "../pic"))
);
expressapp.listen(7776, () => {
  // console.log("http://127.0.0.1:7776");
});

let mainWindow;

function createMainWindow() {
  // 创建主窗口
  mainWindow = new BrowserWindow({
    width: 1500, // 窗口宽度
    height: 800, // 窗口高度
    show: false,
    frame: false,
    transparent: true,
    resizable: false,
    webPreferences: {
      preload: path.resolve(__dirname, "./preload.js"),
    },
    icon: path.resolve(app.getAppPath(), "../icon.png"),
  });

  // 加载应用的 HTML 文件
  mainWindow.loadURL("http://localhost:7777/");
  // mainWindow.loadFile("./index.html");

  // 打开开发者工具（可选）
  // mainWindow.webContents.openDevTools();

  mainWindow.on("ready-to-show", () => {
    mainWindow.show();
  });

  // 当窗口关闭时触发
  mainWindow.on("closed", () => {
    mainWindow = null;
  });

  const appPath = app.getAppPath();
  // 导入ipc通信主入口
  ipcHandler(mainWindow, appPath);

  function createTray(mainWindow) {
    const tray = new Tray(path.resolve(app.getAppPath(), "../icon.png"));
    tray.setToolTip("PicSorter");
    tray.on("click", () => {
      mainWindow.isVisible() ? mainWindow.minimize() : mainWindow.show();
    });
  }
  createTray(mainWindow);
}

// 当 Electron 完成初始化并准备创建浏览器窗口时触发
app.on("ready", () => {
  createMainWindow();
});

// 当所有窗口都关闭时触发
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

// 当应用程序被激活（点击图标）时触发
app.on("activate", () => {
  if (mainWindow === null) {
    createMainWindow();
  }
});
