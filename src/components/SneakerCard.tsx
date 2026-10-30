import Link from "next/link";
import { formatPrice, type Sneaker } from "@/lib/sneaker-types";
import AvailabilityBadge from "./AvailabilityBadge";

export default function SneakerCard({ sneaker }: { sneaker: Sneaker }) {
  return (
    <Link href={`/drops/${sneaker.slug}`} className="card" aria-label={sneaker.name}>
      <div className="img-wrap">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={sneaker.image_url} alt={sneaker.name} loading="lazy" />
      </div>
      <div className="body">
        <div className="name-row">
          <h3>{sneaker.name}</h3>
          <span className="price">{formatPrice(sneaker.price_cents)}</span>
        </div>
        <p className="desc">{sneaker.description}</p>
        <div className="foot">
          <AvailabilityBadge value={sneaker.availability} />
          <span className="view">View drop</span>
        </div>
      </div>
    </Link>
  );
}
