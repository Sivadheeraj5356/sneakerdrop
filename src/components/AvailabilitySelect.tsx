"use client";

import { useTransition } from "react";
import { setAvailabilityAction } from "@/lib/actions";
import { AVAILABILITY_LABEL, AVAILABILITY_VALUES, type Availability } from "@/lib/sneaker-types";

export default function AvailabilitySelect({ id, current }: { id: string; current: Availability }) {
  const [pending, startTransition] = useTransition();
  return (
    <select
      aria-label="Change availability"
      defaultValue={current}
      disabled={pending}
      onChange={(e) => startTransition(() => setAvailabilityAction(id, e.target.value as Availability))}
      style={{
        background: "var(--bg)", color: "var(--muted)", border: "1px solid var(--border-strong)",
        borderRadius: 10, padding: "6px 10px", fontFamily: "inherit", fontSize: 12.5, fontWeight: 600,
      }}
    >
      {AVAILABILITY_VALUES.map((v) => (
        <option key={v} value={v}>{AVAILABILITY_LABEL[v]}</option>
      ))}
    </select>
  );
}
