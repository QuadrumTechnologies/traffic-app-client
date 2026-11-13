"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

// The dashboard opens on the device list.
export default function DashboardIndex() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/admin/dashboard/devices");
  }, [router]);
  return null;
}
