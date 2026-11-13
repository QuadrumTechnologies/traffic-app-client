"use client";

import Link from "next/link";

// Accounts are no longer switched off and on by their owners: a Quadrum
// admin pauses and resumes them from the Users page. Old links land here.
export default function ReactivateAccount() {
  return (
    <main className="qtPlainPage">
      <div className="qtCard qtPlainPage__card">
        <h1>Paused accounts</h1>
        <p>
          Accounts are paused and resumed by your admin now. If yours is
          paused, ask your admin to resume it, or write to{" "}
          <a href="mailto:hello@quadrumtechnologies.com">hello@quadrumtechnologies.com</a>.
        </p>
        <Link className="qtButton" href="/login">
          Go to sign in
        </Link>
      </div>
    </main>
  );
}
