import { Resend } from "resend";

const resendKey = process.env.RESEND_API_KEY!;
const from = process.env.EMAIL_FROM || "Vamoot <noreply@example.com>";

export type InviteEmailProps = {
  to: string;
  orgName: string;
  role: "owner" | "admin" | "member";
  acceptUrl: string;
  invitedBy?: { name?: string | null; email?: string | null } | null;
};

export async function sendInviteEmail(props: InviteEmailProps) {
  if (!resendKey) {
    console.warn("[email] RESEND_API_KEY missing; skipping send", props.to);
    return { skipped: true };
  }
  const resend = new Resend(resendKey);
  const subject = `You're invited to join ${props.orgName} on Vamoot`;
  const html = renderInviteHTML(props);
  const text = renderInviteText(props);
  return resend.emails.send({ from, to: props.to, subject, html, text });
}

function renderInviteHTML({ orgName, role, acceptUrl, invitedBy }: InviteEmailProps) {
  const inviter = invitedBy?.name || invitedBy?.email || "A teammate";
  return `<!doctype html><html><body style="font-family:system-ui;line-height:1.5;background:#f6f7f9;padding:24px">
  <table role="presentation" width="100%" style="max-width:560px;margin:0 auto;background:#fff;border-radius:16px;border:1px solid #e5e7eb"><tr><td style="padding:24px">
    <div style="font-size:14px;color:#475569;margin-bottom:6px">${inviter} invited you to</div>
    <h1 style="margin:0 0 16px;font-size:20px;color:#0f172a">${orgName}</h1>
    <p style="margin:0 0 16px;color:#334155;font-size:14px">You have been invited as <strong style="text-transform:capitalize">${role}</strong>.</p>
    <p style="margin:0 0 24px"><a href="${acceptUrl}" style="display:inline-block;background:#0ea5a4;color:#fff;text-decoration:none;padding:10px 16px;border-radius:12px;font-weight:600">Accept invite</a></p>
    <p style="margin:0 0 8px;color:#64748b;font-size:12px">If the button doesn't work, paste this link into your browser:</p>
    <p style="word-break:break-all;font-size:12px;color:#64748b">${acceptUrl}</p>
  </td></tr></table></body></html>`;
}
function renderInviteText({ orgName, role, acceptUrl, invitedBy }: InviteEmailProps) {
  const inviter = invitedBy?.name || invitedBy?.email || "A teammate";
  return `${inviter} invited you to ${orgName} on Vamoot
Role: ${role}

Accept invite: ${acceptUrl}

If you didn't expect this invite, you can ignore this email.`;
}

