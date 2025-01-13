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
import { emitToastMessage } from "@/utils/toastFunc";
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
  const [isAddingDevice, setisAddingDevice] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const adminUser = GetItemFromLocalStorage("adminUser");
  const deviceType = deviceTypes.find(
    (dev) => dev.department === adminUser.department
  );

  const options: Option[] = [
    { value: "available", label: "Available" },
    { value: "purchased", label: "Purchased" },
  ];

  const formik = useFormik<FormValuesType>({
    initialValues: {
      deviceType: `${deviceType?.type}`,
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
      ownerEmail: Yup.string().when("deviceStatus", {
        is: (deviceStatus: Option | null) =>
          deviceStatus?.value === "purchased",
        then: () =>
          Yup.string()
            .email("Invalid email")
            .required("Owner email is required when device is purchased"),
        otherwise: () => Yup.string().notRequired(),
      }),
      purchasedDate: Yup.date().when("deviceStatus", {
        is: (deviceStatus: Option | null) =>
          deviceStatus?.value === "purchased",
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
    onSubmit: async (values, actions) => {
      const { deviceType, deviceId, deviceStatus, ownerEmail, purchasedDate } =
        values;
      try {
        setisAddingDevice(true);
        const { data } = await HttpRequest.post("/admin/devices", {
          deviceId,
          deviceType,
          adminEmail: adminUser.email,
          deviceStatus,
          ownerEmail,
          purchasedDate,
        });
        console.log("Admin add device sucess", data);
        setSuccessMessage(data.message);
        emitToastMessage(data.message, "success");
        closeModal();
        dispatch(getAdminDevice(adminUser.email));
        setisAddingDevice(false);
      } catch (error: any) {
        console.log("Admin add device error", error);
        emitToastMessage(error?.response.data.message, "error");
        setisAddingDevice(false);
      } finally {
        setTimeout(() => {
          setSuccessMessage("");
          setErrorMessage("");
        }, 7000);
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
          value={deviceType?.type}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          inputErrorMessage={formik.errors.deviceType}
          invalid={!!formik.errors.deviceType && formik.touched.deviceType}
          placeholder={deviceType?.type}
          readOnly
        />

        <InformationInput
          id="deviceId"
          type="test"
          name="deviceId"
          value={formik.values.deviceId}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          inputErrorMessage={formik.errors.deviceId}
          invalid={!!formik.errors.deviceId && formik.touched.deviceId}
          placeholder="Enter the Device ID"
        />
        <SelectField
          onChange={(option) => formik.setFieldValue("deviceStatus", option)}
          value={formik.values.deviceStatus}
          options={options}
          placeholder="Has the device been purchased?"
        />
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
              placeholder="Enter Onwer's Email"
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
        {errorMessage && <p className="signup-error">{errorMessage}</p>}
        {successMessage && <p className="signup-success">{successMessage}</p>}

        <Button type="submit" disabled={isAddingDevice || !formik.isValid}>
          {isAddingDevice ? "Adding..." : "Add"}
        </Button>
      </form>
    </div>
  );
};
export default AdminAddDeviceModal;
