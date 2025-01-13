"use client";

import { useRouter } from "next/navigation";
import { IoArrowBack } from "react-icons/io5";
import SendUserDeviceRequests from "./SendUserDeviceRequests";
import { useDeviceStatus } from "@/hooks/useDeviceStatus";

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const router = useRouter();
  return (
    <SendUserDeviceRequests>
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
    </SendUserDeviceRequests>
  );
}
