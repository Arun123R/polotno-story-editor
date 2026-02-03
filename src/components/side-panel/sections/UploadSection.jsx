import React, { useRef, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { SectionTab } from 'polotno/side-panel';
import { Button, Tooltip, Position } from '@blueprintjs/core';

// Icons
const UploadIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="17 8 12 3 7 8" />
        <line x1="12" y1="3" x2="12" y2="15" />
    </svg>
);

const UploadCloudIcon = () => (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 16L12 8" stroke="#F97316" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M9 11L12 8L15 11" stroke="#F97316" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M8 16H16" stroke="#F97316" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <rect x="3" y="3" width="18" height="18" rx="2" stroke="#3B82F6" strokeWidth="2" />
        <path d="M7 3V21" stroke="#3B82F6" strokeWidth="2" strokeDasharray="2 2" />
        <path d="M17 3V21" stroke="#3B82F6" strokeWidth="2" strokeDasharray="2 2" />
        <path d="M3 7H21" stroke="#3B82F6" strokeWidth="2" strokeDasharray="2 2" />
        <path d="M3 17H21" stroke="#3B82F6" strokeWidth="2" strokeDasharray="2 2" />
    </svg>
);

const ImageIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
        <circle cx="8.5" cy="8.5" r="1.5" />
        <polyline points="21 15 16 10 5 21" />
    </svg>
);

const VideoIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="23 7 16 12 23 17 23 7" />
        <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
    </svg>
);

// Tab Component
export const UploadSectionTab = (props) => (
    <SectionTab name="Upload" {...props} data-tooltip="Upload">
        <UploadIcon />
    </SectionTab>
);

