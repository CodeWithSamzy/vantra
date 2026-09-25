"use client";

import { useState } from "react";

type Member = {
  id: string;
  role: string;
  user: { id: string; name: string | null; email: string };
};

type Invite = {
  id: string;
  email: string;
  role: string;
  createdAt: string;
};

export default function TeamPanel({
  workspaceId,
  initialMembers,
  initialInvites,
  canInvite,
}: {
  workspaceId: string;
  initialMembers: Member[];
  initialInvites: Invite[];
  canInvite: boolean;
}) {
  const [members] = useState(initialMembers);
  const [invites, setInvites] = useState(initialInvites);
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [sending, setSending] = useState(false);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!email.trim() || !email.includes("@")) {
      setError("Enter a valid email address.");
      return;
    }

    setSending(true);
    const res = await fetch(`/api/workspaces/${workspaceId}/invites`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, role: "MEMBER" }),
    });
    const data = await res.json();
    setSending(false);

    if (!res.ok) {
      setError(data.error ?? "Something went wrong.");
      return;
    }

    setInvites((prev) => [data, ...prev]);
    setSuccess(`Invite sent to ${email}.`);
    setEmail("");
  };

  return (
    <div className="space-y-6">
      {canInvite && (
        <div className="rounded-lg border border-line bg-white p-6">
          <h2 className="font-serif text-lg text-ink">Invite someone</h2>
          <form onSubmit={handleInvite} className="mt-3 flex gap-2">
            <label htmlFor="invite-email" className="sr-only">
              Email address
            </label>
            <input
              id="invite-email"
              type="email"
              placeholder="name@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 rounded-md border border-line px-3 py-2 text-sm text-ink outline-none focus:border-ink"
            />
            <button
              type="submit"
              disabled={sending}
              className="rounded-md bg-ink px-4 py-2 text-sm font-medium text-paper hover:bg-ink/90 disabled:opacity-60"
            >
              {sending ? "Sending…" : "Invite"}
            </button>
          </form>
          {error && (
            <p className="mt-2 text-sm text-red-600" role="alert">
              {error}
            </p>
          )}
          {success && (
            <p className="mt-2 text-sm text-accent-deep" role="status">
              {success}
            </p>
          )}
        </div>
      )}

      <div className="rounded-lg border border-line bg-white">
        <div className="border-b border-line p-4 text-sm font-medium text-ink">
          Members
        </div>
        <ul>
          {members.map((m) => (
            <li
              key={m.id}
              className="flex items-center justify-between border-b border-line p-4 text-sm last:border-0"
            >
              <div>
                <p className="text-ink">{m.user.name ?? m.user.email}</p>
                <p className="text-xs text-muted">{m.user.email}</p>
              </div>
              <span className="text-xs text-muted">{m.role}</span>
            </li>
          ))}
        </ul>
      </div>

      {invites.length > 0 && (
        <div className="rounded-lg border border-line bg-white">
          <div className="border-b border-line p-4 text-sm font-medium text-ink">
            Pending invites
          </div>
          <ul>
            {invites.map((i) => (
              <li
                key={i.id}
                className="flex items-center justify-between border-b border-line p-4 text-sm last:border-0"
              >
                <span className="text-ink">{i.email}</span>
                <span className="text-xs text-muted">Pending</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
