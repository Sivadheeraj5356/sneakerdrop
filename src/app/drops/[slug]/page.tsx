import Link from "next/link";
import { notFound } from "next/navigation";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import AvailabilityBadge from "@/components/AvailabilityBadge";
import WaitlistForm from "@/components/WaitlistForm";
import Reveal from "@/components/Reveal";
import { getSneakerBySlug } from "@/lib/db";
import { formatPrice } from "@/lib/sneaker-types";

export const dynamic = "force-dynamic";

export default async function DropPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const sneaker = await getSneakerBySlug(slug);
  if (!sneaker) notFound();

  return (
    <>
      <SiteHeader />
      <main className="container">
        <div className="product">
          <Reveal>
            <div className="img-panel">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={sneaker.image_url} alt={sneaker.name} />
            </div>
          </Reveal>
          <Reveal delay={100}>
            <div className="info">
              <div className="breadcrumb">
                <Link href="/">Home</Link> / <Link href="/#drops">Drops</Link> / {sneaker.name}
              </div>
              <h1>{sneaker.name}</h1>
              <AvailabilityBadge value={sneaker.availability} />
              <div className="price">{formatPrice(sneaker.price_cents)}</div>
              <p className="desc">{sneaker.description}</p>
              <WaitlistForm slug={sneaker.slug} availability={sneaker.availability} />
            </div>
          </Reveal>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
