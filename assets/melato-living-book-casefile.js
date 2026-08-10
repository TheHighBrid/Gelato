(() => {
  const roots = document.querySelectorAll('[data-living-book-casefile]');
  if (!roots.length) return;

  roots.forEach((root) => {
    const progress = () => {
      const rect = root.getBoundingClientRect();
      const travel = Math.max(root.offsetHeight - window.innerHeight, 1);
      const passed = Math.min(Math.max(-rect.top, 0), travel);
      root.style.setProperty('--lb-progress', `${(passed / travel) * 100}%`);
    };

    progress();
    window.addEventListener('scroll', progress, { passive: true });
    window.addEventListener('resize', progress);

    const revealItems = root.querySelectorAll('[data-lbk-reveal]');
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
      revealItems.forEach((item) => observer.observe(item));
    } else {
      revealItems.forEach((item) => item.classList.add('is-visible'));
    }

    const viewer = root.querySelector('[data-lbk-viewer]');
    if (!viewer) return;

    const opens = Array.from(root.querySelectorAll('[data-lbk-open]'));
    const image = viewer.querySelector('[data-lbk-viewer-image]');
    const label = viewer.querySelector('[data-lbk-viewer-label]');
    const counter = viewer.querySelector('[data-lbk-viewer-counter]');
    const close = viewer.querySelector('[data-lbk-close]');
    const prev = viewer.querySelector('[data-lbk-prev]');
    const next = viewer.querySelector('[data-lbk-next]');
    let activeIndex = 0;
    let lastFocus = null;

    const render = (index) => {
      if (!opens.length) return;
      activeIndex = (index + opens.length) % opens.length;
      const trigger = opens[activeIndex];
      const full = trigger.dataset.full || trigger.querySelector('img')?.src || '';
      const code = trigger.dataset.code || String(activeIndex + 1).padStart(2, '0');
      const alt = trigger.querySelector('img')?.alt || `Living Book evidence ${code}`;
      image.src = full;
      image.alt = alt;
      label.textContent = `EXHIBIT ${code}`;
      counter.textContent = `${String(activeIndex + 1).padStart(2, '0')} / ${String(opens.length).padStart(2, '0')}`;
    };

    const openViewer = (index, trigger) => {
      lastFocus = trigger;
      render(index);
      viewer.hidden = false;
      viewer.setAttribute('aria-hidden', 'false');
      document.documentElement.style.overflow = 'hidden';
      close?.focus();
    };

    const closeViewer = () => {
      viewer.hidden = true;
      viewer.setAttribute('aria-hidden', 'true');
      image.src = '';
      document.documentElement.style.overflow = '';
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
