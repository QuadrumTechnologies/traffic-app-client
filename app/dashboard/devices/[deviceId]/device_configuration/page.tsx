"use client";

import NormalInput from "@/components/UI/Input/NormalInput";
import LoadingSpinner from "@/components/UI/LoadingSpinner/LoadingSpinner";
import HttpRequest from "@/store/services/HttpRequest";
import { useFormik } from "formik";
import { useEffect, useState } from "react";
import { FaToggleOn, FaToggleOff, FaPowerOff } from "react-icons/fa";
import * as Yup from "yup";
import Slider from "rc-slider";
import "rc-slider/assets/index.css";
import { useAppSelector, useAppDispatch } from "@/hooks/reduxHook";
import {
  formatRtcDate,
  formatRtcTime,
  formatUnixTimestamp,
} from "@/utils/misc";
import { getUserDevice, getUserDeviceStateData } from "@/store/devices/UserDeviceSlice";
import { getWebSocket } from "@/app/dashboard/websocket";
import {
  GetItemFromLocalStorage,
  SetItemToLocalStorage,
} from "@/utils/localStorageFunc";
import { emitToastMessage } from "@/utils/toastFunc";
import { usePathname } from "next/navigation";
import { useDeviceStatus } from "@/hooks/useDeviceStatus";

interface DeviceConfigurationPageProps {
  params: { deviceId: string };
}

