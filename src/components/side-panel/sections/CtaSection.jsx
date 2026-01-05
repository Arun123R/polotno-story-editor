import React, { useRef } from 'react';
import { observer } from 'mobx-react-lite';
import { SectionTab } from 'polotno/side-panel';
import {
  BASELINE_EXPORT,
  getStoreExportScale,
  getStoreExportSize,
  toCanvas,
} from '../../../utils/scale';

// CTA Icon for tab
const CtaIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M10 13a5 5 0 0 0 7.07 0l2.83-2.83a5 5 0 0 0-7.07-7.07L11 4" />
    <path d="M14 11a5 5 0 0 0-7.07 0L4.1 13.83a5 5 0 1 0 7.07 7.07L13 20" />
  </svg>
);

// CTA Section Tab
export const CtaSectionTab = (props) => (
  <SectionTab name="CTA" {...props}>
    <div className="flex justify-center items-center">
      <CtaIcon />
    </div>
  </SectionTab>
);

// CTA Type Icons
const ClassicIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="8" width="18" height="8" rx="4" />
    <line x1="8" y1="12" x2="16" y2="12" />
  </svg>
);

const SwipeUpIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M12 19V5" />
    <polyline points="5 12 12 5 19 12" />
  </svg>
);

const ImageCtaIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <circle cx="8.5" cy="8.5" r="1.5" />
    <polyline points="21 15 16 10 5 21" />
  </svg>
);

const ProductCardIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
    <line x1="3" y1="6" x2="21" y2="6" />
    <path d="M16 10a4 4 0 01-8 0" />
  </svg>
);

// ==================== CTA DIMENSIONS ====================
const CTA_DIMENSIONS = {
  classic: { width: 500, height: 150 },
  swipe_up: { width: 400, height: 280 },
  image: { width: 350, height: 320 },
  product_card: { width: 540, height: 680 },
  // Product Card Variants
  visit_product: { width: 520, height: 200 },
  describe_product: { width: 540, height: 680 },
  buy_product: { width: 520, height: 180 },
};

// ==================== CTA DEFAULT POSITIONS ====================
const CTA_POSITIONS = {
  classic: { x: 300, y: 1050 },
  swipe_up: { x: 350, y: 1600 },
  image: { x: 370, y: 1250 },
  product_card: { x: 250, y: 100 },
  // Product Card Variants
  visit_product: { x: 280, y: 850 },
  describe_product: { x: 250, y: 100 },
  buy_product: { x: 280, y: 900 },
};

// ==================== CTA DEFAULT DATA ====================
const CTA_DEFAULTS = {
  classic: {
    text: 'Shop Now',
    redirectUrl: 'https://example.com',
    bgColor: '#3b82f6',
    textColor: '#ffffff',
    borderRadius: 25,
    borderWidth: 0,
    borderColor: '#ffffff',
    fontSize: 50,
    fontWeight: 'bold',
  },
  swipe_up: {
    text: 'Swipe Up',
    redirectUrl: 'https://example.com',
    arrowColor: '#636363',
    arrowSize: 50,
    arrowAnimation: true,
    textColor: '#ffffff',
    bgColor: '#636363',
    borderRadius: 20,
    fontSize: 50,
  },
  image: {
    redirectUrl: 'https://example.com',
    altText: '',
    borderRadius: 12,
    borderWidth: 0,
    borderColor: '#ffffff',
  },
  product_card: {
    title: 'Eclipse Motion Pro',
    price: '$150',
    redirectUrl: 'https://example.com',
    imageUrl: '',
    // Card styling
    cardBgColor: '#ffffff',
    cardBorderRadius: 24,
    cardShadow: true,
    cardShadowBlur: 20,
    cardShadowOpacity: 0.15,
    // Image styling
    imageHeightRatio: 0.68,
    imageBorderRadius: 20,
    // Title styling
    titleColor: '#1a1a2e',
    titleFontSize: 42,
    titleFontWeight: '600',
    titleFontFamily: 'Inter',
    // Price styling
    priceColor: '#e67e22',
    priceFontSize: 38,
    priceFontWeight: '700',
    priceFontFamily: 'Inter',
    // Arrow button styling
    arrowButtonSize: 80,
    arrowButtonBgColor: '#f5f5f5',
    arrowButtonIconColor: '#1a1a2e',
    arrowButtonBorderRadius: 20,
    arrowButtonPositionX: 0,
    arrowButtonPositionY: 0,
    // Favorite icon (optional)
    showFavoriteIcon: true,
    favoriteIconSize: 56,
    favoriteIconBgColor: 'rgba(128,128,128,0.6)',
    favoriteIconColor: '#ffffff',
    // Carousel dots (optional)
    showCarouselDots: true,
    carouselDotsCount: 4,
    carouselDotsActiveIndex: 0,
  },
  // ==================== VISIT PRODUCT (No image, text + arrow) ====================
  visit_product: {
    title: 'White Striped T-shirt',
    description: '',
    price: '$59',
    originalPrice: '$99',
    showOriginalPrice: true,
    redirectUrl: 'https://example.com',
    // Card styling
    cardBgColor: '#1e293b',
    cardBorderRadius: 16,
    cardShadow: false,
    cardShadowBlur: 0,
    cardShadowOpacity: 0,
    cardPaddingX: 24,
    cardPaddingY: 20,
    // Title styling
    titleColor: '#ffffff',
    titleFontSize: 28,
    titleFontWeight: '600',
    titleFontFamily: 'Inter',
    // Description styling (optional)
    descriptionColor: '#94a3b8',
    descriptionFontSize: 16,
    descriptionMaxLines: 2,
    // Price styling
    priceColor: '#ffffff',
    priceFontSize: 24,
    priceFontWeight: '700',
    priceFontFamily: 'Inter',
    priceBgColor: '#334155',
    priceBorderRadius: 8,
    pricePadding: 12,
    // Original price styling
    originalPriceColor: '#64748b',
    originalPriceFontSize: 20,
    // Arrow button styling
    arrowButtonSize: 48,
    arrowButtonBgColor: 'transparent',
    arrowButtonIconColor: '#ffffff',
    arrowButtonBorderRadius: 0,
  },
  // ==================== DESCRIBE PRODUCT (Existing product_card renamed) ====================
  describe_product: {
    title: 'Eclipse Motion Pro',
    price: '$150',
    redirectUrl: 'https://example.com',
    imageUrl: '',
    // Card styling
    cardBgColor: '#ffffff',
    cardBorderRadius: 24,
    cardShadow: true,
    cardShadowBlur: 20,
    cardShadowOpacity: 0.15,
    // Image styling
    showImage: true,
    imageHeightRatio: 0.68,
    imageBorderRadius: 20,
    // Title styling
    titleColor: '#1a1a2e',
    titleFontSize: 42,
    titleFontWeight: '600',
    titleFontFamily: 'Inter',
    // Price styling
    priceColor: '#e67e22',
    priceFontSize: 38,
    priceFontWeight: '700',
    priceFontFamily: 'Inter',
    // Arrow button styling
    arrowButtonSize: 80,
    arrowButtonBgColor: '#f5f5f5',
    arrowButtonIconColor: '#1a1a2e',
    arrowButtonBorderRadius: 20,
    arrowButtonPositionX: 0,
    arrowButtonPositionY: 0,
    // Favorite icon (optional)
    showFavoriteIcon: true,
    favoriteIconSize: 56,
    favoriteIconBgColor: 'rgba(128,128,128,0.6)',
    favoriteIconColor: '#ffffff',
    // Carousel dots (optional)
    showCarouselDots: true,
    carouselDotsCount: 4,
    carouselDotsActiveIndex: 0,
  },
  // ==================== BUY PRODUCT (Left image + Right text + Buy button) ====================
  buy_product: {
    title: 'White Striped T-Shirt',
    description: 'orange nike white cho...',
    price: '$125',
    redirectUrl: 'https://example.com',
    imageUrl: '',
    // Card styling
    cardBgColor: '#ffffff',
    cardBorderRadius: 16,
    cardShadow: true,
    cardShadowBlur: 12,
    cardShadowOpacity: 0.15,
    cardPaddingX: 16,
    cardPaddingY: 16,
    // Image styling
    showImage: true,
    imageSize: 100,
    imageBorderRadius: 12,
    // Title styling
    titleColor: '#1a1a2e',
    titleFontSize: 22,
    titleFontWeight: '600',
    titleFontFamily: 'Inter',
    titleMaxLines: 2,
    // Description styling
    descriptionColor: '#64748b',
    descriptionFontSize: 16,
    descriptionMaxLines: 1,
    // Price styling
    priceColor: '#1a1a2e',
    priceFontSize: 20,
    priceFontWeight: '700',
    priceFontFamily: 'Inter',
    // Buy button styling
    buyButtonText: 'Buy now',
    buyButtonBgColor: '#1a1a2e',
    buyButtonTextColor: '#ffffff',
    buyButtonFontSize: 16,
    buyButtonFontWeight: '600',
    buyButtonBorderRadius: 8,
    buyButtonPaddingX: 20,
    buyButtonPaddingY: 10,
  },
};

