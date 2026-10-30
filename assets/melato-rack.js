(function () {
  'use strict';
  if (window.MelatoRackAtelier) { window.MelatoRackAtelier.init(); return; }
  var motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  var fine = window.matchMedia('(hover: hover) and (pointer: fine)');
  function clamp(n, a, b) { return Math.min(b, Math.max(a, n)); }
  function Rack(root) {
    this.root = root;
    this.viewport = root.querySelector('[data-rack-viewport]');
    this.track = root.querySelector('[data-rack-track]');
    this.items = Array.from(root.querySelectorAll('[data-rack-item]'));
    if (!this.viewport || !this.track || !this.items.length) return;
    this.data = this.items.map((item) => {
      try { return JSON.parse(item.querySelector('[data-rack-data]').textContent); } catch (_) { return null; }
    });
    this.abort = new AbortController();
    this.pos = 0; this.target = 0; this.active = -1; this.selected = null;
    this.raf = 0; this.edge = 0; this.swing = 0; this.swingV = 0;
    this.visible = true; this.busy = false; this.destroyed = false;
    this.stage = root.querySelector('[data-rack-stage]');
    this.live = root.querySelector('[data-rack-live]');
    this.caption = root.querySelector('[data-rack-caption]');
    this.counter = root.querySelector('[data-rack-counter]');
    this.prev = root.querySelector('[data-rack-prev]');
    this.next = root.querySelector('[data-rack-next]');
    root.classList.add('mrack--js');
    this.measure(); this.snapTo(Math.min(2, this.items.length - 1), true); this.bind(); this.bindStage();
    var self = this;
    this.resize = new ResizeObserver(() => { self.measure(); self.snapTo(Math.max(0, self.active), true); });
    this.resize.observe(this.viewport);
    this.observer = new IntersectionObserver((entries) => {
      self.visible = entries[0].isIntersecting;
      if (!self.visible) self.stop(); else self.tick();
    }, { rootMargin: '100px' });
    this.observer.observe(root);
  }
  Rack.prototype.on = function (node, event, fn, options) {
    if (node) node.addEventListener(event, fn, Object.assign({}, options, { signal: this.abort.signal }));
  };
  Rack.prototype.measure = function () {
    this.vw = this.viewport.clientWidth;
    this.centers = this.items.map((item) => { return item.offsetLeft + item.offsetWidth / 2; });
    this.maxPos = this.vw / 2 - this.centers[0];
    this.minPos = this.vw / 2 - this.centers[this.centers.length - 1];
    this.pos = clamp(this.pos, this.minPos, this.maxPos);
    this.target = clamp(this.target, this.minPos, this.maxPos);
  };
  Rack.prototype.nearest = function (pos) {
    var best = 0, distance = Infinity;
    for (var i = 0; i < this.centers.length; i++) {
      var d = Math.abs(this.centers[i] + pos - this.vw / 2);
      if (d < distance) { best = i; distance = d; }
    }
    return best;
  };
  Rack.prototype.snapTo = function (index, immediate) {
    index = clamp(index, 0, this.items.length - 1);
    this.target = this.vw / 2 - this.centers[index];
    if (immediate || motion.matches) { this.pos = this.target; this.swing = 0; this.render(); }
    else this.tick();
  };
  Rack.prototype.stop = function () { cancelAnimationFrame(this.raf); this.raf = 0; this.edge = 0; this.hover = null; };
  Rack.prototype.tick = function () {
    if (this.raf || this.destroyed || !this.visible || document.hidden || this.selected !== null) return;
    var self = this, last = performance.now();
    function step(now) {
      var dt = clamp((now - last) / 16.667, 0.25, 2); last = now;
      if (motion.matches) { self.pos = self.target; self.swing = 0; self.render(); self.raf = 0; return; }
      if (self.edge) self.target = clamp(self.target + self.edge * 7 * dt, self.minPos, self.maxPos);
      var velocity = (self.target - self.pos) * (1 - Math.pow(0.86, dt));
      self.pos += velocity;
      self.swingV += (-velocity * 0.035 - self.swing * 0.075) * dt;
      self.swingV *= Math.pow(0.82, dt);
      self.swing = clamp(self.swing + self.swingV * dt, -7, 7);
      self.render();
      if (Math.abs(self.target - self.pos) > 0.15 || Math.abs(self.swing) + Math.abs(self.swingV) > 0.025 || self.edge) self.raf = requestAnimationFrame(step);
      else { self.pos = self.target; self.swing = 0; self.render(); self.raf = 0; self.announce(); }
    }
    this.raf = requestAnimationFrame(step);
  };
  Rack.prototype.render = function () {
    this.track.style.transform = 'translate3d(' + this.pos.toFixed(2) + 'px,0,0)';
    for (var i = 0; i < this.items.length; i++) {
      var d = (this.centers[i] + this.pos - this.vw / 2) / Math.min(this.vw, 850);
      var distance = Math.min(Math.abs(d), 1);
      var angle = motion.matches ? 0 : clamp(-d * 82, -58, 58);
      const views = this.data[i]?.angles;
      if (views && views.length) {
        var desired = Math.min(Math.abs(d) * 160, 90);
        const view = views.reduce((best, candidate) => { return Math.abs(candidate.degrees - desired) < Math.abs(best.degrees - desired) ? candidate : best; }, views[0]);
        const image = this.items[i].querySelector('[data-rack-link] img');
        if (image.getAttribute('src') !== view.url) image.src = view.url;
        angle = motion.matches ? 0 : clamp(-d * 12, -8, 8);
      }
      const sway = motion.matches ? 0 : this.swing * (1 - distance * 0.4);
      this.items[i].style.transform = 'perspective(1100px) rotateY(' + angle.toFixed(2) + 'deg) rotateZ(' + sway.toFixed(2) + 'deg) scale(' + (1 - distance * 0.12).toFixed(3) + ')';
      this.items[i].style.zIndex = String(100 - Math.round(distance * 80));
      this.items[i].style.setProperty('--mrack-depth', (1 - distance * 0.22).toFixed(3));
    }
    var active = this.nearest(this.pos);
    if (active !== this.active) {
      this.active = active;
      this.items.forEach((item, index) => { item.classList.toggle('is-active', index === active); });
      const data = this.data[active];
      if (this.caption && data) this.caption.textContent = data.title + ' / ' + data.price;
      if (this.counter) this.counter.textContent = String(active + 1).padStart(2, '0') + ' / ' + String(this.items.length).padStart(2, '0');
      if (this.prev) this.prev.disabled = active === 0;
      if (this.next) this.next.disabled = active === this.items.length - 1;
    }
  };
  Rack.prototype.announce = function () {
    if (this.live && this.data[this.active]) this.live.textContent = this.data[this.active].title + ', ' + (this.active + 1) + ' of ' + this.items.length;
  };
  Rack.prototype.bind = function () {
    var self = this, vp = this.viewport;
    this.on(vp, 'pointerenter', (e) => {
      if (e.pointerType === 'mouse' && fine.matches && !motion.matches) self.hover = { x: e.clientX, pos: self.target };
    });
    this.on(vp, 'pointerdown', (e) => {
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      self.suppressClick = false; self.hover = null; self.edge = 0;
      self.drag = { id: e.pointerId, x: e.clientX, y: e.clientY, pos: self.pos, last: e.clientX, time: performance.now(), velocity: 0, moved: false };
    });
    this.on(window, 'pointermove', (e) => {
      if (!self.drag || self.drag.id !== e.pointerId) return;
      var drag = self.drag, dx = e.clientX - drag.x, dy = e.clientY - drag.y;
      if (!drag.moved && Math.abs(dy) > Math.abs(dx) && Math.abs(dy) > 8) { self.drag = null; return; }
      if (Math.abs(dx) > 7) {
        if (!drag.moved) { drag.moved = true; vp.setPointerCapture(e.pointerId); vp.classList.add('is-dragging'); }
        var now = performance.now();
        drag.velocity = (e.clientX - drag.last) / Math.max(1, now - drag.time);
        drag.last = e.clientX; drag.time = now;
        self.target = clamp(drag.pos + dx, self.minPos, self.maxPos); self.tick();
      }
    });
    function release(e) {
      if (!self.drag || self.drag.id !== e.pointerId) return;
      var drag = self.drag; self.drag = null;
      if (vp.hasPointerCapture(e.pointerId)) vp.releasePointerCapture(e.pointerId);
      vp.classList.remove('is-dragging'); self.suppressClick = drag.moved;
      var v = performance.now() - drag.time < 120 ? drag.velocity : 0;
      if (drag.moved) self.snapTo(self.nearest(clamp(self.target + v * 140, self.minPos, self.maxPos)));
    }
    this.on(window, 'pointerup', release); this.on(window, 'pointercancel', release);
    this.on(vp, 'pointermove', (e) => {
      if (self.drag || !self.hover || e.pointerType !== 'mouse' || motion.matches || self.selected !== null) return;
      var bounds = vp.getBoundingClientRect(), x = (e.clientX - bounds.left) / bounds.width;
      self.target = clamp(self.hover.pos + (e.clientX - self.hover.x) * 1.8, self.minPos, self.maxPos);
      self.edge = x < 0.17 ? (0.17 - x) / 0.17 : x > 0.83 ? -(x - 0.83) / 0.17 : 0;
      self.tick();
    });
    this.on(vp, 'pointerleave', () => { self.hover = null; self.edge = 0; if (!self.drag) self.snapTo(self.nearest(self.target)); });
    this.items.forEach((item, index) => {
      self.on(item.querySelector('[data-rack-link]'), 'click', (e) => {
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
        e.preventDefault();
        if (self.suppressClick) { self.suppressClick = false; return; }
        self.open(index);
      });
      self.on(item.querySelector('[data-rack-link]'), 'focus', () => { if (self.selected === null) self.snapTo(index); });
    });
    this.on(vp, 'wheel', (e) => {
      if (Math.abs(e.deltaX) <= Math.abs(e.deltaY) || !e.deltaX) return;
      var multiplier = e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? self.vw : 1;
      var next = clamp(self.target - e.deltaX * multiplier, self.minPos, self.maxPos);
      if (next === self.target) return;
      e.preventDefault(); self.hover = null; self.edge = 0; self.target = next; self.tick();
      clearTimeout(self.wheelTimer);
      self.wheelTimer = setTimeout(() => { self.snapTo(self.nearest(self.target)); }, 150);
    }, { passive: false });
    this.on(vp, 'keydown', (e) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowLeft' || e.key === 'Home' || e.key === 'End') {
        e.preventDefault(); self.hover = null; self.edge = 0;
        var index = e.key === 'Home' ? 0 : e.key === 'End' ? self.items.length - 1 : self.nearest(self.target) + (e.key === 'ArrowRight' ? 1 : -1);
        self.snapTo(index);
        var activeLink = self.items[clamp(index, 0, self.items.length - 1)].querySelector('[data-rack-link]');
        if (activeLink && activeLink !== e.target) activeLink.focus({ preventScroll: true });
      } else if (e.key === 'Enter' && e.target === vp) { e.preventDefault(); self.open(self.active); }
    });
    this.on(this.prev, 'click', () => { self.snapTo(self.nearest(self.target) - 1); });
    this.on(this.next, 'click', () => { self.snapTo(self.nearest(self.target) + 1); });
    this.on(document, 'visibilitychange', () => { if (document.hidden) self.stop(); else self.tick(); });
    this.on(motion, 'change', () => { self.stop(); self.snapTo(self.active, true); });
  };
  Rack.prototype.bindStage = function () {
    var self = this, s = this.stage;
    if (!s) return;
    this.art = s.querySelector('[data-rack-art]');
    this.flip = s.querySelector('[data-rack-flip]');
    this.imgFront = s.querySelector('[data-rack-img-front]');
    this.imgBack = s.querySelector('[data-rack-img-back]');
    this.drawer = s.querySelector('[data-rack-drawer]');
    this.sizes = s.querySelector('[data-rack-sizes]');
    this.addBtn = s.querySelector('[data-rack-add]');
    this.msg = s.querySelector('[data-rack-msg]');
    this.turn = s.querySelector('[data-rack-turn]');
    this.on(s.querySelector('[data-rack-close]'), 'click', () => { self.close(); });
    this.on(s, 'cancel', (e) => { e.preventDefault(); self.close(); });
    this.on(s.querySelector('[data-rack-stage-prev]'), 'click', () => { self.change(-1); });
    this.on(s.querySelector('[data-rack-stage-next]'), 'click', () => { self.change(1); });
    this.on(this.turn, 'input', () => { self.setTurn(Number(self.turn.value)); });
    s.querySelectorAll('[data-rack-side]').forEach((b) => { self.on(b, 'click', () => { self.setTurn(b.dataset.rackSide === 'back' ? 180 : b.dataset.rackSide === 'angle' ? 32 : 0); }); });
    this.on(s.querySelector('[data-rack-zoom]'), 'click', (e) => {
      var zoom = self.art.classList.toggle('is-zoomed'); e.currentTarget.setAttribute('aria-pressed', String(zoom));
    });
    this.on(this.art, 'pointerdown', (e) => {
      if (e.button !== 0 || self.busy) return;
      self.turnDrag = { id: e.pointerId, x: e.clientX, rotation: self.rotation };
      self.art.setPointerCapture(e.pointerId); self.art.classList.add('is-turning');
    });
    this.on(this.art, 'pointermove', (e) => {
      if (!self.turnDrag || self.turnDrag.id !== e.pointerId) return;
      self.setTurn(clamp(self.turnDrag.rotation + (e.clientX - self.turnDrag.x) * 0.65, Number(self.turn.min), Number(self.turn.max)));
    });
    function endTurn(e) { if (!self.turnDrag || self.turnDrag.id !== e.pointerId) return; self.turnDrag = null; self.art.classList.remove('is-turning'); if (self.art.hasPointerCapture(e.pointerId)) self.art.releasePointerCapture(e.pointerId); }
    this.on(this.art, 'pointerup', endTurn); this.on(this.art, 'pointercancel', endTurn);
    this.on(s.querySelector('[data-rack-avail]'), 'click', () => { self.openDrawer(); });
    this.on(s.querySelector('[data-rack-drawer-close]'), 'click', () => { self.closeDrawer(); });
    this.on(this.addBtn, 'click', () => { self.addToCart(); });
    this.on(s, 'keydown', (e) => {
      if (e.key === 'Escape') { e.preventDefault(); if (!self.drawer.hidden) self.closeDrawer(); else self.close(); }
      if (e.key === 'Tab' && !self.drawer.hidden) self.trapDrawer(e);
    });
  };
  Rack.prototype.setTurn = function (degrees) {
    this.rotation = degrees; this.turn.value = degrees;
    var views = this.current && this.current.angles;
    if (views && views.length) {
      var nearest = views.reduce((best, view) => { return Math.abs(view.degrees - degrees) < Math.abs(best.degrees - degrees) ? view : best; }, views[0]);
      if (this.imgFront.getAttribute('src') !== nearest.url) this.imgFront.src = nearest.url;
      this.imgFront.alt = this.current.title + ', ' + nearest.degrees + ' degree view';
      this.flip.style.setProperty('--mrack-turn', clamp(degrees - nearest.degrees, -8, 8) + 'deg');
    }
    if (!views || !views.length) this.flip.style.setProperty('--mrack-turn', degrees + 'deg');
    this.stage.querySelectorAll('[data-rack-side]').forEach((b) => {
      var value = b.dataset.rackSide === 'back' ? 180 : b.dataset.rackSide === 'angle' ? 32 : 0;
      b.setAttribute('aria-pressed', String(Math.abs(degrees - value) < 1));
    });
  };
  Rack.prototype.makeSpace = async function (index, returning) {
    this.root.classList.toggle('is-inspecting', !returning);
    var distance = Math.min(this.items[index].offsetWidth * 0.25, 90);
    this.items.forEach((item, i) => {
      item.style.translate = returning || i === index ? '0px' : (i < index ? -distance : distance) + 'px';
    });
    if (!motion.matches) await new Promise((resolve) => { setTimeout(resolve, returning ? 380 : 240); });
  };
  Rack.prototype.travel = function (from, to, returning) {
    if (motion.matches || !this.art.animate || !from.width || !to.width) return Promise.resolve();
    var dx = from.left + from.width / 2 - to.left - to.width / 2;
    var dy = from.top - to.top, scale = from.width / to.width;
    var frames = [
      { transform: 'translate(' + dx + 'px,' + dy + 'px) scale(' + scale + ')', offset: 0 },
      { transform: 'translate(' + dx + 'px,' + (dy - 28) + 'px) scale(' + scale + ') rotate(-1.5deg)', offset: 0.22 },
      { transform: 'translate(' + dx * 0.28 + 'px,' + (dy * 0.28 - 18) + 'px) scale(' + (scale + (1 - scale) * 0.72) + ') rotate(1deg)', offset: 0.7 },
      { transform: 'none', offset: 1 }
    ];
    this.stage.classList.add('is-travelling');
    this.animation = this.art.animate(frames, { duration: 900, direction: returning ? 'reverse' : 'normal', easing: 'cubic-bezier(.25,.1,.25,1)', fill: 'both' });
    var animation = this.animation, stage = this.stage;
    return animation.finished.catch(() => {}).then(() => { animation.cancel(); stage.classList.remove('is-travelling'); });
  };
  Rack.prototype.open = async function (index, switching) {
    if (this.busy || this.selected !== null || !this.data[index] || !this.stage) return;
    this.busy = true; this.stop(); this.drag = null;
    var data = this.data[index], source = this.items[index];
    this.lastFocus = switching ? source.querySelector('[data-rack-link]') : document.activeElement;
    this.snapTo(index);
    if (!motion.matches) await new Promise((resolve) => { setTimeout(resolve, 320); });
    this.stop(); this.pos = this.target; this.render();
    await this.makeSpace(index, false);
    if (this.destroyed) return;
    var from = source.querySelector('[data-rack-link]').getBoundingClientRect();
    this.selected = index; this.current = data;
    this.stage.classList.toggle('has-baked-hanger', !!data.bakedHanger);
    this.stage.classList.toggle('has-angle-views', !!(data.angles && data.angles.length));
    if (data.angles) data.angles.forEach((view) => { var img = new Image(); img.src = view.url; });
    this.stage.setAttribute('aria-label', data.title);
    this.imgFront.src = data.front; this.imgFront.alt = data.title + ', front';
    this.imgBack.hidden = !data.back;
    if (data.back) { this.imgBack.src = data.back; this.imgBack.alt = data.title + ', back'; } else this.imgBack.removeAttribute('src');
    // Use the authenticated back photograph as the terminal 180-degree view,
    // even when intermediate angle photographs are configured.
    if (data.back && data.angles && data.angles.length && !data.angles.some((view) => view.degrees === 180)) {
      data.angles = [...data.angles, { degrees: 180, url: data.back }].sort((a, b) => a.degrees - b.degrees);
    }
    this.stage.querySelector('[data-rack-side="back"]').hidden = !data.back;
    this.turn.min = data.angles && data.angles.length ? data.angles[0].degrees : data.back ? 0 : -35; this.turn.max = data.angles && data.angles.length ? data.angles[data.angles.length - 1].degrees : data.back ? 180 : 35;
    this.setTurn(0); this.art.classList.remove('is-zoomed');
    this.stage.querySelector('[data-rack-zoom]').setAttribute('aria-pressed', 'false');
    this.stage.querySelector('[data-rack-name]').textContent = data.title;
    this.stage.querySelector('[data-rack-price]').textContent = data.price;
    this.stage.querySelector('[data-rack-pdp]').href = data.url;
    this.stage.querySelector('[data-rack-stage-count]').textContent = (index + 1) + ' / ' + this.items.length;
    this.stage.querySelector('[data-rack-stage-prev]').disabled = index === 0;
    this.stage.querySelector('[data-rack-stage-next]').disabled = index === this.items.length - 1;
    this.closeDrawer(true); this.art.style.visibility = 'hidden'; this.stage.hidden = false;
    this.previousOverflow = document.documentElement.style.overflow;
    document.documentElement.style.overflow = 'hidden';
    this.stage.showModal(); this.stage.classList.add('is-open');
    source.classList.add('is-picked');
    try { await Promise.race([this.imgFront.decode().catch(() => {}), new Promise((resolve) => { setTimeout(resolve, 500); })]); } catch (_) {}
    if (this.destroyed) return;
    this.art.style.visibility = '';
    await this.travel(from, this.art.getBoundingClientRect(), false);
    this.busy = false;
    this.stage.querySelector('[data-rack-close]').focus({ preventScroll: true });
  };
  Rack.prototype.close = async function (switching) {
    if (this.selected === null || this.busy) return;
    this.busy = true;
    var index = this.selected, source = this.items[index];
    this.closeDrawer(true); this.setTurn(0); this.art.classList.remove('is-zoomed');
    await this.travel(source.querySelector('[data-rack-link]').getBoundingClientRect(), this.art.getBoundingClientRect(), true);
    this.stage.classList.remove('is-open'); this.stage.close(); this.stage.hidden = true;
    source.classList.remove('is-picked'); this.selected = null;
    document.documentElement.style.overflow = this.previousOverflow;
    await this.makeSpace(index, true);
    this.busy = false;
    if (!switching && this.lastFocus && this.lastFocus.isConnected) this.lastFocus.focus({ preventScroll: true });
    return true;
  };
  Rack.prototype.change = async function (direction) {
    if (this.busy || this.selected === null) return;
    var next = this.selected + direction;
    if (next < 0 || next >= this.items.length) return;
    await this.close(true);
    await this.open(next, true);
  };
  Rack.prototype.trapDrawer = function (e) {
    var nodes = Array.from(this.drawer.querySelectorAll('button:not(:disabled),a[href]')).filter((n) => { return n.getClientRects().length; });
    var first = nodes[0], last = nodes[nodes.length - 1];
    if (!nodes.includes(document.activeElement)) { e.preventDefault(); first.focus(); }
    else if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  };
  Rack.prototype.openDrawer = function () {
    var self = this, data = this.current; if (!data) return;
    this.selectedVariant = null; this.msg.textContent = ''; this.addBtn.disabled = true; this.addBtn.textContent = this.addBtn.dataset.selectLabel;
    this.drawer.querySelector('[data-rack-drawer-title]').textContent = data.title;
    this.sizes.replaceChildren();
    data.variants.forEach((variant) => {
      var li = document.createElement('li'), button = document.createElement('button');
      button.type = 'button'; button.textContent = variant.title === 'Default Title' ? 'ONE SIZE' : variant.title;
      button.setAttribute('aria-pressed', 'false'); button.disabled = !variant.available;
      if (!variant.available) button.setAttribute('aria-label', button.textContent + ', sold out');
      button.addEventListener('click', () => {
        self.selectedVariant = variant;
        self.sizes.querySelectorAll('button').forEach((b) => { b.setAttribute('aria-pressed', String(b === button)); });
        self.addBtn.disabled = false; self.addBtn.textContent = self.addBtn.dataset.addLabel;
      });
      li.appendChild(button); self.sizes.appendChild(li);
    });
    this.drawer.hidden = false;
    this.stage.querySelector('[data-rack-stage-body]').inert = true;
    this.stage.querySelector('[data-rack-close]').inert = true;
    (this.sizes.querySelector('button:not(:disabled)') || this.drawer.querySelector('[data-rack-drawer-close]')).focus();
  };
  Rack.prototype.closeDrawer = function (silent) {
    if (!this.drawer) return;
    var wasOpen = !this.drawer.hidden; this.drawer.hidden = true;
    this.stage.querySelector('[data-rack-stage-body]').inert = false;
    this.stage.querySelector('[data-rack-close]').inert = false;
    if (wasOpen && !silent) this.stage.querySelector('[data-rack-avail]').focus();
  };
  Rack.prototype.addToCart = async function () {
    if (!this.selectedVariant || this.pendingCart) return;
    this.pendingCart = true; this.addBtn.disabled = true; this.msg.textContent = this.msg.dataset.adding;
    var self = this;
    try {
      var base = (window.Shopify && window.Shopify.routes && window.Shopify.routes.root) || '/';
      var response = await fetch(base + 'cart/add.js', { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify({ id: this.selectedVariant.id, quantity: 1 }) });
      if (!response.ok) throw new Error('cart');
      await response.json(); this.msg.textContent = this.msg.dataset.added + ' ';
      var link = document.createElement('a'); link.href = base + 'cart'; link.textContent = this.msg.dataset.bag; this.msg.appendChild(link);
      document.dispatchEvent(new CustomEvent('melato:cart-updated'));
    } catch (_) { this.msg.textContent = this.msg.dataset.error; }
    finally { self.pendingCart = false; self.addBtn.disabled = false; }
  };
  Rack.prototype.destroy = function () {
    this.destroyed = true; this.stop(); this.abort.abort(); this.resize.disconnect(); this.observer.disconnect(); clearTimeout(this.wheelTimer);
    if (this.animation) this.animation.cancel();
    if (this.stage && this.stage.open) { this.stage.close(); document.documentElement.style.overflow = this.previousOverflow; }
    delete this.root.__mrack;
  };
  function init() { document.querySelectorAll('[data-melato-rack]').forEach((root) => { if (root.__mrack) return; const rack = new Rack(root); if (rack.abort) root.__mrack = rack; }); }
  window.MelatoRackAtelier = { init: init };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
  document.addEventListener('shopify:section:load', init);
  document.addEventListener('shopify:section:unload', (event) => { event.target.querySelectorAll('[data-melato-rack]').forEach((root) => { if (root.__mrack) root.__mrack.destroy(); }); });
})();
