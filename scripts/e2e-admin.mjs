// E2E admin flow test against the local production server + real Neon DB.
// Usage: node scripts/e2e-admin.mjs   (server must be running on :3100)
import puppeteer from "puppeteer-core";
import fs from "node:fs";

const env = Object.fromEntries(
  fs.readFileSync(".env.local", "utf8").split("\n")
    .filter((l) => l.includes("=")).map((l) => { const i = l.indexOf("="); return [l.slice(0, i), l.slice(i + 1)]; })
);
const BASE = "http://localhost:3100";
const results = [];
const check = (name, ok, extra = "") => { results.push({ name, ok, extra }); console.log(`${ok ? "PASS" : "FAIL"} ${name}${extra ? " - " + extra : ""}`); };

const browser = await puppeteer.launch({
  executablePath: "/usr/bin/google-chrome",
  headless: "new",
  args: ["--no-sandbox", "--disable-gpu"],
});
const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 1000 });

// 1. Login page rejects wrong password
await page.goto(`${BASE}/admin/login`, { waitUntil: "networkidle0" });
await page.type("#password", "definitely-wrong");
const setCookiePromise = new Promise((resolve) => {
  page.on("response", (r) => { const h = r.headers(); if (h["set-cookie"]) resolve(h["set-cookie"]); });
});
await Promise.all([page.click('button[type="submit"]'), page.waitForFunction(() => document.body.innerText.includes("Incorrect password"), { timeout: 15000 })]);
check("wrong password rejected", true);

// 2. Real login sets cookie and lands on /admin
await page.evaluate(() => { document.querySelector("#password").value = ""; });
await page.type("#password", env.ADMIN_PASSWORD);
await Promise.all([page.click('button[type="submit"]'), page.waitForNavigation({ waitUntil: "networkidle0", timeout: 15000 })]);
check("login redirects to /admin", page.url().startsWith(`${BASE}/admin`));
const cookies = await page.cookies(BASE);
const c = cookies.find((x) => x.name === "sd_admin");
check("session cookie attributes", !!c && c.httpOnly && c.sameSite === "Lax", JSON.stringify({ httpOnly: c?.httpOnly, sameSite: c?.sameSite, secure: c?.secure }));

// 3. Create sneaker with XSS attempt in description
const xss = '<script>window.__xss=1</script><b>bold</b>';
await page.goto(`${BASE}/admin/new`, { waitUntil: "networkidle0" });
await page.type("#name", "E2E Test Runner");
await page.type("#price", "4242");
await page.type("#description", xss);
await page.type("#imageUrl", "/sneakers/streetform-low.webp");
await Promise.all([page.click('button[type="submit"]'), page.waitForNavigation({ waitUntil: "networkidle0", timeout: 15000 })]);
check("create redirects to /admin", page.url() === `${BASE}/admin`);
const body1 = await page.content();
check("new sneaker listed in admin", body1.includes("E2E Test Runner"));

// 4. Public product page renders description as text (XSS neutralized)
await page.goto(`${BASE}/drops/e2e-test-runner`, { waitUntil: "networkidle0" });
const xssFired = await page.evaluate(() => window.__xss === 1);
const descText = await page.evaluate(() => document.querySelector(".desc")?.textContent || "");
check("public page shows new sneaker", (await page.content()).includes("E2E Test Runner"));
check("XSS payload inert", !xssFired && descText.includes("<script>"), descText.slice(0, 60));

// 5. Edit price via edit form
const editLink = await page.goto(`${BASE}/admin`, { waitUntil: "networkidle0" });
const href = await page.evaluate(() => {
  const row = [...document.querySelectorAll("tr")].find((r) => r.innerText.includes("E2E Test Runner"));
  return row?.querySelector('a[href*="/admin/edit/"]')?.href || null;
});
check("edit link found", !!href, href);
await page.goto(href, { waitUntil: "networkidle0" });
await page.evaluate(() => { document.querySelector("#price").value = ""; });
await page.type("#price", "5151");
await Promise.all([page.click('button[type="submit"]'), page.waitForNavigation({ waitUntil: "networkidle0", timeout: 15000 })]);
await page.goto(`${BASE}/drops/e2e-test-runner`, { waitUntil: "networkidle0" });
const priceTxt = await page.evaluate(() => document.body.innerText);
check("price edit persisted to DB + public page", priceTxt.includes("5,151"));

// 6. Availability toggle persists
await page.goto(`${BASE}/admin`, { waitUntil: "networkidle0" });
await page.evaluate(() => {
  const row = [...document.querySelectorAll("tr")].find((r) => r.innerText.includes("E2E Test Runner"));
  const sel = row.querySelector("select");
  const setter = Object.getOwnPropertyDescriptor(window.HTMLSelectElement.prototype, "value").set;
  setter.call(sel, "sold_out");
  sel.dispatchEvent(new Event("change", { bubbles: true }));
});
await new Promise((r) => setTimeout(r, 2500));
await page.goto(`${BASE}/drops/e2e-test-runner`, { waitUntil: "networkidle0" });
check("availability change persisted to public page", (await page.content()).includes("Sold out"));

// 7. Waitlist join on the new product, then visible in admin
await page.type('input[name="email"]', "e2e-check@example.com");
await page.click('button[type="submit"]');
await page.waitForFunction(() => document.body.innerText.includes("on the list"), { timeout: 15000 });
check("waitlist join succeeds on new product", true);
await page.goto(`${BASE}/admin/waitlist`, { waitUntil: "networkidle0" });
check("admin sees waitlist entry", (await page.content()).includes("e2e-check@example.com"));

// 8. Delete sneaker (accept confirm) and verify gone from public
await page.goto(`${BASE}/admin`, { waitUntil: "networkidle0" });
page.on("dialog", (d) => d.accept());
await page.evaluate(() => {
  const row = [...document.querySelectorAll("tr")].find((r) => r.innerText.includes("E2E Test Runner"));
  [...row.querySelectorAll("button")].find((b) => b.innerText.includes("Delete")).click();
});
await new Promise((r) => setTimeout(r, 2500));
const gone = await page.goto(`${BASE}/drops/e2e-test-runner`, { waitUntil: "networkidle0" });
check("delete persisted (public 404)", gone.status() === 404);

// 9. Rate limit on waitlist (11 rapid joins)
let lastStatus = 0;
for (let i = 0; i < 11; i++) {
  const res = await page.evaluate(async (i) => {
    const r = await fetch("/api/waitlist", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ slug: "monsoon-runner", email: `rl${i}@x.co` }) });
    return r.status;
  }, i);
  lastStatus = res;
}
check("waitlist rate limit kicks in", lastStatus === 429, `11th request -> ${lastStatus}`);

await browser.close();
const failed = results.filter((r) => !r.ok);
console.log(`\n${results.length - failed.length}/${results.length} passed`);
process.exit(failed.length ? 1 : 0);
