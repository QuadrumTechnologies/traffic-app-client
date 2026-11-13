"use client";

// The dashboard is exported as static files. A page with an id in its address
// (a device, a reset or verification token) is built once, with "_" in place
// of the id, and Cloudflare Pages serves that file for every real address
// (see public/_redirects). Next.js then hands the page "_" as the id, so read
// the real value from the address bar instead.

export const ID_PLACEHOLDER = "_";

// Which address segment holds each parameter: the one after this word.
const SEGMENT_BEFORE: Record<string, string> = {
  deviceId: "devices",
  resetPasswordToken: "reset_password",
  emailResetToken: "verify_email",
};

function entryPath(): string {
  if (typeof window === "undefined") return "";
  const saved = (window as unknown as { __QT_ENTRY_PATH__?: string })
    .__QT_ENTRY_PATH__;
  const current = window.location.pathname;
  // After a client-side navigation the address bar is right; on first load
  // Next.js may have swapped in the built "_" path, so fall back to the saved one.
  return current.split("/").includes(ID_PLACEHOLDER) && saved ? saved : current;
}

export function realParam(name: string, value: string | string[] | undefined) {
  const raw = Array.isArray(value) ? value[0] : value;
  if (raw !== ID_PLACEHOLDER || typeof window === "undefined") return raw ?? "";
  const marker = SEGMENT_BEFORE[name];
  if (!marker) return raw;
  const parts = entryPath().split("/").filter(Boolean);
  const index = parts.lastIndexOf(marker);
  const found = index >= 0 ? parts[index + 1] : undefined;
  return found && found !== ID_PLACEHOLDER ? decodeURIComponent(found) : raw;
}

export function useRealParams<T extends Record<string, any>>(params: T): T {
  const resolved: Record<string, any> = { ...(params || {}) };
  for (const key of Object.keys(resolved)) {
    resolved[key] = realParam(key, resolved[key]);
  }
  return resolved as T;
}

// The current path with a "_" placeholder swapped for the real id, for
// building links such as `${path}/intersection_configuration`.
export function realPathname(pathname: string): string {
  if (!pathname || typeof window === "undefined") return pathname;
  const parts = pathname.split("/");
  if (!parts.includes(ID_PLACEHOLDER)) return pathname;
  return parts
    .map((segment, i) => {
      if (segment !== ID_PLACEHOLDER) return segment;
      const before = parts[i - 1];
      const name = Object.keys(SEGMENT_BEFORE).find(
        (key) => SEGMENT_BEFORE[key] === before
      );
      return name ? realParam(name, ID_PLACEHOLDER) : segment;
    })
    .join("/");
}
