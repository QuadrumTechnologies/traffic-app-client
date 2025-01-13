import Link from "next/link";
import React from "react";
import { BiSolidMicrochip } from "react-icons/bi";
import { MdOutlineSettingsInputHdmi } from "react-icons/md";
interface SideBarNavigationItemProps {
  href: string;
  iconUrl: string;
  pathName: string;
  children: React.ReactNode;
}

const SideBarNavigationItem: React.FC<SideBarNavigationItemProps> = ({
  href,
  iconUrl,
  pathName,
  children,
}) => {
  const lastIndexNo = href.lastIndexOf("?");
  const modifiedHref =
    lastIndexNo === -1 ? href : href.slice(0, lastIndexNo - 1);
  const isActive = pathName.includes(modifiedHref);
  return (
    <Link
      href={href}
      className={`${isActive ? "sidebar-item__active" : "sidebar-item"}`}
    >
      {iconUrl === "devices" && (
        <BiSolidMicrochip
          className={`${isActive ? "sidebar-icon__active" : "sidebar-icon"}`}
        />
      )}
      {iconUrl === "settings" && (
        <MdOutlineSettingsInputHdmi
          className={`${isActive ? "sidebar-icon__active" : "sidebar-icon"}`}
        />
      )}

      <span> {children}</span>
    </Link>
  );
};

export default SideBarNavigationItem;
