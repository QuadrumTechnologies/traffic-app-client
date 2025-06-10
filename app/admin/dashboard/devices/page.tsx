"use client";

import AdminAddDeviceModal from "@/components/Modals/AdminAddDeviceModal";
import OverlayModal from "@/components/Modals/OverlayModal";
import { usePathname, useRouter } from "next/navigation";
import { useRef, useState } from "react";
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
import { useOutsideClick } from "@/hooks/useOutsideClick";
import { deviceTypes } from "@/utils/deviceTypes";
import { CgProfile } from "react-icons/cg";
import { getDeviceStatus } from "@/utils/misc";
import dayjs from "dayjs";

const AdminDevices = () => {
  const { devices, isFetchingDevices } = useAppSelector(
    (state) => state.adminDevice
  );

  const dispatch = useAppDispatch();
  const statuses = useDeviceStatus();
  const pathname = usePathname();
  const router = useRouter();

  console.log("AdminDevices Rendered", devices, statuses);

  const [showAddDeviceModal, setShowAddDeviceModal] = useState(false);
  const [hoveredDeviceId, setHoveredDeviceId] = useState<string | null>(null);
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

  const adminUser = GetItemFromLocalStorage("adminUser");
  const deviceType = deviceTypes.find(
    (dev) => dev.department === adminUser?.department
  );

  const assignDeviceHandler = async () => {
    const ownerEmail = prompt("Enter the email of the new device owner:");

    if (!ownerEmail || !/^\S+@\S+\.\S+$/.test(ownerEmail)) {
      emitToastMessage("Invalid email address. Please try again.", "error");
      return;
    }
    try {
      await HttpRequest.patch(`/admin/devices/${selectedDeviceId}/assign`, {
        deviceId: selectedDeviceId,
        deviceStatus: "purchased",
        ownerEmail,
        purchasedDate: new Date().toISOString(),
      });
      emitToastMessage("Device successfully assigned!", "success");
      dispatch(getAdminDevice(deviceType));
    } catch (error: any) {
      emitToastMessage(error?.response.data.message, "error");
    }
  };

  const toggleDeviceStatus = async (action: string) => {
    const newStatus = action === "disable" ? "disabled" : "active";

    await HttpRequest.patch(`/admin/devices/${selectedDeviceId}/status`, {
      status: newStatus,
    });

    emitToastMessage(`Device ${newStatus} successfully`, "success");
  };

  const confirmAction = async (action: string) => {
    const password = prompt(
      `Device ${selectedDeviceId} will be ${action}. Please enter your password to proceed`
    );
    if (!password) return;

    // Audit log reason
    const reason = `Device ${selectedDeviceId} will be ${action}. Admin action taken.`;

    try {
      await HttpRequest.post("/admin/confirm-password", {
        email: adminUser?.email,
        reason,
        password,
      });

      if (action === "delete") {
        await HttpRequest.delete(`/admin/devices/${selectedDeviceId}`);
        dispatch(getAdminDevice(deviceType));
        emitToastMessage("Device deleted successfully", "success");
      } else if (action === "recall" || action === "unrecalled") {
        await HttpRequest.patch(`/admin/devices/${selectedDeviceId}/recall`, {
          recall: action === "recall",
        });
        dispatch(getAdminDevice(deviceType));
        emitToastMessage(
          `Device ${
            action === "recall" ? "recalled" : "unrecalled"
          } successfully`,
          "success"
        );
      } else if (action === "disable" || action === "enable") {
        await toggleDeviceStatus(action);
        dispatch(getAdminDevice(deviceType));
      } else if (action === "restore") {
        await HttpRequest.patch(
          `/admin/devices/${selectedDeviceId}/availability`,
          {
            restore: true,
          }
        );
        dispatch(getAdminDevice(deviceType));
        emitToastMessage("Device restored successfully", "success");
      }
    } catch (error: any) {
      emitToastMessage(error?.response.data.message, "error");
    }
  };

  if (isFetchingDevices) return <LoadingSpinner color="blue" height="big" />;

  return (
    <aside>
      <div className="devices-header">
        <h2 className="page-header">My Devices</h2>
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

      <div className="devices-list">
        {devices?.map((device) => {
          const status = getDeviceStatus(statuses, device.deviceId);
          return (
            <div key={device.deviceId} className="devices-item">
              <div className="devices-item__icon-wrapper">
                <CgProfile
                  className="devices-item__icon devices-item-profile"
                  onMouseEnter={() => {
                    setHoveredDeviceId(device.deviceId);
                  }}
                  onMouseLeave={() => {
                    setHoveredDeviceId(null);
                  }}
                />
                {hoveredDeviceId === device.deviceId &&
                  device?.deviceStatus && (
                    <div className="devices-item__modal">
                      <p>
                        <span>Owner's Email:</span>{" "}
                        {device.deviceStatus.ownerEmail}
                      </p>
                      <p>
                        <span>Purchased Date:</span>{" "}
                        {new Date(
                          device.deviceStatus.purchaseDate
                        ).toLocaleDateString()}
                      </p>
                    </div>
                  )}
              </div>
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
                  {device?.deviceStatus?.status === "purchased"
                    ? device?.userDevice?.status.toUpperCase() ||
                      "PURCHASED BUT NOT ACTIVATED"
                    : "NOT PURCHASED"}
                  {device?.userDevice &&
                  device?.userDevice?.status !== "disabled" &&
                  status?.status ? (
                    <div className="devices_on">
                      <p>Online</p>
                    </div>
                  ) : (
                    <>
                      <div className="devices_off">
                        <p>Offline</p>
                      </div>
                    </>
                  )}
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
                    {device?.userDevice?.isTrash && (
                      <button
                        className="deviceConfigPage__menu-dropdown-button"
                        onClick={() => {
                          confirmAction("restore");
                          setShowOptions(false);
                        }}
                      >
                        Restore
                      </button>
                    )}
                    <button
                      className="deviceConfigPage__menu-dropdown-button"
                      onClick={() => {
                        const action =
                          device?.userDevice?.status === "recalled"
                            ? "unrecalled"
                            : device?.userDevice
                            ? "recall"
                            : "assign";

                        if (action === "recall") {
                          confirmAction("recall");
                          setShowOptions(false);
                        } else if (action === "unrecalled") {
                          confirmAction("unrecalled");
                          setShowOptions(false);
                        } else {
                          assignDeviceHandler();
                          setShowOptions(false);
                        }
                      }}
                      disabled={
                        device?.deviceStatus?.status === "purchased" &&
                        !device?.userDevice
                      }
                    >
                      {device?.userDevice?.status === "recalled"
                        ? "Unrecalled"
                        : !device?.userDevice
                        ? "Assign"
                        : "Recall"}
                    </button>
                    <button
                      disabled={!device.userDevice}
                      className="deviceConfigPage__menu-dropdown-button"
                      onClick={() => {
                        const action =
                          device?.userDevice?.status === "active"
                            ? "disable"
                            : "enable";
                        confirmAction(action);
                        setShowOptions(false);
                      }}
                    >
                      {device?.userDevice
                        ? device?.userDevice?.status === "active"
                          ? "Disable"
                          : "Enable"
                        : "Disable/Enable"}
                    </button>
                    <button
                      className="deviceConfigPage__menu-dropdown-button"
                      onClick={() => {
                        if (
                          device?.userDevice &&
                          !device?.userDevice?.isRecalled
                        )
                          return alert("Please recall device before deleting.");
                        confirmAction("delete");
                        setShowOptions(false);
                      }}
                    >
                      Delete
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

export default AdminDevices;
