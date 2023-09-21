import "../styles/Viewer.scss";
import NoImg from "./NoImg";
import ImgView from "./ImgView";
import ImgListHor from "./ImgListHor";
import ImgListVer from "./ImgListVer";
// import { useEffect, useState } from "react";
interface picType {
  imageName: string;
  fileSize: string;
  fileType: string;
  resolution: string;
  imgUrl: string;
}
interface viewerType {
  pic: Array<picType>;
  viewMode: number;
  setViewMode: Function;
  selectImgArr: Function;
  selectPicsArr: Array<string>;
  selectAll: Function;
}

const Viewer = ({
  pic,
  viewMode,
  setViewMode,
  selectImgArr,
  selectPicsArr,
  selectAll,
}: viewerType) => {
  let content = null;
  const setVM = (picName: string) => {
    setViewMode(1, picName);
  };

  const selectImg = (imgName: string) => {
    selectImgArr(imgName);
  };

  if (viewMode == 2 || viewMode == 3) {
  }
  if (viewMode === 1) {
    content =
      pic[1].imgUrl === "" ? (
        <NoImg noStr="" setViewMode={setVM} />
      ) : (
        <ImgView pic={pic} setViewMode={setVM} />
      );
  } else if (viewMode === 2) {
    content =
      pic[0].imgUrl === "" ? (
        <NoImg noStr="横向" setViewMode={setVM} />
      ) : (
        <>
          <button
            onClick={() => {
              selectAll();
            }}
            title="全选图片或者取消全选"
            className="viewer_select_all"
          >
            <span className="iconfont icon-menu"></span>
          </button>
          <ImgListHor
            imgGroup={pic}
            selectImg={selectImg}
            selectPicsArr={selectPicsArr}
            setViewMode={setVM}
          ></ImgListHor>
        </>
      );
  } else if (viewMode === 3) {
    content =
      pic[0].imgUrl === "" ? (
        <NoImg noStr="竖向" setViewMode={setVM} />
      ) : (
        <>
          <button
            onClick={() => {
              selectAll();
            }}
            title="全选图片或者取消全选"
            className="viewer_select_all"
          >
            <span className="iconfont icon-menu"></span>
          </button>
          <ImgListVer
            imgGroup={pic}
            selectImg={selectImg}
            selectPicsArr={selectPicsArr}
            setViewMode={setVM}
          ></ImgListVer>
        </>
      );
  }
  return <div className="viewer_container">{content}</div>;
};
export default Viewer;
