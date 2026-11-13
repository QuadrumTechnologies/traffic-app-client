"use client";

import { useEffect } from "react";
import { ID_PLACEHOLDER } from "@/hooks/useRealParams";

// If Next.js replaced the address with the built "_" path on first load,
// put the real address back so reloads and shared links keep the id.
export default function AddressBarFix() {
  useEffect(() => {
    const saved = (window as unknown as { __QT_ENTRY_PATH__?: string })
      .__QT_ENTRY_PATH__;
    const current = window.location.pathname;
    if (
      saved &&
      saved !== current &&
      current.split("/").includes(ID_PLACEHOLDER) &&
      !saved.split("/").includes(ID_PLACEHOLDER)
    ) {
      window.history.replaceState(
        window.history.state,
        "",
        saved + window.location.search + window.location.hash
      );
    }
  }, []);
  return null;
}
