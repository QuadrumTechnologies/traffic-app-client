"use client";

import { useParams } from "next/navigation";
import { useAppSelector } from "@/hooks/reduxHook";

export default function DeviceLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { deviceId } = useParams();
  const { deviceStatuses } = useAppSelector((state) => state.userDevice);

  const deviceStatus = deviceStatuses.find((status) => status.id === deviceId);
  const isOnline = deviceStatus ? deviceStatus.status : false;

  return (
    <div className="deviceLayout">
      <div className="deviceLayout__status">
        <div
          className={`deviceLayout__status-dot ${
            isOnline
              ? "deviceLayout__status-dot--online"
              : "deviceLayout__status-dot--offline"
          }`}
        ></div>
        <span className="deviceLayout__status-text">
          {isOnline ? "Online" : "Offline"}
        </span>
      </div>

      {children}
    </div>
  );
}
