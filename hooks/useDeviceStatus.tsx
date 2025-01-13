import { getWebSocket } from "@/app/dashboard/websocket";
import { updateDeviceAvailability } from "@/store/devices/UserDeviceSlice";
import { emitToastMessage } from "@/utils/toastFunc";
import { useState, useEffect } from "react";
import { useAppDispatch } from "./reduxHook";

interface DeviceStatus {
  id: string;
  status: boolean;
}

export const useDeviceStatus = () => {
  const [statuses, setStatuses] = useState<DeviceStatus[]>([]);
  const dispatch = useAppDispatch();
  useEffect(() => {
    const ws = getWebSocket();

    const timeoutMap: { [key: string]: NodeJS.Timeout } = {};

    const updateDeviceStatus = (id: string, status: boolean) => {
      setStatuses((prevStatuses) => {
        const existingStatus = prevStatuses.find((s) => s.id === id);
        if (existingStatus) {
          if (existingStatus.status !== status) {
          }
          return prevStatuses.map((s) => (s.id === id ? { ...s, status } : s));
        } else {
          return [...prevStatuses, { id, status }];
        }
      });
    };

    const handleWebSocketMessage = (event: MessageEvent) => {
      const message = JSON.parse(event.data);

      if (
        message.event === "ping_received" &&
        message?.source.type === "hardware"
      ) {
        const deviceId = message.source.id;

        updateDeviceStatus(deviceId, true);

        clearTimeout(timeoutMap[deviceId]);
        timeoutMap[deviceId] = setTimeout(() => {
          updateDeviceStatus(deviceId, false);
          dispatch(
            updateDeviceAvailability({ DeviceID: deviceId, status: false })
          );
        }, 30000);
      }
    };

    if (ws) {
      ws.onmessage = handleWebSocketMessage;
    }

    // return () => {
    //   if (ws) {
    //     ws.close();
    //   }
    //   Object.values(timeoutMap).forEach(clearTimeout);
    // };
  }, []);

  return statuses;
};
