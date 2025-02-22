import { NextResponse } from "next/server";
import { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("token")?.value;
  const adminToken = request.cookies.get("adminToken")?.value;

  if (request.nextUrl.pathname === "/" && token)
    return NextResponse.redirect(new URL("/dashboard", request.url));

  if (request.nextUrl.pathname.startsWith("/dashboard") && !token)
    return NextResponse.redirect(new URL("/login", request.url));

  if (
    request.nextUrl.pathname.startsWith("/admin") &&
    request.nextUrl.pathname.includes("/dashboard") &&
    !adminToken
  )
    return NextResponse.redirect(new URL("/admin/login", request.url));

  if (
    /^\/admin\/dashboard\/devices\/[^/]+\/(intersection_configuration|device_configuration)$/.test(
      request.nextUrl.pathname
    )
  ) {
    const deviceId = request.nextUrl.pathname.split("/").pop();
    const storedDevices = request.cookies.get("adminDevices")?.value;

    if (storedDevices) {
      try {
        const devices = JSON.parse(storedDevices);
        const device = devices.find((d: any) => d.deviceId === deviceId);

        // Redirect if no device or admin support is not enabled
        if (!device || !device.allowAdminSupport) {
          return NextResponse.redirect(
            new URL("/admin/dashboard/devices", request.url)
          );
        }
      } catch {
        return NextResponse.redirect(
          new URL("/admin/dashboard/devices", request.url)
        );
      }
    } else {
      return NextResponse.redirect(
        new URL("/admin/dashboard/devices", request.url)
      );
    }
  }

  return NextResponse.next();
}

// Supports both a single string value or an array of matchers
// export const config = {
//   matcher: '/dashboard/:path*',
// OR
//   matcher: [
//     "/dashboard/:path*",
//   ],
// };
