import { NextResponse } from "next/server";

/* Appends a signup to Airtable. Keep the token server-side only.
 * Set these in Vercel → Project → Settings → Environment Variables:
 *   AIRTABLE_TOKEN     — a personal access token with data.records:write
 *   AIRTABLE_BASE_ID   — the base id (starts with "app…")
 *   AIRTABLE_TABLE     — the table name (defaults to "Signups")
 * The table needs a single-line-text field named "Email". */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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

  const token = process.env.AIRTABLE_TOKEN;
  const baseId = process.env.AIRTABLE_BASE_ID;
  const table = process.env.AIRTABLE_TABLE ?? "Signups";

  if (!token || !baseId) {
    // Not configured yet — accept the signup gracefully so the UI still works.
    console.warn("[subscribe] Airtable env not set; skipping write for", email);
    return NextResponse.json({ ok: true, stored: false });
  }

  const res = await fetch(
    `https://api.airtable.com/v0/${baseId}/${encodeURIComponent(table)}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        records: [{ fields: { Email: email } }],
        typecast: true,
      }),
    },
  );

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    console.error("[subscribe] Airtable error", res.status, detail);
    return NextResponse.json({ error: "Storage failed" }, { status: 502 });
  }

  return NextResponse.json({ ok: true, stored: true });
}
