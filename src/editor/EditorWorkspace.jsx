import React, { useRef, useEffect, useCallback } from 'react';
import { observer } from 'mobx-react-lite';
import { Workspace } from "polotno/canvas/workspace";
import { FitZoomButtons } from './FitZoomButtons';
import { DragDropHandler } from './DragDropHandler';
import { useKonvaShapeFlips } from '../hooks/useKonvaShapeFlips';
import { createNewSlideAndRecreateAddSlidePage } from '../store/polotnoStore';

/**
 * useKonvaPageClipping - Hook that directly accesses the Konva stage
 * and applies clipFunc to page groups to clip content outside page bounds.
 */
const useKonvaPageClipping = (store, containerRef) => {
  const appliedRef = useRef(false);
  const intervalRef = useRef(null);

  const applyClipping = useCallback(() => {
    // Access Konva through window
    if (typeof window === 'undefined' || !window.Konva) {
      console.log('[PageClip] Konva not available on window');
      return false;
    }

    const stages = window.Konva.stages;
    if (!stages || stages.length === 0) {
      console.log('[PageClip] No Konva stages found');
      return false;
    }

    const pageWidth = store.width;
    const pageHeight = store.height;

    if (!pageWidth || !pageHeight) {
      console.log('[PageClip] Page dimensions not available');
      return false;
    }

    let clipped = false;

    // Iterate through all stages (usually just one for Polotno)
    stages.forEach((stage) => {
      const layers = stage.getLayers();

      layers.forEach((layer) => {
        // Find all groups in the layer
        const groups = layer.find('Group');

        groups.forEach((group) => {
          // Check if this group contains a background rect matching page size
          const children = group.getChildren();
          if (children.length === 0) return;

          // Look for page-like groups (have a background rect at 0,0 with page dimensions)
          let isPageGroup = false;

          children.forEach((child) => {
            if (child.getClassName() === 'Rect') {
              const w = child.width();
              const h = child.height();
              const x = child.x();
              const y = child.y();

              // Check if this rect matches page dimensions
              if (Math.abs(w - pageWidth) < 5 &&
                Math.abs(h - pageHeight) < 5 &&
                Math.abs(x) < 5 && Math.abs(y) < 5) {
                isPageGroup = true;
              }
            }
          });

          if (isPageGroup) {
            // Apply clip function to this group
            const currentClip = group.clipFunc();

            // Only apply if not already set
            if (!currentClip) {
              group.clipFunc((ctx) => {
                ctx.rect(0, 0, pageWidth, pageHeight);
              });

              console.log('[PageClip] Applied clipFunc to group:', group._id);
              clipped = true;
            }
          }
        });
      });

      // Force redraw
      if (clipped) {
        stage.batchDraw();
      }
    });

    return clipped;
  }, [store.width, store.height]);

  // Attempt to apply clipping with retry
  useEffect(() => {
    // Clear any existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    // Try to apply clipping periodically until successful
    const attemptClipping = () => {
      const success = applyClipping();
      if (success) {
        appliedRef.current = true;
        // Keep checking in case new pages are added
      }
    };

    // Initial delay to let Polotno initialize
    const timer = setTimeout(() => {
      attemptClipping();
      // Keep trying periodically
      intervalRef.current = setInterval(attemptClipping, 1000);
    }, 500);

    return () => {
      clearTimeout(timer);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [applyClipping]);

  // Re-apply when page dimensions change
  useEffect(() => {
    appliedRef.current = false; // Reset so we re-apply
    applyClipping();
  }, [store.width, store.height, store.activePage?.id, applyClipping]);
};



/**
 * EditorWorkspace - Main workspace component
 */
export const EditorWorkspace = observer(({ store }) => {
  const containerRef = useRef(null);

  // Apply Konva-level clipping to page groups
  useKonvaPageClipping(store, containerRef);

  // Sync custom flip flags for shapes (figure/line) onto Konva nodes.
  useKonvaShapeFlips(store, containerRef);

  // Set initial zoom once - stays constant across aspect ratio changes
  useEffect(() => {
    const id = requestAnimationFrame(() => {
      // Fixed zoom level - doesn't change when aspect ratio changes
      store.setScale(0.3);
    });
    return () => cancelAnimationFrame(id);
  }, [store]);

  // Hide controls (Delete, Duplicate, etc.) for the Add Slide page (always the last page)
  useEffect(() => {
    const updateControlsVisibility = () => {
      if (!containerRef.current || !store.pages.length) return;

      // Find the Add Slide page details
      const addSlidePage = store.pages.find(p => p.custom?.isAddSlidePage);
      if (!addSlidePage) return;

      let pageContainer = null;

      // Method 1: Try to find by ID (most precise)
      // Polotno often uses data-id on the page wrapper
      pageContainer = containerRef.current.querySelector(`[data-id="${addSlidePage.id}"]`);

      // Method 2: Fallback to last canvas traversal
      if (!pageContainer) {
        const canvases = containerRef.current.querySelectorAll('canvas');
        if (canvases.length > 0) {
          const lastCanvas = canvases[canvases.length - 1];
          let current = lastCanvas;

          // Traverse up to find the isolated page container
          for (let i = 0; i < 5; i++) {
            if (!current.parentElement) break;
            const parent = current.parentElement;

            // CRITICAL SAFETY: If the parent contains multiple canvases, we've gone too far up
            // and hit the workspace wrapper. Stop immediately to avoid hiding neighbor controls.
            if (parent.querySelectorAll('canvas').length > 1) {
              break;
            }

            // If this container has buttons (controls) and is single-page, it's our target
            if (parent.querySelector('button')) {
              pageContainer = parent;
              break;
            }
            current = parent;
          }
        }
      }

      if (pageContainer) {
        // Find the controls container (usually contains buttons)
        const children = Array.from(pageContainer.children);
        children.forEach(child => {
          // If it has buttons and is NOT the canvas wrapper
          if (child.querySelector('button') && !child.querySelector('canvas')) {
            child.style.opacity = '0';
            child.style.pointerEvents = 'none';
            // Also hide the borders/shadows if any
            child.style.display = 'none'; // Safer to fully remove from flow if pos absolute
          }
        });
      }
    };

    // Run periodically to handle DOM updates (new pages, re-renders)
    const intervalId = setInterval(updateControlsVisibility, 100);

    // Also run immediately
    updateControlsVisibility();

    return () => clearInterval(intervalId);
  }, []);

  // Handle Clicks for Add Slide Page (Bypassing selection to avoid blue border)
  useEffect(() => {
    const handleStageClick = (e) => {
      const shape = e.target;

      // Robust attribute retrieval (supporting both property access and getAttr)
      let custom = shape.attrs?.custom;
      if (!custom && typeof shape.getAttr === 'function') {
        custom = shape.getAttr('custom');
      }

      // Also check parent attributes (in case of grouping)
      if (!custom) {
        const parent = shape.getParent();
        if (parent) {
          custom = parent.attrs?.custom;
          if (!custom && typeof parent.getAttr === 'function') {
            custom = parent.getAttr('custom');
          }
        }
      }

      // Check if the clicked element (or parent) has our custom 'add-slide' action
      if (custom?.action === 'add-slide') {
        // Find the Add Slide Page
        const addSlidePage = store.pages.find(p => p.custom?.isAddSlidePage);
        if (addSlidePage) {
          createNewSlideAndRecreateAddSlidePage(addSlidePage.id);
        }
      }
    };

    // Attach listener to Konva stage
    const attachInterval = setInterval(() => {
      if (window.Konva && window.Konva.stages.length > 0) {
        // Remove any potential old listeners first
        window.Konva.stages[0].off('click tap', handleStageClick);
        window.Konva.stages[0].on('click tap', handleStageClick);
        clearInterval(attachInterval);
      }
    }, 500);

    return () => {
      clearInterval(attachInterval);
      if (window.Konva && window.Konva.stages.length > 0) {
        window.Konva.stages[0].off('click tap', handleStageClick);
      }
    };
  }, [store]);

  return (
    <DragDropHandler store={store}>
      <div
        ref={containerRef}
        className="workspace-backdrop"
        style={{ width: '100%', height: '100%', position: 'relative', overflow: 'hidden' }}
        data-drop-zone="canvas"
      >
        <Workspace
          store={store}
          backgroundColor="transparent"
          activePageBorderColor="#FF7A1A"
          layout="horizontal"
        />

        <FitZoomButtons store={store} />
      </div>
    </DragDropHandler>
  );
});
