/**
 * Domain D: Local optimistic cart state & Shopify AJAX payload formatter.
 * This state machine does NOT call Shopify; authoritative inventory, pricing,
 * and cart totals must come from /cart/add.js and /cart.js responses.
 */
function createShopifyAjaxPayload(variantId, quantity = 1, properties = {}) {
  const id = Number(variantId);
  const qty = Number(quantity);
  if (!Number.isSafeInteger(id) || id <= 0) throw new TypeError('A numeric Shopify variant ID is required');
  if (!Number.isSafeInteger(qty) || qty <= 0) throw new TypeError('Quantity must be a positive integer');
  return { items: [{ id, quantity: qty, properties }] };
}

class CartStateMachine {
  constructor(initialItems = []) {
    this.items = initialItems.map(item => ({ ...item }));
    this.isOpen = false;
    this.listeners = new Set();
    this.recalculate();
  }
  recalculate() {
    this.itemCount = this.items.reduce((sum, item) => sum + item.quantity, 0);
    this.subtotalCents = this.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  }
  notify() { this.listeners.forEach(fn => fn(this.getState())); }
  subscribe(fn) { this.listeners.add(fn); return () => this.listeners.delete(fn); }
  getState() {
    return {
      items: this.items.map(item => ({ ...item })),
      itemCount: this.itemCount,
      subtotalCents: this.subtotalCents,
      isOpen: this.isOpen
    };
  }
  addItem(item) {
    const existing = this.items.find(i => String(i.variantId) === String(item.variantId));
    if (existing) { existing.quantity += (item.quantity || 1); }
    else { this.items.push({ ...item, quantity: item.quantity || 1 }); }
    this.recalculate();
    this.notify();
    return this.getState();
  }
  removeItem(variantId) {
    this.items = this.items.filter(i => String(i.variantId) !== String(variantId));
    this.recalculate();
    this.notify();
    return this.getState();
  }
  openCart() { this.isOpen = true; this.notify(); }
  closeCart() { this.isOpen = false; this.notify(); }
}

module.exports = { CartStateMachine, createShopifyAjaxPayload };
