import { useEffect, useRef, useState } from "react";
import "../styles/ImgView.scss";
import {
  TransformWrapper,
  TransformComponent,
  ReactZoomPanPinchRef,
} from "react-zoom-pan-pinch";

interface picType {
  imageName: string;
  fileSize: string;
  fileType: string;
  resolution: string;
  imgUrl: string;
}
interface imgViewType {
  pic: Array<picType>;
  setViewMode: Function;
}

const ImgView = ({ pic, setViewMode }: imgViewType) => {
  const transformComponentRef = useRef<ReactZoomPanPinchRef | null>(null);
  const imgRef = useRef(null);
  const [htmlHeight, setHtmlHeight] = useState(window.innerHeight - 32);
  const [imageLoaded, setImageLoaded] = useState(false); // 添加一个状态来跟踪图片加载状态
  const [imageKey, setImageKey] = useState(0); // 添加一个 key 状态

  useEffect(() => {
    const handleResize = () => {
      setHtmlHeight(window.innerHeight - 32);
    };

    // 添加窗口大小变化的监听器
    window.addEventListener("resize", handleResize);
    handleResize();

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  // 图片加载完成时的回调函数
  const handleImageLoad = () => {
    setImageLoaded(false);
    setImageLoaded(true);
    setImageKey((prevKey) => prevKey + 1);
  };

  useEffect(() => {
    transformComponentRef.current?.resetTransform();
  }, [imageKey]);

  return (
    <div className="imgview_container">
      <img
        src={pic[1].imgUrl}
        onLoad={handleImageLoad}
        style={{ display: "none" }}
      />
      {imageLoaded && (
        <TransformWrapper
          doubleClick={{ mode: "reset" }}
          centerOnInit={true}
          maxScale={10}
          ref={transformComponentRef}
          key={imageKey}
        >
          <TransformComponent wrapperClass="zoom_main">
            <div
              ref={imgRef}
              className="zoom_container"
              style={{ height: htmlHeight + "px" }}
            >
              <img src={pic[1].imgUrl} className="zoom_img" />
            </div>
          </TransformComponent>
        </TransformWrapper>
      )}
      {pic[0].imageName != "" ? (
        <button
          onClick={() => {
            setViewMode(pic[0].imageName);
          }}
          className="imgview_left"
        >
          <span className="iconfont icon-arrow-left-bold"></span>
        </button>
      ) : (
        <button
          title="前面已没有更多图片"
          className="imgview_left imgview_disabled"
        >
          <span className="iconfont icon-arrow-left-bold"></span>
        </button>
      )}
      {pic[2].imageName != "" ? (
        <button
          onClick={() => {
            setViewMode(pic[2].imageName);
          }}
          className="imgview_right"
        >
          <span className="iconfont icon-arrow-right-bold"></span>
        </button>
      ) : (
        <button
          title="已经是最后一张图片"
          className="imgview_right imgview_disabled"
        >
          <span className="iconfont icon-arrow-right-bold"></span>
        </button>
      )}
    </div>
  );
};
export default ImgView;
