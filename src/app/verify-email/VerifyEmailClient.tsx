"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

type Status = "checking" | "success" | "error";

export default function VerifyEmailClient({ token }: { token: string }) {
  const [status, setStatus] = useState<Status>("checking");
  const [message, setMessage] = useState("");
  const requested = useRef(false);

  useEffect(() => {
    if (requested.current) return;
    requested.current = true;

    fetch("/api/auth/verify-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    })
      .then(async (res) => {
        if (res.ok) {
          setStatus("success");
          return;
        }

        const data = await res.json().catch(() => ({}));
        setMessage(data.error ?? "We could not verify this link.");
        setStatus("error");
      })
      .catch(() => {
        setMessage("Something went wrong. Please try again.");
        setStatus("error");
      });
  }, [token]);

  if (status === "checking") {
    return (
      <p className="mt-2 text-sm text-muted" role="status">
        Verifying your email address...
      </p>
    );
  }

  if (status === "success") {
    return (
      <>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          Your email address is confirmed. Thanks for taking the time.
        </p>
        <Link
          href="/dashboard"
          className="mt-6 inline-block rounded-md bg-ink px-4 py-2 text-sm font-medium text-paper hover:bg-ink/90"
        >
          Go to dashboard
        </Link>
      </>
    );
  }

  return (
    <>
      <p className="mt-2 text-sm leading-relaxed text-muted">{message}</p>
      <Link
        href="/dashboard"
        className="mt-6 inline-block text-sm text-accent-deep hover:underline"
      >
        Request a new link from your dashboard
      </Link>
    </>
  );
}