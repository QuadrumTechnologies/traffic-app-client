import { emitToastMessage } from "@/utils/toastFunc";

let ws_socket: WebSocket | null = null;
let retryCount = 0;
const maxRetries = 5;

export const initializeWebSocket = () => {
  if (!ws_socket || ws_socket.readyState === WebSocket.CLOSED) {
    ws_socket = new WebSocket(`${process.env.NEXT_PUBLIC_BACKEND_WS}`);

    ws_socket.onopen = () => {
      console.log("WebSocket connection established");
      retryCount = 0;
      if (ws_socket?.readyState === WebSocket.OPEN) {
        ws_socket.send(
          JSON.stringify({
            event: "identify",
            clientType: "web_app",
          })
        );
      } else {
        console.error("WebSocket connection is not open.");
      }
    };

    ws_socket.onclose = () => {
      console.log("WebSocket connection closed");
      ws_socket = null;
      if (retryCount < maxRetries) {
        retryCount++;
        setTimeout(() => {
          emitToastMessage(
            `Retrying WebSocket connection (${retryCount}/${maxRetries})...`,
            "info"
          );
          initializeWebSocket();
        }, 5000 * retryCount);
      } else {
        emitToastMessage(
          "Failed to establish WebSocket connection after multiple attempts.",
          "error"
        );
      }
    };

    ws_socket.onerror = (error) => {
      console.log("WebSocket error:", error);
      emitToastMessage("WebSocket connection error occurred.", "error");
    };
  }

  return ws_socket;
};

export const getWebSocket = () => {
  if (!ws_socket || ws_socket.readyState !== WebSocket.OPEN) {
    console.warn(
      "WebSocket connection not established or is not open. Reinitializing..."
    );
    return initializeWebSocket();
  }
  return ws_socket;
};
