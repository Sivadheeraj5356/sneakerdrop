import Link from "next/link";
import { redirect } from "next/navigation";
import { isAdminSession } from "@/lib/auth";
import { sql } from "@/lib/db";
import type { WaitlistEntry } from "@/lib/sneaker-types";

export const dynamic = "force-dynamic";

export default async function AdminWaitlistPage() {
  if (!(await isAdminSession())) redirect("/admin/login");
  const rows = (await sql`SELECT w.id, w.email, w.created_at, s.name AS sneaker_name
                          FROM waitlist w JOIN sneakers s ON s.id = w.sneaker_id
                          ORDER BY w.created_at DESC LIMIT 500`) as WaitlistEntry[];
  const count = await sql`SELECT count(*)::int AS n FROM waitlist`;
  const total = (count[0] as { n: number }).n;

  return (
    <>
      <div className="admin-head"><h1>Waitlist submissions</h1></div>
      <div className="admin-tabs">
        <a href="/admin">Sneakers</a>
        <a href="/admin/waitlist" className="active">Waitlist ({total})</a>
      </div>
      <div className="panel">
        <table className="admin-table">
          <thead><tr><th>Email</th><th>Drop</th><th>Joined</th></tr></thead>
          <tbody>
            {rows.length === 0 && (
              <tr><td colSpan={3} style={{ color: "var(--muted)" }}>No signups yet.</td></tr>
            )}
            {rows.map((r) => (
              <tr key={r.id}>
                <td><strong>{r.email}</strong></td>
                <td>{r.sneaker_name}</td>
                <td style={{ color: "var(--muted)" }}>
                  {new Date(r.created_at).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p style={{ marginTop: 16 }}>
        <Link href="/admin" className="btn btn-ghost btn-sm">Back to catalogue</Link>
      </p>
    </>
  );
}
