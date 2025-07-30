"use client";

import { useFormik } from "formik";
import * as Yup from "yup";
import { useEffect, useState } from "react";
import { IntersectionConfigItem } from "@/app/dashboard/devices/[deviceId]/page";
import { useRouter, usePathname, useParams } from "next/navigation";
import IntersectionConfigurationItem from "./IntersectionConfigurationItem";
import { useAppDispatch, useAppSelector } from "@/hooks/reduxHook";
import {
  closePreviewCreatedPatternPhase,
  setIsIntersectionConfigurable,
  setManualMode,
  setSignalStringToAllRed,
  setSignalStringToAllAmber,
  setSignalStringToAllBlank,
  setSignalState,
} from "@/store/signals/SignalConfigSlice";
import { getWebSocket } from "@/app/dashboard/websocket";
import HttpRequest from "@/store/services/HttpRequest";
import {
  GetItemFromLocalStorage,
  SetItemToLocalStorage,
} from "@/utils/localStorageFunc";
import { emitToastMessage } from "@/utils/toastFunc";
import { Signal } from "../IntersectionComponent/Intersection";
import { getUserDeviceStateData } from "@/store/devices/UserDeviceSlice";
import Button from "../UI/Button/Button";

interface DeviceConfigurationProps {
  intersectionConfigItems: IntersectionConfigItem[];
  deviceId: string;
  userType?: string;
  showCommandsOnly?: boolean;
}

