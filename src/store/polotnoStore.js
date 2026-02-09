import { createStore } from 'polotno/model/store';
// import { setAnimationsEnabled } from 'polotno/config';

import { reaction } from 'mobx';

import {
  DEFAULT_PRESET,
  getPreset,
  getPresetScale,
  getStorePresetName,
  getStoreWorkingSize,
} from '../utils/scale';
import { detectPresetFromDimensions, getStoreExportScale } from '../utils/scale';
import {
  applySlideBackgroundToPage,
  inferSlideBackgroundFromPage,
  normalizeSlideBackground,
} from '../utils/slideBackground';

export const store = createStore({
  key: 'TXsh4gxnlODn4eJrqeDi',
  showCredit: true,
});

const isPageActive = (page) => {
  return page?.custom?.isActive !== false;
};

const ensurePageIsActiveFlag = (page) => {
  if (!page || typeof page.set !== 'function') return;
  const custom = page.custom || {};
  if (custom.isActive === undefined) {
    page.set({ custom: { ...custom, isActive: true } });
  }
};

const ensurePageBackgroundObject = (page) => {
  if (!page || typeof page.set !== 'function') return;
  const custom = page.custom || {};
  if (custom.background === undefined) {
    const inferred = inferSlideBackgroundFromPage(page);
    page.set({ custom: { ...custom, background: inferred } });
  } else {
    // Normalize in place to keep schema stable.
    const normalized = normalizeSlideBackground(custom.background);
    try {
      const a = JSON.stringify(normalized);
      const b = JSON.stringify(custom.background);
      if (a !== b) {
        page.set({ custom: { ...custom, background: normalized } });
      }
    } catch {
      // If stringify fails for some reason, do a best-effort update.
      page.set({ custom: { ...custom, background: normalized } });
    }
  }
};

const SCALE_KEYS = [
  'width',
  'height',
  'x',
  'y',
  'rx',
  'ry',
  'fontSize',
  'padding',
  'paddingX',
  'paddingY',
  'strokeWidth',
  'cornerRadius',
  'backgroundCornerRadius',
  'borderRadius',
  'shadowBlur',
  'shadowOffsetX',
  'shadowOffsetY',
  'clipX',
  'clipY',
  'clipWidth',
  'clipHeight',
  'spacing',
  'gap',
  'indent',
  // sometimes present
  'blurRadius',
  'radius',
];

const shouldScaleLineHeight = (v) => Number.isFinite(v) && v > 10;
const shouldScaleLetterSpacing = (v) => Number.isFinite(v) && v > 5;

const scaleNumericArray = (arr, factor) => {
  if (!Array.isArray(arr) || !arr.every((v) => Number.isFinite(v))) return null;
  return arr.map((v) => v * factor);
};

const rescaleElementInPlace = (el, factor, { root = false, oldCenterX = 0, oldCenterY = 0, newCenterX = 0, newCenterY = 0 } = {}) => {
  if (!el || typeof el.set !== 'function') return;

  const patch = {};

  // Position
  if (typeof el.x === 'number') {
    patch.x = root ? (el.x - oldCenterX) * factor + newCenterX : el.x * factor;
  }
  if (typeof el.y === 'number') {
    patch.y = root ? (el.y - oldCenterY) * factor + newCenterY : el.y * factor;
  }

  // Standard numeric props
  for (const key of SCALE_KEYS) {
    if (key === 'x' || key === 'y') continue;
    const v = el[key];
    if (typeof v === 'number' && Number.isFinite(v)) {
      patch[key] = v * factor;
    }
  }

  // Text-like special cases
  if (typeof el.lineHeight === 'number' && shouldScaleLineHeight(el.lineHeight)) {
    patch.lineHeight = el.lineHeight * factor;
  }
  if (typeof el.letterSpacing === 'number' && shouldScaleLetterSpacing(el.letterSpacing)) {
    patch.letterSpacing = el.letterSpacing * factor;
  }

  // Arrays
  if (Array.isArray(el.points)) {
    const next = scaleNumericArray(el.points, factor);
    if (next) patch.points = next;
  }
  if (Array.isArray(el.dash)) {
    const next = scaleNumericArray(el.dash, factor);
    if (next) patch.dash = next;
  }
  if (Array.isArray(el.dashArray)) {
    const next = scaleNumericArray(el.dashArray, factor);
    if (next) patch.dashArray = next;
  }

  // NOTE: crop* are ratios (0..1) -> do NOT scale.

  if (Object.keys(patch).length > 0) {
    el.set(patch);
  }

  // Recurse into group children if present.
  const children = Array.isArray(el.children) ? el.children : null;
  if (children) {
    children.forEach((child) => rescaleElementInPlace(child, factor, { root: false }));
  }
};

