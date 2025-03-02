"use client";

import NormalInput from "@/components/UI/Input/NormalInput";
import LoadingSpinner from "@/components/UI/LoadingSpinner/LoadingSpinner";
import HttpRequest from "@/store/services/HttpRequest";
import { useFormik } from "formik";
import { useEffect, useState } from "react";
import { FaToggleOn, FaToggleOff } from "react-icons/fa";
import * as Yup from "yup";
import Slider from "rc-slider";
import "rc-slider/assets/index.css";
import { useAppSelector } from "@/hooks/reduxHook";
import { formatRtcDate, formatRtcTime } from "@/utils/misc";
import { formatUnixTimestamp } from "../page";

interface DeviceConfigurationPageProps {
  params: any;
}

interface DirectionData {
  // Define the structure of DirectionData
  // Add properties as needed
}

const intersectionTypeOptions = [
  { label: "Cross Intersection (Four-way)", value: "four_way" },
  { label: "T Intersection (Three-way)", value: "three_way" },
];

const controlTypeOptions = [
  { label: "Traffic Lights", value: "traffic_lights" },
  { label: "Stop Signs", value: "stop_signs" },
  { label: "Yield Signs", value: "yield_signs" },
  { label: "No Control", value: "no_control" },
];

const BRIGHTNESS_LEVELS = [10, 20, 30, 40, 50];

