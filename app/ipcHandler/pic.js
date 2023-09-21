const { app, ipcMain, shell, dialog } = require("electron");
const path = require("path");
const fs = require("fs");
const { promisify } = require("util");
const imageSize = promisify(require("image-size"));

// 辅助函数，将文件大小转换为合适的单位
function formatFileSize(size) {
  const units = ["B", "KB", "MB", "GB", "TB"];
  let index = 0;
  while (size >= 1024 && index < units.length - 1) {
    size /= 1024;
    index++;
  }
  return size.toFixed(2) + " " + units[index];
}

const getFilesSorted = async (picPath, oldfiles) => {
  try {
    let filesinfo = [];
    // 遍历文件数组并获取文件的修改时间
    for (const file of oldfiles) {
      const filePath = path.join(picPath, file);
      const stats = await fs.promises.stat(filePath);

      // 将文件信息添加到数组中
      filesinfo.push({
        name: file,
        mtime: stats.mtime, // 修改时间
      });
    }

    // 根据修改时间排序文件信息数组
    filesinfo.sort((a, b) => a.mtime.getTime() - b.mtime.getTime());
    // 提取文件名字符串并创建一个新的文件名数组
    const filenames = filesinfo.map((fileInfo) => fileInfo.name);
    return filenames;
  } catch (error) {
    console.log(error);
  }
};