// Helper function to get all CTAs on current page
const getPageCtas = (store) => {
  const page = store.activePage;
  if (!page) return [];
  
  return page.children.filter(el => el.custom?.ctaType);
};

// CTA type label helper
const getCtaTypeLabel = (ctaType) => {
  switch (ctaType) {
    case 'classic': return 'Classic Button';
    case 'swipe_up': return 'Swipe Up';
    case 'image': return 'Image CTA';
    case 'product_card': return 'Product Card';
    case 'visit_product': return 'Visit Product';
    case 'describe_product': return 'Describe Product';
    case 'buy_product': return 'Buy Product';
    default: return 'CTA';
  }
};

// ==================== SVG GENERATORS ====================

function escapeXml(text) {
  if (!text) return '';
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export function generateCtaSVG(ctaType, data, width, height) {
  switch (ctaType) {
    case 'classic':
      return generateClassicCtaSVG(data, width, height);
    case 'swipe_up':
      return generateSwipeUpCtaSVG(data, width, height);
    case 'product_card':
    case 'describe_product':
      return generateDescribeProductSVG(data, width, height);
    case 'visit_product':
      return generateVisitProductSVG(data, width, height);
    case 'buy_product':
      return generateBuyProductSVG(data, width, height);
    default:
      return generateClassicCtaSVG(data, width, height);
  }
}

function generateClassicCtaSVG(data, width, height) {
  const text = data?.text || 'Shop Now';
  const bgColor = data?.bgColor || '#3b82f6';
  const textColor = data?.textColor || '#ffffff';
  const borderRadius = Math.min(data?.borderRadius || 25, height / 2);
  const borderWidth = data?.borderWidth || 0;
  const borderColor = data?.borderColor || '#ffffff';
  const fontSize = data?.fontSize || 16;
  const fontWeight = data?.fontWeight || 'bold';
  
  // Adjust rect dimensions to account for border
  const rectX = borderWidth / 2;
  const rectY = borderWidth / 2;
  const rectWidth = width - borderWidth;
  const rectHeight = height - borderWidth;
  
  return `data:image/svg+xml;utf8,${encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
      <defs>
        <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="2" stdDeviation="3" flood-opacity="0.25"/>
        </filter>
      </defs>
      <rect x="${rectX}" y="${rectY}" width="${rectWidth}" height="${rectHeight}" rx="${borderRadius}" fill="${bgColor}" stroke="${borderColor}" stroke-width="${borderWidth}" filter="url(#shadow)"/>
      <text x="${width/2}" y="${height/2 + fontSize/3}" text-anchor="middle" fill="${textColor}" font-size="${fontSize}" font-weight="${fontWeight}" font-family="Inter, -apple-system, sans-serif">${escapeXml(text)}</text>
    </svg>
  `)}`;
}

function generateSwipeUpCtaSVG(data, width, height) {
  const text = data?.text || 'Swipe Up';
  const arrowColor = data?.arrowColor || '#ffffff';
  const arrowSize = data?.arrowSize || 28;
  const textColor = data?.textColor || '#ffffff';
  const bgColor = data?.bgColor || 'rgba(0,0,0,0.5)';
  const borderRadius = data?.borderRadius || 16;
  const fontSize = data?.fontSize || 13;
  
  // Arrow positioning - centered horizontally, in upper portion
  const arrowCenterX = width / 2;
  const arrowCenterY = height * 0.28;
  
  // Arrow dimensions based on arrowSize
  const arrowWidth = arrowSize * 0.9;
  const arrowHeight = arrowSize * 0.45;
  const strokeWidth = Math.max(2.5, arrowSize * 0.08);
  
  // Text position
  const textY = height * 0.75;
  
  // Storyly-style premium bounce animation
  // Uses custom cubic-bezier for natural, premium feel
  // Motion: rest → up → slight settle → return
  // Continuous loop, mobile-first (no hover needed)
  
  return `data:image/svg+xml;utf8,${encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
      <style>
        @keyframes storylyBounce {
          0% { 
            transform: translateY(0); 
            opacity: 1; 
          }
          25% { 
            transform: translateY(-10px); 
            opacity: 0.75; 
          }
          40% { 
            transform: translateY(-8px); 
            opacity: 0.8; 
          }
          55% { 
            transform: translateY(-11px); 
            opacity: 0.72; 
          }
          70% { 
            transform: translateY(-6px); 
            opacity: 0.85; 
          }
          100% { 
            transform: translateY(0); 
            opacity: 1; 
          }
        }
        .swipe-arrow {
          animation: storylyBounce 1.8s cubic-bezier(0.35, 0, 0.25, 1) infinite;
          transform-origin: center center;
        }
      </style>
      
      <!-- Background pill -->
      <rect x="10" y="${height * 0.45}" width="${width - 20}" height="${height * 0.5}" rx="${borderRadius}" fill="${bgColor}"/>
      
      <!-- Arrow icon group with animation -->
      <g class="swipe-arrow">
        <!-- Chevron up arrow using SVG paths -->
        <path 
          d="M ${arrowCenterX - arrowWidth/2} ${arrowCenterY + arrowHeight/2} 
             L ${arrowCenterX} ${arrowCenterY - arrowHeight/2} 
             L ${arrowCenterX + arrowWidth/2} ${arrowCenterY + arrowHeight/2}"
          stroke="${arrowColor}"
          stroke-width="${strokeWidth}"
          stroke-linecap="round"
          stroke-linejoin="round"
          fill="none"
        />
      </g>
      
      <!-- Text label -->
      <text x="${width/2}" y="${textY}" text-anchor="middle" fill="${textColor}" font-size="${fontSize}" font-weight="600" font-family="Inter, -apple-system, sans-serif">${escapeXml(text)}</text>
    </svg>
  `)}`;
}

