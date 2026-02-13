import { createStore } from 'polotno/model/store';
// import { setAnimationsEnabled } from 'polotno/config';

import { reaction } from 'mobx';

import {
  DEFAULT_PRESET,
  getPreset,
  getStorePresetName,
  getStoreCanvasSize,
} from '../utils/scale';
import { detectPresetFromDimensions, getStoreExportScale } from '../utils/scale';
import {
  applySlideBackgroundToPage,
  inferSlideBackgroundFromPage,
  normalizeSlideBackground,
} from '../utils/slideBackground';
import { enableRuntimeValidation } from '../utils/canvasValidation';

export const store = createStore({
  key: 'TXsh4gxnlODn4eJrqeDi',
  showCredit: true,
});

// =========================
// PAGE METADATA: SYSTEM PAGES
// =========================
// A "SYSTEM page" is a REAL Polotno page (created via store.addPage) that is
// distinguished purely via `page.custom` metadata. No UI/behavior changes here.

// Reserved system page types.
export const SYSTEM_PAGE_TYPES = Object.freeze({
  SYSTEM_START_PAGE: 'SYSTEM_START_PAGE',
});

export const getPageCustomType = (page) => {
  return page?.custom?.type ?? null;
};

export const isSystemPage = (page, type = null) => {
  const pageType = getPageCustomType(page);
  if (!pageType) return false;
  if (type) return pageType === type;
  return typeof pageType === 'string' && pageType.startsWith('SYSTEM_');
};

