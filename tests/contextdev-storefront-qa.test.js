const test = require("node:test");
const assert = require("node:assert/strict");

test("server-side Context.dev request preserves format failures and CA market", async () => {
  const { scrapePage } = await import("../scripts/lib/contextdev-scrape.mjs");
  let outbound;
  const response = await scrapePage({
    url: "https://melato.ca/fr/products/exemple",
    apiKey: "mock-key",
    formats: { json: true, markdown: true, parse: true },
    jsonSchema: { type: "object", properties: { product_title: { type: ["string", "null"] } } },
    parseParams: { type: "prebuilt", parser: "links" },
    fetchImpl: async (endpoint, options) => {
      outbound = { endpoint, options, body: JSON.parse(options.body) };
      return { ok: true, status: 200, json: async () => ({
        url: "https://melato.ca/fr/products/exemple", isPartial: true,
        json: { requested: true, success: false, error_code: "EMPTY", data: null },
        markdown: { requested: true, success: true, data: "# Produit" },
        parsed: { requested: true, success: true, type: "links", data: { links: [] } },
      }) };
    },
  });
  assert.equal(outbound.endpoint, "https://api.context.dev/v1/web/scrape");
  assert.equal(outbound.body.sharedParams.country, "CA");
  assert.equal(outbound.body.maxAgeMs, 1800000);
  assert.equal(outbound.body.parseParams.parser, "links");
  assert.equal(outbound.body.jsonParams.schema.properties.product_title.type[0], "string");
  assert.equal(response.isPartial, true);
  assert.equal(response.outputs.json.error_code, "EMPTY");
  assert.equal(response.outputs.markdown.data, "# Produit");
  assert.equal(response.outputs.parse.type, "links");
  assert.equal(response.outputs.screenshot.requested, false);
});

test("QA page identity keeps EN/FR and product/collection/lookbook distinct", async () => {
  const { pageIdentity } = await import("../scripts/contextdev-storefront-qa.mjs");
  const urls = [
    ["https://melato.ca/products/example", "en", "product"],
    ["https://melato.ca/fr/products/example", "fr", "product"],
    ["https://melato.ca/collections/new-arrivals", "en", "collection"],
    ["https://melato.ca/fr/collections/new-arrivals", "fr", "collection"],
    ["https://melato.ca/pages/lookbook", "en", "lookbook"],
    ["https://melato.ca/fr/pages/lookbook", "fr", "lookbook"],
  ];
  for (const [url, locale, kind] of urls) assert.deepEqual(pageIdentity(url), { locale, kind });
});

test("missing live product title is distinct from a failed JSON extraction", async () => {
  const { analyzePage } = await import("../scripts/contextdev-storefront-qa.mjs");
  const base = {
    sourceUrl: "https://melato.ca/products/example", finalUrl: "https://melato.ca/products/example",
    retrievedAt: "2026-11-23T00:00:00Z", requestId: "fixture", isPartial: false,
    outputs: {
      json: { requested: true, success: true, data: { product_title: null, displayed_prices: [], images: [] } },
      markdown: { requested: true, success: true, data: "English page copy" },
      images: { requested: true, success: true, data: [{ url: "https://melato.ca/a.jpg" }] },
      parse: { requested: true, success: true, type: "links", data: { links: [] } },
    },
  };
  let result = analyzePage({ locale: "en", kind: "product" }, base);
  assert.equal(result.issues.find((item) => item.code === "product_title_missing").state, "element_missing_on_loaded_page");
  assert.equal(result.issues.find((item) => item.code === "product_price_missing").state, "element_missing_on_loaded_page");
  assert.equal(result.copyMarkdown, "English page copy");
  base.outputs.json = { requested: true, success: false, error_code: "ERROR", data: null };
  result = analyzePage({ locale: "en", kind: "product" }, base);
  assert.equal(result.issues[0].state, "scrape_or_format_failure");
  assert.equal(result.issues.some((item) => item.code === "product_title_missing"), false);
});

test("storefront QA refuses unrelated hosts and keyless network calls", async () => {
  const { scrapePage, publicMelatoUrl } = await import("../scripts/lib/contextdev-scrape.mjs");
  for (const url of ["https://elsewhere.ca", "http://127.0.0.1", "https://user:pass@melato.ca"]) {
    assert.throws(() => publicMelatoUrl(url));
  }
  await assert.rejects(
    scrapePage({ url: "https://melato.ca", formats: { markdown: true }, apiKey: "" }),
    /CONTEXT_DEV_API_KEY/,
  );
});
