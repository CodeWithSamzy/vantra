"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SettingsForm({
  initialName,
  email,
  emailVerified,
}: {
  initialName: string;
  email: string;
  emailVerified: boolean;
}) {
  const router = useRouter();
  const [name, setName] = useState(initialName);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const [verified, setVerified] = useState(emailVerified);
  const [sendingVerification, setSendingVerification] = useState(false);
  const [verificationMessage, setVerificationMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSaved(false);

    if (!name.trim()) {
      setError("Name can't be empty.");
      return;
    }

    setSaving(true);
    const res = await fetch("/api/user", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    setSaving(false);

    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "Something went wrong.");
      return;
    }

    setSaved(true);
    router.refresh();
  };

  const resendVerification = async () => {
    setSendingVerification(true);
    setVerificationMessage("");

    const res = await fetch("/api/auth/resend-verification", {
      method: "POST",
    });
    const data = await res.json().catch(() => ({}));
    setSendingVerification(false);

    if (!res.ok) {
      setVerificationMessage(data.error ?? "We could not send the email.");
      return;
    }

    if (data.alreadyVerified) {
      setVerified(true);
      setVerificationMessage("This address is already confirmed.");
      return;
    }

    setVerificationMessage(
      data.devUrl
        ? "Email delivery is not configured here - use the link on your dashboard."
        : `Verification link sent to ${email}.`
    );
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-sm rounded-lg border border-line bg-white p-6"
    >
      <div className="mb-5">
        <p className="mb-1 block text-xs text-muted">Email</p>
        <p className="text-sm text-ink">{email}</p>
        <p className="mt-1 text-xs text-muted">
          {verified ? "Confirmed" : "Not confirmed yet"}
        </p>
        {!verified && (
          <button
            type="button"
            onClick={resendVerification}
            disabled={sendingVerification}
            className="mt-2 text-xs text-accent-deep hover:underline disabled:opacity-60"
          >
            {sendingVerification ? "Sending..." : "Resend verification email"}
          </button>
        )}
        {verificationMessage && (
          <p className="mt-2 text-xs text-muted" role="status">
            {verificationMessage}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="name" className="mb-1 block text-xs text-muted">
          Full name
        </label>
        <input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full rounded-md border border-line px-3 py-2 text-sm text-ink outline-none focus:border-ink"
        />
      </div>

      {error && (
        <p className="mt-3 text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
      {saved && (
        <p className="mt-3 text-sm text-accent-deep" role="status">
          Saved.
        </p>
      )}

      <button
        type="submit"
        disabled={saving}
        className="mt-4 rounded-md bg-ink px-4 py-2 text-sm font-medium text-paper hover:bg-ink/90 disabled:opacity-60"
      >
        {saving ? "Saving..." : "Save changes"}
      </button>
    </form>
  );
}