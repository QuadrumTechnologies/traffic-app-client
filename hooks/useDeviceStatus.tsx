import { getWebSocket } from "@/app/dashboard/websocket";
import {
  updateDeviceAvailability,
  handleWsFeedback,
} from "@/store/devices/UserDeviceSlice";
import { emitToastMessage } from "@/utils/toastFunc";
import { useState, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "./reduxHook";
import { handleManualControlFeedback } from "@/store/signals/SignalConfigSlice";
import { GetItemFromLocalStorage } from "@/utils/localStorageFunc";

interface DeviceStatus {
  id: string;
  status: boolean;
  lastSeen: string | null;
}

export const useDeviceStatus = () => {
  const [statuses, setStatuses] = useState<DeviceStatus[]>([]);
  const dispatch = useAppDispatch();
  const timeoutMap: { [key: string]: NodeJS.Timeout } = {};
  const user = GetItemFromLocalStorage("user") || {};
  const userEmail = user.email || null;
  const isAdmin = user.isAdmin || false;
  const { devices } = useAppSelector((state) => state.userDevice);
  const deviceIds = devices.map((device) => device.deviceId);

  useEffect(() => {
    const ws = getWebSocket();

    const updateDeviceStatus = (
      id: string,
      status: boolean,
      lastSeen: string | null = null
    ) => {
      setStatuses((prevStatuses) => {
        const existingStatus = prevStatuses.find((s) => s.id === id);
        const newStatus = { id, status, lastSeen };
        console.log("Updating device status:", newStatus, existingStatus);

        // Only emit toast if status has changed
        if (existingStatus && existingStatus.status !== status) {
          console.log(
            "Status change detected:",
            existingStatus.status,
            "->",
            status
          );
          emitToastMessage(
            `Device ${id} is ${status ? "online" : "offline"}.`,
            "info"
          );
        } else if (!existingStatus && status) {
          console.log("New device online:", id);
          emitToastMessage(`Device ${id} is online.`, "info");
        }

        if (existingStatus) {
          console.log("Updating existing status for device:", id);
          console.log("Previous statuses:", prevStatuses);
          return prevStatuses.map((s) => (s.id === id ? newStatus : s));
        } else {
          console.log("Adding new status for device:", id);
          console.log("Previous statuses:", prevStatuses);
          return [...prevStatuses, newStatus];
        }
      });

      dispatch(updateDeviceAvailability({ DeviceID: id, Status: status }));
    };

    const handleWebSocketMessage = (event: MessageEvent) => {
      const message = JSON.parse(event.data);

      if (
        message.event === "ping_received" &&
        message?.source.type === "hardware"
      ) {
        const deviceId = message.source.id;

        console.log("Ping received for device:", deviceId, deviceIds);

        // Skip if not admin and device not in user's devices
        if (!isAdmin && userEmail && !deviceIds.includes(deviceId)) {
          return;
        }

        updateDeviceStatus(deviceId, true, null);

        clearTimeout(timeoutMap[deviceId]);
        timeoutMap[deviceId] = setTimeout(() => {
          updateDeviceStatus(deviceId, false, new Date().toISOString());
        }, 30000);
      } else if (
        message.event === "device_status" &&
        message?.source.type === "hardware"
      ) {
        const deviceId = message.source.id;

        // Skip if not admin and device not in user's devices
        if (!isAdmin && userEmail && !deviceIds.includes(deviceId)) {
          return;
        }
        console.log("Device status update received:", message);

        updateDeviceStatus(
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
    };

    if (ws) {
      ws.onmessage = handleWebSocketMessage;
    }

    return () => {
      Object.values(timeoutMap).forEach(clearTimeout);
    };
  }, [dispatch, userEmail, isAdmin, deviceIds]);

  return statuses;
};
