/**
 * Central aspect ratio configuration with 1080px-based canvas resolutions.
 * These dimensions are used for canvas initialization, rendering, and export.
 * UI preview scaling is handled separately via CSS transforms.
 */
export const ASPECT_RATIO_CONFIG = {
  '9:16': { width: 1080, height: 1920 },
  '9:19.5': { width: 1080, height: 2340 },
  '9:18': { width: 1080, height: 2160 },
  '9:20': { width: 1080, height: 2400 },
};

/**
 * Device presets mapping to aspect ratios.
 * All presets use 1080px-based canvas dimensions for both editor and export.
 */
export const PRESETS = {
  'ios-small': {
    name: 'ios-small',
    label: 'iOS Small Device',
    platform: 'iOS',
    aspectRatio: '9:16',
    dimensions: { width: 1080, height: 1920 },
  },
  'ios-large': {
    name: 'ios-large',
    label: 'iOS Large Device',
    platform: 'iOS',
    aspectRatio: '9:19.5',
    dimensions: { width: 1080, height: 2340 },
  },
  'android-small': {
    name: 'android-small',
    label: 'Android Small Device',
    platform: 'Android',
    aspectRatio: '9:16',
    dimensions: { width: 1080, height: 1920 },
  },
  'android-medium': {
    name: 'android-medium',
    label: 'Android Medium Device',
    platform: 'Android',
    aspectRatio: '9:18',
    dimensions: { width: 1080, height: 2160 },
  },
  'android-large': {
    name: 'android-large',
    label: 'Android Large Device',
    platform: 'Android',
    aspectRatio: '9:20',
    dimensions: { width: 1080, height: 2400 },
  },
};

export const DEFAULT_PRESET = 'ios-small';

// Baseline canvas dimensions (1080×1920)
export const BASELINE_DIMENSIONS = PRESETS['ios-small'].dimensions;

export const getPreset = (name) => {
  return PRESETS[name] || PRESETS[DEFAULT_PRESET];
};

/**
 * Returns the export scale factor for a preset.
 * Since canvas dimensions now match export dimensions, this is always 1.
 * Kept for backward compatibility.
 */
export const getPresetScale = (preset) => {
  return 1;
};

export const getStorePresetName = (store) => {
  const preset = store?.custom?.preset;
  return typeof preset === 'string' ? preset : DEFAULT_PRESET;
};

export const getStorePreset = (store) => getPreset(getStorePresetName(store));

/**
 * Returns export scale factor. Always 1 since canvas = export dimensions.
 */
export const getStoreExportScale = (store) => 1;

/**
 * Returns canvas dimensions for the current store preset.
 */
export const getStoreCanvasSize = (store) => getStorePreset(store).dimensions;

/**
 * Legacy alias - returns same as getStoreCanvasSize
 * @deprecated Use getStoreCanvasSize instead
 */
export const getStoreWorkingSize = (store) => getStoreCanvasSize(store);

/**
 * Returns export dimensions (same as canvas dimensions).
 */
export const getStoreExportSize = (store) => getStorePreset(store).dimensions;

/**
 * Converts a value from export scale to canvas scale.
 * Since export = canvas dimensions, this is a no-op (returns input).
 * Kept for backward compatibility.
 */
export const toCanvas = (value, exportScale = 1) => {
  return value;
};

/**
 * Converts a value from canvas scale to export scale.
 * Since export = canvas dimensions, this is a no-op (returns input).
 * Kept for backward compatibility.
 */
export const toExport = (value, exportScale = 1) => {
  return value;
};

/**
 * Scales a point from export coordinates to canvas coordinates.
 * Since they're the same now, this is a no-op.
 */
export const scalePointFromExport = (point, exportScale = 1) => {
  return point;
};

/**
 * Scales a size from export coordinates to canvas coordinates.
 * Since they're the same now, this is a no-op.
 */
export const scaleSizeFromExport = (size, exportScale = 1) => {
  return size;
};

/**
 * Detects preset from canvas dimensions.
 */
export const detectPresetFromDimensions = (width, height) => {
  const w = Number(width);
  const h = Number(height);
  if (!Number.isFinite(w) || !Number.isFinite(h)) return null;

  for (const [name, preset] of Object.entries(PRESETS)) {
    if (w === preset.dimensions.width && h === preset.dimensions.height) {
      return { preset: name, space: 'canvas' };
    }
  }

  return null;
};
