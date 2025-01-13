"use client";

import { createPortal } from "react-dom";
import LoadingSpinner from "../UI/LoadingSpinner/LoadingSpinner";

interface OverlayProps {
  children: React.ReactNode;
  onClose: () => void;
}

const Overlay: React.FC<OverlayProps> = ({ children }) => {
  return <div className="overlay">{children}</div>;
};

const Backdrop = ({ onClose }: { onClose: () => void }) => {
  return (
    <div
      onClick={onClose}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          onClose();
        }
      }}
      className="backdrop"
      role="button"
      tabIndex={0}
    />
  );
};

const OverlayModal: React.FC<OverlayProps> = ({ children, onClose }) => {
  if (typeof window !== "undefined") {
    return (
      <>
        {createPortal(
          <Overlay onClose={onClose}>{children}</Overlay>,
          document.body
        )}
        {createPortal(<Backdrop onClose={onClose} />, document.body)}
      </>
    );
  }
  return <LoadingSpinner />;
};
export default OverlayModal;