const rescaleAllPagesToNewCanvas = (nextWorkingWidth, nextWorkingHeight) => {
  const oldW = Number(store.width);
  const oldH = Number(store.height);
  if (!Number.isFinite(oldW) || !Number.isFinite(oldH) || oldW <= 0 || oldH <= 0) return;

  const newW = Number(nextWorkingWidth);
  const newH = Number(nextWorkingHeight);
  if (!Number.isFinite(newW) || !Number.isFinite(newH) || newW <= 0 || newH <= 0) return;

  const factor = Math.min(newW / oldW, newH / oldH);
  const oldCenterX = oldW / 2;
  const oldCenterY = oldH / 2;
  const newCenterX = newW / 2;
  const newCenterY = newH / 2;

  const pages = Array.isArray(store.pages) ? store.pages : [];
  pages.forEach((page) => {
    const children = Array.isArray(page?.children) ? page.children : [];
    children.forEach((el) =>
      rescaleElementInPlace(el, factor, { root: true, oldCenterX, oldCenterY, newCenterX, newCenterY })
    );
  });
};

export const setStorePreset = (targetStore, presetName, options = {}) => {
  const name = typeof presetName === 'string' ? presetName : DEFAULT_PRESET;
  const preset = getPreset(name);
  const rescaleExisting = options.rescaleExisting !== false;

  const currentPreset = getStorePresetName(targetStore);

  // Important: after loading an export-sized template, the actual store canvas can be in export units
  // even if preset metadata is still the same. Base rescaling on the real canvas size, not just metadata.
  const currentCanvasW = Number(targetStore?.width);
  const currentCanvasH = Number(targetStore?.height);
  const needsCanvasResize =
    Number.isFinite(currentCanvasW) &&
    Number.isFinite(currentCanvasH) &&
    (currentCanvasW !== preset.working.width || currentCanvasH !== preset.working.height);

  const currentWorking = getStoreWorkingSize(targetStore);
  const needsPresetResize = currentWorking.width !== preset.working.width || currentWorking.height !== preset.working.height;

  if (rescaleExisting && (needsCanvasResize || needsPresetResize)) {
    // Rescale existing elements to fit+center into the new working canvas.
    rescaleAllPagesToNewCanvas(preset.working.width, preset.working.height);
  }

  // Resize canvas
  targetStore.setSize(preset.working.width, preset.working.height);

  // Persist preset metadata for dynamic export scaling.
  const nextCustom = {
    ...(targetStore.custom || {}),
    preset: name,
    exportWidth: preset.export.width,
    exportHeight: preset.export.height,
    exportScale: getPresetScale(preset),
  };
  if (typeof targetStore.set === 'function') {
    targetStore.set({ custom: nextCustom });
  } else {
    // fallback
    targetStore.custom = nextCustom;
  }

  // Keep pages in "auto" size mode so they follow store size.
  const pages = Array.isArray(targetStore.pages) ? targetStore.pages : [];
  pages.forEach((p) => {
    if (p && typeof p.set === 'function') {
      if (p.width !== 'auto') p.set({ width: 'auto' });
      if (p.height !== 'auto') p.set({ height: 'auto' });
    }
  });

  return currentPreset !== name;
};

// Initialize default preset.
setStorePreset(store, DEFAULT_PRESET, { rescaleExisting: false });

store.setSize(360, 640);

// ============================================
// SPECIAL "ADD SLIDE" PAGE - ALWAYS AT THE END (RIGHT SIDE)
// ============================================
// This page is ALWAYS at the LAST position and is used ONLY to add new slides.
// It has hardcoded static content and is NEVER saved to backend.
// When user clicks on it, they can add a new slide which appears before it.

