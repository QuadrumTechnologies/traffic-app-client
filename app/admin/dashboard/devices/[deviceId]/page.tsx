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
import { formatRtcDate, formatRtcTime, getDeviceStatus } from "@/utils/misc";
import {
  addCurrentDeviceInfoData,
  addCurrentDeviceSignalData,
  addCurrentDeviceStateData,
  getUserDeviceInfoData,
  getUserDeviceStateData,
  updateDeviceAvailability,
} from "@/store/devices/UserDeviceSlice";
import { getWebSocket } from "@/app/dashboard/websocket";

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

function formatUnixTimestamp(unixTimestamp: number): string {
  const date = new Date(unixTimestamp * 1000);
  date.setHours(date.getHours() - 1);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");
  return `${day}-${month}-${year} ${hours}:${minutes}:${seconds}`;
}

const DeviceDetails: React.FC<DeviceDetailsProps> = ({ params }) => {
  const { deviceAvailability, currentDeviceInfoData, deviceActiveStateData } =
    useAppSelector((state) => state.userDevice);
  const [showAutoMode, setShowAutoMode] = useState<boolean>(
    deviceActiveStateData?.Auto ?? false
  );
  const dispatch = useAppDispatch();
  const statuses = useDeviceStatus();
  const { isIntersectionConfigurable } = useAppSelector(
    (state) => state.signalConfig
  );
  const deviceId = params.deviceId;
  const icon =
    getDeviceStatus(statuses, deviceId) ||
    (deviceAvailability.Status && deviceAvailability.DeviceID === deviceId)
      ? "ON"
      : "OFF";

  useEffect(() => {
    setShowAutoMode(deviceActiveStateData?.Auto ?? false);
  }, [deviceActiveStateData]);

  useEffect(() => {
    dispatch(setIsIntersectionConfigurable(false));
    dispatch(getUserDeviceStateData(deviceId));
    dispatch(getUserDeviceInfoData(deviceId));
  }, [dispatch, deviceId]);

  useEffect(() => {
    const socket = getWebSocket();
    let countdownInterval: ReturnType<typeof setInterval> | null = null;

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
        countdownInterval = null;
      }

      if (signalString.includes("A")) {
        dispatch(
          previewCreatedPatternPhase({ duration: timeLeft, signalString })
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
            previewCreatedPatternPhase({ duration: timeLeft, signalString })
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
          if (feedback.payload?.error) {
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
              })
            );
            emitToastMessage(
              feedback.payload?.message || "Could not fetch device info data",
              "error"
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
          if (feedback.payload?.error) {
            dispatch(
              addCurrentDeviceSignalData({
                Countdown: "",
                Phase: "",
                DeviceID: "",
              })
            );
            emitToastMessage(
              feedback.payload?.message || "Could not fetch device signal data",
              "error"
            );
          } else {
            startCountdown(feedback.payload.Countdown, feedback.payload.Phase);
            dispatch(addCurrentDeviceSignalData(feedback.payload));
          }
          break;

        case "state_feedback":
          if (feedback.payload?.error) {
            dispatch(
              addCurrentDeviceStateData({
                DeviceID: "",
                Auto: false,
                Power: false,
                Manual: false,
                Next: false,
                Hold: false,
                Reset: false,
                Restart: false,
              })
            );
            emitToastMessage(
              feedback.payload?.message || "Could not fetch device state data",
              "error"
            );
          } else {
            dispatch(addCurrentDeviceStateData(feedback.payload));
          }
          break;

        case "error":
          emitToastMessage(
            feedback.payload?.message || "An error occurred",
            "error"
          );
          break;

        default:
          console.log("Unhandled event type:", feedback.event);
      }

      dispatch(
        updateDeviceAvailability({
          DeviceID: feedback.payload?.DeviceID,
          Status: !feedback.payload?.error,
        })
      );
    };

    socket.addEventListener("message", handleDataFeedback);

    const sendRequests = () => {
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
    };

    if (socket.readyState === WebSocket.OPEN) {
      sendRequests();
    } else {
      socket.onopen = () => sendRequests();
    }

    return () => {
      socket.removeEventListener("message", handleDataFeedback);
      if (countdownInterval) {
        clearInterval(countdownInterval);
      }
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
    { iconName: "wifi", label: "WiFi Status", value: icon },
  ];

  const intersectionConfigItems: IntersectionConfigItem[] = [
    { label: "Name", value: currentDeviceInfoData?.JunctionId || "N/A" },
    { label: "Active Plan", value: currentDeviceInfoData?.Plan || "N/A" },
    { label: "Period", value: currentDeviceInfoData?.Period || "N/A" },
  ];

  const directions = ["North", "East", "West", "South"] as const;

  return (
    <section className="device">
      <div className="device__left">
        <FourWayIntersection editable={isIntersectionConfigurable} />
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
            userType="admin"
          />
        </div>
      </div>
    </section>
  );
};

export default DeviceDetails;
