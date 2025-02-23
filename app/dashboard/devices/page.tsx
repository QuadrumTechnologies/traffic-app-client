"use client";

import AddDeviceModal from "@/components/Modals/AddDeviceModal";
import OverlayModal from "@/components/Modals/OverlayModal";
import { usePathname, useRouter } from "next/navigation";
import { useState, useRef } from "react";
import { FaPlus } from "react-icons/fa";
import { BsDeviceSsd } from "react-icons/bs";
import { RiCreativeCommonsZeroFill } from "react-icons/ri";
import { useAppDispatch, useAppSelector } from "@/hooks/reduxHook";
import LoadingSpinner from "@/components/UI/LoadingSpinner/LoadingSpinner";
import { useDeviceStatus } from "@/hooks/useDeviceStatus";
import { getDeviceStatus } from "@/utils/misc";
import { getWebSocket } from "../websocket";
import { GetItemFromLocalStorage } from "@/utils/localStorageFunc";
import HttpRequest from "@/store/services/HttpRequest";
import { emitToastMessage } from "@/utils/toastFunc";
import { CiMenuKebab } from "react-icons/ci";
import { useOutsideClick } from "@/hooks/useOutsideClick";
import { getUserDevice } from "@/store/devices/UserDeviceSlice";

const UserDevices = () => {
  const { devices, isFetchingDevices, deviceAvailability } = useAppSelector(
    (state) => state.userDevice
  );
  getWebSocket();
  const dispatch = useAppDispatch();
  const statuses = useDeviceStatus();

  const pathname = usePathname();
  const router = useRouter();
  const [showAddDeviceModal, setShowAddDeviceModal] = useState<boolean>(false);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(null);
  const [showOptions, setShowOptions] = useState(false);

  const deviceActionModal = useRef<HTMLDivElement>(null);
  const closeDeviceActionModal = () => {
    setShowOptions(false);
  };
  useOutsideClick(deviceActionModal, closeDeviceActionModal);

  const handleRedirectionToDevicePage = (deviceId: string) => {
    router.push(`${pathname}/${deviceId}`);
  };

  const confirmAction = async () => {
    const password = prompt(
      `Device ${selectedDeviceId} will be moved to trash for 30 days. After this period, it will be permanently deleted. Admins can delete it permanently at any time. Enter your password to continue.`
    );

    if (!password) return;

    const user = GetItemFromLocalStorage("user");

    try {
      await HttpRequest.post("/confirm-password", {
        email: user?.email,
        password,
      });

      await HttpRequest.patch(`/devices/${selectedDeviceId}/availability`, {
        restore: false,
      });

      dispatch(getUserDevice());
      emitToastMessage(`Device moved to trash successfully`, "success");
    } catch (error: any) {
      emitToastMessage(error?.response.data.message, "error");
    }
  };

  if (isFetchingDevices) return <LoadingSpinner color="blue" height="big" />;

  return (
    <aside className="devices">
      <div className="devices-header">
        <h2 className="page-header">My Devices </h2>{" "}
        <button onClick={() => setShowAddDeviceModal(true)}>
          <FaPlus /> Add New
        </button>
        {showAddDeviceModal && (
          <OverlayModal onClose={() => setShowAddDeviceModal(false)}>
            <AddDeviceModal closeModal={() => setShowAddDeviceModal(false)} />
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
      <div className="devices-list">
        {devices?.map((device: any, index) => (
          <div
            key={index}
            className={`devices-item ${
              device?.status === "disabled" ? "disabled" : ""
            }`}
          >
            <BsDeviceSsd className="devices-item__icon" />
            <div className="devices-item__details">
              <h3
                onClick={() => handleRedirectionToDevicePage(device.deviceId)}
              >
                {device.deviceType}
              </h3>
              <p>{device.deviceId}</p>
            </div>
            <p className="devices-item__status">
              {device?.status.toUpperCase()}
              {getDeviceStatus(statuses, device.deviceId) ||
              (deviceAvailability.Status &&
                deviceAvailability.DeviceID === device.deviceId) ? (
                <div className="devices_on">
                  <p>Online</p>
                </div>
              ) : (
                <div className="devices_off">
                  <p>Offline</p>
                </div>
              )}
            </p>
            <div className="deviceConfigPage__menu">
              <CiMenuKebab
                size={24}
                className="deviceConfigPage__menu-icon"
                onClick={() => {
                  setSelectedDeviceId(device.deviceId);
                  setShowOptions((prev) => !prev);
                }}
              />
              {showOptions && selectedDeviceId === device.deviceId && (
                <div
                  className="deviceConfigPage__menu-dropdown"
                  ref={deviceActionModal}
                >
                  <button
                    className="deviceConfigPage__menu-dropdown-button"
                    onClick={confirmAction}
                    disabled={device?.isTrash}
                  >
                    {device?.isTrash ? "In Trash" : "Move to Trash"}
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
};
export default UserDevices;
