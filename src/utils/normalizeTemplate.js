import { detectPresetFromDimensions, getPreset, getPresetScale } from './scale';

const cloneDeep = (value) => {
  // structuredClone is available in modern browsers; keep a safe fallback.
  try {
    if (typeof structuredClone === 'function') return structuredClone(value);
  } catch {
    // ignore
  }
  return JSON.parse(JSON.stringify(value));
};

const nearlyEqual = (a, b, eps = 1e-6) => Math.abs(a - b) <= eps;

const getDesignSize = (design) => {
  if (!design || typeof design !== 'object') return { width: null, height: null };

  const rootW = Number(design.width);
  const rootH = Number(design.height);
  if (Number.isFinite(rootW) && Number.isFinite(rootH)) {
    return { width: rootW, height: rootH };
  }

  const firstPage = Array.isArray(design.pages) ? design.pages[0] : null;
  const pageW = Number(firstPage?.width);
  const pageH = Number(firstPage?.height);
  if (Number.isFinite(pageW) && Number.isFinite(pageH)) {
    return { width: pageW, height: pageH };
  }

  return { width: null, height: null };
};

export const detectTemplatePreset = (design) => {
  if (!design || typeof design !== 'object') return null;
  const { width: w, height: h } = getDesignSize(design);
  if (!Number.isFinite(w) || !Number.isFinite(h)) return null;

  const direct = detectPresetFromDimensions(w, h);
  if (direct) return direct;

  // Backward compatibility: check if dimensions match any known preset
  // (templates created with older viewport-based system no longer supported)
  for (const name of ['ios-small', 'ios-large', 'android-small', 'android-medium', 'android-large']) {
    const preset = getPreset(name);
    if (w === preset.dimensions.width && h === preset.dimensions.height) {
      return { preset: name, space: 'canvas' };
    }
  }

  return null;
};

// Keys that represent pixel/length values that should be scaled.
const SCALE_KEYS = new Set([
  // geometry
  'x',
  'y',
  'width',
  'height',
  'rx',
  'ry',

  // text
  'fontSize',
  'padding',
  'paddingX',
  'paddingY',

  // stroke/radius
  'strokeWidth',
  'cornerRadius',
  'backgroundCornerRadius',
  'borderRadius',

  // shadows
  'shadowBlur',
  'shadowOffsetX',
  'shadowOffsetY',

  // clip (px-based)
  'clipX',
  'clipY',
  'clipWidth',
  'clipHeight',

  // generic spacing
  'spacing',
  'gap',
  'indent',
]);

// Keys that are numeric but should NOT be scaled.
const DO_NOT_SCALE_KEYS = new Set([
  'opacity',
  'rotation',
  'scaleX',
  'scaleY',
  'skewX',
  'skewY',
  'zIndex',
  'startTime',
  'endTime',
  'duration',
  'volume',
  // Polotno crop values are ratios (0..1)
  'cropX',
  'cropY',
  'cropWidth',
  'cropHeight',
]);

const maybeScaleLineHeight = (value, factor) => {
  // Polotno commonly uses lineHeight as a multiplier (e.g. 1.2).
  // Only scale if it looks like a px value.
  const n = Number(value);
  if (!Number.isFinite(n)) return value;
  if (n <= 10) return value;
  return n * factor;
};

const maybeScaleLetterSpacing = (value, factor) => {
  // letterSpacing is often a small ratio; only scale if it looks like px.
  const n = Number(value);
  if (!Number.isFinite(n)) return value;
  if (n <= 5) return value;
  return n * factor;
};

const scaleNumber = (key, value, factor) => {
  if (!Number.isFinite(value)) return value;
  if (DO_NOT_SCALE_KEYS.has(key)) return value;

  if (key === 'lineHeight') return maybeScaleLineHeight(value, factor);
  if (key === 'letterSpacing') return maybeScaleLetterSpacing(value, factor);

  if (SCALE_KEYS.has(key)) return value * factor;

  return value;
};

