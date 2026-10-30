// Shared types and constants - safe to import from client components.
// Server-only code (DB access) lives in ./db.

export type Availability = "in_stock" | "low_stock" | "sold_out" | "upcoming";

export const AVAILABILITY_LABEL: Record<Availability, string> = {
  in_stock: "In stock",
  low_stock: "Low stock",
  sold_out: "Sold out",
  upcoming: "Upcoming",
};

export const AVAILABILITY_VALUES: Availability[] = [
  "in_stock",
  "low_stock",
  "sold_out",
  "upcoming",
];

export type Sneaker = {
  id: string;
  name: string;
  slug: string;
  description: string;
  price_cents: number;
  availability: Availability;
  image_url: string;
  created_at: string;
};

export type WaitlistEntry = {
  id: string;
  sneaker_id: string;
  email: string;
  created_at: string;
  sneaker_name?: string;
};

export function formatPrice(priceCents: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(priceCents / 100);
}
