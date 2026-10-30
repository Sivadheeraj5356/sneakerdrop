"use client";

import { useState } from "react";

type State =
  | { status: "idle" }
  | { status: "submitting" }
  | { status: "ok" }
  | { status: "err"; message: string };

const COPY: Record<string, { heading: string; body: string }> = {
  in_stock: {
    heading: "Join the waitlist",
    body: "In stock now, but numbered pairs never restock. Leave your email and you will hear first about the next drop.",
  },
  low_stock: {
    heading: "Join the waitlist",
    body: "Low stock and no restocks. Leave your email and you will hear first about the next drop if this pair sells through.",
  },
  sold_out: {
    heading: "Sold out",
    body: "This pair is gone and never restocks. Leave your email and you will hear first when the next drop opens.",
  },
  upcoming: {
    heading: "Join the waitlist",
    body: "Not open yet. Leave your email and you will hear first when this pair opens.",
  },
};

export default function WaitlistForm({ slug, availability }: { slug: string; availability: string }) {
  const [state, setState] = useState<State>({ status: "idle" });
  const copy = COPY[availability] ?? COPY.upcoming;

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    setState({ status: "submitting" });
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug,
          email: data.get("email"),
          website: data.get("website"), // honeypot
        }),
      });
      const json = (await res.json()) as { ok: boolean; error?: string };
      if (json.ok) {
        setState({ status: "ok" });
        form.reset();
      } else {
        setState({ status: "err", message: json.error ?? "Something went wrong." });
      }
    } catch {
      setState({ status: "err", message: "Network error. Please try again." });
    }
  }

  if (state.status === "ok") {
    return (
      <div className="waitlist-panel">
        <h3>You are on the list.</h3>
        <p>We will email you the moment this pair goes live. One email per drop, no noise.</p>
        <div className="form-msg ok">Confirmed for this drop.</div>
      </div>
    );
  }

  return (
    <div className="waitlist-panel">
      <h3>{copy.heading}</h3>
      <p>{copy.body}</p>
      <form onSubmit={onSubmit}>
        <div className="hp-field" aria-hidden="true">
          <label>
            Website
            <input type="text" name="website" tabIndex={-1} autoComplete="off" />
          </label>
        </div>
        <div className="field-row">
          <input type="email" name="email" placeholder="you@example.com" required aria-label="Email address" />
          <button type="submit" className="btn btn-primary" disabled={state.status === "submitting"}>
            {state.status === "submitting" ? "Joining..." : "Notify me"}
          </button>
        </div>
        {state.status === "err" && <div className="form-msg err">{state.message}</div>}
      </form>
    </div>
  );
}
