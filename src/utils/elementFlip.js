// Utilities for making "Flip" work consistently across element types.
//
// Polotno supports flipX/flipY natively for some element types (e.g. image/svg/video).
// For shapes like `figure` and `line`, Polotno does not apply flipX/flipY in its renderer.
// We store flip flags in `element.custom` and synchronize them onto Konva nodes (scaleX/scaleY)
// from the workspace layer.

const isShapeNeedingCustomFlip = (element) => {
  const type = element?.type;
  return type === 'figure' || type === 'line';
};

const getCustomFlag = (element, key, fallback = false) => {
  const value = element?.custom?.[key];
  return typeof value === 'boolean' ? value : fallback;
};

export const getElementFlipState = (element) => {
  if (!element) return { flipX: false, flipY: false, usesCustomFlip: false };

  if (isShapeNeedingCustomFlip(element)) {
    return {
      flipX: getCustomFlag(element, 'flipX', false),
      flipY: getCustomFlag(element, 'flipY', false),
      usesCustomFlip: true,
    };
  }

  return {
    flipX: Boolean(element.flipX),
    flipY: Boolean(element.flipY),
    usesCustomFlip: false,
  };
};

const setCustom = (element, patch) => {
  element.set({
    custom: {
      ...(element.custom || {}),
      ...patch,
    },
  });
};

export const toggleElementFlip = (element, axis) => {
  if (!element) return;
  if (axis !== 'flipX' && axis !== 'flipY') return;

  // Native flip path.
  if (!isShapeNeedingCustomFlip(element)) {
    const current = !!element[axis];
    element.set({ [axis]: !current });
    return;
  }

  // Custom flip path for shapes.
  const current = getCustomFlag(element, axis, false);
  const next = !current;

  setCustom(element, { [axis]: next });
};
