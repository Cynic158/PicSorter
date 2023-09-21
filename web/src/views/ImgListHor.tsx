import "../styles/ImgListHor.scss";
interface picType {
  imageName: string;
  fileSize: string;
  fileType: string;
  resolution: string;
  imgUrl: string;
}
interface imgListHorType {
  imgGroup: Array<picType>;
  selectImg: Function;
  selectPicsArr: Array<string>;
  setViewMode: Function;
}

const ImgListHor = ({
  imgGroup,
  selectImg,
  selectPicsArr,
  setViewMode,
}: imgListHorType) => {
  return (
    <div className="imglisthor_container">
      <ul className="waterfall">
        {imgGroup.map((img: picType, index) => {
          if (img.imageName == "") {
            return null;
          }

          return (
            <li
              onClick={() => {
                selectImg(img.imageName);
              }}
              key={index}
              className="column"
            >
              {selectPicsArr.includes(img.imageName) ? (
                <span
                  onClick={() => {}}
                  className="iconfont icon-select-bold"
                ></span>
              ) : (
                <span style={{ display: "none" }}></span>
              )}
              <img src={img.imgUrl} />
              <p className="img_tip">
                <span title="图片名称">{img.imageName}</span>
                <span title="图片大小">{img.fileSize}</span>
                <span title="分辨率">{img.resolution}</span>
                <span title="图片类型">{img.fileType}</span>
                <span
                  onClick={(e) => {
                    e.stopPropagation(); // 阻止事件冒泡
                    setViewMode(img.imageName);
                  }}
                  title="放大查看"
                  className="iconfont icon-expand"
                ></span>
              </p>
            </li>
          );
        })}
      </ul>
    </div>
  );
};
export default ImgListHor;
