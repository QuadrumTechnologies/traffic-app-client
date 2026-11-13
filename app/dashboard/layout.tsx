"use client";

import SideBar from "@/components/Dashboard/Sidebar";
import Navigation from "@/components/Navigation/Navigation";
import MobileSideBar from "@/components/Dashboard/MobileSidebar";
import RequireSignIn from "@/components/Guards/RequireSignIn";

const sideBarLinks = [
  { name: "Junctions", link: "/dashboard/devices", iconUrl: "devices" },
  { name: "Account", link: "/dashboard/settings", iconUrl: "settings" },
];

export default function HostLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RequireSignIn role="user">
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
    </RequireSignIn>
  );
}
