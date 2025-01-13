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
  value?: string;
  className?: string;
  inputErrorMessage?: string | undefined;
  passwordIcon?: boolean;
  onChange?: (e: any) => void;
  onBlur?: (e: any) => void;
  multiple?: boolean | undefined;
  readOnly?: boolean;
}

const NormalInput: React.FC<Props> = ({
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
    <div className="normalInput">
      <label className="normalInput__label">{label}</label>
      <input {...others} type={type} required />
      {passwordIcon && (
        <div className="normalInput__icon" onClick={updatePasswordVisibility}>
          {showPassword ? <VscEye /> : <VscEyeClosed />}
        </div>
      )}
      {invalid && <InlineFeedback status="error" message={inputErrorMessage} />}
    </div>
  );
};
export default NormalInput;