const IntersectionConfiguration: React.FC<DeviceConfigurationProps> = ({
  intersectionConfigItems,
  deviceId,
  userType,
  showCommandsOnly = false,
}) => {
  const { devices, deviceActiveStateData, currentDeviceInfoData } =
    useAppSelector((state) => state.userDevice);
  const { landingPageSignals } = useAppSelector((state) => state.signalConfig);
  const dispatch = useAppDispatch();
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();
  const email = GetItemFromLocalStorage("user")?.email;

  const [showManualMoreConfig, setShowManualMoreConfig] =
    useState<boolean>(false);
  const [initialSignalStrings, setInitialSignalStrings] = useState("");

  const handleRequest = async (action: string) => {
    console.log("Action requested:", action);
    const device = devices?.find((device) => device.deviceId === deviceId);
    if (!device) {
      emitToastMessage("Device not found.", "error");
      return;
    }
    if (userType === "admin" && !device?.userDevice?.allowAdminSupport) {
      emitToastMessage(
        "Admin support is not(enabled for this device.",
        "error"
      );
      return;
    }

    const isPasswordVerified = GetItemFromLocalStorage("isPasswordVerified");
    if (!isPasswordVerified || Date.now() - isPasswordVerified.time > 180000) {
      const password = prompt("Please enter your password to proceed");
      if (!password) {
        emitToastMessage("Password verification cancelled.", "info");
        return;
      }
      const reason = `Device ${deviceId} ${action} action requested by user`;
      try {
        const endpoint = pathname.includes("admin")
          ? "/admin/confirm-password"
          : "/confirm-password";
        await HttpRequest.post(endpoint, {
          email,
          reason,
          password,
        });
        SetItemToLocalStorage("isPasswordVerified", {
          isPasswordVerified: true,
          time: Date.now(),
        });
      } catch (error: any) {
        const message = error?.response?.data?.message || `Request failed`;
        emitToastMessage(message, "error");
        return;
      }
    }

    if (action === "Manual") {
      dispatch(setManualMode(true));
      setShowManualMoreConfig(true);
      dispatch(closePreviewCreatedPatternPhase());
    } else if (action === "Auto") {
      dispatch(setManualMode(false));
      setShowManualMoreConfig(false);
    }

    const socket = getWebSocket();
    const sendMessage = () => {
      socket.send(
        JSON.stringify({
          event: "intersection_control_request",
          payload: { action, DeviceID: deviceId },
        })
      );
      setTimeout(() => {
        dispatch(getUserDeviceStateData(deviceId));
      }, 2000);
    };

    if (socket.readyState === WebSocket.OPEN) {
      sendMessage();
    } else {
      socket.onopen = () => sendMessage();
    }

    SetItemToLocalStorage("isPasswordVerified", {
      isPasswordVerified: true,
      time: Date.now(),
    });
  };

  const getAdjacentPedestrianSignal = (
    signals: Signal[],
    direction: "N" | "E" | "S" | "W"
  ): "R" | "G" | "X" => {
    let adjacentDirection: "N" | "E" | "S" | "W";
    switch (direction) {
      case "S":
        adjacentDirection = "E";
        break;
      case "E":
        adjacentDirection = "N";
        break;
      case "N":
        adjacentDirection = "W";
        break;
      case "W":
        adjacentDirection = "S";
        break;
      default:
        adjacentDirection = "N";
    }
    const adjacentSignal = signals.find(
      (signal) => signal.direction === adjacentDirection
    );
    return adjacentSignal ? adjacentSignal.pedestrian : "X";
  };

  const encodeSignals = () => {
    return (
      "*" +
      landingPageSignals
        .map((signal) => {
          const adjacentPedestrian = getAdjacentPedestrianSignal(
            landingPageSignals,
            signal.direction
          );
          return `${signal.direction}${signal.left}${signal.straight}${signal.right}${signal.bike}${signal.pedestrian}${adjacentPedestrian}`;
        })
        .join("") +
      "#"
    );
  };

  useEffect(() => {
    const initialStrings = encodeSignals();
    setInitialSignalStrings(initialStrings);
  }, [landingPageSignals]);

  useEffect(() => {
    if (!deviceActiveStateData?.Auto) setShowManualMoreConfig(true);
  }, [deviceActiveStateData, currentDeviceInfoData]);

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      blinkEnabled: false,
      blinkTimeGreenToRed: 2,
      amberEnabled: true,
      amberDurationGreenToRed: 3,
    },
    validationSchema: Yup.object({
      blinkTimeGreenToRed: Yup.number().when("blinkEnabled", {
        is: true,
        then: () =>
          Yup.number()
            .min(0, "Blink time must be at least 0")
            .max(5, "Blink time must be at most 5")
            .required("Blink time is required"),
        otherwise: () => Yup.number().notRequired(),
      }),
      amberDurationGreenToRed: Yup.number().when("amberEnabled", {
        is: true,
        then: () =>
          Yup.number()
            .min(0, "Amber duration must be at least 0")
            .max(5, "Amber duration must be at most 5")
            .required("Amber duration is required"),
        otherwise: () => Yup.number().notRequired(),
      }),
    }),
    onSubmit: async (values) => {
      try {
        const encodedSignals = encodeSignals();
        const socket = getWebSocket();
        const sendMessage = () => {
          socket.send(
            JSON.stringify({
              event: "signal_request",
              payload: {
                DeviceID: params.deviceId,
                initialSignalStrings,
                signalString: encodedSignals,
                duration: 30,
                blinkEnabled: !initialSignalStrings.includes("G")
                  ? false
                  : values.blinkEnabled,
                blinkTimeGreenToRed: !initialSignalStrings.includes("G")
                  ? 0
                  : values.blinkTimeGreenToRed,
                amberEnabled: !initialSignalStrings.includes("G")
                  ? false
                  : values.amberEnabled,
                amberDurationGreenToRed: !initialSignalStrings.includes("G")
                  ? 0
                  : values.amberDurationGreenToRed,
              },
            })
          );
        };
        if (socket.readyState === WebSocket.OPEN) {
          sendMessage();
        } else {
          socket.onopen = () => sendMessage();
        }
        setInitialSignalStrings(encodedSignals);
        dispatch(getUserDeviceStateData(deviceId));
      } catch (error: any) {
        const message = error?.response?.data?.message || `Request failed`;
        emitToastMessage(message, "error");
      }
    },
  });

  useEffect(() => {
    const socket = getWebSocket();
    const handleFeedback = (event: MessageEvent) => {
      const feedback = JSON.parse(event.data);
      if (feedback.event === "ping_received") return;
      if (feedback.payload?.DeviceID !== deviceId) return;
      switch (feedback.event) {
        case "intersection_control_feedback":
          if (feedback.payload.error) {
            emitToastMessage(feedback.payload.message, "error");
          } else {
            setTimeout(() => {
              dispatch(getUserDeviceStateData(deviceId));
            }, 2000);
          }
          break;
        case "signal_feedback":
          if (feedback.payload.error) {
            emitToastMessage(feedback.payload.message, "error");
          } else {
            setTimeout(() => {
              dispatch(getUserDeviceStateData(deviceId));
            }, 2000);
          }
          break;
        default:
          console.log("Unhandled event:", feedback.event);
      }
    };
    socket?.addEventListener("message", handleFeedback);
    return () => {
      socket?.removeEventListener("message", handleFeedback);
    };
  }, [dispatch, deviceId]);

  const handleRedirectionToDevicePage = () => {
    const device = devices.find((device) => device.deviceId === deviceId);
    if (!device) {
      emitToastMessage("Device not found.", "error");
      return;
    }
    if (userType === "admin" && !device?.userDevice?.allowAdminSupport) {
      emitToastMessage(
        "Admin support is not enabled for this device.",
        "error"
      );
      return;
    }
    router.push(`${pathname}/intersection_configuration`);
    dispatch(setManualMode(false));
    dispatch(setIsIntersectionConfigurable(true));
  };

  if (showCommandsOnly) {
    return (
      <div
        style={{
          width: "90%",
          border: "1px solid #ccc",
          margin: "10px auto",
          padding: "20px",
          borderRadius: "8px",
        }}
      >
        <div>
          <h2>Commands Control</h2>
          <div className="intersectionConfiguration__commands">
            <button
              onClick={() => {
                const action = deviceActiveStateData?.Auto ? "Manual" : "Auto";
                handleRequest(action);
              }}
            >
              {deviceActiveStateData?.Auto
                ? "Switch to Manual"
                : "Switch to Auto"}
            </button>
            <button onClick={() => handleRequest("Hold")}>Hold</button>
            <button onClick={() => handleRequest("Next")}>Next</button>
            <button onClick={() => handleRequest("Reboot")}>Reboot</button>
          </div>

          {showManualMoreConfig && (
            <>
              <div className="phases__buttonBox">
                <button
                  className="phases__clear"
                  onClick={() => {
                    dispatch(setSignalStringToAllRed());
                    dispatch(setSignalState());
                  }}
                >
                  All Red
                </button>
                <button
                  // className="phases__clear"
                  onClick={() => {
                    dispatch(setSignalStringToAllAmber());
                    dispatch(setSignalState());
                  }}
                >
                  All Yellow
                </button>
                <button
                  // className="phases__clear"
                  onClick={() => {
                    dispatch(setSignalStringToAllBlank());
                    dispatch(setSignalState());
                  }}
                >
                  All Blank
                </button>
              </div>
              <form
                onSubmit={formik.handleSubmit}
                className="patterns__selected--form"
              >
                {/* {initialSignalStrings.includes("G") && ( */}
                <div>
                  <h3>Blink and Amber Configuration</h3>
                  <div className="patterns__selected--title">
                    <label>
                      <input
                        type="checkbox"
                        name="blinkEnabled"
                        checked={formik.values.blinkEnabled}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                      />
                      Enable Blink
                    </label>
                    {formik.values.blinkEnabled && (
                      <div className="patterns__selected--item">
                        <label>Blink Time (Green to Red)</label>
                        <input
                          type="number"
                          name="blinkTimeGreenToRed"
                          value={formik.values.blinkTimeGreenToRed}
                          min={0}
                          max={5}
                          onChange={(e) => {
                            const value = Math.max(
                              0,
                              Math.min(5, Number(e.target.value))
                            );
                            formik.setFieldValue("blinkTimeGreenToRed", value);
                          }}
                          onBlur={formik.handleBlur}
                          autoFocus
                        />
                        {formik.touched.blinkTimeGreenToRed &&
                          formik.errors.blinkTimeGreenToRed && (
                            <div>{formik.errors.blinkTimeGreenToRed}</div>
                          )}
                      </div>
                    )}
                  </div>
                  <div className="patterns__selected--title">
                    <label>
                      <input
                        type="checkbox"
                        name="amberEnabled"
                        checked={formik.values.amberEnabled}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                      />
                      Enable Amber
                    </label>
                    {formik.values.amberEnabled && (
                      <div className="patterns__selected--item">
                        <label>Amber Duration (Green to Red)</label>
                        <input
                          type="number"
                          name="amberDurationGreenToRed"
                          value={formik.values.amberDurationGreenToRed}
                          min={0}
                          max={5}
                          onChange={(e) => {
                            const value = Math.max(
                              0,
                              Math.min(5, Number(e.target.value))
                            );
                            formik.setFieldValue(
                              "amberDurationGreenToRed",
                              value
                            );
                          }}
                          onBlur={formik.handleBlur}
                        />
                        {formik.touched.amberDurationGreenToRed &&
                          formik.errors.amberDurationGreenToRed && (
                            <div>{formik.errors.amberDurationGreenToRed}</div>
                          )}
                      </div>
                    )}
                  </div>
                </div>
                {/* )} */}
                <Button
                  type="submit"
                  style={{
                    color: "white",
                    padding: "10px 20px",
                    backgroundColor: "#6c6128",
                    borderRadius: "5px",
                  }}
                >
                  Send Signal
                </Button>
              </form>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <section className="intersectionConfiguration">
      <div className="intersectionConfiguration__header">
        <h2>Intersection Configuration</h2>
        <button type="button" onClick={handleRedirectionToDevicePage}>
          Configure
        </button>
      </div>
      <ul className="intersectionConfiguration__list">
        {intersectionConfigItems.map(
          (item: IntersectionConfigItem, index: number) => (
            <IntersectionConfigurationItem key={index} item={item} />
          )
        )}
      </ul>
    </section>
  );
};

export default IntersectionConfiguration;
