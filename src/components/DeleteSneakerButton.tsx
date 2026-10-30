"use client";

import { useTransition } from "react";
import { deleteSneakerAction } from "@/lib/actions";

export default function DeleteSneakerButton({ id, name }: { id: string; name: string }) {
  const [pending, startTransition] = useTransition();
  return (
    <button
      type="button"
      className="btn btn-ghost btn-sm"
      disabled={pending}
      onClick={() => {
        if (window.confirm(`Delete "${name}"? This cannot be undone.`)) {
          startTransition(() => deleteSneakerAction(id));
        }
      }}
      style={{ color: "var(--red-chip-text)" }}
    >
      {pending ? "Deleting..." : "Delete"}
    </button>
  );
}
