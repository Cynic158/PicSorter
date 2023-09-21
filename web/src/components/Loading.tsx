import { useEffect, useState } from "react";
import "../styles/Loading.scss";

const Loading = ({ loadingState }: { loadingState: boolean }) => {
  const [show, setShow] = useState(false);
  const [opacityState, setOpacityState] = useState(false);

  useEffect(() => {
    if (loadingState) {
      setTimeout(() => {
        setOpacityState(true);
      }, 50);
      setShow(true);
    } else {
      setOpacityState(false);
      setTimeout(() => {
        setShow(false);
      }, 300);
    }
  }, [loadingState]);

  return (
    <div
      className="mask"
      style={{ display: show ? "flex" : "none", opacity: opacityState ? 1 : 0 }}
    >
      <span className="iconfont icon-loading"></span>
    </div>
  );
};

export default Loading;
