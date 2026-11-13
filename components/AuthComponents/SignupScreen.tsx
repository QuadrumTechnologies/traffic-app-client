"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import HttpRequest from "@/store/services/HttpRequest";
import SignalTimeline from "@/components/Signal/SignalTimeline";

// Self-service sign-up: buyers open their own account, verify their email,
// then add their junction from its label (it must be recorded to the same
// email at purchase; claim codes replace that step with the next batch).

const RULES: [string, (p: string) => boolean][] = [
  ["8 characters or more", (p) => p.length >= 8],
  ["an uppercase and a lowercase letter", (p) => /[A-Z]/.test(p) && /[a-z]/.test(p)],
  ["a number", (p) => /[0-9]/.test(p)],
  ["a symbol such as ! @ # $ % ^ & *", (p) => /[!@#$%^&*]/.test(p)],
];

export default function SignupScreen() {
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<string | null>(null);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    const form = new FormData(event.currentTarget);
    const name = String(form.get("name") || "").trim().replace(/\s+/g, " ");
    const email = String(form.get("email") || "").trim().toLowerCase();
    const confirm = String(form.get("confirm") || "");
    if (name.split(" ").length < 2) return setError("Enter your first and last name.");
    if (!/^\S+@\S+\.\S+$/.test(email)) return setError("Enter a valid email address.");
    if (!RULES.every(([, ok]) => ok(password))) return setError("Choose a password that meets every rule below.");
    if (confirm !== password) return setError("The two passwords don't match.");
    setBusy(true);
    try {
      await HttpRequest.post("/auth/signup", { name, email, password, confirmPassword: confirm });
      setDone(email);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Your account couldn't be created. Please try again.");
    } finally {
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
          <p className="loginScreen__eyebrow">Traffic Control and Monitoring System</p>
          <h1>Commission it yourself.</h1>
          <p>
            Create your account, verify your email, then add your junction
            with the device ID on its label. Use the email you bought it with,
            so the junction can be matched to you.
          </p>
        </div>
        <div className="loginScreen__timeline">
          <SignalTimeline variant="dark" animate fontScale={1.35} title="A four-stage cycle, running" />
        </div>
      </section>

      <section className="loginScreen__panel">
        {done ? (
          <div className="loginScreen__form qtRequest__done" role="status">
            <h2>Check your email</h2>
            <p>We sent a link to <b>{done}</b>. Open it to verify your address, then:</p>
            <ol className="qtSteps">
              <li>Sign in.</li>
              <li>Choose <b>Add a junction</b> and type the device ID from the controller&rsquo;s label.</li>
              <li>If it says the junction isn&rsquo;t assigned to you yet, <Link href="/request-access">send us your order number</Link> and we&rsquo;ll match it.</li>
            </ol>
            <Link className="loginScreen__submit qtRequest__back" href="/login">
              Go to sign in
            </Link>
          </div>
        ) : (
          <form className="loginScreen__form" onSubmit={onSubmit} noValidate>
            <h2>Create your account</h2>
            <p className="loginScreen__hint">
              Already have one? <Link href="/login">Sign in</Link>. Prefer a hand?{" "}
              <Link href="/request-access">Ask Quadrum</Link>.
            </p>

            <label htmlFor="su-name">Full name</label>
            <input id="su-name" name="name" autoComplete="name" required />

            <label htmlFor="su-email">Email</label>
            <input id="su-email" name="email" type="email" inputMode="email" autoComplete="email" autoCapitalize="none" spellCheck={false} required />

            <label htmlFor="su-password">Password</label>
            <div className="loginScreen__password">
              <input
                id="su-password"
                name="password"
                type={show ? "text" : "password"}
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button type="button" onClick={() => setShow((v) => !v)} aria-pressed={show}>
                {show ? "Hide" : "Show"}
              </button>
            </div>
            <ul className="qtRules" aria-label="Password rules">
              {RULES.map(([text, ok]) => (
                <li key={text} className={ok(password) ? "is-ok" : ""}>
                  {text}
                </li>
              ))}
            </ul>

            <label htmlFor="su-confirm">Confirm password</label>
            <input id="su-confirm" name="confirm" type={show ? "text" : "password"} autoComplete="new-password" required />

            {error ? (
              <p className="loginScreen__error" role="alert">
                {error}
              </p>
            ) : null}

            <button className="loginScreen__submit" type="submit" disabled={busy}>
              {busy ? "Creating your account…" : "Create account"}
            </button>
          </form>
        )}
      </section>
    </main>
  );
}
