"use client";

import { useEffect, useState } from "react";
import { useRealParams } from "@/hooks/useRealParams";
import DeviceSettings from "@/components/Device/DeviceSettings";
import { GetItemFromLocalStorage } from "@/utils/localStorageFunc";

interface DeviceConfigurationPageProps {
  params: { deviceId: string };
}

// The junction's device settings (see components/Device/DeviceSettings).
const DeviceConfigurationPage: React.FC<DeviceConfigurationPageProps> = ({ params: routeParams }) => {
  const params = useRealParams(routeParams);
  const [role, setRole] = useState<string>("admin");
  useEffect(() => {
    setRole(GetItemFromLocalStorage("user")?.role || "admin");
  }, []);
  return <DeviceSettings deviceId={params.deviceId} userType="user" canChangeSupport={role === "admin"} />;
};

export default DeviceConfigurationPage;
