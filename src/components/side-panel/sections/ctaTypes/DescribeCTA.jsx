/* eslint-disable react-refresh/only-export-components */
import React from 'react';
import { getCanvasRectFromBaseline } from './ctaPlacement';
import { escapeXml, svgToDataUri } from './svgUtils';
import { DescribeIcon } from './ctaMeta';

export const PRODUCT_CARD_CTA_DIMENSIONS = { width: 540, height: 680 };
export const PRODUCT_CARD_CTA_POSITION = { x: 250, y: 100 };

export const DESCRIBE_CTA_DIMENSIONS = { width: 540, height: 680 };
export const DESCRIBE_CTA_POSITION = { x: 250, y: 100 };

export const PRODUCT_CARD_CTA_DEFAULTS = {
  title: 'Eclipse Motion Pro',
  price: '$150',
  redirectUrl: 'https://example.com',
  imageUrl: '',
  cardBgColor: '#ffffff',
  cardBorderRadius: 24,
  cardOpacity: 1,
  cardShadow: true,
  cardShadowBlur: 20,
  cardShadowOpacity: 0.15,
  imageHeightRatio: 0.68,
  imageBorderRadius: 20,
  titleColor: '#1a1a2e',
  titleFontSize: 42,
  titleFontWeight: '600',
  titleFontFamily: 'Inter',
  priceColor: '#e67e22',
  priceFontSize: 38,
  priceFontWeight: '700',
  priceFontFamily: 'Inter',
  arrowButtonSize: 80,
  arrowButtonBgColor: '#f5f5f5',
  arrowButtonIconColor: '#1a1a2e',
  arrowButtonBorderRadius: 20,
  arrowButtonPositionX: 0,
  arrowButtonPositionY: 0,
  showFavoriteIcon: true,
  favoriteIconSize: 56,
  favoriteIconBgColor: 'rgba(128,128,128,0.6)',
  favoriteIconColor: '#ffffff',
  showCarouselDots: true,
  carouselDotsCount: 4,
  carouselDotsActiveIndex: 0,
};

export const DESCRIBE_CTA_DEFAULTS = {
  title: 'Eclipse Motion Pro',
  price: '$150',
  redirectUrl: 'https://example.com',
  imageUrl: '',
  cardBgColor: '#ffffff',
  cardBorderRadius: 24,
  cardOpacity: 1,
  cardShadow: true,
  cardShadowBlur: 20,
  cardShadowOpacity: 0.15,
  showImage: true,
  imageHeightRatio: 0.68,
  imageBorderRadius: 20,
  titleColor: '#1a1a2e',
  titleFontSize: 42,
  titleFontWeight: '600',
  titleFontFamily: 'Inter',
  priceColor: '#e67e22',
  priceFontSize: 38,
  priceFontWeight: '700',
  priceFontFamily: 'Inter',
  arrowButtonSize: 80,
  arrowButtonBgColor: '#f5f5f5',
  arrowButtonIconColor: '#1a1a2e',
  arrowButtonBorderRadius: 20,
  arrowButtonPositionX: 0,
  arrowButtonPositionY: 0,
  showFavoriteIcon: true,
  favoriteIconSize: 56,
  favoriteIconBgColor: 'rgba(128,128,128,0.6)',
  favoriteIconColor: '#ffffff',
  showCarouselDots: true,
  carouselDotsCount: 4,
  carouselDotsActiveIndex: 0,
};

