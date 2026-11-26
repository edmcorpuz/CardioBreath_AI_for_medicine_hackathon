// Netlify build step: proxy /api/* to the backend so the browser only ever talks to the Netlify domain.
// The backend origin comes from API_ORIGIN (Netlify env var, or .env.local for a local build) and lands
// only in out/_redirects, which Netlify reads at deploy time and does not serve.
import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

if (existsSync(".env.local")) process.loadEnvFile(".env.local"); // local builds; Netlify sets env vars itself

if (process.env.NEXT_PUBLIC_API_BASE) {
  throw new Error("Unset NEXT_PUBLIC_API_BASE: NEXT_PUBLIC_* values are baked into the public JavaScript.");
}
const origin = (process.env.API_ORIGIN ?? "").trim().replace(/\/+$/, "");
if (!/^https:\/\/[^/\s]+$/.test(origin)) {
  throw new Error("Set API_ORIGIN to the backend origin, e.g. https://example.azurecontainerapps.io (no path).");
}

// Leak guard: the backend host must not appear in any published file, whatever put it there.
const host = new URL(origin).host;
const leaks = readdirSync("out", { recursive: true, withFileTypes: true })
  .filter((d) => d.isFile() && d.name !== "_redirects")
  .map((d) => join(d.parentPath, d.name))
  .filter((p) => readFileSync(p).includes(host));
if (leaks.length) throw new Error(`Backend host found in published files: ${leaks.join(", ")}`);

writeFileSync("out/_redirects", `/api/*  ${origin}/api/:splat  200!\n`);
console.log("wrote out/_redirects (backend origin not printed); no leaks in out/");
