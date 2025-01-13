"use client";

import SideBar from "@/components/Dashboard/Sidebar";
import Navigation from "@/components/Navigation/Navigation";
import MobileSideBar from "@/components/Dashboard/MobileSidebar";

const sideBarLinks = [
  { name: "My Devices", link: "/admin/dashboard/devices", iconUrl: "devices" },
  { name: "Settings", link: "/admin/dashboard/settings", iconUrl: "settings" },
];

export default function HostLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <section>
      <Navigation />
      <div className="dashboard">
        <div className="dashboard-left">
          <SideBar sideBarLinks={sideBarLinks} />
        </div>
        <div className="dashboard-left__mobile">
          <MobileSideBar sideBarLinks={sideBarLinks} />
        </div>
        <div className="dashboard-right">{children}</div>
      </div>
    </section>
  );
}
