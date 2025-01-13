import React, { useState } from "react";
import { usePathname } from "next/navigation";
import OverlayModal from "../Modals/OverlayModal";
import LogoutModal from "../Modals/LogoutModal";
import SideBarNavigationItem from "./SidebarNavigationItem";

type SideBar = { name: string; link: string; iconUrl: string };

interface SideBarProps {
  sideBarLinks: SideBar[];
}

const SideBar: React.FC<SideBarProps> = ({ sideBarLinks }) => {
  const [showLogoutVerificationModal, setShowLogoutVerificationModal] =
    useState<boolean>(false);
  const path = usePathname();

  return (
    <section className="sidebar">
      <ul className="sidebar-list">
        {sideBarLinks.map((link, index) => (
          <SideBarNavigationItem
            key={index}
            iconUrl={link.iconUrl}
            href={link.link}
            pathName={path}
          >
            {link.name}
          </SideBarNavigationItem>
        ))}
      </ul>

      {/* <button
        className="sidebar-logout"
        onClick={() => setShowLogoutVerificationModal(true)}
      >
        Logout
      </button>
      {showLogoutVerificationModal && (
        <OverlayModal onClose={() => setShowLogoutVerificationModal(false)}>
          <LogoutModal
            onClose={() => setShowLogoutVerificationModal(false)}
          ></LogoutModal>
        </OverlayModal>
      )} */}
    </section>
  );
};
export default SideBar;
