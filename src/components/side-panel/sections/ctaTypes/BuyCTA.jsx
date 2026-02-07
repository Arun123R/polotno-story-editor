/* eslint-disable react-refresh/only-export-components */
import React from 'react';
import { getCanvasRectFromBaseline } from './ctaPlacement';
import { escapeXml, svgToDataUri } from './svgUtils';
import { BuyIcon } from './ctaMeta';

export const BUY_CTA_DIMENSIONS = { width: 520, height: 180 };
export const BUY_CTA_POSITION = { x: 280, y: 900 };

export const BUY_CTA_DEFAULTS = {
  title: 'White Striped T-Shirt',
  description: 'orange nike white cho...',
  price: '$125',
  redirectUrl: 'https://example.com',
  imageUrl: '',
  cardBgColor: '#ffffff',
  cardBorderRadius: 16,
  cardOpacity: 1,
  cardShadow: true,
  cardShadowBlur: 12,
  cardShadowOpacity: 0.15,
  cardPaddingX: 16,
  cardPaddingY: 16,
  showImage: true,
  imageSize: 100,
  imageBorderRadius: 12,
  titleColor: '#1a1a2e',
  titleFontSize: 22,
  titleFontWeight: '600',
  titleFontFamily: 'Inter',
  titleMaxLines: 2,
  descriptionColor: '#64748b',
  descriptionFontSize: 16,
  descriptionMaxLines: 1,
  priceColor: '#1a1a2e',
  priceFontSize: 20,
  priceFontWeight: '700',
  priceFontFamily: 'Inter',
  buyButtonText: 'Buy now',
  buyButtonBgColor: '#1a1a2e',
  buyButtonTextColor: '#ffffff',
  buyButtonFontSize: 16,
  buyButtonFontWeight: '600',
  buyButtonBorderRadius: 8,
  buyButtonPaddingX: 20,
  buyButtonPaddingY: 10,
};

