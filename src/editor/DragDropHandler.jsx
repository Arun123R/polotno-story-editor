import React, { useState, useCallback, useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import './DragDropHandler.css';

/**
 * DragDropHandler - Manages drag-and-drop file upload for the canvas editor
 * Supports dropping images and videos onto the canvas or upload panel
 */
export const DragDropHandler = observer(({ store, children, onFileUpload }) => {
    const [isDragging, setIsDragging] = useState(false);
    const [dropTarget, setDropTarget] = useState(null); // 'canvas' or 'upload'
    const dragCounter = React.useRef(0);

    // Supported file types
    const SUPPORTED_IMAGE_TYPES = ['image/png', 'image/jpg', 'image/jpeg', 'image/gif'];
    const SUPPORTED_VIDEO_TYPES = ['video/mp4'];
    const SUPPORTED_TYPES = [...SUPPORTED_IMAGE_TYPES, ...SUPPORTED_VIDEO_TYPES];

    // File size limit (10MB)
    const MAX_FILE_SIZE = 10 * 1024 * 1024;

    /**
     * Validate if file is supported
     */
    const isFileSupported = (file) => {
        return SUPPORTED_TYPES.includes(file.type);
    };

    /**
     * Validate file size
     */
    const isFileSizeValid = (file) => {
        return file.size <= MAX_FILE_SIZE;
    };

    /**
     * Process and upload files
     */
    const processFiles = useCallback((files, targetElement) => {
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

                // Call the upload callback if provided (for UploadSection integration)
                if (onFileUpload) {
                    onFileUpload({ url: fileUrl, type: isVideo ? 'video' : 'image' });
                }

                // Add to canvas
                if (store.activePage) {
                    const pageWidth = store.width;
                    const pageHeight = store.height;

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
    }, [store, onFileUpload]);

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
            processFiles(files, e.target);
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
                            <h3>Drop to upload</h3>
                            <p>Images (PNG, JPG, GIF) and Videos (MP4)</p>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
});
