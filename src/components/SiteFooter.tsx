export default function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="container row">
        <small>
          SNEAKERDROP<span style={{ color: "var(--jade)" }}>.</span> - a fictional
          showcase brand. Built for a developer assessment.
        </small>
        <nav aria-label="Footer">
          <a href="/#drops">Drops</a>
          <a href="/#craft">Craft</a>
          <a href="/admin">Admin</a>
        </nav>
      </div>
    </footer>
  );
}
