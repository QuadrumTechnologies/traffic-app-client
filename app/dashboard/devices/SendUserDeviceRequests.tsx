"use client";

import { useAppDispatch } from "@/hooks/reduxHook";
import {
  getUserDevice,
  getUserPattern,
  getUserPhase,
} from "@/store/devices/UserDeviceSlice";
import React, { useEffect } from "react";
import { initializeWebSocket } from "../websocket";
import { emitToastMessage } from "@/utils/toastFunc";

interface SendUserDeviceRequestsProps {
  children: React.ReactNode;
}

const SendUserDeviceRequests: React.FC<SendUserDeviceRequestsProps> = ({
  children,
}) => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    (async () => {
      try {
        await Promise.all([
          dispatch(getUserDevice()).unwrap(),
          dispatch(getUserPhase()).unwrap(),
          dispatch(getUserPattern()).unwrap(),
        ]);
      } catch (error) {
        emitToastMessage("Failed to fetch initial device data.", "error");
      }
    })();
  }, [dispatch]);

  useEffect(() => {
    const ws = initializeWebSocket();
    return () => {
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
    };
  }, []);

  return <>{children}</>;
};

export default SendUserDeviceRequests;