// Don't create a first page automatically - user will create it via Add Slide button
// Just create the Add Slide page

// Then, create the Add Slide page (so it's at the end)
const createAddSlidePage = () => {
  const addSlidePage = store.addPage();
  if (!addSlidePage) return;

  // Mark this as the special "Add Slide" page
  addSlidePage.set({
    custom: {
      isAddSlidePage: true, // Special marker - this page is NEVER saved
      isActive: false, // Never "active" for playback
    },
    background: '#FFFFFF', // White background
  });

  // Whole Page Trigger (Interactive Background)
  addSlidePage.addElement({
    type: 'figure',
    subType: 'rect',
    x: 0,
    y: 0,
    width: store.width || 1080,
    height: store.height || 1920,
    fill: 'rgba(255,255,255,0.001)', // Almost transparent
    opacity: 1,
    listening: true, // Catch ALL clicks
    selectable: true,
    draggable: false,
    name: 'add-slide-trigger',
    custom: { isAddSlideElement: true, action: 'add-slide' },
  });

  // Circle Background (Visual Only)
  addSlidePage.addElement({
    type: 'figure',
    subType: 'rect',
    x: 130,
    y: 155,
    width: 100,
    height: 100,
    cornerRadius: 50,
    fill: '#FFFFFF',
    shadowEnabled: true,
    shadowColor: 'rgba(0,0,0,0.15)',
    shadowBlur: 15,
    shadowOffsetY: 8,
    opacity: 1,
    selectable: false,
    draggable: false,
    listening: false, // Pass click to trigger
    name: 'add-slide-visual',
    custom: { isAddSlideElement: true },
  });

  // Plus Icon (+) (Visual Only)
  addSlidePage.addElement({
    type: 'text',
    text: '+',
    x: 140,
    y: 157,
    width: 80,
    fontSize: 74,
    fontFamily: 'Inter',
    fill: '#6B7280',
    align: 'center',
    opacity: 1,
    selectable: false,
    draggable: false,
    listening: false, // Pass click to trigger
    name: 'add-slide-visual',
    custom: { isAddSlideElement: true },
  });

  // Title (Visual Only)
  addSlidePage.addElement({
    type: 'text',
    text: 'Start Creating',
    x: 30,
    y: 280,
    width: 300,
    fontSize: 30,
    lineHeight: 1.2,
    fontFamily: 'Inter',
    fontWeight: 'bold',
    fill: '#1F2937',
    align: 'center',
    opacity: 1,
    selectable: false,
    draggable: false,
    listening: false, // Pass click to trigger
    name: 'add-slide-visual',
    custom: { isAddSlideElement: true },
  });

  // Subtitle (Visual Only)
  addSlidePage.addElement({
    type: 'text',
    text: 'Select a template, add CTAs,\nor interactive elements to\nbegin',
    x: 40,
    y: 330,
    width: 280,
    fontSize: 14,
    lineHeight: 1.6,
    fontFamily: 'Inter',
    fill: '#6B7280',
    align: 'center',
    opacity: 1,
    selectable: false,
    draggable: false,
    listening: false, // Pass click to trigger
    name: 'add-slide-visual',
    custom: { isAddSlideElement: true },
  });

  console.log('[PolotnoStore] Created Add Slide page (Simple Click Mode)');
  return addSlidePage;
};

// Initial creation
const addSlidePageRef = createAddSlidePage();

// Select the Add Slide page initially and clear any element selection
if (store.pages.length > 0) {
  setTimeout(() => {
    // If there's only the Add Slide page, select it
    // If there are real pages, select the first real page
    const realPages = store.pages.filter(p => !p.custom?.isAddSlidePage);
    if (realPages.length > 0) {
      store.selectPage(realPages[0].id);
    } else {
      store.selectPage(store.pages[0].id);
    }
    // Clear any element selection (e.g., if Add Slide button was auto-selected)
    store.selectElements([]);
  }, 100);
}

// Helper function to recreate the Add Slide page (for when we need to keep it at the end)
const recreateAddSlidePage = () => {
  console.log('[PolotnoStore] Recreating Add Slide page at the END');
  return createAddSlidePage();
};

