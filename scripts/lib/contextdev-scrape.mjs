/**
 * Server-only Context.dev scrape boundary for read-only Melato storefront QA.
 * Do not import into Shopify assets, client components or browser bundles.
 */
import { isIP } from "node:net";

const API = "https://api.context.dev/v1/web/scrape";
const FORMATS = ["html", "markdown", "screenshot", "images", "bytes", "parse", "json", "highlights", "product"];

export function publicMelatoUrl(value) {
  const url = new URL(value);
  if (!["http:", "https:"].includes(url.protocol) || url.username || url.password) {
    throw new Error("public HTTP(S) URL required");
  }
  const host = url.hostname.toLowerCase().replace(/\.$/, "");
  if (!["melato.ca", "www.melato.ca"].includes(host) || isIP(host) || url.port && !["80", "443"].includes(url.port)) {
    throw new Error("storefront QA accepts public melato.ca URLs only");
  }
  return url.toString();
}

export async function scrapePage({
  url, formats, jsonSchema, instructions, parseParams, highlightsQuery,
  highlightsMaxCharacters = 2000, dedupeImages = false,
  country = "CA", fresh = false, maxAgeMs = 1_800_000,
  timeoutMs = 20_000, budgetMs = 25_000, zdr = false,
  apiKey = process.env.CONTEXT_DEV_API_KEY || process.env.CONTEXT_API_KEY,
  fetchImpl = globalThis.fetch,
}) {
  const safe = publicMelatoUrl(url);
  if (!apiKey) throw new Error("CONTEXT_DEV_API_KEY is not configured");
  const requested = Object.fromEntries(Object.entries(formats ?? {}).filter(([, enabled]) => enabled));
  if (!Object.keys(requested).length || Object.keys(requested).some((key) => !FORMATS.includes(key))) {
    throw new Error("one or more supported output formats required");
  }
  if (requested.json && (!jsonSchema || jsonSchema.type !== "object")) throw new Error("JSON object schema required");
  if (jsonSchema && JSON.stringify(jsonSchema).length > 50_000) throw new Error("schema too large");
  if (instructions && instructions.length > 2_000) throw new Error("instructions too long");
  if (requested.parse && !parseParams) throw new Error("parseParams required");
  if (requested.highlights && (!highlightsQuery || highlightsMaxCharacters < 100 || highlightsMaxCharacters > 20_000)) {
    throw new Error("valid highlights query/maxCharacters required");
  }
  if (requested.highlights && zdr) throw new Error("Highlights cannot be used with ZDR");
  if (!/^[A-Za-z]{2}$/.test(country)) throw new Error("invalid country code");
  const body = {
    url: safe, formats: requested, maxAgeMs: fresh ? 0 : maxAgeMs,
    timeoutOpts: { milliseconds: timeoutMs }, zdr: zdr ? "enabled" : "disabled",
    sharedParams: { country: country.toUpperCase() },
  };
  if (requested.json) body.jsonParams = { schema: jsonSchema, ...(instructions ? { instructions } : {}) };
  if (requested.parse) body.parseParams = parseParams;
  if (requested.highlights) body.highlightsParams = { query: highlightsQuery, maxCharacters: highlightsMaxCharacters };
  if (requested.product) body.productParams = { dedupeImages };
  const started = Date.now();
  for (let attempt = 0; attempt < 2; attempt++) {
    const left = budgetMs - (Date.now() - started);
    if (left <= 0) throw new Error("caller scrape time budget exceeded");
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), Math.min(timeoutMs, left));
    try {
      const response = await fetchImpl(API, {
        method: "POST", headers: { Authorization: "Bearer " + apiKey, "Content-Type": "application/json" },
        body: JSON.stringify(body), signal: controller.signal, redirect: "error",
      });
      if ([408, 409, 429, 500, 502, 503, 504].includes(response.status) && attempt === 0) continue;
      if (!response.ok) throw new Error("Context.dev HTTP " + response.status);
      const payload = await response.json();
      if (!payload || typeof payload !== "object") throw new Error("invalid Context.dev response");
      const outputs = {};
      for (const name of FORMATS) {
        const value = payload[name === "parse" ? "parsed" : name] ?? {};
        outputs[name] = {
          requested: Boolean(value.requested ?? requested[name]),
          success: value.success ?? (requested[name] ? false : null),
          data: value.success === true ? value.data ?? null : null,
          error_code: value.error_code ?? null,
          message: value.message ?? null,
          ...(name === "parse" ? { type: value.type ?? null } : {}),
        };
      }
      return {
        sourceUrl: safe, finalUrl: payload.url ?? safe,
        retrievedAt: new Date().toISOString(),
        requestId: payload.request_id ?? null,
        isPartial: Boolean(payload.isPartial || Object.values(outputs).some((output) => output.requested && output.success === false)),
        outputs,
      };
    } catch (error) {
      if (attempt === 0 && (error.name === "AbortError" || error instanceof TypeError)) continue;
      throw error;
    } finally {
      clearTimeout(timer);
    }
  }
  throw new Error("Context.dev scrape exhausted retries");
}
