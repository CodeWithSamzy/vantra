"use client";

import { Suspense, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Enter your email and password.");
      return;
    }

    setLoading(true);
    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
    setLoading(false);

    if (result?.error) {
      setError(
        result.code === "rate_limited"
          ? "Too many login attempts. Please wait a few minutes and try again."
          : "Invalid email or password."
      );
      return;
    }

    router.push(callbackUrl);
  };

  return (
    <div className="grid min-h-screen grid-cols-1 lg:grid-cols-2">
      <div className="flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          <Link href="/" className="font-serif text-xl text-ink">
            Vantra
          </Link>
          <h1 className="mt-8 font-serif text-2xl text-ink">Log in</h1>
          <p className="mt-1 text-sm text-muted">Welcome back.</p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-3">
            <div>
              <label htmlFor="email" className="mb-1 block text-xs text-muted">
                Email
              </label>
              <input
                id="email"
                type="email"
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-md border border-line bg-white px-3 py-2 text-sm text-ink outline-none focus:border-ink"
              />
            </div>
            <div>
              <div className="flex items-baseline justify-between">
                <label
                  htmlFor="password"
                  className="mb-1 block text-xs text-muted"
                >
                  Password
                </label>
                <Link
                  href="/forgot-password"
                  className="text-xs text-accent-deep hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-md border border-line bg-white px-3 py-2 text-sm text-ink outline-none focus:border-ink"
              />
            </div>

            {error && (
              <p className="text-sm text-red-600" role="alert">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-md bg-ink py-2.5 text-sm font-medium text-paper hover:bg-ink/90 disabled:opacity-60"
            >
              {loading ? "Logging in…" : "Log in"}
            </button>
          </form>

          <div className="my-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-line" />
            <span className="text-xs text-muted">or</span>
            <div className="h-px flex-1 bg-line" />
          </div>

          <button
            onClick={() => signIn("google", { callbackUrl })}
            className="w-full rounded-md border border-line bg-white py-2.5 text-sm font-medium text-ink hover:bg-paper"
          >
            Continue with Google
          </button>

          <p className="mt-8 text-sm text-muted">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="font-medium text-ink underline underline-offset-2">
              Sign up
            </Link>
          </p>
        </div>
      </div>

      <div className="hidden bg-ink lg:flex lg:flex-col lg:justify-between lg:p-12">
        <div />
        <blockquote className="max-w-sm font-serif text-2xl leading-snug text-paper">
          &ldquo;Everything I need to run projects, and nothing I don&apos;t.&rdquo;
        </blockquote>
        <p className="text-sm text-paper/60">Built for small teams who ship.</p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
