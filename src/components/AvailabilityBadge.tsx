import { AVAILABILITY_LABEL, type Availability } from "@/lib/sneaker-types";

export default function AvailabilityBadge({ value }: { value: Availability }) {
  return <span className={`badge badge-${value}`}>{AVAILABILITY_LABEL[value]}</span>;
}
