import Link from "next/link";
import { redirect } from "next/navigation";
import { isAdminSession } from "@/lib/auth";
import { sql, getSneakers } from "@/lib/db";
import { formatPrice } from "@/lib/sneaker-types";
import AvailabilityBadge from "@/components/AvailabilityBadge";
import AvailabilitySelect from "@/components/AvailabilitySelect";
import DeleteSneakerButton from "@/components/DeleteSneakerButton";
import { logoutAction } from "@/lib/actions";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  if (!(await isAdminSession())) redirect("/admin/login");
  const sneakers = await getSneakers();
  const waitlistCount = await sql`SELECT count(*)::int AS n FROM waitlist`;
  const totalWaitlist = (waitlistCount[0] as { n: number }).n;
  const soldOut = sneakers.filter((s) => s.availability === "sold_out").length;

  return (
    <>
      <div className="admin-head">
        <h1>Catalogue</h1>
        <div className="row-actions">
          <Link href="/admin/new" className="btn btn-primary btn-sm">Add sneaker</Link>
          <form action={logoutAction}>
            <button type="submit" className="btn btn-ghost btn-sm">Sign out</button>
          </form>
        </div>
      </div>
      <div className="admin-tabs">
        <a href="/admin" className="active">Sneakers</a>
        <a href="/admin/waitlist">Waitlist ({totalWaitlist})</a>
      </div>
      <div className="stat-cards">
        <div className="stat-card"><div className="label">Silhouettes</div><div className="value">{sneakers.length}</div></div>
        <div className="stat-card"><div className="label">Waitlist signups</div><div className="value">{totalWaitlist}</div></div>
        <div className="stat-card"><div className="label">Sold out</div><div className="value">{soldOut}</div></div>
      </div>
      <div className="panel">
        <table className="admin-table">
          <thead>
            <tr>
              <th></th><th>Name</th><th>Price</th><th>Availability</th><th className="hide-sm">Slug</th><th></th>
            </tr>
          </thead>
          <tbody>
            {sneakers.map((s) => (
              <tr key={s.id}>
                <td>{/* eslint-disable-next-line @next/next/no-img-element */}<img className="thumb" src={s.image_url} alt="" /></td>
                <td><strong>{s.name}</strong></td>
                <td>{formatPrice(s.price_cents)}</td>
                <td>
                  <div className="row-actions">
                    <AvailabilityBadge value={s.availability} />
                    <AvailabilitySelect id={s.id} current={s.availability} />
                  </div>
                </td>
                <td className="hide-sm" style={{ color: "var(--muted)" }}>{s.slug}</td>
                <td>
                  <div className="row-actions">
                    <Link href={`/admin/edit/${s.id}`} className="btn btn-ghost btn-sm">Edit</Link>
                    <DeleteSneakerButton id={s.id} name={s.name} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
