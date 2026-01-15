// Layer Favorites Toolbar – Initialization function (called only when viewer is loaded )
function initLayerFavoritesToolbar() {
  /* Generate document-specific prefix for localStorage keys */
  const docPrefix = location.pathname.replace(/[\/\\]/g, '_') + '_';

  /* AUTO-CLEAR MODE */
  let autoClearMode = JSON.parse(localStorage.getItem(docPrefix + 'autoClearMode') || 'false');

  /* LOCKED MODE */
  let lockedMode = JSON.parse(localStorage.getItem(docPrefix + 'lockedMode') || 'false');

  /* Function to turn off layers */
  const performClear = () => {
    origo.api().getLayersByProperty('visible', true)
      .filter((layer) => layer.get('group') !== 'background' && layer.get('group') !== 'rit' && layer.get('name') !== 'measure')
      .forEach(layer => layer.setVisible(false));
  };

  /* Update appearance of clear button */
  const updateClearButtonAppearance = () => {
    if (autoClearMode) {
      clearButton.classList.add('auto-clear-active');
      clearButton.title = 'Släck alla lager - Autosläck PÅ';
    } else {
      clearButton.classList.remove('auto-clear-active');
      clearButton.title = 'Släck alla lager - Autosläck AV';
    }
  };

  /* Save Auto-clear mode */
  const saveAutoClearMode = () => {
    localStorage.setItem(docPrefix + 'autoClearMode', JSON.stringify(autoClearMode));
  };

  /* Save Locked mode */
  const saveLockedMode = () => {
    localStorage.setItem(docPrefix + 'lockedMode', JSON.stringify(lockedMode));
  };

  /* Create top-bar */
  const topBar = document.createElement('div');
  topBar.className = 'top-bar no-transition';

  /* LOCK ICON – left of clear button */
  const lockButton = document.createElement('button');
  lockButton.className = 'lock-button';
  const lockSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  lockSvg.setAttribute('width', '18');
  lockSvg.setAttribute('height', '18');
  lockSvg.setAttribute('viewBox', '0 0 24 24');
  const lockPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  lockSvg.appendChild(lockPath);
  lockButton.appendChild(lockSvg);

  /* Clear button */
  const clearButton = document.createElement('button');
  clearButton.className = 'clear-button';
  const clearSvgIcon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  clearSvgIcon.setAttribute('width', '18');
  clearSvgIcon.setAttribute('height', '18');
  const clearUseIcon = document.createElementNS('http://www.w3.org/2000/svg', 'use');
  clearUseIcon.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', '#ic_visibility_off_24px');
  clearSvgIcon.appendChild(clearUseIcon);
  clearButton.appendChild(clearSvgIcon);

  /* Single click: clear layers */
  clearButton.onclick = () => {
    performClear();
  };

  /* Double click / long press: toggle Auto-clear */
  let clickCount = 0;
  let clickTimer = null;
  clearButton.addEventListener('click', (e) => {
    clickCount++;
    if (clickCount === 1) {
      clickTimer = setTimeout(() => clickCount = 0, 300);
    } else if (clickCount === 2) {
      clearTimeout(clickTimer);
      clickCount = 0;
      autoClearMode = !autoClearMode;
      saveAutoClearMode();
      updateClearButtonAppearance();
    }
  });

  /* Long press on touch */
  let longPressTimer = null;
  let longPressPointerId = null;
  let longPressStartY = null;

  clearButton.addEventListener('pointerdown', e => {
    if (e.pointerType !== 'touch') return;
    if (longPressPointerId !== null) return; // already tracking one touch

    longPressPointerId = e.pointerId;
    longPressStartY = e.clientY;

    longPressTimer = setTimeout(() => {
      autoClearMode = !autoClearMode;
      saveAutoClearMode();
      updateClearButtonAppearance();
      longPressPointerId = null;
      longPressStartY = null;
    }, 500);
  }, { passive: true });

  const cancelLongPress = () => {
    clearTimeout(longPressTimer);
    longPressPointerId = null;
    longPressStartY = null;
  };

  clearButton.addEventListener('pointerup', e => {
    if (e.pointerId === longPressPointerId) cancelLongPress();
  }, { passive: true });

  clearButton.addEventListener('pointercancel', e => {
    if (e.pointerId === longPressPointerId) cancelLongPress();
  }, { passive: true });

  clearButton.addEventListener('pointermove', e => {
    if (longPressPointerId === null || e.pointerId !== longPressPointerId) return;
    if (Math.abs(e.clientY - longPressStartY) > 10) {
      cancelLongPress();
    }
  }, { passive: true });

  /* Dropdown for loading favorites */
  const loadSelect = document.createElement('select');
  loadSelect.title = 'Välj lagerfavorit att tända';
  loadSelect.innerHTML = '<option value="">Tänd lagerfavorit...</option>';
  const updateSelectColor = () => {
    loadSelect.style.color = loadSelect.value === '' ? '#ccc' : '#000';
  };

  const updateDropdown = () => {
    const savedIds = JSON.parse(localStorage.getItem(docPrefix + 'savedLayersIds') || '[]');
    loadSelect.innerHTML = '<option value="">Tänd lagerfavorit...</option>';
    savedIds.forEach(id => {
      const opt = document.createElement('option');
      opt.value = id;
      opt.textContent = id;
      loadSelect.appendChild(opt);
    });
    updateSelectColor();
  };

  loadSelect.onchange = () => {
    const id = loadSelect.value;
    if (id) {
      if (autoClearMode) performClear();
      const saved = localStorage.getItem(docPrefix + 'savedLayers_' + id) || '';
      saved.split(',').forEach(name => name && origo.api().getLayer(name)?.setVisible(true));
      loadSelect.value = '';
      updateSelectColor();
    }
  };

  /* Input + Save + Delete buttons */
  const saveInput = document.createElement('input');
  saveInput.type = 'text';
  saveInput.placeholder = 'Lagerfavorit';
  saveInput.title = 'Ange lagerfavorit att skapa, skriva över eller radera';

  const saveButton = document.createElement('button');
  saveButton.className = 'save-button';
  saveButton.title = 'Spara/skriv över angiven lagerfavorit';
  const saveSvgIcon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  saveSvgIcon.setAttribute('width', '18');
  saveSvgIcon.setAttribute('height', '18');
  const saveUseIcon = document.createElementNS('http://www.w3.org/2000/svg', 'use');
  saveUseIcon.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', '#ic_save_24px');
  saveSvgIcon.appendChild(saveUseIcon);
  saveButton.appendChild(saveSvgIcon);

  saveButton.onclick = () => {
    const id = saveInput.value.trim();
    if (!id) return;
    const layers = origo.api().getLayersByProperty('visible', true)
      .filter(l => l.get('group') !== 'background' && l.get('group') !== 'rit' && l.get('name') !== 'measure')
      .map(l => l.getProperties().name).join(',');
    localStorage.setItem(docPrefix + 'savedLayers_' + id, layers);
    const ids = JSON.parse(localStorage.getItem(docPrefix + 'savedLayersIds') || '[]');
    if (!ids.includes(id)) {
      ids.push(id);
      localStorage.setItem(docPrefix + 'savedLayersIds', JSON.stringify(ids));
    }
    updateDropdown();
    saveInput.value = '';
  };

  const deleteButton = document.createElement('button');
  deleteButton.className = 'delete-button';
  deleteButton.title = 'Radera angiven lagerfavorit';
  const deleteSvgIcon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  deleteSvgIcon.setAttribute('width', '18');
  deleteSvgIcon.setAttribute('height', '18');
  const deleteUseIcon = document.createElementNS('http://www.w3.org/2000/svg', 'use');
  deleteUseIcon.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', '#ic_delete_24px');
  deleteSvgIcon.appendChild(deleteUseIcon);
  deleteButton.appendChild(deleteSvgIcon);

  deleteButton.onclick = () => {
    const id = saveInput.value.trim();
    if (!id) return;
    localStorage.removeItem(docPrefix + 'savedLayers_' + id);
    const ids = JSON.parse(localStorage.getItem(docPrefix + 'savedLayersIds') || '[]');
    localStorage.setItem(docPrefix + 'savedLayersIds', JSON.stringify(ids.filter(x => x !== id)));
    updateDropdown();
    saveInput.value = '';
  };

  /* Groups */
  const leftGroup = document.createElement('div');
  leftGroup.className = 'group-container';
  const rightGroup = document.createElement('div');
  rightGroup.className = 'group-container';
  leftGroup.appendChild(lockButton);
  leftGroup.appendChild(clearButton);
  leftGroup.appendChild(loadSelect);
  rightGroup.appendChild(saveInput);
  rightGroup.appendChild(saveButton);
  rightGroup.appendChild(deleteButton);
  topBar.appendChild(leftGroup);
  topBar.appendChild(rightGroup);
  document.body.appendChild(topBar);

  /* Hover-trigger area */
  const hoverTrigger = document.createElement('div');
  hoverTrigger.className = 'hover-trigger';
  document.body.appendChild(hoverTrigger);

  const updateTrigger = () => {
    const barRect = topBar.getBoundingClientRect();
    hoverTrigger.style.width = `${barRect.width}px`;
    hoverTrigger.style.left = '50%';
    hoverTrigger.style.transform = 'translateX(-50%)';
  };
  updateTrigger();
  window.addEventListener('resize', updateTrigger);

  setTimeout(() => {
    topBar.className = topBar.className.replace('no-transition', '');
  }, 0);

  /* Update lock icon */
  const updateLockButton = () => {
    if (lockedMode) {
      /* LOCKED – closed padlock */
      lockPath.setAttribute('d', 'M18 8h-1V6c0-2.76-2.24-5-5-5s-5 2.24-5 5v2H6c-1.1 0-2 .9-2 2v10c0 1.1 .9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z');
      lockButton.classList.add('locked');
      lockButton.title = 'Aktivera auto-göm för verktygsfältet Lagerfavoriter';
    } else {
      /* UNLOCKED – open shackle */
      lockPath.setAttribute('d', 'M19 10h-1V7c0-2.76-2.24-5-5-5s-5 2.24-5 5h2c0-1.66 1.34-3 3-3s3 1.34 3 3v3H5c-1.1 0-2 .9-2 2v8c0 1.1 .9 2 2 2h14c1.1 0 2-.9 2-2v-8c0-1.1-.9-2-2-2zm-7 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z');
      lockButton.classList.remove('locked');
      lockButton.title = 'Lås fast verktygsfältet Lagerfavoriter';
    }
  };

  /* Click on lock icon */
  lockButton.onclick = () => {
    lockedMode = !lockedMode;
    saveLockedMode();
    updateLockButton();
    if (lockedMode) showTopBarAndPushCenter();
  };

  /* AUTO-HIDE LOGIC */
  let hideTimeout = null;
  let lastMouseX = null;
  let lastMouseY = null;
  document.addEventListener('mousemove', e => { lastMouseX = e.clientX; lastMouseY = e.clientY; });

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

  const hideTopBar = e => {
    if (lockedMode) return;
    if (e?.relatedTarget && (topBar.contains(e.relatedTarget) || hoverTrigger.contains(e.relatedTarget))) return;
    if ([saveInput, saveButton, loadSelect, clearButton, deleteButton, lockButton].includes(document.activeElement)) return;
    hideTimeout = setTimeout(() => {
      if (lastMouseX !== null && document.elementFromPoint(lastMouseX, lastMouseY)?.closest('.top-bar, .hover-trigger')) return;
      hideTopBarAndResetCenter();
    }, 1000);
  };

  /* Event listeners for showing the bar */
  [clearButton, loadSelect, saveInput, saveButton, deleteButton, lockButton].forEach(el => {
    el.addEventListener('mouseenter', showTopBar);
    el.addEventListener('focus', showTopBar);
  });
  loadSelect.addEventListener('mousedown', showTopBar);
  saveInput.addEventListener('mousedown', showTopBar);
  topBar.addEventListener('mousemove', showTopBar);
  lockButton.addEventListener('mouseenter', showTopBar);

  let touchStartY = null;
  let touchStartedInTrigger = false;
  document.addEventListener('touchstart', e => {
    const t = e.touches[0];
    touchStartY = t.clientY;
    const r = hoverTrigger.getBoundingClientRect();
    touchStartedInTrigger = t.clientY >= r.top && t.clientY <= r.bottom && t.clientX >= r.left && t.clientX <= r.right;
  }, { passive: true });

  document.addEventListener('touchend', e => {
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
  });
  
  hoverTrigger.addEventListener('mouseenter', showTopBar, { passive: true });
  topBar.addEventListener('mouseenter', showTopBar, { passive: true });
  topBar.addEventListener('mouseleave', hideTopBar);
  document.addEventListener('mouseleave', hideTopBar);
  document.addEventListener('click', e => {
    if (lockedMode) return;
    if (!topBar.contains(e.target) && document.activeElement !== saveInput) {
      clearTimeout(hideTimeout);
      hideTopBarAndResetCenter();
    }
  });

  [loadSelect, saveButton, deleteButton].forEach(el => el.addEventListener('change', updateTrigger));
  [saveButton, deleteButton].forEach(el => el.addEventListener('click', updateTrigger));

  /* Initialisation */
  topBar.className = 'top-bar hidden no-transition';
  updateDropdown();
  updateClearButtonAppearance();
  updateLockButton();

  /* SHOW TOP-BAR IMMEDIATELY IF LOCKED */
  if (lockedMode) {
    setTimeout(() => {
      showTopBarAndPushCenter();
    }, 50);
  }
}
