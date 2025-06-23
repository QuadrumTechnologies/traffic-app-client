// websocket.ts
import { emitToastMessage } from "@/utils/toastFunc";
import { GetItemFromLocalStorage } from "@/utils/localStorageFunc";

interface User {
  email?: string;
  isAdmin?: boolean;
  [key: string]: unknown;
}

interface IdentifyMessage {
  event: "identify";
  clientType: "web_app";
  userEmail: string | null;
  isAdmin: boolean;
}

// Singleton WebSocket instance and retry state
let ws_socket: WebSocket | null = null;
let retryCount = 0;
const maxRetries = 3;

const wsUrl: string =
  process.env.NEXT_PUBLIC_BACKEND_WS || "ws://localhost:3000/ws";

export const sendIdentify = () => {
  if (!ws_socket || ws_socket.readyState !== WebSocket.OPEN) {
    console.warn("Cannot send identify: socket not open");
    return;
  }
  let user: User = {};
  let adminUser: User = {};
  let isAdmin = false;
  try {
    user = GetItemFromLocalStorage("user") || {};
    adminUser = GetItemFromLocalStorage("adminUser") || {};
    if (typeof window !== "undefined") {
      isAdmin = window.location.pathname.startsWith("/admin");
    }
  } catch (err) {
    emitToastMessage("Failed to access user data.", "error");
  }
  const loggedInUser: User = isAdmin ? adminUser : user;
  const identifyMessage: IdentifyMessage = {
    event: "identify",
    clientType: "web_app",
    userEmail: loggedInUser.email || null,
    isAdmin,
  };
  ws_socket.send(JSON.stringify(identifyMessage));
};

export const initializeWebSocket = (): WebSocket => {
  if (ws_socket) {
    if (ws_socket.readyState === WebSocket.OPEN) {
      console.log("WebSocket already open; re-sending identify");
      sendIdentify();
      return ws_socket;
    }
    if (ws_socket.readyState === WebSocket.CONNECTING) {
      const prevOnOpen = ws_socket.onopen;
      ws_socket.onopen = (event) => {
        if (prevOnOpen && ws_socket) prevOnOpen.call(ws_socket, event);
        sendIdentify();
      };
      return ws_socket;
    }
  }

  if (!wsUrl) {
    console.error("WebSocket URL is undefined. Check .env configuration.");
    emitToastMessage("WebSocket URL is not configured.", "error");
    throw new Error("WebSocket URL is undefined");
  }

  try {
    ws_socket = new WebSocket(wsUrl);

    // Timeout if onopen doesn't fire
    const openTimeout = setTimeout(() => {
      if (ws_socket && ws_socket.readyState !== WebSocket.OPEN) {
        ws_socket.close();
        ws_socket = null;
      }
    }, 5000);

    ws_socket.onopen = () => {
      clearTimeout(openTimeout);
      console.log(
        `WebSocket connection established, readyState: ${ws_socket?.readyState}`
      );
      retryCount = 0;
      sendIdentify();
    };

    ws_socket.onclose = (event: CloseEvent) => {
      console.log("WebSocket connection closed:", {
        code: event.code,
        reason: event.reason,
        wasClean: event.wasClean,
      });
      ws_socket = null;
      if (retryCount < maxRetries) {
        retryCount++;
        const delay = 5000 * retryCount;

        setTimeout(() => {
          emitToastMessage(
            `Retrying WebSocket connection (${retryCount}/${maxRetries})...`,
            "info"
          );
          initializeWebSocket();
        }, delay);
      } else {
        emitToastMessage(
          "Failed to establish WebSocket connection after multiple attempts.",
          "error"
        );
      }
    };

    ws_socket.onerror = (error: Event) => {
      emitToastMessage("WebSocket connection error occurred.", "error");
      ws_socket?.close();
      ws_socket = null;
    };

    return ws_socket;
  } catch (error) {
    ws_socket = null;
    emitToastMessage("Failed to create WebSocket connection.", "error");
    throw new Error(`Failed to create WebSocket: ${error}`);
  }
};

// Return the singleton, initializing if needed
export const getWebSocket = (): WebSocket => {
  const ws =
    ws_socket && ws_socket.readyState === WebSocket.OPEN
      ? ws_socket
      : initializeWebSocket();
  if (!ws) {
    throw new Error("WebSocket is null");
  }
  return ws;
};

// Close and reset the singleton
export const closeWebSocket = (): void => {
  if (ws_socket && ws_socket.readyState !== WebSocket.CLOSED) {
    ws_socket.close(1000, "Client requested close");
    ws_socket = null;
    retryCount = 0;
  }
};
