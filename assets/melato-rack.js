/* Melato Rack interaction engine. Vanilla JS, no dependencies. */
(function () {
  'use strict';

  var REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function clamp(n, a, b) { return Math.min(b, Math.max(a, n)); }

  function Rack(root) {
    this.root = root;
    this.viewport = root.querySelector('[data-rack-viewport]');
    this.track = root.querySelector('[data-rack-track]');
    if (!this.viewport || !this.track) return;
    this.items = Array.prototype.slice.call(root.querySelectorAll('[data-rack-item]'));
    if (!this.items.length) return;

    this.stage = root.querySelector('[data-rack-stage]');
    this.live = root.querySelector('[data-rack-live]');
    this.pos = 0;          // current translateX (negative = moved left)
    this.target = 0;
    this.centers = [];
    this.active = 0;
    this.raf = null;
    this.drag = null;
    this.openHandle = null;
    this.lastFocus = null;
    this.selectedVariant = null;
    this.data = this.items.map(function (li) {
      var el = li.querySelector('[data-rack-data]');
      try { return JSON.parse(el.textContent); } catch (e) { return null; }
    });

    root.classList.add('mrack--js');
    this.measure();
    this.bind();
    this.snapTo(0, true);
    this.render();
  }

  Rack.prototype.measure = function () {
    var self = this;
    this.vw = this.viewport.clientWidth;
    this.centers = this.items.map(function (li) { return li.offsetLeft + li.offsetWidth / 2; });
    this.minPos = -(this.centers[this.centers.length - 1] - this.vw / 2);
    this.maxPos = -(this.centers[0] - this.vw / 2);
    this.pos = clamp(this.pos, this.minPos, this.maxPos);
    this.target = clamp(this.target, this.minPos, this.maxPos);
    void self;
  };

  Rack.prototype.nearestIndex = function (pos) {
    var best = 0, bestD = Infinity, mid = this.vw / 2;
    for (var i = 0; i < this.centers.length; i++) {
      var d = Math.abs(this.centers[i] + pos - mid);
      if (d < bestD) { bestD = d; best = i; }
    }
    return best;
  };

  Rack.prototype.snapTo = function (i, immediate) {
    i = clamp(i, 0, this.items.length - 1);
    this.target = clamp(-(this.centers[i] - this.vw / 2), this.minPos, this.maxPos);
    if (immediate || REDUCED) { this.pos = this.target; this.render(); } else { this.tick(); }
  };

  Rack.prototype.tick = function () {
    if (this.raf) return;
    var self = this;
    (function step() {
      var diff = self.target - self.pos;
      if (Math.abs(diff) < 0.3) { self.pos = self.target; self.render(); self.raf = null; self.announce(); return; }
      self.pos += diff * 0.14;
      self.render();
      self.raf = requestAnimationFrame(step);
    })();
  };

  Rack.prototype.render = function () {
    this.track.style.transform = 'translate3d(' + this.pos + 'px,0,0)';
    var mid = this.vw / 2;
    for (var i = 0; i < this.items.length; i++) {
      var d = (this.centers[i] + this.pos - mid) / this.vw;   // -1..1 around centre
      var a = Math.min(Math.abs(d), 0.6);
      var scale = 1 - a * 0.28;
      var sway = clamp(-d * 4, -3, 3);                         // slight hanger swing
      var li = this.items[i];
      li.style.transform = 'scale(' + scale.toFixed(3) + ') rotate(' + sway.toFixed(2) + 'deg)';
      li.style.opacity = (1 - a * 0.45).toFixed(2);
      li.style.zIndex = String(100 - Math.round(a * 100));
    }
    this.active = this.nearestIndex(this.pos);
  };

  Rack.prototype.announce = function () {
    var d = this.data[this.active];
    if (this.live && d) this.live.textContent = d.title + ', ' + (this.active + 1) + ' of ' + this.items.length;
  };

  Rack.prototype.bind = function () {
    var self = this, vp = this.viewport, moved = 0;

    vp.addEventListener('pointerdown', function (e) {
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      self.drag = { x: e.clientX, pos: self.pos, last: e.clientX, v: 0, t: performance.now() };
      moved = 0;
    });
    window.addEventListener('pointermove', function (e) {
      if (!self.drag) return;
      var dx = e.clientX - self.drag.x;
      moved = Math.max(moved, Math.abs(dx));
      if (moved > 6) {
        vp.classList.add('is-dragging');
        var now = performance.now();
        self.drag.v = (e.clientX - self.drag.last) / Math.max(1, now - self.drag.t);
        self.drag.last = e.clientX; self.drag.t = now;
        self.pos = clamp(self.drag.pos + dx, self.minPos - 80, self.maxPos + 80);
        self.target = self.pos;
        self.render();
      }
    });
    window.addEventListener('pointerup', function () {
      if (!self.drag) return;
      var v = self.drag.v; self.drag = null;
      vp.classList.remove('is-dragging');
      if (moved > 6) {
        var projected = self.pos + v * 260;                   // inertia
        self.snapTo(self.nearestIndex(clamp(projected, self.minPos, self.maxPos)));
      }
    });

    // Suppress the link click that ends a drag; real clicks open the close-up.
    this.items.forEach(function (li, i) {
      li.querySelector('[data-rack-link]').addEventListener('click', function (e) {
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.button === 1) return; // let new-tab clicks through
        e.preventDefault();
        if (moved > 6) { moved = 0; return; }
        if (i !== self.active) { self.snapTo(i); return; }     // first click centres, second opens
        self.open(i);
      });
    });

    vp.addEventListener('wheel', function (e) {
      var dx = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : 0;
      if (!dx) return;
      e.preventDefault();
      self.target = clamp(self.target - dx, self.minPos, self.maxPos);
      self.tick();
      clearTimeout(self.wheelT);
      self.wheelT = setTimeout(function () { self.snapTo(self.nearestIndex(self.target)); }, 140);
    }, { passive: false });

    vp.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') { e.preventDefault(); self.snapTo(self.active + 1); }
      else if (e.key === 'ArrowLeft') { e.preventDefault(); self.snapTo(self.active - 1); }
      else if (e.key === 'Enter') { e.preventDefault(); self.open(self.active); }
    });

    var prev = this.root.querySelector('[data-rack-prev]'), next = this.root.querySelector('[data-rack-next]');
    if (prev) prev.addEventListener('click', function () { self.snapTo(self.active - 1); });
    if (next) next.addEventListener('click', function () { self.snapTo(self.active + 1); });

    var rt;
    window.addEventListener('resize', function () {
      clearTimeout(rt);
      rt = setTimeout(function () { self.measure(); self.snapTo(self.active, true); }, 120);
    });

    this.bindStage();
  };

  /* ---------------- Close-up ---------------- */

  Rack.prototype.bindStage = function () {
    var self = this, s = this.stage; if (!s) return;
    this.flip = s.querySelector('[data-rack-flip]');
    this.imgFront = s.querySelector('[data-rack-img-front]');
    this.imgBack = s.querySelector('[data-rack-img-back]');
    this.toggle = s.querySelector('[data-rack-toggle]');
    this.drawer = s.querySelector('[data-rack-drawer]');
    this.sizes = s.querySelector('[data-rack-sizes]');
    this.addBtn = s.querySelector('[data-rack-add]');
    this.msg = s.querySelector('[data-rack-msg]');

    s.querySelector('[data-rack-close]').addEventListener('click', function () { self.close(true); });
    s.querySelectorAll('[data-rack-side]').forEach(function (b) {
      b.addEventListener('click', function () { self.setSide(b.getAttribute('data-rack-side')); });
    });
    s.querySelector('[data-rack-avail]').addEventListener('click', function () { self.openDrawer(); });
    s.querySelector('[data-rack-drawer-close]').addEventListener('click', function () { self.closeDrawer(); });
    this.addBtn.addEventListener('click', function () { self.addToCart(); });

    s.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') { if (!self.drawer.hidden) self.closeDrawer(); else self.close(true); }
      if (e.key === 'Tab') self.trapFocus(e);
    });
    window.addEventListener('popstate', function () { if (self.openHandle) self.close(false); });
  };

  Rack.prototype.trapFocus = function (e) {
    var f = this.stage.querySelectorAll('button:not([disabled]), a[href], [tabindex="0"]');
    f = Array.prototype.filter.call(f, function (n) { return n.offsetParent !== null; });
    if (!f.length) return;
    var first = f[0], last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  };

  Rack.prototype.setSide = function (side) {
    var back = side === 'back';
    this.flip.classList.toggle('is-back', back);
    this.stage.querySelectorAll('[data-rack-side]').forEach(function (b) {
      b.setAttribute('aria-pressed', String(b.getAttribute('data-rack-side') === side));
    });
  };

  Rack.prototype.open = function (i) {
    var d = this.data[i]; if (!d || !this.stage) return;
    var s = this.stage;
    this.openHandle = d.handle;
    this.lastFocus = document.activeElement;

    this.imgFront.src = d.front; this.imgFront.alt = d.title;
    if (d.back) { this.imgBack.src = d.back; this.imgBack.alt = d.title + ', back'; this.toggle.hidden = false; }
    else { this.imgBack.removeAttribute('src'); this.toggle.hidden = true; }
    this.setSide('front');
    s.querySelector('[data-rack-name]').textContent = d.title;
    s.querySelector('[data-rack-price]').textContent = d.price;
    s.querySelector('[data-rack-pdp]').href = d.url;
    this.current = d;
    this.closeDrawer(true);

    s.hidden = false;
    document.documentElement.style.overflow = 'hidden';
    requestAnimationFrame(function () { s.classList.add('is-open'); });
    history.pushState({ mrack: d.handle }, '', d.url);
    s.querySelector('[data-rack-close]').focus();
  };

  Rack.prototype.close = function (popHistory) {
    if (!this.openHandle) return;
    var s = this.stage, self = this;
    this.openHandle = null;
    s.classList.remove('is-open');
    var done = function () {
      s.hidden = true;
      document.documentElement.style.overflow = '';
      if (self.lastFocus && self.lastFocus.focus) self.lastFocus.focus();
    };
    if (REDUCED) done(); else setTimeout(done, 350);
    if (popHistory && history.state && history.state.mrack) history.back();
  };

  /* ---------------- Availability + cart ---------------- */

  Rack.prototype.openDrawer = function () {
    var d = this.current; if (!d) return;
    var self = this;
    this.selectedVariant = null;
    this.msg.textContent = '';
    this.addBtn.disabled = true; this.addBtn.textContent = 'Select a size';
    this.drawer.querySelector('[data-rack-drawer-title]').textContent = d.title;
    this.sizes.innerHTML = '';
    d.variants.forEach(function (v) {
      var li = document.createElement('li'), b = document.createElement('button');
      b.type = 'button'; b.textContent = v.title === 'Default Title' ? 'One size' : v.title;
      b.setAttribute('aria-pressed', 'false');
      if (!v.available) { b.disabled = true; b.setAttribute('aria-label', b.textContent + ', sold out'); }
      b.addEventListener('click', function () {
        self.selectedVariant = v;
        self.sizes.querySelectorAll('button').forEach(function (x) { x.setAttribute('aria-pressed', 'false'); });
        b.setAttribute('aria-pressed', 'true');
        self.addBtn.disabled = false; self.addBtn.textContent = 'Add to bag';
      });
      li.appendChild(b); self.sizes.appendChild(li);
    });
    if (!d.variants.some(function (v) { return v.available; })) {
      this.msg.textContent = 'Sold out. Open full details to join the waitlist.';
    }
    this.drawer.hidden = false;
    var dr = this.drawer;
    requestAnimationFrame(function () { dr.classList.add('is-open'); });
    var firstBtn = this.sizes.querySelector('button:not([disabled])');
    (firstBtn || this.drawer.querySelector('[data-rack-drawer-close]')).focus();
  };

  Rack.prototype.closeDrawer = function (silent) {
    if (!this.drawer || this.drawer.hidden) return;
    var dr = this.drawer;
    dr.classList.remove('is-open');
    setTimeout(function () { dr.hidden = true; }, silent || REDUCED ? 0 : 400);
  };

  Rack.prototype.addToCart = function () {
    var v = this.selectedVariant, self = this; if (!v) return;
    this.addBtn.disabled = true; this.msg.textContent = 'Adding…';
    fetch('/cart/add.js', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({ id: v.id, quantity: 1 })
    }).then(function (r) {
      if (!r.ok) throw new Error('add failed');
      return r.json();
    }).then(function () {
      self.msg.innerHTML = 'Added to your bag. <a href="/cart">View bag</a>';
      self.addBtn.disabled = false;
      document.dispatchEvent(new CustomEvent('melato:cart-updated'));
    }).catch(function () {
      self.msg.textContent = 'Could not add this size. Please try again.';
      self.addBtn.disabled = false;
    });
  };

  function init() {
    document.querySelectorAll('[data-melato-rack]').forEach(function (el) {
      if (!el.__mrack) el.__mrack = new Rack(el);
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
  document.addEventListener('shopify:section:load', init);   // theme editor re-render
})();
