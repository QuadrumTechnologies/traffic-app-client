"use client";

import { useEffect, useState } from "react";
import { getItemFromCookie } from "@/utils/cookiesFunc";

// The dashboard is static files, so sign-in is checked in the browser before
// a protected page shows. The API checks every request on its own as well.
export default function RequireSignIn({
  role,
  children,
}: {
  role: "user" | "admin";
  children: React.ReactNode;
}) {
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    const token = getItemFromCookie(role === "admin" ? "adminToken" : "token");
    if (!token || token === "undefined") {
      window.location.replace(role === "admin" ? "/admin/login" : "/login");
      return;
    }
    setAllowed(true);
  }, [role]);

  return allowed ? <>{children}</> : null;
}
