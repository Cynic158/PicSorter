import { useEffect, useState, ChangeEvent, KeyboardEvent } from "react";
import { createPortal } from "react-dom";
import "../styles/Dialog.scss";

const Dialog = ({
  dialogState,
  dialogTitle,
  hideFunc,
  callback,
  sortName,
}: {
  dialogState: boolean;
  dialogTitle: string;
  hideFunc: Function;
  callback: Function;
  sortName: string;
}) => {
  const [show, setShow] = useState(false);
  const [sortStr, setSortStr] = useState("");
  const [opacityState, setOpacityState] = useState(false);

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    setSortStr(event.target.value);
  };

  const handleEnterKey = (event: KeyboardEvent) => {
    if (event.key === "Enter") {
      callback(sortStr);
    }
  };

  useEffect(() => {
    if (dialogState) {
      setTimeout(() => {
        setOpacityState(true);
      }, 50);
      setShow(true);
      setSortStr(sortName);

      // 添加键盘事件监听
      // @ts-ignore
      window.addEventListener("keyup", handleEnterKey);
    } else {
      setOpacityState(false);
      setTimeout(() => {
        setShow(false);
      }, 300);

      // 移除键盘事件监听
      // @ts-ignore
      window.removeEventListener("keyup", handleEnterKey);
    }

    return () => {
      // 移除键盘事件监听
      // @ts-ignore
      window.removeEventListener("keyup", handleEnterKey);
    };
  }, [dialogState]);

  return createPortal(
    <div
      className="dialog_mask"
      style={{
        display: show ? "block" : "none",
        opacity: opacityState ? 1 : 0,
      }}
    >
      <div className="dialog_container">
        <div className="dialog_title">
          <span>{dialogTitle}</span>
          <span
            onClick={() => {
              hideFunc();
            }}
            className="iconfont icon-close-bold"
          ></span>
        </div>
        <div className="dialog_main">
          <input
            type="text"
            placeholder="键入新分类名称"
            spellCheck="false"
            value={sortStr}
            onChange={handleChange}
          />
          <button
            onClick={() => {
              callback(sortStr);
            }}
          >
            <span className="iconfont icon-select-bold"></span>
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default Dialog;
