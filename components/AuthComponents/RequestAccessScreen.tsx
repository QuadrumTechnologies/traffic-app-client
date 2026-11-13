"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import HttpRequest from "@/store/services/HttpRequest";
import SignalTimeline from "@/components/Signal/SignalTimeline";
import AuthTopBar, { HOME_URL } from "./AuthTopBar";

// Public page: ask for access, a demo, a quote or a partnership. Quadrum
// approves requests on the Users page. A demo needs only an email or phone.

type Purpose = "demo" | "access" | "buy" | "partner";

const PURPOSES: { value: Purpose; label: string; detail: string }[] = [
  { value: "demo", label: "Try the demo", detail: "See the platform without touching a live junction." },
  { value: "access", label: "Help setting up my account", detail: "We'll set it up with you and add the controllers you bought." },
  { value: "buy", label: "Buy or get a quote", detail: "Controllers, cards, installation partners, support." },
  { value: "partner", label: "Partner or integration", detail: "Agencies and systems that need data or an API." },
];

function isPurpose(value: string | null): value is Purpose {
  return PURPOSES.some((p) => p.value === value);
}

export default function RequestAccessScreen() {
  const [purpose, setPurpose] = useState<Purpose>("access");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<string | null>(null);

  useEffect(() => {
    const asked = new URLSearchParams(window.location.search).get("purpose");
    if (isPurpose(asked)) setPurpose(asked);
  }, []);

  const isDemo = purpose === "demo";

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    const form = new FormData(event.currentTarget);
    const value = (name: string) => String(form.get(name) || "").trim();
    const body = {
      purpose,
      company: value("company"),
      name: value("name"),
      email: value("email").toLowerCase(),
      phone: value("phone"),
      devices: value("devices"),
      message: value("message"),
      website: value("website"),
    };
    if (isDemo && !body.email && !body.phone) {
      setError("Enter your email address or phone number.");
      return;
    }
    if (!isDemo && (!body.company || !body.name || !body.email)) {
      setError("Enter your company, your name and your email address.");
      return;
    }
    setBusy(true);
    try {
      const { data } = await HttpRequest.post("/access-requests", body);
      setDone(data?.message || "Thanks. We'll be in touch.");
    } catch (err: any) {
      setError(err?.response?.data?.message || "Your request couldn't be sent. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="loginScreen">
      <section className="loginScreen__hero" aria-label="Quadrum Technologies">
        <a className="loginScreen__brand" href={HOME_URL} aria-label="Quadrum Technologies home">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/logo-light.png" alt="" width={47} height={44} />
          <span>Quadrum Technologies</span>
        </a>
        <div className="loginScreen__copy">
          <p className="loginScreen__eyebrow">Traffic Control and Monitoring System</p>
          <h1>Get started.</h1>
          <p>
            You don&rsquo;t need us to open your account. Bought a controller?
            Create your account with the email you bought it with, then add
            the controller using the device ID on its label; it takes a few minutes. Prefer a
            hand? Ask here and Quadrum will set it up with you.
          </p>
        </div>
        <div className="loginScreen__timeline">
          <SignalTimeline variant="dark" animate fontScale={1.35} title="A four-stage cycle, running" />
        </div>
      </section>

      <section className="loginScreen__panel">
        <AuthTopBar link={{ href: "/login", label: "Sign in" }} />
        {done ? (
          <div className="loginScreen__form qtRequest__done" role="status">
            <h2>Request sent</h2>
            <p>{done}</p>
            <Link className="loginScreen__submit qtRequest__back" href="/login">
              Back to sign in
            </Link>
          </div>
        ) : (
          <form className="loginScreen__form qtRequest" onSubmit={onSubmit} noValidate>
            <h2>Ask Quadrum</h2>
            <p className="loginScreen__hint">
              Setting up yourself? <Link href="/signup">Create your account</Link>.
              Already have one? <Link href="/login">Sign in</Link>.
            </p>

            <fieldset className="qtRequest__purposes">
              <legend>What do you need?</legend>
              {PURPOSES.map((p) => (
                <label key={p.value} className={`qtRequest__purpose ${purpose === p.value ? "is-on" : ""}`}>
                  <input
                    type="radio"
                    name="purpose"
                    value={p.value}
                    checked={purpose === p.value}
                    onChange={() => setPurpose(p.value)}
                  />
                  <span>
                    <b>{p.label}</b>
                    <small>{p.detail}</small>
                  </span>
                </label>
              ))}
            </fieldset>

            {isDemo ? (
              <p className="qtRequest__lead">Your email address or phone number is enough for a demo.</p>
            ) : null}

            <div className="qtRequest__row">
              <div>
                <label htmlFor="ra-name">Your name{isDemo ? " (optional)" : ""}</label>
                <input id="ra-name" name="name" autoComplete="name" />
              </div>
              <div>
                <label htmlFor="ra-company">Company or organisation{isDemo ? " (optional)" : ""}</label>
                <input id="ra-company" name="company" autoComplete="organization" />
              </div>
            </div>
            <div className="qtRequest__row">
              <div>
                <label htmlFor="ra-email">Email</label>
                <input id="ra-email" name="email" type="email" inputMode="email" autoComplete="email" autoCapitalize="none" spellCheck={false} />
              </div>
              <div>
                <label htmlFor="ra-phone">Phone{isDemo ? "" : " (optional)"}</label>
                <input id="ra-phone" name="phone" type="tel" inputMode="tel" autoComplete="tel" placeholder="+234 …" />
              </div>
            </div>

            {purpose === "access" || purpose === "buy" ? (
              <>
                <label htmlFor="ra-devices">
                  {purpose === "access" ? "Controllers you bought" : "What you need (optional)"}
                </label>
                <input
                  id="ra-devices"
                  name="devices"
                  placeholder={purpose === "access" ? "Device IDs from the label, or your order or invoice number" : "For example: 4 junction controllers"}
                />
              </>
            ) : null}

            <label htmlFor="ra-message">Message (optional)</label>
            <textarea id="ra-message" name="message" rows={3} maxLength={1000} />

            {/* People never see this field; automated spam fills it in. */}
            <div className="qtRequest__trap" aria-hidden="true">
              <label htmlFor="ra-website">Website</label>
              <input id="ra-website" name="website" tabIndex={-1} autoComplete="off" />
            </div>

            {error ? (
              <p className="loginScreen__error" role="alert">
                {error}
              </p>
            ) : null}

            <button className="loginScreen__submit" type="submit" disabled={busy}>
              {busy ? "Sending…" : isDemo ? "Ask for the demo" : "Send request"}
            </button>

            <p className="loginScreen__note">
              We reply within one working day. You can also write to{" "}
              <a href="mailto:hello@quadrumtechnologies.com">hello@quadrumtechnologies.com</a>.
            </p>
          </form>
        )}
      </section>
    </main>
  );
}
