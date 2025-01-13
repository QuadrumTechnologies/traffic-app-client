import React from "react";
import InlineFeedback from "./InlineFeedback";
import { VscEye } from "react-icons/vsc";
import { VscEyeClosed } from "react-icons/vsc";

interface Props {
  id?: string;
  label?: string;
  type?: string;
  placeholder?: string;
  invalid?: boolean | "";
  showPassword?: boolean | "";
  updatePasswordVisibility?: (e: any) => void;
  name: string;
  value?: string ;
  className?: string ;
  inputErrorMessage?: string | undefined;
  passwordIcon?: boolean;
  onChange?: (e: any) => void;
  onBlur?: (e: any) => void;
  multiple?: boolean | undefined;
  readOnly?: boolean;
}

const InformationInput: React.FC<Props> = ({
  label,
  type,
  inputErrorMessage,
  invalid,
  passwordIcon,
  showPassword,
  updatePasswordVisibility,
  ...others
}) => {
  return (
    <div className="information-group">
      <input {...others} type={type} required />
      <label className="floating-label">{label}</label>
      {passwordIcon && (
        <div
          className={`${
            invalid ? "information-group__icon2" : "information-group__icon"
          }`}
          onClick={updatePasswordVisibility}
        >
          {showPassword ? <VscEye /> : <VscEyeClosed />}
        </div>
      )}
      {invalid && <InlineFeedback status="error" message={inputErrorMessage} />}
    </div>
  );
};
export default InformationInput;
