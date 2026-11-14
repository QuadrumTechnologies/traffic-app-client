"use client";

import { clearSession } from "@/utils/session";
import { HOME_URL } from "@/components/AuthComponents/AuthTopBar";

// Shown on every dashboard page during a demo session (Try the demo).
export default function DemoBanner() {
  const leave = () => {
    clearSession("user");
    window.location.assign(HOME_URL);
  };
  return (
    <div className="qtDemoBanner" role="note">
      <p>
        <b>Demo.</b> A simulated junction, shared with other visitors. Nothing you do here reaches a real
        junction. The demo lasts 24 hours.
      </p>
      <div className="qtDemoBanner__actions">
        <a href="/signup">Create an account</a>
        <a href="/request-access?purpose=access">Ask Quadrum</a>
        <button type="button" onClick={leave}>
          Leave the demo
        </button>
      </div>
    </div>
  );
}