function generateDescribeProductSVG(data, width, height) {
  // Content
  const title = data?.title || 'Eclipse Motion Pro';
  const price = data?.price || '$150';
  const imageUrl = data?.imageUrl || '';
  
  // Card styling
  const cardBgColor = data?.cardBgColor || '#ffffff';
  const cardBorderRadius = data?.cardBorderRadius || 24;
  const cardShadow = data?.cardShadow !== false;
  const cardShadowBlur = data?.cardShadowBlur || 20;
  const cardShadowOpacity = data?.cardShadowOpacity || 0.15;
  
  // Image styling
  const showImage = data?.showImage !== false;
  const imageHeightRatio = data?.imageHeightRatio || 0.68;
  const imageBorderRadius = data?.imageBorderRadius || 20;
  const imageHeight = showImage ? height * imageHeightRatio : 0;
  const imagePadding = 16;
  const imageWidth = width - (imagePadding * 2);
  const imageInnerHeight = imageHeight - imagePadding;
  
  // Title styling
  const titleColor = data?.titleColor || '#1a1a2e';
  const titleFontSize = data?.titleFontSize || 42;
  const titleFontWeight = data?.titleFontWeight || '600';
  const titleFontFamily = data?.titleFontFamily || 'Inter';
  
  // Price styling
  const priceColor = data?.priceColor || '#e67e22';
  const priceFontSize = data?.priceFontSize || 38;
  const priceFontWeight = data?.priceFontWeight || '700';
  const priceFontFamily = data?.priceFontFamily || 'Inter';
  
  // Arrow button styling
  const arrowButtonSize = data?.arrowButtonSize || 80;
  const arrowButtonBgColor = data?.arrowButtonBgColor || '#f5f5f5';
  const arrowButtonIconColor = data?.arrowButtonIconColor || '#1a1a2e';
  const arrowButtonBorderRadius = data?.arrowButtonBorderRadius || 20;
  const arrowButtonPositionX = data?.arrowButtonPositionX || 0;
  const arrowButtonPositionY = data?.arrowButtonPositionY || 0;
  
  // Favorite icon
  const showFavoriteIcon = data?.showFavoriteIcon !== false;
  const favoriteIconSize = data?.favoriteIconSize || 56;
  const favoriteIconBgColor = data?.favoriteIconBgColor || 'rgba(128,128,128,0.6)';
  const favoriteIconColor = data?.favoriteIconColor || '#ffffff';
  
  // Carousel dots
  const showCarouselDots = data?.showCarouselDots !== false;
  const carouselDotsCount = data?.carouselDotsCount || 4;
  const carouselDotsActiveIndex = data?.carouselDotsActiveIndex || 0;
  
  // Calculate positions
  const contentAreaY = imageHeight + 20;
  const titleY = contentAreaY + titleFontSize * 0.8;
  const priceY = titleY + priceFontSize + 8;
  
  // Arrow button position (bottom right)
  const arrowButtonX = width - arrowButtonSize - 28 + arrowButtonPositionX;
  const arrowButtonY = height - arrowButtonSize - 28 + arrowButtonPositionY;
  
  // Arrow icon dimensions
  const arrowIconSize = arrowButtonSize * 0.4;
  const arrowIconX = arrowButtonX + (arrowButtonSize - arrowIconSize) / 2;
  const arrowIconY = arrowButtonY + (arrowButtonSize - arrowIconSize) / 2;
  
  // Favorite icon position (top right of image)
  const favIconX = width - favoriteIconSize - 28;
  const favIconY = imagePadding + 16;
  
  // Carousel dots
  const dotSize = 10;
  const dotGap = 8;
  const dotsWidth = (dotSize * carouselDotsCount) + (dotGap * (carouselDotsCount - 1));
  const dotsStartX = (width - dotsWidth) / 2;
  const dotsY = imageHeight - 24;
  
  // Image section with proper clipping
  const imageSection = imageUrl 
    ? `<image href="${imageUrl}" x="${imagePadding}" y="${imagePadding}" width="${imageWidth}" height="${imageInnerHeight}" preserveAspectRatio="xMidYMid slice" clip-path="url(#imageClip)"/>`
    : `<rect x="${imagePadding}" y="${imagePadding}" width="${imageWidth}" height="${imageInnerHeight}" rx="${imageBorderRadius}" fill="#d4d4d8"/>
       <g transform="translate(${width/2 - 40}, ${imageHeight/2 - 30})">
         <rect width="80" height="60" rx="8" fill="#a1a1aa"/>
         <circle cx="25" cy="22" r="10" fill="#d4d4d8"/>
         <path d="M10 50 L30 35 L50 45 L70 25 L70 50 Z" fill="#d4d4d8"/>
       </g>`;
  
  // Carousel dots SVG
  const carouselDotsSvg = showCarouselDots ? Array.from({ length: carouselDotsCount }, (_, i) => {
    const dotX = dotsStartX + (i * (dotSize + dotGap));
    const isActive = i === carouselDotsActiveIndex;
    return `<circle cx="${dotX + dotSize/2}" cy="${dotsY}" r="${dotSize/2}" fill="${isActive ? '#ffffff' : 'rgba(255,255,255,0.5)'}"/>`;
  }).join('') : '';
  
  // Favorite icon SVG (heart outline)
  const favoriteIconSvg = showFavoriteIcon ? `
    <g transform="translate(${favIconX}, ${favIconY})">
      <rect width="${favoriteIconSize}" height="${favoriteIconSize}" rx="${favoriteIconSize/2}" fill="${favoriteIconBgColor}"/>
      <path 
        d="M${favoriteIconSize/2} ${favoriteIconSize * 0.7} 
           C${favoriteIconSize * 0.25} ${favoriteIconSize * 0.55} 
           ${favoriteIconSize * 0.18} ${favoriteIconSize * 0.35} 
           ${favoriteIconSize * 0.32} ${favoriteIconSize * 0.28}
           C${favoriteIconSize * 0.42} ${favoriteIconSize * 0.23} 
           ${favoriteIconSize/2} ${favoriteIconSize * 0.28} 
           ${favoriteIconSize/2} ${favoriteIconSize * 0.35}
           C${favoriteIconSize/2} ${favoriteIconSize * 0.28} 
           ${favoriteIconSize * 0.58} ${favoriteIconSize * 0.23} 
           ${favoriteIconSize * 0.68} ${favoriteIconSize * 0.28}
           C${favoriteIconSize * 0.82} ${favoriteIconSize * 0.35} 
           ${favoriteIconSize * 0.75} ${favoriteIconSize * 0.55} 
           ${favoriteIconSize/2} ${favoriteIconSize * 0.7} Z"
        stroke="${favoriteIconColor}"
        stroke-width="2"
        fill="none"
      />
    </g>
  ` : '';
  
  // Arrow icon path (diagonal arrow pointing up-right)
  const arrowPath = `
    M${arrowIconX + arrowIconSize * 0.25} ${arrowIconY + arrowIconSize * 0.75}
    L${arrowIconX + arrowIconSize * 0.75} ${arrowIconY + arrowIconSize * 0.25}
    M${arrowIconX + arrowIconSize * 0.4} ${arrowIconY + arrowIconSize * 0.25}
    L${arrowIconX + arrowIconSize * 0.75} ${arrowIconY + arrowIconSize * 0.25}
    L${arrowIconX + arrowIconSize * 0.75} ${arrowIconY + arrowIconSize * 0.6}
  `;
  
  return `data:image/svg+xml;utf8,${encodeURIComponent(`
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
      
      <!-- Card Container -->
      <rect width="${width}" height="${height}" rx="${cardBorderRadius}" fill="${cardBgColor}" ${cardShadow ? 'filter="url(#cardShadow)"' : ''}/>
      
      <!-- Image Section -->
      ${imageSection}
      
      <!-- Carousel Dots -->
      ${carouselDotsSvg}
      
      <!-- Favorite Icon -->
      ${favoriteIconSvg}
      
      <!-- Title -->
      <text x="28" y="${titleY}" fill="${titleColor}" font-size="${titleFontSize}" font-weight="${titleFontWeight}" font-family="${titleFontFamily}, -apple-system, sans-serif">${escapeXml(title)}</text>
      
      <!-- Price -->
      <text x="28" y="${priceY}" fill="${priceColor}" font-size="${priceFontSize}" font-weight="${priceFontWeight}" font-family="${priceFontFamily}, -apple-system, sans-serif">${escapeXml(price)}</text>
      
      <!-- Arrow CTA Button -->
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
  `)}`;
}

