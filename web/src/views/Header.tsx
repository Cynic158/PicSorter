import "../styles/Header.scss";

interface fileType {
  imageName: string;
  fileSize: string;
  fileType: string;
  resolution: string;
  totalPic: string;
  viewMode: number;
}

const Header = ({
  imageName,
  fileSize,
  fileType,
  resolution,
  totalPic,
  viewMode,
}: fileType) => {
  return (
    <div className="header_container">
      <div className="header_left">
        <svg
          style={{ width: "24px", height: "24px", marginLeft: "12px" }}
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 106.36000061035156 100"
        >
          <path
            fill="#094ecd"
            d="M31.46 8.31L0 0v100l31.46-8.31 11.97-3.17V11.48L31.46 8.31z"
          ></path>
          <path
            fill="#00b0d8"
            opacity=".8"
            d="M62.93 8.31L31.46 0v100l31.47-8.31 11.96-3.17V11.48L62.93 8.31z"
          ></path>
          <path
            fill="#00b0d8"
            opacity=".6"
            d="M62.93 0v100l43.43-11.48V11.48L62.93 0z"
          ></path>
        </svg>
        <span>PicSorter</span>
        {viewMode == 1 ? (
          <>
            <span title="图片名称">{imageName}</span>
            <span title="图片大小">{fileSize}</span>
            <span title="分辨率">{resolution}</span>
            <span title="图片类型">{fileType}</span>
          </>
        ) : (
          <></>
        )}
        <span>{totalPic}</span>
      </div>
      <div className="header_right">
        <button
          title="最小化"
          onClick={() => {
            // @ts-ignore
            window.appApi.hideApp();
          }}
        >
          <span className="iconfont icon-minus-bold"></span>
        </button>
        <button
          title="最大化"
          onClick={() => {
            // @ts-ignore
            window.appApi.maxApp();
          }}
        >
          <span className="iconfont icon-zuidahua"></span>
        </button>
        <button
          title="关闭"
          onClick={() => {
            // @ts-ignore
            window.appApi.quitApp();
          }}
        >
          <span className="iconfont icon-close-bold"></span>
        </button>
      </div>
    </div>
  );
};
export default Header;
