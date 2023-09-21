import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import "../styles/Warning.scss";

const Warning = ({
  warningState,
  warningTitle,
  warningStr,
  hideFunc,
  callback,
}: {
  warningState: boolean;
  warningTitle: string;
  warningStr: string;
  hideFunc: Function;
  callback: Function;
}) => {
  const [show, setShow] = useState(false);
  const [opacityState, setOpacityState] = useState(false);

  useEffect(() => {
    if (warningState) {
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
  }, [warningState]);

  return createPortal(
    <div
      className="warning_mask"
      style={{
        display: show ? "block" : "none",
        opacity: opacityState ? 1 : 0,
      }}
    >
      <div className="warning_container">
        <div className="warning_title">
          <span>{warningTitle}</span>
          <span
            onClick={() => {
              hideFunc();
            }}
            className="iconfont icon-close-bold"
          ></span>
        </div>
        <div className="warning_main">
          <p>{warningStr}</p>
          <button
            onClick={() => {
              callback();
            }}
          >
            <span className="iconfont icon-ashbin"></span>
            <span>确定</span>
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default Warning;
