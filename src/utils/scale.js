export const PRESETS = {
  story: {
    name: 'story',
    working: { width: 360, height: 640 },
    export: { width: 1080, height: 1920 },
  },
  square: {
    name: 'square',
    working: { width: 360, height: 360 },
    export: { width: 1080, height: 1080 },
  },
  wide: {
    name: 'wide',
    working: { width: 640, height: 360 },
    export: { width: 1920, height: 1080 },
  },
};

export const DEFAULT_PRESET = 'story';

// Baseline export canvas used when some defaults were authored against 1080×1920.
export const BASELINE_EXPORT = PRESETS.story.export;

export const getPreset = (name) => {
  return PRESETS[name] || PRESETS[DEFAULT_PRESET];
};

export const getPresetScale = (preset) => {
  const p = typeof preset === 'string' ? getPreset(preset) : preset;
  return p.export.width / p.working.width;
};

export const getStorePresetName = (store) => {
  const preset = store?.custom?.preset;
  return typeof preset === 'string' ? preset : DEFAULT_PRESET;
};

export const getStorePreset = (store) => getPreset(getStorePresetName(store));

export const getStoreExportScale = (store) => getPresetScale(getStorePreset(store));

export const getStoreWorkingSize = (store) => getStorePreset(store).working;

export const getStoreExportSize = (store) => getStorePreset(store).export;

export const toCanvas = (value, exportScale = 3) => {
  const n = Number(value);
  if (!Number.isFinite(n)) return value;
  return n / exportScale;
};

export const toExport = (value, exportScale = 3) => {
  const n = Number(value);
  if (!Number.isFinite(n)) return value;
  return n * exportScale;
};

export const scalePointFromExport = (point, exportScale = 3) => {
  if (!point) return point;
  return {
    ...point,
    x: toCanvas(point.x, exportScale),
    y: toCanvas(point.y, exportScale),
  };
};

export const scaleSizeFromExport = (size, exportScale = 3) => {
  if (!size) return size;
  return {
    ...size,
    width: toCanvas(size.width, exportScale),
    height: toCanvas(size.height, exportScale),
  };
};

export const detectPresetFromDimensions = (width, height) => {
  const w = Number(width);
  const h = Number(height);
  if (!Number.isFinite(w) || !Number.isFinite(h)) return null;

  for (const [name, preset] of Object.entries(PRESETS)) {
    if (w === preset.export.width && h === preset.export.height) {
      return { preset: name, space: 'export' };
    }
    if (w === preset.working.width && h === preset.working.height) {
      return { preset: name, space: 'working' };
    }
  }

  return null;
};
