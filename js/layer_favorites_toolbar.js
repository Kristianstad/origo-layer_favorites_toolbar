// Layer Favorites Toolbar – Initialization function (called only when viewer is loaded)
// Modes: 'layers' (lagerfavoriter) and 'bookmarks' (centrumkoordinat + zoomnivå)
function initLayerFavoritesToolbar() {
  if (typeof window.__lftCleanup === 'function') {
    window.__lftCleanup();
  }

  const ac = new AbortController();
  const { signal } = ac;
  const SVG_NS = 'http://www.w3.org/2000/svg';
  const XLINK_NS = 'http://www.w3.org/1999/xlink';

  const docPrefix = location.pathname.replace(/[\/\\]/g, '_') + '_';

  let autoClearMode = JSON.parse(localStorage.getItem(docPrefix + 'autoClearMode') || 'false');
  let lockedMode = JSON.parse(localStorage.getItem(docPrefix + 'lockedMode') || 'false');
  let toolbarMode = localStorage.getItem(docPrefix + 'toolbarMode') === 'bookmarks' ? 'bookmarks' : 'layers';

  const isBookmarks = () => toolbarMode === 'bookmarks';
  const idsKey = () => docPrefix + (isBookmarks() ? 'savedBookmarksIds' : 'savedLayersIds');
  const itemKey = (id) => docPrefix + (isBookmarks() ? 'savedBookmarks_' : 'savedLayers_') + id;
  const persist = (key, value) => localStorage.setItem(docPrefix + key, value);
  const readIds = () => JSON.parse(localStorage.getItem(idsKey()) || '[]');

  const isOverlayLayer = (layer) =>
    layer.get('group') !== 'background' && layer.get('group') !== 'rit' && layer.get('name') !== 'measure';

  const visibleOverlays = () =>
    origo.api().getLayersByProperty('visible', true).filter(isOverlayLayer);

  const performClear = () => {
    visibleOverlays().forEach((layer) => layer.setVisible(false));
  };

  const getView = () => origo.api().getMap().getView();

  const captureView = () => {
    const view = getView();
    const center = view.getCenter();
    const zoom = view.getZoom();
    if (!center || typeof zoom !== 'number') return null;
    return { center: center.slice(), zoom };
  };

  const restoreView = ({ center, zoom }) => {
    const view = getView();
    view.setCenter(center);
    view.setZoom(zoom);
  };

  const setUseHref = (useEl, href) => {
    useEl.setAttributeNS(XLINK_NS, 'xlink:href', href);
    useEl.setAttribute('href', href);
  };

  const createIconButton = (className, href) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = className;
    const svg = document.createElementNS(SVG_NS, 'svg');
    svg.setAttribute('width', '18');
    svg.setAttribute('height', '18');
    svg.setAttribute('viewBox', '0 0 24 24');
    const useEl = document.createElementNS(SVG_NS, 'use');
    setUseHref(useEl, href);
    svg.appendChild(useEl);
    button.appendChild(svg);
    return { button, useEl };
  };

  /* Create top-bar */
  const topBar = document.createElement('div');
  topBar.id = 'layer-favorites-toolbar';
  topBar.className = 'top-bar hidden no-transition';

  const { button: modeButton, useEl: modeUseIcon } = createIconButton('mode-button', '#ic_layers_24px');

  /* LOCK – far right */
  const lockButton = document.createElement('button');
  lockButton.type = 'button';
  lockButton.className = 'lock-button';
  const lockSvg = document.createElementNS(SVG_NS, 'svg');
  lockSvg.setAttribute('width', '18');
  lockSvg.setAttribute('height', '18');
  lockSvg.setAttribute('viewBox', '0 0 24 24');
  const lockPath = document.createElementNS(SVG_NS, 'path');
  lockSvg.appendChild(lockPath);
  lockButton.appendChild(lockSvg);

  const { button: clearButton, useEl: clearUseIcon } = createIconButton('clear-button', '#ic_visibility_off_24px');

  const updateClearButtonAppearance = () => {
    if (autoClearMode) {
      clearButton.classList.add('auto-clear-active');
      clearButton.title = 'Släck alla lager - Autosläck PÅ';
    } else {
      clearButton.classList.remove('auto-clear-active');
      clearButton.title = 'Släck alla lager - Autosläck AV';
    }
  };

  const toggleAutoClear = () => {
    autoClearMode = !autoClearMode;
    persist('autoClearMode', JSON.stringify(autoClearMode));
    updateClearButtonAppearance();
  };

  const previousViews = [];

  const updateUndoButton = () => {
    if (!isBookmarks()) return;
    const hasPrev = previousViews.length > 0;
    clearButton.disabled = !hasPrev;
    clearButton.title = hasPrev
      ? 'Gå tillbaka till föregående plats'
      : 'Ingen tidigare plats att gå tillbaka till';
  };

  const goBack = () => {
    const prev = previousViews.pop();
    if (prev) restoreView(prev);
    updateUndoButton();
  };

  /* Single click: clear layers (layer mode) or go back (bookmark mode).
     Double click / long press: toggle Auto-clear without clearing. */
  let clickCount = 0;
  let clickTimer = null;
  let suppressClick = false;

  clearButton.addEventListener('click', () => {
    if (suppressClick) {
      suppressClick = false;
      return;
    }
    if (isBookmarks()) {
      goBack();
      return;
    }
    clickCount++;
    if (clickCount === 1) {
      clickTimer = setTimeout(() => {
        clickCount = 0;
        performClear();
      }, 300);
    } else if (clickCount === 2) {
      clearTimeout(clickTimer);
      clickCount = 0;
      toggleAutoClear();
    }
  }, { signal });

  /* Long press on touch */
  let longPressTimer = null;
  let longPressPointerId = null;
  let longPressStartY = null;

  const cancelLongPress = () => {
    clearTimeout(longPressTimer);
    longPressPointerId = null;
    longPressStartY = null;
  };

  clearButton.addEventListener('pointerdown', (e) => {
    if (isBookmarks()) return;
    if (e.pointerType !== 'touch') return;
    if (longPressPointerId !== null) return;

    longPressPointerId = e.pointerId;
    longPressStartY = e.clientY;

    longPressTimer = setTimeout(() => {
      toggleAutoClear();
      longPressPointerId = null;
      longPressStartY = null;
      suppressClick = true;
    }, 500);
  }, { passive: true, signal });

  clearButton.addEventListener('pointerup', (e) => {
    if (e.pointerId === longPressPointerId) cancelLongPress();
  }, { passive: true, signal });

  clearButton.addEventListener('pointercancel', (e) => {
    if (e.pointerId === longPressPointerId) cancelLongPress();
  }, { passive: true, signal });

  clearButton.addEventListener('pointermove', (e) => {
    if (longPressPointerId === null || e.pointerId !== longPressPointerId) return;
    if (Math.abs(e.clientY - longPressStartY) > 10) cancelLongPress();
  }, { passive: true, signal });

  /* Dropdown for loading favorites / bookmarks */
  const loadSelect = document.createElement('select');
  loadSelect.title = 'Välj lagerfavorit att tända';
  loadSelect.innerHTML = '<option value="">Tänd lagerfavorit...</option>';

  const updateSelectColor = () => {
    loadSelect.style.color = loadSelect.value === '' ? '#ccc' : '#000';
  };

  const updateDropdown = () => {
    const emptyLabel = isBookmarks() ? 'Gå till bokmärke...' : 'Tänd lagerfavorit...';
    loadSelect.innerHTML = '<option value="">' + emptyLabel + '</option>';
    readIds().forEach((id) => {
      const opt = document.createElement('option');
      opt.value = id;
      opt.textContent = id;
      loadSelect.appendChild(opt);
    });
    updateSelectColor();
  };

  const loadBookmark = (id) => {
    const raw = localStorage.getItem(itemKey(id));
    if (!raw) return;
    try {
      const saved = JSON.parse(raw);
      if (!saved || !Array.isArray(saved.center) || typeof saved.zoom !== 'number') return;
      const current = captureView();
      if (current) previousViews.push(current);
      restoreView(saved);
      updateUndoButton();
    } catch {
      /* ignore corrupt bookmark */
    }
  };

  const loadLayers = (id) => {
    if (autoClearMode) performClear();
    const saved = localStorage.getItem(itemKey(id)) || '';
    saved.split(',').forEach((name) => name && origo.api().getLayer(name)?.setVisible(true));
  };

  loadSelect.onchange = () => {
    const id = loadSelect.value;
    if (!id) return;
    if (isBookmarks()) loadBookmark(id);
    else loadLayers(id);
    loadSelect.value = '';
    updateSelectColor();
  };

  /* Input + Save + Delete */
  const saveInput = document.createElement('input');
  saveInput.type = 'text';
  saveInput.placeholder = 'Lagerfavorit';
  saveInput.title = 'Ange lagerfavorit att skapa, skriva över eller radera';
  saveInput.autocomplete = 'off';
  saveInput.spellcheck = false;

  const { button: saveButton } = createIconButton('save-button', '#ic_save_24px');
  saveButton.title = 'Spara/skriv över angiven lagerfavorit';

  const rememberId = (id) => {
    const ids = readIds();
    if (!ids.includes(id)) {
      ids.push(id);
      localStorage.setItem(idsKey(), JSON.stringify(ids));
    }
  };

  saveButton.onclick = () => {
    const id = saveInput.value.trim();
    if (!id) return;
    if (isBookmarks()) {
      const snap = captureView();
      if (!snap) return;
      localStorage.setItem(itemKey(id), JSON.stringify(snap));
    } else {
      localStorage.setItem(itemKey(id), visibleOverlays().map((l) => l.get('name')).join(','));
    }
    rememberId(id);
    updateDropdown();
    saveInput.value = '';
  };

  const { button: deleteButton } = createIconButton('delete-button', '#ic_delete_24px');
  deleteButton.title = 'Radera angiven lagerfavorit';

  deleteButton.onclick = () => {
    const id = saveInput.value.trim();
    if (!id) return;
    localStorage.removeItem(itemKey(id));
    localStorage.setItem(idsKey(), JSON.stringify(readIds().filter((x) => x !== id)));
    updateDropdown();
    saveInput.value = '';
  };

  const leftGroup = document.createElement('div');
  leftGroup.className = 'group-container';
  const rightGroup = document.createElement('div');
  rightGroup.className = 'group-container';
  leftGroup.append(modeButton, clearButton, loadSelect);
  rightGroup.append(saveInput, saveButton, deleteButton, lockButton);
  topBar.append(leftGroup, rightGroup);
  document.body.appendChild(topBar);

  const hoverTrigger = document.createElement('div');
  hoverTrigger.className = 'hover-trigger';
  document.body.appendChild(hoverTrigger);

  const updateTrigger = () => {
    hoverTrigger.style.width = `${topBar.getBoundingClientRect().width}px`;
    hoverTrigger.style.left = '50%';
    hoverTrigger.style.transform = 'translateX(-50%)';
  };
  updateTrigger();
  window.addEventListener('resize', updateTrigger, { signal });

  setTimeout(() => {
    topBar.classList.remove('no-transition');
  }, 0);

  const updateLockButton = () => {
    if (lockedMode) {
      lockPath.setAttribute('d', 'M18 8h-1V6c0-2.76-2.24-5-5-5s-5 2.24-5 5v2H6c-1.1 0-2 .9-2 2v10c0 1.1 .9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z');
      lockButton.classList.add('locked');
      lockButton.title = 'Aktivera auto-göm för verktygsfältet Lagerfavoriter';
    } else {
      lockPath.setAttribute('d', 'M19 10h-1V7c0-2.76-2.24-5-5-5s-5 2.24-5 5h2c0-1.66 1.34-3 3-3s3 1.34 3 3v3H5c-1.1 0-2 .9-2 2v8c0 1.1 .9 2 2 2h14c1.1 0 2-.9 2-2v-8c0-1.1-.9-2-2-2zm-7 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z');
      lockButton.classList.remove('locked');
      lockButton.title = 'Lås fast verktygsfältet Lagerfavoriter';
    }
  };

  lockButton.onclick = () => {
    lockedMode = !lockedMode;
    persist('lockedMode', JSON.stringify(lockedMode));
    updateLockButton();
    if (lockedMode) showTopBarAndPushCenter();
  };

  /* AUTO-HIDE */
  let hideTimeout = null;
  let lastMouseX = null;
  let lastMouseY = null;
  document.addEventListener('mousemove', (e) => {
    lastMouseX = e.clientX;
    lastMouseY = e.clientY;
  }, { signal });

  const hideTopBarAndResetCenter = () => {
    if (lockedMode) return;
    topBar.classList.add('hidden');
    document.querySelector('.o-ui .top-center')?.classList.remove('top-bar-visible');
  };

  const showTopBarAndPushCenter = () => {
    clearTimeout(hideTimeout);
    topBar.classList.remove('hidden');
    document.querySelector('.o-ui .top-center')?.classList.add('top-bar-visible');
  };

  const showTopBar = showTopBarAndPushCenter;
  const toolbarControls = [saveInput, saveButton, loadSelect, clearButton, deleteButton, lockButton, modeButton];

  const hideTopBar = (e) => {
    if (lockedMode) return;
    if (e?.relatedTarget && (topBar.contains(e.relatedTarget) || hoverTrigger.contains(e.relatedTarget))) return;
    if (toolbarControls.includes(document.activeElement)) return;
    hideTimeout = setTimeout(() => {
      if (lastMouseX !== null && document.elementFromPoint(lastMouseX, lastMouseY)?.closest('.top-bar, .hover-trigger')) return;
      hideTopBarAndResetCenter();
    }, 1000);
  };

  const applyMode = () => {
    const bookmarks = isBookmarks();
    setUseHref(modeUseIcon, bookmarks ? '#ic_bookmark_24px' : '#ic_layers_24px');
    modeButton.title = bookmarks
      ? 'Läge: bokmärken — klicka för lagerfavoriter'
      : 'Läge: lagerfavoriter — klicka för bokmärken';
    modeButton.setAttribute('aria-label', modeButton.title);
    modeButton.setAttribute('aria-pressed', bookmarks ? 'true' : 'false');

    saveInput.placeholder = bookmarks ? 'Bokmärke' : 'Lagerfavorit';
    saveInput.title = bookmarks
      ? 'Ange bokmärke att skapa, skriva över eller radera'
      : 'Ange lagerfavorit att skapa, skriva över eller radera';
    saveButton.title = bookmarks
      ? 'Spara/skriv över angivet bokmärke'
      : 'Spara/skriv över angiven lagerfavorit';
    deleteButton.title = bookmarks
      ? 'Radera angivet bokmärke'
      : 'Radera angiven lagerfavorit';
    loadSelect.title = bookmarks
      ? 'Välj bokmärke att gå till'
      : 'Välj lagerfavorit att tända';

    if (bookmarks) {
      clearButton.classList.remove('clear-button', 'auto-clear-active');
      clearButton.classList.add('undo-button');
      setUseHref(clearUseIcon, '#ic_undo_24px');
      updateUndoButton();
    } else {
      clearButton.classList.remove('undo-button');
      clearButton.classList.add('clear-button');
      clearButton.disabled = false;
      setUseHref(clearUseIcon, '#ic_visibility_off_24px');
      updateClearButtonAppearance();
    }

    saveInput.value = '';
    updateDropdown();
    updateTrigger();
    document.dispatchEvent(new CustomEvent('layer-favorites-mode', { detail: { mode: toolbarMode } }));
  };

  modeButton.onclick = () => {
    toolbarMode = isBookmarks() ? 'layers' : 'bookmarks';
    persist('toolbarMode', toolbarMode);
    applyMode();
    showTopBarAndPushCenter();
  };

  toolbarControls.forEach((el) => {
    el.addEventListener('mouseenter', showTopBar, { signal });
    el.addEventListener('focus', showTopBar, { signal });
  });
  loadSelect.addEventListener('mousedown', showTopBar, { signal });
  saveInput.addEventListener('mousedown', showTopBar, { signal });
  topBar.addEventListener('mousemove', showTopBar, { signal });

  let touchStartY = null;
  let touchStartedInTrigger = false;
  document.addEventListener('touchstart', (e) => {
    const t = e.touches[0];
    touchStartY = t.clientY;
    const r = hoverTrigger.getBoundingClientRect();
    touchStartedInTrigger = t.clientY >= r.top && t.clientY <= r.bottom && t.clientX >= r.left && t.clientX <= r.right;
  }, { passive: true, signal });

  document.addEventListener('touchend', (e) => {
    if (lockedMode) return;
    const t = e.changedTouches[0];
    const endY = t.clientY;
    const threshold = window.innerWidth <= 768 ? 15 : 20;
    if (touchStartedInTrigger && endY > touchStartY) {
      e.preventDefault();
      showTopBarAndPushCenter();
    } else if (endY <= threshold && touchStartY > endY && document.activeElement !== saveInput) {
      e.preventDefault();
      clearTimeout(hideTimeout);
      hideTopBarAndResetCenter();
    }
    touchStartY = null;
    touchStartedInTrigger = false;
  }, { signal });

  hoverTrigger.addEventListener('mouseenter', showTopBar, { passive: true, signal });
  topBar.addEventListener('mouseenter', showTopBar, { passive: true, signal });
  topBar.addEventListener('mouseleave', hideTopBar, { signal });
  document.addEventListener('mouseleave', hideTopBar, { signal });
  document.addEventListener('click', (e) => {
    if (lockedMode) return;
    if (!topBar.contains(e.target) && document.activeElement !== saveInput) {
      clearTimeout(hideTimeout);
      hideTopBarAndResetCenter();
    }
  }, { signal });

  [loadSelect, saveButton, deleteButton].forEach((el) => el.addEventListener('change', updateTrigger, { signal }));
  [saveButton, deleteButton].forEach((el) => el.addEventListener('click', updateTrigger, { signal }));

  window.__lftCleanup = () => {
    ac.abort();
    clearTimeout(hideTimeout);
    clearTimeout(clickTimer);
    clearTimeout(longPressTimer);
    topBar.remove();
    hoverTrigger.remove();
    window.__lftCleanup = undefined;
  };

  applyMode();
  updateLockButton();

  if (lockedMode) {
    setTimeout(showTopBarAndPushCenter, 50);
  }
}