// ============================================
// REACTION: Keep Add Slide page ALWAYS at the END
// ============================================
// When new pages are added, move the Add Slide page to the end
reaction(
  () => {
    const pages = store.pages || [];
    return pages.map(p => p?.id).join('|');
  },
  () => {
    try {
      const pages = store.pages || [];

      // Find the Add Slide page
      const addSlideIndex = pages.findIndex(p => p?.custom?.isAddSlidePage === true);

      if (addSlideIndex === -1) {
        // If missing (e.g. after loadJSON), recreate it immediately
        // This ensures it always exists
        console.log('[PolotnoStore] Add Slide page missing, recreating...');
        createAddSlidePage();
        return;
      }

      if (addSlideIndex === pages.length - 1) return; // Already at the end

      // Need to move it to the end
      // Polotno doesn't have a native movePage, but we can use store.movePage if available
      // Otherwise, we recreate it
      const addSlidePage = pages[addSlideIndex];

      if (typeof store.movePage === 'function') {
        store.movePage(addSlidePage.id, pages.length - 1);
        console.log('[PolotnoStore] Moved Add Slide page to the end');
      } else {
        // Alternative: delete and recreate at end
        // But this can cause issues, so we just log a warning
        console.warn('[PolotnoStore] Add Slide page is not at the end (index:', addSlideIndex, ')');
      }
    } catch (error) {
      console.error('[PolotnoStore] Failed to reposition Add Slide page:', error);
    }
  },
  { fireImmediately: true, delay: 100 }
);

// ============================================
// REACTION: Detect Add Slide interactions
// ============================================
// Track to prevent infinite loops and double-clicks
let isCreatingNewPage = false;
let lastCreationTime = 0;

export const createNewSlideAndRecreateAddSlidePage = (currentAddSlidePageId) => {
  const now = Date.now();
  if (now - lastCreationTime < 500) {
    console.log('[PolotnoStore] Throttled Add Slide creation');
    return;
  }

  // Double check flag
  if (isCreatingNewPage) return;
  isCreatingNewPage = true;
  lastCreationTime = now;

  try {
    console.log('[PolotnoStore] Creating new slide and recreating Add Slide page');

    // Step 1: Delete current Add Slide page
    if (currentAddSlidePageId) {
      store.deletePages([currentAddSlidePageId]);
    }

    // Step 2: Create the new real page (now it will be at the end)
    const newPage = store.addPage();
    let newPageId = null;

    if (newPage) {
      newPageId = newPage.id;
      // Mark as real page
      newPage.set({
        custom: {
          ...(newPage.custom || {}),
          isAddSlidePage: false,
          isActive: true,
        },
      });
      console.log('[PolotnoStore] Created new slide:', newPageId);
    }

    // Step 3: Recreate the Add Slide page (will be at the very end)
    recreateAddSlidePage();

    // Step 4: Select the new real page
    if (newPageId) {
      // Use setTimeout to allow MobX to settle
      setTimeout(() => {
        store.selectPage(newPageId);
        // Reset flag after selection is done
        isCreatingNewPage = false;
        console.log('[PolotnoStore] Selected new slide:', newPageId);
      }, 50);
    } else {
      isCreatingNewPage = false;
    }

  } catch (error) {
    console.error('[PolotnoStore] Failed to create new slide:', error);
    isCreatingNewPage = false;
  }
};

