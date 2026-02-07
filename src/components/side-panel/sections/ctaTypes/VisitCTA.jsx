/* eslint-disable react-refresh/only-export-components */
import React from 'react';
import { getCanvasRectFromBaseline } from './ctaPlacement';
import { escapeXml, svgToDataUri } from './svgUtils';
import { VisitIcon } from './ctaMeta';

export const VISIT_CTA_DIMENSIONS = { width: 520, height: 200 };
export const VISIT_CTA_POSITION = { x: 280, y: 850 };

export const VISIT_CTA_DEFAULTS = {
  title: 'White Striped T-shirt',
  description: '',
  price: '$59',
  originalPrice: '$99',
  showOriginalPrice: true,
  redirectUrl: 'https://example.com',
  cardBgColor: '#1e293b',
  cardBorderRadius: 16,
  cardOpacity: 1,
  cardShadow: false,
  cardShadowBlur: 0,
  cardShadowOpacity: 0,
  cardPaddingX: 24,
  cardPaddingY: 20,
  titleColor: '#ffffff',
  titleFontSize: 28,
  titleFontWeight: '600',
  titleFontFamily: 'Inter',
  descriptionColor: '#94a3b8',
  descriptionFontSize: 16,
  descriptionMaxLines: 2,
  priceColor: '#ffffff',
  priceFontSize: 24,
  priceFontWeight: '700',
  priceFontFamily: 'Inter',
  priceBgColor: '#334155',
  priceBorderRadius: 8,
  pricePadding: 12,
  originalPriceColor: '#64748b',
  originalPriceFontSize: 20,
  arrowButtonSize: 48,
  arrowButtonBgColor: 'transparent',
  arrowButtonIconColor: '#ffffff',
  arrowButtonBorderRadius: 0,
};

export function generateVisitProductSVG(data, width, height) {
  const title = data?.title || 'White Striped T-shirt';
  const price = data?.price || '$59';
  const originalPrice = data?.originalPrice || '$99';
  const showOriginalPrice = data?.showOriginalPrice !== false;

  const cardBgColor = data?.cardBgColor || '#1e293b';
  const cardBorderRadius = data?.cardBorderRadius || 16;
  const cardOpacity = data?.cardOpacity !== undefined ? data.cardOpacity : 1;
  const cardPaddingX = data?.cardPaddingX || 24;
  const cardPaddingY = data?.cardPaddingY || 20;

  const titleColor = data?.titleColor || '#ffffff';
  const titleFontSize = data?.titleFontSize || 28;
  const titleFontWeight = data?.titleFontWeight || '600';
  const titleFontFamily = data?.titleFontFamily || 'Inter';

  const priceColor = data?.priceColor || '#ffffff';
  const priceFontSize = data?.priceFontSize || 24;
  const priceFontWeight = data?.priceFontWeight || '700';
  const priceFontFamily = data?.priceFontFamily || 'Inter';
  const priceBgColor = data?.priceBgColor || '#334155';
  const priceBorderRadius = data?.priceBorderRadius || 8;
  const pricePadding = data?.pricePadding || 12;

  const originalPriceColor = data?.originalPriceColor || '#64748b';
  const originalPriceFontSize = data?.originalPriceFontSize || 20;

  const arrowButtonSize = data?.arrowButtonSize || 48;
  const arrowButtonIconColor = data?.arrowButtonIconColor || '#ffffff';

  const titleY = cardPaddingY + titleFontSize;

  const arrowX = width - cardPaddingX - arrowButtonSize / 2;
  const arrowY = cardPaddingY + titleFontSize / 2;
  const arrowIconSize = arrowButtonSize * 0.5;

  const priceBadgeHeight = priceFontSize + pricePadding * 2;
  const priceBadgeY = height - cardPaddingY - priceBadgeHeight;

  const arrowPath = `
    M${arrowX - arrowIconSize * 0.3} ${arrowY - arrowIconSize * 0.4}
    L${arrowX + arrowIconSize * 0.3} ${arrowY}
    L${arrowX - arrowIconSize * 0.3} ${arrowY + arrowIconSize * 0.4}
  `;

  return svgToDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
      <rect width="${width}" height="${height}" rx="${cardBorderRadius}" fill="${cardBgColor}" fill-opacity="${cardOpacity}"/>

      <text x="${cardPaddingX}" y="${titleY}" fill="${titleColor}" font-size="${titleFontSize}" font-weight="${titleFontWeight}" font-family="${titleFontFamily}, -apple-system, sans-serif">${escapeXml(title)}</text>

      <path
        d="${arrowPath}"
        stroke="${arrowButtonIconColor}"
        stroke-width="3"
        stroke-linecap="round"
        stroke-linejoin="round"
        fill="none"
      />

      <g transform="translate(${cardPaddingX}, ${priceBadgeY})">
        ${showOriginalPrice ? `
        <text x="0" y="${priceBadgeHeight / 2 + originalPriceFontSize * 0.35}" fill="${originalPriceColor}" font-size="${originalPriceFontSize}" font-weight="500" font-family="${priceFontFamily}, -apple-system, sans-serif" text-decoration="line-through">${escapeXml(originalPrice)}</text>
        <rect x="${originalPriceFontSize * originalPrice.length * 0.5 + 12}" y="0" width="${priceFontSize * price.length * 0.6 + pricePadding * 2}" height="${priceBadgeHeight}" rx="${priceBorderRadius}" fill="${priceBgColor}"/>
        <text x="${originalPriceFontSize * originalPrice.length * 0.5 + 12 + pricePadding}" y="${priceBadgeHeight / 2 + priceFontSize * 0.35}" fill="${priceColor}" font-size="${priceFontSize}" font-weight="${priceFontWeight}" font-family="${priceFontFamily}, -apple-system, sans-serif">${escapeXml(price)}</text>
        ` : `
        <rect x="0" y="0" width="${priceFontSize * price.length * 0.6 + pricePadding * 2}" height="${priceBadgeHeight}" rx="${priceBorderRadius}" fill="${priceBgColor}"/>
        <text x="${pricePadding}" y="${priceBadgeHeight / 2 + priceFontSize * 0.35}" fill="${priceColor}" font-size="${priceFontSize}" font-weight="${priceFontWeight}" font-family="${priceFontFamily}, -apple-system, sans-serif">${escapeXml(price)}</text>
        `}
      </g>
    </svg>
  `);
}

export default function VisitCTA({ store }) {
  const addVisitProductCta = () => {
    const page = store.activePage;
    if (!page) return;

    const canvasRect = getCanvasRectFromBaseline(
      store,
      VISIT_CTA_DIMENSIONS,
      VISIT_CTA_POSITION
    );

    const svgContent = generateVisitProductSVG(
      VISIT_CTA_DEFAULTS,
      VISIT_CTA_DIMENSIONS.width,
      VISIT_CTA_DIMENSIONS.height
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
        ctaType: 'visit_product',
        ...VISIT_CTA_DEFAULTS,
      },
    });

    store.selectElements([element.id]);
  };

  return (
    <button
      onClick={addVisitProductCta}
      className="studio-card product-square flex flex-col items-center justify-center p-2 group"
    >
      <div className="w-10 aspect-square bg-(--text-primary) rounded-xl flex items-center justify-center mb-1.5 shadow-sm group-hover:scale-105 transition-transform">
        <VisitIcon className="w-5 h-5 text-(--bg-secondary)" />
      </div>
      <span className="text-[12px] text-(--text-secondary) font-medium">Visit</span>
    </button>
  );
}
