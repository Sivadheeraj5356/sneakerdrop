import "server-only";
import { neon } from "@neondatabase/serverless";
import type { Sneaker } from "./sneaker-types";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is not set");
}

export const sql = neon(process.env.DATABASE_URL);

export async function getSneakers(): Promise<Sneaker[]> {
  const rows = await sql`SELECT id, name, slug, description, price_cents, availability, image_url, created_at
                         FROM sneakers ORDER BY created_at ASC`;
  return rows as Sneaker[];
}

export async function getSneakerBySlug(slug: string): Promise<Sneaker | null> {
  const rows = await sql`SELECT id, name, slug, description, price_cents, availability, image_url, created_at
                         FROM sneakers WHERE slug = ${slug} LIMIT 1`;
  return (rows[0] as Sneaker) ?? null;
}

export async function getSneakerById(id: string): Promise<Sneaker | null> {
  const rows = await sql`SELECT id, name, slug, description, price_cents, availability, image_url, created_at
                         FROM sneakers WHERE id = ${id}::uuid LIMIT 1`;
  return (rows[0] as Sneaker) ?? null;
}
