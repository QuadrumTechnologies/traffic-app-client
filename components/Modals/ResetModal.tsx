import { useFormik } from "formik";
import * as Yup from "yup";
import InformationInput from "../UI/Input/InformationInput";
import { useEffect, useState } from "react";
import { MdOutlineClose } from "react-icons/md";
import HttpRequest from "@/store/services/HttpRequest";
import { getWebSocket } from "@/app/dashboard/websocket";
import { emitToastMessage } from "@/utils/toastFunc";

interface ResetModalProps {
  course: any | null;
  closeModal: () => void;
}

interface FormValuesType {
  courseCode: string;
}

const ResetModal: React.FC<ResetModalProps> = ({ course, closeModal }) => {
  const [isResetting, setIsResetting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const formik = useFormik<FormValuesType>({
    initialValues: {
      courseCode: "",
    },
    validationSchema: Yup.object().shape({
      courseCode: Yup.string()
        .required("Course Code is required")
        .matches(/^[A-Z]{3} \d{3}$/, "Course must be in the format 'XXX 000'"),
    }),
    validateOnChange: true,
    validateOnBlur: true,
    validateOnMount: true,
    onSubmit: async (values, actions) => {
      try {
        setIsResetting(true);
        const response = await HttpRequest.delete(
          `/courses/${values?.courseCode}/reset`
        );

        const socket = getWebSocket();

        // Function to emit delete_fingerprint event
        const emitDeleteFingerprintEvent = (matricNos: string[]) => {
          socket?.send(
            JSON.stringify({
              event: "delete_fingerprint",
              payload: {
                students: matricNos,
                courseCode: response.data.courseCode,
              },
            })
          );
        };

        const students = response.data.students;
        const studentsMatricNos = students.map((stud: any) => stud.matricNo);
        emitDeleteFingerprintEvent(studentsMatricNos);

        // Reset formData and close modal after enroll_feedback
        formik.resetForm();
      } catch (error) {
        setErrorMessage("Failed to reset course. Try again!");
        emitToastMessage("Failed to reset course. Try again!", "error");
      } finally {
        setIsResetting(false);
        setTimeout(() => {
          setErrorMessage("");
          setSuccessMessage("");
        }, 7000);
      }
    },
  });
  useEffect(() => {
    const socket = getWebSocket();

    const handleAttendanceFeedback = (event: MessageEvent) => {
      const feedback = JSON.parse(event.data);
      if (feedback.event !== "delete_fingerprint_feedback") return;

      if (feedback.payload.error) {
        setSuccessMessage("");
        setErrorMessage(feedback.payload.message);
        emitToastMessage(feedback.payload.message, "error");
      } else {
        formik.resetForm();
        setSuccessMessage(feedback.payload.message);
        emitToastMessage(feedback.payload.message, "success");
      }
      setTimeout(() => {
        setErrorMessage("");
        setSuccessMessage("");
      }, 7000);
    };

    socket?.addEventListener("message", handleAttendanceFeedback);

    return () => {
      socket?.removeEventListener("message", handleAttendanceFeedback);
    };
  }, []);

  return (
    <div className="resetOverlay">
      <div className="" onClick={closeModal}>
        <MdOutlineClose className="resetOverlay-icon" />
      </div>
      <h2 className="resetOverlay-text">
        This action will remove all enrolled students and attendance records for
        the course with the code {course?.courseCode}.
      </h2>
      <h3 className="resetOverlay-text_2">
        If you wish to continue, enter <span>{course?.courseCode}</span> in the
        field below
      </h3>
      <form onSubmit={formik.handleSubmit}>
        <InformationInput
          id="courseCode"
          type="text"
          name="courseCode"
          value={formik.values.courseCode}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          inputErrorMessage={formik.errors.courseCode}
          placeholder="e.g ABC 123"
        />
        {errorMessage && <p className="signup-error">{errorMessage}</p>}
        {successMessage && <p className="signup-success">{successMessage}</p>}

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
