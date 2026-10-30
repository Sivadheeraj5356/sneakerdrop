import { redirect } from "next/navigation";
import { isAdminSession } from "@/lib/auth";
import SneakerForm from "@/components/SneakerForm";

export const dynamic = "force-dynamic";

export default async function NewSneakerPage() {
  if (!(await isAdminSession())) redirect("/admin/login");
  return (
    <>
      <div className="admin-head"><h1>Add sneaker</h1></div>
      <div className="form-panel"><SneakerForm /></div>
    </>
  );
}
