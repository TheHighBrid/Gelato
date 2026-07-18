(() => {
  'use strict';

  const ready = (fn) => document.readyState === 'loading'
    ? document.addEventListener('DOMContentLoaded', fn, { once: true })
    : fn();

  ready(() => {
    initCustomCursor();
    initHeaderScroll();
    initLazyBlurImages();
    initSafeAnchorScroll();
    initParallax();
  });

  function initCustomCursor() {
    if (!document.body || window.matchMedia('(pointer: coarse)').matches) return;
    if (document.querySelector('.custom-cursor')) return;

    const cursor = document.createElement('div');
    cursor.className = 'custom-cursor';
    cursor.setAttribute('aria-hidden', 'true');
    document.body.appendChild(cursor);

    document.addEventListener('mousemove', (event) => {
      cursor.style.left = `${event.clientX - 10}px`;
      cursor.style.top = `${event.clientY - 10}px`;
    }, { passive: true });

    document.addEventListener('mouseover', (event) => {
      if (event.target.closest('a, button, .product-card, .custom-cursor-hover')) cursor.classList.add('hover');
    });

    document.addEventListener('mouseout', (event) => {
      if (event.target.closest('a, button, .product-card, .custom-cursor-hover')) cursor.classList.remove('hover');
    });
  }

  function initHeaderScroll() {
    const header = document.querySelector('.site-header, .mxh, [data-mxh]');
    if (!header) return;

    let lastScroll = window.pageYOffset || 0;
    window.addEventListener('scroll', () => {
      const currentScroll = window.pageYOffset || 0;
      if (currentScroll <= 50) {
        header.classList.remove('hidden');
        lastScroll = currentScroll;
        return;
      }
      if (currentScroll > lastScroll) header.classList.add('hidden');
      if (currentScroll < lastScroll) header.classList.remove('hidden');
      lastScroll = currentScroll;
    }, { passive: true });
  }

  function initLazyBlurImages() {
    const lazyImages = Array.from(document.querySelectorAll('img.lazy-img[data-src]'));
    if (!lazyImages.length) return;

    const loadImage = (img) => {
      img.src = img.dataset.src;
      img.onload = () => img.classList.add('loaded');
    };

    if (!('IntersectionObserver' in window)) {
      lazyImages.forEach(loadImage);
      return;
    }

    const imageObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        loadImage(entry.target);
        imageObserver.unobserve(entry.target);
      });
    }, { rootMargin: '200px' });

    lazyImages.forEach((img) => imageObserver.observe(img));
  }

  function initSafeAnchorScroll() {
    document.addEventListener('click', (event) => {
      const anchor = event.target.closest('a[href^="#"]');
      if (!anchor) return;

      const href = anchor.getAttribute('href');
      if (!href || href === '#') return;

      let target = null;
      try { target = document.querySelector(href); } catch (error) { return; }
      if (!target) return;

      event.preventDefault();
      target.scrollIntoView({
        behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
        block: 'start'
      });
    });
  }

  function initParallax() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    window.addEventListener('scroll', () => {
      const scrolled = window.pageYOffset || 0;
      document.querySelectorAll('.parallax[data-speed]').forEach((el) => {
        const speed = Number(el.dataset.speed || 0.5);
        el.style.transform = `translateY(${scrolled * speed}px)`;
      });
    }, { passive: true });
  }
})();
