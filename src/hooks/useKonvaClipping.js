import { useEffect, useRef, useCallback } from 'react';
import { reaction } from 'mobx';

/**
 * useKonvaClipping - A hook that applies Konva-level clipping to page groups.
 * 
 * This hook directly manipulates the Konva stage to add clip properties to page groups,
 * ensuring that content outside the page bounds is not rendered. This provides
 * Storyly-like behavior where the slide itself is the strict viewport.
 * 
 * Technical implementation:
 * - Finds Konva stage by querying the container for internal Konva references
 * - Locates the page content Group using characteristics like page-sized background rect
 * - Applies clipX, clipY, clipWidth, clipHeight to create hard clipping boundary
 * - Re-applies clipping when page dimensions or active page changes
 * - Falls back to CSS clipping if Konva access fails
 * 
 * @param {object} store - The Polotno store instance
 * @param {React.RefObject} containerRef - Ref to the workspace container DOM element
 */
export function useKonvaClipping(store, containerRef) {
    const stageRef = useRef(null);
    const clippedGroupsRef = useRef(new Set());
    const retryCountRef = useRef(0);
    const maxRetries = 20;
    const cssFallbackAppliedRef = useRef(false);

    /**
     * Find the Konva stage from the container using multiple strategies
     */
    const findKonvaStage = useCallback(() => {
        if (!containerRef?.current) return null;

        // Strategy 1: Find via Konva's global stages registry
        if (typeof window !== 'undefined' && window.Konva?.stages) {
            const konvaContainer = containerRef.current.querySelector('.konvajs-content');
            if (konvaContainer) {
                for (const stage of window.Konva.stages) {
                    try {
                        if (stage.container() === konvaContainer) {
                            return stage;
                        }
                    } catch (e) {
                        // Stage may be destroyed, continue
                    }
                }
            }
        }

        // Strategy 2: Try to find stage via _konvaNode on React fiber
        const konvaContainer = containerRef.current.querySelector('.konvajs-content');
        if (konvaContainer) {
            // Check if stage is stored on the container
            if (konvaContainer._konvaNode) {
                return konvaContainer._konvaNode;
            }

            // Check canvas element
            const canvas = konvaContainer.querySelector('canvas');
            if (canvas?._konvaNode) {
                return canvas._konvaNode.getStage?.() || null;
            }
        }

        // Strategy 3: Access via Polotno's workspace internal structure
        // Polotno may expose the stage through its container element
        const polotnoWorkspace = containerRef.current.querySelector('[class*="polotno"]');
        if (polotnoWorkspace?._konvaStage) {
            return polotnoWorkspace._konvaStage;
        }

        return null;
    }, [containerRef]);

    /**
     * Find page content groups in the stage
     * These are identified by having a background rect matching page dimensions
     */
    const findPageGroups = useCallback((stage, pageWidth, pageHeight) => {
        const pageGroups = [];

        const layers = stage.getLayers();

        layers.forEach((layer) => {
            // Search recursively through all groups
            const searchGroups = (container) => {
                const children = container.getChildren();

                children.forEach((child) => {
                    if (child.getClassName() === 'Group') {
                        // Check if this group looks like a page container
                        if (isPageContentGroup(child, pageWidth, pageHeight)) {
                            pageGroups.push(child);
                        }
                        // Continue searching in nested groups
                        searchGroups(child);
                    }
                });
            };

            searchGroups(layer);
        });

        return pageGroups;
    }, []);

    /**
     * Determine if a group is a page content container
     * Page groups typically have a background rect matching page dimensions at (0,0)
     */
    const isPageContentGroup = (group, pageWidth, pageHeight) => {
        const children = group.getChildren();
        if (children.length === 0) return false;

        // Check first child - Polotno typically puts background rect first
        const firstChild = children[0];

        if (firstChild.getClassName() === 'Rect') {
            const width = firstChild.width();
            const height = firstChild.height();
            const x = firstChild.x();
            const y = firstChild.y();

            // Allow small floating point tolerance
            const matchesWidth = Math.abs(width - pageWidth) < 2;
            const matchesHeight = Math.abs(height - pageHeight) < 2;
            const isAtOrigin = Math.abs(x) < 2 && Math.abs(y) < 2;

            return matchesWidth && matchesHeight && isAtOrigin;
        }

        // Alternative check: group has multiple children including shapes
        // and its bounding box approximately matches page dimensions
        if (children.length >= 2) {
            try {
                const bbox = group.getClientRect({ skipTransform: true, skipStroke: true });
                const matchesWidth = bbox.width >= pageWidth * 0.8 && bbox.width <= pageWidth * 1.2;
                const matchesHeight = bbox.height >= pageHeight * 0.8 && bbox.height <= pageHeight * 1.2;

                if (matchesWidth && matchesHeight) {
                    // Additional check: has a rect-like shape at origin
                    return children.some((child) => {
                        return child.getClassName() === 'Rect' &&
                            Math.abs(child.x()) < 10 &&
                            Math.abs(child.y()) < 10;
                    });
                }
            } catch (e) {
                // getClientRect may fail in edge cases
            }
        }

        return false;
    };

    /**
     * Apply Konva clipping to identified page groups
     */
    const applyKonvaClipping = useCallback(() => {
        const stage = findKonvaStage();
        if (!stage) {
            return false;
        }

        stageRef.current = stage;

        const pageWidth = store.width;
        const pageHeight = store.height;

        if (!pageWidth || !pageHeight) return false;

        const pageGroups = findPageGroups(stage, pageWidth, pageHeight);

        if (pageGroups.length === 0) {
            // No page groups found - may need more specific targeting
            // Try applying to all top-level groups
            const layers = stage.getLayers();
            layers.forEach((layer) => {
                const topGroups = layer.getChildren((node) => node.getClassName() === 'Group');
                topGroups.forEach((group) => {
                    // Apply clipping to groups that have significant content
                    if (group.getChildren().length > 0) {
                        applyClipToGroup(group, pageWidth, pageHeight);
                    }
                });
            });
        } else {
            // Apply to identified page groups
            pageGroups.forEach((group) => {
                applyClipToGroup(group, pageWidth, pageHeight);
            });
        }

        // Force redraw
        stage.batchDraw();

        return clippedGroupsRef.current.size > 0;
    }, [findKonvaStage, findPageGroups, store.width, store.height]);

    /**
     * Apply clip properties to a specific group
     */
    const applyClipToGroup = (group, pageWidth, pageHeight) => {
        const id = group._id;

        // Only apply if not already clipped or dimensions changed
        const key = `${id}-${pageWidth}-${pageHeight}`;
        if (clippedGroupsRef.current.has(key)) return;

        // Apply Konva clipping properties
        group.clip({
            x: 0,
            y: 0,
            width: pageWidth,
            height: pageHeight,
        });

        clippedGroupsRef.current.add(key);

        console.log('[Konva Clipping] Applied to group:', id, 'dimensions:', pageWidth, 'x', pageHeight);
    };

    /**
     * CSS Fallback: Apply CSS-based clipping if Konva access fails
     * This provides a visual-only solution but works reliably
     */
    const applyCSSFallback = useCallback(() => {
        if (!containerRef?.current || cssFallbackAppliedRef.current) return;

        const konvaContainer = containerRef.current.querySelector('.konvajs-content');
        if (!konvaContainer) return;

        const pageWidth = store.width;
        const pageHeight = store.height;
        const scale = store.scale || 1;

        if (!pageWidth || !pageHeight) return;

        const scaledWidth = pageWidth * scale;
        const scaledHeight = pageHeight * scale;

        // Apply overflow hidden and clip the container
        konvaContainer.style.overflow = 'hidden';
        konvaContainer.style.clipPath = `inset(0)`;

        console.log('[CSS Fallback] Applied CSS clipping to Konva container');
        cssFallbackAppliedRef.current = true;
    }, [containerRef, store.width, store.height, store.scale]);

    /**
     * Attempt to apply clipping with retry logic
     */
    const attemptClipping = useCallback(() => {
        const success = applyKonvaClipping();

        if (!success && retryCountRef.current < maxRetries) {
            retryCountRef.current++;
            // Exponential backoff with jitter
            const delay = Math.min(100 * Math.pow(1.5, retryCountRef.current), 2000) + Math.random() * 50;

            setTimeout(() => {
                attemptClipping();
            }, delay);
        } else if (!success) {
            // Max retries reached, apply CSS fallback
            console.log('[Konva Clipping] Konva access failed, applying CSS fallback');
            applyCSSFallback();
        }
    }, [applyKonvaClipping, applyCSSFallback]);

    /**
     * Initial setup - attempt clipping when mounted
     */
    useEffect(() => {
        if (!containerRef?.current) return;

        // Wait for Polotno to fully initialize
        const initTimer = setTimeout(() => {
            attemptClipping();
        }, 500);

        return () => {
            clearTimeout(initTimer);
        };
    }, [containerRef, attemptClipping]);

    /**
     * React to store changes (page dimensions, active page, etc.)
     */
    useEffect(() => {
        const disposer = reaction(
            () => ({
                width: store.width,
                height: store.height,
                activePageId: store.activePage?.id,
                scale: store.scale,
                pagesCount: store.pages?.length,
            }),
            (newValue, oldValue) => {
                // Clear cached clipping if dimensions changed
                if (newValue.width !== oldValue?.width ||
                    newValue.height !== oldValue?.height ||
                    newValue.activePageId !== oldValue?.activePageId) {
                    clippedGroupsRef.current.clear();
                }

                // Re-apply clipping
                setTimeout(() => {
                    applyKonvaClipping();
                }, 100);
            },
            { fireImmediately: false }
        );

        return () => {
            disposer();
        };
    }, [store, applyKonvaClipping]);

    /**
     * Cleanup on unmount
     */
    useEffect(() => {
        return () => {
            clippedGroupsRef.current.clear();
            cssFallbackAppliedRef.current = false;
        };
    }, []);
}
