// Creates the SneakerDrop schema and seeds the first drop.
// Usage: DATABASE_URL=... node scripts/setup-db.mjs
import { neon } from "@neondatabase/serverless";

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL is required");
  process.exit(1);
}
const sql = neon(url);

await sql`CREATE TABLE IF NOT EXISTS sneakers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text NOT NULL DEFAULT '',
  price_cents integer NOT NULL CHECK (price_cents >= 0),
  availability text NOT NULL DEFAULT 'in_stock'
    CHECK (availability IN ('in_stock','low_stock','sold_out','upcoming')),
  image_url text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
)`;

await sql`CREATE TABLE IF NOT EXISTS waitlist (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sneaker_id uuid NOT NULL REFERENCES sneakers(id) ON DELETE CASCADE,
  email text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
)`;

// One signup per email per product (case-insensitive).
await sql`CREATE UNIQUE INDEX IF NOT EXISTS waitlist_unique_per_product
  ON waitlist (sneaker_id, lower(email))`;

const existing = await sql`SELECT count(*)::int AS n FROM sneakers`;
if (existing[0].n > 0) {
  console.log(`sneakers table already has ${existing[0].n} rows; skipping seed.`);
  process.exit(0);
}

const seed = [
  {
    name: "Court Jade 01",
    slug: "court-jade-01",
    description:
      "Our flagship low-top. Off-white full-grain leather with muted jade suede overlays and a gum cupsole. Cut, stitched and numbered in a single batch of 300.",
    price: 14999,
    availability: "in_stock",
    image_url: "/sneakers/court-jade-01.png",
  },
  {
    name: "Streetform Low",
    slug: "streetform-low",
    description:
      "An all-black study in restraint. Matte leather and tonal suede on a stitched black sole. The pair that goes with everything and says nothing.",
    price: 11999,
    availability: "in_stock",
    image_url: "/sneakers/streetform-low.png",
  },
  {
    name: "Monsoon Runner",
    slug: "monsoon-runner",
    description:
      "Built for wet streets. Slate engineered knit shrugs off rain, forest-green overlays lock the midfoot, and a rugged outsole holds its line on slick concrete.",
    price: 13499,
    availability: "low_stock",
    image_url: "/sneakers/monsoon-runner.png",
  },
  {
    name: "Nightshift Mid",
    slug: "nightshift-mid",
    description:
      "Charcoal nubuck with reflective silver-grey paneling that catches headlights after dark. Padded mid collar, quiet profile, late hours.",
    price: 15999,
    availability: "upcoming",
    image_url: "/sneakers/nightshift-mid.png",
  },
  {
    name: "Terrace Classic",
    slug: "terrace-classic",
    description:
      "A nod to eighties terraces: cream suede, tan leather heel tab, gum sole. Broken-in comfort from the first wear. Retired after its first run.",
    price: 9999,
    availability: "sold_out",
    image_url: "/sneakers/terrace-classic.png",
  },
  {
    name: "Velocity Knit",
    slug: "velocity-knit",
    description:
      "Featherweight ivory knit on responsive foam, finished with a jade heel counter. The everyday runner of the drop, tuned for long city miles.",
    price: 12499,
    availability: "in_stock",
    image_url: "/sneakers/velocity-knit.png",
  },
];

for (const s of seed) {
  await sql`INSERT INTO sneakers (name, slug, description, price_cents, availability, image_url)
            VALUES (${s.name}, ${s.slug}, ${s.description}, ${s.price * 100}, ${s.availability}, ${s.image_url})`;
}

console.log(`Schema ready. Seeded ${seed.length} sneakers.`);
