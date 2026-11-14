"use client";

import SideBar from "@/components/Dashboard/Sidebar";
import Navigation from "@/components/Navigation/Navigation";
import MobileSideBar from "@/components/Dashboard/MobileSidebar";
import RequireSignIn from "@/components/Guards/RequireSignIn";
import DemoBanner from "@/components/Dashboard/DemoBanner";
import { useSidebarCollapsed } from "@/hooks/useSidebarCollapsed";
import { useEffect, useState } from "react";
import { isDemoSession } from "@/utils/session";

const sideBarLinks = [
  { name: "Junctions", link: "/dashboard/devices", iconUrl: "devices" },
  { name: "Account", link: "/dashboard/settings", iconUrl: "settings" },
];

export default function HostLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [collapsed, toggleSidebar] = useSidebarCollapsed();
  // Read after mount: the pages are static files, built without a session.
  const [demo, setDemo] = useState(false);
  useEffect(() => setDemo(isDemoSession()), []);
  const links = demo ? sideBarLinks.filter((l) => l.link === "/dashboard/devices") : sideBarLinks;
  return (
    <RequireSignIn role="user">
    <section>
      <Navigation />
      <div className="dashboard">
        <div
          className={`dashboard-left ${collapsed ? "dashboard-left--collapsed" : ""}`}
        >
          <SideBar
            sideBarLinks={links}
            collapsed={collapsed}
            onToggle={toggleSidebar}
          />
        </div>
        <div className="dashboard-left__mobile">
          <MobileSideBar sideBarLinks={links} />
        </div>
        <div className="dashboard-right">
          {demo ? <DemoBanner /> : null}
          {children}
        </div>
      </div>
    </section>
    </RequireSignIn>
  );
}
