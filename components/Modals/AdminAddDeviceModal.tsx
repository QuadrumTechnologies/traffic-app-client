"use client";

import { useFormik } from "formik";
import * as Yup from "yup";
import InformationInput from "../UI/Input/InformationInput";
import Button from "../UI/Button/Button";
import { useState } from "react";
import { MdOutlineClose } from "react-icons/md";
import { deviceTypes } from "@/utils/deviceTypes";
import { GetItemFromLocalStorage } from "@/utils/localStorageFunc";
import HttpRequest from "@/store/services/HttpRequest";
import SelectField, { Option } from "../UI/SelectField/SelectField";
import { useAppDispatch } from "@/hooks/reduxHook";
import { getAdminDevice } from "@/store/devices/AdminDeviceSlice";

interface AdminAddDeviceModalProps {
  closeModal: () => void;
}

interface FormValuesType {
  deviceType: string;
  deviceId: string;
  deviceStatus: Option | null;
  ownerEmail: string;
  purchasedDate: string;
}

const AdminAddDeviceModal: React.FC<AdminAddDeviceModalProps> = ({
  closeModal,
}) => {
  const dispatch = useAppDispatch();
  const [isAddingDevice, setIsAddingDevice] = useState(false);

  const adminUser = GetItemFromLocalStorage("adminUser");
  const device = deviceTypes.find(
    (dev) => dev.department === adminUser.department
  );

  const options: Option[] = [
    { value: "available", label: "Available" },
    { value: "purchased", label: "Purchased" },
  ];

  const formik = useFormik<FormValuesType>({
    initialValues: {
      deviceType: device?.type || "",
      deviceId: "",
      deviceStatus: null,
      ownerEmail: "",
      purchasedDate: "",
    },
    validationSchema: Yup.object().shape({
      deviceType: Yup.string().required("Device Type is required"),
      deviceId: Yup.string().required("Device ID is required"),
      deviceStatus: Yup.object()
        .shape({
          value: Yup.string().required("Please select a device status"),
          label: Yup.string().required("Please select a device status"),
        })
        .nullable()
        .required("Please select a device status"),
      ownerEmail: Yup.string().when("deviceStatus.value", {
        is: "purchased",
        then: () =>
          Yup.string()
            .email("Invalid email")
            .required("Owner email is required when device is purchased"),
        otherwise: () => Yup.string().notRequired(),
      }),
      purchasedDate: Yup.date().when("deviceStatus.value", {
        is: "purchased",
        then: () =>
          Yup.date().required(
            "Purchase date is required when device is purchased"
          ),
        otherwise: () => Yup.date().notRequired(),
      }),
    }),
    validateOnChange: true,
    validateOnBlur: true,
    validateOnMount: true,
    onSubmit: async (values) => {
      const { deviceType, deviceId, deviceStatus, ownerEmail, purchasedDate } =
        values;
      try {
        setIsAddingDevice(true);
        await HttpRequest.post("/admin/devices", {
          deviceId,
          deviceType,
          adminEmail: adminUser.email,
          deviceStatus: deviceStatus?.value,
          ownerEmail,
          purchasedDate,
        });
        dispatch(getAdminDevice(device));
        closeModal();
      } catch (error: any) {
        const message = error?.response?.data?.message || `Request failed`;
        emitToastMessage(message, "error");
      } finally {
        setIsAddingDevice(false);
      }
    },
  });

  return (
    <div className="addDeviceOverlay">
      <div className="" onClick={closeModal}>
        <MdOutlineClose className="addDeviceOverlay-icon" />
      </div>
      <h2 className="addDeviceOverlay-text">Add Device</h2>
      <form onSubmit={formik.handleSubmit}>
        <InformationInput
          id="deviceType"
          type="text"
          name="deviceType"
          value={formik.values.deviceType}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          inputErrorMessage={formik.errors.deviceType}
          invalid={!!formik.errors.deviceType && formik.touched.deviceType}
          placeholder="Device Type"
          readOnly
        />
        <InformationInput
          id="deviceId"
          type="text"
          name="deviceId"
          value={formik.values.deviceId}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          inputErrorMessage={formik.errors.deviceId}
          invalid={!!formik.errors.deviceId && formik.touched.deviceId}
          placeholder="Enter the Device ID"
        />
        <div style={{ marginBottom: "2rem" }}>
          <SelectField
            label="Select Device Status"
            onChange={(option) => formik.setFieldValue("deviceStatus", option)}
            value={formik.values.deviceStatus}
            options={options}
            placeholder="Has the device been purchased?"
          />
          {formik.touched.deviceStatus && formik.errors.deviceStatus && (
            <p className="signup-error">{formik.errors.deviceStatus}</p>
          )}
        </div>
        {formik.values.deviceStatus?.value === "purchased" && (
          <div className="addDeviceOverlay__status">
            <InformationInput
              id="ownerEmail"
              type="text"
              name="ownerEmail"
              value={formik.values.ownerEmail}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              inputErrorMessage={formik.errors.ownerEmail}
              invalid={!!formik.errors.ownerEmail && formik.touched.ownerEmail}
              placeholder="Enter Owner's Email"
            />
            <InformationInput
              id="purchasedDate"
              type="date"
              name="purchasedDate"
              className="date"
              value={formik.values.purchasedDate}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              inputErrorMessage={formik.errors.purchasedDate}
              invalid={
                !!formik.errors.purchasedDate && formik.touched.purchasedDate
              }
              placeholder="Select the purchased date"
            />
          </div>
        )}
        <Button type="submit" disabled={isAddingDevice || !formik.isValid}>
          {isAddingDevice ? "Adding..." : "Add"}
        </Button>
      </form>
    </div>
  );
};

export default AdminAddDeviceModal;
