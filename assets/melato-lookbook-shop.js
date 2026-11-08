(() => {
  'use strict';
  const mounted = new WeakMap();
  function mount(root) {
    if (mounted.has(root)) return;
    const controller = new AbortController();
    mounted.set(root, controller);
    const signal = controller.signal;
    const on = (target, type, fn) => target.addEventListener(type, fn, { signal });
    const frames = [...root.querySelectorAll('[data-tll-frame]')];
    if (!frames.length) return;
    const strings = JSON.parse(root.querySelector('[data-tll-strings]').textContent);
    const shop = root.querySelector('[data-tll-dialog]');
    const index = root.querySelector('[data-tll-index-dialog]');
    const dialogs = [shop, index];
    const prev = root.querySelector('[data-tll-prev]');
    const next = root.querySelector('[data-tll-next]');
    const progress = root.querySelector('[data-tll-progress]');
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    const route = window.Shopify?.routes?.root || '/';
    let current = 0;
    let opener = null;
    const select = n => {
      current = n;
      root.querySelector('[data-tll-current]').textContent = frames[n].dataset.tllFrame;
      root.querySelector('[data-tll-current-title]').textContent = frames[n].querySelector('h2').textContent;
      progress.setAttribute('aria-valuenow', String(n + 1));
      progress.style.setProperty('--progress', (n + 1) / frames.length);
      prev.disabled = n === 0;
      next.disabled = n === frames.length - 1;
      index.querySelectorAll('li a').forEach((a, i) => {
        if (i === n) a.setAttribute('aria-current', 'true');
        else a.removeAttribute('aria-current');
      });
    };
    const jump = n => {
      if (n < 0 || n >= frames.length) return;
      select(n);
      frames[n].scrollIntoView({ behavior: reduced.matches ? 'instant' : 'smooth', block: 'start' });
      history.replaceState(null, '', '#' + frames[n].id);
    };
    const canDialog = typeof shop.showModal === 'function';
    function show(dialog, button) {
      opener = button;
      dialog.showModal();
    }
    dialogs.forEach(dialog => {
      on(dialog, 'click', e => {
        if (e.target.closest('[data-tll-close]')) dialog.close();
        if (e.target === dialog) {
          const rect = dialog.getBoundingClientRect();
          if (e.clientX < rect.left || e.clientX > rect.right || e.clientY < rect.top || e.clientY > rect.bottom) dialog.close();
        }
      });
      on(dialog, 'close', () => { if (opener?.isConnected) opener.focus({ preventScroll: true }); });
    });
    if (canDialog) {
      const indexButton = root.querySelector('[data-tll-index]');
      indexButton.hidden = false;
      on(indexButton, 'click', () => show(index, indexButton));
      on(index, 'click', e => {
        const link = e.target.closest('a[href^="#frame-"]');
        if (!link) return;
        e.preventDefault();
        index.close();
        const n = frames.findIndex(f => '#' + f.id === link.getAttribute('href'));
        jump(n);
        frames[n].setAttribute('tabindex', '-1');
        frames[n].focus({ preventScroll: true });
      });
      root.querySelectorAll('[data-tll-shopping] summary').forEach(summary => {
        on(summary, 'click', e => {
          e.preventDefault();
          const frame = summary.closest('[data-tll-frame]');
          shop.querySelector('[data-tll-dialog-frame]').textContent = frame.querySelector('.tll-eyebrow').textContent;
          shop.querySelector('[data-tll-dialog-content]').replaceChildren(...[...frame.querySelector('[data-tll-products]').children].map(el => el.cloneNode(true)));
          show(shop, summary);
        });
      });
    }
    root.querySelector('[data-tll-nav]').hidden = false;
    on(prev, 'click', () => jump(current - 1));
    on(next, 'click', () => jump(current + 1));
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver(entries => {
        const visible = entries.filter(entry => entry.isIntersecting);
        if (visible.length) select(frames.indexOf(visible[visible.length - 1].target));
      }, { rootMargin: '-20% 0px -50% 0px', threshold: 0 });
      frames.forEach(frame => observer.observe(frame));
      signal.addEventListener('abort', () => observer.disconnect());
    }
    const fromHash = frames.findIndex(frame => '#' + frame.id === location.hash);
    select(Math.max(0, fromHash));
    on(window, 'hashchange', () => {
      const n = frames.findIndex(frame => '#' + frame.id === location.hash);
      if (n >= 0) select(n);
    });
    on(root, 'change', e => {
      if (!e.target.matches('[data-tll-product-form] select')) return;
      const price = e.target.selectedOptions[0]?.dataset.price;
      if (price) e.target.closest('.tll-product').querySelector('[data-tll-price]').textContent = price;
    });
    on(root, 'submit', async e => {
      const form = e.target.closest('[data-tll-product-form]');
      if (!form || !window.fetch) return;
      e.preventDefault();
      if (form.dataset.busy === 'true' || !form.reportValidity()) return;
      const option = form.elements.id.selectedOptions[0];
      if (!option?.value || option.disabled) return;
      const button = form.querySelector('button[type="submit"]');
      const status = form.querySelector('[data-tll-status]');
      const label = button.textContent;
      form.dataset.busy = 'true';
      form.setAttribute('aria-busy', 'true');
      button.disabled = true;
      button.textContent = strings.adding;
      status.textContent = '';
      try {
        const response = await fetch(route + 'cart/add.js', {
          method: 'POST', credentials: 'same-origin',
          headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
          body: JSON.stringify({ items: [{ id: Number(option.value), quantity: 1 }] })
        });
        if (!response.ok) throw new Error('Cart rejected the item');
        await response.json();
        status.textContent = strings.added;
        root.querySelector('[data-tll-live]').textContent = strings.added;
        try {
          const result = await fetch(route + 'cart.js', { credentials: 'same-origin', headers: { Accept: 'application/json' } });
          if (result.ok) {
            const cart = await result.json();
            window.dispatchEvent(new CustomEvent('cart:updated', { detail: { cart } }));
            root.querySelectorAll('[data-tll-bag-count]').forEach(el => { el.textContent = cart.item_count; });
          }
        } catch (_) { /* Adding succeeded; a count refresh must never encourage a duplicate retry. */ }
      } catch (_) {
        status.textContent = strings.error;
      } finally {
        form.dataset.busy = 'false';
        form.removeAttribute('aria-busy');
        button.disabled = false;
        button.textContent = label;
      }
    });
    root.querySelectorAll('.tll-image>img').forEach(img => {
      const fail = () => {
        if (img.dataset.failed) return;
        img.dataset.failed = 'true';
        img.hidden = true;
        const note = document.createElement('p');
        note.className = 'tll-image-error';
        note.textContent = strings.imageError;
        img.parentElement.append(note);
      };
      on(img, 'error', fail);
      if (img.complete && img.naturalWidth === 0) fail();
    });
  }
  const start = () => document.querySelectorAll('[data-tll]').forEach(mount);
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true });
  else start();
  document.addEventListener('shopify:section:load', start);
  document.addEventListener('shopify:section:unload', e => e.target.querySelectorAll('[data-tll]').forEach(root => { mounted.get(root)?.abort(); mounted.delete(root); }));
})();
