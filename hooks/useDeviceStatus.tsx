import { getWebSocket } from "@/app/dashboard/websocket";
import {
  updateDeviceStatus,
  handleWsFeedback,
} from "@/store/devices/UserDeviceSlice";
import { emitToastMessage } from "@/utils/toastFunc";
import { useEffect, useRef } from "react";
import { useAppDispatch, useAppSelector } from "./reduxHook";
import { handleManualControlFeedback } from "@/store/signals/SignalConfigSlice";
import { GetItemFromLocalStorage } from "@/utils/localStorageFunc";

export const useDeviceStatus = () => {
  const dispatch = useAppDispatch();
  const timeoutMap = useRef<{ [key: string]: NodeJS.Timeout }>({}).current;
  const user = GetItemFromLocalStorage("user") || {};
  const userEmail = user.email || null;
  const isAdmin = user.isAdmin || false;
  const { devices, deviceStatuses } = useAppSelector(
    (state) => state.userDevice
  );
  const deviceIds = devices.map((device) => device.deviceId);

  useEffect(() => {
    const ws = getWebSocket();

    const updateDeviceStatusHandler = (
      id: string,
      status: boolean,
      lastSeen: string | null = null
    ) => {
      const existingStatus = deviceStatuses.find((s) => s.id === id);
      if (existingStatus && existingStatus.status !== status) {
        emitToastMessage(
          `Device ${id} is ${status ? "online" : "offline"}.`,
          "info"
        );
      } else if (!existingStatus && status) {
        emitToastMessage(`Device ${id} is online.`, "info");
      }
      // Check why the time
      dispatch(updateDeviceStatus({ id, status, lastSeen }));
    };

    const handleWebSocketMessage = (event: MessageEvent) => {
      try {
        const message = JSON.parse(event.data);

        if (
          message.event === "ping_received" &&
          message?.source.type === "hardware"
        ) {
          const deviceId = message.source.id;
          if (!isAdmin && userEmail && !deviceIds.includes(deviceId)) {
            return;
          }
          updateDeviceStatusHandler(deviceId, true, null);
          clearTimeout(timeoutMap[deviceId]);
          timeoutMap[deviceId] = setTimeout(() => {
            updateDeviceStatusHandler(
              deviceId,
              false,
              new Date().toISOString()
            );
          }, 30000);
        } else if (
          message.event === "device_status" &&
          message?.source.type === "hardware"
        ) {
          const deviceId = message.source.id;
          if (!isAdmin && userEmail && !deviceIds.includes(deviceId)) {
            return;
          }
          updateDeviceStatusHandler(
            deviceId,
            message.source.status,
            message.source.lastSeen
          );
          console.log(
            "Device status update:",
            deviceId,
            message.source.status,
            message.source.lastSeen
          );
        } else if (message.event === "error") {
          dispatch(
            handleWsFeedback({ event: "error", message: message.message })
          );
        } else if (message.event === "intersection_control_success") {
          dispatch(
            handleWsFeedback({
              event: "success",
              message: `Action ${message.action} set to ${message.value} successfully.`,
            })
          );
        } else if (message.event === "upload_request_success") {
          dispatch(
            handleWsFeedback({ event: "success", message: message.message })
          );
        } else if (message.event === "manual_control_success") {
          dispatch(
            handleManualControlFeedback({
              event: "success",
              message: message.message,
            })
          );
        }
      } catch (error) {
        console.error("Error parsing WebSocket message:", error);
      }
    };

    // Attach listener when socket is open or on open
    let openListener: (() => void) | null = null;
    const setupListener = () => {
      ws.addEventListener("message", handleWebSocketMessage);
    };

    if (ws.readyState === WebSocket.OPEN) {
      setupListener();
    } else {
      openListener = () => {
        setupListener();
      };
      ws.addEventListener("open", openListener);
    }

    return () => {
      // Clear timeouts
      Object.values(timeoutMap).forEach(clearTimeout);
      ws.removeEventListener("message", handleWebSocketMessage);
      if (openListener) {
        ws.removeEventListener("open", openListener);
      }
    };
  }, [dispatch, userEmail, isAdmin, deviceIds]);

  return deviceStatuses;
};
