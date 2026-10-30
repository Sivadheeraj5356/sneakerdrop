import Link from "next/link";

export default function SiteHeader() {
  return (
    <header className="site-header">
      <div className="container bar">
        <Link href="/" className="wordmark">
          SNEAKERDROP<span className="dot">.</span>
        </Link>
        <nav className="nav-links" aria-label="Primary">
          <Link href="/#drops">Drops</Link>
          <Link href="/#craft">Craft</Link>
          <Link href="/admin">Admin</Link>
        </nav>
        <Link href="/#drops" className="btn btn-primary btn-sm">
          Explore the drop
        </Link>
      </div>
    </header>
  );
}
