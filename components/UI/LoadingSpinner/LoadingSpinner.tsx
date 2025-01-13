import React from "react";
import { ImSpinner10 } from "react-icons/im";

interface Props {
  color?: "white" | "blue";
  height?: "big";
}

const LoadingSpinner: React.FC<Props> = ({ color, height }) => {
  return (
    <div
      className={`${height === "big" ? "spinner-box__big" : "spinner-box"}`}
    >
      <ImSpinner10
        className={`spinner-icon ${
          color === "blue" ? "spinner-icon__blue" : "spinner-icon__white"
        } ${height === "big" ? "spinner-icon__big" : ""}`}
      />
    </div>
  );
};
export default LoadingSpinner;
