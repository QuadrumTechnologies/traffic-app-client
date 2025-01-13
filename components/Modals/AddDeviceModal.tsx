import { useFormik } from "formik";
import * as Yup from "yup";
import InformationInput from "../UI/Input/InformationInput";
import Button from "../UI/Button/Button";
import { useState } from "react";
import { MdOutlineClose } from "react-icons/md";
import HttpRequest from "@/store/services/HttpRequest";
import { GetItemFromLocalStorage } from "@/utils/localStorageFunc";
import { emitToastMessage } from "@/utils/toastFunc";
import { getUserDevice } from "@/store/devices/UserDeviceSlice";
import { useAppDispatch } from "@/hooks/reduxHook";

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

  const [isAddingDevice, setisAddingDevice] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [selectedOption, setSelectedOption] = useState<string>("With ID");

  const user = GetItemFromLocalStorage("user");

  const getDeviceToBeAddedDetail = async (deviceId: string) => {
    if (!deviceId) return;
    setIsFetchingDeviceToBeAddedDetails(true);
    try {
      const { data } = await HttpRequest.get(
        `/devices/${deviceId}/${user.email}`
      );
      if (data.device === undefined) {
        return;
      }
      console.log("Confirm Id", data);
      setDeviceToBeAddedDetails(data.device);
      emitToastMessage(data.message, "success");
      setIsFetchingDeviceToBeAddedDetails(false);
    } catch (error: any) {
      console.log("Confirm device Id eror", error);
      setDeviceToBeAddedDetails(null);
      emitToastMessage(error?.response.data.message, "error");
      setIsFetchingDeviceToBeAddedDetails(false);
    }
  };

  const formik = useFormik<FormValuesType>({
    initialValues: {
      deviceType: "",
      deviceId: "",
    },
    validationSchema: Yup.object().shape({
      deviceId: Yup.string().required("Device Id is required"),
    }),
    validateOnChange: true,
    validateOnBlur: true,
    validateOnMount: true,
    onSubmit: async (values, actions) => {
      const { deviceId } = values;
      if (!deviceToBeAddedDetails?.type) {
        emitToastMessage("Please enter Valid ID", "error");
        return;
      }
      try {
        setisAddingDevice(true);
        const { data } = await HttpRequest.post("/devices", {
          deviceId,
          deviceType: deviceToBeAddedDetails?.type,
          email: user.email,
        });
        console.log("User add device response", data);
        setSuccessMessage(data.message);
        emitToastMessage(data.message, "success");
        closeModal();
        dispatch(getUserDevice(user.email));
        setisAddingDevice(false);
      } catch (error: any) {
        console.log("User add device error", error);
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
                  onChange={(e) => {
                    formik.handleChange(e);
                  }}
                  onBlur={(e) => {
                    formik.handleBlur(e);
                    // if (!formik.errors.deviceId && formik.touched.deviceId) getDeviceToBeAddedDetail(formik.values.deviceId);
                  }}
                  inputErrorMessage={formik.errors.deviceId}
                  invalid={!!formik.errors.deviceId && formik.touched.deviceId}
                  placeholder="Enter the Device ID"
                />
                {
                  <button
                    className="addDeviceOverlay__verify"
                    disabled={
                      !!formik.errors.deviceId && formik.touched.deviceId
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
                }
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
              {errorMessage && <p className="signup-error">{errorMessage}</p>}
              {successMessage && (
                <p className="signup-success">{successMessage}</p>
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
