import Link from "next/link";
import VerifyEmailClient from "./VerifyEmailClient";

export const metadata = { title: "Verify email" };

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-paper px-6">
      <div className="w-full max-w-sm">
        <Link href="/" className="font-serif text-xl text-ink">
          Vantra
        </Link>
        <h1 className="mt-8 font-serif text-2xl text-ink">Email verification</h1>

        {token ? (
          <VerifyEmailClient token={token} />
        ) : (
          <>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              This link is missing its verification token. Open the link from
              your email again, or request a new one from your dashboard.
            </p>
            <Link
              href="/dashboard"
              className="mt-6 inline-block text-sm text-accent-deep hover:underline"
            >
              Go to dashboard
            </Link>
          </>
        )}
      </div>
    </div>
  );
}