export function generateDescribeProductSVG(data, width, height) {
  const title = data?.title || 'Eclipse Motion Pro';
  const price = data?.price || '$150';
  const imageUrl = data?.imageUrl || '';

  const cardBgColor = data?.cardBgColor || '#ffffff';
  const cardBorderRadius = data?.cardBorderRadius || 24;
  const cardOpacity = data?.cardOpacity !== undefined ? data.cardOpacity : 1;
  const cardShadow = data?.cardShadow !== false;
  const cardShadowBlur = data?.cardShadowBlur || 20;
  const cardShadowOpacity = data?.cardShadowOpacity || 0.15;

  const showImage = data?.showImage !== false;
  const imageHeightRatio = data?.imageHeightRatio || 0.68;
  const imageBorderRadius = data?.imageBorderRadius || 20;
  const imageHeight = showImage ? height * imageHeightRatio : 0;
  const imagePadding = 16;
  const imageWidth = width - imagePadding * 2;
  const imageInnerHeight = imageHeight - imagePadding;

  const titleColor = data?.titleColor || '#1a1a2e';
  const titleFontSize = data?.titleFontSize || 42;
  const titleFontWeight = data?.titleFontWeight || '600';
  const titleFontFamily = data?.titleFontFamily || 'Inter';

  const priceColor = data?.priceColor || '#e67e22';
  const priceFontSize = data?.priceFontSize || 38;
  const priceFontWeight = data?.priceFontWeight || '700';
  const priceFontFamily = data?.priceFontFamily || 'Inter';

  const arrowButtonSize = data?.arrowButtonSize || 80;
  const arrowButtonBgColor = data?.arrowButtonBgColor || '#f5f5f5';
  const arrowButtonIconColor = data?.arrowButtonIconColor || '#1a1a2e';
  const arrowButtonBorderRadius = data?.arrowButtonBorderRadius || 20;
  const arrowButtonPositionX = data?.arrowButtonPositionX || 0;
  const arrowButtonPositionY = data?.arrowButtonPositionY || 0;

  const showFavoriteIcon = data?.showFavoriteIcon !== false;
  const favoriteIconSize = data?.favoriteIconSize || 56;
  const favoriteIconBgColor =
    data?.favoriteIconBgColor || 'rgba(128,128,128,0.6)';
  const favoriteIconColor = data?.favoriteIconColor || '#ffffff';

  const showCarouselDots = data?.showCarouselDots !== false;
  const carouselDotsCount = data?.carouselDotsCount || 4;
  const carouselDotsActiveIndex = data?.carouselDotsActiveIndex || 0;

  const contentAreaY = imageHeight + 20;
  const titleY = contentAreaY + titleFontSize * 0.8;
  const priceY = titleY + priceFontSize + 8;

  const arrowButtonX = width - arrowButtonSize - 28 + arrowButtonPositionX;
  const arrowButtonY = height - arrowButtonSize - 28 + arrowButtonPositionY;

  const arrowIconSize = arrowButtonSize * 0.4;
  const arrowIconX = arrowButtonX + (arrowButtonSize - arrowIconSize) / 2;
  const arrowIconY = arrowButtonY + (arrowButtonSize - arrowIconSize) / 2;

  const favIconX = width - favoriteIconSize - 28;
  const favIconY = imagePadding + 16;

  const dotSize = 10;
  const dotGap = 8;
  const dotsWidth =
    dotSize * carouselDotsCount + dotGap * (carouselDotsCount - 1);
  const dotsStartX = (width - dotsWidth) / 2;
  const dotsY = imageHeight - 24;

  const imageSection = imageUrl
    ? `<image href="${imageUrl}" x="${imagePadding}" y="${imagePadding}" width="${imageWidth}" height="${imageInnerHeight}" preserveAspectRatio="xMidYMid slice" clip-path="url(#imageClip)"/>`
    : `<rect x="${imagePadding}" y="${imagePadding}" width="${imageWidth}" height="${imageInnerHeight}" rx="${imageBorderRadius}" fill="#d4d4d8"/>
       <g transform="translate(${width / 2 - 40}, ${imageHeight / 2 - 30})">
         <rect width="80" height="60" rx="8" fill="#a1a1aa"/>
         <circle cx="25" cy="22" r="10" fill="#d4d4d8"/>
         <path d="M10 50 L30 35 L50 45 L70 25 L70 50 Z" fill="#d4d4d8"/>
       </g>`;

  const carouselDotsSvg = showCarouselDots
    ? Array.from({ length: carouselDotsCount }, (_, i) => {
        const dotX = dotsStartX + i * (dotSize + dotGap);
        const isActive = i === carouselDotsActiveIndex;
        return `<circle cx="${dotX + dotSize / 2}" cy="${dotsY}" r="${dotSize / 2}" fill="${isActive ? '#ffffff' : 'rgba(255,255,255,0.5)'}"/>`;
      }).join('')
    : '';

  const favoriteIconSvg = showFavoriteIcon
    ? `
    <g transform="translate(${favIconX}, ${favIconY})">
      <rect width="${favoriteIconSize}" height="${favoriteIconSize}" rx="${favoriteIconSize / 2}" fill="${favoriteIconBgColor}"/>
      <path
        d="M${favoriteIconSize / 2} ${favoriteIconSize * 0.7}
           C${favoriteIconSize * 0.25} ${favoriteIconSize * 0.55}
           ${favoriteIconSize * 0.18} ${favoriteIconSize * 0.35}
           ${favoriteIconSize * 0.32} ${favoriteIconSize * 0.28}
           C${favoriteIconSize * 0.42} ${favoriteIconSize * 0.23}
           ${favoriteIconSize / 2} ${favoriteIconSize * 0.28}
           ${favoriteIconSize / 2} ${favoriteIconSize * 0.35}
           C${favoriteIconSize / 2} ${favoriteIconSize * 0.28}
           ${favoriteIconSize * 0.58} ${favoriteIconSize * 0.23}
           ${favoriteIconSize * 0.68} ${favoriteIconSize * 0.28}
           C${favoriteIconSize * 0.82} ${favoriteIconSize * 0.35}
           ${favoriteIconSize * 0.75} ${favoriteIconSize * 0.55}
           ${favoriteIconSize / 2} ${favoriteIconSize * 0.7} Z"
        stroke="${favoriteIconColor}"
        stroke-width="2"
        fill="none"
      />
    </g>
  `
    : '';

  const arrowPath = `
    M${arrowIconX + arrowIconSize * 0.25} ${arrowIconY + arrowIconSize * 0.75}
    L${arrowIconX + arrowIconSize * 0.75} ${arrowIconY + arrowIconSize * 0.25}
    M${arrowIconX + arrowIconSize * 0.4} ${arrowIconY + arrowIconSize * 0.25}
    L${arrowIconX + arrowIconSize * 0.75} ${arrowIconY + arrowIconSize * 0.25}
    L${arrowIconX + arrowIconSize * 0.75} ${arrowIconY + arrowIconSize * 0.6}
  `;

  return svgToDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
      <defs>
        ${cardShadow ? `
        <filter id="cardShadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="4" stdDeviation="${cardShadowBlur}" flood-opacity="${cardShadowOpacity}"/>
        </filter>
        ` : ''}
        <clipPath id="imageClip">
          <rect x="${imagePadding}" y="${imagePadding}" width="${imageWidth}" height="${imageInnerHeight}" rx="${imageBorderRadius}"/>
        </clipPath>
      </defs>

      <rect width="${width}" height="${height}" rx="${cardBorderRadius}" fill="${cardBgColor}" fill-opacity="${cardOpacity}" ${cardShadow ? 'filter="url(#cardShadow)"' : ''}/>

      ${imageSection}

      ${carouselDotsSvg}

      ${favoriteIconSvg}

      <text x="28" y="${titleY}" fill="${titleColor}" font-size="${titleFontSize}" font-weight="${titleFontWeight}" font-family="${titleFontFamily}, -apple-system, sans-serif">${escapeXml(title)}</text>

      <text x="28" y="${priceY}" fill="${priceColor}" font-size="${priceFontSize}" font-weight="${priceFontWeight}" font-family="${priceFontFamily}, -apple-system, sans-serif">${escapeXml(price)}</text>

      <rect x="${arrowButtonX}" y="${arrowButtonY}" width="${arrowButtonSize}" height="${arrowButtonSize}" rx="${arrowButtonBorderRadius}" fill="${arrowButtonBgColor}"/>
      <path
        d="${arrowPath}"
        stroke="${arrowButtonIconColor}"
        stroke-width="4"
        stroke-linecap="round"
        stroke-linejoin="round"
        fill="none"
      />
    </svg>
  `);
}

export default function DescribeCTA({ store }) {
  const addDescribeProductCta = () => {
    const page = store.activePage;
    if (!page) return;

    const canvasRect = getCanvasRectFromBaseline(
      store,
      DESCRIBE_CTA_DIMENSIONS,
      DESCRIBE_CTA_POSITION
    );

    const svgContent = generateDescribeProductSVG(
      DESCRIBE_CTA_DEFAULTS,
      DESCRIBE_CTA_DIMENSIONS.width,
      DESCRIBE_CTA_DIMENSIONS.height
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
        ctaType: 'describe_product',
        ...DESCRIBE_CTA_DEFAULTS,
      },
    });

    store.selectElements([element.id]);
  };

  return (
    <button
      onClick={addDescribeProductCta}
      className="studio-card product-square flex flex-col items-center justify-center p-2 group"
    >
      <div className="w-10 aspect-square bg-(--text-primary) rounded-xl flex items-center justify-center mb-1.5 shadow-sm group-hover:scale-105 transition-transform">
        <DescribeIcon className="w-5 h-5 text-(--bg-secondary)" />
      </div>
      <span className="text-[12px] text-(--text-secondary) font-medium">Describe</span>
    </button>
  );
}
