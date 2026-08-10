/* ============================================================
   Melato Concierge Strip — Shared JavaScript
   ============================================================ */

(function() {
  'use strict';

  function initCountdowns() {
    document.querySelectorAll('[data-countdown]').forEach(function(el) {
      var targetDate = new Date(el.dataset.countdown).getTime();

      function update() {
        var now = new Date().getTime();
        var diff = targetDate - now;

        if (diff <= 0) {
          el.innerHTML = '<span class="melato-caption">Available now</span>';
          return;
        }

        var days = Math.floor(diff / (1000 * 60 * 60 * 24));
        var hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        var minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        var seconds = Math.floor((diff % (1000 * 60)) / 1000);

        function pad(n) { return n.toString().padStart(2, '0'); }

        el.innerHTML =
          '<div class="melato-countdown">' +
            '<div class="melato-countdown__unit"><div class="melato-countdown__number">' + pad(days) + '</div><div class="melato-countdown__label">Days</div></div>' +
            '<div class="melato-countdown__separator">:</div>' +
            '<div class="melato-countdown__unit"><div class="melato-countdown__number">' + pad(hours) + '</div><div class="melato-countdown__label">Hrs</div></div>' +
            '<div class="melato-countdown__separator">:</div>' +
            '<div class="melato-countdown__unit"><div class="melato-countdown__number">' + pad(minutes) + '</div><div class="melato-countdown__label">Min</div></div>' +
            '<div class="melato-countdown__separator">:</div>' +
            '<div class="melato-countdown__unit"><div class="melato-countdown__number">' + pad(seconds) + '</div><div class="melato-countdown__label">Sec</div></div>' +
          '</div>';
      }

      update();
      setInterval(update, 1000);
    });
  }

  function initConciergeStrip() {
    var strip = document.querySelector('[data-concierge-strip]');
    if (!strip) return;

    var currentPillar = strip.dataset.currentPillar;

    strip.querySelectorAll('[data-pillar-link]').forEach(function(link) {
      if (link.dataset.pillar === currentPillar) {
        link.classList.add('melato-strip-link--active');
        link.setAttribute('aria-current', 'page');
      }

      link.addEventListener('click', function() {
        var destination = this.dataset.pillar;

        if (typeof fbq !== 'undefined') {
          fbq('trackCustom', 'ConciergeStripClick', {
            destination_pillar: destination,
            current_pillar: currentPillar
          });
        }

        if (typeof _learnq !== 'undefined') {
          _learnq.push(['track', 'Concierge Strip Clicked', {
            destination: destination,
            current_page: currentPillar
          }]);
        }
      });
    });
  }

  function initCopyButtons() {
    document.querySelectorAll('[data-copy]').forEach(function(btn) {
      btn.addEventListener('click', function() {
        var text = this.dataset.copy;
        var self = this;
        navigator.clipboard.writeText(text).then(function() {
          var original = self.innerHTML;
          self.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg> Copied';
          setTimeout(function() { self.innerHTML = original; }, 2000);
        });
      });
    });
  }

  function initEmailForms() {
    document.querySelectorAll('[data-email-form]').forEach(function(form) {
      form.addEventListener('submit', function(e) {
        var emailInput = form.querySelector('input[type="email"]');
        if (!emailInput) return;
        var email = emailInput.value;
        var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailRegex.test(email)) {
          e.preventDefault();
          alert('Please enter a valid email address.');
          return false;
        }

        if (typeof fbq !== 'undefined') {
          fbq('trackCustom', 'PreviewSubscription', { email: email });
        }
      });
    });
  }

  function init() {
    initCountdowns();
    initConciergeStrip();
    initCopyButtons();
    initEmailForms();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
