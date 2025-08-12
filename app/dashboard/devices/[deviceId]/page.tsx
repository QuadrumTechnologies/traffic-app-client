"use client";

import DeviceConfiguration from "@/components/Device/DeviceConfiguration";
import IntersectionConfiguration from "@/components/Device/IntersectionConfiguration";
import FourWayIntersection from "@/components/IntersectionComponent/FourWayIntersection";
import { useAppDispatch, useAppSelector } from "@/hooks/reduxHook";
import {
  closePreviewCreatedPatternPhase,
  previewCreatedPatternPhase,
  setIsIntersectionConfigurable,
  setSignalState,
  setSignalString,
} from "@/store/signals/SignalConfigSlice";
import { useEffect, useState } from "react";
import { emitToastMessage } from "@/utils/toastFunc";
import { useDeviceStatus } from "@/hooks/useDeviceStatus";
import {
  formatRtcDate,
  formatRtcTime,
  formatUnixTimestamp,
} from "@/utils/misc";
import {
  addCurrentDeviceInfoData,
  addCurrentDeviceSignalData,
  getUserDeviceInfoData,
  addCurrentDeviceStateData,
  getUserDeviceStateData,
} from "@/store/devices/UserDeviceSlice";
import { getWebSocket } from "@/app/dashboard/websocket";
import { totalmem } from "os";

interface DeviceDetailsProps {
  params: { deviceId: string };
}

export interface DeviceConfigItem {
  iconName: string;
  label: string;
  value: string;
}

export interface IntersectionConfigItem {
  label: string;
  value: string;
}

