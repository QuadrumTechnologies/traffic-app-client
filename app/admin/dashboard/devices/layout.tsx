"use client";

import { useRouter } from "next/navigation";
import { IoArrowBack } from "react-icons/io5";
import SendAdminUserDeviceRequests from "./SendAdminUserDeviceRequests";
import { useDeviceStatus } from "@/hooks/useDeviceStatus";

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const router = useRouter();
  useDeviceStatus();
  return (
    <SendAdminUserDeviceRequests>
      <div>
        <button
          className="dashboard-back__button"
          type="button"
          onClick={() => {
            router.back();
          }}
        >
          <IoArrowBack />
          <span>Back</span>
        </button>

        {children}
      </div>
    </SendAdminUserDeviceRequests>
  );
}
