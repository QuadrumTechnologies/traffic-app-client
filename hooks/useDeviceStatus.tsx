import { getWebSocket } from "@/app/dashboard/websocket";
import {
  updateDeviceAvailability,
  handleWsFeedback,
} from "@/store/devices/UserDeviceSlice";
import { emitToastMessage } from "@/utils/toastFunc";
import { useState, useEffect } from "react";
import { useAppDispatch } from "./reduxHook";
import { handleManualControlFeedback } from "@/store/signals/SignalConfigSlice";

interface DeviceStatus {
  id: string;
  status: boolean;
  lastSeen: string | null;
}

export const useDeviceStatus = () => {
  const [statuses, setStatuses] = useState<DeviceStatus[]>([]);
  const dispatch = useAppDispatch();
  const timeoutMap: { [key: string]: NodeJS.Timeout } = {};

  useEffect(() => {
    const ws = getWebSocket();

    const updateDeviceStatus = (
      id: string,
      status: boolean,
      lastSeen: string | null = null
    ) => {
      setStatuses((prevStatuses) => {
        const existingStatus = prevStatuses.find((s) => s.id === id);
        if (existingStatus) {
          return prevStatuses.map((s) =>
            s.id === id ? { ...s, status, lastSeen } : s
          );
        } else {
          return [...prevStatuses, { id, status, lastSeen }];
        }
      });
      dispatch(updateDeviceAvailability({ DeviceID: id, Status: status }));
      emitToastMessage(
        `Device ${id} is ${status ? "online" : "offline"}.`,
        "info"
      );
    };

    const handleWebSocketMessage = (event: MessageEvent) => {
      const message = JSON.parse(event.data);

      if (
        message.event === "ping_received" &&
        message?.source.type === "hardware"
      ) {
        const deviceId = message.source.id;
        updateDeviceStatus(deviceId, true, null);

        clearTimeout(timeoutMap[deviceId]);
        timeoutMap[deviceId] = setTimeout(() => {
          updateDeviceStatus(deviceId, false, new Date().toISOString());
          dispatch(
            updateDeviceAvailability({ DeviceID: deviceId, Status: false })
          );
        }, 30000);
      } else if (
        message.event === "device_status" &&
        message?.source.type === "hardware"
      ) {
        updateDeviceStatus(
          message.source.id,
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
  }, [dispatch]);

  return statuses;
};
