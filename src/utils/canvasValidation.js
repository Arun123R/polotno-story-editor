/**
 * Canvas Resolution Validation Utility
 * 
 * Detects legacy viewport-based values (360×640) and warns about inconsistencies.
 * Use during development to catch viewport-based positioning assumptions.
 */

const CANVAS_BASELINE = {
  width: 1080,
  height: 1920,
  minFontSize: 30,
  minElementSize: 300,
  minPosition: 0,
  maxPosition: 1080,
};

/**
 * Detect if an element appears to use legacy 360×640 viewport values
 */
export const detectLegacyScale = (element) => {
  if (!element || typeof element !== 'object') return null;

  const warnings = [];

  // Check position
  if (typeof element.x === 'number' && element.x < 200 && element.x > 0) {
    warnings.push(`x position (${element.x}) suggests 360px viewport`);
  }

  // Check dimensions
  if (typeof element.width === 'number' && element.width < 300 && element.width > 50) {
    warnings.push(`width (${element.width}) suggests viewport-based sizing`);
  }

  if (typeof element.height === 'number' && element.height < 200 && element.height > 30) {
    warnings.push(`height (${element.height}) suggests viewport-based sizing`);
  }

  // Check font sizes
  if (typeof element.fontSize === 'number' && element.fontSize < 30 && element.fontSize > 10) {
    warnings.push(`fontSize (${element.fontSize}) suggests viewport-based typography`);
  }

  // Check padding/margins
  if (typeof element.padding === 'number' && element.padding < 30 && element.padding > 5) {
    warnings.push(`padding (${element.padding}) suggests viewport-based spacing`);
  }

  if (warnings.length > 0) {
    return {
      element: element.id || element.name || 'unnamed',
      type: element.type || 'unknown',
      warnings,
      suggestedAction: 'Scale values by 3x for 1080×1920 canvas',
    };
  }

  return null;
};

/**
 * Validate canvas dimensions against expected aspect ratios
 */
export const validateCanvasDimensions = (width, height) => {
  const expectedRatios = {
    '9:16': 1920,
    '9:18': 2160,
    '9:19.5': 2340,
    '9:20': 2400,
  };

  if (width !== 1080) {
    return {
      valid: false,
      error: `Canvas width must be 1080px, got ${width}`,
    };
  }

  const validHeights = Object.values(expectedRatios);
  if (!validHeights.includes(height)) {
    return {
      valid: false,
      error: `Canvas height ${height} doesn't match any aspect ratio`,
      expected: validHeights,
    };
  }

  return { valid: true };
};

/**
 * Check if a CTA or interactive element is positioned within safe zones
 */
export const validateSafeAreaPosition = (element, canvasHeight) => {
  const SAFE_ZONES = {
    top: 180,      // Status bar + notch
    bottom: 120,   // Gesture bar
    left: 60,      // Side margin
    right: 60,     // Side margin
  };

  const warnings = [];

  if (element.y < SAFE_ZONES.top) {
    warnings.push(`Element too close to top (${element.y}px < ${SAFE_ZONES.top}px safe zone)`);
  }

  const bottomEdge = element.y + (element.height || 0);
  if (bottomEdge > canvasHeight - SAFE_ZONES.bottom) {
    warnings.push(`Element too close to bottom (${bottomEdge}px > ${canvasHeight - SAFE_ZONES.bottom}px safe zone)`);
  }

  if (element.x < SAFE_ZONES.left) {
    warnings.push(`Element too close to left edge (${element.x}px < ${SAFE_ZONES.left}px safe zone)`);
  }

  const rightEdge = element.x + (element.width || 0);
  if (rightEdge > 1080 - SAFE_ZONES.right) {
    warnings.push(`Element too close to right edge (${rightEdge}px > ${1080 - SAFE_ZONES.right}px safe zone)`);
  }

  return {
    valid: warnings.length === 0,
    warnings,
  };
};

/**
 * Validate an entire page/slide for legacy values
 */
export const validatePage = (page, options = {}) => {
  const { logWarnings = true, strict = false } = options;
  const issues = [];

  // Validate canvas dimensions
  const canvasCheck = validateCanvasDimensions(page.width, page.height);
  if (!canvasCheck.valid) {
    issues.push({
      type: 'canvas',
      severity: 'error',
      message: canvasCheck.error,
    });
  }

  // Check all children
  if (Array.isArray(page.children)) {
    page.children.forEach((child, index) => {
      // Legacy scale detection
      const legacyCheck = detectLegacyScale(child);
      if (legacyCheck) {
        issues.push({
          type: 'legacy',
          severity: strict ? 'error' : 'warning',
          element: `${child.type}[${index}]`,
          ...legacyCheck,
        });
      }

      // Safe area validation (only for interactive elements and CTAs)
      if (child.type === 'svg' || child.custom?.kind === 'interactive' || child.custom?.kind === 'cta') {
        const safeCheck = validateSafeAreaPosition(child, page.height);
        if (!safeCheck.valid) {
          issues.push({
            type: 'safe-area',
            severity: 'warning',
            element: `${child.type}[${index}]`,
            warnings: safeCheck.warnings,
          });
        }
      }
    });
  }

  if (logWarnings && issues.length > 0) {
    console.group(`🔍 Page Validation: ${issues.length} issue(s) found`);
    issues.forEach((issue) => {
      const emoji = issue.severity === 'error' ? '❌' : '⚠️';
      console.log(`${emoji} [${issue.type}] ${issue.element || 'page'}:`, issue.message || issue.warnings);
    });
    console.groupEnd();
  }

  return {
    valid: issues.filter((i) => i.severity === 'error').length === 0,
    issues,
  };
};

/**
 * Enable/disable runtime validation globally
 */
let validationEnabled = import.meta.env.DEV; // Only in development by default

export const setValidationEnabled = (enabled) => {
  validationEnabled = enabled;
};

export const isValidationEnabled = () => validationEnabled;

/**
 * Validate store on every page change (development only)
 */
export const enableRuntimeValidation = (store) => {
  if (!validationEnabled || !store) return;

  console.log('🔍 Runtime canvas validation enabled');

  // Validate on page selection
  store.on('change', (change) => {
    if (change.key === 'selectedPage') {
      const page = store.activePage;
      if (page) {
        validatePage({
          width: store.width,
          height: store.height,
          children: page.children,
        });
      }
    }
  });
};

export default {
  detectLegacyScale,
  validateCanvasDimensions,
  validateSafeAreaPosition,
  validatePage,
  enableRuntimeValidation,
  setValidationEnabled,
  isValidationEnabled,
};