const DeviceDetails: React.FC<DeviceDetailsProps> = ({ params }) => {
  const { deviceStatuses, currentDeviceInfoData, deviceActiveStateData } =
    useAppSelector((state) => state.userDevice);
  console.log("From Device Page", deviceActiveStateData, currentDeviceInfoData);

  const { isIntersectionConfigurable } = useAppSelector(
    (state) => state.signalConfig
  );
  const [showAutoMode, setShowAutoMode] = useState<boolean>(
    deviceActiveStateData?.Auto || false
  );

  const dispatch = useAppDispatch();
  useDeviceStatus();
  const deviceId = params.deviceId;

  const deviceStatus = deviceStatuses.find((status) => status.id === deviceId);
  const icon = deviceStatus?.status ? "ON" : "OFF";

  useEffect(() => {
    setShowAutoMode(deviceActiveStateData?.Auto);
  }, [deviceActiveStateData]);

  useEffect(() => {
    dispatch(setIsIntersectionConfigurable(false));
    dispatch(getUserDeviceStateData(deviceId));
    dispatch(getUserDeviceInfoData(deviceId));
  }, [dispatch, deviceId]);

  useEffect(() => {
    const socket = getWebSocket();
    let countdownInterval: NodeJS.Timeout | null = null;

    const startCountdown = (
      initialDuration: number | string,
      signalString: string
    ) => {
      let timeLeft =
        typeof initialDuration === "string"
          ? parseInt(initialDuration, 10)
          : initialDuration;
      const isBlink = timeLeft === 0 || initialDuration === "X";

      if (countdownInterval) {
        clearInterval(countdownInterval);
      }

      if (signalString.includes("A")) {
        dispatch(
          previewCreatedPatternPhase({
            duration: timeLeft,
            signalString,
          })
        );
        dispatch(setSignalState());

        countdownInterval = setTimeout(() => {
          clearInterval(countdownInterval!);
          countdownInterval = null;
          dispatch(closePreviewCreatedPatternPhase());
        }, timeLeft * 1000);
        return;
      }

      if (isBlink) {
        dispatch(setSignalString(signalString));
        dispatch(setSignalState());
        return;
      }

      countdownInterval = setInterval(() => {
        if (timeLeft > 0) {
          timeLeft -= 1;
          dispatch(
            previewCreatedPatternPhase({
              duration: timeLeft,
              signalString,
            })
          );
          dispatch(setSignalState());
        } else {
          clearInterval(countdownInterval!);
          countdownInterval = null;
          dispatch(closePreviewCreatedPatternPhase());
        }
      }, 1000);
    };

    const handleDataFeedback = (event: MessageEvent) => {
      const feedback = JSON.parse(event.data);
      if (feedback.event === "ping_received") return;

      if (feedback.payload?.DeviceID !== deviceId) return;

      switch (feedback.event) {
        case "info_feedback":
          if (feedback.payload.error) {
            dispatch(
              addCurrentDeviceInfoData({
                North: { Bat: "", Temp: "" },
                East: { Bat: "", Temp: "" },
                West: { Bat: "", Temp: "" },
                South: { Bat: "", Temp: "" },
                Rtc: "",
                Plan: "",
                Period: "",
                JunctionId: "",
                JunctionPassword: "",
                DeviceID: "",
                CommunicationFrequency: "",
                CommunicationChannel: "",
              })
            );
          } else {
            dispatch(addCurrentDeviceInfoData(feedback.payload));
          }
          break;

        case "sign_feedback":
          if (!showAutoMode) return;
          if (countdownInterval) {
            clearInterval(countdownInterval);
            countdownInterval = null;
          }

          if (feedback.payload.error) {
            dispatch(
              addCurrentDeviceSignalData({
                Countdown: "",
                Phase: "",
                DeviceID: "",
              })
            );
          } else {
            startCountdown(feedback.payload.Countdown, feedback.payload.Phase);
            dispatch(addCurrentDeviceSignalData(feedback.payload));
          }
          break;

        case "state_feedback":
          if (feedback.payload.error) {
            dispatch(
              addCurrentDeviceStateData({
                DeviceID: "",
                Auto: false,
                Power: false,
                Next: false,
                Hold: false,
                Reset: false,
                Restart: false,
                SignalLevel: 20,
                ErrorFlash: false,
                SignalConfig: "",
              })
            );
          } else {
            dispatch(addCurrentDeviceStateData(feedback.payload));
          }
          break;

        default:
          emitToastMessage(`Unhandled event type:1${feedback.event}`, "error");
      }
    };

    socket?.addEventListener("message", handleDataFeedback);

    const sendRequests = () => {
      if (socket.readyState === WebSocket.OPEN) {
        socket.send(
          JSON.stringify({
            event: "state_request",
            payload: { DeviceID: deviceId },
          })
        );
        socket.send(
          JSON.stringify({
            event: "info_request",
            payload: { DeviceID: deviceId },
          })
        );
      }
    };

    if (socket.readyState === WebSocket.OPEN) {
      sendRequests();
    } else {
      socket.onopen = () => sendRequests();
    }

    return () => {
      if (countdownInterval) {
        clearInterval(countdownInterval);
      }
      socket?.removeEventListener("message", handleDataFeedback);
      dispatch(closePreviewCreatedPatternPhase());
    };
  }, [dispatch, deviceId, showAutoMode]);

  const deviceConfigItems: DeviceConfigItem[] = [
    {
      iconName: "calendar",
      label: "Date",
      value: formatRtcDate(formatUnixTimestamp(+currentDeviceInfoData?.Rtc)),
    },
    {
      iconName: "clock",
      label: "Time",
      value: formatRtcTime(formatUnixTimestamp(+currentDeviceInfoData?.Rtc)),
    },
    {
      iconName: "wifi",
      label: "WiFi Status",
      value: icon,
    },
  ];

  const intersectionConfigItems: IntersectionConfigItem[] = [
    {
      label: "Name",
      value: currentDeviceInfoData?.JunctionId || "N/A",
    },
    {
      label: "Active Plan",
      value: currentDeviceInfoData?.Plan || "N/A",
    },
    {
      label: "Period",
      value: currentDeviceInfoData?.Period || "N/A",
    },
  ];

  const directions = ["North", "East", "West", "South"] as const;

  return (
    <section className="device">
      <div className="device__left">
        <FourWayIntersection editable={isIntersectionConfigurable} />
        <div className="intersectionConfiguration__commands">
          <IntersectionConfiguration
            intersectionConfigItems={intersectionConfigItems}
            deviceId={deviceId}
            showCommandsOnly={true}
          />
        </div>
      </div>
      <div className="device__right">
        <div className="device__right--top">
          <DeviceConfiguration
            deviceConfigItems={deviceConfigItems}
            deviceId={deviceId}
          />
          <div className="device-table">
            <table>
              <thead>
                <tr>
                  <th>Parameters/Device ID</th>
                  {directions.map((dir) => (
                    <th key={dir}>{dir}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Battery [V]</td>
                  {directions.map((dir) => (
                    <td
                      key={`${dir}-battery`}
                      className={
                        currentDeviceInfoData?.[dir]?.Bat === "0" ? "red" : ""
                      }
                    >
                      {currentDeviceInfoData?.[dir]?.Bat ?? "N/A"}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td>Temperature [°C]</td>
                  {directions.map((dir) => (
                    <td
                      key={`${dir}-temperature`}
                      className={
                        currentDeviceInfoData?.[dir]?.Temp === "0" ? "blue" : ""
                      }
                    >
                      {currentDeviceInfoData?.[dir]?.Temp ?? "N/A"}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <div className="device__right--bottom">
          <IntersectionConfiguration
            intersectionConfigItems={intersectionConfigItems}
            deviceId={deviceId}
            showCommandsOnly={false}
          />
        </div>
      </div>
    </section>
  );
};

export default DeviceDetails;
