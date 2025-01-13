"use client";

import NormalInput from "@/components/UI/Input/NormalInput";
import SelectField, { Option } from "@/components/UI/SelectField/SelectField";
import { useFormik } from "formik";
import { useState } from "react";
import * as Yup from "yup";

interface DeviceConfigurationPageProps {
  params: any;
}

const intersectionTypeOptions: Option[] = [
  { label: "Cross Intersection (Four-way)", value: "four_way" },
  { label: "T Intersection (Three-way)", value: "three_way" },
];

const controlTypeOptions: Option[] = [
  { label: "Traffic Lights", value: "traffic_lights" },
  { label: "Stop Signs", value: "stop_signs" },
  { label: "Yield Signs", value: "yield_signs" },
  { label: "No Control", value: "no_control" },
];

const wirelessApproachOptions: Option[] = [
  { label: "WiFi", value: "wifi" },
  { label: "Bluetooth", value: "bluetooth" },
  { label: "Zigbee", value: "zigbee" },
  { label: "LoRaWAN", value: "lorawan" },
];

const moduleTypeOptions: Option[] = [
  { value: "sensor", label: "Sensor Module" },
  { value: "controller", label: "Controller Module" },
  { value: "interface", label: "Interface Module" },
  { value: "communication", label: "Communication Module" },
  { value: "power", label: "Power Module" },
];

const communicationChannelOptions: Option[] = [
  { value: "wifi", label: "Wi-Fi" },
  { value: "bluetooth", label: "Bluetooth" },
  { value: "ethernet", label: "Ethernet" },
  { value: "zigbee", label: "ZigBee" },
  { value: "cellular", label: "Cellular" },
];

const energyManagementOptions: Option[] = [
  { value: "solar", label: "Solar Power" },
  { value: "battery", label: "Battery Management" },
  { value: "grid", label: "Grid Power" },
  { value: "hybrid", label: "Hybrid System" },
  { value: "renewable", label: "Renewable Energy" },
];

