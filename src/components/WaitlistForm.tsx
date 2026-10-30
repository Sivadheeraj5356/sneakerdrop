"use client";

import { useState } from "react";

type State =
  | { status: "idle" }
  | { status: "submitting" }
  | { status: "ok" }
  | { status: "err"; message: string };

export default function WaitlistForm({ slug, availability }: { slug: string; availability: string }) {
  const [state, setState] = useState<State>({ status: "idle" });

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
      <h3>{availability === "sold_out" ? "Sold out - join the restock list" : "Join the waitlist"}</h3>
      <p>Numbered pairs go fast. Leave your email and you will hear first when this pair opens.</p>
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
