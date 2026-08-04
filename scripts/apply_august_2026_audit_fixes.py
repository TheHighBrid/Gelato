#!/usr/bin/env python3
"""Apply the August 4, 2026 Melato audit fixes to source templates.

This migration intentionally uses exact, reviewable replacements. It avoids
inventing product specifications and only publishes category guidance supported
by the audit or existing product data.
"""

from __future__ import annotations

import json
import os
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
TEXT_SUFFIXES = {".liquid", ".json", ".js", ".css", ".md"}
CHANGED: list[str] = []


def read(path: str) -> str:
    return (ROOT / path).read_text(encoding="utf-8")


def write(path: str, content: str) -> None:
    target = ROOT / path
    original = target.read_text(encoding="utf-8")
    if content == original:
        return
    target.write_text(content, encoding="utf-8")
    CHANGED.append(path)


def replace(path: str, old: str, new: str, *, required: bool = False) -> int:
    target = ROOT / path
    if not target.exists():
        if required:
            raise FileNotFoundError(path)
        return 0
    content = target.read_text(encoding="utf-8")
    count = content.count(old)
    if required and count == 0:
        raise RuntimeError(f"Required source text not found in {path}: {old[:100]!r}")
    if count:
        write(path, content.replace(old, new))
    return count


def regex_replace(path: str, pattern: str, replacement: str, *, flags: int = 0, required: bool = False) -> int:
    target = ROOT / path
    if not target.exists():
        if required:
            raise FileNotFoundError(path)
        return 0
    content = target.read_text(encoding="utf-8")
    updated, count = re.subn(pattern, replacement, content, flags=flags)
    if required and count == 0:
        raise RuntimeError(f"Required pattern not found in {path}: {pattern[:100]!r}")
    if count:
        write(path, updated)
    return count


def replace_across_theme(old: str, new: str) -> int:
    total = 0
    for target in ROOT.rglob("*"):
        if not target.is_file() or target.suffix.lower() not in TEXT_SUFFIXES:
            continue
        if ".git" in target.parts:
            continue
        content = target.read_text(encoding="utf-8")
        count = content.count(old)
        if not count:
            continue
        target.write_text(content.replace(old, new), encoding="utf-8")
        relative = str(target.relative_to(ROOT))
        if relative not in CHANGED:
            CHANGED.append(relative)
        total += count
    return total


def apply_global_copy_fixes() -> None:
    exact_replacements = {
        "POPUP SHOW #4 · JULY 21 · POPUP SHOW #5 · AUGUST 20": "POPUP SHOW #5 · AUGUST 20",
        "POPUP SHOW #4 · JULY 21 ·": "",
        "Browse selected pieces from the current Melato rotation, then complete the set with matching jackets and pants.": "A curated edit from the current Melato rotation, spanning apparel, fragrance and limited statement pieces.",
        "Explore the latest uniform pieces.": "Explore the current Melato rotation.",
        "Shop the Uniform": "Shop New Arrivals",
        "Taxes & shipping calculated at checkout": "Complimentary standard delivery. Taxes and applicable duties calculated at checkout.",
        "Taxes &amp; shipping calculated at checkout": "Complimentary standard delivery. Taxes and applicable duties calculated at checkout.",
        "Visit Us In-Store": "Visit the Melatelier pop-up",
        "Melatelier is located at Tanger Outlets Ottawa.": "The Melatelier pop-up opens only on announced dates.",
        "Toiletry Bags": "Travel Cases",
        "Eaux De Toilette": "Eaux de Toilette",
        "Eaux De Parfum": "Eaux de Parfum",
        "orders@melato.ca": "support@melato.ca",
    }
    for old, new in exact_replacements.items():
        replace_across_theme(old, new)


def fix_cart_source() -> None:
    path = "snippets/cart-drawer.liquid"
    old = """{%- liquid
  assign free_threshold_cents = settings.cart_free_shipping_threshold | times: 100 | round
  assign cart_total = cart.total_price
  assign remaining_cents = free_threshold_cents | minus: cart_total
  if remaining_cents <= 0
    assign shipping_unlocked = true
  else
    assign shipping_unlocked = false
  endif
  assign progress_pct = cart_total | times: 100 | divided_by: free_threshold_cents | at_most: 100
-%}"""
    new = """{%- liquid
  assign free_threshold_cents = settings.cart_free_shipping_threshold | times: 100 | round
  assign cart_total = cart.total_price
  assign remaining_cents = 0
  assign shipping_unlocked = true
  assign progress_pct = 100

  if free_threshold_cents > 0
    assign remaining_cents = free_threshold_cents | minus: cart_total
    if remaining_cents <= 0
      assign shipping_unlocked = true
    else
      assign shipping_unlocked = false
    endif
    assign progress_pct = cart_total | times: 100 | divided_by: free_threshold_cents | at_most: 100
  endif
-%}"""
    replace(path, old, new, required=True)
    replace(path, 'href="/collections/drop-001-texture-form"', 'href="/collections/new-arrivals"')


def fix_collection_source() -> None:
    path = "sections/main-collection.liquid"
    replace(
        path,
        """                  <span class="melato-filter-option__count">({{ value.count }})</span>
""",
        "",
        required=True,
    )

    # Ensure the zero active-filter badge is absent from server HTML, not merely hidden.
    replace(
        path,
        """      {%- else -%}
        <span class="melato-filter-btn__badge" data-active-filter-count style="display:none">0</span>
      {%- endif -%}
""",
        """      {%- endif -%}
""",
        required=True,
    )