// Detect when Add Slide button is CLICKED (element selected)
// 1. Detect when Add Slide button is CLICKED (element selected)
reaction(
  () => (store.selectedElementsIds || []).join('|'),
  () => {
    const selectedIds = store.selectedElementsIds || [];
    if (selectedIds.length === 0) return;

    // Find the Add Slide page
    const addSlidePage = store.pages.find(p => p?.custom?.isAddSlidePage === true);
    if (!addSlidePage) return;

    // Check if any selected element is from the Add Slide page and discern the action
    let isAddSlideButtonClicked = false;
    let clickedAction = null;

    for (const id of selectedIds) {
      const element = addSlidePage.children?.find(el => el.id === id);
      // Check if element belongs to Add Slide group
      if (element?.custom?.isAddSlideElement === true) {
        isAddSlideButtonClicked = true;
        clickedAction = element.custom.action; // No default action
        break;
      }
    }

    if (isAddSlideButtonClicked) {
      // ALWAYS clear selection immediately for visual feedback
      store.selectElements([]);

      // Only proceed if not already in progress
      if (!isCreatingNewPage) {
        if (clickedAction === 'add-slide') {
          createNewSlideAndRecreateAddSlidePage(addSlidePage.id);
        } else if (clickedAction === 'upload') {
          console.log('[PolotnoStore] Upload button clicked');
          // Trigger upload logic here (e.g. open file picker or switch to upload tab)
        } else if (clickedAction === 'import') {
          console.log('[PolotnoStore] Import button clicked');
          // Trigger import logic here
        }
      }
    }
  },
  { fireImmediately: false }
);



// Also detect when Add Slide PAGE becomes active (clicking on empty area)
// 2. Also detect when Add Slide PAGE becomes active (clicking on empty area)
reaction(
  () => store.activePageId,
  (activePageId) => {
    if (isCreatingNewPage) return;
    if (!activePageId) return;

    const activePage = store.pages.find(p => p.id === activePageId);
    if (!activePage) return;

    // Check if the Add Slide page was clicked
    if (activePage.custom?.isAddSlidePage === true) {
      // With specific buttons (Add/Upload/Import), we don't want auto-creation on page activation
      // User must explicitly click a button
      return;

      // PREVIOUS LOGIC:
      // Only trigger if no elements are selected (button click is handled above)
      // if (store.selectedElementsIds && store.selectedElementsIds.length > 0) return;
      // createNewSlideAndRecreateAddSlidePage(activePage.id);
    }
  },
  { fireImmediately: false }
);

// NOTE: Do not monkey-patch store methods (toDataURL/saveAsImage/loadJSON/deleteElements).
// Some deployment environments / Polotno builds may not support overriding store instance methods.
// Instead, we use MobX reactions for post-load normalization and duration recomputation.

export const getDefaultExportPixelRatio = (targetStore = store) => {
  return getStoreExportScale(targetStore);
};

// ============================================
// HELPER: Check if a page is the special "Add Slide" page
// ============================================
export const isAddSlidePage = (page) => {
  return page?.custom?.isAddSlidePage === true;
};

// ============================================
// HELPER: Get only real pages (excludes the Add Slide page at index 0)
// ============================================
export const getRealPages = (targetStore = store) => {
  if (!targetStore?.pages) return [];
  return targetStore.pages.filter((p) => !isAddSlidePage(p));
};

// setAnimationsEnabled(true);
// NOTE: Do not auto-start playback on init.
// Playback is controlled from UI (e.g. Duration section / bottom timeline).

const DEFAULT_PAGE_DURATION = 5000;

// 0) Ensure each page has custom.isActive (default true) for slide status.
// Skip the special "Add Slide" page at index 0.
reaction(
  () => (Array.isArray(store.pages) ? store.pages.map((p) => p?.id).join('|') : 'no-pages'),
  () => {
    try {
      (store.pages || []).forEach((p) => {
        // Skip the Add Slide page
        if (isAddSlidePage(p)) return;
        ensurePageIsActiveFlag(p);
        ensurePageBackgroundObject(p);
        applySlideBackgroundToPage(p);
      });
    } catch {
      // never block UI
    }
  },
  { fireImmediately: true }
);

// Ensure background gets applied when it changes (including after loadJSON).
reaction(
  () => {
    const pages = Array.isArray(store.pages) ? store.pages : [];
    return pages
      .map((p) => {
        const bg = p?.custom?.background;
        const colorType = bg?.color?.type || 'solid';
        const solid = bg?.color?.solid || '';
        const g = bg?.color?.gradient || {};
        const mediaUrl = bg?.media?.mediaUrl || '';
        const sizing = bg?.media?.sizing || '';
        const position = bg?.media?.position || '';
        return `${p?.id}:c:${colorType}:${solid}:${g.from || ''}:${g.to || ''}:${g.direction || ''}:m:${mediaUrl}:${sizing}:${position}`;
      })
      .join('|');
  },
  () => {
    try {
      (store.pages || []).forEach((p) => {
        ensurePageBackgroundObject(p);
        applySlideBackgroundToPage(p);
      });
    } catch {
      // ignore
    }
  },
  { fireImmediately: true }
);

