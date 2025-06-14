import { NextResponse } from "next/server";
import { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("token")?.value;
  const adminToken = request.cookies.get("adminToken")?.value;

  if (request.nextUrl.pathname === "/" && token && token !== "undefined") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  if (
    request.nextUrl.pathname.startsWith("/dashboard") &&
    (!token || token === "undefined")
  ) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (
    request.nextUrl.pathname.startsWith("/login") &&
    token &&
    token !== "undefined"
  ) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  if (
    request.nextUrl.pathname.startsWith("/admin") &&
    request.nextUrl.pathname.includes("/dashboard") &&
    (!adminToken || adminToken === "undefined")
  ) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  if (
    request.nextUrl.pathname === "/admin/login" &&
    adminToken &&
    adminToken !== "undefined"
  ) {
    return NextResponse.redirect(new URL("/admin/dashboard", request.url));
  }

  if (
    /^\/admin\/dashboard\/devices\/[^/]+\/(intersection_configuration|device_configuration)$/.test(
      request.nextUrl.pathname
    )
  ) {
    const segments = request.nextUrl.pathname.split("/");
    const deviceId = segments[segments.length - 2];
    const storedDevices = request.cookies.get("adminDevices")?.value;

    if (storedDevices) {
      try {
        const devices = JSON.parse(storedDevices);
        const device = devices.find((d: any) => d.deviceId === deviceId);

        if (!device || !device.allowAdminSupport) {
          console.log("Redirecting due to invalid device or admin support");
          return NextResponse.redirect(
            new URL("/admin/dashboard/devices", request.url)
          );
        }
      } catch (e) {
        console.error("Error parsing storedDevices:", e);
        return NextResponse.redirect(
          new URL("/admin/dashboard/devices", request.url)
        );
      }
    } else {
      console.log("Redirecting due to missing storedDevices");
      return NextResponse.redirect(
        new URL("/admin/dashboard/devices", request.url)
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/dashboard/:path*", "/admin/:path*"],
};
