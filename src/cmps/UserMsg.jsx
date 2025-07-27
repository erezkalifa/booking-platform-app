import { useEffect, useState } from "react";
import { eventBusService } from "../services/event-bus.service.js";
import "../assets/styles/userMsg.css";

export function UserMsg() {
  const [msg, setMsg] = useState(null);
  const [isHiding, setIsHiding] = useState(false);

  useEffect(() => {
    const unsubscribe = eventBusService.on("show-user-msg", (msg) => {
      setIsHiding(false);
      setMsg(msg);
      setTimeout(() => {
        onCloseMsg();
      }, 3000);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  function onCloseMsg() {
    setIsHiding(true);
    setTimeout(() => {
      setMsg(null);
      setIsHiding(false);
    }, 300); // Match animation duration
  }

  if (!msg) return null;

  return (
    <section className={`user-msg ${msg.type} ${isHiding ? "hide" : ""}`}>
      <p>{msg.txt}</p>
      <button onClick={onCloseMsg}></button>
    </section>
  );
}
