/* eslint-disable react-refresh/only-export-components */
import React, { useRef } from 'react';
import { getStoreExportScale, toCanvas } from '../../../../utils/scale';
import { getCanvasRectFromBaseline } from './ctaPlacement';
import { ImageCtaIcon } from './ctaMeta';

export const IMAGE_CTA_DIMENSIONS = { width: 350, height: 320 };
export const IMAGE_CTA_POSITION = { x: 370, y: 1250 };

export const IMAGE_CTA_DEFAULTS = {
  redirectUrl: 'https://example.com',
  altText: '',
  borderRadius: 12,
  borderWidth: 0,
  borderColor: '#ffffff',
};

export default function ImageCTA({ store }) {
  const imageInputRef = useRef(null);

  const openImagePicker = () => {
    imageInputRef.current?.click();
  };

  const handleImageSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith('image/')) return;

    const page = store.activePage;
    if (!page) return;

    const canvasRect = getCanvasRectFromBaseline(
      store,
      IMAGE_CTA_DIMENSIONS,
      IMAGE_CTA_POSITION
    );

    const imageUrl = URL.createObjectURL(file);
    const exportScale = getStoreExportScale(store);

    const element = page.addElement({
      type: 'image',
      x: canvasRect.x,
      y: canvasRect.y,
      width: canvasRect.width,
      height: canvasRect.height,
      src: imageUrl,
      cornerRadius: toCanvas(IMAGE_CTA_DEFAULTS.borderRadius || 12, exportScale),
      strokeWidth: toCanvas(IMAGE_CTA_DEFAULTS.borderWidth || 0, exportScale),
      stroke: IMAGE_CTA_DEFAULTS.borderColor || '#ffffff',
      custom: {
        ctaType: 'image',
        ...IMAGE_CTA_DEFAULTS,
      },
    });

    store.selectElements([element.id]);
    e.target.value = '';
  };

  return (
    <>
      <input
        ref={imageInputRef}
        type="file"
        accept="image/png,image/jpg,image/jpeg,image/webp"
        onChange={handleImageSelect}
        className="hidden"
      />
      <button
        onClick={openImagePicker}
        className="studio-card cta-card w-full flex flex-col items-center justify-center px-3 group"
      >
        <div className="cta-icon bg-(--bg-hover) mb-1 group-hover:bg-(--border-primary) transition-colors">
          <ImageCtaIcon className="w-6 h-6 text-(--text-secondary)" />
        </div>
        <span className="cta-label text-[14px] text-(--text-primary) font-medium">
          Image CTA
        </span>
      </button>
    </>
  );
}
