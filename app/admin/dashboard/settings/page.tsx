"use client";

import OverlayModal from "@/components/Modals/OverlayModal";
import Link from "next/link";
import { useState } from "react";

const Settings = () => {
  const [deactivateUser, setDeactivateUser] = useState<boolean>(false);
  const [clearAllDevices, setClearAllDevices] = useState<boolean>(false);

  return (
    <div>
      <h2 className="page-header">Settings </h2>
      {/* <Link className="settings_url" href="/admin/dashboard/settings/update_profile">
        Update Profile
      </Link> */}
      <Link
        className="settings_url"
        href="/admin/dashboard/settings/change_password"
      >
        Change Password
      </Link>
      <div>
        <button
          onClick={() => setClearAllDevices(true)}
          className="page-button"
        >
          Clear All Devices
        </button>
      </div>
      <div>
        <button onClick={() => setDeactivateUser(true)} className="page-button">
          Deactivate Account
        </button>
      </div>

      {/* Reset Modal */}
      {deactivateUser && (
        <OverlayModal onClose={() => setDeactivateUser(false)}>
          <div>Deactivate user</div>
        </OverlayModal>
      )}
      {clearAllDevices && (
        <OverlayModal onClose={() => setClearAllDevices(false)}>
          <div>Deactivate user</div>
        </OverlayModal>
      )}
    </div>
  );
};
export default Settings;