export function generateBuyProductSVG(data, width, height) {
  const title = data?.title || 'White Striped T-Shirt';
  const description = data?.description || 'orange nike white cho...';
  const price = data?.price || '$125';
  const imageUrl = data?.imageUrl || '';

  const cardBgColor = data?.cardBgColor || '#ffffff';
  const cardBorderRadius = data?.cardBorderRadius || 16;
  const cardOpacity = data?.cardOpacity !== undefined ? data.cardOpacity : 1;
  const cardShadow = data?.cardShadow !== false;
  const cardShadowBlur = data?.cardShadowBlur || 12;
  const cardShadowOpacity = data?.cardShadowOpacity || 0.15;
  const cardPaddingX = data?.cardPaddingX || 16;
  const cardPaddingY = data?.cardPaddingY || 16;

  const showImage = data?.showImage !== false;
  const imageSize = data?.imageSize || 100;
  const imageBorderRadius = data?.imageBorderRadius || 12;

  const titleColor = data?.titleColor || '#1a1a2e';
  const titleFontSize = data?.titleFontSize || 22;
  const titleFontWeight = data?.titleFontWeight || '600';
  const titleFontFamily = data?.titleFontFamily || 'Inter';

  const descriptionColor = data?.descriptionColor || '#64748b';
  const descriptionFontSize = data?.descriptionFontSize || 16;

  const priceColor = data?.priceColor || '#1a1a2e';
  const priceFontSize = data?.priceFontSize || 20;
  const priceFontWeight = data?.priceFontWeight || '700';
  const priceFontFamily = data?.priceFontFamily || 'Inter';

  const buyButtonText = data?.buyButtonText || 'Buy now';
  const buyButtonBgColor = data?.buyButtonBgColor || '#1a1a2e';
  const buyButtonTextColor = data?.buyButtonTextColor || '#ffffff';
  const buyButtonFontSize = data?.buyButtonFontSize || 16;
  const buyButtonFontWeight = data?.buyButtonFontWeight || '600';
  const buyButtonBorderRadius = data?.buyButtonBorderRadius || 8;
  const buyButtonPaddingX = data?.buyButtonPaddingX || 20;
  const buyButtonPaddingY = data?.buyButtonPaddingY || 10;

  const contentStartX = showImage ? cardPaddingX + imageSize + 16 : cardPaddingX;
  const titleY = cardPaddingY + titleFontSize;
  const descriptionY = titleY + descriptionFontSize + 8;
  const priceY = height - cardPaddingY - 8;

  const buyButtonWidth = buyButtonFontSize * buyButtonText.length * 0.55 + buyButtonPaddingX * 2;
  const buyButtonHeight = buyButtonFontSize + buyButtonPaddingY * 2;
  const buyButtonX = width - cardPaddingX - buyButtonWidth;
  const buyButtonY = height - cardPaddingY - buyButtonHeight;

  const imageSectionX = cardPaddingX;
  const imageSectionY = (height - imageSize) / 2;

  const imageSection = showImage
    ? imageUrl
      ? `<image href="${imageUrl}" x="${imageSectionX}" y="${imageSectionY}" width="${imageSize}" height="${imageSize}" preserveAspectRatio="xMidYMid slice" clip-path="url(#buyImageClip)"/>`
      : `<rect x="${imageSectionX}" y="${imageSectionY}" width="${imageSize}" height="${imageSize}" rx="${imageBorderRadius}" fill="#e2e8f0"/>
       <g transform="translate(${imageSectionX + imageSize / 2 - 20}, ${imageSectionY + imageSize / 2 - 15})">
         <rect width="40" height="30" rx="4" fill="#94a3b8"/>
         <circle cx="12" cy="11" r="5" fill="#e2e8f0"/>
         <path d="M5 25 L15 18 L25 22 L35 12 L35 25 Z" fill="#e2e8f0"/>
       </g>`
    : '';

  return svgToDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
      <defs>
        ${cardShadow ? `
        <filter id="buyShadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="4" stdDeviation="${cardShadowBlur}" flood-opacity="${cardShadowOpacity}"/>
        </filter>
        ` : ''}
        ${showImage ? `
        <clipPath id="buyImageClip">
          <rect x="${imageSectionX}" y="${imageSectionY}" width="${imageSize}" height="${imageSize}" rx="${imageBorderRadius}"/>
        </clipPath>
        ` : ''}
      </defs>

      <rect width="${width}" height="${height}" rx="${cardBorderRadius}" fill="${cardBgColor}" fill-opacity="${cardOpacity}" ${cardShadow ? 'filter="url(#buyShadow)"' : ''}/>

      ${imageSection}

      <text x="${contentStartX}" y="${titleY}" fill="${titleColor}" font-size="${titleFontSize}" font-weight="${titleFontWeight}" font-family="${titleFontFamily}, -apple-system, sans-serif">${escapeXml(title)}</text>

      <text x="${contentStartX}" y="${descriptionY}" fill="${descriptionColor}" font-size="${descriptionFontSize}" font-weight="400" font-family="${titleFontFamily}, -apple-system, sans-serif">${escapeXml(description)}</text>

      <text x="${contentStartX}" y="${priceY}" fill="${priceColor}" font-size="${priceFontSize}" font-weight="${priceFontWeight}" font-family="${priceFontFamily}, -apple-system, sans-serif">${escapeXml(price)}</text>

      <rect x="${buyButtonX}" y="${buyButtonY}" width="${buyButtonWidth}" height="${buyButtonHeight}" rx="${buyButtonBorderRadius}" fill="${buyButtonBgColor}"/>
      <text x="${buyButtonX + buyButtonWidth / 2}" y="${buyButtonY + buyButtonHeight / 2 + buyButtonFontSize * 0.35}" text-anchor="middle" fill="${buyButtonTextColor}" font-size="${buyButtonFontSize}" font-weight="${buyButtonFontWeight}" font-family="${titleFontFamily}, -apple-system, sans-serif">${escapeXml(buyButtonText)}</text>
    </svg>
  `);
}

export default function BuyCTA({ store }) {
  const addBuyProductCta = () => {
    const page = store.activePage;
    if (!page) return;

    const canvasRect = getCanvasRectFromBaseline(store, BUY_CTA_DIMENSIONS, BUY_CTA_POSITION);

    const svgContent = generateBuyProductSVG(
      BUY_CTA_DEFAULTS,
      BUY_CTA_DIMENSIONS.width,
      BUY_CTA_DIMENSIONS.height
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
        ctaType: 'buy_product',
        ...BUY_CTA_DEFAULTS,
      },
    });

    store.selectElements([element.id]);
  };

  return (
    <button
      onClick={addBuyProductCta}
      className="studio-card product-square flex flex-col items-center justify-center p-2 group"
    >
      <div className="w-10 aspect-square bg-(--text-primary) rounded-xl flex items-center justify-center mb-1.5 shadow-sm group-hover:scale-105 transition-transform">
        <BuyIcon className="w-5 h-5 text-(--bg-secondary)" />
      </div>
      <span className="text-[12px] text-(--text-secondary) font-medium">Buy</span>
    </button>
  );
}
