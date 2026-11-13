"use client";

import AddDeviceModal from "@/components/Modals/AddDeviceModal";
import OverlayModal from "@/components/Modals/OverlayModal";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { FaPlus } from "react-icons/fa";
import { BsDeviceSsd } from "react-icons/bs";
import { RiCreativeCommonsZeroFill } from "react-icons/ri";
import { useAppDispatch, useAppSelector } from "@/hooks/reduxHook";
import LoadingSpinner from "@/components/UI/LoadingSpinner/LoadingSpinner";
import { useDeviceStatus } from "@/hooks/useDeviceStatus";
import { getDeviceStatus } from "@/utils/misc";
import { GetItemFromLocalStorage } from "@/utils/localStorageFunc";
import HttpRequest from "@/store/services/HttpRequest";
import { emitToastMessage } from "@/utils/toastFunc";
import { CiMenuKebab } from "react-icons/ci";
import { useOutsideClick } from "@/hooks/useOutsideClick";
import {
  getUserDevice,
  getUserDeviceInfoData,
  getUserDeviceStateData,
} from "@/store/devices/UserDeviceSlice";
import dayjs from "dayjs";

export interface DeviceStatus {
  id: string;
  status: boolean;
  lastSeen: string | null;
}

// Fleet summary, like the SmartSAV overview: how many junctions, how many are
// reporting now, and when the quietest one was last heard from.
function OverviewTiles({
  devices,
  deviceStatuses,
}: {
  devices: any[];
  deviceStatuses: DeviceStatus[];
}) {
  const total = devices.length;
  const online = devices.filter(
    (device) => getDeviceStatus(deviceStatuses, device.deviceId)?.status
  ).length;
  const offline = total - online;
  const lastSeenTimes = devices
    .filter((device) => !getDeviceStatus(deviceStatuses, device.deviceId)?.status)
    .map((device) => {
      const status = getDeviceStatus(deviceStatuses, device.deviceId);
      return status?.lastSeen || device?.lastSeen || null;
    })
    .filter(Boolean)
    .map((time) => dayjs(time as string));
  const oldest = lastSeenTimes.length
    ? lastSeenTimes.reduce((a, b) => (a.isBefore(b) ? a : b))
    : null;

  return (
    <div className="qtTiles" aria-label="Junction summary">
      <div className="qtTile">
        <p className="qtTile__label">Junctions</p>
        <p className="qtTile__value">{total}</p>
        <p className="qtTile__sub">Controllers on this account</p>
      </div>
      <div className="qtTile qtTile--online">
        <p className="qtTile__label">Online</p>
        <p className="qtTile__value">{online}</p>
        <p className="qtTile__sub">Reporting live now</p>
      </div>
      <div className="qtTile qtTile--offline">
        <p className="qtTile__label">Offline</p>
        <p className="qtTile__value">{offline}</p>
        <p className="qtTile__sub">
          {oldest
            ? `Longest silent since ${oldest.format("D MMM YYYY")}`
            : offline
            ? "Never connected"
            : "None"}
        </p>
      </div>
    </div>
  );
}

const UserDevices = () => {
  const { devices, isFetchingDevices, devicesLoadFailed, deviceStatuses } =
    useAppSelector((state) => state.userDevice);
  const dispatch = useAppDispatch();
  useDeviceStatus();
  const pathname = usePathname();
  const router = useRouter();
  const [showAddDeviceModal, setShowAddDeviceModal] = useState<boolean>(false);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(null);
  const [showOptions, setShowOptions] = useState(false);
  const [showSpinner, setShowSpinner] = useState(true);

  const deviceActionModal = useRef<HTMLDivElement>(null);
  const closeDeviceActionModal = () => {
    setShowOptions(false);
  };
  useOutsideClick(deviceActionModal, closeDeviceActionModal);

  // Simulate 5-second delay for spinner
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSpinner(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  const handleRedirectionToDevicePage = (deviceId: string) => {
    dispatch(getUserDeviceStateData(deviceId));
    dispatch(getUserDeviceInfoData(deviceId));
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

  // Show spinner if either fetching devices or within 4-second delay
  if (isFetchingDevices || showSpinner) {
    return <LoadingSpinner color="blue" height="big" />;
  }

  return (
    <aside className="devices">
      <div className="devices-header">
        <h2 className="page-header">Junctions</h2>
        <button onClick={() => setShowAddDeviceModal(true)}>
          <FaPlus /> Add controller
        </button>
        {showAddDeviceModal && (
          <OverlayModal onClose={() => setShowAddDeviceModal(false)}>
            <AddDeviceModal closeModal={() => setShowAddDeviceModal(false)} />
          </OverlayModal>
        )}
      </div>
      <OverviewTiles devices={devices || []} deviceStatuses={deviceStatuses} />
      {devices?.length === 0 && devicesLoadFailed && (
        <div className="devices-nodevice" role="alert">
          <p>
            Your junctions couldn&rsquo;t be loaded. Check your connection and
            try again.
          </p>
          <button
            className="devices-button"
            onClick={() => dispatch(getUserDevice())}
          >
            Try again
          </button>
        </div>
      )}
      {devices?.length === 0 && !devicesLoadFailed && (
        <div className="devices-nodevice">
          <RiCreativeCommonsZeroFill />
          <p>No junctions on this account yet. Add your controller with the device ID on its label and its junction shows here.</p>
          <button
            className="devices-button"
            onClick={() => setShowAddDeviceModal(true)}
          >
            Add a controller
          </button>
        </div>
      )}
      <div className="devices-list">
        {devices?.map((device: any, index) => {
          const deviceStatus = deviceStatuses.find((s) => s.id === device?.id);
          const status = getDeviceStatus(deviceStatuses, device.deviceId);

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
                {/* Only show Last seen if the device is offline */}
                {!status?.status && (
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "flex-end",
                      fontSize: "1.4rem",
                      letterSpacing: "0.05rem",
                      color: "#888",
                    }}
                  >
                    {deviceStatus?.lastSeen ||
                    status?.lastSeen ||
                    device?.lastSeen
                      ? `Last seen: ${dayjs(
                          deviceStatus?.lastSeen ||
                            status?.lastSeen ||
                            device?.lastSeen
                        ).format("YYYY-MM-DD HH:mm:ss")}`
                      : "Last seen: Never connected"}
                  </div>
                )}
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
