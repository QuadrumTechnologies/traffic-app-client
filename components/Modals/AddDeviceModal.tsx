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
      if (!response.data.device) {
        setDeviceToBeAddedDetails(null);
        return;
      }
      setDeviceToBeAddedDetails(response.data.device);
      setIsFetchingDeviceToBeAddedDetails(false);
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
      const { deviceId } = values;
      if (!deviceToBeAddedDetails?.type) {
        emitToastMessage("Please enter a valid Device ID", "error");
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

  const addingDeviceOptions = ["With ID", "QR", "Buy"];

  const renderForm = () => {
    switch (selectedOption) {
      case "With ID":
        return (
          <>
            <h2 className="addDeviceOverlay-text">Add Device With ID</h2>
            <form onSubmit={formik.handleSubmit}>
              <div className="addDeviceOverlay__firstrow">
                <InformationInput
                  id="deviceId"
                  type="text"
                  name="deviceId"
                  value={formik.values.deviceId}
                  onChange={formik.handleChange}
                  onBlur={(e) => {
                    formik.handleBlur(e);
                    if (!formik.errors.deviceId && formik.touched.deviceId) {
                      getDeviceToBeAddedDetail(formik.values.deviceId);
                    }
                  }}
                  inputErrorMessage={formik.errors.deviceId}
                  invalid={!!formik.errors.deviceId && formik.touched.deviceId}
                  placeholder="Enter the Device ID"
                />
                <button
                  className="addDeviceOverlay__verify"
                  disabled={
                    isFetchingDeviceToBeAddedDetails ||
                    !!formik.errors.deviceId ||
                    !formik.touched.deviceId
                  }
                  type="button"
                  onClick={() =>
                    getDeviceToBeAddedDetail(formik.values.deviceId)
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
      case "QR":
        return (
          <>
            <h2 className="addDeviceOverlay-text">
              Add Device By Scanning QR Code
            </h2>
            <p>QR Code Scanning coming soon!</p>
          </>
        );
      case "Buy":
        return (
          <>
            <h2 className="addDeviceOverlay-text">Purchase Device Right Now</h2>
            <p>Purchase options coming soon!</p>
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
