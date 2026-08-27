(() => {
  'use strict';

  const initialisedRoots = new WeakSet();

  const focusableSelector = [
    'a[href]',
    'button:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    '[tabindex]:not([tabindex="-1"])'
  ].join(',');

  function getFocusable(container) {
    return Array.from(container.querySelectorAll(focusableSelector)).filter((element) => !element.hidden && element.offsetParent !== null);
  }

  function trapFocus(event, dialog) {
    if (event.key !== 'Tab') return;

    const focusable = getFocusable(dialog);
    if (!focusable.length) {
      event.preventDefault();
      dialog.focus();
      return;
    }

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

  function readSavedLooks() {
    try {
      return JSON.parse(window.localStorage.getItem('melato-field-journal-saved-looks') || '[]');
    } catch {
      return [];
    }
  }

  function persistSavedLooks(looks) {
    try {
      window.localStorage.setItem('melato-field-journal-saved-looks', JSON.stringify(looks));
      return true;
    } catch {
      return false;
    }
  }

  function initialise(root) {
    if (!root || initialisedRoots.has(root)) return;
    initialisedRoots.add(root);

    const drawer = root.querySelector('[data-field-journal-drawer]');
    const viewer = root.querySelector('[data-field-journal-viewer]');
    const drawerContent = root.querySelector('[data-drawer-content]');
    const viewerContent = root.querySelector('[data-viewer-content]');
    const liveRegion = root.querySelector('[data-field-journal-live]');
    const archiveTriggers = Array.from(root.querySelectorAll('[data-archive-open]'));
    const archiveItems = Array.from(root.querySelectorAll('[data-archive-item]'));
    const loadMoreButton = root.querySelector('[data-archive-load-more]');
    const chapterLinks = Array.from(root.querySelectorAll('[data-chapter-link]'));
    const chapters = Array.from(root.querySelectorAll('[data-field-journal-chapter]'));
    let previousFocus = null;
    let activeDialog = null;
    let archiveIndex = 0;
    let chapterObserver = null;

    const announce = (message) => {
      if (liveRegion) liveRegion.textContent = message;
    };

    const cloneTemplate = (templateId, target) => {
      const template = root.querySelector(`#${CSS.escape(templateId)}`);
      if (!template || !target) return false;
      target.replaceChildren(template.content.cloneNode(true));
      return true;
    };

    const closeDialog = () => {
      if (!activeDialog) return;
      const closingDialog = activeDialog;
      activeDialog = null;
      closingDialog.hidden = true;
      closingDialog.setAttribute('aria-hidden', 'true');
      document.documentElement.classList.remove('field-journal-dialog-open');
      if (previousFocus && typeof previousFocus.focus === 'function') previousFocus.focus();
      previousFocus = null;
    };

    const openDialog = (dialog, trigger) => {
      if (!dialog) return;
      if (activeDialog && activeDialog !== dialog) closeDialog();
      previousFocus = trigger || document.activeElement;
      activeDialog = dialog;
      dialog.hidden = false;
      dialog.setAttribute('aria-hidden', 'false');
      document.documentElement.classList.add('field-journal-dialog-open');
      const closeControl = dialog.querySelector('[data-dialog-close]');
      if (closeControl) closeControl.focus();
    };

    const openLook = (trigger) => {
      const templateId = trigger.getAttribute('data-look-template');
      if (!cloneTemplate(templateId, drawerContent)) return;
      openDialog(drawer, trigger);
      root.dispatchEvent(new CustomEvent('fieldJournal:look-open', {
        bubbles: true,
        detail: { look: templateId }
      }));
    };

    const openArchiveAt = (nextIndex, trigger) => {
      if (!archiveTriggers.length) return;
      archiveIndex = (nextIndex + archiveTriggers.length) % archiveTriggers.length;
      const archiveTrigger = archiveTriggers[archiveIndex];
      const templateId = archiveTrigger.getAttribute('data-archive-template');
      if (!cloneTemplate(templateId, viewerContent)) return;
      openDialog(viewer, trigger || archiveTrigger);
      root.dispatchEvent(new CustomEvent('fieldJournal:archive-open', {
        bubbles: true,
        detail: { exhibit: archiveTrigger.getAttribute('data-archive-index') }
      }));
    };

    const revealArchiveItems = () => {
      const hiddenItems = archiveItems.filter((item) => item.hidden);
      hiddenItems.slice(0, 6).forEach((item) => {
        item.hidden = false;
      });
      if (!archiveItems.some((item) => item.hidden) && loadMoreButton) loadMoreButton.hidden = true;
      announce(hiddenItems.length ? `Loaded ${Math.min(hiddenItems.length, 6)} more archive exhibits.` : 'All archive exhibits are visible.');
    };

    const saveLook = (button) => {
      const lookKey = button.getAttribute('data-look-key');
      if (!lookKey) return;
      const savedLooks = readSavedLooks();
      const isAlreadySaved = savedLooks.includes(lookKey);
      const nextLooks = isAlreadySaved ? savedLooks.filter((item) => item !== lookKey) : [...savedLooks, lookKey];
      if (!persistSavedLooks(nextLooks)) {
        announce('This look could not be saved on this device.');
        return;
      }
      button.textContent = isAlreadySaved ? 'Save this look' : 'Look saved';
      button.setAttribute('aria-pressed', String(!isAlreadySaved));
      announce(isAlreadySaved ? 'Look removed from saved looks.' : 'Look saved for later.');
      root.dispatchEvent(new CustomEvent('fieldJournal:look-save', {
        bubbles: true,
        detail: { look: lookKey, saved: !isAlreadySaved }
      }));
    };

    const filterShopCards = (filter) => {
      const cards = Array.from(root.querySelectorAll('[data-shop-card]'));
      cards.forEach((card) => {
        const categories = card.getAttribute('data-product-category') || '';
        card.hidden = filter !== 'all' && !categories.includes(filter);
      });
      Array.from(root.querySelectorAll('[data-shop-filter]')).forEach((button) => {
        button.setAttribute('aria-pressed', String(button.getAttribute('data-shop-filter') === filter));
      });
      announce(filter === 'all' ? 'Showing all products from this issue.' : `Showing ${filter} from this issue.`);
      root.dispatchEvent(new CustomEvent('fieldJournal:shop-filter', {
        bubbles: true,
        detail: { filter }
      }));
    };

    const updateChapterLinks = (chapterNumber) => {
      chapterLinks.forEach((link) => {
        link.setAttribute('aria-current', String(link.getAttribute('data-chapter-link') === chapterNumber));
      });
    };

    const handleClick = (event) => {
      const lookTrigger = event.target.closest('[data-look-open]');
      if (lookTrigger && root.contains(lookTrigger)) {
        event.preventDefault();
        openLook(lookTrigger);
        return;
      }

      const archiveTrigger = event.target.closest('[data-archive-open]');
      if (archiveTrigger && root.contains(archiveTrigger)) {
        event.preventDefault();
        openArchiveAt(Number(archiveTrigger.getAttribute('data-archive-index')) || 0, archiveTrigger);
        return;
      }

      const closeTrigger = event.target.closest('[data-dialog-close]');
      if (closeTrigger && root.contains(closeTrigger)) {
        event.preventDefault();
        closeDialog();
        return;
      }

      const previousTrigger = event.target.closest('[data-archive-previous]');
      if (previousTrigger && root.contains(previousTrigger)) {
        event.preventDefault();
        openArchiveAt(archiveIndex - 1, previousTrigger);
        return;
      }

      const nextTrigger = event.target.closest('[data-archive-next]');
      if (nextTrigger && root.contains(nextTrigger)) {
        event.preventDefault();
        openArchiveAt(archiveIndex + 1, nextTrigger);
        return;
      }

      const loadMoreTrigger = event.target.closest('[data-archive-load-more]');
      if (loadMoreTrigger && root.contains(loadMoreTrigger)) {
        event.preventDefault();
        revealArchiveItems();
        return;
      }

      const saveTrigger = event.target.closest('[data-look-save]');
      if (saveTrigger && root.contains(saveTrigger)) {
        event.preventDefault();
        saveLook(saveTrigger);
        return;
      }

      const filterTrigger = event.target.closest('[data-shop-filter]');
      if (filterTrigger && root.contains(filterTrigger)) {
        event.preventDefault();
        filterShopCards(filterTrigger.getAttribute('data-shop-filter') || 'all');
        return;
      }

      if (activeDialog && event.target === activeDialog) closeDialog();
    };

    const handleKeydown = (event) => {
      if (!activeDialog) return;
      if (event.key === 'Escape') {
        event.preventDefault();
        closeDialog();
        return;
      }
      trapFocus(event, activeDialog);
    };

    root.addEventListener('click', handleClick);
    document.addEventListener('keydown', handleKeydown);

    if ('IntersectionObserver' in window && chapters.length) {
      chapterObserver = new IntersectionObserver((entries) => {
        const visibleEntry = entries.find((entry) => entry.isIntersecting);
        if (visibleEntry) updateChapterLinks(visibleEntry.target.getAttribute('data-chapter-number'));
      }, { rootMargin: '-24% 0px -58% 0px', threshold: 0 });
      chapters.forEach((chapter) => chapterObserver.observe(chapter));
    }

    const cleanup = () => {
      root.removeEventListener('click', handleClick);
      document.removeEventListener('keydown', handleKeydown);
      if (chapterObserver) chapterObserver.disconnect();
      closeDialog();
      initialisedRoots.delete?.(root);
    };

    root.addEventListener('fieldJournal:destroy', cleanup, { once: true });
  }

  function initialiseAll(scope = document) {
    scope.querySelectorAll?.('[data-field-journal]').forEach(initialise);
    if (scope.matches?.('[data-field-journal]')) initialise(scope);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => initialiseAll(), { once: true });
  } else {
    initialiseAll();
  }

  document.addEventListener('shopify:section:load', (event) => initialiseAll(event.target));
  document.addEventListener('shopify:section:unload', (event) => {
    const root = event.target?.querySelector?.('[data-field-journal]') || (event.target?.matches?.('[data-field-journal]') ? event.target : null);
    if (root) root.dispatchEvent(new CustomEvent('fieldJournal:destroy'));
  });
})();