const DeviceConfigurationPage: React.FC<DeviceConfigurationPageProps> = ({
  params,
}) => {
  console.log("Device ID Config Page", params);
  const [showPassword, setShowPassword] = useState<boolean>(false);

  const validationSchema = Yup.object({
    signalBrighness: Yup.string().required("Signal Brighness is required"),
    notifications: Yup.string().required("Notifications is required"),
    date: Yup.date().required("Date is required"),
    time: Yup.string().required("Time is required"),
    batteryStatus: Yup.string().required("Battery Status is required"),
    wifiStatus: Yup.string().required("WiFi Status is required"),
    wifiPassword: Yup.string().required("WiFi Password is required"),
    wifiName: Yup.string().required("Wifi Name is required"),
    intersectionId: Yup.string().required("Intersection ID is required"),
    intersectionPassword: Yup.string().required(
      "Intersection Password is required"
    ),
    intersectionType: Yup.object().required("Intersection Type is required"),
    controlType: Yup.object().required("Control Type is required"),
    wirelessApproach: Yup.object().required("Wireless Approach is required"),
    moduleType: Yup.object().required("Module Type is required"),
    communicationChannel: Yup.object().required(
      "Communication Channel is required"
    ),
    energyManagement: Yup.object().required("Energy Management is required"),
  });

  const formik = useFormik({
    initialValues: {
      signalBrighness: "",
      notifications: "",
      date: "",
      time: "",
      batteryStatus: "",
      wifiStatus: "",
      wifiPassword: "",
      wifiName: "",
      intersectionId: "",
      intersectionPassword: "",
      intersectionType: null,
      controlType: null,
      wirelessApproach: null,
      moduleType: null,
      communicationChannel: null,
      energyManagement: null,
    },
    validationSchema,
    validateOnChange: true,
    validateOnBlur: true,
    validateOnMount: true,
    async onSubmit(values, actions) {
      const {} = values;
      try {
      } catch (error: any) {
      } finally {
        actions.setSubmitting(false);
      }
    },
  });

  return (
    <section className="deviceConfigPage">
      <h2 className="deviceConfigPage__header">Device Configurations</h2>
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
                  value={params.deviceId}
                  readOnly
                />
                <NormalInput
                  id="deviceKey"
                  name="deviceKey"
                  label="Device Key"
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
            <div className="deviceConfigPage__firstBox--middle">
              <p className="deviceConfigPage__firstBox--header">
                WiFi Configuration
              </p>
              <div className="deviceConfigPage__firstBox--inputs">
                <NormalInput
                  id="wifiName"
                  type="text"
                  name="wifiName"
                  label="WiFi Name"
                  invalid={formik.errors.wifiName && formik.touched.wifiName}
                  placeholder=""
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.wifiName}
                  inputErrorMessage={formik.errors.wifiName}
                />
                <NormalInput
                  id="wifiPassword"
                  type={showPassword ? "text" : "password"}
                  name="wifiPassword"
                  label="WiFi Password"
                  invalid={
                    formik.errors.wifiPassword && formik.touched.wifiPassword
                  }
                  placeholder=""
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.wifiPassword}
                  inputErrorMessage={formik.errors.wifiPassword}
                  passwordIcon={true}
                  showPassword={showPassword}
                  updatePasswordVisibility={() => {
                    setShowPassword((prev) => !prev);
                  }}
                />
              </div>
            </div>
            <div className="deviceConfigPage__firstBox--bottom">
              <p className="deviceConfigPage__firstBox--header">
                Device Functions
              </p>
              <div className="deviceConfigPage__firstBox--inputs">
                <SelectField
                  onChange={(option) =>
                    formik.setFieldValue("intersectionType", option)
                  }
                  value={formik.values.intersectionType}
                  options={intersectionTypeOptions}
                  placeholder="Select Intersection Type"
                />

                <SelectField
                  onChange={(option) =>
                    formik.setFieldValue("controlType", option)
                  }
                  value={formik.values.controlType}
                  options={controlTypeOptions}
                  placeholder="Select Control Type"
                />

                <SelectField
                  onChange={(option) =>
                    formik.setFieldValue("wirelessApproach", option)
                  }
                  value={formik.values.wirelessApproach}
                  options={wirelessApproachOptions}
                  placeholder="Select Wireless Approach"
                />
                <SelectField
                  onChange={(option) =>
                    formik.setFieldValue("moduleType", option)
                  }
                  value={formik.values.moduleType}
                  options={moduleTypeOptions}
                  placeholder="Select Module Type"
                />
                <SelectField
                  onChange={(option) =>
                    formik.setFieldValue("communicationChannel", option)
                  }
                  value={formik.values.communicationChannel}
                  options={communicationChannelOptions}
                  placeholder="Select Communucation Channel"
                />
                <SelectField
                  onChange={(option) =>
                    formik.setFieldValue("energyManagement", option)
                  }
                  value={formik.values.energyManagement}
                  options={energyManagementOptions}
                  placeholder="Select Power Options"
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
                <NormalInput
                  id="signalBrighness"
                  type="tex"
                  name="signalBrighness"
                  label="Signal Brightness"
                  invalid={
                    formik.errors.signalBrighness &&
                    formik.touched.signalBrighness
                  }
                  placeholder=""
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.signalBrighness}
                  inputErrorMessage={formik.errors.signalBrighness}
                />
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
                  type="date"
                  name="date"
                  label="Date"
                  invalid={formik.errors.date && formik.touched.date}
                  placeholder=""
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.date}
                  inputErrorMessage={formik.errors.date}
                />
                <NormalInput
                  id="time"
                  type="time"
                  name="time"
                  label="Time"
                  invalid={formik.errors.time && formik.touched.time}
                  placeholder=""
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.time}
                  inputErrorMessage={formik.errors.time}
                />
                <NormalInput
                  id="batteryStatus"
                  type="text"
                  name="batteryStatus"
                  label="Battery Status"
                  invalid={
                    formik.errors.batteryStatus && formik.touched.batteryStatus
                  }
                  placeholder=""
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.batteryStatus}
                  inputErrorMessage={formik.errors.batteryStatus}
                />
                <NormalInput
                  id="wifiStatus"
                  type="text"
                  name="wifiStatus"
                  label="WiFi Status"
                  invalid={
                    formik.errors.wifiStatus && formik.touched.wifiStatus
                  }
                  placeholder=""
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.wifiStatus}
                  inputErrorMessage={formik.errors.wifiStatus}
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
                  type="tex"
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
              </div>
            </div>

            <div className="deviceConfigPage__button--box">
              <button type="submit">Read Configuration</button>
              <button type="submit" disabled={!formik.isValid}>
                Save Configuration
              </button>
            </div>
          </div>
        </div>
      </form>
    </section>
  );
};

export default DeviceConfigurationPage;
