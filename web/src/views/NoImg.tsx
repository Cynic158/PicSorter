import "../styles/NoImg.scss";

const NoImg = ({
  noStr,
  setViewMode,
}: {
  noStr: string;
  setViewMode: Function;
}) => {
  return (
    <div className="noimg_container">
      <div className="tip_container">
        <span className="iconfont icon-survey"></span>
        <p>
          <span>当前文件夹内无{noStr}图片需要处理</span>
          <button
            onClick={async () => {
              // @ts-ignore
              const result = await window.appApi.openFolder("pic");
              if (result) {
                // 需要刷新
                setViewMode("");
              }
            }}
          >
            打开文件夹
          </button>
        </p>
      </div>
    </div>
  );
};
export default NoImg;