export const setPageCustomType = (page, type) => {
  if (!page || typeof page.set !== 'function') return;
  const custom = page.custom || {};
  page.set({ custom: { ...custom, type } });
};

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

  // Check if canvas dimensions need to be updated
  const currentCanvasW = Number(targetStore?.width);
  const currentCanvasH = Number(targetStore?.height);
  const needsCanvasResize =
    Number.isFinite(currentCanvasW) &&
    Number.isFinite(currentCanvasH) &&
    (currentCanvasW !== preset.dimensions.width || currentCanvasH !== preset.dimensions.height);

  const currentCanvas = getStoreCanvasSize(targetStore);
  const needsPresetResize = currentCanvas.width !== preset.dimensions.width || currentCanvas.height !== preset.dimensions.height;

  if (rescaleExisting && (needsCanvasResize || needsPresetResize)) {
    // Rescale existing elements to fit+center into the new canvas dimensions.
    rescaleAllPagesToNewCanvas(preset.dimensions.width, preset.dimensions.height);
  }

  // Resize canvas to 1080px-based dimensions
  targetStore.setSize(preset.dimensions.width, preset.dimensions.height);

  // Persist preset metadata. Export dimensions = canvas dimensions now.
  const nextCustom = {
    ...(targetStore.custom || {}),
    preset: name,
    exportWidth: preset.dimensions.width,
    exportHeight: preset.dimensions.height,
    exportScale: 1, // Canvas = export dimensions
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

// Initialize default preset with 1080×1920 canvas.
setStorePreset(store, DEFAULT_PRESET, { rescaleExisting: false });

// =========================
// PAGE LIFECYCLE: SYSTEM_START_PAGE
// =========================
// Requirements:
// - SYSTEM_START_PAGE must NEVER be removed.
// - SYSTEM_START_PAGE must ALWAYS be the LAST page in store.pages.
// - All real pages must be inserted BEFORE it.

const SYSTEM_START_ROLES = Object.freeze({
  TITLE: 'SYSTEM_START_TITLE',
  SUBTITLE: 'SYSTEM_START_SUBTITLE',
  BUTTON_1: 'SYSTEM_START_BUTTON_1',
  BUTTON_1_ICON_BG: 'SYSTEM_START_BUTTON_1_ICON_BG',
  BUTTON_1_ICON_TEXT: 'SYSTEM_START_BUTTON_1_ICON_TEXT',
  BUTTON_1_LABEL: 'SYSTEM_START_BUTTON_1_LABEL',
  BUTTON_2: 'SYSTEM_START_BUTTON_2',
  BUTTON_2_ICON_BG: 'SYSTEM_START_BUTTON_2_ICON_BG',
  BUTTON_2_ICON_TEXT: 'SYSTEM_START_BUTTON_2_ICON_TEXT',
  BUTTON_2_LABEL: 'SYSTEM_START_BUTTON_2_LABEL',
  BUTTON_3: 'SYSTEM_START_BUTTON_3',
  BUTTON_3_ICON_BG: 'SYSTEM_START_BUTTON_3_ICON_BG',
  BUTTON_3_ICON_TEXT: 'SYSTEM_START_BUTTON_3_ICON_TEXT',
  BUTTON_3_LABEL: 'SYSTEM_START_BUTTON_3_LABEL',
});

const SYSTEM_START_ACTIONS = Object.freeze({
  UPLOAD: 'upload',
  BLANK: 'blank',
  TEMPLATE: 'template',
});

const SYSTEM_START_ROLE_SET = new Set(Object.values(SYSTEM_START_ROLES));



const hasSystemStartContent = (page) => {
  const children = Array.isArray(page?.children) ? page.children : [];
  return children.some((el) => SYSTEM_START_ROLE_SET.has(el?.custom?.role));
};


const ensureSystemStartPageContent = (page) => {
  if (!page || typeof page.set !== 'function') return;

  // Make background white for this system page.
  // The actual UI is rendered as a React overlay (SystemStartOverlay),
  // NOT as Polotno canvas elements.
  try {
    if (page.background !== '#ffffff') page.set({ background: '#ffffff' });
  } catch {
    // ignore
  }

  // Remove any leftover canvas elements from the old implementation.
  try {
    const children = Array.isArray(page.children) ? [...page.children] : [];
    children.forEach((el) => {
      try {
        page.removeElement(el.id);
      } catch {
        // ignore
      }
    });
  } catch {
    // ignore
  }
};

const createSystemStartPage = () => {
  const page = store.addPage();
  setPageCustomType(page, SYSTEM_PAGE_TYPES.SYSTEM_START_PAGE);

  // Keep new pages in "auto" size mode so they follow store size.
  if (page && typeof page.set === 'function') {
    if (page.width !== 'auto') page.set({ width: 'auto' });
    if (page.height !== 'auto') page.set({ height: 'auto' });
  }

  // Apply existing normalization defaults.
  ensurePageIsActiveFlag(page);
  ensurePageBackgroundObject(page);
  applySlideBackgroundToPage(page);

  // Ensure system page has white background (UI is a React overlay).
  ensureSystemStartPageContent(page);

  return page;
};

const getSystemStartPage = (pages) => {
  const list = Array.isArray(pages) ? pages : [];
  return list.find((p) => isSystemPage(p, SYSTEM_PAGE_TYPES.SYSTEM_START_PAGE)) || null;
};

const ensureSystemStartPageLast = (pages) => {
  const list = Array.isArray(pages) ? pages : [];
  if (list.length === 0) return;
  const system = getSystemStartPage(list);
  if (!system) return;

  const systemIndex = list.indexOf(system);
  const lastIndex = list.length - 1;
  if (systemIndex !== lastIndex && typeof system.setZIndex === 'function') {
    try {
      system.setZIndex(lastIndex);
    } catch {
      // ignore
    }
  }
};

const insertRealPageBeforeSystem = (page) => {
  if (!page) return;
  const pages = Array.isArray(store.pages) ? store.pages : [];
  const system = getSystemStartPage(pages);
  if (!system || typeof page.setZIndex !== 'function') return;

  const systemIndex = pages.indexOf(system);
  if (systemIndex >= 0) {
    try {
      page.setZIndex(systemIndex);
    } catch {
      // ignore
    }
  }

  ensureSystemStartPageLast(store.pages);
};

const reconcileSystemStartPage = () => {
  const pages = Array.isArray(store.pages) ? store.pages : [];
  if (pages.length === 0) {
    createSystemStartPage();
    return;
  }

  const systemStartPages = pages.filter((p) => isSystemPage(p, SYSTEM_PAGE_TYPES.SYSTEM_START_PAGE));

  if (systemStartPages.length === 0) {
    createSystemStartPage();
    return;
  }

  const primary = systemStartPages[0];
  // Ensure system page has white background.
  ensureSystemStartPageContent(primary);

  // Delete ALL duplicate system pages (keep only the first one)
  if (systemStartPages.length > 1) {
    const duplicates = systemStartPages.slice(1);
    duplicates.forEach((p) => {
      try {
        // Use deletePage directly to bypass any wrapped logic
        store.deletePage(p.id);
      } catch {
        // ignore
      }
    });
  }

  // Always keep SYSTEM_START_PAGE last.
  ensureSystemStartPageLast(store.pages);

  // Prevent duplicating SYSTEM_START_PAGE content into a real page.
  const pagesToCheck = Array.isArray(store.pages) ? store.pages : [];
  pagesToCheck.forEach((p) => {
    if (!isSystemPage(p, SYSTEM_PAGE_TYPES.SYSTEM_START_PAGE) && hasSystemStartContent(p)) {
      try {
        store.deletePage(p.id);
      } catch {
        // ignore
      }
    }
  });
};


const openFilePicker = (accept) => {
  return new Promise((resolve) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = accept || '*/*';
    input.style.display = 'none';
    input.onchange = () => {
      const file = input.files && input.files[0] ? input.files[0] : null;
      input.remove();
      resolve(file);
    };
    document.body.appendChild(input);
    input.click();
  });
};

