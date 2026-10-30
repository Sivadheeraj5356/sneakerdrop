import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { normalizeEmail } from "@/lib/validation";
import { clientIp, rateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const ip = clientIp(req.headers);
  if (!rateLimit(`waitlist:${ip}`, 10, 60 * 1000)) {
    return NextResponse.json({ ok: false, error: "Too many requests. Try again shortly." }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request body." }, { status: 400 });
  }

  const { slug, email, website } = (body ?? {}) as Record<string, unknown>;

  // Honeypot: real users never see or fill this field.
  if (typeof website === "string" && website.length > 0) {
    return NextResponse.json({ ok: true });
  }

  if (typeof slug !== "string" || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    return NextResponse.json({ ok: false, error: "Unknown product." }, { status: 400 });
  }

  const normalized = normalizeEmail(email);
  if (!normalized) {
    return NextResponse.json({ ok: false, error: "Enter a valid email address." }, { status: 400 });
  }

  const product = await sql`SELECT id FROM sneakers WHERE slug = ${slug} LIMIT 1`;
  if (product.length === 0) {
    return NextResponse.json({ ok: false, error: "Unknown product." }, { status: 404 });
  }
  const sneakerId = (product[0] as { id: string }).id;

  try {
    await sql`INSERT INTO waitlist (sneaker_id, email) VALUES (${sneakerId}::uuid, ${normalized})`;
  } catch (e: unknown) {
    if (String(e).includes("waitlist_unique_per_product")) {
      return NextResponse.json({ ok: false, error: "This email is already on the waitlist for this drop." }, { status: 409 });
    }
    console.error("waitlist insert failed", e);
    return NextResponse.json({ ok: false, error: "Something went wrong. Please try again." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
