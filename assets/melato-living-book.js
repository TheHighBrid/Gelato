(() => {
  'use strict';

  const ROOT_SELECTOR = '[data-melato-living-book]';
  const reduceMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

  function initialiseLivingBook(root) {
    if (!root || root.dataset.mlbInitialised === 'true') return;
    root.dataset.mlbInitialised = 'true';

    const dialog = root.querySelector('[data-mlb-viewer]');
    const viewerImage = root.querySelector('[data-mlb-viewer-image]');
    const viewerCount = root.querySelector('[data-mlb-viewer-count]');
    const viewerTitle = root.querySelector('[data-mlb-viewer-title]');
    const viewerNote = root.querySelector('[data-mlb-viewer-note]');
    const viewerProducts = root.querySelector('[data-mlb-viewer-products]');
    const viewerEmpty = root.querySelector('[data-mlb-viewer-empty]');
    const closeButton = root.querySelector('[data-mlb-viewer-close]');
    const progressBar = root.querySelector('.mlb-progress > span');
    let lastTrigger = null;

    function closeViewer() {
      if (dialog && dialog.open) dialog.close();
    }

    function openViewer(trigger) {
      if (!dialog || !viewerImage) return;

      const frame = trigger.closest('.mlb-frame');
      const productTemplate = frame ? frame.querySelector('[data-mlb-product-template]') : null;
      const hasProducts = Boolean(productTemplate && productTemplate.content && productTemplate.content.children.length);

      lastTrigger = trigger;
      viewerImage.src = trigger.dataset.mlbImage || '';
      viewerImage.alt = trigger.dataset.mlbAlt || '';
      viewerCount.textContent = `Frame ${trigger.dataset.mlbFrame || ''}`;
      viewerTitle.textContent = trigger.dataset.mlbKind || 'Living study';
      viewerNote.textContent = trigger.dataset.mlbNote || '';
      viewerProducts.replaceChildren();

      if (hasProducts) {
        viewerProducts.append(productTemplate.content.cloneNode(true));
        viewerEmpty.hidden = true;
      } else {
        viewerEmpty.hidden = false;
      }

      if (!dialog.open) dialog.showModal();
      closeButton?.focus();
    }

    root.querySelectorAll('[data-mlb-open]').forEach((trigger) => {
      trigger.addEventListener('click', () => openViewer(trigger));
    });

    closeButton?.addEventListener('click', closeViewer);
    dialog?.addEventListener('click', (event) => {
      if (event.target === dialog) closeViewer();
    });
    dialog?.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') closeViewer();
    });
    dialog?.addEventListener('close', () => {
      viewerImage.removeAttribute('src');
      viewerImage.alt = '';
      if (lastTrigger && document.contains(lastTrigger)) lastTrigger.focus();
    });

    root.querySelectorAll('[data-mlb-scroll]').forEach((control) => {
      control.addEventListener('click', (event) => {
        const target = document.querySelector(control.dataset.mlbScroll);
        if (!target) return;
        event.preventDefault();
        target.scrollIntoView({ behavior: reduceMotionQuery.matches ? 'auto' : 'smooth', block: 'start' });
      });
    });

    const revealItems = root.querySelectorAll('[data-mlb-reveal]');
    if (reduceMotionQuery.matches || !('IntersectionObserver' in window)) {
      revealItems.forEach((item) => item.classList.add('is-visible'));
    } else {
      const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        });
      }, { rootMargin: '0px 0px -9% 0px', threshold: 0.08 });
      revealItems.forEach((item) => revealObserver.observe(item));
    }

    const chapterLinks = Array.from(root.querySelectorAll('.mlb-dossier-link[href^="#MLBChapter"]'));
    const chapters = root.querySelectorAll('[data-mlb-chapter]');
    if (chapterLinks.length && chapters.length && 'IntersectionObserver' in window) {
      const chapterObserver = new IntersectionObserver((entries) => {
        const visibleChapter = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (!visibleChapter) return;
        chapterLinks.forEach((link) => link.classList.toggle('is-current', link.getAttribute('href') === `#${visibleChapter.target.id}`));
      }, { rootMargin: '-25% 0px -58% 0px', threshold: [0.08, 0.25, 0.5] });
      chapters.forEach((chapter) => chapterObserver.observe(chapter));
    }

    let ticking = false;
    function updateReadingProgress() {
      if (!progressBar) return;
      const bounds = root.getBoundingClientRect();
      const total = Math.max(1, bounds.height - window.innerHeight);
      const travelled = Math.min(Math.max(-bounds.top, 0), total);
      progressBar.style.setProperty('--mlb-reading-progress', String(travelled / total));
      ticking = false;
    }

    function onScroll() {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(updateReadingProgress);
    }

    updateReadingProgress();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });

    reduceMotionQuery.addEventListener?.('change', (event) => {
      if (event.matches) revealItems.forEach((item) => item.classList.add('is-visible'));
    });
  }

  function initialiseAll(scope = document) {
    scope.querySelectorAll(ROOT_SELECTOR).forEach(initialiseLivingBook);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => initialiseAll());
  } else {
    initialiseAll();
  }

  document.addEventListener('shopify:section:load', (event) => initialiseAll(event.target));
})();
