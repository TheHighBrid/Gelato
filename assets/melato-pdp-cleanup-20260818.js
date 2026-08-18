(() => {
  'use strict';

  /*
    P0 storefront stability, 2026-08-18.

    This legacy cleanup runtime is intentionally inert. Its former document-wide
    MutationObserver removed PDP nodes that other enhancement runtimes recreated,
    allowing a self-sustaining DOM mutation loop to consume the browser main thread.

    Keep the asset as a harmless compatibility stub so any stale or undiscovered
    loader cannot reintroduce the freeze. Static PDP cleanup CSS is unaffected.
  */
  document.documentElement.dataset.melatoPdpCleanupRuntime = 'disabled-p0';
})();
