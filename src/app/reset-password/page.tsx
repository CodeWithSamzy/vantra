import Link from "next/link";
import { findPasswordResetToken } from "@/lib/auth-tokens";
import ResetPasswordForm from "./ResetPasswordForm";

export const metadata = { title: "Choose a new password" };

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;
  const valid = token ? await findPasswordResetToken(token) : null;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-paper px-6">
      <div className="w-full max-w-sm">
        <Link href="/" className="font-serif text-xl text-ink">
          Vantra
        </Link>
        <h1 className="mt-8 font-serif text-2xl text-ink">
          Choose a new password
        </h1>

        {token && valid ? (
          <>
            <p className="mt-1 text-sm text-muted">
              Pick something you have not used before.
            </p>
            <ResetPasswordForm token={token} />
          </>
        ) : (
          <>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              This reset link is invalid or has expired. Request a new one to
              continue.
            </p>
            <Link
              href="/forgot-password"
              className="mt-6 inline-block rounded-md bg-ink px-4 py-2 text-sm font-medium text-paper hover:bg-ink/90"
            >
              Request a new link
            </Link>
          </>
        )}
      </div>
    </div>
  );
}