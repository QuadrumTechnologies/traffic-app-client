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
import { formatRtcDate, formatRtcTime } from "@/utils/misc";
import { formatUnixTimestamp } from "@/utils/misc";
import { getUserDeviceStateData } from "@/store/devices/UserDeviceSlice";
import { getWebSocket } from "@/app/dashboard/websocket";

interface DeviceConfigurationPageProps {
  params: any;
}

// const BRIGHTNESS_LEVELS = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100];
const BRIGHTNESS_LEVELS = [20, 40, 60, 80, 100];

const DeviceConfigurationPage: React.FC<DeviceConfigurationPageProps> = ({
  params,
}) => {
  const dispatch = useAppDispatch();
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [adminSupport, setAdminSupport] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [signalConfig, setSignalConfig] = useState<string>("active_low_cp");

  const {
    devices,
    deviceAvailability,
    currentDeviceInfoData,
    deviceActiveStateData,
  } = useAppSelector((state) => state.userDevice);

  const device = devices.find(
    (device) => device?.deviceId === params?.deviceId
  );

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
    fetchDeviceAdminSupportStatus();
  }, [params.deviceId]);

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
      const response = await HttpRequest.patch(
        `/user-devices/${params.deviceId}`,
        {
          allowAdminSupport: newStatus,
        }
      );
      setAdminSupport(response.data.data.allowAdminSupport);
    } catch (error) {
      console.error("Error updating toggle", error);
      alert("Failed to update admin support status.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetToDefault = () => {
    const confirmReset = confirm(
      "Are you sure you want to reset to default settings?"
    );

    if (!confirmReset) return;

    const socket = getWebSocket();
    const deviceId = params.deviceId;

    const sendMessage = () => {
      socket.send(
        JSON.stringify({
          event: "intersection_control_request",
          payload: { action: "reset_defaults", DeviceID: deviceId },
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
  };

  const validationSchema = Yup.object({
    signalBrightness: Yup.number()
      .required("Signal Brightness is required")
      .oneOf(BRIGHTNESS_LEVELS, "Invalid brightness level"),
    signalPower: Yup.boolean().required("Signal Power is required"),
    minimumBatteryLevel: Yup.number()
      .required("Minimum Battery Level is required")
      .min(9, "Minimum battery level must be at least 9V")
      .max(36, "Maximum battery level is 36V"),
  });

  // Get date and time from RTC
  const rtcDate = currentDeviceInfoData?.Rtc
    ? formatRtcDate(formatUnixTimestamp(+currentDeviceInfoData.Rtc))
    : "";

  const rtcTime = currentDeviceInfoData?.Rtc
    ? formatRtcTime(formatUnixTimestamp(+currentDeviceInfoData.Rtc))
    : "";

  const formik = useFormik({
    initialValues: {
      signalBrightness: 20,
      signalPower: deviceActiveStateData?.Power || false,
      minimumBatteryLevel: 12.0,
    },
    validationSchema,
    validateOnChange: true,
    validateOnBlur: true,
    validateOnMount: true,
    async onSubmit(values, actions) {
      try {
        setIsSubmitting(true);
        const response = await HttpRequest.patch(
          `/user-devices/${params.deviceId}/configuration`,
          {
            signalBrightness: values.signalBrightness,
            signalPower: values.signalPower,
            minimumBatteryLevel: values.minimumBatteryLevel,
          }
        );
        alert("Configuration updated successfully!");
      } catch (error: any) {
        console.error("Error updating configuration", error);
        alert("Failed to update configuration.");
      } finally {
        setIsSubmitting(false);
        actions.setSubmitting(false);
      }
    },
  });

  // Handler for brightness slider
  const handleBrightnessChange = (value: number | number[]) => {
    if (typeof value === "number") {
      formik.setFieldValue("signalBrightness", value);
    }
  };

  // Handler for brightness slider after release
  const handleBrightnessAfterChange = (value: number | number[]) => {
    if (typeof value === "number") {
      console.log("Sending brightness value to backend:", value);
    }
  };

  // Toggle handlers
  const handleSignalPowerToggle = () => {
    formik.setFieldValue("signalPower", !formik.values.signalPower);
  };

  // Update form with Redux data when it changes
  useEffect(() => {
    if (currentDeviceInfoData && deviceActiveStateData) {
      formik.setValues({
        ...formik.values,
        signalPower: deviceActiveStateData.Power,
      });
    }
  }, [currentDeviceInfoData, deviceActiveStateData]);

  if (isLoading) return <LoadingSpinner color="blue" height="big" />;

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
                formik.values.signalPower ? "on" : "off"
              }`}
            >
              <FaPowerOff
                size={24}
                color={formik.values.signalPower ? "red" : "grey"}
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
          {/* Left Side - Read Only Fields */}
          <div className="deviceConfigPage__firstBox">
            <div className="deviceConfigPage__firstBox--top">
              <p className="deviceConfigPage__firstBox--header">
                The Device ID and Key are unique identifiers from your device
                manufacturer for your controller.
              </p>
              <div className="deviceConfigPage__firstBox--inputs">
                <NormalInput
                  id="deviceId"
                  type="deviceId"
                  name="deviceId"
                  label="Device ID"
                  value={params.deviceId || deviceAvailability?.DeviceID || ""}
                  readOnly
                />
                <NormalInput
                  id="deviceKey"
                  name="deviceKey"
                  label="Secret Key"
                  type={showPassword ? "text" : "password"}
                  value={device?.secretKey}
                  passwordIcon={true}
                  showPassword={showPassword}
                  updatePasswordVisibility={() => {
                    setShowPassword((prev) => !prev);
                  }}
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
                  type={showPassword ? "text" : "password"}
                  name="intersectionPassword"
                  label="Intersection Password"
                  value={currentDeviceInfoData?.JunctionId || ""}
                  passwordIcon={true}
                  showPassword={showPassword}
                  updatePasswordVisibility={() => {
                    setShowPassword((prev) => !prev);
                  }}
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

                {/* <NormalInput
                  id="intersectionType"
                  type="text"
                  name="intersectionType"
                  label="Intersection Type"
                  invalid={
                    formik.errors.intersectionType &&
                    formik.touched.intersectionType
                  }
                  placeholder=""
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.intersectionType}
                  inputErrorMessage={formik.errors.intersectionType}
                /> */}
              </div>
            </div>
          </div>

          {/* Right Side - Editable Fields */}
          <div className="deviceConfigPage__secondBox">
            <div className="deviceConfigPage__firstBox--top">
              <p className="deviceConfigPage__secondBox--header">
                Configure your device settings
              </p>
              <div className="deviceConfigPage__secondBox--inputs">
                <div className="deviceConfigPage__slider-container">
                  <h3>Signal Brightness: {formik.values.signalBrightness}%</h3>
                  <Slider
                    id="signalBrightness"
                    min={10}
                    max={100}
                    step={10}
                    value={formik.values.signalBrightness}
                    onChange={handleBrightnessChange}
                    onAfterChange={handleBrightnessAfterChange}
                    marks={{
                      // 10: "10%",
                      20: "20%",
                      // 30: "30%",
                      40: "40%",
                      // 50: "50%",
                      60: "60%",
                      // 70: "70%",
                      80: "80%",
                      // 90: "90%",
                      100: "100%",
                    }}
                  />
                  {formik.errors.signalBrightness &&
                    formik.touched.signalBrightness && (
                      <div className="input-error">
                        {formik.errors.signalBrightness}
                      </div>
                    )}
                </div>

                <div className="deviceConfigPage__radio-group">
                  <h3>Signal Configuration:</h3>
                  <div className="deviceConfigPage__radio-options">
                    <label className="deviceConfigPage__radio-label">
                      <input
                        type="radio"
                        name="signalConfig"
                        value="active_low_cp"
                        checked={signalConfig === "active_low_cp"}
                        onChange={() => setSignalConfig("active_low_cp")}
                      />
                      Active Low with Common Positive
                    </label>
                    <label className="deviceConfigPage__radio-label">
                      <input
                        type="radio"
                        name="signalConfig"
                        value="active_high_cp"
                        checked={signalConfig === "active_high_cp"}
                        onChange={() => setSignalConfig("active_high_cp")}
                      />
                      Active High with Common Positive
                    </label>
                  </div>
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

                {/* <NormalInput
                  id="notifications"
                  type="text"
                  name="notifications"
                  label="Notifications"
                  invalid={
                    formik.errors.notifications && formik.touched.notifications
                  }
                  placeholder=""
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.notifications}
                  inputErrorMessage={formik.errors.notifications}
                /> */}
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
                onClick={handleResetToDefault}
                className="deviceConfigPage__reset-button"
              >
                Reset to Default
              </button>
            </div>
          </div>
        </div>
      </form>
    </section>
  );
};

export default DeviceConfigurationPage;
