import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create your account",
};

export default function SignupLayout({ children }: LayoutProps<"/signup">) {
  return children;
}