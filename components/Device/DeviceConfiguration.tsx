"use client";

import { DeviceConfigItem } from "@/app/dashboard/devices/[deviceId]/page";
import DeviceConfigurationItem from "./DeviceConfigurationItem";
import { usePathname, useRouter } from "next/navigation";

interface DeviceConfigurationProps {
  deviceConfigItems: DeviceConfigItem[];
}
const DeviceConfiguration: React.FC<DeviceConfigurationProps> = ({
  deviceConfigItems,
}) => {
  const router = useRouter();
  const pathname = usePathname();
  return (
    <section className="deviceConfiguration">
      <div className="deviceConfiguration__header">
        <h2>Device Configuration</h2>
        <button
          type="button"
          onClick={() => router.push(`${pathname}/device_configuration`)}
        >
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