const normalizeDurationMs = (value) => {
  if (!Number.isFinite(value) || value <= 0) return null;
  // Heuristic: values under 1000 are most likely seconds.
  if (value < 1000) return Math.round(value * 1000);
  return Math.round(value);
};

const getElementMediaDurationMs = (el) => {
  if (!el) return null;

  // Try common places duration might live.
  const candidates = [
    el.duration,
    el.videoDuration,
    el.audioDuration,
    el.srcDuration,
    el.mediaDuration,
    el.custom?.duration,
    el.custom?.videoDuration,
    el.custom?.audioDuration,
    el.custom?.srcDuration,
    el.custom?.mediaDuration,
  ];

  for (const v of candidates) {
    const ms = normalizeDurationMs(v);
    if (ms != null) return ms;
  }
  return null;
};

const recomputeActivePageDuration = () => {
  const page = store.activePage;
  if (!page) return;

  const children = Array.isArray(page.children) ? page.children : [];
  const timedMedia = children.filter((el) => el?.type === 'video' || el?.type === 'audio');

  // If there is no timed media left, reset to default.
  if (timedMedia.length === 0) {
    if (typeof page.set === 'function' && page.duration !== DEFAULT_PAGE_DURATION) {
      page.set({ duration: DEFAULT_PAGE_DURATION });
    }
    return;
  }

  // If we can read remaining media durations, shrink to max(remaining, default).
  const mediaDurations = timedMedia
    .map(getElementMediaDurationMs)
    .filter((ms) => Number.isFinite(ms) && ms > 0);

  // If we can't detect durations, do nothing (avoid incorrect shrinking).
  if (mediaDurations.length === 0) return;

  const nextDuration = Math.max(DEFAULT_PAGE_DURATION, ...mediaDurations);
  if (typeof page.set === 'function' && page.duration !== nextDuration) {
    page.set({ duration: nextDuration });
  }
};

// 1) Normalize templates loaded at export size back into working size.
reaction(
  () => {
    const w = Number(store.width);
    const h = Number(store.height);
    return Number.isFinite(w) && Number.isFinite(h) ? `${w}x${h}` : 'unknown';
  },
  () => {
    try {
      const detected = detectPresetFromDimensions(store.width, store.height);
      if (detected?.space !== 'export' || !detected?.preset) return;

      // Loaded design is in export units. Switch to its preset and rescale down to working size.
      setStorePreset(store, detected.preset, { rescaleExisting: true });
    } catch {
      // Never block UI.
    }
  }
);

// 4) Skip inactive slides during playback.
reaction(
  () => {
    const page = store.activePage;
    const pages = Array.isArray(store.pages) ? store.pages : [];
    return {
      isPlaying: store.isPlaying,
      activePageId: page?.id,
      activePageIsActive: isPageActive(page),
      pagesKey: pages.map((p) => `${p?.id}:${isPageActive(p) ? 1 : 0}`).join('|'),
      currentTime: store.currentTime,
    };
  },
  ({ isPlaying, activePageId, activePageIsActive }) => {
    try {
      if (!isPlaying) return;
      if (!activePageId) return;
      if (activePageIsActive) return;

      const pages = Array.isArray(store.pages) ? store.pages : [];
      if (pages.length === 0) return;

      const currentIndex = pages.findIndex((p) => p?.id === activePageId);
      const findNextActive = () => {
        for (let i = currentIndex + 1; i < pages.length; i++) {
          if (isPageActive(pages[i])) return pages[i];
        }
        for (let i = 0; i < Math.max(0, currentIndex); i++) {
          if (isPageActive(pages[i])) return pages[i];
        }
        return null;
      };

      const next = findNextActive();
      if (!next) {
        // Nothing to play.
        if (typeof store._togglePlaying === 'function') {
          store._togglePlaying(false);
        } else {
          store.isPlaying = false;
        }
        return;
      }

      const nextTime = Number.isFinite(next.startTime) ? next.startTime : store.currentTime;
      if (typeof store.setCurrentTime === 'function') {
        store.setCurrentTime(nextTime);
      } else {
        store.currentTime = nextTime;
      }
      if (typeof store.checkActivePage === 'function') {
        store.checkActivePage();
      }
    } catch {
      // ignore
    }
  },
  { fireImmediately: false }
);

