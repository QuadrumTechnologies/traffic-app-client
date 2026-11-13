"use client";

import { useFormik } from "formik";
import * as Yup from "yup";
import InformationInput from "../UI/Input/InformationInput";
import Button from "../UI/Button/Button";
import { useState } from "react";
import { MdOutlineClose } from "react-icons/md";
import HttpRequest from "@/store/services/HttpRequest";
import { GetItemFromLocalStorage } from "@/utils/localStorageFunc";
import { useAppDispatch } from "@/hooks/reduxHook";
import { getUserDevice } from "@/store/devices/UserDeviceSlice";
import { emitToastMessage } from "@/utils/toastFunc";

interface AddDeviceModalProps {
  closeModal: () => void;
}

interface FormValuesType {
  deviceType: string;
  deviceId: string;
}

const AddDeviceModal: React.FC<AddDeviceModalProps> = ({ closeModal }) => {
  const dispatch = useAppDispatch();
  const [deviceToBeAddedDetails, setDeviceToBeAddedDetails] =
    useState<any>(null);
  const [
    isFetchingDeviceToBeAddedDetails,
    setIsFetchingDeviceToBeAddedDetails,
  ] = useState<boolean>(false);
  const [isAddingDevice, setIsAddingDevice] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string>("With ID");

  const user = GetItemFromLocalStorage("user");

  const getDeviceToBeAddedDetail = async (deviceId: string) => {
    if (!deviceId) return;
    setIsFetchingDeviceToBeAddedDetails(true);
    try {
      const response = await HttpRequest.get(
        `/devices/${deviceId}/${user.email}`
      );
      // The API answers { data: { type, id, department } }; older builds sent { device }.
      const found = response.data?.data || response.data?.device;
      setDeviceToBeAddedDetails(found?.type ? found : null);
      setIsFetchingDeviceToBeAddedDetails(false);
      if (!found?.type) emitToastMessage("That device ID couldn't be checked. Try again.", "error");
    } catch (error: any) {
      setDeviceToBeAddedDetails(null);
      setIsFetchingDeviceToBeAddedDetails(false);
      const message = error?.response?.data?.message || `Request failed`;
      emitToastMessage(message, "error");
    }
  };

  const formik = useFormik<FormValuesType>({
    initialValues: {
      deviceType: "",
      deviceId: "",
    },
    validationSchema: Yup.object().shape({
      deviceId: Yup.string().required("Device ID is required"),
    }),
    validateOnChange: true,
    validateOnBlur: true,
    validateOnMount: true,
    onSubmit: async (values) => {
      const deviceId = values.deviceId.trim();
      if (!deviceToBeAddedDetails?.type) {
        // Enter before Verify: check the ID first; Add is the next step.
        getDeviceToBeAddedDetail(deviceId);
        return;
      }
      try {
        setIsAddingDevice(true);
        await HttpRequest.post("/devices", {
          deviceId,
          deviceType: deviceToBeAddedDetails?.type,
          email: user.email,
        });
        dispatch(getUserDevice(user.email));
        closeModal();
      } catch (error: any) {
        const message = error?.response?.data?.message || `Request failed`;
        emitToastMessage(message, "error");
      } finally {
        setIsAddingDevice(false);
      }
    },
  });

  // QR scanning returns as a tab once it exists.
  const addingDeviceOptions = ["With ID", "Buy"];

  const renderForm = () => {
    switch (selectedOption) {
      case "With ID":
        return (
          <>
            <h2 className="addDeviceOverlay-text">Add a controller</h2>
            <p className="addDeviceOverlay-hint">Type the device ID from the controller&rsquo;s label. It must be recorded to your email when you bought it.</p>
            <form onSubmit={formik.handleSubmit}>
              <div className="addDeviceOverlay__firstrow">
                <InformationInput
                  id="deviceId"
                  type="text"
                  name="deviceId"
                  value={formik.values.deviceId}
                  onChange={(e) => {
                    formik.handleChange(e);
                    // A new ID needs checking again before it can be added.
                    setDeviceToBeAddedDetails(null);
                  }}
                  onBlur={formik.handleBlur}
                  inputErrorMessage={formik.errors.deviceId}
                  invalid={!!formik.errors.deviceId && formik.touched.deviceId}
                  placeholder="Device ID from the label"
                />
                <button
                  className="addDeviceOverlay__verify"
                  disabled={
                    isFetchingDeviceToBeAddedDetails ||
                    !formik.values.deviceId.trim()
                  }
                  type="button"
                  onClick={() =>
                    getDeviceToBeAddedDetail(formik.values.deviceId.trim())
                  }
                >
                  {isFetchingDeviceToBeAddedDetails
                    ? "Verifying..."
                    : "Verify ID"}
                </button>
              </div>
              {deviceToBeAddedDetails?.type && (
                <InformationInput
                  id="deviceType"
                  type="text"
                  name="deviceType"
                  value={deviceToBeAddedDetails?.type}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  inputErrorMessage={formik.errors.deviceType}
                  invalid={
                    !!formik.errors.deviceType && formik.touched.deviceType
                  }
                  placeholder={deviceToBeAddedDetails?.type}
                  readOnly
                />
              )}
              <Button
                type="submit"
                disabled={
                  isAddingDevice ||
                  !formik.isValid ||
                  !deviceToBeAddedDetails?.type
                }
              >
                {isAddingDevice ? "Adding..." : "Add"}
              </Button>
            </form>
          </>
        );
      case "Buy":
        return (
          <>
            <h2 className="addDeviceOverlay-text">Buy a controller</h2>
            <p>
              Controllers are quoted per junction.{" "}
              <a href="/request-access?purpose=buy">Ask Quadrum for a quote</a>.
            </p>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div className="addDeviceOverlay">
      <div className="" onClick={closeModal}>
        <MdOutlineClose className="addDeviceOverlay-icon" />
      </div>
      <ul className="addDeviceOverlay__device--options">
        {addingDeviceOptions.map((opt: string, index: number) => (
          <li
            key={index}
            className={selectedOption === opt ? "active" : ""}
            onClick={() => setSelectedOption(opt)}
          >
            {opt}
          </li>
        ))}
      </ul>
      {renderForm()}
    </div>
  );
};

export default AddDeviceModal;
