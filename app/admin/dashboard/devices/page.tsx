"use client";

import AdminAddDeviceModal from "@/components/Modals/AdminAddDeviceModal";
import OverlayModal from "@/components/Modals/OverlayModal";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { FaPlus } from "react-icons/fa";
import { BsDeviceSsd } from "react-icons/bs";
import { RiCreativeCommonsZeroFill } from "react-icons/ri";
import { useAppDispatch, useAppSelector } from "@/hooks/reduxHook";
import LoadingSpinner from "@/components/UI/LoadingSpinner/LoadingSpinner";
import { useDeviceStatus } from "@/hooks/useDeviceStatus";
import { CiMenuKebab } from "react-icons/ci";
import HttpRequest from "@/store/services/HttpRequest";
import { GetItemFromLocalStorage } from "@/utils/localStorageFunc";
import { emitToastMessage } from "@/utils/toastFunc";
import { getAdminDevice } from "@/store/devices/AdminDeviceSlice";

const AdminDevices = () => {
  const { devices, isFetchingDevices } = useAppSelector(
    (state) => state.adminDevice
  );

  const dispatch = useAppDispatch();
  const statuses = useDeviceStatus();
  const pathname = usePathname();
  const router = useRouter();

  const [showAddDeviceModal, setShowAddDeviceModal] = useState(false);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(null);
  const [showOptions, setShowOptions] = useState(false);

  const handleRedirectionToDevicePage = (deviceId: string) => {
    const device = devices.find((device) => device.deviceId === deviceId);
    if (!device) {
      alert("Device not found.");
      return;
    }

    if (!device.userDevice?.allowAdminSupport) {
      alert("Admin support is not enabled for this device.");
      return;
    }

    router.push(`${pathname}/${deviceId}`);
  };

  const confirmAction = async (action: string) => {
    const password = prompt("Please enter your password to proceed");
    if (!password) return;
    try {
      const response = await HttpRequest.post("/admin/confirm-password", {
        email: GetItemFromLocalStorage("adminUser").email,
        password,
      });

      alert(`Device ${selectedDeviceId} will be ${action}`);

      if (action === "deleted") {
        await HttpRequest.delete(`/admin/devices/${selectedDeviceId}`);
        dispatch(getAdminDevice(GetItemFromLocalStorage("adminUser").email));
        emitToastMessage("Device deleted successfully", "success");
        // } else if (action === "recalled") {
        //   await HttpRequest.get(`/devices/${selectedDeviceId}/recall`);
        //   emitToastMessage("Device recalled successfully", "success");
        // } else if (action === "disabled") {
        //   await HttpRequest.get(`/devices/${selectedDeviceId}/disable`);
        //   emitToastMessage("Device disabled successfully", "success");
      }
    } catch (error: any) {
      emitToastMessage(error?.response.data.message, "error");
    }
  };

  if (isFetchingDevices) return <LoadingSpinner color="blue" height="big" />;

  const getDeviceStatus = (deviceId: string) => {
    const deviceStatus = statuses.find((status) => status.id === deviceId);
    return deviceStatus ? deviceStatus.status : false;
  };

  return (
    <aside>
      <div className="devices-header">
        <h2 className="page-header">My Devices </h2>
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
        {devices?.map((device) => (
          <li key={device.deviceId} className="devices-item">
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
            <div className="deviceConfigPage__menu">
              <CiMenuKebab
                size={20}
                className="deviceConfigPage__menu-icon"
                onClick={() => {
                  setSelectedDeviceId(device.deviceId);
                  setShowOptions((prev) => !prev);
                }}
              />
              {showOptions && selectedDeviceId === device.deviceId && (
                <div className="deviceConfigPage__menu-dropdown">
                  <button
                    className="deviceConfigPage__menu-dropdown-button"
                    onClick={() => confirmAction("deleted")}
                  >
                    Delete
                  </button>
                  {/* <button
                    className="deviceConfigPage__menu-dropdown-button"
                    onClick={() => confirmAction("recalled")}
                  >
                    Recall
                  </button>
                  <button
                    className="deviceConfigPage__menu-dropdown-button"
                    onClick={() => confirmAction("disabled")}
                  >
                    Disable
                  </button> */}
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
