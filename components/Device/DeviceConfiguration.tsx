"use client";

import { DeviceConfigItem } from "@/app/dashboard/devices/[deviceId]/page";
import DeviceConfigurationItem from "./DeviceConfigurationItem";
import { usePathname, useRouter } from "next/navigation";
import { useAppSelector } from "@/hooks/reduxHook";
import { emitToastMessage } from "@/utils/toastFunc";

interface DeviceConfigurationProps {
  deviceConfigItems: DeviceConfigItem[];
  deviceId: string;
}

const DeviceConfiguration: React.FC<DeviceConfigurationProps> = ({
  deviceConfigItems,
  deviceId,
}) => {
  const { devices } = useAppSelector((state) => state.adminDevice);
  const router = useRouter();
  const pathname = usePathname();

  const handleRedirectionToDevicePage = () => {
    const device = devices.find((device) => device.deviceId === deviceId);
    if (!device && pathname.includes("admin")) {
      alert("Device not found.");
      return;
    }

    if (!device?.userDevice?.allowAdminSupport && pathname.includes("admin")) {
      emitToastMessage(
        "Admin support is not enabled for this device.",
        "error"
      );
      return;
    }

    router.push(`${pathname}/device_configuration`);
  };
  return (
    <section className="deviceConfiguration">
      <div className="deviceConfiguration__header">
        <h2>Device Configuration</h2>
        <button type="button" onClick={handleRedirectionToDevicePage}>
          Configure
        </button>
      </div>

      <ul className="deviceConfiguration__list">
        {deviceConfigItems.map((item: DeviceConfigItem, index: any) => (
          <DeviceConfigurationItem key={index} item={item} />
        ))}
      </ul>
    </section>
  );
};

export default DeviceConfiguration;