// Panel Component
export const UploadSectionPanel = observer(({ store }) => {
    const fileInputRef = useRef(null);
    const videoInputRef = useRef(null);

    // State for uploaded files (images and videos)
    const [uploadedImages, setUploadedImages] = useState([]);

    // Helper to add element to canvas with proper sizing
    const addElementToCanvas = (fileUrl, type) => {
        if (!store.activePage) return;

        const pageWidth = store.width;
        // Default aspect ratio 16:9
        let aspectRatio = 16 / 9;

        if (type === 'image') {
            const img = new Image();
            img.onload = () => {
                aspectRatio = img.width / img.height;
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
        } else {
            // Video
            const video = document.createElement('video');
            video.preload = 'metadata';
            video.onloadedmetadata = () => {
                const vWidth = video.videoWidth;
                const vHeight = video.videoHeight;
                if (vWidth && vHeight) {
                    aspectRatio = vWidth / vHeight;
                }
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
            };
            video.onerror = () => {
                // Fallback
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
            };
            video.src = fileUrl;
        }
    };

    // Handle file upload (images and videos)
    const handleFileUpload = (e, fileType = 'any') => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file type
        const isImage = file.type.startsWith('image/');
        const isVideo = file.type.startsWith('video/');

        if (fileType === 'image' && !isImage) {
            alert('Please upload an image file');
            return;
        }

        if (fileType === 'video' && !isVideo) {
            alert('Please upload a video file');
            return;
        }

        if (!isImage && !isVideo) {
            alert('Please upload an image or video file');
            return;
        }

        // Read file as data URL
        const reader = new FileReader();
        reader.onload = (event) => {
            const fileUrl = event.target.result;
            const type = isVideo ? 'video' : 'image';

            // Add to uploaded files at the beginning
            setUploadedImages(prev => [{ url: fileUrl, type }, ...prev]);

            // Add to canvas immediately
            addElementToCanvas(fileUrl, type);
        };
        reader.readAsDataURL(file);

        // Reset input
        e.target.value = '';
    };

    // Handle delete file
    const handleDeleteImage = (indexToDelete) => {
        setUploadedImages(prev => prev.filter((_, index) => index !== indexToDelete));
    };

    // Handle drag and drop
    const [isDragOver, setIsDragOver] = useState(false);

    const handleDragEnter = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragOver(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragOver(false);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragOver(false);

        const files = e.dataTransfer.files;
        if (files && files.length > 0) {
            // Process the first file
            const file = files[0];
            const fakeEvent = { target: { files: [file], value: '' } };
            handleFileUpload(fakeEvent);
        }
    };

    return (
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }} data-drop-zone="upload">
            {/* Header */}
            <div style={{ padding: '0 0 16px 0' }}>
                <h2 style={{
                    fontSize: '14px',
                    fontWeight: '700',
                    color: 'var(--text-primary)',
                    margin: 0,
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                }}>
                    Upload Media
                </h2>
            </div>

            {/* Upload Zone */}
            <div
                style={{
                    border: isDragOver ? '2px solid #3b82f6' : '1px solid var(--border-primary)',
                    borderRadius: '12px',
                    padding: '32px 16px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '20px',
                    cursor: 'pointer',
                    backgroundColor: isDragOver ? 'rgba(59, 130, 246, 0.05)' : 'var(--bg-secondary)',
                    boxShadow: isDragOver ? '0 0 0 3px rgba(59, 130, 246, 0.1)' : '0 1px 2px rgba(0,0,0,0.05)',
                    transition: 'all 0.2s ease'
                }}
                onClick={() => fileInputRef.current?.click()}
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
            >
                <div style={{
                    width: '64px',
                    height: '64px',
                    marginBottom: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    <div style={{
                        width: '64px',
                        height: '64px',
                        borderRadius: '50%',
                        backgroundColor: isDragOver ? 'rgba(59, 130, 246, 0.15)' : 'var(--accent-soft)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.2s ease'
                    }}>
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            {/* Upload arrow */}
                            <path d="M12 16V4" stroke={isDragOver ? '#3b82f6' : '#f97316'} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M7 9L12 4L17 9" stroke={isDragOver ? '#3b82f6' : '#f97316'} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                            {/* Tray/base */}
                            <path d="M20 16V18C20 19.1046 19.1046 20 18 20H6C4.89543 20 4 19.1046 4 18V16" stroke={isDragOver ? '#3b82f6' : '#f97316'} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </div>
                </div>

                <p style={{ margin: '0 0 8px 0', fontWeight: '600', color: 'var(--text-primary)', fontSize: '14px' }}>
                    {isDragOver ? 'Drop to upload' : 'Click to upload'}
                </p>
                <p style={{ margin: '0 0 8px 0', color: 'var(--text-secondary)', fontSize: '13px' }}>or drag and drop files here</p>
                <p style={{ margin: '0', color: 'var(--text-muted)', fontSize: '11px' }}>PNG, JPG, GIF, MP4 up to 10MB</p>
                <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept="image/*,video/*" style={{ display: 'none' }} />
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '12px', marginBottom: '30px' }}>
                <button onClick={() => {
                    const input = document.createElement('input');
                    input.type = 'file';
                    input.accept = 'image/*';
                    input.onchange = (e) => handleFileUpload(e, 'image');
                    input.click();
                }} style={{
                    flex: 1,
                    padding: '12px',
                    backgroundColor: 'var(--bg-secondary)',
                    border: '1px solid var(--border-primary)',
                    borderRadius: '8px',
                    color: 'var(--text-primary)',
                    fontSize: '13px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '8px'
                }}>
                    <ImageIcon />
                    Upload Image
                </button>
                <button onClick={() => {
                    const input = document.createElement('input');
                    input.type = 'file';
                    input.accept = 'video/*';
                    input.onchange = (e) => handleFileUpload(e, 'video');
                    input.click();
                }} style={{
                    flex: 1,
                    padding: '12px',
                    backgroundColor: 'var(--bg-secondary)',
                    border: '1px solid var(--border-primary)',
                    borderRadius: '8px',
                    color: 'var(--text-primary)',
                    fontSize: '13px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '8px'
                }}>
                    <VideoIcon />
                    Upload Video
                </button>
            </div>

            {/* Recent Uploads */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
                <h3 style={{
                    fontSize: '12px',
                    fontWeight: '700',
                    color: 'var(--text-secondary)',
                    marginBottom: '16px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                }}>
                    Recent Uploads
                </h3>
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gridAutoRows: 'minmax(120px, auto)',
                    gap: '12px',
                    overflowY: 'auto',
                    paddingRight: '4px',
                    paddingBottom: '150px',
                    maxHeight: '400px'
                }}>
                    {uploadedImages.map((src, index) => (
                        <div key={index} style={{
                            width: '100%',
                            paddingBottom: '100%',
                            borderRadius: '12px',
                            overflow: 'hidden',
                            backgroundColor: 'var(--bg-tertiary)',
                            cursor: 'pointer',
                            border: '1px solid var(--border-primary)',
                            position: 'relative'
                        }}
                            onMouseEnter={(e) => {
                                const deleteBtn = e.currentTarget.querySelector('.delete-btn');
                                if (deleteBtn) deleteBtn.style.opacity = '1';
                            }}
                            onMouseLeave={(e) => {
                                const deleteBtn = e.currentTarget.querySelector('.delete-btn');
                                if (deleteBtn) deleteBtn.style.opacity = '0';
                            }}
                        >
                            {typeof src === 'string' ? (
                                // Legacy string format (for backward compatibility)
                                <img
                                    src={src}
                                    alt={`upload-${index}`}
                                    style={{
                                        position: 'absolute',
                                        top: 0,
                                        left: 0,
                                        width: '100%',
                                        height: '100%',
                                        objectFit: 'cover'
                                    }}
                                    draggable="true"
                                    onClick={() => addElementToCanvas(src, 'image')}
                                />
                            ) : src.type === 'video' ? (
                                // Video element
                                <video
                                    src={src.url}
                                    style={{
                                        position: 'absolute',
                                        top: 0,
                                        left: 0,
                                        width: '100%',
                                        height: '100%',
                                        objectFit: 'cover'
                                    }}
                                    onClick={() => addElementToCanvas(src.url, 'video')}
                                />
                            ) : (
                                // Image element
                                <img
                                    src={src.url}
                                    alt={`upload-${index}`}
                                    style={{
                                        position: 'absolute',
                                        top: 0,
                                        left: 0,
                                        width: '100%',
                                        height: '100%',
                                        objectFit: 'cover'
                                    }}
                                    draggable="true"
                                    onClick={() => addElementToCanvas(src.url, 'image')}
                                />
                            )}

                            <button
                                className="delete-btn"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteImage(index);
                                }}
                                style={{
                                    position: 'absolute',
                                    top: '6px',
                                    right: '6px',
                                    width: '24px',
                                    height: '24px',
                                    borderRadius: '50%',
                                    backgroundColor: 'rgba(239, 68, 68, 0.95)',
                                    border: 'none',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    opacity: '0',
                                    transition: 'opacity 0.2s',
                                    color: 'white',
                                    fontSize: '14px',
                                    fontWeight: 'bold',
                                    padding: 0
                                }}
                            >
                                ×
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
});

export const UploadSection = {
    name: 'upload',
    Tab: UploadSectionTab,
    Panel: UploadSectionPanel,
};
