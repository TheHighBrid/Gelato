/**
 * Domain A: Archival Exhibits Registry for Melato "The Living Book".
 * Conceptual catalogue only: image URLs and product mappings are unverified.
 * Do NOT expose product links or checkout actions until mapped to real Shopify data.
 */
const ACTS = {
  1: { number: 1, title: 'The Breach & The Scene', frameRange: [1, 8] },
  2: { number: 2, title: 'The Forensic Autopsy of Form', frameRange: [9, 18] },
  3: { number: 3, title: 'The Conspiracy & Complicity', frameRange: [19, 26] },
  4: { number: 4, title: 'The Cold Case & The Residual', frameRange: [27, 31] }
};

// These are supplied editorial placeholders, NOT verified Shopify products.
const PRODUCTS = [
  { id: 'prod_01', handle: 'milanese-forensic-overcoat', name: 'Milanese Forensic Greatcoat', sku: 'MLT-ACT1-001', basePrice: 1250 },
  { id: 'prod_02', handle: 'offshore-account-panel-jacket', name: 'Offshore Account Panel Track Jacket', sku: 'MLT-OAP-002', basePrice: 680 },
  { id: 'prod_03', handle: 'shell-company-track-pant', name: 'Shell Company Technical Track Pant', sku: 'MLT-SCT-003', basePrice: 520 },
  { id: 'prod_04', handle: 'barbed-veil-trench', name: 'Barbed Veil Silk Trench Coat', sku: 'MLT-BVT-004', basePrice: 1400 },
  { id: 'prod_05', handle: 'tinted-testimony-sunglasses', name: 'Tinted Testimony Sunglasses', sku: 'MLT-TTS-005', basePrice: 380 },
  { id: 'prod_06', handle: 'ryu-track-jacket', name: 'Ryū Technical Track Jacket', sku: 'MLT-RYU-006', basePrice: 720 },
  { id: 'prod_07', handle: 'piccolo-studio-corset', name: 'Piccolo Studio Boned Corset', sku: 'MLT-PSC-007', basePrice: 890 },
  { id: 'prod_08', handle: 'selvedge-archive-denim', name: 'Raw Japanese Selvedge Archive Pant', sku: 'MLT-SAD-008', basePrice: 490 }
];

function generateExhibits() {
  const list = [];
  for (let i = 1; i <= 31; i++) {
    const act = i <= 8 ? 1 : (i <= 18 ? 2 : (i <= 26 ? 3 : 4));
    const pad = String(i).padStart(2, '0');
    const heroProd = PRODUCTS[(i - 1) % PRODUCTS.length];
    const secondaryProd = PRODUCTS[i % PRODUCTS.length];

    list.push({
      id: i,
      exhibitNumber: pad,
      caseTitle: 'CASE / LB-INFINITE',
      classification: 'EXHIBIT_' + pad,
      act,
      actTitle: ACTS[act].title,
      heroGarment: {
        id: heroProd.id,
        name: heroProd.name,
        sku: heroProd.sku + '-' + pad,
        basePrice: heroProd.basePrice,
        handle: heroProd.handle
      },
      hotspots: [
        {
          id: 'spot_' + pad + '_1',
          xPercent: 42.0 + ((i * 3) % 25),
          yPercent: 35.0 + ((i * 5) % 30),
          productId: heroProd.id,
          productHandle: heroProd.handle,
          label: heroProd.name
        },
        {
          id: 'spot_' + pad + '_2',
          xPercent: 55.0 + ((i * 4) % 20),
          yPercent: 65.0 - ((i * 3) % 20),
          productId: secondaryProd.id,
          productHandle: secondaryProd.handle,
          label: secondaryProd.name
        }
      ],
      desktopImage: 'https://melato.ca/cdn/shop/files/living-book-frame-' + pad + '-2560.webp',
      mobileImage: 'https://melato.ca/cdn/shop/files/living-book-frame-' + pad + '-1280.webp',
      uvData: { revealedThreadPattern: 'UV_TRACE_' + pad + '_LUMINESCENT', wavelength: 365 }
    });
  }
  return list;
}

const EXHIBITS = generateExhibits();
function getExhibit(id) {
  return EXHIBITS.find(e => e.id === Number(id)) || null;
}
function getPrefetchWindow(currentId, bufferSize = 2) {
  const curr = Number(currentId);
  const buffer = Number(bufferSize);
  if (!Number.isInteger(curr) || curr < 1 || curr > EXHIBITS.length ||
      !Number.isInteger(buffer) || buffer < 0) return [];
  const min = Math.max(1, curr - buffer);
  const max = Math.min(EXHIBITS.length, curr + buffer);
  return Array.from({ length: max - min + 1 }, (_, i) => min + i);
}

module.exports = { EXHIBITS, ACTS, getExhibit, getPrefetchWindow };
