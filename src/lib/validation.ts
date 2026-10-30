import { AVAILABILITY_VALUES, type Availability } from "./sneaker-types";

export const EMAIL_RE = /^[A-Za-z0-9.!#$%&'*+/=?^_`{|}~-]+@[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?(?:\.[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?)+$/;

export function normalizeEmail(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  const email = raw.trim().toLowerCase();
  if (email.length < 3 || email.length > 254) return null;
  if (!EMAIL_RE.test(email)) return null;
  return email;
}

export function slugify(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export type SneakerInput = {
  name: string;
  slug: string;
  description: string;
  priceCents: number;
  availability: Availability;
  imageUrl: string;
};

export function validateSneakerInput(raw: {
  name?: unknown;
  slug?: unknown;
  description?: unknown;
  price?: unknown;
  availability?: unknown;
  imageUrl?: unknown;
}): { ok: true; data: SneakerInput } | { ok: false; error: string } {
  const name = typeof raw.name === "string" ? raw.name.trim() : "";
  if (name.length < 2 || name.length > 80) return { ok: false, error: "Name must be 2-80 characters." };

  const slug = typeof raw.slug === "string" ? raw.slug.trim() : "";
  if (!SLUG_RE.test(slug)) return { ok: false, error: "Slug must be lowercase letters, numbers and dashes." };

  const description = typeof raw.description === "string" ? raw.description.trim() : "";
  if (description.length > 2000) return { ok: false, error: "Description is too long (max 2000)." };

  const priceNum = typeof raw.price === "string" || typeof raw.price === "number" ? Number(raw.price) : NaN;
  if (!Number.isFinite(priceNum) || priceNum < 0 || priceNum > 1000000) {
    return { ok: false, error: "Price must be a number between 0 and 1,000,000." };
  }
  const priceCents = Math.round(priceNum * 100);

  if (!AVAILABILITY_VALUES.includes(raw.availability as Availability)) {
    return { ok: false, error: "Invalid availability value." };
  }

  const imageUrl = typeof raw.imageUrl === "string" ? raw.imageUrl.trim() : "";
  const isLocal = /^\/[A-Za-z0-9._\-/]+$/.test(imageUrl);
  const isHttps = /^https:\/\/[A-Za-z0-9._\-/:%?&=+]+$/.test(imageUrl);
  if (!isLocal && !isHttps) {
    return { ok: false, error: "Image must be a local path (/...) or an https:// URL." };
  }

  return {
    ok: true,
    data: { name, slug, description, priceCents, availability: raw.availability as Availability, imageUrl },
  };
}
