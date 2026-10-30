import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import SneakerCard from "@/components/SneakerCard";
import Reveal from "@/components/Reveal";
import { getSneakers } from "@/lib/db";

export const dynamic = "force-dynamic";

const MARQUEE_ITEMS = [
  "Small batch",
  "Numbered pairs",
  "Full-grain leather",
  "Free shipping over Rs 15,000",
  "Fictional showcase brand",
  "SS26 Drop 001",
];

export default async function HomePage() {
  const sneakers = await getSneakers();

  return (
    <>
      <SiteHeader />
      <main>
        <section className="hero container">
          <Reveal>
            <span className="eyebrow">SS26 Drop 001 - Concrete Bloom</span>
          </Reveal>
          <Reveal delay={60}>
            <h1>
              Built for the street.
              <br />
              <span className="accent">Numbered for the few.</span>
            </h1>
          </Reveal>
          <Reveal delay={120}>
            <p className="lede">
              SneakerDrop is a fictional premium sneaker house. We cut small batches from honest
              materials, number every pair, and never restock a silhouette twice.
            </p>
          </Reveal>
          <Reveal delay={180}>
            <div className="hero-ctas">
              <a href="#drops" className="btn btn-primary">Explore the drop</a>
              <a href="#craft" className="btn btn-ghost">Our craft</a>
            </div>
          </Reveal>
          <Reveal delay={220}>
            <div className="hero-visual">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/sneakers/hero.webp" alt="SneakerDrop SS26 hero sneaker" />
            </div>
          </Reveal>
          <Reveal delay={260}>
            <div className="hero-stats">
              <span className="stat-chip"><strong>{sneakers.length}</strong> silhouettes</span>
              <span className="stat-chip"><strong>300</strong> pairs per style</span>
              <span className="stat-chip"><strong>1</strong> drop per season</span>
            </div>
          </Reveal>
        </section>

        <div className="marquee" aria-hidden="true">
          <div className="marquee-track">
            {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((item, i) => (
              <span key={i}><i>+</i>{item}</span>
            ))}
          </div>
        </div>

        <section className="section container" id="drops">
          <Reveal>
            <div className="section-head">
              <div>
                <div className="kicker">The catalogue</div>
                <h2>Current drop</h2>
              </div>
              <p>
                Every silhouette below is live from our database. Availability moves in real time as
                pairs sell through.
              </p>
            </div>
          </Reveal>
          <div className="grid">
            {sneakers.map((s, i) => (
              <Reveal key={s.id} delay={i * 60}>
                <SneakerCard sneaker={s} />
              </Reveal>
            ))}
          </div>
        </section>

        <section className="craft" id="craft">
          <div className="container section">
            <Reveal>
              <div className="section-head">
                <div>
                  <div className="kicker">Craft</div>
                  <h2>Made slowly, on purpose</h2>
                </div>
              </div>
            </Reveal>
            <div className="craft-grid">
              <Reveal>
                <div className="craft-item">
                  <div className="num">01</div>
                  <h3>Honest materials</h3>
                  <p>Full-grain leather, suede and engineered knit from audited tanneries and mills. Nothing bonded, nothing fake.</p>
                </div>
              </Reveal>
              <Reveal delay={80}>
                <div className="craft-item">
                  <div className="num">02</div>
                  <h3>Numbered pairs</h3>
                  <p>Each style is capped at 300 pairs. The pair number is stitched into the heel and recorded against your order.</p>
                </div>
              </Reveal>
              <Reveal delay={160}>
                <div className="craft-item">
                  <div className="num">03</div>
                  <h3>No restocks</h3>
                  <p>When a silhouette sells out it retires. The waitlist decides which classics earn a comeback season.</p>
                </div>
              </Reveal>
            </div>
          </div>
        </section>

        <section className="cta-band container">
          <Reveal>
            <h2>First in line, every drop.</h2>
            <p>Join the waitlist on any pair and you will hear the moment it opens. One email per drop, no noise.</p>
            <a href="#drops" className="btn btn-primary">Pick your pair</a>
          </Reveal>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
