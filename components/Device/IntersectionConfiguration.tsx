"use client";

import { IntersectionConfigItem } from "@/app/dashboard/devices/[deviceId]/page";
import { useRouter, usePathname } from "next/navigation";
import { realPathname } from "@/hooks/useRealParams";
import IntersectionConfigurationItem from "./IntersectionConfigurationItem";
import { useAppDispatch, useAppSelector } from "@/hooks/reduxHook";
import {
  setIsIntersectionConfigurable,
  setManualMode,
} from "@/store/signals/SignalConfigSlice";
import { emitToastMessage } from "@/utils/toastFunc";

interface DeviceConfigurationProps {
  intersectionConfigItems: IntersectionConfigItem[];
  deviceId: string;
  userType?: string;
  canConfigure?: boolean;
}

const IntersectionConfiguration: React.FC<DeviceConfigurationProps> = ({
  intersectionConfigItems,
  deviceId,
  userType,
  canConfigure = true,
}) => {
  const { devices: userDevices } = useAppSelector((state) => state.userDevice);
  // On admin pages the junction is in the admin list (with its owner's
  // userDevice record); looking it up in the user list said "Device not found".
  const adminDevices = useAppSelector((state) => state.adminDevice.devices);
  const devices = userType === "admin" ? adminDevices : userDevices;
  const dispatch = useAppDispatch();
  const router = useRouter();
  const pathname = realPathname(usePathname());

  // Commands moved to JunctionControl (explicit, confirmed by the controller).
  // The old manual signal panel is gone: the API no longer times signals.

  const handleRedirectionToDevicePage = () => {
    const device = devices.find((device) => device.deviceId === deviceId);
    if (!device) {
      emitToastMessage("Device not found.", "error");
      return;
    }
    if (userType === "admin" && !device?.userDevice?.allowAdminSupport) {
      emitToastMessage(
        "Admin support is not enabled for this device.",
        "error"
      );
      return;
    }
    router.push(`${pathname}/intersection_configuration`);
    dispatch(setManualMode(false));
    dispatch(setIsIntersectionConfigurable(true));
  };

  return (
    <section className="intersectionConfiguration">
      <div className="intersectionConfiguration__header">
        <h2>Intersection Configuration</h2>
        {canConfigure ? (
          <button type="button" onClick={handleRedirectionToDevicePage}>
            Configure
          </button>
        ) : null}
      </div>
      <ul className="intersectionConfiguration__list">
        {intersectionConfigItems.map(
          (item: IntersectionConfigItem, index: number) => (
            <IntersectionConfigurationItem key={index} item={item} />
          )
        )}
      </ul>
    </section>
  );
};

export default IntersectionConfiguration;
