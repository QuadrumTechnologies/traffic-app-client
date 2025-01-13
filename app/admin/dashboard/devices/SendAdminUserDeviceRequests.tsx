"use client";

import { initializeWebSocket } from "@/app/dashboard/websocket";
import { useAppDispatch } from "@/hooks/reduxHook";
import { getAdminDevice } from "@/store/devices/AdminDeviceSlice";
import { deviceTypes } from "@/utils/deviceTypes";
import { GetItemFromLocalStorage } from "@/utils/localStorageFunc";
import React, { useEffect } from "react";

interface SendAdminUserDeviceRequestsProps {
  children: React.ReactNode;
}

const SendAdminUserDeviceRequests: React.FC<
  SendAdminUserDeviceRequestsProps
> = ({ children }) => {
  const dispatch = useAppDispatch();

  const adminUser = GetItemFromLocalStorage("adminUser");
  const deviceType = deviceTypes.find(
    (dev) => dev.department === adminUser?.department
  );

  useEffect(() => {
    (async () => {
      dispatch(getAdminDevice(deviceType));
    })();
  }, [dispatch]);

  useEffect(() => {
    initializeWebSocket();
  }, []);

  return children;
};
export default SendAdminUserDeviceRequests;
