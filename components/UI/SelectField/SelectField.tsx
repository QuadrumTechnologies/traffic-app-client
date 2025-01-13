// components/SelectField.tsx

"use client";

import React, { useState } from "react";
import Select, { StylesConfig, ActionMeta } from "react-select";
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

  const customStyles: StylesConfig<Option, false> = {
    control: (provided, state) => ({
      ...provided,
      fontSize: "1.4rem",
      marginBottom: "1.4rem",
      borderColor: state.isFocused ? "#514604" : "#2a2a29",
      borderWidth: state.isFocused ? "1.5px" : "1px",
      "&:hover": {
        cursor: "pointer",
        borderColor: state.isFocused ? " #3b3302" : "#6c6128",
      },
    }),
    dropdownIndicator: (provided) => ({
      ...provided,
      paddingLeft: "10px",
      paddingRight: "10px",
    }),
    option: (provided, state) => ({
      ...provided,
      fontSize: "1.4rem",
      color: "#f2f2f2",
      backgroundColor: state.isSelected ? "#2a2a29" : "#010100",
      "&:hover": {
        cursor: "pointer",
        backgroundColor: "#F2F2F2",
        color: "#1a1a1a",
      },
    }),
    menu: (provided) => ({
      ...provided,
      background: "#6c6128",
      boxShadow: "0px 0px 24px 0px rgba(0, 0, 0, 0.20)",
    }),
  };

  const toggleOptions = () => {
    setOptionsIsShown((prevState) => !prevState);
  };

  const handleInputChange = (
    selectedOption: Option | null,
    actionMeta: ActionMeta<Option>
  ) => {
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
