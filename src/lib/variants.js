/**
 * Domain B: Variant Resolution, Currency Formatting & Inventory Scarcity.
 * Inventory quantities must be supplied by Shopify; never guess them.
 */
function resolveVariant(variants, selectedOptions = {}) {
  if (!Array.isArray(variants) || !selectedOptions) return null;
  return variants.find(variant => {
    if (selectedOptions.option1 && variant.option1 !== selectedOptions.option1) return false;
    if (selectedOptions.option2 && variant.option2 !== selectedOptions.option2) return false;
    return true;
  }) || null;
}

function formatPrice(cents, currency = 'CAD') {
  return new Intl.NumberFormat('en-CA', {
    style: 'currency', currency, minimumFractionDigits: 2
  }).format(Number(cents) / 100);
}

function getInventoryScarcityNotice(variant, threshold = 3) {
  if (!variant) return null;
  if (!variant.available) return { level: 'SOLD_OUT', message: 'Archived / Depleted' };
  // Shopify returns null/undefined for untracked inventory. Do not manufacture scarcity.
  if (!Number.isInteger(variant.inventory_quantity) || variant.inventory_quantity < 0) return null;
  if (variant.inventory_quantity === 0) return { level: 'SOLD_OUT', message: 'Archived / Depleted' };
  if (variant.inventory_quantity <= threshold) {
    return { level: 'LOW_STOCK', message: 'Only ' + variant.inventory_quantity + ' units remaining in archive' };
  }
  return null;
}

function getExposedSizeOptions(variants, selectedSize = null, threshold = 3) {
  if (!Array.isArray(variants)) return [];
  return variants.map(v => {
    const isSelected = v.option1 === selectedSize;
    const isAvailable = Boolean(v.available) &&
      (!Number.isInteger(v.inventory_quantity) || v.inventory_quantity > 0);
    const badge = isAvailable && Number.isInteger(v.inventory_quantity) &&
      v.inventory_quantity > 0 && v.inventory_quantity <= threshold
      ? 'Only ' + v.inventory_quantity + ' left' : null;
    return { variantId: v.id, size: v.option1, isSelected, isAvailable, disabled: !isAvailable, badge };
  });
}

module.exports = { resolveVariant, formatPrice, getInventoryScarcityNotice, getExposedSizeOptions };
