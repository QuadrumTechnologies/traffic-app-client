import { NextResponse } from "next/server";
import { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("token")?.value;
  const adminToken = request.cookies.get("adminToken")?.value;

  if (request.nextUrl.pathname.startsWith("/dashboard") && !token)
    return NextResponse.redirect(new URL("/login", request.url));

  if (
    request.nextUrl.pathname.startsWith("/admin") &&
    request.nextUrl.pathname.includes("/dashboard") &&
    !adminToken
  )
    return NextResponse.redirect(new URL("/admin/login", request.url));

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
