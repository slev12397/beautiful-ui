import { NextResponse } from "next/server";

/* Saves each signup as a Resend Contact. Keep the API key server-side only.
 * Set these in Vercel → Project → Settings → Environment Variables:
 *   RESEND_API_KEY — a full-access key (sending-only keys cannot manage contacts)
 * Contacts are global in Resend and can be organized into Segments later. */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const RESEND_API = "https://api.resend.com";

function resendHeaders(apiKey: string) {
  return {
    Authorization: `Bearer ${apiKey}`,
    "Content-Type": "application/json",
  };
}

export async function POST(request: Request) {
  let email = "";
  try {
    ({ email } = await request.json());
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  email = String(email ?? "").trim().toLowerCase();
  if (!EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "Invalid email" }, { status: 400 });
  }

  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    console.error("[subscribe] RESEND_API_KEY is not configured");
    return NextResponse.json({ error: "Storage unavailable" }, { status: 503 });
  }

  const createResponse = await fetch(`${RESEND_API}/contacts`, {
    method: "POST",
    headers: resendHeaders(apiKey),
    body: JSON.stringify({ email, unsubscribed: false }),
  });

  if (createResponse.ok) {
    return NextResponse.json({ ok: true, stored: true });
  }

  /* Creating the same address again may return an error. Confirm the contact
   * exists before surfacing a failure so repeat submissions stay idempotent,
   * without accidentally re-subscribing a contact who opted out. */
  const existingResponse = await fetch(
    `${RESEND_API}/contacts/${encodeURIComponent(email)}`,
    {
      headers: resendHeaders(apiKey),
      cache: "no-store",
    },
  );

  if (existingResponse.ok) {
    return NextResponse.json({ ok: true, stored: true, existing: true });
  }

  const detail = await createResponse.text().catch(() => "");
  console.error("[subscribe] Resend error", createResponse.status, detail);
  return NextResponse.json({ error: "Storage failed" }, { status: 502 });
}
