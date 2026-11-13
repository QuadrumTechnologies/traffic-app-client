"use client";

import { useRealParams } from "@/hooks/useRealParams";
import DeviceSettings from "@/components/Device/DeviceSettings";

interface DeviceConfigurationPageProps {
  params: { deviceId: string };
}

// Quadrum admins see the same settings; the client decides support access.
const DeviceConfigurationPage: React.FC<DeviceConfigurationPageProps> = ({ params: routeParams }) => {
  const params = useRealParams(routeParams);
  return <DeviceSettings deviceId={params.deviceId} userType="admin" canChangeSupport={false} />;
};

export default DeviceConfigurationPage;
