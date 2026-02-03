/* eslint-disable react-refresh/only-export-components */
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

    const [isDragActive, setIsDragActive] = useState(false);

    // State for uploaded files (images and videos)
    const [uploadedImages, setUploadedImages] = useState([]);

    const processFile = (file, fileType = 'any') => {
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
            // Add to uploaded files at the beginning
            setUploadedImages((prev) => [{ url: fileUrl, type: isVideo ? 'video' : 'image' }, ...prev]);

            // Add to canvas immediately
            if (isImage) {
                store.activePage.addElement({
                    type: 'image',
                    src: fileUrl,
                    x: 100,
                    y: 100,
                    width: 300,
                    height: 300
                });
            } else if (isVideo) {
                store.activePage.addElement({
                    type: 'video',
                    src: fileUrl,
                    x: 100,
                    y: 100,
                    width: 400,
                    height: 300
                });
            }
        };
        reader.readAsDataURL(file);
    };

    // Handle file upload (images and videos)
    const handleFileUpload = (e, fileType = 'any') => {
        const file = e.target.files?.[0];
        if (!file) return;
        processFile(file, fileType);

        // Reset input
        e.target.value = '';
    };

    // Handle delete file
    const handleDeleteImage = (indexToDelete) => {
        setUploadedImages(prev => prev.filter((_, index) => index !== indexToDelete));
    };

    return (
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
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
                className={`studio-card ${isDragActive ? 'drag-active' : ''}`}
                style={{
                    padding: '32px 16px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '20px',
                    cursor: 'pointer',
                }}
                onClick={() => fileInputRef.current?.click()}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') fileInputRef.current?.click();
                }}
                onDragEnter={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setIsDragActive(true);
                }}
                onDragOver={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                }}
                onDragLeave={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setIsDragActive(false);
                }}
                onDrop={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setIsDragActive(false);
                    const droppedFile = e.dataTransfer.files?.[0];
                    if (droppedFile) processFile(droppedFile, 'any');
                }}
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
                        backgroundColor: 'var(--accent-soft)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            {/* Upload arrow */}
                            <path d="M12 16V4" stroke="#f97316" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M7 9L12 4L17 9" stroke="#f97316" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                            {/* Tray/base */}
                            <path d="M20 16V18C20 19.1046 19.1046 20 18 20H6C4.89543 20 4 19.1046 4 18V16" stroke="#f97316" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </div>
                </div>

                <p style={{ margin: '0 0 8px 0', fontWeight: '600', color: 'var(--text-primary)', fontSize: '14px' }}>Click to upload</p>
                <p style={{ margin: '0 0 8px 0', color: 'var(--text-secondary)', fontSize: '13px' }}>or drag and drop files here</p>
                <p style={{ margin: '0', color: 'var(--text-muted)', fontSize: '11px' }}>PNG, JPG, GIF, MP4 up to 10MB</p>
                <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept="image/*,video/*" style={{ display: 'none' }} />
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '12px', marginBottom: '30px' }}>
                <button
                    className="studio-card"
                    onClick={() => {
                    const input = document.createElement('input');
                    input.type = 'file';
                    input.accept = 'image/*';
                    input.onchange = (e) => handleFileUpload(e, 'image');
                    input.click();
                }}
                    style={{
                    flex: 1,
                    padding: '12px',
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
                <button
                    className="studio-card"
                    onClick={() => {
                    const input = document.createElement('input');
                    input.type = 'file';
                    input.accept = 'video/*';
                    input.onchange = (e) => handleFileUpload(e, 'video');
                    input.click();
                }}
                    style={{
                    flex: 1,
                    padding: '12px',
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
                                    onClick={() => {
                                        store.activePage.addElement({
                                            type: 'image',
                                            src: src,
                                            x: 100,
                                            y: 100,
                                            width: 200,
                                            height: 200
                                        });
                                    }}
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
                                    onClick={() => {
                                        store.activePage.addElement({
                                            type: 'video',
                                            src: src.url,
                                            x: 100,
                                            y: 100,
                                            width: 400,
                                            height: 300
                                        });
                                    }}
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
                                    onClick={() => {
                                        store.activePage.addElement({
                                            type: 'image',
                                            src: src.url,
                                            x: 100,
                                            y: 100,
                                            width: 200,
                                            height: 200
                                        });
                                    }}
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
