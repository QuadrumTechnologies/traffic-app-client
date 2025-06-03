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
}

const IntersectionConfiguration: React.FC<DeviceConfigurationProps> = ({
  intersectionConfigItems,
  deviceId,
  userType,
}) => {
  let devices: any[] | null = [];

  if (userType === "admin") {
    const { devices: adminDevices } = useAppSelector(
      (state) => state.adminDevice
    );
    devices = devices.concat(adminDevices);
  } else {
    const { devices: userDevices } = useAppSelector(
      (state) => state.userDevice
    );
    devices = devices.concat(userDevices);
  }

  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const { deviceActiveStateData } = useAppSelector((state) => state.userDevice);
  const { landingPageSignals } = useAppSelector((state) => state.signalConfig);
  const [showManualMoreConfig, setShowManualMoreConfig] =
    useState<boolean>(false);
  const [initialSignalStrings, setInitialSignlStrings] = useState("");
  const params = useParams();
  const email = GetItemFromLocalStorage("user")?.email;

  useEffect(() => {
    dispatch(setManualMode(!deviceActiveStateData?.Auto));
    setShowManualMoreConfig(!deviceActiveStateData?.Auto);
  }, [deviceActiveStateData]);

  const handleRequest = async (action: string) => {
    const device = devices?.find((device) => device.deviceId === deviceId);

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

    const isPasswordVerified = GetItemFromLocalStorage("isPasswordVerified");
    if (!isPasswordVerified || Date.now() - isPasswordVerified.time > 180000) {
      const password = prompt("Please enter your password to proceed");

      if (!password) return;

      // Audit log reason
      const reason = `Device ${deviceId} ${action} action requested by user`;

      try {
        const endpoint = pathname.includes("admin")
          ? "/admin/confirm-password"
          : "/confirm-password";
        await HttpRequest.post(endpoint, {
          email: GetItemFromLocalStorage("user").email,
          reason,
          password,
        });
        emitToastMessage("Password verified", "success");
        SetItemToLocalStorage("isPasswordVerified", {
          isPasswordVerified: true,
          time: Date.now(),
        });
      } catch (error: any) {
        emitToastMessage(error?.response.data.message, "error");
        return;
      }
    }

    if (action === "Manual") {
      dispatch(setManualMode(true));
      setShowManualMoreConfig(true);
      dispatch(closePreviewCreatedPatternPhase());
    }

    if (action === "Auto") {
      dispatch(setManualMode(false));
      setShowManualMoreConfig(false);
    }

    const socket = getWebSocket();

    const sendMessage = () => {
      socket.send(
        JSON.stringify({
          event: "intersection_control_request",
          payload: { action: action, DeviceID: deviceId },
        })
      );
    };

    if (socket.readyState === WebSocket.OPEN) {
      sendMessage();
      setTimeout(() => {
        dispatch(getUserDeviceStateData(deviceId));
      }, 500);
    } else {
      socket.onopen = () => {
        sendMessage();
        setTimeout(() => {
          dispatch(getUserDeviceStateData(deviceId));
        }, 500);
      };
    }

    SetItemToLocalStorage("isPasswordVerified", {
      isPasswordVerified: true,
      time: Date.now(),
    });

    return () => {
      if (socket) {
        socket.close();
      }
    };
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
    setInitialSignlStrings(initialStrings);
  }, []);

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      blinkEnabled: false,
      blinkTimeGreenToRed: 2,
      amberEnabled: true,
      amberDurationGreenToRed: 3,
    },
    validationSchema: Yup.object({
      blinkTimeGreenToRed: Yup.number().when(
        "blinkEnabled",
        (blinkEnabled, schema) =>
          blinkEnabled
            ? schema
                .min(0, "Blink time must be at least 0")
                .max(5, "Blink time must be at most 5")
                .required("Blink time is required")
            : schema.notRequired()
      ),
      amberDurationGreenToRed: Yup.number().when(
        "amberEnabled",
        (amberEnabled, schema) =>
          amberEnabled
            ? schema
                .min(0, "Amber duration must be at least 0")
                .max(5, "Amber duration must be at most 5")
                .required("Amber duration is required")
            : schema.notRequired()
      ),
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
                blinkEnabled: !`${initialSignalStrings}`.includes("G")
                  ? false
                  : values.blinkEnabled,
                blinkTimeGreenToRed: !`${initialSignalStrings}`.includes("G")
                  ? 0
                  : values.blinkTimeGreenToRed,
                amberEnabled: !`${initialSignalStrings}`.includes("G")
                  ? false
                  : values.amberEnabled,
                amberDurationGreenToRed: !`${initialSignalStrings}`.includes(
                  "G"
                )
                  ? 0
                  : values.amberDurationGreenToRed,
              },
            })
          );
        };

        if (socket.readyState === WebSocket.OPEN) {
          sendMessage();
        } else {
          socket.onopen = () => {
            sendMessage();
          };
        }
        const updatedSignalString = encodeSignals();
        setInitialSignlStrings(updatedSignalString);
        emitToastMessage("Manual state set for 30seconds", "success");
      } catch (error: any) {
        emitToastMessage(
          error?.response?.data?.message || "An error occurred",
          "error"
        );
      }
    },
  });

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
          (item: IntersectionConfigItem, index: any) => (
            <IntersectionConfigurationItem key={index} item={item} />
          )
        )}
      </ul>

      <div>
        <h2>Commands Control</h2>
        <div className="intersectionConfiguration__commands">
          <button
            onClick={() => {
              const action =
                deviceActiveStateData?.Auto === true ? "Manual" : "Auto";
              handleRequest(action);
            }}
          >
            {deviceActiveStateData?.Auto === true
              ? "Switch to Manual"
              : "Switch to Auto"}
          </button>
          <button onClick={() => handleRequest("Hold")}>Hold</button>
          <button onClick={() => handleRequest("Next")}>Next</button>
          <button onClick={() => handleRequest("Reboot")}>Reboot</button>
        </div>
        {showManualMoreConfig && (
          <form
            onSubmit={formik.handleSubmit}
            className="patterns__selected--form"
          >
            {`${initialSignalStrings}`.includes("G") && (
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
                    <>
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
                    </>
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
                    <>
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
                    </>
                  )}
                </div>
              </div>
            )}
            <Button type="submit">Send Signal</Button>
          </form>
        )}
      </div>
    </section>
  );
};

export default IntersectionConfiguration;
