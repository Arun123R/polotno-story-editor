import { useCallback, useEffect, useRef } from 'react';
import { reaction } from 'mobx';

const getCustomFlag = (element, key, fallback = false) => {
  const value = element?.custom?.[key];
  return typeof value === 'boolean' ? value : fallback;
};

const isShapeNeedingCustomFlip = (element) => {
  const type = element?.type;
  return type === 'figure' || type === 'line';
};

export function useKonvaShapeFlips(store, containerRef) {
  const rafRef = useRef(null);

  const findRelevantStages = useCallback(() => {
    if (!containerRef?.current) return [];
    if (typeof window === 'undefined' || !window.Konva?.stages) return [];

    const konvaContainer = containerRef.current.querySelector('.konvajs-content');
    if (!konvaContainer) return [];

    const stages = window.Konva.stages;
    const matched = [];

    for (const stage of stages) {
      try {
        if (stage?.container?.() === konvaContainer) {
          matched.push(stage);
        }
      } catch {
        // ignore destroyed stages
      }
    }

    // Fallback: if we can't match, just return all stages.
    return matched.length > 0 ? matched : stages;
  }, [containerRef]);

  const applyFlips = useCallback(() => {
    const stages = findRelevantStages();
    if (!stages || stages.length === 0) return;

    const activePage = store.activePage;
    const children = Array.isArray(activePage?.children) ? activePage.children : [];

    // Only shapes need custom flip syncing.
    const shapeChildren = children.filter(isShapeNeedingCustomFlip);
    if (shapeChildren.length === 0) return;

    stages.forEach((stage) => {
      let changed = false;

      shapeChildren.forEach((child) => {
        const flipX = getCustomFlag(child, 'flipX', false);
        const flipY = getCustomFlag(child, 'flipY', false);

        const desiredScaleX = flipX ? -1 : 1;
        const desiredScaleY = flipY ? -1 : 1;

        // Polotno assigns element.id to Konva node id.
        const node = stage.findOne(`#${child.id}`);
        if (!node) return;

        const isAnyFlip = flipX || flipY;

        if (isAnyFlip) {
          // Flip around center like media: offset to center and position to (x+offset).
          // Use model size when possible; fallback to Konva bbox.
          const bbox = node.getClientRect({ skipTransform: true, skipStroke: false });
          const modelW = typeof child.width === 'number' ? child.width : 0;
          const modelH = typeof child.height === 'number' ? child.height : 0;
          const w = modelW || bbox.width || 0;
          const h = modelH || bbox.height || 0;

          const offsetX = w / 2;
          const offsetY = h / 2;
          const desiredX = (child.x || 0) + offsetX;
          const desiredY = (child.y || 0) + offsetY;

          if (node.offsetX() !== offsetX) {
            node.offsetX(offsetX);
            changed = true;
          }
          if (node.offsetY() !== offsetY) {
            node.offsetY(offsetY);
            changed = true;
          }
          if (node.x() !== desiredX) {
            node.x(desiredX);
            changed = true;
          }
          if (node.y() !== desiredY) {
            node.y(desiredY);
            changed = true;
          }
        } else {
          // Restore default anchor for unflipped state.
          const desiredX = child.x || 0;
          const desiredY = child.y || 0;
          if (node.offsetX() !== 0) {
            node.offsetX(0);
            changed = true;
          }
          if (node.offsetY() !== 0) {
            node.offsetY(0);
            changed = true;
          }
          if (node.x() !== desiredX) {
            node.x(desiredX);
            changed = true;
          }
          if (node.y() !== desiredY) {
            node.y(desiredY);
            changed = true;
          }
        }

        if (node.scaleX() !== desiredScaleX) {
          node.scaleX(desiredScaleX);
          changed = true;
        }
        if (node.scaleY() !== desiredScaleY) {
          node.scaleY(desiredScaleY);
          changed = true;
        }
      });

      if (changed) {
        stage.batchDraw();
      }
    });
  }, [findRelevantStages, store]);

  useEffect(() => {
    // Initial kick after Polotno mounts Konva nodes.
    const startTimer = setTimeout(() => {
      applyFlips();
    }, 250);

    return () => clearTimeout(startTimer);
  }, [applyFlips]);

  const scheduleApply = useCallback(() => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
    }
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = null;
      applyFlips();
    });
  }, [applyFlips]);

  useEffect(() => {
    const disposer = reaction(
      () => {
        const activePage = store.activePage;
        const children = Array.isArray(activePage?.children) ? activePage.children : [];

        // Track transforms and flip flags so updates during move/resize are smooth.
        return children
          .filter(isShapeNeedingCustomFlip)
          .map((el) => {
            const fx = getCustomFlag(el, 'flipX', false);
            const fy = getCustomFlag(el, 'flipY', false);
            return `${el.id}:${el.x}:${el.y}:${el.width}:${el.height}:${fx}:${fy}`;
          })
          .join('|');
      },
      () => {
        scheduleApply();
      },
      { fireImmediately: false }
    );

    return () => {
      disposer();
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
      rafRef.current = null;
    };
  }, [store, scheduleApply]);
}
