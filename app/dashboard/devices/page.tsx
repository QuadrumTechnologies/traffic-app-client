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
import dayjs from "dayjs";

export interface DeviceStatus {
  id: string;
  status: boolean;
  lastSeen: string | null;
}

const UserDevices = () => {
  const { devices, isFetchingDevices } = useAppSelector(
    (state) => state.userDevice
  );

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
  console.log("Device statuses:", statuses);

  const handleRedirectionToDevicePage = (deviceId: string) => {
    router.push(`${pathname}/${deviceId}`);
  };

  const confirmAction = async () => {
    if (!selectedDeviceId) return;

    const password = prompt(
      `Device ${selectedDeviceId} will be moved to trash for 30 days. After this period, it will be permanently deleted. Admins can delete it permanently at any time. Enter your password to continue.`
    );

    if (!password) return;

    const user = GetItemFromLocalStorage("user");
    const reason = `Device ${selectedDeviceId} moved to trash by user`;

    try {
      await HttpRequest.post("/confirm-password", {
        email: user?.email,
        reason,
        password,
      });

      await HttpRequest.patch(`/devices/${selectedDeviceId}/availability`, {
        restore: false,
      });

      dispatch(getUserDevice());
    } catch (error: any) {
      const message = error?.response?.data?.message || `Request failed`;
      emitToastMessage(message, "error");
    }
  };

  if (isFetchingDevices) return <LoadingSpinner color="blue" height="big" />;

  return (
    <aside className="devices">
      <div className="devices-header">
        <h2 className="page-header">My Devices</h2>
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
        {devices?.map((device: any, index) => {
          const status = getDeviceStatus(statuses, device.deviceId);
          return (
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
                  {device?.info?.JunctionId || "No Junction ID"}
                </h3>
                <p>
                  {device?.deviceType} : {device.deviceId}
                </p>
              </div>
              <div>
                <div
                  className="devices-item__status"
                  style={{
                    display: "flex",
                    justifyContent: "flex-end",
                  }}
                >
                  {device?.status.toUpperCase()}
                  {status?.status ? (
                    <div className="devices_on">
                      <p>Online</p>
                    </div>
                  ) : (
                    <div className="devices_off">
                      <p>Offline</p>
                    </div>
                  )}
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "flex-end",
                    fontSize: "1.4rem",
                    letterSpacing: "0.05rem",
                    color: "#888",
                  }}
                >
                  {!status?.status && device?.lastSeen
                    ? `Last seen: ${dayjs(device?.lastSeen).format(
                        "YYYY-MM-DD HH:mm:ss"
                      )}`
                    : !status?.status && !device?.lastSeen
                    ? "Last seen: Never connected"
                    : null}
                </div>
              </div>
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
          );
        })}
      </div>
    </aside>
  );
};

export default UserDevices;
