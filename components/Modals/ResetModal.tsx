"use client";

import { useFormik } from "formik";
import * as Yup from "yup";
import InformationInput from "../UI/Input/InformationInput";
import { useEffect, useState } from "react";
import { MdOutlineClose } from "react-icons/md";
import HttpRequest from "@/store/services/HttpRequest";
import { getWebSocket } from "@/app/dashboard/websocket";
import { emitToastMessage } from "@/utils/toastFunc";

interface ResetModalProps {
  device: any | null;
  closeModal: () => void;
}

interface FormValuesType {
  deviceId: string;
}

const ResetModal: React.FC<ResetModalProps> = ({ device, closeModal }) => {
  const [isResetting, setIsResetting] = useState(false);

  const formik = useFormik<FormValuesType>({
    initialValues: {
      deviceId: "",
    },
    validationSchema: Yup.object().shape({
      deviceId: Yup.string()
        .required("Device ID is required")
        .matches(
          /^[A-Za-z0-9-]+$/,
          "Device ID must contain only letters, numbers, or hyphens"
        ),
    }),
    validateOnChange: true,
    validateOnBlur: true,
    validateOnMount: true,
    onSubmit: async (values) => {
      if (values.deviceId !== device?.deviceId) {
        emitToastMessage("Device ID does not match.", "error");
        return;
      }
      try {
        setIsResetting(true);
        const response = await HttpRequest.delete(
          `/devices/${values.deviceId}/reset`
        );
        const socket = getWebSocket();
        socket.send(
          JSON.stringify({
            event: "device_reset_request",
            payload: {
              DeviceID: values.deviceId,
            },
          })
        );
        formik.resetForm();
        closeModal();
      } catch (error: any) {
        const message = error?.response?.data?.message || `Request failed`;
        emitToastMessage(message, "error");
      } finally {
        setIsResetting(false);
      }
    },
  });

  useEffect(() => {
    const socket = getWebSocket();
    const handleFeedback = (event: MessageEvent) => {
      const feedback = JSON.parse(event.data);
      if (feedback.event !== "device_reset_feedback") return;
      if (feedback.payload.error) {
        emitToastMessage(feedback.payload.message, "error");
      } else {
        emitToastMessage(feedback.payload.message, "success");
        formik.resetForm();
        closeModal();
      }
    };
    socket?.addEventListener("message", handleFeedback);
    return () => {
      socket?.removeEventListener("message", handleFeedback);
    };
  }, [formik, closeModal]);

  return (
    <div className="resetOverlay">
      <div className="" onClick={closeModal}>
        <MdOutlineClose className="resetOverlay-icon" />
      </div>
      <h2 className="resetOverlay-text">
        This action will reset all configurations for the device with ID{" "}
        {device?.deviceId}.
      </h2>
      <h3 className="resetOverlay-text_2">
        If you wish to continue, enter <span>{device?.deviceId}</span> in the
        field below
      </h3>
      <form onSubmit={formik.handleSubmit}>
        <InformationInput
          id="deviceId"
          type="text"
          name="deviceId"
          value={formik.values.deviceId}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          inputErrorMessage={formik.errors.deviceId}
          placeholder="Enter Device ID"
        />
        <button
          className="resetOverlay-button"
          type="submit"
          disabled={isResetting || !formik.isValid}
        >
          {isResetting ? "Resetting..." : "Reset"}
        </button>
      </form>
    </div>
  );
};

export default ResetModal;
