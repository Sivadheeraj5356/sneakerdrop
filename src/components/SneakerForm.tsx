"use client";

import { useActionState } from "react";
import { createSneakerAction, updateSneakerAction, type FormState } from "@/lib/actions";
import { AVAILABILITY_LABEL, AVAILABILITY_VALUES, type Sneaker } from "@/lib/sneaker-types";

const initial: FormState = { ok: false };

export default function SneakerForm({ sneaker }: { sneaker?: Sneaker }) {
  const action = sneaker
    ? updateSneakerAction.bind(null, sneaker.id)
    : createSneakerAction;
  const [state, formAction, pending] = useActionState(action, initial);

  return (
    <form action={formAction} className="form-grid">
      <div className="form-field">
        <label htmlFor="name">Name</label>
        <input id="name" name="name" required minLength={2} maxLength={80} defaultValue={sneaker?.name} />
      </div>
      <div className="form-field">
        <label htmlFor="slug">Slug</label>
        <input
          id="slug" name="slug" pattern="[a-z0-9]+(-[a-z0-9]+)*" defaultValue={sneaker?.slug}
          placeholder="auto-generated-from-name"
        />
        <div className="hint">Lowercase letters, numbers, dashes. Leave blank on add to auto-generate.</div>
      </div>
      <div className="form-field">
        <label htmlFor="price">Price (INR)</label>
        <input
          id="price" name="price" type="number" min="0" step="1" required
          defaultValue={sneaker ? sneaker.price_cents / 100 : ""}
        />
      </div>
      <div className="form-field">
        <label htmlFor="description">Description</label>
        <textarea id="description" name="description" rows={4} maxLength={2000} defaultValue={sneaker?.description} />
      </div>
      <div className="form-field">
        <label htmlFor="imageUrl">Image path or URL</label>
        <input id="imageUrl" name="imageUrl" required defaultValue={sneaker?.image_url} placeholder="/sneakers/example.png" />
        <div className="hint">Local path under /public (e.g. /sneakers/court-jade-01.png) or a full https:// image URL.</div>
      </div>
      <div className="form-field">
        <label htmlFor="availability">Availability</label>
        <select id="availability" name="availability" defaultValue={sneaker?.availability ?? "in_stock"}>
          {AVAILABILITY_VALUES.map((v) => (
            <option key={v} value={v}>{AVAILABILITY_LABEL[v]}</option>
          ))}
        </select>
      </div>
      {state.error && <div className="form-msg err">{state.error}</div>}
      <div className="row-actions">
        <button type="submit" className="btn btn-primary" disabled={pending}>
          {pending ? "Saving..." : sneaker ? "Save changes" : "Add sneaker"}
        </button>
        <a href="/admin" className="btn btn-ghost">Cancel</a>
      </div>
    </form>
  );
}
