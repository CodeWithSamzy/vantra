import { Resend } from "resend";

const DEFAULT_FROM = "Vantra <onboarding@resend.dev>";

export function appUrl(path = "") {
  const base = (
    process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"
  ).replace(/\/+$/, "");

  return `${base}${path}`;
}

export function isEmailConfigured() {
  return Boolean(process.env.RESEND_API_KEY);
}

type SendEmailArgs = {
  to: string;
  subject: string;
  html: string;
  text: string;
};

export async function sendEmail({ to, subject, html, text }: SendEmailArgs) {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    console.warn(
      `[email] RESEND_API_KEY is not set, skipping "${subject}" to ${to}`
    );
    return { sent: false, skipped: true };
  }

  try {
    const resend = new Resend(apiKey);
    await resend.emails.send({
      from: process.env.EMAIL_FROM ?? DEFAULT_FROM,
      to,
      subject,
      html,
      text,
    });
    return { sent: true, skipped: false };
  } catch (error) {
    console.error(`[email] failed to send "${subject}" to ${to}`, error);
    return { sent: false, skipped: false };
  }
}

function layout({
  heading,
  lines,
  ctaLabel,
  ctaUrl,
  footnote,
}: {
  heading: string;
  lines: string[];
  ctaLabel: string;
  ctaUrl: string;
  footnote: string;
}) {
  const paragraphs = lines
    .map(
      (line) =>
        `<p style="margin:0 0 12px;font-size:14px;line-height:1.6;color:#6b6a64;">${line}</p>`
    )
    .join("");

  return `<!doctype html>
<html lang="en">
  <body style="margin:0;background:#fafaf7;padding:32px 16px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;color:#12151c;">
    <table role="presentation" width="100%" style="max-width:480px;margin:0 auto;background:#ffffff;border:1px solid #e4e2dc;border-radius:10px;">
      <tr>
        <td style="padding:28px;">
          <p style="margin:0 0 20px;font-size:16px;font-family:Georgia,'Times New Roman',serif;">Vantra</p>
          <h1 style="margin:0 0 14px;font-family:Georgia,'Times New Roman',serif;font-size:22px;font-weight:600;color:#12151c;">${heading}</h1>
          ${paragraphs}
          <p style="margin:24px 0;">
            <a href="${ctaUrl}" style="display:inline-block;background:#12151c;color:#fafaf7;text-decoration:none;font-size:14px;padding:10px 18px;border-radius:6px;">${ctaLabel}</a>
          </p>
          <p style="margin:0;font-size:12px;line-height:1.6;color:#6b6a64;">${footnote}</p>
        </td>
      </tr>
    </table>
    <p style="max-width:480px;margin:16px auto 0;font-size:11px;line-height:1.6;color:#6b6a64;text-align:center;">
      You are receiving this email because of activity on your Vantra account.
    </p>
  </body>
</html>`;
}

export function verificationEmail({
  url,
  name,
}: {
  url: string;
  name?: string | null;
}) {
  return {
    subject: "Confirm your Vantra email address",
    html: layout({
      heading: "Confirm your email",
      lines: [
        `Hi${name ? ` ${name}` : ""},`,
        "Confirm this address to finish setting up your Vantra account. The link expires in 24 hours.",
      ],
      ctaLabel: "Confirm email",
      ctaUrl: url,
      footnote: `If the button does not work, paste this link into your browser:<br />${url}`,
    }),
    text: `Confirm your Vantra email address (link expires in 24 hours): ${url}`,
  };
}

export function passwordResetEmail({
  url,
  name,
}: {
  url: string;
  name?: string | null;
}) {
  return {
    subject: "Reset your Vantra password",
    html: layout({
      heading: "Reset your password",
      lines: [
        `Hi${name ? ` ${name}` : ""},`,
        "Use the link below to choose a new password. It expires in 1 hour and can only be used once.",
      ],
      ctaLabel: "Reset password",
      ctaUrl: url,
      footnote: `If you did not ask for a password reset, you can ignore this email. Your password will not change. Paste this link if the button does not work:<br />${url}`,
    }),
    text: `Reset your Vantra password (link expires in 1 hour): ${url}`,
  };
}

export function workspaceInviteEmail({
  url,
  workspaceName,
  inviterName,
}: {
  url: string;
  workspaceName: string;
  inviterName?: string | null;
}) {
  return {
    subject: `You have been invited to join ${workspaceName} on Vantra`,
    html: layout({
      heading: `Join ${workspaceName}`,
      lines: [
        `${inviterName ? `${inviterName} invited` : "You have been invited"} you to collaborate on Vantra.`,
        "Accept the invitation to see the team's projects straight away.",
      ],
      ctaLabel: "Accept invitation",
      ctaUrl: url,
      footnote: `This invitation expires in 7 days. Paste this link if the button does not work:<br />${url}`,
    }),
    text: `Join ${workspaceName} on Vantra: ${url}`,
  };
}