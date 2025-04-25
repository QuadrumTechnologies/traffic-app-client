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
  getDeviceStatus,
} from "@/utils/misc";
import {
  addCurrentDeviceInfoData,
  addCurrentDeviceSignalData,
  getUserDeviceInfoData,
  updateDeviceAvailability,
  addCurrentDeviceStateData,
  getUserDeviceStateData,
} from "@/store/devices/UserDeviceSlice";
import { getWebSocket } from "@/app/dashboard/websocket";

interface DeviceDetailsProps {
  params: any;
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
  const { deviceAvailability, currentDeviceInfoData, deviceActiveStateData } =
    useAppSelector((state) => state.userDevice);
  const [showAutoMode, setShowAutoMode] = useState<boolean>(
    deviceActiveStateData?.Auto
  );

  const dispatch = useAppDispatch();

  getWebSocket();

  const statuses = useDeviceStatus();

  const deviceId = params.deviceId;
  const icon =
    getDeviceStatus(statuses, deviceId) ||
    (deviceAvailability.Status && deviceAvailability.DeviceID === deviceId)
      ? "ON"
      : "OFF";

  const { isIntersectionConfigurable } = useAppSelector(
    (state) => state.signalConfig
  );

  useEffect(() => {
    setShowAutoMode(deviceActiveStateData?.Auto);
  }, [deviceActiveStateData]);

  useEffect(() => {
    dispatch(setIsIntersectionConfigurable(false));
    dispatch(getUserDeviceStateData(params.deviceId));
  }, [dispatch, isIntersectionConfigurable]);

  // Fetch Device Config Data
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
      let isBlink = timeLeft === 0 || initialDuration === "X";
      console.log(
        "Starting Countdown",
        initialDuration,
        timeLeft,
        signalString,
        isBlink
      );

      if (countdownInterval) {
        clearInterval(countdownInterval);
      }

      // Check for Amber signal
      if (signalString.includes("A")) {
        dispatch(
          previewCreatedPatternPhase({
            duration: timeLeft,
            signalString: signalString,
          })
        );
        dispatch(setSignalState());

        countdownInterval = setTimeout(() => {
          clearInterval(countdownInterval!);
          countdownInterval = null;
          dispatch(closePreviewCreatedPatternPhase());
        }, timeLeft * 1000); // Amber signal shown for `Countdown` seconds
        return;
      }

      if (isBlink) {
        dispatch(setSignalString(signalString));
        dispatch(setSignalState());
        return;
      }

      countdownInterval = setInterval(() => {
        // Handle Normal Signal
        if (timeLeft > 0) {
          timeLeft -= 1;
          dispatch(
            previewCreatedPatternPhase({
              duration: timeLeft,
              signalString: signalString,
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

      console.log("Feedback", feedback);

      // I will Set the status to off anytme I fetch the state and the device power is off
      dispatch(
        updateDeviceAvailability({
          DeviceID: feedback.payload.DeviceID,
          Status: true,
        })
      );
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
              })
            );
            emitToastMessage("Could not fetch device info data", "error");
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
            emitToastMessage("Could not fetch device signal data", "error");
          } else {
            console.log(
              "Current Phase and Countdown",
              feedback.payload.Countdown,
              feedback.payload.Phase
            );

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
                Manual: false,
                Next: false,
                Hold: false,
                Reset: false,
                Restart: false,
              })
            );
            emitToastMessage("Could not fetch device state data", "error");
          } else {
            dispatch(addCurrentDeviceStateData(feedback.payload));
          }
          break;

        default:
          console.log("Unhandled event type:", feedback.event);
      }
    };

    socket?.addEventListener("message", handleDataFeedback);

    return () => {
      if (countdownInterval) {
        clearInterval(countdownInterval);
      }
      socket?.removeEventListener("message", handleDataFeedback);
      dispatch(closePreviewCreatedPatternPhase());
    };
  }, [dispatch, deviceActiveStateData]);

  // Fetch Intersection Config Data
  useEffect(() => {
    dispatch(getUserDeviceInfoData(params.deviceId));

    // Fetch Device State Data
    const socket = getWebSocket();

    const sendStateMessage = () => {
      socket.send(
        JSON.stringify({
          event: "state_request",
          payload: {
            DeviceID: params.deviceId,
          },
        })
      );
    };

    const sendInfoMessage = () => {
      socket.send(
        JSON.stringify({
          event: "info_request",
          payload: {
            DeviceID: params.deviceId,
          },
        })
      );
    };

    if (socket.readyState === WebSocket.OPEN) {
      sendStateMessage();
      // sendInfoMessage();
    } else {
      socket.onopen = () => {
        sendStateMessage();
        // sendInfoMessage();
      };
    }
    console.log("Params", params.deviceId);
    dispatch(getUserDeviceStateData(params.deviceId));
    // dispatch(getUserDeviceInfoData(params.deviceId));

    return () => {
      if (socket) {
        socket.close();
      }
    };
  }, []);

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
      value: currentDeviceInfoData?.JunctionId || "Nill",
    },
    {
      label: "Active Plan",
      value: currentDeviceInfoData?.Plan || "Nill",
    },
    {
      label: "Period",
      value: currentDeviceInfoData?.Period || "Nill",
    },
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
                  {directions.map(
                    (dir) =>
                      currentDeviceInfoData?.[dir] && <th key={dir}>{dir}</th>
                  )}
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Battery [V]</td>
                  {directions.map(
                    (dir) =>
                      currentDeviceInfoData?.[dir] && (
                        <td
                          key={`${dir}-battery`}
                          className={
                            currentDeviceInfoData?.[dir]?.Bat === "0"
                              ? "red"
                              : ""
                          }
                        >
                          {currentDeviceInfoData?.[dir]?.Bat ?? "0"}
                        </td>
                      )
                  )}
                </tr>
                <tr>
                  <td>Temperature [°C]</td>
                  {directions.map(
                    (dir) =>
                      currentDeviceInfoData?.[dir] && (
                        <td
                          key={`${dir}-temperature`}
                          className={
                            currentDeviceInfoData?.[dir].Temp === "0"
                              ? "blue"
                              : ""
                          }
                        >
                          {currentDeviceInfoData?.[dir]?.Temp ?? "0"}
                        </td>
                      )
                  )}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <div className="device__right--bottom">
          <IntersectionConfiguration
            intersectionConfigItems={intersectionConfigItems}
            deviceId={params.deviceId}
          />
        </div>
      </div>
    </section>
  );
};

export default DeviceDetails;
