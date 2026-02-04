const DEFAULT_COLOR = '#FFFFFF';

export const DEFAULT_SLIDE_BACKGROUND = {
  color: {
    type: 'solid',
    solid: DEFAULT_COLOR,
  },
  media: null,
};

const clampHex = (value, fallback) => {
  if (typeof value !== 'string') return fallback;
  const v = value.trim();
  if (/^#([0-9a-fA-F]{3}){1,2}$/.test(v)) return v.toUpperCase();
  return fallback;
};

const normalizeDirection = (value) => {
  const allowed = ['top', 'bottom', 'left', 'right', 'radial'];
  return allowed.includes(value) ? value : 'top';
};

const normalizeSizing = (value) => {
  return value === 'fill' ? 'fill' : 'fit';
};

const normalizePosition = (value) => {
  const allowed = [
    'center',
    'top',
    'bottom',
    'left',
    'right',
    'top-left',
    'top-right',
    'bottom-left',
    'bottom-right',
    'bottom-center',
  ];
  return allowed.includes(value) ? value : 'bottom-center';
};

export const normalizeSlideBackground = (raw) => {
  const bg = raw && typeof raw === 'object' ? raw : null;

  // 1) New layered schema
  if (bg?.color && typeof bg.color === 'object') {
    const colorType = bg.color.type === 'gradient' ? 'gradient' : 'solid';
    const normalizedColor =
      colorType === 'gradient'
        ? {
            type: 'gradient',
            gradient: {
              from: clampHex(bg?.color?.gradient?.from, '#FF0000'),
              to: clampHex(bg?.color?.gradient?.to, '#0000FF'),
              direction: normalizeDirection(bg?.color?.gradient?.direction),
            },
          }
        : {
            type: 'solid',
            solid: clampHex(bg?.color?.solid, DEFAULT_COLOR),
          };

    const mediaRaw = bg?.media;
    const normalizedMedia =
      mediaRaw && typeof mediaRaw === 'object' && typeof mediaRaw.mediaUrl === 'string' && mediaRaw.mediaUrl.trim()
        ? {
            mediaUrl: mediaRaw.mediaUrl,
            sizing: normalizeSizing(mediaRaw.sizing),
            position: normalizePosition(mediaRaw.position),
          }
        : null;

    return {
      color: normalizedColor,
      media: normalizedMedia,
    };
  }

  // 2) Migration from old union schema
  const legacyType = bg?.type;
  if (legacyType === 'gradient') {
    return {
      color: {
        type: 'gradient',
        gradient: {
          from: clampHex(bg?.gradient?.from, '#FF0000'),
          to: clampHex(bg?.gradient?.to, '#0000FF'),
          direction: normalizeDirection(bg?.gradient?.direction),
        },
      },
      media: null,
    };
  }

  if (legacyType === 'media') {
    return {
      color: {
        type: 'solid',
        solid: DEFAULT_COLOR,
      },
      media:
        typeof bg?.mediaUrl === 'string' && bg.mediaUrl.trim()
          ? {
              mediaUrl: bg.mediaUrl,
              sizing: normalizeSizing(bg?.sizing),
              position: normalizePosition(bg?.position),
            }
          : null,
    };
  }

  // legacy/default to solid
  return {
    color: {
      type: 'solid',
      solid: clampHex(bg?.color, DEFAULT_COLOR),
    },
    media: null,
  };
};

export const inferSlideBackgroundFromPage = (page) => {
  if (!page) return DEFAULT_SLIDE_BACKGROUND;

  const raw = typeof page.background === 'string' ? page.background.trim() : '';

  if (raw.includes('linear-gradient')) {
    // Best-effort inference. We keep defaults for direction.
    const colors = raw.match(/#(?:[0-9a-fA-F]{3}){1,2}/g) || [];
    return {
      color: {
        type: 'gradient',
        gradient: {
          from: clampHex(colors[0], '#FF0000'),
          to: clampHex(colors[1], '#0000FF'),
          direction: 'top',
        },
      },
      media: null,
    };
  }

  const isUrlLike = /^(data:|blob:|https?:\/\/)/i.test(raw);
  if (raw && isUrlLike) {
    return {
      color: {
        type: 'solid',
        solid: DEFAULT_COLOR,
      },
      media: {
        mediaUrl: raw,
        sizing: 'fill',
        position: 'center',
      },
    };
  }

  return {
    color: {
      type: 'solid',
      solid: clampHex(raw, DEFAULT_COLOR),
    },
    media: null,
  };
};

const directionToDegrees = (direction) => {
  switch (direction) {
    case 'top':
      return 0;
    case 'right':
      return 90;
    case 'bottom':
      return 180;
    case 'left':
      return 270;
    default:
      return 0;
  }
};

const buildLinearGradientCss = ({ from, to, direction }) => {
  const deg = directionToDegrees(direction);
  return `linear-gradient(${deg}deg, ${from} 0%, ${to} 100%)`;
};

const buildLinearGradientSvg = ({ from, to, direction }, { width, height }) => {
  // Map "to X" direction to gradient vector.
  // "to top" means color goes bottom -> top.
  const map = {
    top: { x1: '0%', y1: '100%', x2: '0%', y2: '0%' },
    bottom: { x1: '0%', y1: '0%', x2: '0%', y2: '100%' },
    left: { x1: '100%', y1: '0%', x2: '0%', y2: '0%' },
    right: { x1: '0%', y1: '0%', x2: '100%', y2: '0%' },
  };
  const v = map[direction] || map.top;

  const w = Number.isFinite(width) && width > 0 ? width : 100;
  const h = Number.isFinite(height) && height > 0 ? height : 100;

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" preserveAspectRatio="none">
  <defs>
    <linearGradient id="g" x1="${v.x1}" y1="${v.y1}" x2="${v.x2}" y2="${v.y2}">
      <stop offset="0%" stop-color="${from}"/>
      <stop offset="100%" stop-color="${to}"/>
    </linearGradient>
  </defs>
  <rect x="0" y="0" width="${w}" height="${h}" fill="url(#g)"/>
</svg>`;
};

const buildRadialGradientSvg = ({ from, to }, { width, height }) => {
  const w = Number.isFinite(width) && width > 0 ? width : 100;
  const h = Number.isFinite(height) && height > 0 ? height : 100;

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" preserveAspectRatio="none">
  <defs>
    <radialGradient id="g" cx="50%" cy="50%" r="70%">
      <stop offset="0%" stop-color="${from}"/>
      <stop offset="100%" stop-color="${to}"/>
    </radialGradient>
  </defs>
  <rect x="0" y="0" width="${w}" height="${h}" fill="url(#g)"/>
</svg>`;
};

const positionToPreserveAspectAlign = (position) => {
  switch (position) {
    case 'top-left':
      return 'xMinYMin';
    case 'top':
      return 'xMidYMin';
    case 'top-right':
      return 'xMaxYMin';
    case 'left':
      return 'xMinYMid';
    case 'center':
      return 'xMidYMid';
    case 'right':
      return 'xMaxYMid';
    case 'bottom-left':
      return 'xMinYMax';
    case 'bottom':
      return 'xMidYMax';
    case 'bottom-right':
      return 'xMaxYMax';
    case 'bottom-center':
      return 'xMidYMax';
    default:
      return 'xMidYMid';
  }
};

const buildMediaSvg = ({ mediaUrl, sizing, position }, { width, height }) => {
  const meetOrSlice = sizing === 'fill' ? 'slice' : 'meet';
  const align = positionToPreserveAspectAlign(position);
  const preserveAspectRatio = `${align} ${meetOrSlice}`;

  // Use href (SVG2). Many renderers also support xlink:href; we include both.
  const safeUrl = String(mediaUrl || '');

  const w = Number.isFinite(width) && width > 0 ? width : 100;
  const h = Number.isFinite(height) && height > 0 ? height : 100;

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" preserveAspectRatio="none">
  <rect x="0" y="0" width="${w}" height="${h}" fill="transparent"/>
  <image x="0" y="0" width="${w}" height="${h}" href="${safeUrl}" xlink:href="${safeUrl}" preserveAspectRatio="${preserveAspectRatio}"/>
</svg>`;
};

export const buildBackgroundImageDataUrl = (bg, { width, height } = {}) => {
  const normalized = normalizeSlideBackground(bg);
  const dims = { width, height };

  // helper supports only gradient/media legacy calls; keep it for radial + data-url wrappers.
  if (normalized?.color?.type === 'gradient' && normalized?.color?.gradient) {
    const g = normalized.color.gradient;
    const svg =
      g.direction === 'radial' ? buildRadialGradientSvg(g, dims) : buildLinearGradientSvg(g, dims);
    return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
  }

  if (normalized?.media) {
    if (!normalized.media.mediaUrl) return '';
    const svg = buildMediaSvg(normalized.media, dims);
    return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
  }

  return '';
};

const BACKGROUND_MEDIA_ROLE = 'background-media';

const positionToAlign = (position) => {
  switch (position) {
    case 'top-left':
      return { ax: 0, ay: 0 };
    case 'top':
      return { ax: 0.5, ay: 0 };
    case 'top-right':
      return { ax: 1, ay: 0 };
    case 'left':
      return { ax: 0, ay: 0.5 };
    case 'center':
      return { ax: 0.5, ay: 0.5 };
    case 'right':
      return { ax: 1, ay: 0.5 };
    case 'bottom-left':
      return { ax: 0, ay: 1 };
    case 'bottom':
      return { ax: 0.5, ay: 1 };
    case 'bottom-right':
      return { ax: 1, ay: 1 };
    case 'bottom-center':
      return { ax: 0.5, ay: 1 };
    default:
      return { ax: 0.5, ay: 0.5 };
  }
};

const imageSizeCache = new Map();

const getImageSize = (url) => {
  const key = String(url || '');
  if (!key) return Promise.resolve(null);
  if (imageSizeCache.has(key)) return imageSizeCache.get(key);

  const promise = new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      resolve({ width: img.naturalWidth || img.width || 0, height: img.naturalHeight || img.height || 0 });
    };
    img.onerror = () => resolve(null);
    img.src = key;
  });

  imageSizeCache.set(key, promise);
  return promise;
};

const findBackgroundMediaElement = (page) => {
  const children = Array.isArray(page?.children) ? page.children : [];
  return children.find((el) => el?.custom?.role === BACKGROUND_MEDIA_ROLE);
};

const ensureBackgroundMediaElement = (page, media) => {
  if (!page || typeof page.set !== 'function') return null;
  if (!media || !media.mediaUrl) return null;

  const existing = findBackgroundMediaElement(page);
  if (existing) return existing;

  const el = page.addElement(
    {
      type: 'image',
      name: 'background-media',
      src: media.mediaUrl,
      x: 0,
      y: 0,
      width: page.computedWidth,
      height: page.computedHeight,
      opacity: 1,
      selectable: false,
      draggable: false,
      resizable: false,
      removable: false,
      contentEditable: false,
      styleEditable: false,
      alwaysOnTop: false,
      showInExport: true,
      cropX: 0,
      cropY: 0,
      cropWidth: 1,
      cropHeight: 1,
      custom: {
        role: BACKGROUND_MEDIA_ROLE,
      },
    },
    { skipSelect: true }
  );

  // Force it to be the first element so it sits behind everything.
  try {
    el.setZIndex(0);
  } catch {
    // ignore
  }
  return el;
};

const removeBackgroundMediaElement = (page) => {
  const el = findBackgroundMediaElement(page);
  if (!el) return;
  try {
    page.store.deleteElements([el.id]);
  } catch {
    // ignore
  }
};

const updateBackgroundMediaLayout = async (page, element, media) => {
  if (!page || !element || !media) return;

  // Keep element behind everything.
  try {
    element.setZIndex(0);
  } catch {
    // ignore
  }

  const pageW = Number(page.computedWidth);
  const pageH = Number(page.computedHeight);
  if (!Number.isFinite(pageW) || !Number.isFinite(pageH) || pageW <= 0 || pageH <= 0) return;

  const url = media.mediaUrl;
  const { ax, ay } = positionToAlign(media.position);
  const size = await getImageSize(url);
  const imgW = size?.width;
  const imgH = size?.height;

  // Always keep source in sync.
  const patchBase = {
    src: url,
    selectable: false,
    draggable: false,
    resizable: false,
    removable: false,
    contentEditable: false,
    styleEditable: false,
  };

  if (!Number.isFinite(imgW) || !Number.isFinite(imgH) || imgW <= 0 || imgH <= 0) {
    // Fallback: full-bleed without smart crop.
    element.set({
      ...patchBase,
      x: 0,
      y: 0,
      width: pageW,
      height: pageH,
      cropX: 0,
      cropY: 0,
      cropWidth: 1,
      cropHeight: 1,
    });
    return;
  }

  const imgRatio = imgW / imgH;
  const pageRatio = pageW / pageH;

  if (media.sizing === 'fit') {
    // Contain: resize the element to match image aspect ratio and fit within the page.
    let w = pageW;
    let h = pageH;
    if (pageRatio >= imgRatio) {
      h = pageH;
      w = pageH * imgRatio;
    } else {
      w = pageW;
      h = pageW / imgRatio;
    }
    const dx = pageW - w;
    const dy = pageH - h;
    const x = dx * ax;
    const y = dy * ay;
    element.set({
      ...patchBase,
      x,
      y,
      width: w,
      height: h,
      cropX: 0,
      cropY: 0,
      cropWidth: 1,
      cropHeight: 1,
    });
    return;
  }

  // Fill: cover crop inside page bounds.
  let cropWidth = 1;
  let cropHeight = 1;
  if (pageRatio >= imgRatio) {
    // page wider -> crop height
    cropHeight = Math.min(1, Math.max(0, imgRatio / pageRatio));
  } else {
    // page taller -> crop width
    cropWidth = Math.min(1, Math.max(0, pageRatio / imgRatio));
  }
  const maxX = Math.max(0, 1 - cropWidth);
  const maxY = Math.max(0, 1 - cropHeight);
  const cropX = maxX * ax;
  const cropY = maxY * ay;

  element.set({
    ...patchBase,
    x: 0,
    y: 0,
    width: pageW,
    height: pageH,
    cropX,
    cropY,
    cropWidth,
    cropHeight,
  });
};

export const applySlideBackgroundToPage = (page) => {
  if (!page || typeof page.set !== 'function') return;

  const custom = page.custom || {};
  const normalized = normalizeSlideBackground(custom.background);

  const needsCustomWrite = (() => {
    try {
      return JSON.stringify(custom.background) !== JSON.stringify(normalized);
    } catch {
      return true;
    }
  })();

  // 1) Apply color layer to page.background (always)
  let pageBackground = DEFAULT_COLOR;
  if (normalized.color.type === 'solid') {
    pageBackground = clampHex(normalized.color.solid, DEFAULT_COLOR);
  } else {
    const g = normalized.color.gradient;
    pageBackground =
      g.direction === 'radial'
        ? buildBackgroundImageDataUrl({ color: normalized.color, media: null }, {
            width: page.computedWidth,
            height: page.computedHeight,
          })
        : buildLinearGradientCss(g);
  }

  page.set(
    needsCustomWrite
      ? {
          background: pageBackground || DEFAULT_COLOR,
          custom: { ...custom, background: normalized },
        }
      : {
          background: pageBackground || DEFAULT_COLOR,
        }
  );

  // 2) Apply/remove media layer as a background image element above the page background.
  if (normalized.media && normalized.media.mediaUrl) {
    const el = ensureBackgroundMediaElement(page, normalized.media);
    if (el) {
      // async, but we don't want to block UI
      updateBackgroundMediaLayout(page, el, normalized.media);
    }
  } else {
    removeBackgroundMediaElement(page);
  }
};
