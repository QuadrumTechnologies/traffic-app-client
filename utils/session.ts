import { removeItemFromCookie } from "@/utils/cookiesFunc";
import { RemoveItemFromLocalStorage } from "@/utils/localStorageFunc";

// A browser holds at most one user sign-in and one admin sign-in. Pages under
// /admin use the admin one; every other page uses the user one.

export type SessionRole = "user" | "admin";

export function roleForPath(pathname: string): SessionRole {
  return pathname.startsWith("/admin") ? "admin" : "user";
}

export function clearSession(role: SessionRole): void {
  if (role === "admin") {
    removeItemFromCookie("adminToken");
    RemoveItemFromLocalStorage("adminUser");
  } else {
    removeItemFromCookie("token");
    RemoveItemFromLocalStorage("user");
  }
}

// The API answers 401 both for a sign-in it no longer accepts (expired,
// signed with an old key, account gone) and for a wrong password typed into a
// form. Only the first kind ends the session; its messages mention the token
// or ask the person to log in.
export function isEndedSession(status?: number, message?: unknown): boolean {
  return status === 401 && /token|log in/i.test(String(message || ""));
}

let ending = false;

// Clears the stored sign-in for this part of the app and goes to its sign-in
// page once, however many requests fail at the same moment.
export function endSession(): void {
  if (typeof window === "undefined" || ending) return;
  ending = true;
  const role = roleForPath(window.location.pathname);
  const wasDemo = role === "user" && isDemoSession();
  clearSession(role);
  if (wasDemo) {
    window.location.replace("/request-access?purpose=demo&instant=1&session=ended");
    return;
  }
  const signIn = role === "admin" ? "/admin/login" : "/login";
  window.location.replace(`${signIn}?session=ended`);
}

// The demo (Try the demo) signs in as a 24-hour demo session.
export function isDemoSession(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const user = JSON.parse(window.localStorage.getItem("user") || "null");
    return Boolean(user && user.isDemo);
  } catch (e) {
    return false;
  }
}
