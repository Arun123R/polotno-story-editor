import React, { useState, useCallback, useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import Konva from 'konva';
import './DragDropHandler.css';
import { applySlideBackgroundToPage, normalizeSlideBackground } from '../utils/slideBackground';

// Supported file types
const SUPPORTED_IMAGE_TYPES = ['image/png', 'image/jpg', 'image/jpeg', 'image/gif'];
const SUPPORTED_VIDEO_TYPES = ['video/mp4'];
const SUPPORTED_TYPES = [...SUPPORTED_IMAGE_TYPES, ...SUPPORTED_VIDEO_TYPES];

// File size limit (10MB)
const MAX_FILE_SIZE = 10 * 1024 * 1024;

const isFileSupported = (file) => {
    return SUPPORTED_TYPES.includes(file.type);
};

const isFileSizeValid = (file) => {
    return file.size <= MAX_FILE_SIZE;
};

/**
 * DragDropHandler - Manages drag-and-drop file upload for the canvas editor
 * Supports dropping images and videos onto the canvas or upload panel
 */
export const DragDropHandler = observer(({ store, children, onFileUpload }) => {
    const [isDragging, setIsDragging] = useState(false);
    const [dropTarget, setDropTarget] = useState(null); // 'canvas' or 'upload'
    const dragCounter = React.useRef(0);

    /**
     * Process and upload files
     */
    const getStageForActivePage = useCallback(() => {
        const pageId = store?.activePage?.id;
        if (!pageId) return null;
        return Konva.stages?.find((s) => s?.getAttr && s.getAttr('pageId') === pageId) || null;
    }, [store]);

    const findElementModelUnderClientPoint = useCallback((clientX, clientY) => {
        const stage = getStageForActivePage();
        if (!stage || typeof stage.getIntersection !== 'function') return null;

        const container = stage.container && stage.container();
        if (!container || typeof container.getBoundingClientRect !== 'function') return null;
        const rect = container.getBoundingClientRect();
        const pos = {
            x: clientX - rect.left,
            y: clientY - rect.top,
        };

        let node = stage.getIntersection(pos);
        while (node) {
            if (typeof node.hasName === 'function' && node.hasName('element')) break;
            if (typeof node.getName === 'function' && node.getName() === 'element') break;
            node = typeof node.getParent === 'function' ? node.getParent() : null;
        }

        if (!node || typeof node.id !== 'function') return null;
        const elementId = node.id();
        if (!elementId) return null;

        const model = store?.getElementById ? store.getElementById(elementId) : null;
        if (!model) return null;

        // Never treat our background media layer as a target element.
        if (model?.custom?.role === 'background-media') return null;

        return model;
    }, [getStageForActivePage, store]);

    const extractDominantColorFromUrl = useCallback((url) => {
        return new Promise((resolve) => {
            if (!url) return resolve(null);
            const img = new Image();
            img.crossOrigin = 'anonymous';
            img.onload = () => {
                try {
                    const canvas = document.createElement('canvas');
                    const size = 24;
                    canvas.width = size;
                    canvas.height = size;
                    const ctx = canvas.getContext('2d', { willReadFrequently: true });
                    ctx.drawImage(img, 0, 0, size, size);
                    const { data } = ctx.getImageData(0, 0, size, size);
                    let r = 0;
                    let g = 0;
                    let b = 0;
                    let count = 0;
                    for (let i = 0; i < data.length; i += 4) {
                        const a = data[i + 3];
                        if (a < 16) continue;
                        r += data[i];
                        g += data[i + 1];
                        b += data[i + 2];
                        count++;
                    }
                    if (!count) return resolve(null);
                    r = Math.round(r / count);
                    g = Math.round(g / count);
                    b = Math.round(b / count);
                    const toHex = (v) => v.toString(16).padStart(2, '0').toUpperCase();
                    resolve(`#${toHex(r)}${toHex(g)}${toHex(b)}`);
                } catch {
                    resolve(null);
                }
            };
            img.onerror = () => resolve(null);
            img.src = url;
        });
    }, []);

    const setImageAsBackgroundMedia = useCallback(async (fileUrl) => {
        const page = store?.activePage;
        if (!page) return;

        const custom = page.custom || {};
        const currentBg = normalizeSlideBackground(custom.background);
        const prevMedia = currentBg.media || {
            mediaUrl: '',
            sizing: 'fit',
            position: 'bottom-center',
        };
        const nextBg = {
            ...currentBg,
            media: {
                ...prevMedia,
                mediaUrl: fileUrl,
            },
        };

        // Apply media immediately.
        page.set({ custom: { ...custom, background: nextBg } });
        applySlideBackgroundToPage(page);

        // Optional premium touch: if still default white solid, set dominant color.
        const isDefaultSolid =
            nextBg?.color?.type === 'solid' &&
            typeof nextBg?.color?.solid === 'string' &&
            nextBg.color.solid.trim().toUpperCase() === '#FFFFFF';

        if (isDefaultSolid) {
            const dominant = await extractDominantColorFromUrl(fileUrl);
            if (dominant) {
                const custom2 = page.custom || {};
                const normalized2 = normalizeSlideBackground(custom2.background);
                const patched = {
                    ...normalized2,
                    color: { type: 'solid', solid: dominant },
                };
                page.set({ custom: { ...custom2, background: patched } });
                applySlideBackgroundToPage(page);
            }
        }
    }, [extractDominantColorFromUrl, store]);

    const replaceElementMedia = useCallback((targetElement, fileUrl) => {
        if (!targetElement || !fileUrl) return false;

        // Only replace media-like elements. If drop is on text/figure/etc, treat as background instead.
        const type = targetElement.type;
        if (!['image', 'video', 'gif', 'svg'].includes(type)) {
            return false;
        }

        try {
            targetElement.set({ src: fileUrl });
            return true;
        } catch {
            return false;
        }
    }, []);

    const processFiles = useCallback((files, dropInfo) => {
        const validFiles = Array.from(files).filter(file => {
            if (!isFileSupported(file)) {
                console.warn(`Unsupported file type: ${file.type}`);
                return false;
            }
            if (!isFileSizeValid(file)) {
                console.warn(`File too large: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)}MB)`);
                alert(`File "${file.name}" is too large. Maximum size is 10MB.`);
                return false;
            }
            return true;
        });

        if (validFiles.length === 0) {
            return;
        }

        // Process each valid file
        validFiles.forEach(file => {
            const reader = new FileReader();
            reader.onload = (event) => {
                const fileUrl = event.target.result;
                const isVideo = file.type.startsWith('video/');
                const isImage = file.type.startsWith('image/');

                // For upload drop zone we only upload into the panel.
                if (dropInfo?.target === 'upload') {
                    if (onFileUpload) {
                        onFileUpload({ url: fileUrl, type: isVideo ? 'video' : 'image' });
                    }
                    return;
                }

                // Canvas drop rules (Storyly-like):
                // - Drop on existing element => replace media
                // - Drop on empty canvas => set as background media (images only)
                if (dropInfo?.target === 'canvas' && isImage) {
                    const underPointer =
                        typeof dropInfo.clientX === 'number' && typeof dropInfo.clientY === 'number'
                            ? findElementModelUnderClientPoint(dropInfo.clientX, dropInfo.clientY)
                            : null;

                    const replaced = underPointer ? replaceElementMedia(underPointer, fileUrl) : false;
                    if (!replaced) {
                        setImageAsBackgroundMedia(fileUrl);
                    }
                    return;
                }

                // Add to canvas
                if (store.activePage) {
                    const pageWidth = store.width;

                    if (isImage) {
                        // Create image element to get natural dimensions
                        const img = new Image();
                        img.onload = () => {
                            const aspectRatio = img.width / img.height;

                            // Fix width to canvas width, auto-adjust height
                            const width = pageWidth;
                            const height = width / aspectRatio;

                            store.activePage.addElement({
                                type: 'image',
                                src: fileUrl,
                                x: 0,
                                y: 0,
                                width,
                                height
                            });
                        };
                        img.src = fileUrl;
                    } else if (isVideo) {
                        // Create video element to get actual dimensions
                        const video = document.createElement('video');
                        video.preload = 'metadata';

                        const handleLoadedMetadata = () => {
                            const vWidth = video.videoWidth;
                            const vHeight = video.videoHeight;

                            // Default to 16:9 if dimensions missing
                            const aspectRatio = (vWidth && vHeight) ? vWidth / vHeight : 16 / 9;

                            // Fix width to canvas width, auto-adjust height
                            const width = pageWidth;
                            const height = width / aspectRatio;

                            store.activePage.addElement({
                                type: 'video',
                                src: fileUrl,
                                x: 0,
                                y: 0,
                                width,
                                height
                            });

                            // Cleanup
                            video.onloadedmetadata = null;
                            video.onerror = null;
                        };

                        video.onloadedmetadata = handleLoadedMetadata;
                        video.onerror = () => {
                            // Fallback on error
                            const width = pageWidth;
                            const height = width / (16 / 9);
                            store.activePage.addElement({
                                type: 'video',
                                src: fileUrl,
                                x: 0,
                                y: 0,
                                width,
                                height
                            });
                        };

                        video.src = fileUrl;
                        // Trigger load
                        video.load();
                    }
                }
            };
            reader.readAsDataURL(file);
        });
    }, [
        store,
        onFileUpload,
        findElementModelUnderClientPoint,
        replaceElementMedia,
        setImageAsBackgroundMedia,
    ]);

    /**
     * Determine drop target based on element
     */
    const getDropTarget = useCallback((element) => {
        if (!element) return null;

        // Check if dropping on upload panel
        const uploadPanel = element.closest('[data-drop-zone="upload"]');
        if (uploadPanel) return 'upload';

        // Check if dropping on canvas
        const canvasElement = element.closest('[data-drop-zone="canvas"]');
        if (canvasElement) return 'canvas';

        return null;
    }, []);

    /**
     * Handle drag enter
     */
    const handleDragEnter = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();

        dragCounter.current++;

        // Check if dragging files
        if (e.dataTransfer.types && e.dataTransfer.types.includes('Files')) {
            const target = getDropTarget(e.target);
            if (target) {
                setIsDragging(true);
                setDropTarget(target);
            }
        }
    }, [getDropTarget]);

    /**
     * Handle drag over
     */
    const handleDragOver = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();

        // Set drop effect
        if (isDragging) {
            e.dataTransfer.dropEffect = 'copy';
        }
    }, [isDragging]);

    /**
     * Handle drag leave
     */
    const handleDragLeave = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();

        dragCounter.current--;

        if (dragCounter.current === 0) {
            setIsDragging(false);
            setDropTarget(null);
        }
    }, []);

    /**
     * Handle drop
     */
    const handleDrop = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();

        dragCounter.current = 0;
        setIsDragging(false);

        const target = getDropTarget(e.target);
        if (!target) {
            setDropTarget(null);
            return;
        }

        const files = e.dataTransfer.files;
        if (files && files.length > 0) {
            processFiles(files, {
                target,
                clientX: e.clientX,
                clientY: e.clientY,
            });
        }

        setDropTarget(null);
    }, [getDropTarget, processFiles]);

    /**
     * Attach global event listeners
     */
    useEffect(() => {
        const handleGlobalDragEnter = (e) => handleDragEnter(e);
        const handleGlobalDragOver = (e) => handleDragOver(e);
        const handleGlobalDragLeave = (e) => handleDragLeave(e);
        const handleGlobalDrop = (e) => handleDrop(e);

        document.addEventListener('dragenter', handleGlobalDragEnter);
        document.addEventListener('dragover', handleGlobalDragOver);
        document.addEventListener('dragleave', handleGlobalDragLeave);
        document.addEventListener('drop', handleGlobalDrop);

        return () => {
            document.removeEventListener('dragenter', handleGlobalDragEnter);
            document.removeEventListener('dragover', handleGlobalDragOver);
            document.removeEventListener('dragleave', handleGlobalDragLeave);
            document.removeEventListener('drop', handleGlobalDrop);
        };
    }, [handleDragEnter, handleDragOver, handleDragLeave, handleDrop]);

    return (
        <>
            {children}
            {isDragging && dropTarget && (
                <div className={`drag-drop-overlay drag-drop-overlay--${dropTarget}`}>
                    <div className="drag-drop-indicator">
                        <div className="drag-drop-icon">
                            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M12 16V4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M7 9L12 4L17 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M20 16V18C20 19.1046 19.1046 20 18 20H6C4.89543 20 4 19.1046 4 18V16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </div>
                        <div className="drag-drop-text">
                            <h3>{dropTarget === 'canvas' ? 'Drop to set background' : 'Drop to upload'}</h3>
                            <p>
                                {dropTarget === 'canvas'
                                    ? 'Images will become slide background media'
                                    : 'Images (PNG, JPG, GIF) and Videos (MP4)'}
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
});
