"use client";

import { useActionState } from "react";
import { loginAction, type FormState } from "@/lib/actions";

const initial: FormState = { ok: false };

export default function AdminLoginForm() {
  const [state, formAction, pending] = useActionState(loginAction, initial);
  return (
    <form action={formAction} className="form-grid">
      <div className="form-field">
        <label htmlFor="password">Password</label>
        <input id="password" name="password" type="password" required autoComplete="current-password" />
      </div>
      {state.error && <div className="form-msg err">{state.error}</div>}
      <button type="submit" className="btn btn-primary" disabled={pending}>
        {pending ? "Signing in..." : "Sign in"}
      </button>
    </form>
  );
}