const openTemplatesPanel = () => {
  try {
    const tabs = document.querySelectorAll('.polotno-side-panel-tab, .bp5-tab');
    for (const tab of tabs) {
      const text = (tab.textContent || '').toLowerCase().trim();
      const label = (tab.getAttribute('aria-label') || '').toLowerCase();
      if (text === 'templates' || label.includes('templates')) {
        tab.click();
        return;
      }
    }
  } catch {
    // ignore
  }
};

let systemStartActionInFlight = false;
export const handleSystemStartAction = async (action) => {
  if (systemStartActionInFlight) return;
  systemStartActionInFlight = true;

  try {
    if (action === SYSTEM_START_ACTIONS.BLANK) {
      const page = store.addPage();
      insertRealPageBeforeSystem(page);
      ensurePageIsActiveFlag(page);
      ensurePageBackgroundObject(page);
      applySlideBackgroundToPage(page);
      if (typeof store.selectPage === 'function') {
        store.selectPage(page.id);
      }
      return;
    }

    if (action === SYSTEM_START_ACTIONS.UPLOAD) {
      const file = await openFilePicker('image/*');
      if (!file) return;

      const { storyAPI } = await import('../services/api');
      const cdnUrl = await storyAPI.uploadGeneralMedia(file);

      const page = store.addPage();
      insertRealPageBeforeSystem(page);

      const custom = page.custom || {};
      page.set({
        custom: {
          ...custom,
          background: {
            color: { type: 'solid', solid: '#FFFFFF' },
            media: { mediaUrl: cdnUrl, sizing: 'fill', position: 'center' },
          },
        },
      });
      applySlideBackgroundToPage(page);

      if (typeof store.selectPage === 'function') {
        store.selectPage(page.id);
      }
      return;
    }

    if (action === SYSTEM_START_ACTIONS.TEMPLATE) {
      openTemplatesPanel();
      return;
    }
  } catch {
    // never block UI
  } finally {
    systemStartActionInFlight = false;
  }
};

// Wrap store.deletePages to prevent deleting the SYSTEM_START_PAGE at the store level
const originalDeletePages = store.deletePages.bind(store);
store.deletePages = function (pageIds) {
  const ids = Array.isArray(pageIds) ? pageIds : [pageIds];
  const safeIds = ids.filter((id) => {
    const page = store.pages.find((p) => p?.id === id);
    return !isSystemPage(page, SYSTEM_PAGE_TYPES.SYSTEM_START_PAGE);
  });
  if (safeIds.length === 0) return;
  return originalDeletePages(safeIds);
};

