import React, { ChangeEvent } from "react";

interface CheckBoxProps {
  name: string;
  checked: number;
  onChecked: (event: ChangeEvent<HTMLInputElement>) => void;
  description: string;
}

const CheckBox: React.FC<CheckBoxProps> = ({
  name,
  checked,
  onChecked,
  description,
}) => {
  return (
    <div className="checkbox">
      <div className="checkbox-wrapper-12">
        <div className="cbx">
          <input
            id="cbx-12"
            type="checkbox"
            name={name}
            checked={checked === 1}
            onChange={onChecked}
          />
          <label htmlFor="cbx-12"></label>
          <svg width="15" height="14" viewBox="0 0 15 14" fill="none">
            <path d="M2 8.36364L6.23077 12L13 2"></path>
          </svg>
        </div>
      </div>
      <p>{description}</p>
    </div>
  );
};
export default CheckBox;
