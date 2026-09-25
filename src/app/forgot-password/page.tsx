import Link from "next/link";
import ForgotPasswordForm from "./ForgotPasswordForm";

export const metadata = { title: "Reset your password" };

export default function ForgotPasswordPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-paper px-6">
      <div className="w-full max-w-sm">
        <Link href="/" className="font-serif text-xl text-ink">
          Vantra
        </Link>
        <h1 className="mt-8 font-serif text-2xl text-ink">Reset your password</h1>
        <p className="mt-1 text-sm text-muted">
          Enter your email and we will send you a link to choose a new password.
        </p>

        <ForgotPasswordForm />

        <p className="mt-8 text-sm text-muted">
          Remembered it?{" "}
          <Link
            href="/login"
            className="font-medium text-ink underline underline-offset-2"
          >
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}