import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import SettingsForm from "@/components/SettingsForm";

export const metadata = { title: "Settings" };

export default async function SettingsPage() {
  const session = await auth();
  const user = await prisma.user.findUnique({
    where: { id: session!.user!.id },
    select: { emailVerified: true },
  });

  return (
    <main className="flex-1 p-4 py-6 sm:p-8">
      <div className="mx-auto max-w-3xl">
        <h1 className="font-serif text-2xl text-ink">Settings</h1>
        <p className="mt-1 text-sm text-muted">
          Manage your account details.
        </p>

        <div className="mt-8">
          <SettingsForm
            initialName={session!.user!.name ?? ""}
            email={session!.user!.email ?? ""}
            emailVerified={Boolean(user?.emailVerified)}
          />
        </div>
      </div>
    </main>
  );
}
