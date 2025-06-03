import { getWebSocket } from "@/app/dashboard/websocket";
import { updateDeviceAvailability } from "@/store/devices/UserDeviceSlice";
import { emitToastMessage } from "@/utils/toastFunc";
import { useState, useEffect } from "react";
import { useAppDispatch } from "./reduxHook";

interface DeviceStatus {
  id: string;
  status: boolean;
}
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
      dispatch(updateDeviceAvailability({ DeviceID: id, status }));
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
            updateDeviceAvailability({ DeviceID: deviceId, status: false })
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
