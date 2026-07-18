/**
 * assets/melato-ann-color.js
 * Announcement Bar — Canvas Image Color Engine
 *
 * Reads product.featured_image at 80px via Canvas API.
 * Finds top 3 dominant + most characteristic (saturated) colors.
 * Applies richest one as bar bg, derives fg + CTA palette.
 * 100% async via requestIdleCallback — NEVER blocks main thread.
 * Shopify CDN supports CORS so canvas taint is not an issue.
 */
(function () {
  'use strict';

  var bar = document.getElementById('melato-announcement-bar');
  if (!bar) return;
  var imgSrc = bar.dataset.productImg;
  if (!imgSrc) return;

  var idle = window.requestIdleCallback
    ? function (fn) { requestIdleCallback(fn, { timeout: 2500 }); }
    : function (fn) { setTimeout(fn, 150); };

  idle(function () {
    var img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = function () {
      idle(function () {
        try {
          var palette = extract(img);
          if (palette) apply(palette);
        } catch (_) { /* canvas taint — silently keep server color */ }
      });
    };
    img.onerror = function () {};
    img.src = imgSrc;
  });

  /* -------- Extraction ----------------------------------------- */
  function extract(imgEl) {
    var SZ = 60;
    var cv = document.createElement('canvas');
    cv.width = cv.height = SZ;
    var ctx = cv.getContext('2d');
    ctx.drawImage(imgEl, 0, 0, SZ, SZ);
    var d = ctx.getImageData(0, 0, SZ, SZ).data;

    var buckets = {};
    for (var i = 0; i < d.length; i += 16) {
      var r = d[i], g = d[i+1], b = d[i+2], a = d[i+3];
      if (a < 100) continue;
      var k = (Math.round(r/8) << 10) | (Math.round(g/8) << 5) | Math.round(b/8);
      buckets[k] = (buckets[k] || 0) + 1;
    }

    var entries = Object.keys(buckets).map(function(k) {
      return { k: parseInt(k, 10), n: buckets[k] };
    }).sort(function(a, b) { return b.n - a.n; }).slice(0, 32);

    var colors = entries.map(function(e) {
      return {
        r: ((e.k >> 10) & 31) * 8,
        g: ((e.k >> 5)  & 31) * 8,
        b:  (e.k        & 31) * 8,
        n: e.n
      };
    });

    /* Score: reward saturation * sqrt(freq), penalise near-neutral */
    var best = null, bestScore = -1;
    for (var ci = 0; ci < colors.length; ci++) {
      var c = colors[ci];
      var hsl = toHSL(c.r, c.g, c.b);
      if (hsl.l < 0.08 || hsl.l > 0.92) continue;
      if (hsl.s < 0.13) continue;
      var lp = 1 - Math.abs(hsl.l - 0.42) * 1.3;
      var score = hsl.s * Math.sqrt(c.n) * Math.max(0.08, lp);
      if (score > bestScore) { bestScore = score; best = { r: c.r, g: c.g, b: c.b, hsl: hsl }; }
    }

    /* Fallback: most frequent non-neutral */
    if (!best) {
      for (var fi = 0; fi < colors.length; fi++) {
        var fc = colors[fi], fh = toHSL(fc.r, fc.g, fc.b);
        if (fh.l >= 0.08 && fh.l <= 0.92) { best = { r: fc.r, g: fc.g, b: fc.b, hsl: fh }; break; }
      }
    }
    if (!best) return null;

    /* Build dark rich bg from dominant hue */
    var h = best.hsl.h;
    var s = clamp(best.hsl.s, 0.38, 0.68);
    /* If original color is already dark, keep it darkish; else darken */
    var lOrig = best.hsl.l;
    var l = clamp(lOrig > 0.5 ? 0.14 : lOrig * 0.52, 0.09, 0.22);
    var bg = toHex(h, s, l);

    /* Fg: warm cream for warm hues, cool off-white for cool */
    var hDeg = h * 360;
    var fg = (hDeg < 65 || hDeg > 315) ? '#fff7ec' : '#f0f6ff';

    /* CTA: light pastel of same hue */
    var btnBg = toHex(h, clamp(s, 0.28, 0.52), 0.86);
    var btnFg = bg;

    /* Muted / border */
    var mRGB = toRGBStr(h, 0.14, 0.88);
    var muted  = 'rgba(' + mRGB + ',.74)';
    var border = 'rgba(' + mRGB + ',.20)';

    return { bg: bg, fg: fg, btnBg: btnBg, btnFg: btnFg, muted: muted, border: border };
  }

  /* -------- Apply to bar --------------------------------------- */
  function apply(p) {
    var section = bar.closest('[id^="shopify-section-"]');
    var target  = section || bar;
    target.style.setProperty('--ab-bg',     p.bg);
    target.style.setProperty('--ab-fg',     p.fg);
    target.style.setProperty('--ab-muted',  p.muted);
    target.style.setProperty('--ab-border', p.border);
    target.style.setProperty('--ab-btn-bg', p.btnBg);
    target.style.setProperty('--ab-btn-fg', p.btnFg);
    /* .melato-ann already has transition: background .45s — crossfades smoothly */
  }

  /* -------- Color math ---------------------------------------- */
  function toHSL(r, g, b) {
    r /= 255; g /= 255; b /= 255;
    var max = Math.max(r,g,b), min = Math.min(r,g,b);
    var l = (max + min) / 2;
    if (max === min) return { h: 0, s: 0, l: l };
    var d = max - min;
    var s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    var h;
    if      (max === r) h = (g - b) / d + (g < b ? 6 : 0);
    else if (max === g) h = (b - r) / d + 2;
    else                h = (r - g) / d + 4;
    return { h: h / 6, s: s, l: l };
  }

  function hslToRGB(h, s, l) {
    if (!s) { var v = Math.round(l * 255); return { r: v, g: v, b: v }; }
    function q2r(p, q, t) {
      if (t < 0) t += 1; if (t > 1) t -= 1;
      if (t < 1/6) return p + (q-p)*6*t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q-p)*(2/3-t)*6;
      return p;
    }
    var q = l < 0.5 ? l*(1+s) : l+s-l*s, p = 2*l-q;
    return {
      r: Math.round(q2r(p,q,h+1/3)*255),
      g: Math.round(q2r(p,q,h)*255),
      b: Math.round(q2r(p,q,h-1/3)*255)
    };
  }

  function toHex(h, s, l) {
    var c = hslToRGB(h,s,l);
    return '#'+h2(c.r)+h2(c.g)+h2(c.b);
  }

  function toRGBStr(h, s, l) {
    var c = hslToRGB(h,s,l);
    return c.r+','+c.g+','+c.b;
  }

  function h2(n) { return ('0'+Math.max(0,Math.min(255,Math.round(n))).toString(16)).slice(-2); }

  function clamp(v, mn, mx) { return Math.max(mn, Math.min(mx, v)); }

})();
