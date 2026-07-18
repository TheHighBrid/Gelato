const initializeMelatoEvidenceArchives = (scope = document) => {
    const archives = scope.querySelectorAll('[data-evidence-archive]');

    archives.forEach((archive) => {
      if (archive.dataset.evidenceInitialized === 'true') return;
      archive.dataset.evidenceInitialized = 'true';

      const triggers = Array.from(archive.querySelectorAll('[data-evidence-open]'));
      const viewer = archive.querySelector('[data-evidence-viewer]');
      const viewerImage = archive.querySelector('[data-evidence-viewer-image]');
      const viewerLabel = archive.querySelector('[data-evidence-viewer-label]');
      const viewerCounter = archive.querySelector('[data-evidence-counter]');
      const closeButton = archive.querySelector('[data-evidence-close]');
      const previousButton = archive.querySelector('[data-evidence-previous]');
      const nextButton = archive.querySelector('[data-evidence-next]');

      if (!triggers.length || !viewer || !viewerImage) return;

      let activeIndex = 0;
      let lastFocusedElement = null;

      const pad = (value) => String(value).padStart(2, '0');

      const render = (index) => {
        activeIndex = (index + triggers.length) % triggers.length;
        const trigger = triggers[activeIndex];
        const code = trigger.dataset.evidenceCode || pad(activeIndex + 1);

        viewerImage.src = trigger.dataset.evidenceFull;
        viewerImage.alt = `Melato Living Lookbook evidence frame ${code}`;
        viewerLabel.textContent = `EXHIBIT ${code}`;
        viewerCounter.textContent = `${code} / ${pad(triggers.length)}`;
      };

      const openViewer = (index) => {
        lastFocusedElement = document.activeElement;
        render(index);
        viewer.hidden = false;
        viewer.setAttribute('aria-hidden', 'false');
        document.documentElement.style.overflow = 'hidden';
        closeButton.focus();
      };

      const closeViewer = () => {
        viewer.hidden = true;
        viewer.setAttribute('aria-hidden', 'true');
        viewerImage.removeAttribute('src');
        document.documentElement.style.overflow = '';
        if (lastFocusedElement && typeof lastFocusedElement.focus === 'function') {
          lastFocusedElement.focus();
        }
      };

      triggers.forEach((trigger, index) => {
        trigger.addEventListener('click', () => openViewer(index));
      });

      closeButton.addEventListener('click', closeViewer);
      previousButton.addEventListener('click', () => render(activeIndex - 1));
      nextButton.addEventListener('click', () => render(activeIndex + 1));

      viewer.addEventListener('click', (event) => {
        if (event.target === viewer) closeViewer();
      });

      viewer.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
          closeViewer();
          return;
        }

        if (event.key === 'ArrowLeft') {
          render(activeIndex - 1);
          return;
        }

        if (event.key === 'ArrowRight') {
          render(activeIndex + 1);
          return;
        }

        if (event.key === 'Tab') {
          const focusable = [closeButton, previousButton, nextButton].filter(Boolean);
          const first = focusable[0];
          const last = focusable[focusable.length - 1];

          if (event.shiftKey && document.activeElement === first) {
            event.preventDefault();
            last.focus();
          } else if (!event.shiftKey && document.activeElement === last) {
            event.preventDefault();
            first.focus();
          }
        }
      });
    });
  };

  initializeMelatoEvidenceArchives();

  document.addEventListener('shopify:section:load', (event) => {
    initializeMelatoEvidenceArchives(event.target);
  });
