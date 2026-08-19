(() => {
  const root = document.querySelector('[data-lb-director]');
  if (!root) return;

  const caseIndex = root.querySelector('[data-lbd-index]');
  const caseHost = root.querySelector('[data-lbd-cases]');
  const totalLabel = root.querySelector('[data-lbd-total]');
  const viewer = root.querySelector('[data-lbd-viewer]');
  const viewerImage = root.querySelector('[data-lbd-viewer-image]');
  const viewerCode = root.querySelector('[data-lbd-viewer-code]');
  const viewerTitle = root.querySelector('[data-lbd-viewer-title]');
  const viewerCaption = root.querySelector('[data-lbd-viewer-caption]');
  const viewerProduct = root.querySelector('[data-lbd-viewer-product]');
  const closeButton = root.querySelector('[data-lbd-close]');
  const previousButton = root.querySelector('[data-lbd-prev]');
  const nextButton = root.querySelector('[data-lbd-next]');

  const CASES = [
    {
      key: 'uniform',
      file: 'FILE 01',
      code: 'LB-01',
      title: 'THE UNIFORM IN MOTION',
      subtitle: 'A public identity established through repeated silhouettes.',
      note: 'The opening record treats the tracksuit as a recurring uniform rather than a single look. Repetition becomes evidence of identity.',
      bridge: 'Once the uniform is established, the next file moves closer. Construction, panels and surface become the testimony.',
      mode: 'uniform',
      provenance: 'FILENAME FAMILY CONFIRMED'
    },
    {
      key: 'construction',
      file: 'FILE 02',
      code: 'LB-02',
      title: 'CUT WITH INTENT',
      subtitle: 'Panel work, colour blocking and garment construction move to the foreground.',
      note: 'The body is still present, but the clothes begin to behave like diagrams. Shape, seam and contrast carry the narrative.',
      bridge: 'The technical record ends when the light drops. What was construction becomes performance.',
      mode: 'construction',
      provenance: 'FILENAME FAMILY CONFIRMED'
    },
    {
      key: 'act-three',
      file: 'FILE 03',
      code: 'LB-03',
      title: 'ACT III / AFTER HOURS',
      subtitle: 'A numbered editorial act, isolated from the daytime archive.',
      note: 'The ACT III sequence is filed as its own scene. Its numbered shots preserve continuity without forcing them into earlier wardrobe studies.',
      bridge: 'After the scene closes, the archive loses its polished chronology and falls back to raw contact evidence.',
      mode: 'cinema',
      provenance: 'SHOT SEQUENCE CONFIRMED'
    },
    {
      key: 'frame-zero',
      file: 'FILE 04',
      code: 'LB-04',
      title: 'FRAME ZERO',
      subtitle: 'Contact records before the final narrative was assigned.',
      note: 'These frames share the same source family. They remain deliberately sparse, closer to proof sheets than finished campaign pages.',
      bridge: 'The canonical sequence gives way to recovered material. From here, certainty decreases and the archive says so.',
      mode: 'contact',
      provenance: 'FILENAME FAMILY CONFIRMED'
    },
    {
      key: 'july-recovery',
      file: 'FILE 05',
      code: 'LB-05',
      title: 'RECOVERED EVIDENCE / JULY',
      subtitle: 'Recovered photographs with incomplete shoot metadata.',
      note: 'These images are preserved together because their archive source is confirmed while individual photoshoot attribution is not. No invented concept is substituted for missing metadata.',
      bridge: 'The recovered batch does not resolve the story. It creates a second trail, filed next as afterimages.',
      mode: 'dossier',
      provenance: 'ARCHIVE BATCH CONFIRMED / SHOOT UNRESOLVED'
    },
    {
      key: 'afterimage',
      file: 'FILE 06',
      code: 'LB-06',
      title: 'AFTERIMAGE RECORD',
      subtitle: 'Peripheral sightings, gestures and movement filed after the principal evidence.',
      note: 'This source was already isolated as a third evidence record. It stays separate, but now receives its own visual rhythm and chain-of-custody transition.',
      bridge: 'The archive then reaches material with precise place metadata. The anonymous record becomes a location.',
      mode: 'afterimage',
      provenance: 'ARCHIVE SOURCE CONFIRMED'
    },
    {
      key: 'laundry',
      file: 'FILE 07',
      code: 'LB-07',
      title: 'COIN LAUNDRY / OTTAWA',
      subtitle: 'Gladstone Avenue. Direct flash. Black uniform under industrial light.',
      note: 'An ordinary service space becomes a holding room for the image. Stainless machines, laundry carts and hard flash strip away polish until the uniform is the deliberate object.',
      bridge: 'From fluorescent containment, the next file moves outside. The city becomes reflective, wet and unstable.',
      mode: 'laundry',
      provenance: 'SHOPIFY ALT + LOCATION CONFIRMED'
    },
    {
      key: 'montreal',
      file: 'FILE 08',
      code: 'LB-08',
      title: 'MONTRÉAL NOCTURNE',
      subtitle: 'Rue Saint-Paul, Mount Royal and the city after dark.',
      note: 'Wet cobblestone, skyline, dusk and black silhouettes form one metropolitan record. The location changes, but the city remains the connective tissue.',
      bridge: 'The nocturne pauses on a detail with no confirmed place. Rather than force it into Montréal, the detail receives its own file.',
      mode: 'nocturne',
      provenance: 'SHOPIFY ALT + LOCATION CONFIRMED'
    },
    {
      key: 'night-detail',
      file: 'FILE 09',
      code: 'LB-09',
      title: 'NIGHT DETAIL',
      subtitle: 'Lipstick, gold hardware, white fabric and an unresolved skyline.',
      note: 'The image carries night language but not a verified location. It is treated as an insert, not silently absorbed into another shoot.',
      bridge: 'The insert gives way to an interior with a fully legible institution: art enters the evidence room.',
      mode: 'detail',
      provenance: 'SHOPIFY ALT CONFIRMED / LOCATION UNRESOLVED'
    },
    {
      key: 'gallery',
      file: 'FILE 10',
      code: 'LB-10',
      title: 'OLD MASTERS / TORONTO',
      subtitle: 'Satin and fur placed inside the grammar of a museum portrait.',
      note: 'A reclining figure, peach satin and cream fur sit against classical paintings. The styling does not imitate the gallery. It interrupts it.',
      bridge: 'From institutional portraiture, the record shifts to an exterior sunset and a cream monogram sequence.',
      mode: 'gallery',
      provenance: 'SHOPIFY ALT + LOCATION CONFIRMED'
    },
    {
      key: 'meknes',
      file: 'FILE 11',
      code: 'LB-11',
      title: 'MEKNES AFTERGLOW',
      subtitle: 'Cream monogram pieces against the Old Medina at sunset.',
      note: 'The same warm exterior, cream palette and monogram details establish a clear sequence. Wide looks, portraits and garment close-ups are filed as one photoshoot.',
      bridge: 'The warm city record closes on a portrait with no visible city at all. The witness is isolated.',
      mode: 'afterglow',
      provenance: 'SHOPIFY ALT + LOCATION CONFIRMED'
    },
    {
      key: 'burgundy',
      file: 'FILE 12',
      code: 'LB-12',
      title: 'BURGUNDY WITNESS',
      subtitle: 'Fur, satin, glove. The environment disappears.',
      note: 'A close portrait under a dark background is kept independent from the gallery and city files. Styling is evidence; location is not assumed.',
      bridge: 'The last file contains images whose upload custody is known but whose descriptive metadata was stripped. They remain visible without false certainty.',
      mode: 'portrait',
      provenance: 'SHOPIFY ALT CONFIRMED / LOCATION UNRESOLVED'
    },
    {
      key: 'august-intake',
      file: 'FILE 13',
      code: 'LB-13',
      title: 'UNCLASSIFIED INTAKE / 14 AUG',
      subtitle: 'Newly filed frames with blank descriptive metadata.',
      note: 'These photographs are deliberately shown as an intake sheet. They are not assigned to a photoshoot until visual or source metadata proves the relationship.',
      bridge: 'END OF CURRENT CHAIN. UNRESOLVED FRAMES STAY OPEN FOR FUTURE FILING.',
      mode: 'intake',
      provenance: 'UPLOAD BATCH CONFIRMED / SHOOT UNRESOLVED'
    },
    {
      key: 'unresolved',
      file: 'FILE X',
      code: 'LB-X',
      title: 'UNRESOLVED CONTACTS',
      subtitle: 'Frames that do not yet match a defensible source family.',
      note: 'Nothing is discarded and nothing is guessed. These contacts remain in view until stronger provenance exists.',
      bridge: 'END OF UNRESOLVED CONTACTS.',
      mode: 'unresolved',
      provenance: 'SOURCE UNRESOLVED'
    }
  ];

  const RECENT_FRAME_COPY = {
    1: {
      title: 'GLADSTONE LAUNDRY / OTTAWA',
      caption: 'Black Melato zip-up tracksuit and matching wide-leg trousers inside an Ottawa laundromat on Gladstone Avenue, photographed under direct flash.'
    },
    3: {
      title: 'RUE SAINT-PAUL / MONTRÉAL',
      caption: 'Champagne-beige Melato maxi dress, Melato sunglasses and a dark brown leather Melato bag on rain-slicked Rue Saint-Paul, with Marché Bonsecours in the background.'
    },
    4: {
      title: 'KONDIARONK BELVEDERE / MONTRÉAL',
      caption: 'Black asymmetrical Melato top and black trousers overlooking downtown Montréal from Mount Royal, with a caramel-brown Melato handbag.'
    },
    5: {
      title: 'NIGHT DETAIL / LOCATION UNRESOLVED',
      caption: 'White off-shoulder top, gold clover necklace and lipstick against a dark city skyline. The source metadata does not identify the city.'
    },
    6: {
      title: 'STREET WALK / MONTRÉAL',
      caption: 'Sheer black long-sleeve top, black bralette, wide-leg trousers and black shoulder bag on a Montréal street at night.'
    },
    7: {
      title: 'GALLERY / TORONTO',
      caption: 'Peach satin slip dress and voluminous cream fur coat inside a Toronto museum gallery, set against classical paintings.'
    },
    8: {
      title: 'OLD MEDINA / MEKNES',
      caption: 'Cream satin Melato zip-up jacket and matching trousers against the Meknes Old Medina at sunset.'
    },
    9: {
      title: 'BURGUNDY WITNESS',
      caption: 'Deep burgundy satin hijab, voluminous beige fur coat and matching glove against a dark, moody background.'
    },
    10: {
      title: 'OLD MEDINA PORTRAIT / MEKNES',
      caption: 'Cream Melato zip-up jacket with black zipper and monogram against a blurred Meknes Old Medina sunset.'
    },
    11: {
      title: 'SUNSET PORTRAIT / MEKNES',
      caption: 'Cream scoop-neck look photographed outdoors against the warm Meknes Old Medina skyline.'
    },
    12: {
      title: 'MONOGRAM DETAIL',
      caption: 'Close-up of the cream Melato zip-up jacket, black zipper and monogram against a warm beige field.'
    }
  };

  const pad = (value) => String(value).padStart(2, '0');

  const getUrl = (value) => {
    try {
      return new URL(value, window.location.origin);
    } catch (_) {
      return null;
    }
  };

  const canonicalize = (value) => {
    const url = getUrl(value);
    if (!url) return '';
    url.searchParams.delete('width');
    return url.href;
  };

  const widthUrl = (value, width) => {
    const url = getUrl(canonicalize(value));
    if (!url) return value;
    url.searchParams.set('width', String(width));
    return url.href;
  };

  const keyForUrl = (value) => {
    const url = getUrl(value);
    if (!url) return value;
    return url.pathname.toLowerCase();
  };

  const newestFrameNumber = (src) => {
    const match = src.match(/melato\.ca__editorial_lookbok_the_living_book_frame_(\d+)/i);
    return match ? Number(match[1]) : null;
  };

  const isAugustTemp = (src) => {
    if (!/rn-image_picker_lib_temp_/i.test(src)) return false;
    const url = getUrl(src);
    const version = Number(url?.searchParams.get('v') || 0);
    return version >= 1786713000;
  };

  const classify = (frame) => {
    const src = frame.src;
    const lower = src.toLowerCase();
    const namedFrame = newestFrameNumber(src);

    if (namedFrame === 1) return 'laundry';
    if ([3, 4, 6].includes(namedFrame)) return 'montreal';
    if (namedFrame === 5) return 'night-detail';
    if (namedFrame === 7) return 'gallery';
    if ([8, 10, 11, 12].includes(namedFrame)) return 'meknes';
    if (namedFrame === 9) return 'burgundy';

    if (lower.includes('the_living_lookbook_editorial_shots_vol2_')) return 'uniform';
    if (lower.includes('the-living-lookbook-editorial-photoshoot-frames-by-melato_')) return 'construction';
    if (lower.includes('the_living_lookbook_melato_editorial_lookbook_act_3_shot_')) return 'act-three';
    if (lower.includes('the_living_lookbook-frame-0_')) return 'frame-zero';

    if (isAugustTemp(src)) return 'august-intake';
    if (frame.archiveCode === 'LL-03') return 'afterimage';
    if (frame.archiveCode === 'LL-02') return 'july-recovery';

    if (frame.legacyCategory && /tracksuits|velour/i.test(frame.legacyCategory)) return 'uniform';
    return 'unresolved';
  };

  const collectFrames = () => {
    const selectors = [
      '#MelatoLivingLookbook .mlb-card img',
      '[data-evidence-archive] .mea__image-well img'
    ];

    const seen = new Set();
    const frames = [];

    document.querySelectorAll(selectors.join(',')).forEach((img) => {
      const trigger = img.closest('[data-evidence-open]');
      const card = img.closest('.mlb-card');
      const archive = img.closest('[data-evidence-archive]');
      const candidate = trigger?.dataset.evidenceFull || img.currentSrc || img.getAttribute('src') || '';
      const src = canonicalize(candidate);
      if (!src) return;

      const canonicalKey = keyForUrl(src);
      if (seen.has(canonicalKey)) return;

      if (img.complete && img.naturalWidth === 0 && !trigger?.dataset.evidenceFull) return;
      seen.add(canonicalKey);

      const namedFrame = newestFrameNumber(src);
      const overrideCopy = namedFrame ? RECENT_FRAME_COPY[namedFrame] : null;
      const legacyTitle = card?.querySelector('.mlb-card-ov h3')?.textContent?.trim() || '';
      const legacyCategory = card?.dataset.cat || card?.querySelector('.mlb-card-ov b')?.textContent?.trim() || '';
      const productTitle = trigger?.dataset.productTitle || '';
      const productUrl = trigger?.dataset.productUrl || '';
      const productPrice = trigger?.dataset.productPrice || '';

      frames.push({
        src,
        width: Number(img.getAttribute('width')) || img.naturalWidth || 1600,
        height: Number(img.getAttribute('height')) || img.naturalHeight || 2000,
        alt: overrideCopy?.caption || img.getAttribute('alt') || 'Melato Living Book editorial exhibit',
        title: overrideCopy?.title || productTitle || legacyTitle || 'EDITORIAL EXHIBIT',
        legacyCategory,
        archiveCode: archive?.dataset.caseCode || '',
        sourceEvidenceCode: trigger?.dataset.evidenceCode || '',
        productTitle,
        productUrl,
        productPrice,
        sourceOrder: frames.length + 1
      });
    });

    frames.forEach((frame) => {
      frame.caseKey = classify(frame);
    });

    return frames;
  };

  const create = (tag, className, text) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (typeof text === 'string') node.textContent = text;
    return node;
  };

  let flatFrames = [];
  let activeIndex = 0;
  let lastFocus = null;
  let renderedSignature = '';

  const openViewer = (globalIndex) => {
    activeIndex = globalIndex;
    const frame = flatFrames[activeIndex];
    if (!frame) return;

    if (viewer.hidden) lastFocus = document.activeElement;
    viewerImage.src = widthUrl(frame.src, 2200);
    viewerImage.alt = frame.alt;
    viewerCode.textContent = frame.displayCode;
    viewerTitle.textContent = frame.title;
    viewerCaption.textContent = frame.alt;

    if (frame.productUrl && frame.productTitle) {
      viewerProduct.hidden = false;
      viewerProduct.href = frame.productUrl;
      viewerProduct.textContent = `VIEW ${frame.productTitle.toUpperCase()} ↗`;
      viewerProduct.setAttribute('aria-label', `View verified product ${frame.productTitle}${frame.productPrice ? `, ${frame.productPrice}` : ''}`);
    } else {
      viewerProduct.hidden = true;
      viewerProduct.removeAttribute('href');
    }

    viewer.hidden = false;
    viewer.setAttribute('aria-hidden', 'false');
    document.documentElement.classList.add('mlbd-viewer-open');
    closeButton.focus();
  };

  const closeViewer = () => {
    viewer.hidden = true;
    viewer.setAttribute('aria-hidden', 'true');
    viewerImage.removeAttribute('src');
    document.documentElement.classList.remove('mlbd-viewer-open');
    if (lastFocus && typeof lastFocus.focus === 'function') lastFocus.focus();
  };

  const stepViewer = (delta) => {
    if (!flatFrames.length) return;
    activeIndex = (activeIndex + delta + flatFrames.length) % flatFrames.length;
    openViewer(activeIndex);
  };

  const buildCard = (frame, caseMeta, caseIndexNumber, globalIndex) => {
    const article = create('article', `mlbd__exhibit mlbd__exhibit--${caseMeta.mode}`);
    article.dataset.caseExhibit = frame.displayCode;

    const button = create('button', 'mlbd__exhibit-open');
    button.type = 'button';
    button.setAttribute('aria-label', `Inspect ${frame.displayCode}: ${frame.title}`);

    const imageShell = create('span', 'mlbd__image-shell');
    const img = document.createElement('img');
    img.src = widthUrl(frame.src, caseMeta.mode === 'nocturne' || caseMeta.mode === 'gallery' ? 1400 : 900);
    img.srcset = `${widthUrl(frame.src, 480)} 480w, ${widthUrl(frame.src, 900)} 900w, ${widthUrl(frame.src, 1400)} 1400w`;
    img.sizes = '(min-width: 1100px) 33vw, (min-width: 700px) 46vw, 92vw';
    img.width = frame.width;
    img.height = frame.height;
    img.loading = globalIndex < 4 ? 'eager' : 'lazy';
    img.decoding = 'async';
    img.alt = frame.alt;

    imageShell.appendChild(img);

    const stamp = create('span', 'mlbd__exhibit-stamp', `${caseMeta.code} / EXH ${pad(caseIndexNumber + 1)}`);
    const meta = create('span', 'mlbd__exhibit-meta');
    meta.appendChild(create('strong', '', frame.title));
    meta.appendChild(create('small', '', frame.sourceEvidenceCode ? `SOURCE EXHIBIT ${frame.sourceEvidenceCode}` : `ARCHIVE ORDER ${pad(frame.sourceOrder)}`));

    button.append(imageShell, stamp, meta);
    button.addEventListener('click', () => openViewer(globalIndex));
    article.appendChild(button);

    if (frame.productUrl && frame.productTitle) {
      const product = create('a', 'mlbd__verified-product', `VERIFIED PRODUCT / ${frame.productTitle} ↗`);
      product.href = frame.productUrl;
      product.setAttribute('aria-label', `View verified product ${frame.productTitle}`);
      article.appendChild(product);
    }

    return article;
  };

  const renderArchive = () => {
    const frames = collectFrames();
    if (!frames.length) return;

    const signature = frames.map((frame) => `${keyForUrl(frame.src)}:${frame.caseKey}`).join('|');
    if (signature === renderedSignature) return;
    renderedSignature = signature;

    const grouped = new Map();
    CASES.forEach((meta) => grouped.set(meta.key, []));
    frames.forEach((frame) => {
      if (!grouped.has(frame.caseKey)) grouped.set('unresolved', []);
      grouped.get(frame.caseKey).push(frame);
    });

    caseIndex.replaceChildren();
    caseHost.replaceChildren();
    flatFrames = [];

    const activeCases = CASES.filter((meta) => grouped.get(meta.key)?.length);
    let globalCursor = 0;

    activeCases.forEach((meta, activeCaseIndex) => {
      const caseFrames = grouped.get(meta.key);

      const navLink = create('a', 'mlbd__index-link');
      navLink.href = `#mlbd-${meta.key}`;
      navLink.append(
        create('span', '', meta.file),
        create('strong', '', meta.title),
        create('small', '', `${pad(caseFrames.length)} FRAME${caseFrames.length === 1 ? '' : 'S'}`)
      );
      caseIndex.appendChild(navLink);

      const section = create('section', `mlbd__case mlbd__case--${meta.mode}`);
      section.id = `mlbd-${meta.key}`;
      section.dataset.mode = meta.mode;

      const masthead = create('header', 'mlbd__case-masthead');
      const identity = create('div', 'mlbd__case-identity');
      identity.append(
        create('p', 'mlbd__file-number', `${meta.file} / ${meta.code}`),
        create('h2', '', meta.title),
        create('p', 'mlbd__case-subtitle', meta.subtitle)
      );

      const note = create('div', 'mlbd__case-note');
      note.append(
        create('span', '', 'CASE NOTE'),
        create('p', '', meta.note),
        create('small', '', `PROVENANCE / ${meta.provenance}`)
      );

      masthead.append(identity, note);

      const rail = create('div', 'mlbd__case-rail');
      rail.append(
        create('span', '', `OPEN / ${pad(caseFrames.length)} EXHIBITS`),
        create('span', '', 'MELATO / VISUAL EVIDENCE'),
        create('span', '', `CHAIN ${pad(activeCaseIndex + 1)} OF ${pad(activeCases.length)}`)
      );

      const gallery = create('div', 'mlbd__gallery');
      caseFrames.forEach((frame, caseFrameIndex) => {
        frame.displayCode = `${meta.code} / ${pad(caseFrameIndex + 1)}`;
        frame.globalIndex = globalCursor;
        flatFrames.push(frame);
        gallery.appendChild(buildCard(frame, meta, caseFrameIndex, globalCursor));
        globalCursor += 1;
      });

      section.append(masthead, rail, gallery);
      caseHost.appendChild(section);

      const nextMeta = activeCases[activeCaseIndex + 1];
      if (nextMeta) {
        const handoff = create('aside', 'mlbd__handoff');
        const handoffLabel = create('div', 'mlbd__handoff-label', 'CHAIN OF CUSTODY / CONNECTION POINT');
        const handoffGrid = create('div', 'mlbd__handoff-grid');
        const route = create('div', 'mlbd__handoff-route');
        route.append(
          create('span', '', `${meta.code} CLOSED`),
          create('i', ''),
          create('span', '', `${nextMeta.code} OPENED`)
        );
        handoffGrid.append(route, create('p', '', meta.bridge));
        handoff.append(handoffLabel, handoffGrid);
        caseHost.appendChild(handoff);
      }
    });

    totalLabel.textContent = `${pad(activeCases.length)} CASES / ${pad(flatFrames.length)} EXHIBITS`;
    root.hidden = false;
    document.documentElement.classList.add('melato-lb-directed');
  };

  closeButton.addEventListener('click', closeViewer);
  previousButton.addEventListener('click', () => stepViewer(-1));
  nextButton.addEventListener('click', () => stepViewer(1));

  viewer.addEventListener('click', (event) => {
    if (event.target === viewer) closeViewer();
  });

  viewer.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      closeViewer();
      return;
    }
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      stepViewer(-1);
      return;
    }
    if (event.key === 'ArrowRight') {
      event.preventDefault();
      stepViewer(1);
      return;
    }
    if (event.key === 'Tab') {
      const focusable = [closeButton, previousButton, viewerProduct.hidden ? null : viewerProduct, nextButton].filter(Boolean);
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
  });

  let touchStartX = 0;
  viewer.addEventListener('touchstart', (event) => {
    touchStartX = event.changedTouches[0]?.clientX || 0;
  }, { passive: true });
  viewer.addEventListener('touchend', (event) => {
    const endX = event.changedTouches[0]?.clientX || 0;
    const distance = endX - touchStartX;
    if (Math.abs(distance) > 50) stepViewer(distance < 0 ? 1 : -1);
  }, { passive: true });

  let scheduledRenderTimer = null;
  const scheduleRender = (delay = 160) => {
    window.clearTimeout(scheduledRenderTimer);
    scheduledRenderTimer = window.setTimeout(() => {
      scheduledRenderTimer = null;
      renderArchive();
    }, delay);
  };
  const clearScheduledRender = () => {
    window.clearTimeout(scheduledRenderTimer);
    scheduledRenderTimer = null;
  };

  const sourceObserver = new MutationObserver((mutations) => {
    if (mutations.some((mutation) => mutation.type === 'attributes' && ['src', 'srcset'].includes(mutation.attributeName))) {
      scheduleRender(220);
    }
  });

  document.querySelectorAll('#MelatoLivingLookbook, [data-evidence-archive]').forEach((source) => {
    sourceObserver.observe(source, { subtree: true, attributes: true, attributeFilter: ['src', 'srcset'] });
  });

  const bootTimers = new Set();
  const scheduleBootRender = (delay) => {
    const timer = window.setTimeout(() => {
      bootTimers.delete(timer);
      renderArchive();
    }, delay);
    bootTimers.add(timer);
  };
  const clearBootRenders = () => {
    bootTimers.forEach((timer) => window.clearTimeout(timer));
    bootTimers.clear();
  };
  const boot = () => {
    scheduleRender(300);
    scheduleBootRender(1300);
    scheduleBootRender(3200);
  };

  if (document.readyState === 'complete') {
    boot();
  } else {
    window.addEventListener('load', boot, { once: true });
  }

  const isDirectorSectionEvent = (event) => {
    const sectionId = event.detail?.sectionId;
    return event.target === root || !sectionId || root.id.endsWith(sectionId);
  };
  const cleanup = (event) => {
    if (!isDirectorSectionEvent(event)) return;
    sourceObserver.disconnect();
    clearScheduledRender();
    clearBootRenders();
    closeViewer();
  };
  document.addEventListener('shopify:section:load', (event) => {
    if (!isDirectorSectionEvent(event)) return;
    renderedSignature = '';
    scheduleRender(250);
  });
  document.addEventListener('shopify:section:unload', cleanup);
})();
