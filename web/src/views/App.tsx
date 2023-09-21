import { useState, useEffect, useRef } from "react";
import "../styles/App.scss";
import Header from "./Header";
import Viewer from "./Viewer";
import Editor from "./Editor";
import Loading from "../components/Loading";
import Message from "../components/Message";

const UI = {
  Header,
  Viewer,
  Editor,
};

function App() {
  const [pic, setPic] = useState([
    {
      imageName: "",
      fileSize: "",
      fileType: "",
      resolution: "",
      imgUrl: "",
    },
    {
      imageName: "",
      fileSize: "",
      fileType: "",
      resolution: "",
      imgUrl: "",
    },
    {
      imageName: "",
      fileSize: "",
      fileType: "",
      resolution: "",
      imgUrl: "",
    },
  ]);
  const [total, setTotal] = useState("");
  const [selectPicsArr, setSelectPicsArr] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState(1); // 1单图2横图3竖图
  const [loadingState, setLoadingState] = useState(true);
  const [messageState, setMessageState] = useState(false);
  const [messageStr, setMessageStr] = useState("");
  const editorRef = useRef(null);

  const closeMessage = () => {
    setMessageState(false);
  };

  const selectPics = (picName: string) => {
    if (selectPicsArr.includes(picName)) {
      const updatedArr = selectPicsArr.filter((item) => item !== picName);
      setSelectPicsArr(updatedArr);
    } else {
      setSelectPicsArr([...selectPicsArr, picName]);
    }
  };
  const selectAll = () => {
    if (selectPicsArr.length != 0) {
      // 有选中图片，取消全选
      setSelectPicsArr([]);
    } else {
      // 没选中图片，全选
      const newArr = pic
        .filter((item) => item.imageName !== "") // 过滤出非空的 imageName
        .map((item) => item.imageName); // 提取 imageName 到新数组
      setSelectPicsArr(newArr);
    }
  };

  const appGetPic = async (picName: string) => {
    // 先清除分类数组
    // @ts-ignore
    editorRef.current.clearSelectArr();
    try {
      setLoadingState(true);
      // @ts-ignore
      const fetchedPic = await window.appApi.getPic(picName);
      setPic(fetchedPic);
    } finally {
      // 设置loading状态为false，关闭Loading组件
      setLoadingState(false);
    }
  };
  const appGetPicGroup = async (mode: number) => {
    setSelectPicsArr([]);
    // @ts-ignore
    editorRef.current.clearSelectArr();
    try {
      setLoadingState(true);
      // @ts-ignore
      const fetchedPicGroup = await window.appApi.getPicGroup(mode);
      setPic(fetchedPicGroup);
    } finally {
      // 设置loading状态为false，关闭Loading组件
      setLoadingState(false);
    }
  };
  const appGetTotal = async () => {
    try {
      // @ts-ignore
      const totalCount = await window.appApi.getTotal();
      setTotal(totalCount);
    } catch (err) {
      console.log(err);
    }
  };
  const viewModeCallback = async (mode: number, picName?: string) => {
    // 根据传入的数字转换模式，如果是1，就单图预览模式
    // 如果是2，那就多图模式
    setSelectPicsArr([]);
    if (mode == 1) {
      // 单图模式则去获取单个图片信息
      await appGetPic(picName as string);
      // 获取图片总数
      await appGetTotal();
      // 变更模式
      setViewMode(mode);
    } else if (mode == 2 || mode == 3) {
      // 横向图模式，获取图片组
      await appGetPicGroup(mode);
      // 获取图片总数
      await appGetTotal();
      // 变更模式
      setViewMode(mode);
    }
  };
  const handleDeletePics = async (type: number = 0) => {
    // 根据当前viewmode来决定删除内容
    if (viewMode == 1) {
      // 删除单张图片
      try {
        // @ts-ignore
        const result = await window.appApi.deletePics([pic[1].imageName]);
        if (type == 0) {
          setMessageStr("删除成功");
          setMessageState(true);
        }
        // 根据pic有没有下一张图片，有就加载下一张，没有就加载上一张
        if (pic[2].imageName != "") {
          // 加载下一张
          await appGetPic(pic[2].imageName);
          await appGetTotal();
        } else {
          // 没有下一张图片，那就加载上一张
          await appGetPic(pic[0].imageName);
          await appGetTotal();
          // 如果上一张也没有了，那么会自动传入空字符串，去加载第一张，然后转到noimg
        }
      } catch (error) {
        setMessageStr("删除失败");
        setMessageState(true);
        console.log(error);
      }
    } else if (viewMode == 2 || viewMode == 3) {
      // 删除图片组
      try {
        // @ts-ignore
        const result = await window.appApi.deletePics(selectPicsArr);
        if (type == 0) {
          setMessageStr("删除成功");
          setMessageState(true);
        }
        await appGetPicGroup(viewMode);
        await appGetTotal();
      } catch (error) {
        setMessageStr("删除失败");
        setMessageState(true);
        console.log(error);
      }
    }
  };
  const handleCopyPics = async (sortsArr: Array<string>, copyOrCut: number) => {
    if (viewMode == 1) {
      try {
        // @ts-ignore
        const result = await window.appApi.copyPics(
          [pic[1].imageName],
          sortsArr
        );
        if (copyOrCut == 0) {
          setMessageStr("复制到分类成功");
          setMessageState(true);
          // 如果是复制，那么不需要重新获取图片，只需要清空选择分类数组即可
          // @ts-ignore
          editorRef.current.clearSelectArr();
          // 再额外获取一次分类
          // @ts-ignore
          editorRef.current.appGetSorts();
        } else if (copyOrCut == 1) {
          // 如果是剪切，还要额外删除一次图片
          await handleDeletePics(1);
          setMessageStr("剪切到分类成功");
          setMessageState(true);
          // 再额外获取一次分类
          // @ts-ignore
          editorRef.current.appGetSorts();
        }
      } catch (error) {
        let mstr = "复制到分类失败";
        if (copyOrCut == 1) {
          mstr = "剪切到分类失败";
        }
        setMessageStr(mstr);
        setMessageState(true);
        console.log(error);
      }
    } else if (viewMode == 2 || viewMode == 3) {
      try {
        // @ts-ignore
        const result = await window.appApi.copyPics(selectPicsArr, sortsArr);
        if (copyOrCut == 0) {
          setMessageStr("复制到分类成功");
          setMessageState(true);
          // @ts-ignore
          editorRef.current.clearSelectArr();
          // 再额外获取一次分类
          // @ts-ignore
          editorRef.current.appGetSorts();
        } else if (copyOrCut == 1) {
          // 如果是剪切，还要额外删除一次图片
          await handleDeletePics(1);
          setMessageStr("剪切到分类成功");
          setMessageState(true);
          // 再额外获取一次分类
          // @ts-ignore
          editorRef.current.appGetSorts();
        }
      } catch (error) {
        let mstr = "复制到分类失败";
        if (copyOrCut == 1) {
          mstr = "剪切到分类失败";
        }
        setMessageStr(mstr);
        setMessageState(true);
        console.log(error);
      }
    }
  };

  useEffect(() => {
    viewModeCallback(1, "");

    return () => {};
  }, []);

  return (
    <>
      <div className="app_container">
        <Message
          messageState={messageState}
          messageStr={messageStr}
          hideFunc={closeMessage}
        ></Message>
        <UI.Header
          imageName={pic[1].imageName}
          fileSize={pic[1].fileSize}
          fileType={pic[1].fileType}
          resolution={pic[1].resolution}
          totalPic={total}
          viewMode={viewMode}
        ></UI.Header>
        <div className="main_container">
          <div className="main_view">
            <Loading loadingState={loadingState} />
            <UI.Viewer
              pic={pic}
              viewMode={viewMode}
              setViewMode={viewModeCallback}
              selectImgArr={selectPics}
              selectPicsArr={selectPicsArr}
              selectAll={selectAll}
            ></UI.Viewer>
          </div>
          <UI.Editor
            viewMode={viewMode}
            setViewMode={viewModeCallback}
            handleDeletePics={handleDeletePics}
            handleCopyPics={handleCopyPics}
            currentImg={pic[1].imageName}
            currentPics={selectPicsArr}
            ref={editorRef}
          ></UI.Editor>
        </div>
      </div>
    </>
  );
}

export default App;
