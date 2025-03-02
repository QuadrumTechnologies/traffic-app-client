import React, { useEffect, useState } from "react";
import { IoIosArrowDown, IoIosArrowUp } from "react-icons/io";
import Select from "react-select";

export interface Option {
  value: string | number;
  label: string;
}

interface SelectFieldProps {
  label?: string;
  onChange: (selectedOption: Option | null) => void;
  status?: "success" | "error" | "warning" | null;
  helper?: string | null;
  value: any;
  options: Option[];
  placeholder?: string;
  name?: string;
  disabled?: boolean;
  width?: string;
  style?: React.CSSProperties;
  isSearchable?: boolean;
  isClearable?: boolean;
  height?: string;
}

const SelectComponent = Select as unknown as React.FC<any>;
const SelectField: React.FC<SelectFieldProps> = ({
  onChange,
  value,
  options,
  label,
  placeholder = "",
  name,
  status,
  helper,
  disabled,
  width,
  isSearchable = true,
  isClearable,
  style,
  height,
}) => {
  const [optionsIsShown, setOptionsIsShown] = useState<boolean>(false);
  const [selectedOption, setSelectedOption] = useState<Option | null>(value);

  useEffect(() => {
    setSelectedOption(value);
  }, [value]);

  const getBorderColor = (isFocused: boolean) => {
    if (status === "success") return "#2BAC47";
    if (status === "error") return "#C83532";
    if (status === "warning") return "#EF8943";
    return isFocused ? "#C6CDE6" : "#D0D5DD";
  };

  const getBackgroundColor = () => {
    if (status === "success") return "#F1F8F2";
    if (status === "error") return "#FBEFEF";
    if (status === "warning") return "#FDF3EC";
    return "white";
  };

  const handleInputChange = (selectedOption: any) => {
    setSelectedOption(selectedOption);
    setOptionsIsShown(false);
    onChange(selectedOption);
  };

  return (
    <div
      style={{
        ...style,
        width: width || "100%",
        position: "relative",
      }}
    >
      {label && selectedOption && (
        <label
          style={{
            position: "absolute",
            fontSize: "12px",
            color: "#736A85",
            fontWeight: "normal",
            left: "10px",
            top: "-21px",
            zIndex: 10,
          }}
        >
          {label}
        </label>
      )}

      <SelectComponent
        styles={{}}
        components={{
          DropdownIndicator: () => (
            <div
              style={{
                paddingRight: "8px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {optionsIsShown ? <IoIosArrowDown /> : <IoIosArrowUp />}
            </div>
          ),
          IndicatorSeparator: () => null,
        }}
        onChange={handleInputChange}
        value={selectedOption}
        options={options}
        placeholder={placeholder || label}
        menuIsOpen={optionsIsShown}
        name={name}
        isDisabled={disabled}
        isSearchable={isSearchable}
        onMenuOpen={() => setOptionsIsShown(true)}
        onMenuClose={() => setOptionsIsShown(false)}
        isClearable={isClearable}
      />
      {helper && (
        <p
          style={{
            marginTop: "8px",
            fontSize: "14px",
            display: "flex",
            gap: "4px",
            alignItems: "start",
            color:
              status === "success"
                ? "#2BAC47"
                : status === "error"
                ? "#C83532"
                : status === "warning"
                ? "#EF8943"
                : "#736A85",
          }}
        >
          {helper}
        </p>
      )}
    </div>
  );
};

const StatusIcon = ({ status }: { status: string }) => {
  if (status === "success") {
    return (
      <svg
        width="18"
        height="18"
        viewBox="0 0 18 18"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M7 13.6666C3.318 13.6666 0.333328 10.682 0.333328 6.99998C0.333328 3.31798 3.318 0.333313 7 0.333313C10.682 0.333313 13.6667 3.31798 13.6667 6.99998C13.6667 10.682 10.682 13.6666 7 13.6666ZM6.22933 9.98998L10.9427 5.27598L10 4.33331L6.22933 8.10465L4.34333 6.21865L3.40066 7.16131L6.22933 9.98998Z"
          fill="#2BAC47"
        />
      </svg>
    );
  }
  if (status === "error") {
    return (
      <svg
        width="18"
        height="18"
        viewBox="0 0 18 18"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M8 14.6667C4.318 14.6667 1.33333 11.682 1.33333 8.00001C1.33333 4.31801 4.318 1.33334 8 1.33334C11.682 1.33334 14.6667 4.31801 14.6667 8.00001C14.6667 11.682 11.682 14.6667 8 14.6667ZM7.33333 10V11.3333H8.66666V10H7.33333ZM7.33333 4.66668V8.66668H8.66666V4.66668H7.33333Z"
          fill="#C83532"
        />
      </svg>
    );
  }
  if (status === "warning") {
    return (
      <svg
        width="18"
        height="18"
        viewBox="0 0 18 18"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M8 14.6667C4.318 14.6667 1.33333 11.682 1.33333 8.00001C1.33333 4.31801 4.318 1.33334 8 1.33334C11.682 1.33334 14.6667 4.31801 14.6667 8.00001C14.6667 11.682 11.682 14.6667 8 14.6667ZM7.33333 10V11.3333H8.66666V10H7.33333ZM7.33333 4.66668V8.66668H8.66666V4.66668H7.33333Z"
          fill="#EF8943"
        />
      </svg>
    );
  }
  return null;
};

export default SelectField;
