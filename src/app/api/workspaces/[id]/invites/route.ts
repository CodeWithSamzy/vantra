import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getMembership } from "@/lib/workspace";
import { sendEmail, workspaceInviteEmail } from "@/lib/email";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const { id: workspaceId } = await params;
  const membership = await getMembership(workspaceId, session.user.id);

  if (!membership || membership.role === "MEMBER") {
    return NextResponse.json(
      { error: "Only owners or admins can invite people." },
      { status: 403 }
    );
  }

  const { email, role } = await req.json();
  if (!email || typeof email !== "string" || !email.includes("@")) {
    return NextResponse.json(
      { error: "Enter a valid email address." },
      { status: 400 }
    );
  }

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    const alreadyMember = await getMembership(workspaceId, existingUser.id);
    if (alreadyMember) {
      return NextResponse.json(
        { error: "That person is already a member." },
        { status: 409 }
      );
    }
  }

  const workspace = await prisma.workspace.findUnique({
    where: { id: workspaceId },
  });

  const invite = await prisma.invite.create({
    data: {
      workspaceId,
      email,
      role: role === "ADMIN" ? "ADMIN" : "MEMBER",
      token: randomUUID(),
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
    },
  });

  const inviteUrl = `${process.env.NEXT_PUBLIC_APP_URL}/invite/${invite.token}`;

  await sendEmail({
    to: email,
    ...workspaceInviteEmail({
      url: inviteUrl,
      workspaceName: workspace?.name ?? "a workspace",
      inviterName: session.user.name,
    }),
  });
  return NextResponse.json({ ...invite, inviteUrl }, { status: 201 });
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const { id: workspaceId } = await params;
  const membership = await getMembership(workspaceId, session.user.id);
  if (!membership) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }

  const invites = await prisma.invite.findMany({
    where: { workspaceId, status: "PENDING" },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(invites);
}
