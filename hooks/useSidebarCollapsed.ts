"use client";

import { useCallback, useEffect, useState } from "react";

const KEY = "qt.sidebarCollapsed";

// Whether the side menu is folded to icons only, remembered per browser.
export function useSidebarCollapsed(): [boolean, () => void] {
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    try {
      setCollapsed(window.localStorage.getItem(KEY) === "1");
    } catch (error) {
      // storage can be unavailable (private mode); keep the default
    }
  }, []);

  const toggle = useCallback(() => {
    setCollapsed((current) => {
      const next = !current;
      try {
        window.localStorage.setItem(KEY, next ? "1" : "0");
      } catch (error) {
        // ignore
      }
      return next;
    });
  }, []);

  return [collapsed, toggle];
}
