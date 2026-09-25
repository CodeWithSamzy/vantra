"use client";

import { useState } from "react";

export default function VerifyEmailBanner({ email }: { email: string }) {
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">(
    "idle"
  );
  const [message, setMessage] = useState("");
  const [devUrl, setDevUrl] = useState("");

  const resend = async () => {
    setState("sending");
    setMessage("");
    setDevUrl("");

    const res = await fetch("/api/auth/resend-verification", {
      method: "POST",
    });
    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      setMessage(data.error ?? "We could not send the email. Please try again.");
      setState("error");
      return;
    }

    if (data.devUrl) {
      setDevUrl(data.devUrl);
      setMessage("Email delivery is not configured here, so use this link:");
    } else {
      setMessage(`Verification link sent to ${email}.`);
    }

    setState("sent");
  };

  return (
    <div className="mt-6 rounded-lg border border-accent/40 bg-accent/10 p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-ink">
            Confirm your email address
          </p>
          <p className="mt-1 text-sm leading-relaxed text-muted">
            We sent a verification link to {email}. Confirming it keeps your
            account secure.
          </p>
        </div>
        <button
          type="button"
          onClick={resend}
          disabled={state === "sending"}
          className="shrink-0 rounded-md border border-line bg-white px-3 py-1.5 text-xs font-medium text-ink hover:bg-paper disabled:opacity-60"
        >
          {state === "sending" ? "Sending..." : "Resend email"}
        </button>
      </div>

      {message && (
        <p className="mt-3 text-xs text-muted" role="status">
          {message}
          {devUrl && (
            <>
              {" "}
              <a
                href={devUrl}
                className="font-medium text-accent-deep underline underline-offset-2"
              >
                Verify now
              </a>
            </>
          )}
        </p>
      )}
    </div>
  );
}