"use client";

import { useAppDispatch } from "@/hooks/reduxHook";
import {
  getUserDevice,
  getUserPattern,
  getUserPhase,
} from "@/store/devices/UserDeviceSlice";
import { GetItemFromLocalStorage } from "@/utils/localStorageFunc";
import React, { useEffect } from "react";
import { initializeWebSocket } from "../websocket";

interface SendUserDeviceRequestsProps {
  children: React.ReactNode;
}

const SendUserDeviceRequests: React.FC<SendUserDeviceRequestsProps> = ({
  children,
}) => {
  const dispatch = useAppDispatch();

  const user = GetItemFromLocalStorage("user");

  useEffect(() => {
    (async () => {
      dispatch(getUserDevice(user.email));
      dispatch(getUserPhase(user.email));
      dispatch(getUserPattern(user.email));
    })();
  }, [dispatch]);

  useEffect(() => {
    initializeWebSocket();
  }, []);
  return children;
};
export default SendUserDeviceRequests;
