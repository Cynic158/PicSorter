const { contextBridge, ipcRenderer } = require("electron");

// winipc
const quitApp = () => {
  ipcRenderer.invoke("quitApp");
};
const hideApp = () => {
  ipcRenderer.invoke("hideApp");
};
const maxApp = () => {
  ipcRenderer.invoke("maxApp");
};

// picipc
const getSorts = async () => {
  const sorts = await ipcRenderer.invoke("getSorts");
  return sorts;
};
const getPic = async (picName) => {
  const pic = await ipcRenderer.invoke("getPic", picName);
  return pic;
};
const getPicGroup = async (picmode) => {
  const picGroup = await ipcRenderer.invoke("getPicGroup", picmode);
  return picGroup;
};
const getTotal = async () => {
  const total = await ipcRenderer.invoke("getTotal");
  return total;
};
const editSortName = async (oldName, newName) => {
  const result = await ipcRenderer.invoke("editSortName", oldName, newName);
  return result;
};
const createSort = async (sortStr) => {
  const result = await ipcRenderer.invoke("createSort", sortStr);
  return result;
};
const openFolder = async (folder) => {
  const result = await ipcRenderer.invoke("openFolder", folder);
  return result;
};
const deleteSorts = async (deleteArr) => {
  const result = await ipcRenderer.invoke("deleteSorts", deleteArr);
  return result;
};
const deletePics = async (picsArr) => {
  const result = await ipcRenderer.invoke("deletePics", picsArr);
  return result;
};
const copyPics = async (picsArr, sortsArr) => {
  const result = await ipcRenderer.invoke("copyPics", picsArr, sortsArr);
  return result;
};

contextBridge.exposeInMainWorld("appApi", {
  quitApp,
  hideApp,
  maxApp,
  getSorts,
  getPic,
  getPicGroup,
  getTotal,
  editSortName,
  createSort,
  openFolder,
  deleteSorts,
  deletePics,
  copyPics,
});
