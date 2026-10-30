"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { sql } from "./db";
import type { Availability } from "./sneaker-types";
import {
  createAdminSession,
  destroyAdminSession,
  isAdminSession,
  verifyAdminPassword,
} from "./auth";
import { clientIp, rateLimit } from "./rate-limit";
import { slugify, validateSneakerInput } from "./validation";

export type FormState = { ok: boolean; error?: string };

export async function loginAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const hdrs = await headers();
  const ip = clientIp(hdrs);
  if (!rateLimit(`login:${ip}`, 5, 10 * 60 * 1000)) {
    return { ok: false, error: "Too many attempts. Try again in a few minutes." };
  }
  const password = String(formData.get("password") ?? "");
  if (!verifyAdminPassword(password)) {
    // Uniform delay so failures are not instant (slows brute force).
    await new Promise((r) => setTimeout(r, 600));
    return { ok: false, error: "Incorrect password." };
  }
  await createAdminSession();
  redirect("/admin");
}

export async function logoutAction(): Promise<void> {
  await destroyAdminSession();
  redirect("/");
}

async function requireAdmin(): Promise<void> {
  if (!(await isAdminSession())) {
    redirect("/admin/login");
  }
}

export async function createSneakerAction(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();
  const parsed = validateSneakerInput({
    name: formData.get("name"),
    slug: formData.get("slug") || slugify(String(formData.get("name") ?? "")),
    description: formData.get("description"),
    price: formData.get("price"),
    availability: formData.get("availability"),
    imageUrl: formData.get("imageUrl"),
  });
  if (!parsed.ok) return { ok: false, error: parsed.error };
  const d = parsed.data;
  try {
    await sql`INSERT INTO sneakers (name, slug, description, price_cents, availability, image_url)
              VALUES (${d.name}, ${d.slug}, ${d.description}, ${d.priceCents}, ${d.availability}, ${d.imageUrl})`;
  } catch (e: unknown) {
    if (String(e).includes("sneakers_slug_key")) {
      return { ok: false, error: "That slug is already in use." };
    }
    throw e;
  }
  revalidatePath("/");
  revalidatePath("/admin");
  redirect("/admin");
}

export async function updateSneakerAction(id: string, _prev: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();
  if (!/^[0-9a-f-]{36}$/i.test(id)) return { ok: false, error: "Invalid sneaker id." };
  const parsed = validateSneakerInput({
    name: formData.get("name"),
    slug: formData.get("slug"),
    description: formData.get("description"),
    price: formData.get("price"),
    availability: formData.get("availability"),
    imageUrl: formData.get("imageUrl"),
  });
  if (!parsed.ok) return { ok: false, error: parsed.error };
  const d = parsed.data;
  try {
    await sql`UPDATE sneakers SET name=${d.name}, slug=${d.slug}, description=${d.description},
              price_cents=${d.priceCents}, availability=${d.availability}, image_url=${d.imageUrl}
              WHERE id=${id}::uuid`;
  } catch (e: unknown) {
    if (String(e).includes("sneakers_slug_key")) {
      return { ok: false, error: "That slug is already in use." };
    }
    throw e;
  }
  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath(`/drops/${d.slug}`);
  redirect("/admin");
}

export async function deleteSneakerAction(id: string): Promise<void> {
  await requireAdmin();
  if (!/^[0-9a-f-]{36}$/i.test(id)) return;
  await sql`DELETE FROM sneakers WHERE id=${id}::uuid`;
  revalidatePath("/");
  revalidatePath("/admin");
}

export async function setAvailabilityAction(id: string, availability: Availability): Promise<void> {
  await requireAdmin();
  if (!/^[0-9a-f-]{36}$/i.test(id)) return;
  await sql`UPDATE sneakers SET availability=${availability} WHERE id=${id}::uuid`;
  revalidatePath("/");
  revalidatePath("/admin");
}
