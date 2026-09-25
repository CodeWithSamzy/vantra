import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import AcceptInviteClient from "@/components/AcceptInviteClient";

export const metadata = { title: "Workspace invite" };

export default async function InvitePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const session = await auth();

  if (!session) {
    redirect(`/login?callbackUrl=/invite/${token}`);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-paper px-4">
      <div className="w-full max-w-sm rounded-lg border border-line bg-white p-6 text-center">
        <h1 className="font-serif text-xl text-ink">Joining workspace</h1>
        <div className="mt-4">
          <AcceptInviteClient token={token} />
        </div>
      </div>
    </div>
  );
}
