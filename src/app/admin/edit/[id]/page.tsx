import { notFound, redirect } from "next/navigation";
import { isAdminSession } from "@/lib/auth";
import { getSneakerById } from "@/lib/db";
import SneakerForm from "@/components/SneakerForm";

export const dynamic = "force-dynamic";

export default async function EditSneakerPage({ params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdminSession())) redirect("/admin/login");
  const { id } = await params;
  const sneaker = await getSneakerById(id);
  if (!sneaker) notFound();
  return (
    <>
      <div className="admin-head"><h1>Edit {sneaker.name}</h1></div>
      <div className="form-panel"><SneakerForm sneaker={sneaker} /></div>
    </>
  );
}
