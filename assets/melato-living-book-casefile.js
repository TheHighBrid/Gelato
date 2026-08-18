(() => {
  const roots = document.querySelectorAll('[data-living-book-casefile]');
  if (!roots.length) return;

  const pad = (value, size = 3) => String(value).padStart(size, '0');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  roots.forEach((root) => {
    if (root.dataset.lbv2Ready === 'true') return;
    root.dataset.lbv2Ready = 'true';

    const intro = root.querySelector('[data-lbv2-intro]');
    const introKey = 'melato:living-book:v2:intro-seen';
    let introTimer = null;

    const closeIntro = () => {
      if (!intro || intro.classList.contains('is-dismissed')) return;
      intro.classList.add('is-dismissed');
      document.documentElement.classList.remove('lbv2-intro-lock');
      try { sessionStorage.setItem(introKey, '1'); } catch (_) {}
      window.clearTimeout(introTimer);
    };

    if (intro) {
      let seen = false;
      try { seen = sessionStorage.getItem(introKey) === '1'; } catch (_) {}
      if (reducedMotion) {
        intro.hidden = true;
      } else {
        intro.classList.toggle('is-short', seen);
        document.documentElement.classList.add('lbv2-intro-lock');
        introTimer = window.setTimeout(closeIntro, seen ? 1100 : 4300);
        ['wheel', 'touchstart', 'pointerdown', 'keydown'].forEach((eventName) => {
          window.addEventListener(eventName, closeIntro, { once: true, passive: true });
        });
      }
    }

    const updateProgress = () => {
      const rect = root.getBoundingClientRect();
      const travel = Math.max(root.offsetHeight - window.innerHeight, 1);
      const passed = Math.min(Math.max(-rect.top, 0), travel);
      root.style.setProperty('--lb-progress', `${(passed / travel) * 100}%`);
    };

    let progressRaf = 0;
    const requestProgress = () => {
      if (progressRaf) return;
      progressRaf = requestAnimationFrame(() => {
        progressRaf = 0;
        updateProgress();
      });
    };
    updateProgress();
    window.addEventListener('scroll', requestProgress, { passive: true });
    window.addEventListener('resize', requestProgress, { passive: true });

    const lazyImages = Array.from(root.querySelectorAll('img[data-lbv2-lazy]'));
    if ('IntersectionObserver' in window && lazyImages.length) {
      const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const img = entry.target;
          if (img.dataset.src) img.src = img.dataset.src;
          if (img.dataset.srcset) img.srcset = img.dataset.srcset;
          img.removeAttribute('data-lbv2-lazy');
          img.removeAttribute('data-src');
          img.removeAttribute('data-srcset');
          observer.unobserve(img);
        });
      }, { rootMargin: '180% 0px 180% 0px', threshold: 0.01 });
      lazyImages.forEach((img) => imageObserver.observe(img));
    } else {
      lazyImages.forEach((img) => {
        if (img.dataset.src) img.src = img.dataset.src;
        if (img.dataset.srcset) img.srcset = img.dataset.srcset;
      });
    }

    const frames = Array.from(root.querySelectorAll('[data-lbv2-frame]'));
    if ('IntersectionObserver' in window && frames.length) {
      const frameObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          entry.target.classList.toggle('is-near', entry.isIntersecting);
          if (entry.isIntersecting) entry.target.classList.add('is-visible');
        });
      }, { rootMargin: '70% 0px 70% 0px', threshold: 0.02 });
      frames.forEach((frame) => frameObserver.observe(frame));
    } else {
      frames.forEach((frame) => frame.classList.add('is-visible', 'is-near'));
    }

    const railLinks = Array.from(root.querySelectorAll('[data-lbv2-rail-link]'));
    const chapters = Array.from(root.querySelectorAll('[data-lbv2-chapter]'));
    if ('IntersectionObserver' in window && chapters.length) {
      const chapterObserver = new IntersectionObserver((entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => Math.abs(a.boundingClientRect.top) - Math.abs(b.boundingClientRect.top))[0];
        if (!visible) return;
        const chapter = visible.target.dataset.lbv2Chapter;
        railLinks.forEach((link) => link.classList.toggle('is-active', link.dataset.lbv2RailLink === chapter));
      }, { rootMargin: '-15% 0px -70% 0px', threshold: 0 });
      chapters.forEach((chapter) => chapterObserver.observe(chapter));
    }

    if (!reducedMotion && window.matchMedia('(pointer:fine)').matches) {
      let pointerRaf = 0;
      root.addEventListener('pointermove', (event) => {
        if (pointerRaf) return;
        pointerRaf = requestAnimationFrame(() => {
          pointerRaf = 0;
          const x = (event.clientX / window.innerWidth - 0.5) * 2;
          const y = (event.clientY / window.innerHeight - 0.5) * 2;
          root.style.setProperty('--lb-pointer-x', `${(-x * 5).toFixed(2)}px`);
          root.style.setProperty('--lb-pointer-y', `${(-y * 5).toFixed(2)}px`);
        });
      }, { passive: true });
    }

    const viewer = root.querySelector('[data-lbv2-viewer]');
    if (!viewer) return;

    const opens = Array.from(root.querySelectorAll('[data-lbv2-open]'));
    const image = viewer.querySelector('[data-lbv2-viewer-image]');
    const label = viewer.querySelector('[data-lbv2-viewer-label]');
    const counter = viewer.querySelector('[data-lbv2-viewer-counter]');
    const product = viewer.querySelector('[data-lbv2-viewer-product]');
    const productTitle = viewer.querySelector('[data-lbv2-viewer-product-title]');
    const productPrice = viewer.querySelector('[data-lbv2-viewer-product-price]');
    const productLink = viewer.querySelector('[data-lbv2-viewer-product-link]');
    const close = viewer.querySelector('[data-lbv2-close]');
    const prev = viewer.querySelector('[data-lbv2-prev]');
    const next = viewer.querySelector('[data-lbv2-next]');
    let activeIndex = 0;
    let lastFocus = null;

    const render = (index) => {
      if (!opens.length) return;
      activeIndex = (index + opens.length) % opens.length;
      const trigger = opens[activeIndex];
      const frameImg = trigger.querySelector('img');
      const full = trigger.dataset.full || frameImg?.currentSrc || frameImg?.src || '';
      const code = trigger.dataset.code || pad(activeIndex + 1);
      image.src = full;
      image.alt = frameImg?.alt || `Living Book evidence ${code}`;
      label.textContent = `EXHIBIT ${code}`;
      counter.textContent = `${pad(activeIndex + 1)} / ${pad(opens.length)}`;

      if (trigger.dataset.productUrl) {
        product.hidden = false;
        productTitle.textContent = trigger.dataset.productTitle || '';
        productPrice.textContent = trigger.dataset.productPrice || '';
        productLink.href = trigger.dataset.productUrl;
      } else {
        product.hidden = true;
        productTitle.textContent = '';
        productPrice.textContent = '';
        productLink.removeAttribute('href');
      }
    };

    const openViewer = (index, trigger) => {
      lastFocus = trigger;
      render(index);
      viewer.hidden = false;
      viewer.setAttribute('aria-hidden', 'false');
      document.documentElement.classList.add('lbv2-viewer-lock');
      close?.focus();
    };

    const closeViewer = () => {
      viewer.hidden = true;
      viewer.setAttribute('aria-hidden', 'true');
      image.src = '';
      document.documentElement.classList.remove('lbv2-viewer-lock');
      lastFocus?.focus?.();
    };

    opens.forEach((trigger, index) => trigger.addEventListener('click', () => openViewer(index, trigger)));
    close?.addEventListener('click', closeViewer);
    prev?.addEventListener('click', () => render(activeIndex - 1));
    next?.addEventListener('click', () => render(activeIndex + 1));
    viewer.addEventListener('click', (event) => {
      if (event.target === viewer) closeViewer();
    });

    document.addEventListener('keydown', (event) => {
      if (viewer.hidden) return;
      if (event.key === 'Escape') closeViewer();
      if (event.key === 'ArrowLeft') render(activeIndex - 1);
      if (event.key === 'ArrowRight') render(activeIndex + 1);
    });
  });
})();
