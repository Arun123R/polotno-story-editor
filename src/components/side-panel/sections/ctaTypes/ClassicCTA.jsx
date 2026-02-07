/* eslint-disable react-refresh/only-export-components */
import React from 'react';
import { getCanvasRectFromBaseline } from './ctaPlacement';
import { escapeXml, svgToDataUri } from './svgUtils';

export const CLASSIC_CTA_DIMENSIONS = { width: 500, height: 150 };
export const CLASSIC_CTA_POSITION = { x: 300, y: 1050 };

export const CLASSIC_CTA_DEFAULTS = {
  text: 'Shop Now',
  redirectUrl: 'https://example.com',
  bgColor: '#3b82f6',
  textColor: '#000000',
  borderRadius: 25,
  borderWidth: 0,
  borderColor: '#ffffff',
  fontSize: 50,
  fontWeight: 'bold',
};

export function generateClassicCtaSVG(data, width, height) {
  const text = data?.text || 'Shop Now';
  const bgColor = data?.bgColor || '#3b82f6';
  const textColor = data?.textColor || '#000000';
  const borderRadius = Math.min(data?.borderRadius || 25, height / 2);
  const borderWidth = data?.borderWidth || 0;
  const borderColor = data?.borderColor || '#ffffff';
  const fontSize = data?.fontSize || 16;
  const fontWeight = data?.fontWeight || 'bold';
  const isTransparent = data?.transparent === true;

  const rectX = borderWidth / 2;
  const rectY = borderWidth / 2;
  const rectWidth = width - borderWidth;
  const rectHeight = height - borderWidth;

  return svgToDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
      <defs>
        <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="2" stdDeviation="3" flood-opacity="0.25"/>
        </filter>
      </defs>
      <rect x="${rectX}" y="${rectY}" width="${rectWidth}" height="${rectHeight}" rx="${borderRadius}" fill="${isTransparent ? 'transparent' : bgColor}" stroke="${borderColor}" stroke-width="${borderWidth}" filter="url(#shadow)"/>
      <text x="${width / 2}" y="${height / 2 + fontSize / 3}" text-anchor="middle" fill="${textColor}" font-size="${fontSize}" font-weight="${fontWeight}" font-family="Inter, -apple-system, sans-serif">${escapeXml(text)}</text>
    </svg>
  `);
}

export default function ClassicCTA({ store }) {
  const addClassicCta = () => {
    const page = store.activePage;
    if (!page) return;

    const canvasRect = getCanvasRectFromBaseline(
      store,
      CLASSIC_CTA_DIMENSIONS,
      CLASSIC_CTA_POSITION
    );

    const svgContent = generateClassicCtaSVG(
      CLASSIC_CTA_DEFAULTS,
      CLASSIC_CTA_DIMENSIONS.width,
      CLASSIC_CTA_DIMENSIONS.height
    );

    const element = page.addElement({
      type: 'svg',
      x: canvasRect.x,
      y: canvasRect.y,
      width: canvasRect.width,
      height: canvasRect.height,
      src: svgContent,
      keepRatio: false,
      custom: {
        ctaType: 'classic',
        ...CLASSIC_CTA_DEFAULTS,
      },
    });

    store.selectElements([element.id]);
  };

  return (
    <button
      onClick={addClassicCta}
      aria-label="Add Shop Now CTA"
      className="studio-card cta-card cta-classic w-full flex flex-col items-center justify-center px-3 group"
    >
      <div className="cta-pill bg-(--info) text-(--surface-light) transition-transform group-hover:scale-105">
        Shop Now
      </div>
    </button>
  );
}
