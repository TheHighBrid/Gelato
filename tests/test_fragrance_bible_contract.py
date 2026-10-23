"""Static Fragrance Bible routing regression checks. Run: python3 tests/test_fragrance_bible_contract.py"""
from pathlib import Path

pdp = Path("sections/melato-product-page-rebuild.liquid").read_text()
snippet = Path("snippets/melato-fragrance-pdp-details.liquid").read_text()
bible = Path("docs/MELATO_FRAGRANCE_PRODUCT_PAGE_BIBLE.md").read_text()
assert "{%- if family == 'fragrance' -%}\n          {% render 'melato-fragrance-pdp-details', product: product %}" in pdp
assert "Returns accepted on eligible unworn items under the posted return policy." in pdp
assert "Opened or used fragrance is not eligible" in snippet
assert "/pages/shipping-returns" in snippet
assert "custom.ingredients.value" in pdp
assert "custom.scent_profile.value" in snippet
assert "custom.fragrance_safety.value" in snippet
assert "Melato Fragrance Product Page Bible" in bible
assert "{%- unless family == 'fragrance' -%}{% render 'size-guide-drawer'" in pdp
print("Fragrance Bible routing static checks passed")