// ==================== VISIT PRODUCT SVG GENERATOR ====================
function generateVisitProductSVG(data, width, height) {
  // Content
  const title = data?.title || 'White Striped T-shirt';
  const price = data?.price || '$59';
  const originalPrice = data?.originalPrice || '$99';
  const showOriginalPrice = data?.showOriginalPrice !== false;
  
  // Card styling
  const cardBgColor = data?.cardBgColor || '#1e293b';
  const cardBorderRadius = data?.cardBorderRadius || 16;
  const cardPaddingX = data?.cardPaddingX || 24;
  const cardPaddingY = data?.cardPaddingY || 20;
  
  // Title styling
  const titleColor = data?.titleColor || '#ffffff';
  const titleFontSize = data?.titleFontSize || 28;
  const titleFontWeight = data?.titleFontWeight || '600';
  const titleFontFamily = data?.titleFontFamily || 'Inter';
  
  // Price styling
  const priceColor = data?.priceColor || '#ffffff';
  const priceFontSize = data?.priceFontSize || 24;
  const priceFontWeight = data?.priceFontWeight || '700';
  const priceFontFamily = data?.priceFontFamily || 'Inter';
  const priceBgColor = data?.priceBgColor || '#334155';
  const priceBorderRadius = data?.priceBorderRadius || 8;
  const pricePadding = data?.pricePadding || 12;
  
  // Original price styling
  const originalPriceColor = data?.originalPriceColor || '#64748b';
  const originalPriceFontSize = data?.originalPriceFontSize || 20;
  
  // Arrow button styling
  const arrowButtonSize = data?.arrowButtonSize || 48;
  const arrowButtonIconColor = data?.arrowButtonIconColor || '#ffffff';
  
  // Calculate positions
  const titleY = cardPaddingY + titleFontSize;
  const priceAreaY = height - cardPaddingY - priceFontSize - pricePadding;
  
  // Arrow position (right side, vertically centered with title)
  const arrowX = width - cardPaddingX - arrowButtonSize / 2;
  const arrowY = cardPaddingY + titleFontSize / 2;
  const arrowIconSize = arrowButtonSize * 0.5;
  
  // Price badge dimensions
  const priceBadgeHeight = priceFontSize + pricePadding * 2;
  const priceBadgeY = height - cardPaddingY - priceBadgeHeight;
  
  // Arrow SVG path (chevron right >)
  const arrowPath = `
    M${arrowX - arrowIconSize * 0.3} ${arrowY - arrowIconSize * 0.4}
    L${arrowX + arrowIconSize * 0.3} ${arrowY}
    L${arrowX - arrowIconSize * 0.3} ${arrowY + arrowIconSize * 0.4}
  `;
  
  return `data:image/svg+xml;utf8,${encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
      <!-- Card Container -->
      <rect width="${width}" height="${height}" rx="${cardBorderRadius}" fill="${cardBgColor}"/>
      
      <!-- Title with Arrow -->
      <text x="${cardPaddingX}" y="${titleY}" fill="${titleColor}" font-size="${titleFontSize}" font-weight="${titleFontWeight}" font-family="${titleFontFamily}, -apple-system, sans-serif">${escapeXml(title)}</text>
      
      <!-- Arrow Icon (Chevron) -->
      <path 
        d="${arrowPath}"
        stroke="${arrowButtonIconColor}"
        stroke-width="3"
        stroke-linecap="round"
        stroke-linejoin="round"
        fill="none"
      />
      
      <!-- Price Section -->
      <g transform="translate(${cardPaddingX}, ${priceBadgeY})">
        ${showOriginalPrice ? `
        <!-- Original Price (strikethrough) -->
        <text x="0" y="${priceBadgeHeight / 2 + originalPriceFontSize * 0.35}" fill="${originalPriceColor}" font-size="${originalPriceFontSize}" font-weight="500" font-family="${priceFontFamily}, -apple-system, sans-serif" text-decoration="line-through">${escapeXml(originalPrice)}</text>
        <!-- Current Price Badge -->
        <rect x="${originalPriceFontSize * originalPrice.length * 0.5 + 12}" y="0" width="${priceFontSize * price.length * 0.6 + pricePadding * 2}" height="${priceBadgeHeight}" rx="${priceBorderRadius}" fill="${priceBgColor}"/>
        <text x="${originalPriceFontSize * originalPrice.length * 0.5 + 12 + pricePadding}" y="${priceBadgeHeight / 2 + priceFontSize * 0.35}" fill="${priceColor}" font-size="${priceFontSize}" font-weight="${priceFontWeight}" font-family="${priceFontFamily}, -apple-system, sans-serif">${escapeXml(price)}</text>
        ` : `
        <!-- Current Price Badge -->
        <rect x="0" y="0" width="${priceFontSize * price.length * 0.6 + pricePadding * 2}" height="${priceBadgeHeight}" rx="${priceBorderRadius}" fill="${priceBgColor}"/>
        <text x="${pricePadding}" y="${priceBadgeHeight / 2 + priceFontSize * 0.35}" fill="${priceColor}" font-size="${priceFontSize}" font-weight="${priceFontWeight}" font-family="${priceFontFamily}, -apple-system, sans-serif">${escapeXml(price)}</text>
        `}
      </g>
    </svg>
  `)}`;
}

// ==================== BUY PRODUCT SVG GENERATOR ====================
function generateBuyProductSVG(data, width, height) {
  // Content
  const title = data?.title || 'White Striped T-Shirt';
  const description = data?.description || 'orange nike white cho...';
  const price = data?.price || '$125';
  const imageUrl = data?.imageUrl || '';
  
  // Card styling
  const cardBgColor = data?.cardBgColor || '#ffffff';
  const cardBorderRadius = data?.cardBorderRadius || 16;
  const cardShadow = data?.cardShadow !== false;
  const cardShadowBlur = data?.cardShadowBlur || 12;
  const cardShadowOpacity = data?.cardShadowOpacity || 0.15;
  const cardPaddingX = data?.cardPaddingX || 16;
  const cardPaddingY = data?.cardPaddingY || 16;
  
  // Image styling
  const showImage = data?.showImage !== false;
  const imageSize = data?.imageSize || 100;
  const imageBorderRadius = data?.imageBorderRadius || 12;
  
  // Title styling
  const titleColor = data?.titleColor || '#1a1a2e';
  const titleFontSize = data?.titleFontSize || 22;
  const titleFontWeight = data?.titleFontWeight || '600';
  const titleFontFamily = data?.titleFontFamily || 'Inter';
  
  // Description styling
  const descriptionColor = data?.descriptionColor || '#64748b';
  const descriptionFontSize = data?.descriptionFontSize || 16;
  
  // Price styling
  const priceColor = data?.priceColor || '#1a1a2e';
  const priceFontSize = data?.priceFontSize || 20;
  const priceFontWeight = data?.priceFontWeight || '700';
  const priceFontFamily = data?.priceFontFamily || 'Inter';
  
  // Buy button styling
  const buyButtonText = data?.buyButtonText || 'Buy now';
  const buyButtonBgColor = data?.buyButtonBgColor || '#1a1a2e';
  const buyButtonTextColor = data?.buyButtonTextColor || '#ffffff';
  const buyButtonFontSize = data?.buyButtonFontSize || 16;
  const buyButtonFontWeight = data?.buyButtonFontWeight || '600';
  const buyButtonBorderRadius = data?.buyButtonBorderRadius || 8;
  const buyButtonPaddingX = data?.buyButtonPaddingX || 20;
  const buyButtonPaddingY = data?.buyButtonPaddingY || 10;
  
  // Calculate positions
  const contentStartX = showImage ? cardPaddingX + imageSize + 16 : cardPaddingX;
  const titleY = cardPaddingY + titleFontSize;
  const descriptionY = titleY + descriptionFontSize + 8;
  const priceY = height - cardPaddingY - 8;
  
  // Buy button dimensions
  const buyButtonWidth = buyButtonFontSize * buyButtonText.length * 0.55 + buyButtonPaddingX * 2;
  const buyButtonHeight = buyButtonFontSize + buyButtonPaddingY * 2;
  const buyButtonX = width - cardPaddingX - buyButtonWidth;
  const buyButtonY = height - cardPaddingY - buyButtonHeight;
  
  // Image placeholder or actual image
  const imageSectionX = cardPaddingX;
  const imageSectionY = (height - imageSize) / 2;
  
  const imageSection = showImage ? (imageUrl 
    ? `<image href="${imageUrl}" x="${imageSectionX}" y="${imageSectionY}" width="${imageSize}" height="${imageSize}" preserveAspectRatio="xMidYMid slice" clip-path="url(#buyImageClip)"/>`
    : `<rect x="${imageSectionX}" y="${imageSectionY}" width="${imageSize}" height="${imageSize}" rx="${imageBorderRadius}" fill="#e2e8f0"/>
       <g transform="translate(${imageSectionX + imageSize/2 - 20}, ${imageSectionY + imageSize/2 - 15})">
         <rect width="40" height="30" rx="4" fill="#94a3b8"/>
         <circle cx="12" cy="11" r="5" fill="#e2e8f0"/>
         <path d="M5 25 L15 18 L25 22 L35 12 L35 25 Z" fill="#e2e8f0"/>
       </g>`
  ) : '';
  
  return `data:image/svg+xml;utf8,${encodeURIComponent(`
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
      
      <!-- Card Container -->
      <rect width="${width}" height="${height}" rx="${cardBorderRadius}" fill="${cardBgColor}" ${cardShadow ? 'filter="url(#buyShadow)"' : ''}/>
      
      <!-- Product Image -->
      ${imageSection}
      
      <!-- Title -->
      <text x="${contentStartX}" y="${titleY}" fill="${titleColor}" font-size="${titleFontSize}" font-weight="${titleFontWeight}" font-family="${titleFontFamily}, -apple-system, sans-serif">${escapeXml(title)}</text>
      
      <!-- Description -->
      <text x="${contentStartX}" y="${descriptionY}" fill="${descriptionColor}" font-size="${descriptionFontSize}" font-weight="400" font-family="${titleFontFamily}, -apple-system, sans-serif">${escapeXml(description)}</text>
      
      <!-- Price -->
      <text x="${contentStartX}" y="${priceY}" fill="${priceColor}" font-size="${priceFontSize}" font-weight="${priceFontWeight}" font-family="${priceFontFamily}, -apple-system, sans-serif">${escapeXml(price)}</text>
      
      <!-- Buy Now Button -->
      <rect x="${buyButtonX}" y="${buyButtonY}" width="${buyButtonWidth}" height="${buyButtonHeight}" rx="${buyButtonBorderRadius}" fill="${buyButtonBgColor}"/>
      <text x="${buyButtonX + buyButtonWidth/2}" y="${buyButtonY + buyButtonHeight/2 + buyButtonFontSize * 0.35}" text-anchor="middle" fill="${buyButtonTextColor}" font-size="${buyButtonFontSize}" font-weight="${buyButtonFontWeight}" font-family="${titleFontFamily}, -apple-system, sans-serif">${escapeXml(buyButtonText)}</text>
    </svg>
  `)}`;
}

// CTA Section Panel
export const CtaSectionPanel = observer(({ store }) => {
  const imageInputRef = useRef(null);
  const productImageInputRef = useRef(null);

  const mapBaselineExportToCurrent = (rectOrPoint) => {
    const exportSize = getStoreExportSize(store);
    const sx = exportSize.width / BASELINE_EXPORT.width;
    const sy = exportSize.height / BASELINE_EXPORT.height;

    if (!rectOrPoint) return rectOrPoint;
    const out = { ...rectOrPoint };
    if (typeof out.x === 'number') out.x = out.x * sx;
    if (typeof out.y === 'number') out.y = out.y * sy;
    if (typeof out.width === 'number') out.width = out.width * sx;
    if (typeof out.height === 'number') out.height = out.height * sy;
    return out;
  };

  const toCanvasRect = (exportRect) => {
    const exportScale = getStoreExportScale(store);
    return {
      ...exportRect,
      x: toCanvas(exportRect.x, exportScale),
      y: toCanvas(exportRect.y, exportScale),
      width: toCanvas(exportRect.width, exportScale),
      height: toCanvas(exportRect.height, exportScale),
    };
  };

  // Add Classic CTA element using SVG for proper height control
  const addClassicCta = () => {
    const page = store.activePage;
    if (!page) return;

    const dims = CTA_DIMENSIONS.classic;
    const pos = CTA_POSITIONS.classic;
    const defaults = CTA_DEFAULTS.classic;

    const exportDims = mapBaselineExportToCurrent(dims);
    const exportPos = mapBaselineExportToCurrent(pos);
    const canvasRect = toCanvasRect({ ...exportPos, ...exportDims });

    const svgContent = generateCtaSVG('classic', defaults, dims.width, dims.height);

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
        ...defaults,
      }
    });
    
    store.selectElements([element.id]);
  };

  // Add Swipe-Up CTA element using SVG
  const addSwipeUpCta = () => {
    const page = store.activePage;
    if (!page) return;

    const dims = CTA_DIMENSIONS.swipe_up;
    const pos = CTA_POSITIONS.swipe_up;
    const defaults = CTA_DEFAULTS.swipe_up;

    const exportDims = mapBaselineExportToCurrent(dims);
    const exportPos = mapBaselineExportToCurrent(pos);
    const canvasRect = toCanvasRect({ ...exportPos, ...exportDims });

    const svgContent = generateCtaSVG('swipe_up', defaults, dims.width, dims.height);

    const element = page.addElement({
      type: 'svg',
      x: canvasRect.x,
      y: canvasRect.y,
      width: canvasRect.width,
      height: canvasRect.height,
      src: svgContent,
      keepRatio: false,
      custom: {
        ctaType: 'swipe_up',
        ...defaults,
      }
    });
    
    store.selectElements([element.id]);
  };

  // Handle Image file selection - directly creates element
  const handleImageSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith('image/')) return;

    const page = store.activePage;
    if (!page) return;

    const dims = CTA_DIMENSIONS.image;
    const pos = CTA_POSITIONS.image;

    const exportDims = mapBaselineExportToCurrent(dims);
    const exportPos = mapBaselineExportToCurrent(pos);
    const canvasRect = toCanvasRect({ ...exportPos, ...exportDims });

    // Create object URL for the image
    const imageUrl = URL.createObjectURL(file);

    const element = page.addElement({
      type: 'image',
      x: canvasRect.x,
      y: canvasRect.y,
      width: canvasRect.width,
      height: canvasRect.height,
      src: imageUrl,
      cornerRadius: toCanvas(CTA_DEFAULTS.image.borderRadius || 12, getStoreExportScale(store)),
      strokeWidth: toCanvas(CTA_DEFAULTS.image.borderWidth || 0, getStoreExportScale(store)),
      stroke: CTA_DEFAULTS.image.borderColor || '#ffffff',
      custom: {
        ctaType: 'image',
        ...CTA_DEFAULTS.image,
      }
    });

    store.selectElements([element.id]);
    e.target.value = '';
  };

  // Trigger file picker for Image CTA
  const openImagePicker = () => {
    imageInputRef.current?.click();
  };

  // Handle Product Card image selection
  const handleProductImageSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith('image/')) return;

    const page = store.activePage;
    if (!page) return;

    const dims = CTA_DIMENSIONS.product_card;
    const pos = CTA_POSITIONS.product_card;
    const defaults = CTA_DEFAULTS.product_card;

    const exportDims = mapBaselineExportToCurrent(dims);
    const exportPos = mapBaselineExportToCurrent(pos);
    const canvasRect = toCanvasRect({ ...exportPos, ...exportDims });

    // Create object URL for the image
    const imageUrl = URL.createObjectURL(file);

    const svgContent = generateCtaSVG('product_card', { ...defaults, imageUrl }, dims.width, dims.height);

    const element = page.addElement({
      type: 'svg',
      x: canvasRect.x,
      y: canvasRect.y,
      width: canvasRect.width,
      height: canvasRect.height,
      src: svgContent,
      keepRatio: false,
      custom: {
        ctaType: 'product_card',
        ...defaults,
        imageUrl,
      }
    });

    store.selectElements([element.id]);
    e.target.value = '';
  };

  // Add Product Card with default placeholder
  const addDefaultProductCard = () => {
    const page = store.activePage;
    if (!page) return;

    const dims = CTA_DIMENSIONS.product_card;
    const pos = CTA_POSITIONS.product_card;
    const defaults = CTA_DEFAULTS.product_card;

    const exportDims = mapBaselineExportToCurrent(dims);
    const exportPos = mapBaselineExportToCurrent(pos);
    const canvasRect = toCanvasRect({ ...exportPos, ...exportDims });

    const svgContent = generateCtaSVG('product_card', defaults, dims.width, dims.height);

    const element = page.addElement({
      type: 'svg',
      x: canvasRect.x,
      y: canvasRect.y,
      width: canvasRect.width,
      height: canvasRect.height,
      src: svgContent,
      keepRatio: false,
      custom: {
        ctaType: 'product_card',
        ...defaults,
      }
    });

    store.selectElements([element.id]);
  };

  // Add Visit Product CTA (No image, text + arrow)
  const addVisitProductCta = () => {
    const page = store.activePage;
    if (!page) return;

    const dims = CTA_DIMENSIONS.visit_product;
    const pos = CTA_POSITIONS.visit_product;
    const defaults = CTA_DEFAULTS.visit_product;

    const exportDims = mapBaselineExportToCurrent(dims);
    const exportPos = mapBaselineExportToCurrent(pos);
    const canvasRect = toCanvasRect({ ...exportPos, ...exportDims });

    const svgContent = generateCtaSVG('visit_product', defaults, dims.width, dims.height);

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
        ...defaults,
      }
    });

    store.selectElements([element.id]);
  };

  // Add Describe Product CTA (Full card with image)
  const addDescribeProductCta = () => {
    const page = store.activePage;
    if (!page) return;

    const dims = CTA_DIMENSIONS.describe_product;
    const pos = CTA_POSITIONS.describe_product;
    const defaults = CTA_DEFAULTS.describe_product;

    const exportDims = mapBaselineExportToCurrent(dims);
    const exportPos = mapBaselineExportToCurrent(pos);
    const canvasRect = toCanvasRect({ ...exportPos, ...exportDims });

    const svgContent = generateCtaSVG('describe_product', defaults, dims.width, dims.height);

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
        ...defaults,
      }
    });

    store.selectElements([element.id]);
  };

  // Add Buy Product CTA (Horizontal with buy button)
  const addBuyProductCta = () => {
    const page = store.activePage;
    if (!page) return;

    const dims = CTA_DIMENSIONS.buy_product;
    const pos = CTA_POSITIONS.buy_product;
    const defaults = CTA_DEFAULTS.buy_product;

    const exportDims = mapBaselineExportToCurrent(dims);
    const exportPos = mapBaselineExportToCurrent(pos);
    const canvasRect = toCanvasRect({ ...exportPos, ...exportDims });

    const svgContent = generateCtaSVG('buy_product', defaults, dims.width, dims.height);

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
        ...defaults,
      }
    });

    store.selectElements([element.id]);
  };

  // Select CTA element on canvas
  const selectCtaElement = (element) => {
    store.selectElements([element.id]);
  };

  // Get all CTAs on current page
  const pageCtas = getPageCtas(store);
  // Filter to only show main CTAs (not child elements)
  const mainCtas = pageCtas.filter(el => 
    el.custom?.ctaType && 
    !el.custom?.parentCtaType && 
    el.custom?.ctaType !== 'swipe_up_arrow'
  );

  // Styles
  const panelStyle = {
    padding: '16px',
    backgroundColor: 'var(--bg-secondary)',
    color: 'var(--text-primary)',
    minHeight: '100%'
  };

  const sectionLabelStyle = {
    fontSize: '11px',
    color: 'var(--text-secondary)',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    marginBottom: '10px',
  };

  const ctaItemStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px',
    background: 'var(--bg-elevated)',
    border: '1px solid var(--border-primary)',
    borderRadius: '8px',
    cursor: 'pointer',
    marginBottom: '8px',
    transition: 'all 0.2s',
  };

  const ctaListItemStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '10px 12px',
    background: 'var(--bg-elevated)',
    border: '1px solid var(--border-primary)',
    borderRadius: '6px',
    cursor: 'pointer',
    marginBottom: '6px',
    transition: 'all 0.2s',
  };

  return (
    <div style={panelStyle}>
      {/* Hidden file inputs */}
      <input
        ref={imageInputRef}
        type="file"
        accept="image/png,image/jpg,image/jpeg,image/webp"
        onChange={handleImageSelect}
        style={{ display: 'none' }}
      />
      <input
        ref={productImageInputRef}
        type="file"
        accept="image/png,image/jpg,image/jpeg,image/webp"
        onChange={handleProductImageSelect}
        style={{ display: 'none' }}
      />

      {/* CTA Types Grid */}
      <div style={{ marginBottom: '24px' }}>
        <p style={sectionLabelStyle}>Add CTA</p>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
          {/* Classic CTA */}
          <div
            style={{
              ...ctaItemStyle,
              flexDirection: 'column',
              padding: '16px 12px',
              textAlign: 'center',
            }}
            onClick={addClassicCta}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--accent-primary)';
              e.currentTarget.style.background = 'var(--bg-tertiary)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--border-primary)';
              e.currentTarget.style.background = 'var(--bg-elevated)';
            }}
          >
            {/* Preview */}
            <div style={{
              padding: '8px 16px',
              background: '#3b82f6',
              borderRadius: '20px',
              color: '#ffffff',
              fontSize: '11px',
              fontWeight: '600',
              marginBottom: '6px',
            }}>
              Shop Now
            </div>
            <span style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>Classic</span>
          </div>

          {/* Swipe Up CTA */}
          <div
            style={{
              ...ctaItemStyle,
              flexDirection: 'column',
              padding: '16px 12px',
              textAlign: 'center',
            }}
            onClick={addSwipeUpCta}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--accent-primary)';
              e.currentTarget.style.background = 'var(--bg-tertiary)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--border-primary)';
              e.currentTarget.style.background = 'var(--bg-elevated)';
            }}
          >
            {/* Preview */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '4px',
            }}>
              {/* SVG Arrow Icon with Storyly-style animation */}
              <svg 
                width="20" 
                height="20" 
                viewBox="0 0 24 24"
                style={{ 
                  animation: 'storylyBouncePreview 1.8s cubic-bezier(0.35, 0, 0.25, 1) infinite',
                  color: 'var(--text-primary)',
                }}
              >
                <path 
                  d="M6 15 L12 9 L18 15"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                />
              </svg>
              <span style={{
                padding: '4px 10px',
                background: 'rgba(255,255,255,0.15)',
                borderRadius: '12px',
                fontSize: '10px',
                fontWeight: '500',
              }}>Swipe Up</span>
            </div>
            <span style={{ fontSize: '10px', color: 'var(--text-secondary)', marginTop: '6px' }}>Swipe Up</span>
          </div>

          {/* Image CTA */}
          <div
            style={{
              ...ctaItemStyle,
              flexDirection: 'column',
              padding: '16px 12px',
              textAlign: 'center',
            }}
            onClick={openImagePicker}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--accent-primary)';
              e.currentTarget.style.background = 'var(--bg-tertiary)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--border-primary)';
              e.currentTarget.style.background = 'var(--bg-elevated)';
            }}
          >
            {/* Preview */}
            <div style={{
              width: '48px',
              height: '48px',
              background: 'var(--bg-tertiary)',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '6px',
              border: '2px dashed var(--border-primary)',
            }}>
              <ImageCtaIcon />
            </div>
            <span style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>Image CTA</span>
          </div>
        </div>

        {/* Product Card Variants Section */}
        <p style={{ ...sectionLabelStyle, marginTop: '20px', marginBottom: '10px' }}>Product Cards</p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
          
          {/* Visit Product CTA */}
          <div
            style={{
              ...ctaItemStyle,
              flexDirection: 'column',
              padding: '12px 8px',
              textAlign: 'center',
            }}
            onClick={addVisitProductCta}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--accent-primary)';
              e.currentTarget.style.background = 'var(--bg-tertiary)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--border-primary)';
              e.currentTarget.style.background = 'var(--bg-elevated)';
            }}
          >
            {/* Visit Product Preview */}
            <div style={{
              width: '54px',
              height: '36px',
              background: '#1e293b',
              borderRadius: '6px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              padding: '5px 6px',
              marginBottom: '6px',
            }}>
              {/* Title row with arrow */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ width: '24px', height: '4px', background: '#fff', borderRadius: '1px' }}></div>
                <svg width="6" height="6" viewBox="0 0 6 6" fill="none">
                  <path d="M2 1L4 3L2 5" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              {/* Price row */}
              <div style={{ display: 'flex', gap: '3px', alignItems: 'center' }}>
                <div style={{ width: '10px', height: '4px', background: '#64748b', borderRadius: '1px', textDecoration: 'line-through' }}></div>
                <div style={{ width: '14px', height: '6px', background: '#334155', borderRadius: '2px' }}></div>
              </div>
            </div>
            <span style={{ fontSize: '9px', color: 'var(--text-secondary)' }}>Visit</span>
          </div>

          {/* Describe Product CTA */}
          <div
            style={{
              ...ctaItemStyle,
              flexDirection: 'column',
              padding: '12px 8px',
              textAlign: 'center',
            }}
            onClick={addDescribeProductCta}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--accent-primary)';
              e.currentTarget.style.background = 'var(--bg-tertiary)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--border-primary)';
              e.currentTarget.style.background = 'var(--bg-elevated)';
            }}
          >
            {/* Describe Product Preview */}
            <div style={{
              width: '40px',
              height: '52px',
              background: '#ffffff',
              borderRadius: '6px',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              marginBottom: '6px',
              boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
            }}>
              {/* Image area */}
              <div style={{ 
                flex: '0 0 65%', 
                background: 'linear-gradient(135deg, #d4d4d8 0%, #a1a1aa 100%)',
                borderRadius: '4px',
                margin: '2px',
                position: 'relative',
              }}>
                <div style={{
                  position: 'absolute',
                  top: '2px',
                  right: '2px',
                  width: '6px',
                  height: '6px',
                  background: 'rgba(128,128,128,0.5)',
                  borderRadius: '50%',
                }}></div>
              </div>
              {/* Content area */}
              <div style={{ flex: 1, padding: '2px 3px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ width: '16px', height: '3px', background: '#1a1a2e', borderRadius: '1px', marginBottom: '2px' }}></div>
                  <div style={{ width: '10px', height: '3px', background: '#e67e22', borderRadius: '1px' }}></div>
                </div>
                <div style={{ width: '8px', height: '8px', background: '#f5f5f5', borderRadius: '2px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ fontSize: '4px', color: '#1a1a2e', transform: 'rotate(-45deg)' }}>↑</span>
                </div>
              </div>
            </div>
            <span style={{ fontSize: '9px', color: 'var(--text-secondary)' }}>Describe</span>
          </div>

          {/* Buy Product CTA */}
          <div
            style={{
              ...ctaItemStyle,
              flexDirection: 'column',
              padding: '12px 8px',
              textAlign: 'center',
            }}
            onClick={addBuyProductCta}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--accent-primary)';
              e.currentTarget.style.background = 'var(--bg-tertiary)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--border-primary)';
              e.currentTarget.style.background = 'var(--bg-elevated)';
            }}
          >
            {/* Buy Product Preview */}
            <div style={{
              width: '54px',
              height: '32px',
              background: '#ffffff',
              borderRadius: '6px',
              display: 'flex',
              gap: '4px',
              padding: '4px',
              marginBottom: '6px',
              boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
            }}>
              {/* Image */}
              <div style={{ width: '24px', height: '24px', background: '#e2e8f0', borderRadius: '4px' }}></div>
              {/* Content */}
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ width: '18px', height: '3px', background: '#1a1a2e', borderRadius: '1px', marginBottom: '2px' }}></div>
                  <div style={{ width: '14px', height: '2px', background: '#94a3b8', borderRadius: '1px' }}></div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ width: '10px', height: '3px', background: '#1a1a2e', borderRadius: '1px' }}></div>
                  <div style={{ width: '14px', height: '6px', background: '#1a1a2e', borderRadius: '2px' }}></div>
                </div>
              </div>
            </div>
            <span style={{ fontSize: '9px', color: 'var(--text-secondary)' }}>Buy</span>
          </div>
        </div>
      </div>

      {/* CTA List - Shows all CTAs on current slide */}
      {mainCtas.length > 0 && (
        <div style={{ marginBottom: '16px' }}>
          <p style={sectionLabelStyle}>CTAs on this Slide</p>
          
          {mainCtas.map((cta) => (
            <div
              key={cta.id}
              style={ctaListItemStyle}
              onClick={() => selectCtaElement(cta)}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--accent-primary)';
                e.currentTarget.style.background = 'var(--bg-tertiary)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--border-primary)';
                e.currentTarget.style.background = 'var(--bg-elevated)';
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                {/* CTA Type Icon */}
                <div style={{ color: 'var(--accent-primary)' }}>
                  {cta.custom?.ctaType === 'classic' && <ClassicIcon />}
                  {cta.custom?.ctaType === 'swipe_up' && <SwipeUpIcon />}
                  {cta.custom?.ctaType === 'image' && <ImageCtaIcon />}
                  {cta.custom?.ctaType === 'product_card' && <ProductCardIcon />}
                  {cta.custom?.ctaType === 'visit_product' && <ProductCardIcon />}
                  {cta.custom?.ctaType === 'describe_product' && <ProductCardIcon />}
                  {cta.custom?.ctaType === 'buy_product' && <ProductCardIcon />}
                </div>
                {/* CTA Info */}
                <div>
                  <div style={{ fontSize: '12px', fontWeight: '500' }}>
                    {getCtaTypeLabel(cta.custom?.ctaType)}
                  </div>
                  <div style={{ fontSize: '10px', color: 'var(--text-muted)', maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {cta.custom?.title || cta.custom?.text || cta.custom?.redirectUrl || 'No URL'}
                  </div>
                </div>
              </div>
              {/* Edit indicator */}
              <div style={{ color: 'var(--text-muted)', fontSize: '10px' }}>→</div>
            </div>
          ))}
        </div>
      )}

      {/* Instructions */}
      <p style={{
        fontSize: '11px',
        color: 'var(--text-muted)',
        textAlign: 'center',
        lineHeight: '1.5',
        marginTop: '16px',
      }}>
        Click a CTA type to add it to canvas.
        <br />
        Select CTA on canvas to edit styles.
      </p>

      {/* Animation keyframes - Storyly-style premium bounce */}
      <style>{`
        @keyframes storylyBouncePreview {
          0% { 
            transform: translateY(0); 
            opacity: 1; 
          }
          25% { 
            transform: translateY(-5px); 
            opacity: 0.75; 
          }
          40% { 
            transform: translateY(-4px); 
            opacity: 0.8; 
          }
          55% { 
            transform: translateY(-6px); 
            opacity: 0.72; 
          }
          70% { 
            transform: translateY(-3px); 
            opacity: 0.85; 
          }
          100% { 
            transform: translateY(0); 
            opacity: 1; 
          }
        }
      `}</style>
    </div>
  );
});

// Export the complete section
export const CtaSection = {
  name: 'cta',
  Tab: CtaSectionTab,
  Panel: CtaSectionPanel,
};

// Export helpers for use in CtaSettings
export { CTA_DIMENSIONS, CTA_DEFAULTS };