// Intercept page.clone() to prevent cloning SYSTEM_START_PAGE
store.pages.forEach((page) => {
  if (typeof page.clone === 'function' && !page.__cloneIntercepted) {
    const originalClone = page.clone.bind(page);
    page.clone = function (...args) {
      if (isSystemPage(page, SYSTEM_PAGE_TYPES.SYSTEM_START_PAGE)) {
        console.warn('[polotnoStore] Cannot clone SYSTEM_START_PAGE');
        return null;
      }
      return originalClone(...args);
    };
    page.__cloneIntercepted = true;
  }
});

// Watch for new pages and intercept their clone methods too
reaction(
  () => store.pages.length,
  () => {
    store.pages.forEach((page) => {
      if (typeof page.clone === 'function' && !page.__cloneIntercepted) {
        const originalClone = page.clone.bind(page);
        page.clone = function (...args) {
          if (isSystemPage(page, SYSTEM_PAGE_TYPES.SYSTEM_START_PAGE)) {
            console.warn('[polotnoStore] Cannot clone SYSTEM_START_PAGE');
            return null;
          }
          return originalClone(...args);
        };
        page.__cloneIntercepted = true;
      }
    });
  },
  { fireImmediately: false }
);

reaction(
  () => {
    const pages = Array.isArray(store.pages) ? store.pages : [];
    // Track the page list and their custom types.
    return pages.map((p) => `${p?.id}:${getPageCustomType(p) ?? ''}`).join('|');
  },
  () => {
    try {
      reconcileSystemStartPage();
    } catch {
      // never block UI
    }
  },
  { fireImmediately: true }
);

// Keep layout centered when canvas size changes (preset switch / loadJSON).
reaction(
  () => {
    const pages = Array.isArray(store.pages) ? store.pages : [];
    const system = pages.find((p) => isSystemPage(p, SYSTEM_PAGE_TYPES.SYSTEM_START_PAGE));
    const w = Number(store.width);
    const h = Number(store.height);
    return `${system?.id || ''}:${Number.isFinite(w) ? w : ''}x${Number.isFinite(h) ? h : ''}`;
  },
  () => {
    try {
      const pages = Array.isArray(store.pages) ? store.pages : [];
      const system = pages.find((p) => isSystemPage(p, SYSTEM_PAGE_TYPES.SYSTEM_START_PAGE));
      if (system) {
        ensureSystemStartPageContent(system);
      }
    } catch {
      // ignore
    }
  },
  { fireImmediately: true }
);

// NOTE: Do not monkey-patch store methods (toDataURL/saveAsImage/loadJSON/deleteElements).
// Some deployment environments / Polotno builds may not support overriding store instance methods.
// Instead, we use MobX reactions for post-load normalization and duration recomputation.

export const getDefaultExportPixelRatio = (targetStore = store) => {
  return getStoreExportScale(targetStore);
};

// setAnimationsEnabled(true);
// NOTE: Do not auto-start playback on init.
// Playback is controlled from UI (e.g. Duration section / bottom timeline).

const DEFAULT_PAGE_DURATION = store.pages?.[0]?.duration ?? 5000;

// 0) Ensure each page has custom.isActive (default true) for slide status.
reaction(
  () => {
    if (!Array.isArray(store.pages)) return 'no-pages';
    return store.pages
      .map((p) => `${p?.id}:${p?.background || ''}`)
      .join('|');
  },
  () => {
    try {
      (store.pages || []).forEach((p) => {
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

// ============================================
// CANVAS RESOLUTION VALIDATION (Development Only)
// ============================================
// Enable runtime warnings for legacy viewport-based values
if (import.meta.env.DEV) {
  enableRuntimeValidation(store);
}