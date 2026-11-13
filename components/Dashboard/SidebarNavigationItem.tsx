import Link from "next/link";
import React from "react";
import { MdOutlineTraffic } from "react-icons/md";
import { FiUser } from "react-icons/fi";

interface SideBarNavigationItemProps {
  href: string;
  iconUrl: string;
  pathName: string;
  children: React.ReactNode;
}

const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  devices: MdOutlineTraffic,
  settings: FiUser,
};

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
  const Icon = ICONS[iconUrl];
  const label = typeof children === "string" ? children : undefined;

  return (
    <Link
      href={href}
      className={`${isActive ? "sidebar-item__active" : "sidebar-item"}`}
      title={label}
      aria-current={isActive ? "page" : undefined}
    >
      {Icon ? (
        <Icon
          className={`${isActive ? "sidebar-icon__active" : "sidebar-icon"}`}
          aria-hidden="true"
        />
      ) : null}
      <span className="sidebar-label">{children}</span>
    </Link>
  );
};

export default SideBarNavigationItem;
