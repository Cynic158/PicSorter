import "../styles/Editor.scss";
import Message from "../components/Message";
import Dialog from "../components/Dialog";
import Warning from "../components/Warning";
import { useEffect, useState, forwardRef, useImperativeHandle } from "react";

interface sortType {
  folderName: string;
  folderSize: string;
  imageCount: number;
}
interface editorType {
  viewMode: number;
  setViewMode: Function;
  handleDeletePics: Function;
  handleCopyPics: Function;
  currentImg: string;
  currentPics: Array<string>;
}

const Editor = forwardRef(
  (
    {
      viewMode,
      setViewMode,
      handleDeletePics,
      handleCopyPics,
      currentImg,
      currentPics,
    }: editorType,
    ref
  ) => {
    const [sorts, setSorts] = useState([]);
    const [selectArr, setSelectArr] = useState<string[]>([]);
    const [messageState, setMessageState] = useState(false);
    const [messageStr, setMessageStr] = useState("");
    const [dialogState, setDialogState] = useState(false);
    const [dialogTitle, setDialogTitle] = useState("创建分类");
    const [dialogSortStr, setDialogSortStr] = useState("");
    const [warningState, setWarningState] = useState(false);
    const [warningTitle, setWarningTitle] = useState("删除图片");
    const [warningStr, setWarningStr] = useState(
      "确定要删除该图片吗，图片会直接消失，不会转移到回收站"
    );

    const clearSelectArr = () => {
      setSelectArr([]);
    };

    useImperativeHandle(ref, () => ({
      clearSelectArr,
      appGetSorts,
    }));

    const selectSort = (sortName: string) => {
      // 检查 selectArr 是否包含 sortName
      if (selectArr.includes(sortName)) {
        // 如果包含，则从数组中移除
        const updatedArr = selectArr.filter((item) => item !== sortName);
        setSelectArr(updatedArr);
      } else {
        // 如果不包含，则添加到数组
        setSelectArr([...selectArr, sortName]);
      }
    };

    const closeDialog = () => {
      setDialogState(false);
    };
    const closeWarning = () => {
      setWarningState(false);
    };
    const dialogCallback = async (sortStr: string) => {
      const nameRepeat = sorts.some(
        (sort: sortType) => sort.folderName === sortStr
      );
      if (sortStr == "") {
        // 弹出提示
        setMessageStr("分类名不能为空");
        setMessageState(true);
      } else if (nameRepeat) {
        // 分类名重复了，弹出提示
        setMessageStr("分类名不能重复");
        setMessageState(true);
      } else {
        // 分类名没有重复，判断当前是创建分类还是修改分类
        // 如果是创建分类
        if (dialogTitle == "创建分类") {
          // @ts-ignore
          const result = await window.appApi.createSort("./" + sortStr);
          setDialogState(false);
          if (result) {
            setMessageStr("创建成功");
            setMessageState(true);
            // 创建成功，刷新分类
            appGetSorts();
          } else {
            // 创建失败，消息提示
            setMessageStr("创建失败");
            setMessageState(true);
          }
        }
        // 如果是修改分类
        else if (dialogTitle == "修改分类") {
          // @ts-ignore
          const result = await window.appApi.editSortName(
            selectArr[0],
            sortStr
          );
          setDialogState(false);
          if (result) {
            setMessageStr("修改成功");
            setMessageState(true);
            setSelectArr([]);
            // 修改成功，刷新分类
            appGetSorts();
          } else {
            // 修改失败，消息提示
            setMessageStr("修改失败");
            setMessageState(true);
          }
        }
      }
    };
    const warningCallback = async () => {
      // 如果是删除分类
      if (warningTitle == "删除分类") {
        // @ts-ignore
        const result = await window.appApi.deleteSorts(selectArr);
        setWarningState(false);
        if (result) {
          setMessageStr("删除成功");
          setMessageState(true);
          setSelectArr([]);
          // 删除成功，刷新分类
          appGetSorts();
        } else {
          // 删除失败，消息提示
          setMessageStr("删除失败");
          setMessageState(true);
        }
      }
      // 如果是删除图片
      else if (warningTitle == "删除图片") {
        setWarningState(false);
        handleDeletePics();
      }
    };

    const closeMessage = () => {
      setMessageState(false);
    };

    const appGetSorts = async () => {
      try {
        // @ts-ignore
        const fetchedSorts = await window.appApi.getSorts();
        setSorts(fetchedSorts);
      } finally {
      }
    };

    let editorContent = null;
    const btnContent = (
      <div className="editor_btn">
        <button
          onClick={() => {
            handleCopyPics(selectArr, 0);
          }}
        >
          <span className="iconfont icon-copy"></span>
          <span className="btn_str">复制到分类</span>
        </button>
        <button
          onClick={() => {
            handleCopyPics(selectArr, 1);
          }}
        >
          <span className="iconfont icon-cut"></span>
          <span className="btn_str">剪切到分类</span>
        </button>
        <button
          onClick={() => {
            // 弹出提示框
            setWarningState(true);
            setWarningTitle("删除图片");
            if (viewMode == 1) {
              setWarningStr(
                "确定要删除该图片吗，图片会直接消失，不会转移到回收站"
              );
            } else {
              setWarningStr(
                "确定要删除选中的图片吗，图片会直接消失，不会转移到回收站"
              );
            }
          }}
        >
          <span className="iconfont icon-ashbin"></span>
          <span className="btn_str">删除图片</span>
        </button>
      </div>
    );
    const disabledContent = (
      <div className="editor_btn editor_btn_disabled">
        <button>
          <span className="iconfont icon-copy"></span>
          <span className="btn_str">复制到分类</span>
        </button>
        <button>
          <span className="iconfont icon-cut"></span>
          <span className="btn_str">剪切到分类</span>
        </button>
        <button>
          <span className="iconfont icon-ashbin"></span>
          <span className="btn_str">删除图片</span>
        </button>
      </div>
    );
    const cvdisabledContent = (
      <div className="editor_btn">
        <button className="editor_btn_cvdisabled">
          <span className="iconfont icon-copy"></span>
          <span className="btn_str">复制到分类</span>
        </button>
        <button className="editor_btn_cvdisabled">
          <span className="iconfont icon-cut"></span>
          <span className="btn_str">剪切到分类</span>
        </button>
        <button
          onClick={() => {
            // 弹出提示框
            setWarningState(true);
            setWarningTitle("删除图片");
            if (viewMode == 1) {
              setWarningStr(
                "确定要删除该图片吗，图片会直接消失，不会转移到回收站"
              );
            } else {
              setWarningStr(
                "确定要删除选中的图片吗，图片会直接消失，不会转移到回收站"
              );
            }
          }}
        >
          <span className="iconfont icon-ashbin"></span>
          <span className="btn_str">删除图片</span>
        </button>
      </div>
    );
    if (viewMode == 1) {
      if (currentImg != "") {
        if (selectArr.length != 0) {
          editorContent = btnContent;
        } else {
          editorContent = cvdisabledContent;
        }
      } else {
        editorContent = disabledContent;
      }
    } else {
      if (currentPics.length != 0) {
        if (selectArr.length != 0) {
          editorContent = btnContent;
        } else {
          editorContent = cvdisabledContent;
        }
      } else {
        editorContent = disabledContent;
      }
    }

    useEffect(() => {
      appGetSorts();

      return () => {};
    }, []);

    return (
      <div className="editor_container">
        <Dialog
          dialogState={dialogState}
          dialogTitle={dialogTitle}
          hideFunc={closeDialog}
          callback={dialogCallback}
          sortName={dialogSortStr}
        ></Dialog>
        <Warning
          warningState={warningState}
          warningTitle={warningTitle}
          warningStr={warningStr}
          hideFunc={closeWarning}
          callback={warningCallback}
        ></Warning>
        <Message
          messageState={messageState}
          messageStr={messageStr}
          hideFunc={closeMessage}
        ></Message>
        <div className="editor_icon">
          {viewMode === 1 ? (
            <span
              title="预览单个图片"
              className="iconfont icon-browse editor_disabled"
            ></span>
          ) : (
            <span
              onClick={() => {
                // 记得清空选中的图片组
                setViewMode(1, "");
                setSelectArr([]);
              }}
              title="预览单个图片"
              className="iconfont icon-browse"
            ></span>
          )}
          {viewMode === 2 ? (
            <span
              title="预览横向图片"
              className="iconfont icon-modular editor_disabled"
            ></span>
          ) : (
            <span
              onClick={() => {
                setViewMode(2);
                setSelectArr([]);
              }}
              title="预览横向图片"
              className="iconfont icon-modular"
            ></span>
          )}
          {viewMode === 3 ? (
            <span
              title="预览竖向图片"
              className="iconfont icon-3column editor_disabled"
            ></span>
          ) : (
            <span
              onClick={() => {
                setViewMode(3);
                setSelectArr([]);
              }}
              title="预览竖向图片"
              className="iconfont icon-3column"
            ></span>
          )}
          <span
            onClick={() => {
              // @ts-ignore
              window.appApi.openFolder("sorts");
            }}
            className="iconfont icon-file-open"
            title="打开分类文件夹"
          ></span>
          <span
            onClick={() => {
              setDialogState(true);
              setDialogTitle("创建分类");
              setDialogSortStr("");
            }}
            title="创建分类"
            className="iconfont icon-add-bold"
          ></span>
          {selectArr.length === 0 ? (
            <span
              title="删除分类"
              className="iconfont icon-ashbin editor_disabled"
            ></span>
          ) : (
            <span
              title="删除分类"
              className="iconfont icon-ashbin"
              onClick={() => {
                // 弹出提示框
                setWarningState(true);
                setWarningTitle("删除分类");
                setWarningStr(
                  "确定要删除选中的分类吗，分类文件夹及其内容会直接消失，不会转移到回收站"
                );
              }}
            ></span>
          )}
          {selectArr.length === 1 ? (
            <span
              onClick={() => {
                setDialogState(true);
                setDialogTitle("修改分类");
                // 根据当前选中的分类传入对应字符串
                setDialogSortStr(selectArr[0]);
              }}
              title="修改分类名称"
              className="iconfont icon-edit"
            ></span>
          ) : (
            <span
              title="修改分类名称"
              className="iconfont icon-edit editor_disabled"
            ></span>
          )}
          <span
            onClick={() => {
              if (selectArr.length > 0) {
                setSelectArr([]);
              } else {
                const selectAll = sorts.map(
                  (sort: sortType) => sort.folderName
                );
                setSelectArr(selectAll);
              }
            }}
            title="全选分类或取消全选"
            className="iconfont icon-menu"
          ></span>
        </div>
        <div className="editor_sort">
          <ul>
            {sorts.map((sort: sortType, index) => (
              <li
                key={index}
                onClick={() => {
                  selectSort(sort.folderName);
                }}
              >
                <div className="sort_title">
                  {selectArr.includes(sort.folderName) ? (
                    <span className="iconfont icon-check-item-filling"></span>
                  ) : (
                    <span className="iconfont icon-intermediate-filling"></span>
                  )}
                  <span>{sort.folderName}</span>
                </div>
                <div className="sort_detail">
                  <span>{sort.imageCount + " 张"}</span>
                  <span>{sort.folderSize}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>
        {editorContent}
      </div>
    );
  }
);
export default Editor;
