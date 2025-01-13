import { toast } from "react-toastify";

export const emitToastMessage = (
  message: string,
  type: "error" | "success"
) => {
  if (type === "error") {
    return toast(message, {
      position: "top-right",
      autoClose: 15000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "white",
      style: {
        background: "#e45351",
        color: "#f7f7f7",
        fontSize: "1.5rem",
        letterSpacing: "0.1rem",
        lineHeight: "1.5",
        padding: ".8rem 1rem",
      },
      progressStyle: {
        background: "#fff",
      },
    });
  }

  return toast(message, {
    position: "top-right",
    autoClose: 15000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
    theme: "dark",
    style: {
      background: "#3b3302",
      color: "#f7f7f7",
      fontSize: "1.5rem",
      letterSpacing: "0.1rem",
      lineHeight: "1.5",
      padding: ".8rem 1rem",
    },
    progressStyle: {
      background: "#fff",
    },
  });
};
