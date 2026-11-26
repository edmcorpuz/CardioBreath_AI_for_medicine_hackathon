// Netlify build step: proxy /api/* to the backend so the browser only ever talks to the Netlify domain.
// The backend origin comes from the API_ORIGIN env var and lands only in out/_redirects, which Netlify
// reads at deploy time and does not serve.
import { writeFileSync } from "node:fs";

if (process.env.NEXT_PUBLIC_API_BASE) {
  throw new Error("Unset NEXT_PUBLIC_API_BASE: NEXT_PUBLIC_* values are baked into the public JavaScript.");
}
const origin = (process.env.API_ORIGIN ?? "").trim().replace(/\/+$/, "");
if (!/^https:\/\/[^/\s]+$/.test(origin)) {
  throw new Error("Set API_ORIGIN to the backend origin, e.g. https://example.azurecontainerapps.io (no path).");
}
writeFileSync("out/_redirects", `/api/*  ${origin}/api/:splat  200!\n`);
console.log("wrote out/_redirects (backend origin not printed)");
