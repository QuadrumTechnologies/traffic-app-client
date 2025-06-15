import { emitToastMessage } from "@/utils/toastFunc";
import { GetItemFromLocalStorage } from "@/utils/localStorageFunc";

// Define types for user and adminUser objects
interface User {
  email?: string;
  isAdmin?: boolean;
  [key: string]: unknown;
}

// Define type for the identify message payload
interface IdentifyMessage {
  event: "identify";
  clientType: "web_app";
  userEmail: string | null;
  isAdmin: boolean;
}

// Singleton WebSocket instance
let ws_socket: WebSocket | null = null;
let retryCount: number = 0;
const maxRetries: number = 5;

// WebSocket URL with fallback
const wsUrl: string =
  process.env.NEXT_PUBLIC_BACKEND_WS ||
  "wss://traffic-api.quadrumtechnologies.com/ws";

export const initializeWebSocket = (): WebSocket => {
  // Prevent reinitialization if WebSocket is CONNECTING or OPEN
  if (
    ws_socket &&
    (ws_socket.readyState === WebSocket.CONNECTING ||
      ws_socket.readyState === WebSocket.OPEN)
  ) {
    console.log(
      `WebSocket already initialized, readyState: ${ws_socket.readyState}`
    );
    return ws_socket;
  }

  // Validate WebSocket URL
  if (!wsUrl) {
    console.error("WebSocket URL is undefined. Check .env configuration.");
    emitToastMessage("WebSocket URL is not configured.", "error");
    throw new Error("WebSocket URL is undefined");
  }

  console.log(`Initializing WebSocket with URL: ${wsUrl}`);

  try {
    ws_socket = new WebSocket(wsUrl);

    // Set timeout to detect if onopen doesn't fire
    const openTimeout = setTimeout(() => {
      if (ws_socket && ws_socket.readyState !== WebSocket.OPEN) {
        console.error(
          `WebSocket did not open within 5 seconds, readyState: ${ws_socket.readyState}`
        );
        ws_socket.close();
        ws_socket = null;
      }
    }, 5000);

    ws_socket.onopen = () => {
      clearTimeout(openTimeout);
      console.log(
        `WebSocket connection established, readyState: ${
          ws_socket ? ws_socket.readyState : "null"
        }`
      );
      retryCount = 0;

      if (ws_socket?.readyState === WebSocket.OPEN) {
        let user: User = {};
        let adminUser: User = {};
        let isAdmin: boolean = false;

        try {
          user = GetItemFromLocalStorage("user") || {};
          adminUser = GetItemFromLocalStorage("adminUser") || {};
          if (typeof window !== "undefined") {
            isAdmin = window.location.pathname.startsWith("/admin");
          }
        } catch (error) {
          console.error("Error accessing localStorage:", error);
          emitToastMessage("Failed to access user data.", "error");
        }

        const loggedInUser: User = isAdmin ? adminUser : user;
        const identifyMessage: IdentifyMessage = {
          event: "identify",
          clientType: "web_app",
          userEmail: loggedInUser.email || null,
          isAdmin,
        };

        console.log("Sending identify event with user:", loggedInUser);
        ws_socket.send(JSON.stringify(identifyMessage));
        console.log("Sent identify message:", identifyMessage);
      } else {
        console.error(
          `WebSocket connection is not open, readyState: ${
            ws_socket ? ws_socket.readyState : "null"
          }`
        );
      }
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
        console.log(
          `Retrying WebSocket connection (${retryCount}/${maxRetries}) in ${delay}ms...`
        );
        setTimeout(() => {
          emitToastMessage(
            `Retrying WebSocket connection (${retryCount}/${maxRetries})...`,
            "info"
          );
          initializeWebSocket();
        }, delay);
      } else {
        console.error("Max WebSocket retry attempts reached.");
        emitToastMessage(
          "Failed to establish WebSocket connection after multiple attempts.",
          "error"
        );
      }
    };

    ws_socket.onerror = (error: Event) => {
      console.error("WebSocket error:", error);
      emitToastMessage("WebSocket connection error occurred.", "error");
      ws_socket?.close();
      ws_socket = null;
    };

    return ws_socket;
  } catch (error) {
    console.error("Error creating WebSocket:", error);
    ws_socket = null;
    emitToastMessage("Failed to create WebSocket connection.", "error");
    throw new Error(`Failed to create WebSocket: ${error}`);
  }
};

export const getWebSocket = (): WebSocket => {
  const ws =
    ws_socket && ws_socket.readyState === WebSocket.OPEN
      ? ws_socket
      : initializeWebSocket();
  if (!ws) {
    console.error("WebSocket initialization failed, ws is null");
    throw new Error("WebSocket is null");
  }
  console.log(`Returning WebSocket, readyState: ${ws.readyState}`);
  return ws;
};

export const closeWebSocket = (): void => {
  if (ws_socket && ws_socket.readyState !== WebSocket.CLOSED) {
    console.log("Closing WebSocket connection");
    ws_socket.close(1000, "Client requested close");
    ws_socket = null;
    retryCount = 0;
  }
};
