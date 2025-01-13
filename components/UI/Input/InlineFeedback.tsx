import { BiSolidErrorAlt } from "react-icons/bi";

interface InlineFeedbackProps {
  status: "error" | "success";
  message: string | undefined;
}

const InlineFeedback: React.FC<InlineFeedbackProps> = ({ status, message }) => {
  return (
    <div className="feedback">
      <BiSolidErrorAlt
        className={`feedback-icon ${
          status === "success"
            ? "feedback-icon__success"
            : "feedback-icon__error"
        }`}
      />
      <p
        className={`feedback-message ${
          status === "success"
            ? "feedback-message__success"
            : "feedback-message__error"
        }`}
      >
        {message}
      </p>
    </div>
  );
};

export default InlineFeedback;
