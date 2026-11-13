import React, { useState } from "react";
import { usePathname } from "next/navigation";
import OverlayModal from "../Modals/OverlayModal";
import LogoutModal from "../Modals/LogoutModal";
import SideBarNavigationItem from "./SidebarNavigationItem";
import { LuPanelLeftClose, LuPanelLeftOpen } from "react-icons/lu";

type SideBar = { name: string; link: string; iconUrl: string };

interface SideBarProps {
  sideBarLinks: SideBar[];
  collapsed?: boolean;
  onToggle?: () => void;
}

const SideBar: React.FC<SideBarProps> = ({
  sideBarLinks,
  collapsed = false,
  onToggle,
}) => {
  const [showLogoutVerificationModal, setShowLogoutVerificationModal] =
    useState<boolean>(false);
  const path = usePathname();

  return (
    <section className="sidebar">
      {onToggle ? (
        <button
          type="button"
          className="sidebar-toggle"
          onClick={onToggle}
          aria-expanded={!collapsed}
          aria-label={collapsed ? "Expand the menu" : "Collapse the menu"}
          title={collapsed ? "Expand the menu" : "Collapse the menu"}
        >
          {collapsed ? <LuPanelLeftOpen /> : <LuPanelLeftClose />}
        </button>
      ) : null}
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
