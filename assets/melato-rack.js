(function () {
  'use strict';
  if (window.MelatoRackAtelier) { window.MelatoRackAtelier.init(); return; }
  var motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  var fine = window.matchMedia('(hover: hover) and (pointer: fine)');
  function clamp(n, a, b) { return Math.min(b, Math.max(a, n)); }
  function lerp(a, b, t) { return a + (b - a) * t; }

  function Rack(root) {
    this.root = root;
    this.viewport = root.querySelector('[data-rack-viewport]');
    this.track = root.querySelector('[data-rack-track]');
    this.items = Array.from(root.querySelectorAll('[data-rack-item]'));
    if (!this.viewport || !this.track || !this.items.length) return;
    this.data = this.items.map(function (item) {
      try { return JSON.parse(item.querySelector('[data-rack-data]').textContent); } catch (_) { return null; }
    });
    this.abort = new AbortController();
    this.pos = 0; this.target = 0; this.active = -1; this.selected = null;
    this.raf = 0; this.stageRaf = 0; this.edge = 0; this.swing = 0; this.swingV = 0;
    this.lastVelocity = 0; this.clock = 0;
    this.visible = true; this.busy = false; this.destroyed = false;
    this.isOpenView = false; this.openStageIndex = 0;
    this.imageCache = Object.create(null);
    this.clothStates = this.items.map(function (_, i) {
      return {
        swing: 0,
        swingV: 0,
        drape: 0,
        drapeV: 0,
        twist: 0,
        twistV: 0,
        wave: 0,
        phase: i * 0.55
      };
    });
    this.stageCloth = { swing: 0, swingV: 0, drape: 0, drapeV: 0, twist: 0, wave: 0, phase: 0 };
    this.stage = root.querySelector('[data-rack-stage]');
    this.live = root.querySelector('[data-rack-live]');
    this.caption = root.querySelector('[data-rack-caption]');
    this.counter = root.querySelector('[data-rack-counter]');
    this.prev = root.querySelector('[data-rack-prev]');
    this.next = root.querySelector('[data-rack-next]');
    root.classList.add('mrack--js');
    this.preloadWarm();
    this.measure(); this.snapTo(Math.min(2, this.items.length - 1), true); this.bind(); this.bindStage();
    var self = this;
    this.resize = new ResizeObserver(function () { self.measure(); self.snapTo(Math.max(0, self.active), true); });
    this.resize.observe(this.viewport);
    this.observer = new IntersectionObserver(function (entries) {
      self.visible = entries[0].isIntersecting;
      if (!self.visible) self.stop(); else self.tick();
    }, { rootMargin: '100px' });
    this.observer.observe(root);
  }

  Rack.prototype.on = function (node, event, fn, options) {
    if (node) node.addEventListener(event, fn, Object.assign({}, options, { signal: this.abort.signal }));
  };

  Rack.prototype.getImage = function (url) {
    if (!url) return null;
    var cached = this.imageCache[url];
    if (cached) return cached;
    var self = this;
    var img = new Image();
    img.decoding = 'async';
    img.onload = function () {
      if (self.destroyed) return;
      if (self.selected !== null) self.renderStageCloth();
      else if (!self.raf) self.render();
    };
    img.src = url;
    this.imageCache[url] = img;
    return img;
  };

  Rack.prototype.preloadWarm = function () {
    var self = this;
    this.data.forEach(function (entry, idx) {
      if (!entry) return;
      if (idx < 6 && entry.front) self.getImage(entry.front);
      if (idx < 5 && entry.angles && entry.angles.length) {
        entry.angles.forEach(function (view) {
          if (view.degrees <= 90 || view.degrees >= 270) self.getImage(view.url);
        });
      }
    });
  };

  Rack.prototype.preloadProduct = function (data) {
    if (!data) return;
    var self = this;
    if (data.front) this.getImage(data.front);
    if (data.back) this.getImage(data.back);
    if (data.angles) data.angles.forEach(function (view) { self.getImage(view.url); });
    if (data.openViews) data.openViews.forEach(function (view) { self.getImage(view.url); });
  };

  Rack.prototype.hasFullCircle = function (views) {
    return !!(views && views.length && views[views.length - 1].degrees >= 270);
  };

  Rack.prototype.resolveAngleBracket = function (views, rawDegrees) {
    if (!views || !views.length) return null;
    var fullCircle = this.hasFullCircle(views);
    var candidates = views.map(function (v) { return { degrees: Number(v.degrees), baseDegrees: Number(v.degrees), url: v.url }; });
    var deg = Number(rawDegrees) || 0;
    if (fullCircle) {
      deg = ((deg % 360) + 360) % 360;
      if (candidates[0].degrees === 0) {
        candidates.push({ degrees: 360, baseDegrees: 0, url: candidates[0].url });
      }
    } else {
      deg = clamp(Math.abs(deg), candidates[0].degrees, candidates[candidates.length - 1].degrees);
    }
    var nearest = candidates.reduce(function (best, candidate) {
      return Math.abs(candidate.degrees - deg) < Math.abs(best.degrees - deg) ? candidate : best;
    }, candidates[0]);
    var lower = candidates[0], upper = candidates[candidates.length - 1];
    for (var i = 0; i < candidates.length - 1; i++) {
      if (deg >= candidates[i].degrees && deg <= candidates[i + 1].degrees) {
        lower = candidates[i];
        upper = candidates[i + 1];
        break;
      }
    }
    var span = Math.max(1, upper.degrees - lower.degrees);
    var t = clamp((deg - lower.degrees) / span, 0, 1);
    var secondary = nearest.url === lower.url ? upper : lower;
    var blend = nearest.url === secondary.url ? 0 : (1 - Math.abs(t - 0.5) * 2) * 0.46;
    return {
      nearest: nearest,
      secondary: secondary,
      blend: blend,
      residual: clamp(deg - nearest.degrees, -8, 8)
    };
  };

  Rack.prototype.drawCloth = function (canvas, container, primaryUrl, secondaryUrl, blendAlpha, state) {
    if (!canvas || !container || typeof canvas.getContext !== 'function' || motion.matches) {
      if (container) container.classList.remove('has-cloth-mesh');
      return false;
    }
    var primaryImg = this.getImage(primaryUrl);
    if (!primaryImg || !primaryImg.complete || !primaryImg.naturalWidth) {
      container.classList.remove('has-cloth-mesh');
      return false;
    }
    var ctx;
    try { ctx = canvas.getContext('2d'); } catch (_) { ctx = null; }
    if (!ctx) {
      container.classList.remove('has-cloth-mesh');
      return false;
    }
    var secondaryImg = (secondaryUrl && blendAlpha > 0.02) ? this.getImage(secondaryUrl) : null;
    if (secondaryImg && (!secondaryImg.complete || !secondaryImg.naturalWidth)) secondaryImg = null;

    var cw = canvas.width || 560;
    var ch = canvas.height || 700;
    var sw = primaryImg.naturalWidth;
    var sh = primaryImg.naturalHeight;
    ctx.clearRect(0, 0, cw, ch);

    var strips = 28;
    var swing = state ? state.swing : 0;
    var drape = state ? state.drape : 0;
    var twist = state ? state.twist : 0;
    var wave = state ? state.wave : 0;
    var phase = state ? state.phase : 0;

    for (var s = 0; s < strips; s++) {
      var t0 = s / strips;
      var t1 = (s + 1) / strips;
      var tm = (t0 + t1) * 0.5;
      var u = tm <= 0.13 ? 0 : (tm - 0.13) / 0.87;
      var uPow = Math.pow(u, 1.38);
      var uDrape = Math.pow(u, 2.08);
      var ripple = Math.sin(u * Math.PI * 1.85 - phase) * wave * Math.pow(u, 1.35);
      var dx = (uPow * swing * 2.15 + uDrape * drape * 2.85 + ripple) * (cw / 560);
      var dy = -Math.pow(u, 1.75) * Math.min(7.5, Math.abs(swing) * 0.16 + Math.abs(drape) * 0.22) * (ch / 700);
      var pleat = 1 - Math.min(0.055, Math.abs(twist) * 0.0011 * Math.pow(u, 1.1)) + Math.sin(u * Math.PI * 2.2 - phase) * (drape * 0.0022 * u);
      var dw = cw * pleat;
      var destX = (cw - dw) * 0.5 + dx;
      var destY = t0 * ch + dy;
      var destH = (t1 - t0) * ch + 0.9;

      var sy = t0 * sh;
      var sHeight = (t1 - t0) * sh + 0.8;

      ctx.globalAlpha = 1;
      ctx.drawImage(primaryImg, 0, sy, sw, sHeight, destX, destY, dw, destH);
      if (secondaryImg) {
        ctx.globalAlpha = clamp(blendAlpha, 0, 0.55);
        ctx.drawImage(
          secondaryImg,
          0,
          t0 * secondaryImg.naturalHeight,
          secondaryImg.naturalWidth,
          (t1 - t0) * secondaryImg.naturalHeight + 0.8,
          destX,
          destY,
          dw,
          destH
        );
      }
    }
    ctx.globalAlpha = 1;
    container.classList.add('has-cloth-mesh');
    return true;
  };

  Rack.prototype.measure = function () {
    this.vw = this.viewport.clientWidth;
    this.centers = this.items.map(function (item) { return item.offsetLeft + item.offsetWidth / 2; });
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
    if (immediate || motion.matches) {
      this.pos = this.target;
      this.swing = 0;
      this.swingV = 0;
      this.lastVelocity = 0;
      this.clothStates.forEach(function (st) {
        st.swing = 0; st.swingV = 0; st.drape = 0; st.drapeV = 0; st.twist = 0; st.twistV = 0; st.wave = 0;
      });
      this.render();
    } else {
      this.tick();
    }
  };

  Rack.prototype.stop = function () {
    cancelAnimationFrame(this.raf);
    this.raf = 0;
    this.edge = 0;
    this.hover = null;
  };

  Rack.prototype.impulseNeighbors = function (centerIndex, strength) {
    for (var i = 0; i < this.clothStates.length; i++) {
      var st = this.clothStates[i];
      var dist = Math.abs(i - centerIndex);
      var falloff = Math.max(0, 1 - dist * 0.24);
      var dir = i === centerIndex ? 0.35 : (i < centerIndex ? -1 : 1);
      st.swingV += dir * strength * falloff;
      st.drapeV += dir * strength * 1.35 * falloff;
      st.twistV += dir * strength * 2.6 * falloff;
    }
  };

  Rack.prototype.tick = function () {
    if (this.raf || this.destroyed || !this.visible || document.hidden || this.selected !== null) return;
    var self = this, last = performance.now();
    function step(now) {
      var dt = clamp((now - last) / 16.667, 0.25, 2); last = now;
      self.clock += dt * 0.14;
      if (motion.matches) {
        self.pos = self.target; self.swing = 0; self.swingV = 0;
        self.render(); self.raf = 0; return;
      }
      if (self.edge) self.target = clamp(self.target + self.edge * 7.5 * dt, self.minPos, self.maxPos);
      var velocity = (self.target - self.pos) * (1 - Math.pow(0.85, dt));
      var accel = velocity - self.lastVelocity;
      self.lastVelocity = velocity;
      self.pos += velocity;

      self.swingV += (-velocity * 0.038 - accel * 0.09 - self.swing * 0.072) * dt;
      self.swingV *= Math.pow(0.83, dt);
      self.swing = clamp(self.swing + self.swingV * dt, -8.5, 8.5);

      var totalEnergy = Math.abs(self.swing) + Math.abs(self.swingV);
      var n = self.clothStates.length;
      for (var i = 0; i < n; i++) {
        var st = self.clothStates[i];
        var leftSwing = i > 0 ? self.clothStates[i - 1].swing : st.swing;
        var rightSwing = i < n - 1 ? self.clothStates[i + 1].swing : st.swing;
        var neighborForce = (leftSwing + rightSwing - 2 * st.swing) * 0.055;
        var dCenter = (self.centers[i] + self.pos - self.vw / 2) / Math.min(self.vw, 850);
        var centerWeight = Math.max(0.35, 1 - Math.min(Math.abs(dCenter), 1.2) * 0.45);

        st.swingV += ((-velocity * 0.042 * centerWeight) - (accel * 0.11 * centerWeight) - st.swing * 0.078 + neighborForce) * dt;
        st.swingV *= Math.pow(0.84, dt);
        st.swing = clamp(st.swing + st.swingV * dt, -10, 10);

        // Lower garment hem & sleeve follow-through lag (secondary pendulum)
        st.drapeV += ((st.swing - st.drape) * 0.115 - velocity * 0.028 * centerWeight - st.drape * 0.045) * dt;
        st.drapeV *= Math.pow(0.81, dt);
        st.drape = clamp(st.drape + st.drapeV * dt, -13, 13);

        // Torsional hanger twist from rail motion & aerodynamic drag
        st.twistV += (-velocity * 0.34 * centerWeight - st.twist * 0.095) * dt;
        st.twistV *= Math.pow(0.80, dt);
        st.twist = clamp(st.twist + st.twistV * dt, -34, 34);

        st.phase += (0.12 + Math.min(0.28, Math.abs(velocity) * 0.012 + Math.abs(st.drapeV) * 0.04)) * dt;
        st.wave = clamp(Math.abs(st.drape) * 0.42 + Math.abs(velocity) * 0.16, 0, 5.5);

        totalEnergy += (Math.abs(st.swing) + Math.abs(st.swingV) + Math.abs(st.drape) + Math.abs(st.drapeV) + Math.abs(st.twist) * 0.15) * 0.25;
      }

      self.render();
      if (Math.abs(self.target - self.pos) > 0.15 || totalEnergy > 0.06 || self.edge) {
        self.raf = requestAnimationFrame(step);
      } else {
        self.pos = self.target; self.swing = 0; self.swingV = 0; self.lastVelocity = 0;
        self.clothStates.forEach(function (st) {
          st.swing = 0; st.swingV = 0; st.drape = 0; st.drapeV = 0; st.twist = 0; st.twistV = 0; st.wave = 0;
        });
        self.render(); self.raf = 0; self.announce();
      }
    }
    this.raf = requestAnimationFrame(step);
  };

  Rack.prototype.render = function () {
    this.track.style.transform = 'translate3d(' + this.pos.toFixed(2) + 'px,0,0)';
    for (var i = 0; i < this.items.length; i++) {
      var item = this.items[i];
      var st = this.clothStates[i] || { swing: this.swing, drape: 0, twist: 0, wave: 0, phase: 0 };
      var d = (this.centers[i] + this.pos - this.vw / 2) / Math.min(this.vw, 850);
      var distance = Math.min(Math.abs(d), 1);
      var angle = motion.matches ? 0 : clamp(-d * 82 + st.twist * 0.45, -58, 58);
      var views = this.data[i] && this.data[i].angles;
      var garment = item.querySelector('[data-rack-garment]');
      var canvas = item.querySelector('[data-rack-canvas]');
      var image = item.querySelector('[data-rack-link] img');

      if (views && views.length) {
        var fullCircle = this.hasFullCircle(views);
        var baseSweep = clamp(d * 145 - st.twist * 0.75, -88, 88);
        var desired = fullCircle ? ((baseSweep < 0 ? 360 + baseSweep : baseSweep) % 360) : Math.min(Math.abs(baseSweep), 90);
        var bracket = this.resolveAngleBracket(views, desired);
        var view = bracket ? bracket.nearest : views[0];
        if (image && image.getAttribute('src') !== view.url) image.src = view.url;
        if (Math.abs(d) < 1.35) {
          this.drawCloth(
            canvas,
            garment,
            view.url,
            bracket && bracket.secondary ? bracket.secondary.url : null,
            bracket ? bracket.blend : 0,
            st
          );
        } else if (garment) {
          garment.classList.remove('has-cloth-mesh');
        }
        angle = motion.matches ? 0 : clamp(-d * 12 + (bracket ? bracket.residual * 0.45 : 0), -9, 9);
      } else if (image && Math.abs(d) < 1.2) {
        this.drawCloth(canvas, garment, this.data[i] && this.data[i].front, null, 0, st);
      } else if (garment) {
        garment.classList.remove('has-cloth-mesh');
      }

      var sway = motion.matches ? 0 : (st.swing * 0.72 + this.swing * 0.28) * (1 - distance * 0.35);
      var liftY = motion.matches ? 0 : -Math.min(4.5, Math.abs(sway) * 0.25 + Math.abs(st.drape) * 0.12);
      item.style.transform = 'perspective(1150px) translate3d(0,' + liftY.toFixed(2) + 'px,0) rotateY(' + angle.toFixed(2) + 'deg) rotateZ(' + sway.toFixed(2) + 'deg) scale(' + (1 - distance * 0.12).toFixed(3) + ')';
      item.style.zIndex = String(100 - Math.round(distance * 80));
      item.style.setProperty('--mrack-depth', (1 - distance * 0.22).toFixed(3));
      item.style.setProperty('--mrack-drop-x', clamp(6 - sway * 1.3, -10, 16).toFixed(1) + 'px');
      item.style.setProperty('--mrack-shadow-x', clamp(-sway * 2.4 - st.drape * 1.1, -22, 22).toFixed(1) + 'px');
      item.style.setProperty('--mrack-shadow-scale', clamp(1 - Math.abs(angle) * 0.005 + Math.abs(st.drape) * 0.012, 0.72, 1.18).toFixed(3));
    }
    var active = this.nearest(this.pos);
    if (active !== this.active) {
      this.active = active;
      this.items.forEach(function (item, index) { item.classList.toggle('is-active', index === active); });
      var data = this.data[active];
      if (this.caption && data) this.caption.textContent = data.title + ' / ' + data.price;
      if (this.counter) this.counter.textContent = String(active + 1).padStart(2, '0') + ' / ' + String(this.items.length).padStart(2, '0');
      if (this.prev) this.prev.disabled = active === 0;
      if (this.next) this.next.disabled = active === this.items.length - 1;
      this.preloadProduct(data);
    }
  };

  Rack.prototype.announce = function () {
    if (this.live && this.data[this.active]) this.live.textContent = this.data[this.active].title + ', ' + (this.active + 1) + ' of ' + this.items.length;
  };

  Rack.prototype.bind = function () {
    var self = this, vp = this.viewport;
    this.on(vp, 'pointerenter', function (e) {
      if (e.pointerType === 'mouse' && fine.matches && !motion.matches) self.hover = { x: e.clientX, pos: self.target };
    });
    this.on(vp, 'pointerdown', function (e) {
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      self.suppressClick = false; self.hover = null; self.edge = 0;
      self.drag = { id: e.pointerId, x: e.clientX, y: e.clientY, pos: self.pos, last: e.clientX, time: performance.now(), velocity: 0, moved: false };
    });
    this.on(window, 'pointermove', function (e) {
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
      if (drag.moved) self.snapTo(self.nearest(clamp(self.target + v * 155, self.minPos, self.maxPos)));
    }
    this.on(window, 'pointerup', release); this.on(window, 'pointercancel', release);
    this.on(vp, 'pointermove', function (e) {
      if (self.drag || !self.hover || e.pointerType !== 'mouse' || motion.matches || self.selected !== null) return;
      var bounds = vp.getBoundingClientRect(), x = (e.clientX - bounds.left) / bounds.width;
      self.target = clamp(self.hover.pos + (e.clientX - self.hover.x) * 1.8, self.minPos, self.maxPos);
      self.edge = x < 0.17 ? (0.17 - x) / 0.17 : x > 0.83 ? -(x - 0.83) / 0.17 : 0;
      self.tick();
    });
    this.on(vp, 'pointerleave', function () { self.hover = null; self.edge = 0; if (!self.drag) self.snapTo(self.nearest(self.target)); });
    this.items.forEach(function (item, index) {
      self.on(item.querySelector('[data-rack-link]'), 'click', function (e) {
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
        e.preventDefault();
        if (self.suppressClick) { self.suppressClick = false; return; }
        self.open(index);
      });
      self.on(item.querySelector('[data-rack-link]'), 'focus', function () { if (self.selected === null) self.snapTo(index); });
    });
    this.on(vp, 'wheel', function (e) {
      if (Math.abs(e.deltaX) <= Math.abs(e.deltaY) || !e.deltaX) return;
      var multiplier = e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? self.vw : 1;
      var next = clamp(self.target - e.deltaX * multiplier, self.minPos, self.maxPos);
      if (next === self.target) return;
      e.preventDefault(); self.hover = null; self.edge = 0; self.target = next; self.tick();
      clearTimeout(self.wheelTimer);
      self.wheelTimer = setTimeout(function () { self.snapTo(self.nearest(self.target)); }, 150);
    }, { passive: false });
    this.on(vp, 'keydown', function (e) {
      if (e.key === 'ArrowRight' || e.key === 'ArrowLeft' || e.key === 'Home' || e.key === 'End') {
        e.preventDefault(); self.hover = null; self.edge = 0;
        var index = e.key === 'Home' ? 0 : e.key === 'End' ? self.items.length - 1 : self.nearest(self.target) + (e.key === 'ArrowRight' ? 1 : -1);
        self.snapTo(index);
        var activeLink = self.items[clamp(index, 0, self.items.length - 1)].querySelector('[data-rack-link]');
        if (activeLink && activeLink !== e.target) activeLink.focus({ preventScroll: true });
      } else if (e.key === 'Enter' && e.target === vp) { e.preventDefault(); self.open(self.active); }
    });
    this.on(this.prev, 'click', function () { self.snapTo(self.nearest(self.target) - 1); });
    this.on(this.next, 'click', function () { self.snapTo(self.nearest(self.target) + 1); });
    this.on(document, 'visibilitychange', function () { if (document.hidden) self.stop(); else self.tick(); });
    this.on(motion, 'change', function () { self.stop(); self.snapTo(self.active, true); });
  };

  Rack.prototype.bindStage = function () {
    var self = this, s = this.stage;
    if (!s) return;
    this.art = s.querySelector('[data-rack-art]');
    this.flip = s.querySelector('[data-rack-flip]');
    this.faceFront = s.querySelector('.mrack__face--front');
    this.imgFront = s.querySelector('[data-rack-img-front]');
    this.imgBlend = s.querySelector('[data-rack-img-blend]');
    this.stageCanvas = s.querySelector('[data-rack-stage-canvas]');
    this.stageShadow = s.querySelector('[data-rack-stage-shadow]');
    this.imgBack = s.querySelector('[data-rack-img-back]');
    this.drawer = s.querySelector('[data-rack-drawer]');
    this.sizes = s.querySelector('[data-rack-sizes]');
    this.addBtn = s.querySelector('[data-rack-add]');
    this.msg = s.querySelector('[data-rack-msg]');
    this.turn = s.querySelector('[data-rack-turn]');
    this.openBtn = s.querySelector('[data-rack-side="open"]');
    this.on(s.querySelector('[data-rack-close]'), 'click', function () { self.close(); });
    this.on(s, 'cancel', function (e) { e.preventDefault(); self.close(); });
    this.on(s.querySelector('[data-rack-stage-prev]'), 'click', function () { self.change(-1); });
    this.on(s.querySelector('[data-rack-stage-next]'), 'click', function () { self.change(1); });
    this.on(this.turn, 'input', function () { self.setTurn(Number(self.turn.value)); });
    s.querySelectorAll('[data-rack-side]').forEach(function (b) {
      self.on(b, 'click', function () {
        if (b.dataset.rackSide === 'open') {
          self.setOpenMode(true);
        } else {
          self.setTurn(b.dataset.rackSide === 'back' ? 180 : b.dataset.rackSide === 'angle' ? 32 : 0);
        }
      });
    });
    this.on(s.querySelector('[data-rack-zoom]'), 'click', function (e) {
      var zoom = self.art.classList.toggle('is-zoomed'); e.currentTarget.setAttribute('aria-pressed', String(zoom));
    });
    this.on(this.art, 'pointerdown', function (e) {
      if (e.button !== 0 || self.busy) return;
      self.turnDrag = { id: e.pointerId, x: e.clientX, lastX: e.clientX, rotation: self.rotation };
      self.art.setPointerCapture(e.pointerId); self.art.classList.add('is-turning');
    });
    this.on(this.art, 'pointermove', function (e) {
      if (!self.turnDrag || self.turnDrag.id !== e.pointerId) return;
      var deltaX = e.clientX - self.turnDrag.x;
      var stepDx = e.clientX - self.turnDrag.lastX;
      self.turnDrag.lastX = e.clientX;
      var raw = self.turnDrag.rotation + deltaX * 0.68;
      var min = Number(self.turn.min), max = Number(self.turn.max);
      var views = self.current && self.current.angles;
      var nextDeg = (self.hasFullCircle(views) && max >= 360) ? (((raw % 360) + 360) % 360) : clamp(raw, min, max);
      self.impulseStageCloth(stepDx * 0.22);
      self.setTurn(nextDeg);
    });
    function endTurn(e) {
      if (!self.turnDrag || self.turnDrag.id !== e.pointerId) return;
      self.turnDrag = null;
      self.art.classList.remove('is-turning');
      if (self.art.hasPointerCapture(e.pointerId)) self.art.releasePointerCapture(e.pointerId);
    }
    this.on(this.art, 'pointerup', endTurn); this.on(this.art, 'pointercancel', endTurn);
    this.on(s.querySelector('[data-rack-avail]'), 'click', function () { self.openDrawer(); });
    this.on(s.querySelector('[data-rack-drawer-close]'), 'click', function () { self.closeDrawer(); });
    this.on(this.addBtn, 'click', function () { self.addToCart(); });
    this.on(s, 'keydown', function (e) {
      if (e.key === 'Escape') { e.preventDefault(); if (!self.drawer.hidden) self.closeDrawer(); else self.close(); }
      if (e.key === 'Tab' && !self.drawer.hidden) self.trapDrawer(e);
    });
  };

  Rack.prototype.impulseStageCloth = function (impulse) {
    if (motion.matches) return;
    this.stageCloth.swingV = clamp(this.stageCloth.swingV - impulse * 0.35, -8, 8);
    this.stageCloth.drapeV = clamp(this.stageCloth.drapeV - impulse * 0.65, -12, 12);
    this.tickStageCloth();
  };

  Rack.prototype.tickStageCloth = function () {
    if (this.stageRaf || this.destroyed || this.selected === null || motion.matches) return;
    var self = this, last = performance.now();
    function step(now) {
      if (self.destroyed || self.selected === null) { self.stageRaf = 0; return; }
      var dt = clamp((now - last) / 16.667, 0.25, 2); last = now;
      var st = self.stageCloth;
      st.swingV += (-st.swing * 0.085) * dt;
      st.swingV *= Math.pow(0.84, dt);
      st.swing = clamp(st.swing + st.swingV * dt, -7, 7);

      st.drapeV += ((st.swing - st.drape) * 0.12 - st.drape * 0.055) * dt;
      st.drapeV *= Math.pow(0.82, dt);
      st.drape = clamp(st.drape + st.drapeV * dt, -11, 11);

      st.phase += (0.14 + Math.abs(st.drapeV) * 0.04) * dt;
      st.wave = clamp(Math.abs(st.drape) * 0.45, 0, 5);

      self.renderStageCloth();
      if (Math.abs(st.swing) + Math.abs(st.swingV) + Math.abs(st.drape) + Math.abs(st.drapeV) > 0.04) {
        self.stageRaf = requestAnimationFrame(step);
      } else {
        st.swing = 0; st.swingV = 0; st.drape = 0; st.drapeV = 0; st.wave = 0;
        self.renderStageCloth();
        self.stageRaf = 0;
      }
    }
    this.stageRaf = requestAnimationFrame(step);
  };

  Rack.prototype.renderStageCloth = function () {
    if (!this.stage || !this.current) return;
    var st = this.stageCloth;
    if (this.flip) {
      this.flip.style.setProperty('--mrack-stage-sway', (st.swing * 0.45).toFixed(2) + 'deg');
    }
    if (this.stageShadow) {
      this.stageShadow.style.setProperty('--mrack-stage-shadow-x', (-st.swing * 2.2 - st.drape * 1.2).toFixed(1) + 'px');
    }
    var primaryUrl = this.imgFront ? this.imgFront.getAttribute('src') : null;
    var secondaryUrl = (this.imgBlend && !this.imgBlend.hidden) ? this.imgBlend.getAttribute('src') : null;
    var blendAlpha = this.faceFront ? Number(this.faceFront.style.getPropertyValue('--mrack-blend') || 0) : 0;
    this.drawCloth(this.stageCanvas, this.faceFront, primaryUrl, secondaryUrl, blendAlpha, st);
  };

  Rack.prototype.setOpenMode = function (enable) {
    var openViews = this.current && this.current.openViews;
    if (!openViews || !openViews.length) return;
    clearTimeout(this.unzipTimer);
    if (!enable) {
      this.isOpenView = false;
      return;
    }
    var self = this;
    this.isOpenView = true;
    this.rotation = 0;
    this.turn.value = 0;
    this.flip.style.setProperty('--mrack-turn', '0deg');
    if (this.imgBlend) { this.imgBlend.hidden = true; this.imgBlend.removeAttribute('src'); }
    if (this.faceFront) this.faceFront.style.setProperty('--mrack-blend', '0');

    var finalView = openViews[openViews.length - 1];
    var halfView = openViews.length > 1 ? openViews[0] : null;

    if (halfView && !motion.matches) {
      this.imgFront.src = halfView.url;
      this.imgFront.alt = this.current.title + ', unzipping';
      this.impulseStageCloth(3.2);
      this.renderStageCloth();
      this.unzipTimer = setTimeout(function () {
        if (!self.isOpenView || self.destroyed || !self.current) return;
        self.imgFront.src = finalView.url;
        self.imgFront.alt = self.current.title + ', inside look';
        self.impulseStageCloth(-2.4);
        self.renderStageCloth();
      }, 210);
    } else {
      this.imgFront.src = finalView.url;
      this.imgFront.alt = this.current.title + ', inside look';
      this.impulseStageCloth(2.6);
      this.renderStageCloth();
    }

    this.stage.querySelectorAll('[data-rack-side]').forEach(function (b) {
      b.setAttribute('aria-pressed', String(b.dataset.rackSide === 'open'));
    });
  };

  Rack.prototype.setTurn = function (degrees) {
    clearTimeout(this.unzipTimer);
    var prevRotation = this.rotation || 0;
    this.isOpenView = false;
    this.rotation = degrees;
    this.turn.value = degrees;
    var views = this.current && this.current.angles;
    if (views && views.length) {
      var bracket = this.resolveAngleBracket(views, degrees);
      var nearest = bracket.nearest;
      if (this.imgFront.getAttribute('src') !== nearest.url) this.imgFront.src = nearest.url;
      this.imgFront.alt = this.current.title + ', ' + nearest.baseDegrees + ' degree view';
      this.flip.style.setProperty('--mrack-turn', bracket.residual + 'deg');
      if (this.imgBlend && this.faceFront) {
        if (bracket.secondary && bracket.blend > 0.03 && bracket.secondary.url !== nearest.url) {
          if (this.imgBlend.getAttribute('src') !== bracket.secondary.url) this.imgBlend.src = bracket.secondary.url;
          this.imgBlend.hidden = false;
          this.faceFront.style.setProperty('--mrack-blend', bracket.blend.toFixed(3));
        } else {
          this.imgBlend.hidden = true;
          this.faceFront.style.setProperty('--mrack-blend', '0');
        }
      }
      this.stageCloth.twist = bracket.residual * 2.5;
      if (Math.abs(degrees - prevRotation) > 0.5) {
        this.impulseStageCloth(clamp((degrees - prevRotation) * 0.14, -3.5, 3.5));
      } else {
        this.renderStageCloth();
      }
    }
    if (!views || !views.length) {
      if (this.imgBlend) this.imgBlend.hidden = true;
      if (this.faceFront) {
        this.faceFront.style.setProperty('--mrack-blend', '0');
        this.faceFront.classList.remove('has-cloth-mesh');
      }
      if (this.current && this.current.front && this.imgFront.getAttribute('src') !== this.current.front) {
        this.imgFront.src = this.current.front;
      }
      this.flip.style.setProperty('--mrack-turn', degrees + 'deg');
    }
    var normalizedDeg = views && this.hasFullCircle(views) ? (((degrees % 360) + 360) % 360) : degrees;
    this.stage.querySelectorAll('[data-rack-side]').forEach(function (b) {
      if (b.dataset.rackSide === 'open') {
        b.setAttribute('aria-pressed', 'false');
        return;
      }
      var value = b.dataset.rackSide === 'back' ? 180 : b.dataset.rackSide === 'angle' ? 32 : 0;
      var diff = Math.abs(normalizedDeg - value);
      if (value === 0 && normalizedDeg > 345) diff = 360 - normalizedDeg;
      b.setAttribute('aria-pressed', String(diff < 12));
    });
  };

  Rack.prototype.makeSpace = async function (index, returning) {
    this.root.classList.toggle('is-inspecting', !returning);
    var distance = Math.min(this.items[index].offsetWidth * 0.28, 96);
    var self = this;
    this.items.forEach(function (item, i) {
      item.style.translate = returning || i === index ? '0px' : (i < index ? -distance : distance) + 'px';
      if (!motion.matches && self.clothStates[i] && i !== index) {
        var falloff = Math.max(0, 1 - Math.abs(i - index) * 0.28);
        var dir = (i < index ? -1 : 1) * (returning ? -0.75 : 1);
        self.clothStates[i].swingV += dir * 2.4 * falloff;
        self.clothStates[i].drapeV += dir * 3.2 * falloff;
      }
    });
    if (!motion.matches) await new Promise(function (resolve) { setTimeout(resolve, returning ? 380 : 240); });
  };

  Rack.prototype.travel = function (from, to, returning) {
    if (motion.matches || !this.art.animate || !from.width || !to.width) return Promise.resolve();
    var dx = from.left + from.width / 2 - to.left - to.width / 2;
    var dy = from.top - to.top, scale = from.width / to.width;
    var frames = returning
      ? [
          { transform: 'none', offset: 0 },
          { transform: 'translate(' + (dx * 0.32) + 'px,' + (dy * 0.24 - 22) + 'px) scale(' + lerp(1, scale, 0.38) + ') rotate(-1.6deg)', offset: 0.36 },
          { transform: 'translate(' + dx + 'px,' + (dy - 32) + 'px) scale(' + scale + ') rotate(1.8deg)', offset: 0.76 },
          { transform: 'translate(' + dx + 'px,' + (dy + 5) + 'px) scale(' + (scale * 0.992) + ') rotate(-0.8deg)', offset: 0.91 },
          { transform: 'translate(' + dx + 'px,' + dy + 'px) scale(' + scale + ') rotate(0deg)', offset: 1 }
        ]
      : [
          { transform: 'translate(' + dx + 'px,' + dy + 'px) scale(' + scale + ') rotate(0deg)', offset: 0 },
          { transform: 'translate(' + dx + 'px,' + (dy - 34) + 'px) scale(' + (scale * 1.02) + ') rotate(-2.4deg)', offset: 0.2 },
          { transform: 'translate(' + (dx * 0.35) + 'px,' + (dy * 0.28 - 20) + 'px) scale(' + lerp(scale, 1, 0.68) + ') rotate(1.6deg)', offset: 0.64 },
          { transform: 'translate(0px, 4px) scale(1.012) rotate(-0.5deg)', offset: 0.88 },
          { transform: 'none', offset: 1 }
        ];
    this.stage.classList.add('is-travelling');
    this.animation = this.art.animate(frames, {
      duration: returning ? 860 : 920,
      easing: returning ? 'cubic-bezier(.24,.74,.22,1)' : 'cubic-bezier(.22,.78,.2,1)',
      fill: 'both'
    });
    var animation = this.animation, stage = this.stage;
    return animation.finished.catch(function () {}).then(function () { animation.cancel(); stage.classList.remove('is-travelling'); });
  };

  Rack.prototype.open = async function (index, switching) {
    if (this.busy || this.selected !== null || !this.data[index] || !this.stage) return;
    this.busy = true; this.stop(); this.drag = null;
    var data = this.data[index], source = this.items[index];
    this.preloadProduct(data);
    this.lastFocus = switching ? source.querySelector('[data-rack-link]') : document.activeElement;
    this.snapTo(index);
    if (!motion.matches) await new Promise(function (resolve) { setTimeout(resolve, 320); });
    this.stop(); this.pos = this.target; this.render();
    await this.makeSpace(index, false);
    if (this.destroyed) return;
    var from = source.querySelector('[data-rack-link]').getBoundingClientRect();
    this.selected = index; this.current = data;
    this.stage.classList.toggle('has-baked-hanger', !!data.bakedHanger);
    this.stage.classList.toggle('has-angle-views', !!(data.angles && data.angles.length));
    this.stage.setAttribute('aria-label', data.title);
    this.imgFront.src = data.front; this.imgFront.alt = data.title + ', front';
    if (this.imgBlend) { this.imgBlend.hidden = true; this.imgBlend.removeAttribute('src'); }
    this.imgBack.hidden = !data.back;
    if (data.back) { this.imgBack.src = data.back; this.imgBack.alt = data.title + ', back'; } else this.imgBack.removeAttribute('src');
    this.stage.querySelector('[data-rack-side="back"]').hidden = !data.back;
    if (this.openBtn) {
      this.openBtn.hidden = !(data.openViews && data.openViews.length);
      this.openBtn.setAttribute('aria-pressed', 'false');
    }
    var hasAngles = !!(data.angles && data.angles.length);
    var fullCircle = this.hasFullCircle(data.angles);
    this.turn.min = hasAngles ? data.angles[0].degrees : data.back ? 0 : -35;
    this.turn.max = hasAngles ? (fullCircle ? 360 : data.angles[data.angles.length - 1].degrees) : data.back ? 180 : 35;
    this.stageCloth.swing = 0; this.stageCloth.swingV = 0; this.stageCloth.drape = 0; this.stageCloth.drapeV = 0;
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
    try { await Promise.race([this.imgFront.decode().catch(function () {}), new Promise(function (resolve) { setTimeout(resolve, 500); })]); } catch (_) {}
    if (this.destroyed) return;
    this.art.style.visibility = '';
    this.impulseStageCloth(3.8);
    await this.travel(from, this.art.getBoundingClientRect(), false);
    this.impulseStageCloth(-2.1);
    this.busy = false;
    this.stage.querySelector('[data-rack-close]').focus({ preventScroll: true });
  };

  Rack.prototype.close = async function (switching) {
    if (this.selected === null || this.busy) return;
    this.busy = true;
    clearTimeout(this.unzipTimer);
    cancelAnimationFrame(this.stageRaf); this.stageRaf = 0;
    var index = this.selected, source = this.items[index];
    this.closeDrawer(true); this.setTurn(0); this.art.classList.remove('is-zoomed');
    await this.travel(source.querySelector('[data-rack-link]').getBoundingClientRect(), this.art.getBoundingClientRect(), true);
    this.stage.classList.remove('is-open'); this.stage.close(); this.stage.hidden = true;
    source.classList.remove('is-picked'); this.selected = null;
    document.documentElement.style.overflow = this.previousOverflow;
    if (!motion.matches && this.clothStates[index]) {
      this.clothStates[index].swingV += 2.8;
      this.clothStates[index].drapeV -= 4.2;
      this.impulseNeighbors(index, 1.8);
    }
    await this.makeSpace(index, true);
    this.busy = false;
    if (!motion.matches) this.tick();
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
    var nodes = Array.from(this.drawer.querySelectorAll('button:not(:disabled),a[href]')).filter(function (n) { return n.getClientRects().length; });
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
    data.variants.forEach(function (variant) {
      var li = document.createElement('li'), button = document.createElement('button');
      button.type = 'button'; button.textContent = variant.title === 'Default Title' ? 'ONE SIZE' : variant.title;
      button.setAttribute('aria-pressed', 'false'); button.disabled = !variant.available;
      if (!variant.available) button.setAttribute('aria-label', button.textContent + ', sold out');
      button.addEventListener('click', function () {
        self.selectedVariant = variant;
        self.sizes.querySelectorAll('button').forEach(function (b) { b.setAttribute('aria-pressed', String(b === button)); });
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
    this.destroyed = true; this.stop(); cancelAnimationFrame(this.stageRaf); clearTimeout(this.unzipTimer);
    this.abort.abort(); this.resize.disconnect(); this.observer.disconnect(); clearTimeout(this.wheelTimer);
    if (this.animation) this.animation.cancel();
    if (this.stage && this.stage.open) { this.stage.close(); document.documentElement.style.overflow = this.previousOverflow; }
    delete this.root.__mrack;
  };

  function init() { document.querySelectorAll('[data-melato-rack]').forEach(function (root) { if (!root.__mrack) root.__mrack = new Rack(root); }); }
  window.MelatoRackAtelier = { init: init };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
  document.addEventListener('shopify:section:load', init);
  document.addEventListener('shopify:section:unload', function (event) { event.target.querySelectorAll('[data-melato-rack]').forEach(function (root) { if (root.__mrack) root.__mrack.destroy(); }); });
})();
