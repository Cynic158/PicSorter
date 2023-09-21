import "../styles/ImgListVer.scss";
interface picType {
  imageName: string;
  fileSize: string;
  fileType: string;
  resolution: string;
  imgUrl: string;
}
interface imgListVerType {
  imgGroup: Array<picType>;
  selectImg: Function;
  selectPicsArr: Array<string>;
  setViewMode: Function;
}

const ImgListVer = ({
  imgGroup,
  selectImg,
  selectPicsArr,
  setViewMode,
}: imgListVerType) => {
  return (
    <div className="imglistver_container">
      <ul className="scroll_container">
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
              className="scroll_item"
            >
              {selectPicsArr.includes(img.imageName) ? (
                <span
                  onClick={() => {}}
                  className="iconfont icon-select"
                ></span>
              ) : (
                <span style={{ display: "none" }}></span>
              )}
              <img src={img.imgUrl} />
              <p className="img_tip">
                <div className="img_name" title="图片名称">
                  {img.imageName}
                </div>
                <div className="img_info">
                  <span title="图片大小">{img.fileSize}</span>
                  <span title="分辨率">{img.resolution}</span>
                </div>
                <div className="img_type" title="图片类型">
                  {img.fileType}
                </div>
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
export default ImgListVer;
