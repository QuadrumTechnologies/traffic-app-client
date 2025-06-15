"use client";

import { useRouter } from "next/navigation";
import { IoArrowBack } from "react-icons/io5";
import SendUserDeviceRequests from "./SendUserDeviceRequests";
import { useDeviceStatus } from "@/hooks/useDeviceStatus";
import { useEffect } from "react";
import {
  closeWebSocket,
  initializeWebSocket,
  sendIdentify,
} from "../websocket";

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const router = useRouter();
  useDeviceStatus();

  useEffect(() => {
    // Initialize WebSocket once when Layout mounts
    const ws = initializeWebSocket();

    const handleFocus = () => {
      if (ws && ws.readyState === WebSocket.OPEN) {
        sendIdentify();
      }
    };
    window.addEventListener("focus", handleFocus);

    return () => {
      window.removeEventListener("focus", handleFocus);
      closeWebSocket();
    };
  }, []);

  return (
    <SendUserDeviceRequests>
      <div>
        <button
          className="dashboard-back__button"
          type="button"
          onClick={() => router.back()}
        >
          <IoArrowBack />
          <span>Back</span>
        </button>
        {children}
      </div>
    </SendUserDeviceRequests>
  );
}
