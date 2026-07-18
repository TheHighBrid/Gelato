/* MELATO - video hero utility
   Install before </body>:
   <script src="{{ 'melato-hero-video.js' | asset_url }}" defer="defer"></script>
*/

(function () {
  function initMelatoHeroScrollCues() {
    var cues = document.querySelectorAll('[data-melato-scroll-cue]');
    if (!cues.length) return;

    cues.forEach(function (cue) {
      cue.addEventListener('click', function () {
        var section = cue.closest('.melato-hero-video');
        if (!section) return;

        var next = section.nextElementSibling;
        if (next) {
          next.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    });
  }

  function initAutoplayRecovery() {
    var videos = document.querySelectorAll('.melato-hero-video__asset');
    if (!videos.length) return;

    videos.forEach(function (video) {
      video.muted = true;
      video.playsInline = true;

      var playPromise = video.play && video.play();
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(function () {
          video.setAttribute('controls', 'controls');
        });
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      initMelatoHeroScrollCues();
      initAutoplayRecovery();
    });
  } else {
    initMelatoHeroScrollCues();
    initAutoplayRecovery();
  }
})();