const DeviceConfigurationPage: React.FC<DeviceConfigurationPageProps> = ({
  params,
}) => {
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [adminSupport, setAdminSupport] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const { deviceAvailability, currentDeviceInfoData, deviceActiveStateData } =
    useAppSelector((state) => state.userDevice);

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

  const validationSchema = Yup.object({
    signalBrightness: Yup.number()
      .required("Signal Brightness is required")
      .oneOf(BRIGHTNESS_LEVELS, "Invalid brightness level"),
    signalPower: Yup.boolean().required("Signal Power is required"),
    signalLevel: Yup.string()
      .required("Signal Level is required")
      .oneOf(["active_high", "active_low"], "Invalid signal level"),
    notifications: Yup.string().required("Notifications is required"),
    minimumBatteryLevel: Yup.string().required(
      "Minimum Battery Level is required"
    ),
    intersectionId: Yup.string().required("Intersection ID is required"),
    intersectionPassword: Yup.string().required(
      "Intersection Password is required"
    ),
    intersectionLocation: Yup.string().required(
      "Intersection Location is required"
    ),
    intersectionType: Yup.string().required("Intersection Type is required"),
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
      signalBrightness: 30, // Default brightness
      signalPower: deviceActiveStateData?.Power || false,
      signalLevel: "active_high", // Default signal level
      notifications: "",
      minimumBatteryLevel: "",

      // read only fields
      date: rtcDate,
      time: rtcTime,
      intersectionId: currentDeviceInfoData?.JunctionId || "",
      intersectionPassword: "",
      intersectionLocation: "",
      intersectionType: "",
    },
    validationSchema,
    validateOnChange: true,
    validateOnBlur: true,
    validateOnMount: true,
    async onSubmit(values, actions) {
      try {
        setIsSubmitting(true);
        // Send updated configuration to the backend
        const response = await HttpRequest.patch(
          `/user-devices/${params.deviceId}/configuration`,
          {
            signalBrightness: values.signalBrightness,
            signalPower: values.signalPower,
            signalLevel: values.signalLevel,
            notifications: values.notifications,
            minimumBatteryLevel: values.minimumBatteryLevel,
            intersectionId: values.intersectionId,
            intersectionPassword: values.intersectionPassword,
            intersectionLocation: values.intersectionLocation,
            intersectionType: values.intersectionType,
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
      // You could send this value to the backend immediately upon release
      console.log("Sending brightness value to backend:", value);
      // Uncomment to send to backend immediately:
      // HttpRequest.patch(`/user-devices/${params.deviceId}/brightness`, { brightness: value });
    }
  };

  // Toggle handlers
  const handleSignalPowerToggle = () => {
    formik.setFieldValue("signalPower", !formik.values.signalPower);
  };

  const handleSignalLevelToggle = () => {
    formik.setFieldValue(
      "signalLevel",
      formik.values.signalLevel === "active_high" ? "active_low" : "active_high"
    );
  };

  // Update form with Redux data when it changes
  useEffect(() => {
    if (currentDeviceInfoData && deviceActiveStateData) {
      formik.setValues({
        ...formik.values,
        signalPower: deviceActiveStateData.Power,
        date: rtcDate,
        time: rtcTime,
        intersectionId: currentDeviceInfoData.JunctionId,
      });
    }
  }, [currentDeviceInfoData, deviceActiveStateData]);

  if (isLoading) return <LoadingSpinner color="blue" height="big" />;

  return (
    <section className="deviceConfigPage">
      <div className="deviceConfigPage__header--box">
        <h2 className="deviceConfigPage__header">Device Configurations</h2>

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
                  value="12345678"
                  passwordIcon={true}
                  showPassword={showPassword}
                  updatePasswordVisibility={() => {
                    setShowPassword((prev) => !prev);
                  }}
                  readOnly
                />
              </div>
            </div>

            <div className="deviceConfigPage__secondBox--bottom">
              <p className="deviceConfigPage__secondBox--header">
                Intersection Configuration
              </p>
              <div className="deviceConfigPage__secondBox--inputs">
                <NormalInput
                  id="intersectionId"
                  type="text"
                  name="intersectionId"
                  label="Intersection ID"
                  invalid={
                    formik.errors.intersectionId &&
                    formik.touched.intersectionId
                  }
                  placeholder=""
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.intersectionId}
                  inputErrorMessage={formik.errors.intersectionId}
                  readOnly
                />
                <NormalInput
                  id="intersectionPassword"
                  type={showPassword ? "text" : "password"}
                  name="intersectionPassword"
                  label="Intersection Password"
                  invalid={
                    formik.errors.intersectionPassword &&
                    formik.touched.intersectionPassword
                  }
                  placeholder=""
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.intersectionPassword}
                  inputErrorMessage={formik.errors.intersectionPassword}
                  passwordIcon={true}
                  showPassword={showPassword}
                  updatePasswordVisibility={() => {
                    setShowPassword((prev) => !prev);
                  }}
                />
                <NormalInput
                  id="intersectionLocation"
                  type="text"
                  name="intersectionLocation"
                  label="Intersection Location"
                  invalid={
                    formik.errors.intersectionLocation &&
                    formik.touched.intersectionLocation
                  }
                  placeholder=""
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.intersectionLocation}
                  inputErrorMessage={formik.errors.intersectionLocation}
                />
              </div>
            </div>
          </div>

          <div className="deviceConfigPage__secondBox">
            <div className="deviceConfigPage__firstBox--top">
              <p className="deviceConfigPage__secondBox--header">
                Ensure your device is connected to a stable Wi-Fi network for
                optimal performance.
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
                      10: "10%",
                      20: "20%",
                      30: "30%",
                      40: "40%",
                      50: "50%",
                      60: "60%",
                      70: "70%",
                      80: "80%",
                      90: "90%",
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

                {/* Signal Power Toggle */}
                <div
                  className="deviceConfigPage__toggle"
                  style={{ marginTop: "1rem" }}
                >
                  <span>Signal Power:</span>
                  <button
                    onClick={handleSignalPowerToggle}
                    className={`deviceConfigPage__toggle-button ${
                      formik.values.signalPower ? "on" : "off"
                    }`}
                  >
                    {formik.values.signalPower ? (
                      <FaToggleOn size={30} />
                    ) : (
                      <FaToggleOff size={30} />
                    )}
                  </button>
                </div>

                {/* Signal Level Toggle (Active High/Low) */}
                <div className="deviceConfigPage__toggle">
                  <span>
                    Signal Level:{" "}
                    {formik.values.signalLevel === "active_high"
                      ? "Active High"
                      : "Active Low"}
                  </span>
                  <button
                    onClick={handleSignalLevelToggle}
                    className={`deviceConfigPage__toggle-button ${
                      formik.values.signalLevel === "active_high" ? "on" : "off"
                    }`}
                  >
                    {formik.values.signalLevel === "active_high" ? (
                      <FaToggleOn size={30} />
                    ) : (
                      <FaToggleOff size={30} />
                    )}
                  </button>
                </div>

                <NormalInput
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
                />

                <NormalInput
                  id="date"
                  type="text"
                  name="date"
                  label="Date"
                  value={formik.values.date}
                  readOnly
                />

                <NormalInput
                  id="time"
                  type="text"
                  name="time"
                  label="Time"
                  value={formik.values.time}
                  readOnly
                />

                <NormalInput
                  id="minimumBatteryLevel"
                  type="text"
                  name="minimumBatteryLevel"
                  label="Battery Status"
                  invalid={
                    formik.errors.minimumBatteryLevel &&
                    formik.touched.minimumBatteryLevel
                  }
                  placeholder=""
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.minimumBatteryLevel}
                  inputErrorMessage={formik.errors.minimumBatteryLevel}
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
            </div>
          </div>
        </div>
      </form>
    </section>
  );
};

export default DeviceConfigurationPage;