// 2) Recompute page duration when timed media is added/removed/changed.
reaction(
  () => {
    const page = store.activePage;
    if (!page) return 'no-page';

    const children = Array.isArray(page.children) ? page.children : [];
    // Track only timed media and their durations.
    return children
      .filter((el) => el?.type === 'video' || el?.type === 'audio')
      .map((el) => `${el.id}:${el.type}:${getElementMediaDurationMs(el) ?? ''}`)
      .join('|');
  },
  () => {
    try {
      recomputeActivePageDuration();
    } catch {
      // ignore
    }
  }
);

// 3) Global visibility controller for elements with custom timing (startTime/endTime).
// This ensures ALL elements on the active page respect their timing during playback,
// not just the currently selected element.

// Track original visibility per element ID to restore after playback stops.
const baseVisibilityMap = new Map();

const clampValue = (value, min, max) => Math.max(min, Math.min(max, value));

const getElementTimingData = (element, pageDurationMs) => {
  const rawStart = element?.custom?.startTime;
  const rawEnd = element?.custom?.endTime;
  const startTime = Number.isFinite(rawStart) ? rawStart : 0;
  const endTime = Number.isFinite(rawEnd) ? rawEnd : pageDurationMs;
  return {
    startTime: clampValue(startTime, 0, pageDurationMs),
    endTime: clampValue(Math.max(endTime, startTime), 0, pageDurationMs),
    hasCustomTiming: Number.isFinite(rawStart) || Number.isFinite(rawEnd),
  };
};

// This reaction runs during playback to enforce visibility for all timed elements.
reaction(
  () => {
    const isPlaying = store.isPlaying;
    const currentTime = store.currentTime;
    const page = store.activePage;
    const pageStartMs = page?.startTime ?? 0;
    const pageDurationMs = page?.duration ?? 5000;

    // Return a composite key so the reaction fires on any relevant change.
    return {
      isPlaying,
      currentTime,
      pageId: page?.id,
      pageStartMs,
      pageDurationMs,
    };
  },
  ({ isPlaying, currentTime, pageId, pageStartMs, pageDurationMs }) => {
    try {
      const page = store.activePage;
      if (!page || page.id !== pageId) return;

      const children = Array.isArray(page.children) ? page.children : [];
      const pageTimeMs = clampValue((currentTime ?? 0) - pageStartMs, 0, pageDurationMs);

      // Find all elements with custom timing.
      const timedElements = children.filter((el) => {
        if (!el) return false;
        const { hasCustomTiming } = getElementTimingData(el, pageDurationMs);
        return hasCustomTiming;
      });

      if (isPlaying) {
        // During playback: enforce visibility based on timing for all timed elements.
        timedElements.forEach((el) => {
          // Store original visibility if not already stored.
          if (!baseVisibilityMap.has(el.id)) {
            baseVisibilityMap.set(el.id, el.visible ?? true);
          }

          const { startTime, endTime } = getElementTimingData(el, pageDurationMs);
          const inRange = pageTimeMs >= startTime && pageTimeMs <= endTime;
          const baseVisible = baseVisibilityMap.get(el.id) ?? true;
          const nextVisible = Boolean(baseVisible && inRange);

          if (el.visible !== nextVisible) {
            el.set({ visible: nextVisible });
          }
        });
      } else {
        // Playback stopped: restore original visibility for all tracked elements.
        baseVisibilityMap.forEach((originalVisibility, elementId) => {
          const el = store.getElementById?.(elementId);
          if (el && el.visible !== originalVisibility) {
            el.set({ visible: originalVisibility });
          }
        });
        baseVisibilityMap.clear();
      }
    } catch {
      // Never block UI.
    }
  },
  { fireImmediately: false }
);