const DeviceConfigurationPage: React.FC<DeviceConfigurationPageProps> = ({
  params,
}) => {
  const dispatch = useAppDispatch();
  const pathname = usePathname();
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showIntersectionPassword, setShowIntersectionPassword] =
    useState<boolean>(false);
  const [adminSupport, setAdminSupport] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const { devices, currentDeviceInfoData, deviceActiveStateData } =
    useAppSelector((state) => state.userDevice);

  const [sliderValue, setSliderValue] = useState<number>(
    deviceActiveStateData?.SignalLevel || 20
  );

  const device =
    devices?.find((device) => device?.deviceId === params?.deviceId) || null;

  const fetchDeviceAdminSupportStatus = async () => {
    try {
      const response = await HttpRequest.get(
        `/user-devices/${params.deviceId}`
      );
      setAdminSupport(response.data.data.allowAdminSupport);
    } catch (error) {
      console.error("Error fetching device status", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!params?.deviceId) return;
    fetchDeviceAdminSupportStatus();
    dispatch(getUserDeviceStateData(params.deviceId));
  }, [params.deviceId, dispatch]);

  useEffect(() => {
    setSliderValue(deviceActiveStateData?.SignalLevel || 20);
  }, [deviceActiveStateData?.SignalLevel]);

  const handleRequest = async (action: string, payloadValue?: any) => {
    if (!device) {
      emitToastMessage("Device not found.", "error");
      return;
    }

    const isPasswordVerified = GetItemFromLocalStorage("isPasswordVerified");
    if (!isPasswordVerified || Date.now() - isPasswordVerified.time > 180000) {
      const password = prompt("Please enter your password to proceed");
      if (!password) return;

      const reason = `Device ${params.deviceId} ${
        action === "Reset!" ? "hard reset" : action.toLowerCase()
      } action requested by user`;

      try {
        const endpoint = pathname.includes("admin")
          ? "/admin/confirm-password"
          : "/confirm-password";
        await HttpRequest.post(endpoint, {
          email: GetItemFromLocalStorage("user").email,
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
      }
    }

    const socket = getWebSocket();

    const sendMessage = () => {
      const payload: { [key: string]: any } = {
        action,
        DeviceID: params.deviceId,
      };
      if (payloadValue !== undefined) {
        payload[action] = payloadValue;
      }
      socket.send(
        JSON.stringify({
          event: "intersection_control_request",
          payload,
        })
      );
      setTimeout(() => {
        dispatch(getUserDeviceStateData(params.deviceId));
      }, 500);
    };

    if (socket.readyState === WebSocket.OPEN) {
      sendMessage();
    } else {
      socket.onopen = () => sendMessage();
    }
  };

  const handleSignalPowerToggle = () => {
    const newPowerState = !deviceActiveStateData?.Power;
    const confirmReset = confirm(
      `Are you sure you want to turn ${
        newPowerState ? "on" : "off"
      } the device?`
    );

    if (!confirmReset) return;
    handleRequest("Power", newPowerState);
    dispatch(getUserDeviceStateData(params.deviceId));
    dispatch(getUserDevice())
  };

  const handleBrightnessChange = (value: number | number[]) => {
    if (typeof value === "number") {
      setSliderValue(value);
    }
  };

  const handleBrightnessChangeComplete = (value: number | number[]) => {
    if (typeof value === "number") {
      handleRequest("SignalLevel", value);
    }
  };

  const handleFlashOnPoorSignalChange = () => {
    const newFlashState = !deviceActiveStateData?.ErrorFlash;
    handleRequest("ErrorFlash", newFlashState);
  };

  const handleSoftReset = () => {
    const confirmReset = confirm(
      "Are you sure you want to perform a soft reset? This will reset device settings to their default state."
    );

    if (!confirmReset) return;
    handleRequest("Reset");
  };

  const handleHardReset = () => {
    const confirmReset = confirm(
      "Are you sure you want to perform a hard reset? This will clear all device data and settings, including phases, patterns, and plans, and cannot be undone."
    );

    if (!confirmReset) return;
    handleRequest("Reset!");
  };

  const handleAdminSupportToggle = async () => {
    const newStatus = !adminSupport;
    const confirmUpdate = confirm(
      `Are you sure you want to ${
        newStatus ? "enable" : "disable"
      } admin support?`
    );

    if (!confirmUpdate) return;

    setAdminSupport(newStatus);
    try {
      setIsSubmitting(true);
      await HttpRequest.patch(`/user-devices/${params.deviceId}`, {
        allowAdminSupport: newStatus,
      });
      setAdminSupport(newStatus);
    } catch (error) {
      setAdminSupport(!newStatus); // Revert on error
    } finally {
      setIsSubmitting(false);
    }
  };

  const validationSchema = Yup.object({
    minimumBatteryLevel: Yup.number()
      .required("Minimum Battery Level is required")
      .min(9, "Minimum battery level must be at least 9V")
      .max(36, "Maximum battery level is 36V"),
  });

  const rtcDate = currentDeviceInfoData?.Rtc
    ? formatRtcDate(formatUnixTimestamp(+currentDeviceInfoData.Rtc))
    : "";

  const rtcTime = currentDeviceInfoData?.Rtc
    ? formatRtcTime(formatUnixTimestamp(+currentDeviceInfoData.Rtc))
    : "";

  const formik = useFormik({
    initialValues: {
      minimumBatteryLevel: 12.0,
    },
    validationSchema,
    validateOnChange: true,
    validateOnBlur: true,
    validateOnMount: true,
    async onSubmit(values, actions) {
      try {
        setIsSubmitting(true);
        await HttpRequest.patch(
          `/user-devices/${params.deviceId}/configuration`,
          {
            minimumBatteryLevel: values.minimumBatteryLevel,
          }
        );
      } catch (error: any) {
        const message = error?.response?.data?.message || `Request failed`;
        emitToastMessage(message, "error");
      } finally {
        setIsSubmitting(false);
        actions.setSubmitting(false);
      }
    },
  });

  if (isLoading || !devices) {
    return <LoadingSpinner color="blue" height="big" />;
  }

  if (!params?.deviceId) {
    return <div>Error: Device ID is missing</div>;
  }

  return (
    <section className="deviceConfigPage">
      <div className="deviceConfigPage__header--box">
        <h2 className="deviceConfigPage__header">Device Configurations</h2>
        <div className="deviceConfigPage__controls">
          <div className="deviceConfigPage__toggle">
            <span>Signal Power:</span>
            <button
              onClick={handleSignalPowerToggle}
              className={`deviceConfigPage__toggle-button ${
                deviceActiveStateData?.Power ? "on" : "off"
              }`}
            >
              <FaPowerOff
                size={24}
                color={deviceActiveStateData?.Power ? "red" : "grey"}
              />
            </button>
          </div>
          <div className="deviceConfigPage__toggle">
            <span>Allow Admin Support:</span>
            <button
              onClick={handleAdminSupportToggle}
              disabled={isSubmitting}
              className={`deviceConfigPage__toggle-button ${
                adminSupport ? "on" : "off"
              }`}
            >
              {adminSupport ? (
                <FaToggleOn size={36} />
              ) : (
                <FaToggleOff size={36} />
              )}
            </button>
          </div>
        </div>
      </div>

      <form onSubmit={formik.handleSubmit}>
        <div className="deviceConfigPage__firstRow">
          <div className="deviceConfigPage__firstBox">
            <div className="deviceConfigPage__firstBox--top">
              <p className="deviceConfigPage__firstBox--header">
                The Device ID and Key are unique identifiers from your device
                manufacturer for your controller.
              </p>
              <div className="deviceConfigPage__firstBox--inputs">
                <NormalInput
                  id="deviceId"
                  type="text"
                  name="deviceId"
                  label="Device ID"
                  value={params.deviceId || ""}
                  readOnly
                />
                <NormalInput
                  id="deviceKey"
                  name="deviceKey"
                  label="Secret Key"
                  type={showPassword ? "text" : "password"}
                  value={device?.secretKey || ""}
                  passwordIcon={true}
                  showPassword={showPassword}
                  updatePasswordVisibility={() =>
                    setShowPassword((prev) => !prev)
                  }
                  readOnly
                />
                <NormalInput
                  id="date"
                  type="text"
                  name="date"
                  label="Date"
                  value={rtcDate}
                  readOnly
                />
                <NormalInput
                  id="time"
                  type="text"
                  name="time"
                  label="Time"
                  value={rtcTime}
                  readOnly
                />
                <NormalInput
                  id="intersectionId"
                  type="text"
                  name="intersectionId"
                  label="Intersection ID"
                  value={currentDeviceInfoData?.JunctionId || ""}
                  readOnly
                />
                <NormalInput
                  id="intersectionPassword"
                  type={showIntersectionPassword ? "text" : "password"}
                  name="intersectionPassword"
                  label="Intersection Password"
                  value={currentDeviceInfoData?.JunctionPassword || ""}
                  passwordIcon={true}
                  showPassword={showIntersectionPassword}
                  updatePasswordVisibility={() =>
                    setShowIntersectionPassword((prev) => !prev)
                  }
                  readOnly
                />
                <NormalInput
                  id="intersectionLocation"
                  type="text"
                  name="intersectionLocation"
                  label="Intersection Location"
                  value={currentDeviceInfoData?.JunctionId || ""}
                  readOnly
                />
              </div>
            </div>
          </div>

          <div className="deviceConfigPage__secondBox">
            <div className="deviceConfigPage__firstBox--top">
              <p className="deviceConfigPage__secondBox--header">
                Configure your device settings
              </p>
              <div className="deviceConfigPage__secondBox--inputs">
                <NormalInput
                  id="signalConfig"
                  type="text"
                  name="signalConfig"
                  label="Signal Configuration"
                  value={deviceActiveStateData?.SignalConfig || ""}
                  readOnly
                />
                <NormalInput
                  id="communicationFrequency"
                  type="text"
                  name="communicationFrequency"
                  label="Communication Frequency"
                  value={currentDeviceInfoData?.CommunicationFrequency || ""}
                  readOnly
                />
                <NormalInput
                  id="communicationChannel"
                  type="text"
                  name="communicationChannel"
                  label="Communication Channel"
                  value={currentDeviceInfoData?.CommunicationChannel || ""}
                  readOnly
                />
                <div className="deviceConfigPage__slider-container">
                  <h3>Signal Brightness: {sliderValue}%</h3>
                  <Slider
                    id="signalBrightness"
                    min={10}
                    max={100}
                    step={10}
                    value={sliderValue}
                    onChange={handleBrightnessChange}
                    onAfterChange={handleBrightnessChangeComplete}
                    marks={{
                      20: "20%",
                      40: "40%",
                      60: "60%",
                      80: "80%",
                      100: "100%",
                    }}
                  />
                </div>
                <div className="deviceConfigPage__checkbox">
                  <label>
                    <input
                      type="checkbox"
                      name="flashOnPoorSignal"
                      checked={deviceActiveStateData?.ErrorFlash || false}
                      onChange={handleFlashOnPoorSignalChange}
                    />
                    Flash on Poor Signal Quality
                  </label>
                </div>
                <NormalInput
                  id="minimumBatteryLevel"
                  type="number"
                  name="minimumBatteryLevel"
                  label="Configure Minimum Battery Level (V)"
                  invalid={
                    formik.errors.minimumBatteryLevel &&
                    formik.touched.minimumBatteryLevel
                  }
                  placeholder="Min: 9V, Max: 36V"
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={String(formik.values.minimumBatteryLevel)}
                  inputErrorMessage={formik.errors.minimumBatteryLevel}
                  step="0.1"
                  min="9"
                  max="36"
                />
              </div>
            </div>

            <div className="deviceConfigPage__button--box">
              <button
                type="button"
                onClick={() => fetchDeviceAdminSupportStatus()}
              >
                Read Configuration
              </button>
              <button type="submit" disabled={!formik.isValid || isSubmitting}>
                {isSubmitting ? "Saving..." : "Save Configuration"}
              </button>
              <button
                type="button"
                onClick={handleSoftReset}
                className="deviceConfigPage__reset-button"
              >
                Soft Reset
              </button>
              <button
                type="button"
                onClick={handleHardReset}
                className="deviceConfigPage__reset-button"
              >
                Hard Reset
              </button>
            </div>
          </div>
        </div>
      </form>
    </section>
  );
};

export default DeviceConfigurationPage;