const picHandler = (appPath) => {
  appPath = path.resolve(appPath, "../");
  // 获取分类文件夹
  ipcMain.handle("getSorts", async () => {
    const sortsPath = path.resolve(appPath, "./sorts");

    try {
      const folderContents = await fs.promises.readdir(sortsPath);

      // 过滤出文件夹
      const folderNames = await Promise.all(
        folderContents.map(async (item) => {
          const itemPath = path.join(sortsPath, item);
          const stats = await fs.promises.stat(itemPath);
          if (stats.isDirectory()) {
            return item;
          }
          return null;
        })
      );

      // 过滤掉null值
      const filteredFolderNames = folderNames.filter(
        (folderName) => folderName !== null
      );

      const folderInfo = await Promise.all(
        filteredFolderNames.map(async (folderName) => {
          const folderPath = path.join(sortsPath, folderName);
          const files = await fs.promises.readdir(folderPath);

          // 过滤出图片文件
          const imageFiles = files.filter((file) =>
            /\.(jpg|jpeg|png|gif|webp)$/i.test(file)
          );

          // 获取文件夹大小（单位：字节）
          const folderSize = await Promise.all(
            imageFiles.map(async (file) => {
              const filePath = path.join(folderPath, file);
              const stats = await fs.promises.stat(filePath);
              return stats.size;
            })
          );

          const totalFolderSize = folderSize.reduce(
            (acc, size) => acc + size,
            0
          );

          // 转换文件夹大小为合适的单位（KB、MB、GB等）
          const sizeInGB = (totalFolderSize / (1024 * 1024 * 1024)).toFixed(2);
          const sizeInMB = (totalFolderSize / (1024 * 1024)).toFixed(2);
          const sizeInKB = (totalFolderSize / 1024).toFixed(2);

          // 根据大小选择合适的单位
          let folderSizeStr;
          if (sizeInGB >= 1) {
            folderSizeStr = sizeInGB + " GB";
          } else if (sizeInMB >= 1) {
            folderSizeStr = sizeInMB + " MB";
          } else {
            folderSizeStr = sizeInKB + " KB";
          }

          return {
            folderName,
            folderSize: folderSizeStr,
            imageCount: imageFiles.length,
          };
        })
      );

      return folderInfo;
    } catch (err) {
      console.error("无法读取文件夹:", err);
      throw err; // 抛出错误以便调用者能够捕获错误
    }
  });

  // 根据提供的图片名获取三个图片信息
  ipcMain.handle("getPic", async (event, picName) => {
    const picPath = path.resolve(appPath, "./pic");

    try {
      let oldfiles = await fs.promises.readdir(picPath);
      let files = await getFilesSorted(picPath, oldfiles);
      files = files.filter((file) => /\.(jpg|jpeg|png|gif|webp)$/i.test(file));
      const picInfoArray = [];

      if (picName === "") {
        // 如果 picName 为空字符串，获取第一张图片的信息
        const firstImage = files.find((file) =>
          /\.(jpg|jpeg|png|gif|webp)$/i.test(file)
        );

        if (firstImage) {
          const imagePath = path.join(picPath, firstImage);

          // 获取文件大小
          const stats = await fs.promises.stat(imagePath);
          const fileSize = stats.size;

          // 转换单位为合适的字符串
          const fileSizeStr = formatFileSize(fileSize);

          // 获取文件类型（大写字母）
          const fileType = path.extname(firstImage).toUpperCase().slice(1);

          // 获取图片分辨率
          const dimensions = await imageSize(imagePath);
          const resolution = `${dimensions.width} x ${dimensions.height}`;

          // 拼接URL
          const imageUrl = `http://localhost:7776/pic/${firstImage}`;

          picInfoArray.push({
            imageName: "",
            fileSize: "",
            fileType: "",
            resolution: "",
            imgUrl: "",
          });

          picInfoArray.push({
            imageName: firstImage,
            fileSize: fileSizeStr,
            fileType,
            resolution,
            imgUrl: imageUrl,
          });

          // 看有没有第二张图片，有就再加
          const picIndex = files.indexOf(firstImage);
          if (picIndex !== -1) {
            // 获取后一张图片的信息
            const nextImage =
              picIndex < files.length - 1 ? files[picIndex + 1] : "";
            if (nextImage) {
              picInfoArray.push({
                imageName: nextImage,
                fileSize: "",
                fileType: "",
                resolution: "",
                imgUrl: "",
              });
            } else {
              picInfoArray.push({
                imageName: "",
                fileSize: "",
                fileType: "",
                resolution: "",
                imgUrl: "",
              });
            }
          }

          return picInfoArray;
        } else {
          // 如果没有找到满足条件的图片，返回三个空对象
          for (let i = 0; i < 3; i++) {
            picInfoArray.push({
              imageName: "",
              fileSize: "",
              fileType: "",
              resolution: "",
              imgUrl: "",
            });
          }
          return picInfoArray;
        }
      } else {
        // 如果 picName 不为空，根据传入的 picName 获取对应图片的信息以及前一张和后一张的图片信息
        const picIndex = files.indexOf(picName);
        if (picIndex !== -1) {
          const imagePath = path.join(picPath, picName);

          // 获取文件大小
          const stats = await fs.promises.stat(imagePath);
          const fileSize = stats.size;

          // 转换单位为合适的字符串
          const fileSizeStr = formatFileSize(fileSize);

          // 获取文件类型（大写字母）
          const fileType = path.extname(picName).toUpperCase().slice(1);

          // 获取图片分辨率
          const dimensions = await imageSize(imagePath);
          const resolution = `${dimensions.width} x ${dimensions.height}`;

          // 拼接URL
          const imageUrl = `http://localhost:7776/pic/${picName}`;

          // 获取前一张和后一张图片的信息
          const prevImage = picIndex > 0 ? files[picIndex - 1] : "";
          const nextImage =
            picIndex < files.length - 1 ? files[picIndex + 1] : "";

          if (prevImage) {
            picInfoArray.push({
              imageName: prevImage,
              fileSize: "",
              fileType: "",
              resolution: "",
              imgUrl: "",
            });
          } else {
            picInfoArray.push({
              imageName: "",
              fileSize: "",
              fileType: "",
              resolution: "",
              imgUrl: "",
            });
          }

          picInfoArray.push({
            imageName: picName,
            fileSize: fileSizeStr,
            fileType,
            resolution,
            imgUrl: imageUrl,
          });

          if (nextImage) {
            picInfoArray.push({
              imageName: nextImage,
              fileSize: "",
              fileType: "",
              resolution: "",
              imgUrl: "",
            });
          } else {
            picInfoArray.push({
              imageName: "",
              fileSize: "",
              fileType: "",
              resolution: "",
              imgUrl: "",
            });
          }
        }
      }

      return picInfoArray;
    } catch (err) {
      console.error("无法读取图片文件夹:", err);
      throw err;
    }
  });

  // 获取图片组信息
  ipcMain.handle("getPicGroup", async (event, picmode) => {
    const picPath = path.resolve(appPath, "./pic");

    try {
      const oldfiles = await fs.promises.readdir(picPath);
      let files = await getFilesSorted(picPath, oldfiles);
      let horPicArr = [];
      let verPicArr = [];

      for (const file of files) {
        if (/\.(jpg|jpeg|png|gif|webp)$/i.test(file)) {
          const imagePath = path.join(picPath, file);

          // 获取文件大小
          const stats = await fs.promises.stat(imagePath);
          const fileSize = stats.size;

          // 转换单位为合适的字符串
          const fileSizeStr = formatFileSize(fileSize);

          // 获取文件类型（大写字母）
          const fileType = path.extname(file).toUpperCase().slice(1);

          // 获取图片分辨率
          const dimensions = await imageSize(imagePath);
          const resolution = `${dimensions.width} x ${dimensions.height}`;

          // 拼接URL
          const imageUrl = `http://localhost:7776/pic/${file}`;

          // 构造图片对象
          const picObj = {
            imageName: file,
            fileSize: fileSizeStr,
            fileType,
            resolution,
            imgUrl: imageUrl,
          };

          // 判断图片的分辨率是横向还是竖向
          if (dimensions.width >= dimensions.height) {
            // 横向或正方形图片，放入 horPicArr
            horPicArr.push(picObj);
          } else {
            // 竖向图片，放入 verPicArr
            verPicArr.push(picObj);
          }
        }
      }

      if (picmode == 2) {
        // 返回横向图片组
        if (horPicArr.length >= 3) {
          return horPicArr;
        } else {
          while (horPicArr.length < 3) {
            horPicArr.push({
              imageName: "",
              fileSize: "",
              fileType: "",
              resolution: "",
              imgUrl: "",
            });
          }

          return horPicArr;
        }
      } else if (picmode == 3) {
        // 返回竖向图片组
        if (verPicArr.length >= 3) {
          return verPicArr;
        } else {
          while (verPicArr.length < 3) {
            verPicArr.push({
              imageName: "",
              fileSize: "",
              fileType: "",
              resolution: "",
              imgUrl: "",
            });
          }

          return verPicArr;
        }
      }
    } catch (err) {
      console.error("无法读取图片文件夹:", err);
      throw err;
    }
  });

  // 获取图片余量
  ipcMain.handle("getTotal", async () => {
    const totalPath = path.resolve(appPath, "./pic");

    try {
      const files = await fs.promises.readdir(totalPath);
      const imageRegex = /\.(jpg|jpeg|png|gif|webp)$/;

      const imageFiles = files.filter((file) => imageRegex.test(file));
      const totalCount = imageFiles.length;

      if (totalCount === 0) {
        return ""; // 返回空字符串
      } else {
        return `余 ${totalCount} 张`; // 返回图片总数字符串
      }
    } catch (error) {
      console.error("获取图片总数出错:", error);
      return ""; // 返回空字符串，如果出现错误
    }
  });

  // 修改分类文件夹名称
  ipcMain.handle("editSortName", async (event, oldName, newName) => {
    const editPath = path.resolve(appPath, "./sorts");
    const oldFolderPath = path.join(editPath, oldName);
    const newFolderPath = path.join(editPath, newName);

    try {
      await fs.promises.rename(oldFolderPath, newFolderPath);
      return true; // 重命名成功
    } catch (error) {
      console.error("重命名文件夹出错:", error);
      return false; // 重命名失败
    }
  });

  // 创建分类文件夹
  ipcMain.handle("createSort", async (event, sortStr) => {
    const createPath = path.resolve(appPath, "./sorts", sortStr); // 构建目标文件夹的路径

    try {
      await fs.promises.mkdir(createPath); // 尝试创建文件夹
      return true; // 如果创建成功，返回 true
    } catch (error) {
      console.error("创建文件夹失败:", error);
      return false; // 如果创建失败，返回 false
    }
  });

  // 打开分类文件夹
  ipcMain.handle("openFolder", async (event, folder) => {
    let openPath = "";
    try {
      if (folder == "sorts") {
        openPath = path.resolve(appPath, "./sorts");
        // 使用 shell.openPath 直接打开文件夹窗口
        await shell.openPath(openPath);
        return true;
      } else if (folder == "pic") {
        openPath = path.resolve(appPath, "./pic");
        const result = await dialog.showOpenDialog({
          defaultPath: openPath,
          title: "请将需要进行分类处理的图片放到pic文件夹",
          properties: ["multiSelections"],
          buttonLabel: "确定",
          filters: [
            {
              name: "Images",
              extensions: ["jpg", "jpeg", "png", "gif", "webp"],
            },
          ],
        });

        // 如果用户点击了确定按钮并选择了文件夹，result.filePaths 将包含所选文件夹的路径
        if (!result.canceled) {
          return true;
        } else {
          return false; // 返回 false 表示用户取消操作
        }
      }
    } catch (error) {
      console.log(error);
    }
  });

  // 删除分类文件夹
  ipcMain.handle("deleteSorts", async (event, deleteArr) => {
    const deletePath = path.resolve(appPath, "./sorts");
    let success = true; // 默认设置为true，如果有删除失败的情况会被设置为false

    try {
      for (const folderName of deleteArr) {
        const folderToDelete = path.join(deletePath, folderName);
        await fs.promises.rmdir(folderToDelete, { recursive: true }); // 递归删除文件夹及其内容
      }
    } catch (error) {
      console.error("删除文件夹时出错:", error);
      success = false; // 设置为false，表示删除操作失败
    }

    return success; // 返回布尔值表示是否删除成功
  });

  // 删除图片
  ipcMain.handle("deletePics", async (event, picsArr) => {
    const deletePath = path.resolve(appPath, "./pic");

    try {
      for (const picName of picsArr) {
        const filePath = path.join(deletePath, picName);
        await fs.promises.unlink(filePath); // 删除文件
      }

      return true; // 删除成功，返回true
    } catch (error) {
      console.error("删除图片时出错:", error);
      return false; // 删除失败，返回false
    }
  });

  // 复制粘贴图片到分类
  ipcMain.handle("copyPics", async (event, picsArr, sortsArr) => {
    const picPath = path.resolve(appPath, "./pic");
    const sortPath = path.resolve(appPath, "./sorts");

    try {
      for (let i = 0; i < picsArr.length; i++) {
        const picName = picsArr[i];

        for (let j = 0; j < sortsArr.length; j++) {
          const sortName = sortsArr[j];
          const sourcePath = path.join(picPath, picName);
          const destinationPath = path.join(sortPath, sortName, picName);

          await fs.promises.copyFile(sourcePath, destinationPath);
        }
      }

      return true; // 操作成功，返回true
    } catch (error) {
      console.error("复制图片出错:", error);
      return false; // 操作失败，返回false
    }
  });
};

module.exports = picHandler;
