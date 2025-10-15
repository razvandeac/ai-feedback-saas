export const runtime = "nodejs"; // ensure Node runtime

import { NextResponse } from "next/server";
import { Resend } from "resend";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const to = url.searchParams.get("to") || "";
  const key = process.env.RESEND_API_KEY || "";
  const from = process.env.EMAIL_FROM || "Vamoot <onboarding@resend.dev>";

  if (!key) return NextResponse.json({ ok: false, error: "RESEND_API_KEY missing" }, { status: 500 });
  if (!to) return NextResponse.json({ ok: false, error: "provide ?to=you@example.com" }, { status: 400 });

  try {
    const resend = new Resend(key);
    const r = await resend.emails.send({
      from,
      to,
      subject: "Vamoot test email",
      text: "If you received this, Resend is working 🎉"
    });
    return NextResponse.json({ ok: true, result: r });
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}

