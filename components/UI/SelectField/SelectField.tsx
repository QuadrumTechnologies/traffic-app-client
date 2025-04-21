"use client";

import React, { useState } from "react";
import Select, {
  StylesConfig,
  components,
  ControlProps,
  OptionProps,
  SingleValue,
  ActionMeta,
} from "react-select";

export interface Option {
  value: string;
  label: string;
}

interface SelectFieldProps<T extends Option = Option> {
  label?: string;
  onChange: (newValue: SingleValue<T>, actionMeta: ActionMeta<T>) => void;
  status?: "success" | "error" | "warning" | null;
  helper?: string | null;
  value?: SingleValue<T>;
  options: readonly T[];
  placeholder?: string;
  name?: string;
  disabled?: boolean;
  className?: string;
  width?: string;
  style?: React.CSSProperties;
  isSearchable?: boolean;
  height?: string;
  leftIcon?: React.ReactNode;
  isClearable?: boolean;
}

function SelectField<T extends Option = Option>({
  onChange,
  value = null,
  options,
  label,
  placeholder = "Select...",
  name,
  status,
  helper,
  disabled = false,
  className = "",
  width,
  isSearchable = true,
  style,
  height,
  leftIcon,
  isClearable = false,
}: SelectFieldProps<T>): React.ReactElement {
  const [selectedOption, setSelectedOption] = useState<SingleValue<T>>(value);

  const customStyles: StylesConfig<T, false> = {
    control: (provided, state) => ({
      ...provided,
      padding: leftIcon ? "0 14px 0 0" : "0 2px",
      boxShadow: "none",
      borderColor: state.isFocused ? "#D0D5DD" : "#D0D5DD",
      borderWidth: "1px",
      marginTop: "4px",
      borderRadius: "8px",
      height: height || "43px",
      minHeight: "43px",
      backgroundColor: "#FFFFFF",
      fontSize: "14px",
      "&:hover": {
        borderColor: "#D0D5DD",
      },
    }),
    valueContainer: (provided) => ({
      ...provided,
      padding: leftIcon ? "0 0 0 10px" : "0 10px",
    }),
    singleValue: (provided) => ({
      ...provided,
      color: "#101828",
    }),
    placeholder: (provided) => ({
      ...provided,
      color: "#667085",
    }),
    indicatorSeparator: () => ({ display: "none" }),
    dropdownIndicator: (provided) => ({
      ...provided,
      color: "#667085",
      "&:hover": {
        color: "#101828",
      },
    }),
    menuList: (provided) => ({
      ...provided,
      maxHeight: "200px",
      overflowY: "auto",
      "&::-webkit-scrollbar": {
        width: "6px",
      },
      "&::-webkit-scrollbar-track": {
        background: "#f1f1f1",
      },
      "&::-webkit-scrollbar-thumb": {
        background: "#D0D5DD",
        borderRadius: "50%",
      },
      "&::-webkit-scrollbar-thumb:hover": {
        background: "#667085",
      },
    }),
    menu: (provided) => ({
      ...provided,
      position: "absolute",
      zIndex: 9999,
      background: "#fff",
      border: "1px solid #EAECF0",
      borderRadius: "8px",
      fontSize: "13px",
      boxShadow:
        "0px 4px 6px -2px rgba(16, 24, 40, 0.03), 0px 12px 16px -4px rgba(16, 24, 40, 0.08)",
    }),
    menuPortal: (provided) => ({
      ...provided,
      zIndex: 9999,
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isSelected ? "#F9FAFB" : "white",
      color: "#101828",
      "&:hover": {
        backgroundColor: "#F9FAFB",
        cursor: "pointer",
      },
    }),
  };

  // Custom control component with left icon support
  const CustomControl = (props: ControlProps<T, false>) => (
    <components.Control {...props}>
      {leftIcon && <div className="pl-3 text-gray-500">{leftIcon}</div>}
      {props.children}
    </components.Control>
  );

  // Custom option component for additional styling if needed
  const CustomOption = (props: OptionProps<T, false>) => (
    <components.Option {...props}>{props.children}</components.Option>
  );

  const handleInputChange = (
    newValue: SingleValue<T>,
    actionMeta: ActionMeta<T>
  ) => {
    setSelectedOption(newValue);
    onChange(newValue, actionMeta);
  };

  return (
    <div
      style={{
        ...style,
        width: width || "100%",
        position: "relative",
      }}
      className={className}
    >
      {label && <label className="normalInput__label">{label}</label>}
      <Select<T, false>
        menuPortalTarget={document.body}
        components={{
          Control: CustomControl,
          Option: CustomOption,
          DropdownIndicator: (props) => (
            <components.DropdownIndicator {...props}>
              <svg
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M5 7.5L10 12.5L15 7.5"
                  stroke="#667085"
                  strokeWidth="1.66667"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </components.DropdownIndicator>
          ),
        }}
        styles={customStyles}
        onChange={handleInputChange}
        value={selectedOption}
        options={options}
        placeholder={placeholder}
        name={name}
        isDisabled={disabled}
        isSearchable={isSearchable}
        isClearable={isClearable}
      />
      {helper && <p className="mt-1 text-sm text-gray-500">{helper}</p>}
    </div>
  );
}

export default SelectField;
