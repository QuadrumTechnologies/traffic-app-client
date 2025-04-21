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

interface DeviceConfigurationPageProps {
  params: any;
}

const BRIGHTNESS_LEVELS = [20, 40, 60, 80, 100];

const DeviceConfigurationPage: React.FC<DeviceConfigurationPageProps> = ({
  params,
}) => {
  const dispatch = useAppDispatch();
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showIntersectionPassword, setShowIntersectionPassword] =
    useState<boolean>(false);
  const [adminSupport, setAdminSupport] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [signalConfig, setSignalConfig] = useState<string>("active_low_cp");

  const rfModuleOptions: Option[] = [
    { value: "custom", label: "Custom" },
    { value: "2.4ghz_nrf24", label: "2.4GHz nRF24" },
    { value: "433mhz_lora", label: "433MHz LoRa" },
    { value: "hybrid_lora_nrf24", label: "Hybrid (LoRa+nRF24)" },
  ];

  const {
    devices,
    deviceAvailability,
    currentDeviceInfoData,
    deviceActiveStateData,
  } = useAppSelector((state) => state.userDevice);

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
  }, [params.deviceId, dispatch]);

  const handleSignalPowerToggle = () => {
    formik.setFieldValue("signalPower", !formik.values.signalPower);
  };

  const handleSignalConfigChange = (value: string) => {
    setSignalConfig(value);
    formik.setFieldValue("signalConfig", value);
  };

  const handleFlashOnPoorSignalChange = () => {
    formik.setFieldValue("flashOnPoorSignal", !formik.values.flashOnPoorSignal);
  };

  const handleRfModuleVersionChange = (selectedOption: Option | null) => {
    formik.setFieldValue("rfModuleVersion", selectedOption?.value || "custom");
  };

  useEffect(() => {
    if (currentDeviceInfoData && deviceActiveStateData) {
      formik.setValues({
        ...formik.values,
        signalPower: deviceActiveStateData.Power,
      });
    }
  }, [currentDeviceInfoData, deviceActiveStateData]);

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

  // TODO: Add a function to send the signal power value to the backend
  const handleSignalPowerChange = (value: boolean) => {
    console.log("Sending signal power value to backend:", value);
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
      signalConfig: "active_low_cp",
      flashOnPoorSignal: false,
      rfModuleVersion: "custom",
    },
    validationSchema,
    validateOnChange: true,
    validateOnBlur: true,
    validateOnMount: true,
    async onSubmit(values, actions) {
      try {
        console.log("Submitting values:", {
          signalBrightness: values.signalBrightness,
          signalPower: values.signalPower,
          minimumBatteryLevel: values.minimumBatteryLevel,
          signalConfig: values.signalConfig,
          flashOnPoorSignal: values.flashOnPoorSignal,
          rfModuleVersion: values.rfModuleVersion,
        });
        return;
        setIsSubmitting(true);
        const response = await HttpRequest.patch(
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

  const handleBrightnessChange = (value: number | number[]) => {
    if (typeof value === "number") {
      formik.setFieldValue("signalBrightness", value);
    }
  };

  // TODO: Add a function to send the brightness value to the backend
  const handleBrightnessAfterChange = (value: number | number[]) => {
    if (typeof value === "number") {
      console.log("Sending brightness value to backend:", value);
    }
  };

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
                  value={params.deviceId || deviceAvailability?.DeviceID || ""}
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
                  type={showIntersectionPassword ? "text" : "password"}
                  name="intersectionPassword"
                  label="Intersection Password"
                  value={currentDeviceInfoData?.JunctionId || ""}
                  passwordIcon={true}
                  showPassword={showIntersectionPassword}
                  updatePasswordVisibility={() => {
                    setShowIntersectionPassword((prev) => !prev);
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
                  <label className="">
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