const scaleArrayForKey = (key, arr, factor) => {
  if (!Array.isArray(arr)) return arr;

  // Konva/Polotno line points: [x1, y1, x2, y2, ...]
  if (key === 'points' && arr.every((v) => Number.isFinite(v))) {
    return arr.map((v) => v * factor);
  }

  // Stroke dash arrays are px lengths.
  if ((key === 'dash' || key === 'dashArray') && arr.every((v) => Number.isFinite(v))) {
    return arr.map((v) => v * factor);
  }

  // Some props may be arrays of px values (e.g. cornerRadius [tl,tr,br,bl]).
  if (SCALE_KEYS.has(key) && arr.every((v) => Number.isFinite(v))) {
    return arr.map((v) => v * factor);
  }

  return arr;
};

const scaleObjectInPlace = (obj, factor) => {
  if (!obj || typeof obj !== 'object') return;

  // Don’t touch app-defined custom payloads. They are intentionally kept in export-units
  // for features like CTA settings.
  if (Object.prototype.hasOwnProperty.call(obj, 'custom')) {
    // still scale other props, but skip walking into custom.
  }

  for (const [key, raw] of Object.entries(obj)) {
    if (key === 'id') continue;
    if (key === 'custom') continue;

    if (typeof raw === 'number') {
      obj[key] = scaleNumber(key, raw, factor);
      continue;
    }

    if (Array.isArray(raw)) {
      const scaled = scaleArrayForKey(key, raw, factor);
      if (scaled !== raw) obj[key] = scaled;

      // Recurse into arrays of objects.
      if (scaled === raw) {
        raw.forEach((item) => {
          if (item && typeof item === 'object') scaleObjectInPlace(item, factor);
        });
      }
      continue;
    }

    if (raw && typeof raw === 'object') {
      // Special cases that may contain pixel-like numbers.
      if (key === 'filters') {
        // Most filter settings are normalized (0..1). Don’t scale them.
        continue;
      }
      scaleObjectInPlace(raw, factor);
    }
  }
};

export const normalizeTemplateDesign = (design, options = {}) => {
  const detected = detectTemplatePreset(design);
  if (!detected || detected.space !== 'export') {
    // Template is already at canvas size or unrecognized - return as-is but ensure structure
    const result = cloneDeep(design);
    
    // Ensure pages preserve all their properties including background
    if (Array.isArray(result.pages)) {
      result.pages.forEach((page, idx) => {
        const originalPage = design.pages?.[idx];
        if (originalPage) {
          // Explicitly preserve background if it exists
          if (originalPage.background !== undefined) {
            page.background = originalPage.background;
          }
        }
      });
    }
    
    return result;
  }

  const presetName = typeof options.preset === 'string' ? options.preset : detected.preset;
  const preset = getPreset(presetName);
  const scale = 1; // Canvas = export dimensions, no scaling needed
  const factor = 1;

  const normalized = cloneDeep(design);

  // Set canvas dimensions to 1080px-based resolutions
  normalized.width = preset.dimensions.width;
  normalized.height = preset.dimensions.height;

  // Normalize pages and their children.
  if (Array.isArray(normalized.pages)) {
    normalized.pages.forEach((page) => {
      if (!page || typeof page !== 'object') return;

      // Force pages to rely on store size (1080px-based)
      if (typeof page.width === 'number') page.width = preset.dimensions.width;
      if (typeof page.height === 'number') page.height = preset.dimensions.height;

      // Scale page bleed if present.
      if (typeof page.bleed === 'number') page.bleed = page.bleed * factor;

      // Preserve background property explicitly (should already be in cloneDeep but ensure it)
      // This is critical for templates with colored/image backgrounds

      if (Array.isArray(page.children)) {
        page.children.forEach((child) => scaleObjectInPlace(child, factor));
      }
    });
  }

  return normalized;
};
