"use client";

import React, { useEffect, useState } from "react";
import Select, { StylesConfig } from "react-select";
import { IoMdArrowDropdown, IoMdArrowDropup } from "react-icons/io";

export interface Option {
  value: string | null;
  label: string;
}

interface SelectFieldProps {
  label?: string;
  onChange: (selectedOption: Option | null) => void;
  value: Option | null;
  options: Option[];
  placeholder?: string;
}

const SelectField: React.FC<SelectFieldProps> = ({
  onChange,
  value,
  options,
  label,
  placeholder = "",
}) => {
  const [optionsIsShown, setOptionsIsShown] = useState<boolean>(false);
  const [selectedOption, setSelectedOption] = useState<Option | null>(value);

  useEffect(() => {
    setSelectedOption(value);
  }, [value]);

  const customStyles: StylesConfig<Option, boolean> = {
    container: (provided) => ({
      ...provided,
      position: "relative",
    }),
    control: (provided: any, state: any) => ({
      ...provided,
      padding: selectedOption ? "7px 0px 0px" : "0px",
      fontSize: "14px",
      borderColor: "#C6CDE6",
      borderWidth: "1px",
      borderRadius: "8px",
      height: "44px",
      minHeight: "44px",
      backgroundColor: "#C6CDE6",
      transition: "all 0.3s",
      "&:hover": {
        cursor: "pointer",
        borderColor: state.isFocused ? "#C6CDE6" : "#adb2b9",
      },
    }),
    valueContainer: (provided) => ({
      ...provided,
      position: "relative",
      paddingTop: selectedOption ? "12px" : "0px",
    }),
    option: (provided: any) => ({
      ...provided,
      fontSize: "14px",
      color: "#101828",
      backgroundColor: "white",
      fontWeight: "500",
      "&:hover": {
        cursor: "pointer",
        backgroundColor: "#F9FAFB",
        color: "#101828",
      },
    }),
    menu: (provided: any) => ({
      ...provided,
      background: "#fff",
      zIndex: "20",
      border: "1px solid #EAECF0",
      borderRadius: "8px",
      boxShadow:
        "0px 12px 16px -4px rgba(16, 24, 40, 0.08), 0px 4px 6px -2px rgba(16, 24, 40, 0.03)",
    }),
  };

  const toggleOptions = () => {
    setOptionsIsShown((prevState) => !prevState);
  };

  const handleInputChange = (selectedOption: any) => {
    setSelectedOption(selectedOption);
    setOptionsIsShown(false);
    onChange(selectedOption);
  };

  const handleBlur = () => {
    setOptionsIsShown(false);
  };

  const handleInputClick = () => {
    setOptionsIsShown(true);
  };

  return (
    <div>
      {label && <label>{label}: </label>}
      <Select
        styles={customStyles}
        components={{
          DropdownIndicator: () => (
            <div
              onClick={toggleOptions}
              role="button"
              tabIndex={0}
              onKeyDown={() => {}}
            >
              {optionsIsShown ? <IoMdArrowDropup /> : <IoMdArrowDropdown />}
            </div>
          ),
          IndicatorSeparator: () => null,
        }}
        onChange={handleInputChange}
        onBlur={handleBlur}
        onFocus={handleInputClick}
        value={selectedOption}
        options={options}
        placeholder={placeholder}
        menuIsOpen={optionsIsShown}
      />
    </div>
  );
};

export default SelectField;
