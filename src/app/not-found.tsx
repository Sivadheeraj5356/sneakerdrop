import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";

export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <main className="container" style={{ padding: "120px 24px", textAlign: "center" }}>
        <h1 style={{ fontSize: 40, fontWeight: 800 }}>That pair walked off.</h1>
        <p style={{ color: "var(--muted)" }}>The page you are looking for does not exist.</p>
        <Link href="/" className="btn btn-primary">Back to the drop</Link>
      </main>
      <SiteFooter />
    </>
  );
}
