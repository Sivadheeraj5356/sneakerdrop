import { redirect } from "next/navigation";
import { isAdminSession } from "@/lib/auth";
import AdminLoginForm from "@/components/AdminLoginForm";

export const dynamic = "force-dynamic";

export default async function AdminLoginPage() {
  if (await isAdminSession()) redirect("/admin");
  return (
    <div className="login-wrap">
      <div className="login-card">
        <h1>Admin sign in</h1>
        <p>Restricted area. Catalogue and waitlist management for SneakerDrop staff.</p>
        <AdminLoginForm />
      </div>
    </div>
  );
}
