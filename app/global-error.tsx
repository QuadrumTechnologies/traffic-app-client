"use client";

import { FaExclamationTriangle } from "react-icons/fa"; // Traffic warning icon

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="errorContainer">
      <FaExclamationTriangle
        size={48}
        color="#dc3545"
        style={{ marginBottom: "1rem" }}
      />
      <h2>Something is not right!</h2>
      <p>
        {error.message || "An unexpected error occurred. Please try again."}
      </p>
      <button onClick={() => reset()}>Try again</button>
    </div>
  );
}
