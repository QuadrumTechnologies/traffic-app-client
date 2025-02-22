"use client";

import { useAppDispatch } from "@/hooks/reduxHook";
import {
  getUserDevice,
  getUserPattern,
  getUserPhase,
} from "@/store/devices/UserDeviceSlice";
import React, { useEffect } from "react";
import { initializeWebSocket } from "../websocket";

interface SendUserDeviceRequestsProps {
  children: React.ReactNode;
}

const SendUserDeviceRequests: React.FC<SendUserDeviceRequestsProps> = ({
  children,
}) => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    (async () => {
      dispatch(getUserDevice());
      dispatch(getUserPhase());
      dispatch(getUserPattern());
    })();
  }, [dispatch]);

  useEffect(() => {
    initializeWebSocket();
  }, []);
  return children;
};
export default SendUserDeviceRequests;
