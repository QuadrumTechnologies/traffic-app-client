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
import { getUserDeviceStateData } from "@/store/devices/UserDeviceSlice";
import { getWebSocket } from "@/app/dashboard/websocket";
import SelectField, { Option } from "@/components/UI/SelectField/SelectField";
import {
  GetItemFromLocalStorage,
  SetItemToLocalStorage,
} from "@/utils/localStorageFunc";
import { emitToastMessage } from "@/utils/toastFunc";
import { useDeviceStatus } from "@/hooks/useDeviceStatus";
import { getAdminDevice } from "@/store/devices/AdminDeviceSlice";
import { deviceTypes } from "@/utils/deviceTypes";

interface DeviceConfigurationPageProps {
  params: { deviceId: string };
}

const BRIGHTNESS_LEVELS = [20, 40, 60, 80, 100];

const rfModuleOptions: Option[] = [
  { value: "custom", label: "Custom" },
  { value: "2.4ghz_nrf24", label: "2.4GHz nRF24" },
  { value: "433mhz_lora", label: "433MHz LoRa" },
  { value: "hybrid_lora_nrf24", label: "Hybrid (LoRa+nRF24)" },
];

const DeviceConfigurationPage: React.FC<DeviceConfigurationPageProps> = ({
  params,
}) => {
  const dispatch = useAppDispatch();
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showIntersectionPassword, setShowIntersectionPassword] =
    useState<boolean>(false);
  const [adminSupport, setAdminSupport] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [signalConfig, setSignalConfig] = useState<string>("active_low_cp");
  const {
    devices,
    deviceStatuses,
    currentDeviceInfoData,
    deviceActiveStateData,
  } = useAppSelector((state) => state.userDevice);
  const deviceId = params.deviceId;
  const device = devices?.find((d) => d.deviceId === deviceId) || null;
  const deviceStatus = deviceStatuses.find((status) => status.id === deviceId);
  const socket = getWebSocket();
  const adminUser = GetItemFromLocalStorage("adminUser");
  const deviceType = deviceTypes.find(
    (dev) => dev.department === adminUser?.department
  );

  const fetchDeviceAdminSupportStatus = async () => {
    try {
      const response = await HttpRequest.get(
        `/user-devices/${params.deviceId}`
      );
      setAdminSupport(response.data.data.allowAdminSupport);
    } catch (error: any) {
      const message = error?.response?.data?.message || `Request failed`;
      emitToastMessage(message, "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (params.deviceId) {
      fetchDeviceAdminSupportStatus();
      dispatch(getUserDeviceStateData(params.deviceId));
    }
  }, [dispatch, params.deviceId]);

  const handleRequest = async (action: string, payloadValue?: any) => {
    if (!device) {
      emitToastMessage("Device not found.", "error");
      return;
    }
    const isPasswordVerified = GetItemFromLocalStorage("isPasswordVerified");
    if (!isPasswordVerified || Date.now() - isPasswordVerified.time > 180000) {
      const password = prompt("Please enter your password to proceed");
      if (!password) {
        emitToastMessage("Password verification cancelled", "info");
        return;
      }
      const reason = `Device ${params.deviceId} ${
        action === "Reset!" ? "hard reset" : action.toLowerCase()
      } action requested by admin`;
      try {
        await HttpRequest.post("/admin/confirm-password", {
          email: adminUser.email,
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
    const sendMessage = () => {
      const payload: { [key: string]: any } = {
        action,
        DeviceID: params.deviceId,
      };
      if (payloadValue !== undefined) {
        payload[action] = payloadValue;
      }
      socket.send(
        JSON.stringify({ event: "intersection_control_request", payload })
      );
    };
    if (socket.readyState === WebSocket.OPEN) {
      sendMessage();
      setTimeout(() => dispatch(getUserDeviceStateData(params.deviceId)), 500);
    } else {
      socket.onopen = () => {
        sendMessage();
        setTimeout(
          () => dispatch(getUserDeviceStateData(params.deviceId)),
          500
        );
      };
    }
  };

  const handleSignalPowerToggle = () => {
    const newPowerState = !formik.values.signalPower;
    formik.setFieldValue("signalPower", newPowerState);
    handleRequest("Power", newPowerState);
    dispatch(getUserDeviceStateData(params.deviceId));
    dispatch(getAdminDevice(deviceType));
  };

  const handleSignalConfigChange = (value: string) => {
    setSignalConfig(value);
    formik.setFieldValue("signalConfig", value);
    handleRequest("SignalConfig", value);
  };

  const handleFlashOnPoorSignalChange = () => {
    const newFlashState = !formik.values.flashOnPoorSignal;
    formik.setFieldValue("flashOnPoorSignal", newFlashState);
    handleRequest("ErrorFlash", newFlashState);
  };

  const handleRfModuleVersionChange = (selectedOption: Option | null) => {
    const newRfModuleVersion = selectedOption?.value || "custom";
    formik.setFieldValue("rfModuleVersion", newRfModuleVersion);
    handleRequest("CommunicationChannel", newRfModuleVersion);
  };

  const handleBrightnessChange = (value: number | number[]) => {
    if (typeof value === "number") {
      formik.setFieldValue("signalBrightness", value);
    }
  };

  const handleBrightnessAfterChange = (value: number | number[]) => {
    if (typeof value === "number") {
      handleRequest("SignalLevel", value);
    }
  };

  const handleSoftReset = () => {
    const confirmReset = confirm(
      "Are you sure you want to perform a soft reset? This will reset device settings to their default state."
    );
    if (!confirmReset) {
      emitToastMessage("Soft reset cancelled", "info");
      return;
    }
    handleRequest("Reset");
  };

  const handleHardReset = () => {
    const confirmReset = confirm(
      "Are you sure you want to perform a hard reset? This will clear all device data and settings, including phases, patterns, and plans, and cannot be undone."
    );
    if (!confirmReset) {
      emitToastMessage("Hard reset cancelled", "info");
      return;
    }
    handleRequest("Reset!");
  };

  const handleAdminSupportToggle = async () => {
    const newStatus = !adminSupport;
    const confirmUpdate = confirm(
      `Are you sure you want to ${
        newStatus ? "enable" : "disable"
      } admin support?`
    );
    if (!confirmUpdate) {
      emitToastMessage("Admin support toggle cancelled", "info");
      return;
    }
    try {
      setIsSubmitting(true);
      await HttpRequest.patch(`/user-devices/${params.deviceId}`, {
        allowAdminSupport: newStatus,
      });
      setAdminSupport(newStatus);
    } catch (error: any) {
      const message = error?.response?.data?.message || `Request failed`;
      emitToastMessage(message, "error");
    } finally {
      setIsSubmitting(false);
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
    signalConfig: Yup.string()
      .required("Signal Configuration is required")
      .oneOf(
        ["active_low_cp", "active_high_cp"],
        "Invalid signal configuration"
      ),
    flashOnPoorSignal: Yup.boolean().required(
      "Flash on Poor Signal is required"
    ),
    rfModuleVersion: Yup.string()
      .required("RF Module Version is required")
      .oneOf(
        ["custom", "2.4ghz_nrf24", "433mhz_lora", "hybrid_lora_nrf24"],
        "Invalid RF module version"
      ),
  });

  const formik = useFormik({
    initialValues: {
      signalBrightness: deviceActiveStateData?.SignalLevel || 20,
      signalPower: deviceActiveStateData?.Power || false,
      minimumBatteryLevel: 12.0,
      signalConfig: deviceActiveStateData?.SignalConfig || "active_low_cp",
      flashOnPoorSignal: deviceActiveStateData?.ErrorFlash || false,
      rfModuleVersion: currentDeviceInfoData?.CommunicationChannel || "custom",
    },
    validationSchema,
    validateOnChange: true,
    validateOnBlur: true,
    validateOnMount: true,
    async onSubmit(values) {
      try {
        setIsSubmitting(true);
        await HttpRequest.patch(
          `/user-devices/${params.deviceId}/configuration`,
          {
            signalBrightness: values.signalBrightness,
            signalPower: values.signalPower,
            minimumBatteryLevel: values.minimumBatteryLevel,
            signalConfig: values.signalConfig,
            flashOnPoorSignal: values.flashOnPoorSignal,
            rfModuleVersion: values.rfModuleVersion,
          }
        );
        dispatch(getUserDeviceStateData(params.deviceId));
      } catch (error: any) {
        const message = error?.response?.data?.message || `Request failed`;
        emitToastMessage(message, "error");
      } finally {
        setIsSubmitting(false);
      }
    },
  });

  useEffect(() => {
    if (currentDeviceInfoData && deviceActiveStateData) {
      formik.setValues({
        signalBrightness: deviceActiveStateData.SignalLevel || 20,
        signalPower: deviceActiveStateData.Power || false,
        minimumBatteryLevel: formik.values.minimumBatteryLevel,
        signalConfig: deviceActiveStateData.SignalConfig || "active_low_cp",
        flashOnPoorSignal: deviceActiveStateData.ErrorFlash || false,
        rfModuleVersion: currentDeviceInfoData.CommunicationChannel || "custom",
      });
      setSignalConfig(deviceActiveStateData.SignalConfig || "active_low_cp");
    }
  }, [currentDeviceInfoData, deviceActiveStateData]);

  useEffect(() => {
    const handleFeedback = (event: MessageEvent) => {
      const feedback = JSON.parse(event.data);
      if (feedback.event === "ping_received") return;
      if (feedback.payload?.DeviceID !== params.deviceId) return;
      if (feedback.event === "intersection_control_feedback") {
        if (feedback.payload?.error) {
          emitToastMessage(
            feedback.payload.message || "Failed to update configuration",
            "error"
          );
        } else {
          emitToastMessage("Configuration updated successfully", "success");
          dispatch(getUserDeviceStateData(params.deviceId));
        }
      } else if (feedback.event === "error") {
        emitToastMessage(
          feedback.payload?.message || "An error occurred",
          "error"
        );
      }
    };
    socket.addEventListener("message", handleFeedback);
    return () => {
      socket.removeEventListener("message", handleFeedback);
    };
  }, [dispatch, params.deviceId, socket]);

  if (isLoading || !devices) {
    return <LoadingSpinner color="blue" height="big" />;
  }

  if (!params.deviceId) {
    return <div>Error: Device ID is missing</div>;
  }

  const rtcDate = currentDeviceInfoData?.Rtc
    ? formatRtcDate(formatUnixTimestamp(+currentDeviceInfoData.Rtc))
    : "";
  const rtcTime = currentDeviceInfoData?.Rtc
    ? formatRtcTime(formatUnixTimestamp(+currentDeviceInfoData.Rtc))
    : "";

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
                      20: "20%",
                      40: "40%",
                      60: "60%",
                      80: "80%",
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
                        onChange={() =>
                          handleSignalConfigChange("active_low_cp")
                        }
                      />
                      Active Low with Common Positive
                    </label>
                    <label className="deviceConfigPage__radio-label">
                      <input
                        type="radio"
                        name="signalConfig"
                        value="active_high_cp"
                        checked={signalConfig === "active_high_cp"}
                        onChange={() =>
                          handleSignalConfigChange("active_high_cp")
                        }
                      />
                      Active High with Common Positive
                    </label>
                  </div>
                  {formik.errors.signalConfig &&
                    formik.touched.signalConfig && (
                      <div className="input-error">
                        {formik.errors.signalConfig}
                      </div>
                    )}
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
                <div className="deviceConfigPage__checkbox">
                  <label>
                    <input
                      type="checkbox"
                      name="flashOnPoorSignal"
                      checked={formik.values.flashOnPoorSignal}
                      onChange={handleFlashOnPoorSignalChange}
                    />
                    Flash on Poor Signal Quality
                  </label>
                  {formik.errors.flashOnPoorSignal &&
                    formik.touched.flashOnPoorSignal && (
                      <div className="input-error">
                        {formik.errors.flashOnPoorSignal}
                      </div>
                    )}
                </div>
                <SelectField
                  label="RF Module Version"
                  name="rfModuleVersion"
                  options={rfModuleOptions}
                  value={rfModuleOptions.find(
                    (option) => option.value === formik.values.rfModuleVersion
                  )}
                  onChange={handleRfModuleVersionChange}
                  placeholder="Select RF Module Version"
                  isSearchable={true}
                  isClearable={false}
                  status={
                    formik.errors.rfModuleVersion &&
                    formik.touched.rfModuleVersion
                      ? "error"
                      : null
                  }
                  helper={
                    formik.errors.rfModuleVersion &&
                    formik.touched.rfModuleVersion
                      ? formik.errors.rfModuleVersion
                      : null
                  }
                />
              </div>
            </div>
            <div className="deviceConfigPage__button--box">
              <button type="button" onClick={fetchDeviceAdminSupportStatus}>
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
