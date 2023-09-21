import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import "../styles/Message.scss";

const Message = ({
  messageState,
  messageStr,
  hideFunc,
}: {
  messageState: boolean;
  messageStr: string;
  hideFunc: Function;
}) => {
  const [show, setShow] = useState(false);
  const [opacityState, setOpacityState] = useState(false);

  useEffect(() => {
    if (messageState) {
      setTimeout(() => {
        setOpacityState(true);
      }, 50);
      setShow(true);
      setTimeout(() => {
        setOpacityState(false);
      }, 2050);
      setTimeout(() => {
        setShow(false);
        hideFunc();
      }, 2350);
    }
  }, [messageState]);

  return createPortal(
    <div
      className="message_container"
      style={{
        display: show ? "block" : "none",
        opacity: opacityState ? 1 : 0,
        top: opacityState ? "40px" : "32px",
      }}
    >
      <span className="message_str">{messageStr}</span>
    </div>,
    document.body
  );
};

export default Message;
