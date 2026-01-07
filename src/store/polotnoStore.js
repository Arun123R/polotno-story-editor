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

export const store = createStore({
  key: 'TXsh4gxnlODn4eJrqeDi',
  showCredit: true,
});

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

store.addPage();
store.setSize(279, 496);

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