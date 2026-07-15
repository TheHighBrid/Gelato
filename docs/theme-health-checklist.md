# Shopify Liquid Theme Health Checklist

A proactive maintenance reference for common pitfalls in Shopify Liquid themes.  
Run through this list before every new section, snippet, or template goes to production.

---

## 1. Liquid null / blank guards

- [ ] Every `{{ object.property }}` that could be blank is wrapped with `{% if object.property != blank %}` or uses `| default: 'fallback'`.
- [ ] `<h1>`, `<h2>`, and other heading tags always have a non-blank fallback or a guard so they never render empty.
- [ ] Optional link targets (URLs) are checked with `{% if url != blank %}` before rendering an `<a>` tag; an `<a href="">` or `<a href="#">` is intentional, not an accident.
- [ ] Collection references are guarded: `{% if collection != blank and collection.products_count > 0 %}`.
- [ ] Product image references use `{% if product.featured_image %}` before calling `image_url` / `image_tag`.

---

## 2. `render` / snippet parameter consistency

- [ ] Every `{% render 'snippet-name', param: value %}` call passes only parameters the snippet actually uses.
- [ ] Snippet files document their expected parameters in a `{%- comment -%}` block at the top.
- [ ] When a snippet is optional (e.g. injected via `layout/theme.liquid`), its absence does not throw an error — the snippet file must exist in the theme.
- [ ] No snippet uses `include` (deprecated); use `render` instead.

---

## 3. `image_tag` filter — parameter pipe trap

**Critical:** Trailing `|` filters after a named parameter inside an `image_tag` call are applied to the **entire rendered `<img>` HTML output**, not to the parameter value.

```liquid
{# WRONG — | escape escapes the whole <img> tag, producing visible HTML entities #}
{{ image | image_url: width: 800 | image_tag: alt: image.alt | escape }}

{# CORRECT — pre-assign the alt value, then pass the clean variable #}
{%- assign img_alt = image.alt | default: 'Product image' | escape -%}
{{ image | image_url: width: 800 | image_tag: alt: img_alt }}
```

Apply the same pattern for any filter chained after a named parameter: `| default:`, `| upcase`, `| truncate`, etc.

---

## 4. Section schema setting ID consistency

- [ ] Every setting `"id"` referenced in Liquid (`section.settings.my_id`) matches exactly one schema `"id"` field — including spelling and snake_case.
- [ ] Deleted schema settings are removed from all Liquid references (otherwise they silently return empty).
- [ ] Block setting IDs are unique within the block type's settings array.
- [ ] Schema `"label"` values accurately reflect what the setting does (e.g. a palette *mode* selector should not be labelled "Palette label").
- [ ] `"type": "select"` settings list all the option `"value"` strings that the Liquid code branches on.

---

## 5. Template JSON and section reference validity

- [ ] Every `"type"` value in a `.json` template (e.g. `index.json`) corresponds to an actual `.liquid` file in `sections/`.
- [ ] Block `"type"` values in template JSON match block types defined in the target section's `{% schema %}`.
- [ ] `"block_order"` arrays contain only keys that exist in the `"blocks"` object of the same section entry.
- [ ] Removing a section from a template also removes it from the `"order"` array.

---

## 6. Localization key usage

- [ ] Every `{{ 'key' | t }}` call has a corresponding entry in `locales/en.default.json`.
- [ ] New translation keys follow the existing namespace convention (`sections.my_section.heading` style).
- [ ] Fallback values are provided for optional `t` calls: `{{ 'key' | t: default: 'Fallback text' }}` keeps the theme functional even in locales where the key is missing.
- [ ] Avoid hardcoded user-facing copy in Liquid or JS that bypasses the localization layer.

---

## 7. Asset existence and reference consistency

- [ ] Every `{{ 'file.css' | asset_url }}` / `{{ 'file.js' | asset_url }}` reference points to a file that actually exists in `assets/`.
- [ ] Renamed or deleted assets are updated everywhere they are referenced (layout files, section inline `<script>` / `<link>` tags).
- [ ] Liquid variables interpolated into `<style>` blocks (e.g. CSS custom properties) are valid CSS values; color pickers return hex strings safe for direct CSS use, but range pickers return numbers that need a unit (`px`, `%`) appended in the template.

---

## 8. JavaScript — defensive DOM access

- [ ] Every `document.querySelector(...)` result is null-checked before calling methods on it:
  ```js
  const el = document.querySelector('.my-element');
  if (!el) return;
  ```
- [ ] Liquid values injected into `<script>` blocks use proper Liquid delimiters and output filters:
  ```liquid
  {# WRONG #}
  const origin = request.origin;

  {# CORRECT #}
  const origin = '{{ request.origin | escape }}';
  ```
- [ ] `JSON.parse` calls are wrapped in `try/catch` to avoid runtime errors from malformed data.
- [ ] Event listeners that are added inside a Shopify section `<script>` are cleaned up on `shopify:section:unload` (use `AbortController` or manual `removeEventListener`).
- [ ] Timers (`setTimeout`, `setInterval`) are tracked and cleared on section unload to prevent ghost callbacks.

---

## 9. Accessibility baseline

- [ ] Every `<img>` has a meaningful `alt` attribute or `alt=""` if purely decorative.
- [ ] Interactive elements (`<a>`, `<button>`) have visible, descriptive text or `aria-label`.
- [ ] Modal / overlay dialogs have `role="dialog"`, `aria-modal="true"`, and `aria-hidden="true"` when closed; focus should move into the dialog on open and return to the trigger on close.
- [ ] Carousels and scrollable regions have an accessible label (`aria-label` or `aria-labelledby`).
- [ ] Color contrast meets WCAG AA (4.5:1 for normal text, 3:1 for large text) — check with a browser devtools contrast checker or a tool like axe.
- [ ] `target="_blank"` links include `rel="noopener noreferrer"` to prevent tab-napping.

---

## 10. Common Shopify runtime pitfalls

| Pitfall | Safe pattern |
|---|---|
| `divided_by: 100` truncates decimals (integer division) | Use `divided_by: 100.0` |
| `image_url` returns a protocol-relative URL (`//cdn…`) | Prepend `https:` when an absolute URL is required (e.g. JSON-LD) |
| `product.price` is in cents | Always format with `money` filter for display; divide by `100.0` for schema markup |
| `section.settings.color` returns a hex string without `#` in some filter contexts | Test output; use `| prepend: '#'` if needed |
| `forloop.last` comma-omission in JSON-LD | Use `{{ ',' unless forloop.last }}` to avoid trailing commas |
| CSS `@layer` declarations inside inline `<style>` tags may conflict across multiple section instances | Scope layer names per section or use a shared global stylesheet |
| `prefers-reduced-motion` ignored | Wrap all animations in `@media (prefers-reduced-motion: no-preference)` |
