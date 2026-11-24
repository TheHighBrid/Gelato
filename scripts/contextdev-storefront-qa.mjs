#!/usr/bin/env node
/**
 * Read-only Context.dev Melato storefront audit. Never changes Shopify/theme.
 * Usage: node scripts/contextdev-storefront-qa.mjs [--fresh] [--screenshots] URL...
 */
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { scrapePage, publicMelatoUrl } from "./lib/contextdev-scrape.mjs";

export const QA_SCHEMA = {
  type: "object", additionalProperties: false,
  properties: {
    page_title: { type: ["string", "null"] },
    product_title: { type: ["string", "null"] },
    variants: { type: "array", items: { type: "string" } },
    displayed_prices: { type: "array", items: { type: "string" } },
    currency: { type: ["string", "null"] },
    availability: { type: ["string", "null"] },
    canonical_url: { type: ["string", "null"] },
    product_links: { type: "array", items: { type: "string" } },
    images: {
      type: "array",
      items: { type: "object", additionalProperties: false, properties: {
        url: { type: ["string", "null"] }, alt: { type: ["string", "null"] },
      } },
    },
  },
};
const INSTRUCTIONS = (
  "Extract only information visible on the rendered Melato storefront page. Preserve exact "
  + "displayed product title, variant labels, price strings, currency, stock indicators, "
  + "image URLs and alt text, canonical URL, and links to products in collections/lookbooks. "
  + "Do not deduplicate images, normalize URLs, invent availability, or infer values from other pages. "
  + "Missing single-value fields are null; missing lists are []."
);

export function pageIdentity(rawUrl) {
  const url = new URL(publicMelatoUrl(rawUrl));
  const parts = url.pathname.split("/").filter(Boolean);
  const locale = parts[0] === "fr" ? "fr" : "en";
  const rest = locale === "fr" ? parts.slice(1) : parts;
  const kind = rest[0] === "products" ? "product"
    : rest[0] === "collections" ? "collection"
    : rest.some((part) => part.includes("lookbook")) ? "lookbook"
    : rest.length === 0 ? "home" : "other";
  return { locale, kind };
}

export function analyzePage(page, result) {
  const json = result.outputs.json;
  const parsed = result.outputs.parse;
  const images = result.outputs.images;
  const fields = json.success === true && json.data && typeof json.data === "object" ? json.data : null;
  const issues = [];
  if (!fields) {
    issues.push({ code: "extraction_unavailable", state: "scrape_or_format_failure" });
  } else {
    if (page.kind === "product" && !fields.product_title) {
      issues.push({ code: "product_title_missing", state: "element_missing_on_loaded_page" });
    }
    if (page.kind === "product" && (!fields.displayed_prices || !fields.displayed_prices.length)) {
      issues.push({ code: "product_price_missing", state: "element_missing_on_loaded_page" });
    }
    const missingAlt = (fields.images ?? []).filter((image) => image.url && !image.alt);
    if (missingAlt.length) issues.push({ code: "image_alt_missing", count: missingAlt.length, state: "element_missing_on_loaded_page" });
  }
  const directImages = images.success === true && Array.isArray(images.data) ? images.data : [];
  const urls = directImages.map((x) => typeof x === "string" ? x : x.url).filter(Boolean);
  const duplicates = urls.filter((value, index) => urls.indexOf(value) !== index);
  if (duplicates.length) issues.push({ code: "repeated_image_urls", count: duplicates.length, state: "observed" });
  const linkRows = parsed.success === true && parsed.type === "links" && Array.isArray(parsed.data?.links)
    ? parsed.data.links : [];
  const productLinks = linkRows.map((x) => x.url).filter((x) => /\/products\//.test(x ?? ""));
  return {
    url: result.sourceUrl, finalUrl: result.finalUrl, locale: page.locale, kind: page.kind,
    retrievedAt: result.retrievedAt, isPartial: result.isPartial,
    requestId: result.requestId,
    observed: fields,
    copyMarkdown: result.outputs.markdown?.success === true && typeof result.outputs.markdown.data === "string"
      ? result.outputs.markdown.data.slice(0, 15_000) : null,
    markdownTruncated: result.outputs.markdown?.success === true && (result.outputs.markdown.data?.length ?? 0) > 15_000,
    productLinks: [...new Set([...(fields?.product_links ?? []), ...productLinks])],
    imageUrlsAsDisplayed: urls,
    formatStatus: Object.fromEntries(Object.entries(result.outputs).map(([key, value]) =>
      [key, { requested: value.requested, success: value.success, error_code: value.error_code }])),
    issues,
  };
}

export async function auditUrl(url, { fresh = false, screenshots = false, scrape = scrapePage } = {}) {
  const identity = pageIdentity(url);
  const result = await scrape({
    url, fresh, country: "CA",
    formats: { json: true, markdown: true, images: true, parse: true, ...(screenshots ? { screenshot: true } : {}) },
    parseParams: { type: "prebuilt", parser: "links" },
    jsonSchema: QA_SCHEMA, instructions: INSTRUCTIONS,
    dedupeImages: false, maxAgeMs: 1_800_000,
  });
  return { report: analyzePage(identity, result), screenshotData: result.outputs.screenshot?.data ?? null };
}

async function main(argv) {
  const fresh = argv.includes("--fresh");
  const screenshots = argv.includes("--screenshots");
  const urls = argv.filter((value) => !value.startsWith("--"));
  if (!urls.length || urls.length > 6) throw new Error("pass between 1 and 6 public Melato URLs (maximum six per run)");
  const reports = [];
  const outputDir = path.resolve(".cache/contextdev-storefront");
  await mkdir(outputDir, { recursive: true });
  for (const [index, url] of urls.entries()) {
    try {
      const { report, screenshotData } = await auditUrl(url, { fresh, screenshots });
      if (screenshotData && /^data:image\/(png|jpeg|webp);base64,/.test(screenshotData)) {
        const match = screenshotData.match(/^data:image\/(png|jpeg|webp);base64,(.*)$/s);
        const extension = match[1] === "jpeg" ? "jpg" : match[1];
        const artifact = path.join(outputDir, "capture-" + (index + 1) + "." + extension);
        await writeFile(artifact, Buffer.from(match[2], "base64"), { mode: 0o600 });
        report.screenshot = artifact;
      }
      reports.push(report);
    } catch (error) {
      const identity = pageIdentity(url);
      reports.push({
        url, ...identity, retrievedAt: new Date().toISOString(),
        error: error.message, state: "scrape_failed", isPartial: false,
      });
    }
  }
  const output = path.join(outputDir, "qa-report.json");
  await writeFile(output, JSON.stringify({ generatedAt: new Date().toISOString(), reports }, null, 2) + "\n", { mode: 0o600 });
  console.log(JSON.stringify({ output, pages: reports.length, failures: reports.filter((r) => r.state === "scrape_failed").length }));
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main(process.argv.slice(2)).catch((error) => { console.error(error.message); process.exitCode = 1; });
}
