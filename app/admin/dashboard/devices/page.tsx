"use client";

import AdminAddDeviceModal from "@/components/Modals/AdminAddDeviceModal";
import OverlayModal from "@/components/Modals/OverlayModal";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { FaPlus } from "react-icons/fa";
import { BsDeviceSsd } from "react-icons/bs";
import { RiCreativeCommonsZeroFill } from "react-icons/ri";

import { useAppSelector } from "@/hooks/reduxHook";
import LoadingSpinner from "@/components/UI/LoadingSpinner/LoadingSpinner";
import { useDeviceStatus } from "@/hooks/useDeviceStatus";

const AdminDevices = () => {
  const { devices, isFetchingDevices } = useAppSelector(
    (state) => state.adminDevice
  );
  const statuses = useDeviceStatus();
  console.log("Statuses", statuses);

  const pathname = usePathname();
  const router = useRouter();
  const [showAddDeviceModal, setShowAddDeviceModal] = useState<boolean>(false);

  const handleRedirectionToDevicePage = (deviceId: string) => {
    router.push(`${pathname}/${deviceId}`);
  };

  if (isFetchingDevices) return <LoadingSpinner color="blue" height="big" />;

  const getDeviceStatus = (deviceId: string) => {
    const deviceStatus = statuses.find((status) => status.id === deviceId);
    return deviceStatus ? deviceStatus.status : false;
  };

  return (
    <aside>
      <div className="devices-header">
        <h2 className="page-header">My Devices </h2>{" "}
        <button onClick={() => setShowAddDeviceModal(true)}>
          <FaPlus /> Add New
        </button>
        {showAddDeviceModal && (
          <OverlayModal onClose={() => setShowAddDeviceModal(false)}>
            <AdminAddDeviceModal
              closeModal={() => setShowAddDeviceModal(false)}
            />
          </OverlayModal>
        )}
      </div>
      {devices?.length === 0 && (
        <div className="devices-nodevice">
          <RiCreativeCommonsZeroFill />
          <p>
            You haven't created any device yet, kindly add a device to continue.
          </p>
          <button
            className="devices-button"
            onClick={() => setShowAddDeviceModal(true)}
          >
            Add Device
          </button>
        </div>
      )}
      <ul className="devices-list">
        {devices?.map((device: any, index) => (
          <li key={index} className="devices-item">
            <BsDeviceSsd className="devices-item__icon" />
            <div className="devices-item__details">
              <h3
                onClick={() => handleRedirectionToDevicePage(device.deviceId)}
              >
                {device.deviceType}
              </h3>
              <p>{device.deviceId}</p>
            </div>
            <div className="devices-item__status">
              Status:
              {getDeviceStatus(device.deviceId) ? (
                <div className="devices_on">
                  <p>ON</p>
                </div>
              ) : (
                <div className="devices_off">
                  <p>OFF</p>
                </div>
              )}
            </div>
          </li>
        ))}
      </ul>
    </aside>
  );
};
export default AdminDevices;
