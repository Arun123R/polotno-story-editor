import React, { useRef, useEffect, useCallback } from 'react';
import { observer } from 'mobx-react-lite';
import { Workspace } from "polotno/canvas/workspace";
import { FitZoomButtons } from './FitZoomButtons';

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
 * EditorWorkspace - Main workspace component that wraps Polotno's Workspace
 * with additional functionality including page bounds clipping.
 */
export const EditorWorkspace = observer(({ store }) => {
  const containerRef = useRef(null);

  // Apply Konva-level clipping to page groups
  useKonvaPageClipping(store, containerRef);

  useEffect(() => {
    const id = requestAnimationFrame(() => {
      const stf = store.scaleToFit;
      store.setScale(typeof stf === 'number' && stf > 0 ? stf : 1);
    });
    return () => cancelAnimationFrame(id);
  }, [store]);

  return (
    <div
      ref={containerRef}
      className="workspace-backdrop"
      style={{ width: '100%', height: '100%', position: 'relative', overflow: 'hidden' }}
    >
      <Workspace 
        store={store} 
        backgroundColor="transparent"
        activePageBorderColor="#FF7A1A"
        layout="horizontal"
        paddingX={50}
        paddingY={50}
      />
      
      <FitZoomButtons store={store} />
    </div>
  );
});
