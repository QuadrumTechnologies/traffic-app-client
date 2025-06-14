"use client";

import { initializeWebSocket } from "@/app/dashboard/websocket";
import { useAppDispatch } from "@/hooks/reduxHook";
import { getAdminDevice } from "@/store/devices/AdminDeviceSlice";
import { deviceTypes } from "@/utils/deviceTypes";
import { GetItemFromLocalStorage } from "@/utils/localStorageFunc";
import { emitToastMessage } from "@/utils/toastFunc";
import React, { useEffect } from "react";

interface SendAdminUserDeviceRequestsProps {
  children: React.ReactNode;
}

const SendAdminUserDeviceRequests: React.FC<
  SendAdminUserDeviceRequestsProps
> = ({ children }) => {
  const dispatch = useAppDispatch();

  const adminUser = GetItemFromLocalStorage("adminUser");
  const deviceType = deviceTypes.find(
    (dev) => dev.department === adminUser?.department
  );

  useEffect(() => {
    let socket: WebSocket | null = null;

    (async () => {
      try {
        if (deviceType) {
          await dispatch(getAdminDevice(deviceType)).unwrap();
        }
        socket = initializeWebSocket();
      } catch (error: any) {
        const message =
          typeof error === "string"
            ? error
            : error?.message || "Failed to fetch initial device data.";
        emitToastMessage(message, "error");
      }
    })();

    return () => {
      if (socket && socket.readyState === WebSocket.OPEN) {
        socket.close();
      }
    };
  }, [dispatch, deviceType]);

  return <>{children}</>;
};

export default SendAdminUserDeviceRequests;