def fix_product_rebuild_source() -> None:
    path = "sections/melato-product-page-rebuild.liquid"

    dress_branch = """  elsif product_type_down contains 'dress' or product_title_down contains 'dress'
"""
    category_branches = """  elsif product_type_down contains 'fragrance' or product_title_down contains 'eau de toilette' or product_title_down contains 'eau de parfum' or product_title_down contains 'perfume'
    assign fallback_hook = 'A Melato fragrance composed for presence, memory, and daily ritual.'
    assign fallback_story = 'A fragrance developed as an atmosphere rather than an accessory. Wear it on pulse points and allow the composition to unfold naturally on skin.'
    assign fallback_fit = blank
    assign fallback_material = 'Fragrance composition presented in a 100 mL bottle.'
  elsif product_title_down contains 'fur' or product_type_down contains 'fur'
    assign fallback_hook = 'A specialist outerwear piece built around natural texture, structure, and controlled volume.'
    assign fallback_story = 'A statement outerwear piece that requires material-specific handling and professional specialist care.'
    assign fallback_fit = 'Structured outerwear fit. Use verified garment measurements for sizing.'
    assign fallback_material = 'Specialist natural-material construction. Refer to the published composition for exact fibres and skins.'
  elsif product_type_down contains 'dress' or product_title_down contains 'dress'
"""
    replace(path, dress_branch, category_branches, required=True)

    old_care = """  assign care_copy = care_copy | default: 'Wash cold inside out where applicable. Hang dry or lay flat. Avoid direct heat over embroidery, patches, prints, trims, or branded details.'
"""
    new_care = """  if care_copy == blank
    if product_type_down contains 'fragrance' or product_title_down contains 'eau de toilette' or product_title_down contains 'eau de parfum' or product_title_down contains 'perfume'
      assign care_copy = 'Apply to pulse points. Avoid rubbing the fragrance into the skin. Store upright away from heat and direct sunlight.'
    elsif product_title_down contains 'fur' or product_type_down contains 'fur'
      assign care_copy = 'Professional fur cleaning only. Do not machine wash or hand wash. Store in a cool, ventilated space. Avoid moisture, direct heat and prolonged sunlight. Use a broad-shouldered hanger.'
    elsif product_title_down contains 'silk' or product_title_down contains 'satin' or product_type_down contains 'silk'
      assign care_copy = 'Follow the sewn-in care label. Contact support@melato.ca before cleaning if the label is unclear.'
    else
      assign care_copy = 'Follow the product page and sewn-in care label. Contact support@melato.ca before cleaning if the instructions are unclear.'
    endif
  endif
"""
    replace(path, old_care, new_care, required=True)

    replace(
        path,
        '<div class="pdp-trust-row" aria-label="Payment and shipping trust"><span>Fast dispatch</span><span>Complimentary delivery on all orders</span><span>Secure checkout</span></div>',
        '<ul class="pdp-trust-row" aria-label="Payment and shipping trust"><li>Fast dispatch</li><li>Complimentary delivery on all orders</li><li>Secure checkout</li></ul>',
        required=True,
    )

    replace(
        path,
        "alt: featured_media.alt | default: product.title",
        "alt: featured_media.alt | default: product.title | append: ' front view'",
    )
    replace(
        path,
        "alt: media.alt | default: product.title",
        "alt: media.alt | default: product.title | append: ' view ' | append: forloop.index",
    )


def fix_generic_product_care() -> None:
    safe_default = "Follow the product page and sewn-in care label. Contact support@melato.ca before cleaning if the instructions are unclear."
    replace_across_theme(
        "Wash cold inside out where applicable. Hang dry or lay flat. Avoid direct heat over embroidery, patches, prints, trims, or branded details.",
        safe_default,
    )

    replace_across_theme(
        "Wash cold on a gentle cycle, wash inside out",
        "Care varies by product and material. Always follow the product page and sewn-in care label",
    )


def fix_concierge_accessibility() -> None:
    for path in [
        "sections/melato-concierge-strip.liquid",
        "sections/melato-concierge-showcase.liquid",
        "sections/melato-concierge.liquid",
    ]:
        target = ROOT / path
        if not target.exists():
            continue
        content = target.read_text(encoding="utf-8")
        content = content.replace('aria-label="Fit Fit Concierge"', 'aria-label="Fit Concierge"')
        content = content.replace('aria-label="Delivery Delivery Concierge"', 'aria-label="Delivery Concierge"')
        content = content.replace('aria-label="CareOrder Companion"', 'aria-label="Order Companion"')
        content = content.replace('aria-label="AccessThe Preview Room"', 'aria-label="The Preview Room"')
        write(path, content)


def validate_json() -> None:
    errors: list[str] = []
    for target in ROOT.rglob("*.json"):
        if ".git" in target.parts:
            continue
        try:
            json.loads(target.read_text(encoding="utf-8"))
        except json.JSONDecodeError as exc:
            errors.append(f"{target.relative_to(ROOT)}: {exc}")
    if errors:
        raise RuntimeError("JSON validation failed:\n" + "\n".join(errors))


def remove_one_shot_files() -> None:
    if os.getenv("MELATO_ONE_SHOT") != "1":
        return
    for relative in [
        "scripts/apply_august_2026_audit_fixes.py",
        ".github/workflows/apply-august-2026-audit-fixes.yml",
    ]:
        target = ROOT / relative
        if target.exists():
            target.unlink()


def main() -> None:
    apply_global_copy_fixes()
    fix_cart_source()
    fix_collection_source()
    fix_product_rebuild_source()
    fix_generic_product_care()
    fix_concierge_accessibility()
    validate_json()
    remove_one_shot_files()

    print("Changed files:")
    for path in sorted(set(CHANGED)):
        print(f"  - {path}")


if __name__ == "__main__":
    main()
