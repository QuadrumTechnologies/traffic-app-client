"use client";

import React from "react";
import { store } from "@/store/store";
import { Provider } from "react-redux";

interface Providerlayout {
  children: React.ReactNode;
}

const ReduxProvider: React.FC<Providerlayout> = ({ children }) => {
  return <Provider store={store}>{children}</Provider>;
};
export default ReduxProvider;
