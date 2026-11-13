"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import HttpRequest from "@/store/services/HttpRequest";
import { getItemFromCookie, setItemToCookie } from "@/utils/cookiesFunc";
import { SetItemToLocalStorage } from "@/utils/localStorageFunc";
import SignalTimeline from "@/components/Signal/SignalTimeline";

// One sign-in page for users and admins: the account decides where it goes.
// The user sign-in is tried first; if the API doesn't know the address or
// password there, the admin sign-in is tried with the same details.

const DASHBOARD = "/dashboard/devices";
const ADMIN_DASHBOARD = "/admin/dashboard/devices";

function signedInDestination(): string | null {
  const userToken = getItemFromCookie("token");
  const adminToken = getItemFromCookie("adminToken");
  if (userToken && userToken !== "undefined") return DASHBOARD;
  if (adminToken && adminToken !== "undefined") return ADMIN_DASHBOARD;
  return null;
}

export default function LoginScreen() {
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    const destination = signedInDestination();
    if (destination) {
      window.location.replace(destination);
      return;
    }
    // Arriving from endSession(): say why, then tidy the address.
    const params = new URLSearchParams(window.location.search);
    if (params.get("session") === "ended") {
      setNotice("Your sign-in has ended. Please sign in again.");
      window.history.replaceState(null, "", window.location.pathname);
    }
  }, []);

  // The fields are read from the form itself, not from React state, so what
  // is sent is exactly what is on screen, including browser autofill.
  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    const form = new FormData(event.currentTarget);
    const address = String(form.get("email") || "").trim().toLowerCase();
    const password = String(form.get("password") || "");
    if (!/^\S+@\S+\.\S+$/.test(address) || !password) {
      setError("Enter your email address and password.");
      return;
    }
    setBusy(true);
    try {
      const { data } = await HttpRequest.post("/auth/signin", {
        email: address,
        password,
      });
      const { user, token, tokenExpiresIn } = data.data;
      setItemToCookie("token", token, +tokenExpiresIn / 24);
      SetItemToLocalStorage("user", user);
      window.location.assign(DASHBOARD);
      return;
    } catch (userError: any) {
      const status = userError?.response?.status;
      const message: string = userError?.response?.data?.message || "";
      // Only an unknown address or wrong password falls through to admin.
      const tryAdmin = status === 400 && /incorrect email or password/i.test(message);
      if (!tryAdmin) {
        setError(message || "Can't reach the server. Check your connection and try again.");
        setBusy(false);
        return;
      }
    }
    try {
      const { data } = await HttpRequest.post("/auth/admin/signin", {
        email: address,
        password,
      });
      const { adminUser, adminToken, tokenExpiresIn } = data.data;
      setItemToCookie("adminToken", adminToken, +tokenExpiresIn / 24);
      SetItemToLocalStorage("adminUser", adminUser);
      window.location.assign(ADMIN_DASHBOARD);
    } catch (adminError: any) {
      const message: string = adminError?.response?.data?.message || "";
      setError(
        /incorrect email or password/i.test(message) || !message
          ? "That email and password don't match an account."
          : message
      );
      setBusy(false);
    }
  }

  return (
    <main className="loginScreen">
      <section className="loginScreen__hero" aria-label="Quadrum Technologies">
        <div className="loginScreen__brand">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/logo-light.png" alt="" width={47} height={44} />
          <span>Quadrum Technologies</span>
        </div>
        <div className="loginScreen__copy">
          <p className="loginScreen__eyebrow">Traffic Monitoring System</p>
          <h1>Every junction, one screen.</h1>
          <p>
            Watch your controllers live, plan signal timing and keep a record
            of every change.
          </p>
        </div>
        <div className="loginScreen__timeline">
          <SignalTimeline variant="dark" animate fontScale={1.35} title="A four-stage cycle, running" />
        </div>
      </section>

      <section className="loginScreen__panel">
        <form className="loginScreen__form" onSubmit={onSubmit} noValidate>
          <h2>Sign in</h2>
          <p className="loginScreen__hint">
            For Quadrum clients and staff. Admins sign in here too.
          </p>

          <label htmlFor="email">Email</label>
          <input
            id="email"
            name="email"
            type="email"
            inputMode="email"
            autoComplete="username"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            required
          />

          <label htmlFor="password">Password</label>
          <div className="loginScreen__password">
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              aria-pressed={showPassword}
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>

          {error ? (
            <p className="loginScreen__error" role="alert">
              {error}
            </p>
          ) : notice ? (
            <p className="loginScreen__notice" role="status">
              {notice}
            </p>
          ) : null}

          <button className="loginScreen__submit" type="submit" disabled={busy}>
            {busy ? "Signing in…" : "Sign in"}
          </button>

          <div className="loginScreen__links">
            <Link href="/forgot_password">Forgot your password?</Link>
            <Link href="/admin/forgot_password">Admin password reset</Link>
          </div>

          <p className="loginScreen__note">
            Accounts are set up by your organisation&rsquo;s admin. Need one?{" "}
            <a href="mailto:hello@quadrumtechnologies.com">hello@quadrumtechnologies.com</a>
          </p>
        </form>
      </section>
    </main>
  );
}
