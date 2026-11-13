"use client";

import SideBar from "@/components/Dashboard/Sidebar";
import Navigation from "@/components/Navigation/Navigation";
import MobileSideBar from "@/components/Dashboard/MobileSidebar";
import RequireSignIn from "@/components/Guards/RequireSignIn";
import { useSidebarCollapsed } from "@/hooks/useSidebarCollapsed";

const sideBarLinks = [
  { name: "Devices", link: "/admin/dashboard/devices", iconUrl: "devices" },
  { name: "Users", link: "/admin/dashboard/users", iconUrl: "users" },
  { name: "Account", link: "/admin/dashboard/settings", iconUrl: "settings" },
];

export default function HostLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [collapsed, toggleSidebar] = useSidebarCollapsed();
  return (
    <RequireSignIn role="admin">
    <section>
      <Navigation />
      <div className="dashboard">
        <div
          className={`dashboard-left ${collapsed ? "dashboard-left--collapsed" : ""}`}
        >
          <SideBar
            sideBarLinks={sideBarLinks}
            collapsed={collapsed}
            onToggle={toggleSidebar}
          />
        </div>
        <div className="dashboard-left__mobile">
          <MobileSideBar sideBarLinks={sideBarLinks} />
        </div>
        <div className="dashboard-right">{children}</div>
      </div>
    </section>
    </RequireSignIn>
  );
}
