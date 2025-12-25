import React, { useRef } from 'react';
import { observer } from 'mobx-react-lite';
import { SectionTab } from 'polotno/side-panel';

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
  classic: { width: 180, height: 50 },
  swipe_up: { width: 120, height: 80 },
  image: { width: 150, height: 120 },
  product_card: { width: 180, height: 240 },
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
    fontSize: 16,
    fontWeight: 'bold',
  },
  swipe_up: {
    text: 'Swipe Up',
    redirectUrl: 'https://example.com',
    arrowColor: '#636363',
    arrowSize: 28,
    arrowAnimation: true,
    textColor: '#ffffff',
    bgColor: '#636363',
    borderRadius: 20,
    fontSize: 13,
  },
  image: {
    redirectUrl: 'https://example.com',
    altText: '',
    borderRadius: 12,
    borderWidth: 0,
    borderColor: '#ffffff',
  },
  product_card: {
    title: 'Product Name',
    price: '$29.99',
    redirectUrl: 'https://example.com',
    imageUrl: '',
    // Background
    cardBgColor: '#ffffff',
    // Button styling
    buttonText: '→',
    buttonBgColor: '#3b82f6',
    buttonTextColor: '#ffffff',
    buttonFontSize: 16,
    buttonFontWeight: 'bold',
    buttonSize: 28,
    buttonPositionX: 0,
    buttonPositionY: 0,
    // Price styling
    priceBgColor: '#10b981',
    priceTextColor: '#ffffff',
    priceFontSize: 11,
    priceFontWeight: 'bold',
    // Product name styling
    titleColor: '#1f2937',
    titleFontSize: 13,
    titleFontWeight: '600',
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
      return generateProductCardSVG(data, width, height);
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
  const arrowAnimation = data?.arrowAnimation !== false; // default true
  const textColor = data?.textColor || '#ffffff';
  const bgColor = data?.bgColor || 'rgba(0,0,0,0.5)';
  const borderRadius = data?.borderRadius || 16;
  const fontSize = data?.fontSize || 13;
  
  const arrowY = height * 0.3;
  const textY = height * 0.75;
  
  // Arrow animation style - only apply if enabled
  const arrowAnimationStyle = arrowAnimation ? 'animation: float 2s ease-in-out infinite;' : '';
  
  return `data:image/svg+xml;utf8,${encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
      <style>
        @keyframes float {
          0%, 100% { transform: translateY(0); opacity: 1; }
          50% { transform: translateY(-8px); opacity: 0.6; }
        }
        .arrow { ${arrowAnimationStyle} }
      </style>
      <rect x="10" y="${height * 0.45}" width="${width - 20}" height="${height * 0.5}" rx="${borderRadius}" fill="${bgColor}"/>
      <text class="arrow" x="${width/2}" y="${arrowY}" text-anchor="middle" fill="${arrowColor}" font-size="${arrowSize}" font-weight="400">⌃</text>
      <text x="${width/2}" y="${textY}" text-anchor="middle" fill="${textColor}" font-size="${fontSize}" font-weight="600" font-family="Inter, -apple-system, sans-serif">${escapeXml(text)}</text>
    </svg>
  `)}`;
}

function generateProductCardSVG(data, width, height) {
  const title = data?.title || 'Product Name';
  const price = data?.price || '$29.99';
  const imageUrl = data?.imageUrl || '';
  
  // Background
  const cardBgColor = data?.cardBgColor || '#ffffff';
  
  // Button styling
  const buttonText = data?.buttonText || '→';
  const buttonBgColor = data?.buttonBgColor || '#3b82f6';
  const buttonTextColor = data?.buttonTextColor || '#ffffff';
  const buttonFontSize = data?.buttonFontSize || 16;
  const buttonFontWeight = data?.buttonFontWeight || 'bold';
  const buttonSize = data?.buttonSize || 28;
  const buttonPositionX = data?.buttonPositionX || 0;
  const buttonPositionY = data?.buttonPositionY || 0;
  
  // Price styling
  const priceBgColor = data?.priceBgColor || '#10b981';
  const priceTextColor = data?.priceTextColor || '#ffffff';
  const priceFontSize = data?.priceFontSize || 11;
  const priceFontWeight = data?.priceFontWeight || 'bold';
  
  // Title styling
  const titleColor = data?.titleColor || '#1f2937';
  const titleFontSize = data?.titleFontSize || 13;
  const titleFontWeight = data?.titleFontWeight || '600';
  
  const imageHeight = height * 0.65;
  
  // Calculate button position
  const defaultButtonX = width - 38 + buttonPositionX;
  const defaultButtonY = imageHeight + 8 + buttonPositionY;
  
  // Image section - show uploaded image or placeholder
  const imageSection = imageUrl 
    ? `<image href="${imageUrl}" x="0" y="0" width="${width}" height="${imageHeight}" preserveAspectRatio="xMidYMid slice" clip-path="url(#imageClip)"/>`
    : `<rect width="${width}" height="${imageHeight}" rx="12" fill="#e5e7eb"/>
       <rect y="${imageHeight - 8}" width="${width}" height="8" fill="#e5e7eb"/>
       <text x="${width/2}" y="${imageHeight/2 + 10}" text-anchor="middle" fill="#9ca3af" font-size="32">📷</text>`;
  
  return `data:image/svg+xml;utf8,${encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
      <defs>
        <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="0" dy="2" stdDeviation="4" flood-opacity="0.2"/>
        </filter>
        <clipPath id="imageClip">
          <rect width="${width}" height="${imageHeight}" rx="12"/>
        </clipPath>
      </defs>
      <!-- Card Container -->
      <rect width="${width}" height="${height}" rx="12" fill="${cardBgColor}" filter="url(#shadow)"/>
      <!-- Image Section -->
      ${imageSection}
      <!-- Price Badge -->
      <rect x="${width - 58}" y="${imageHeight - 30}" width="50" height="24" rx="12" fill="${priceBgColor}"/>
      <text x="${width - 33}" y="${imageHeight - 14}" text-anchor="middle" fill="${priceTextColor}" font-size="${priceFontSize}" font-weight="${priceFontWeight}" font-family="Inter, sans-serif">${escapeXml(price)}</text>
      <!-- Title -->
      <text x="12" y="${imageHeight + 22}" fill="${titleColor}" font-size="${titleFontSize}" font-weight="${titleFontWeight}" font-family="Inter, sans-serif">${escapeXml(title)}</text>
      <!-- Action Button -->
      <rect x="${defaultButtonX}" y="${defaultButtonY}" width="${buttonSize}" height="${buttonSize}" rx="${buttonSize/2}" fill="${buttonBgColor}"/>
      <text x="${defaultButtonX + buttonSize/2}" y="${defaultButtonY + buttonSize/2 + buttonFontSize/3}" text-anchor="middle" fill="${buttonTextColor}" font-size="${buttonFontSize}" font-weight="${buttonFontWeight}">${escapeXml(buttonText)}</text>
    </svg>
  `)}`;
}

// CTA Section Panel
export const CtaSectionPanel = observer(({ store }) => {
  const imageInputRef = useRef(null);
  const productImageInputRef = useRef(null);

  // Add Classic CTA element using SVG for proper height control
  const addClassicCta = () => {
    const page = store.activePage;
    if (!page) return;

    const pageWidth = store.width;
    const pageHeight = store.height;
    const dims = CTA_DIMENSIONS.classic;
    const defaults = CTA_DEFAULTS.classic;

    const svgContent = generateCtaSVG('classic', defaults, dims.width, dims.height);

    const element = page.addElement({
      type: 'svg',
      x: (pageWidth - dims.width) / 2,
      y: pageHeight - 100,
      width: dims.width,
      height: dims.height,
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

    const pageWidth = store.width;
    const pageHeight = store.height;
    const dims = CTA_DIMENSIONS.swipe_up;
    const defaults = CTA_DEFAULTS.swipe_up;

    const svgContent = generateCtaSVG('swipe_up', defaults, dims.width, dims.height);

    const element = page.addElement({
      type: 'svg',
      x: (pageWidth - dims.width) / 2,
      y: pageHeight - 120,
      width: dims.width,
      height: dims.height,
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

    const pageWidth = store.width;
    const pageHeight = store.height;
    const dims = CTA_DIMENSIONS.image;

    // Create object URL for the image
    const imageUrl = URL.createObjectURL(file);

    const element = page.addElement({
      type: 'image',
      x: (pageWidth - dims.width) / 2,
      y: pageHeight - 180,
      width: dims.width,
      height: dims.height,
      src: imageUrl,
      cornerRadius: CTA_DEFAULTS.image.borderRadius || 12,
      strokeWidth: CTA_DEFAULTS.image.borderWidth || 0,
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

    const pageWidth = store.width;
    const pageHeight = store.height;
    const dims = CTA_DIMENSIONS.product_card;
    const defaults = CTA_DEFAULTS.product_card;

    // Create object URL for the image
    const imageUrl = URL.createObjectURL(file);

    const svgContent = generateCtaSVG('product_card', { ...defaults, imageUrl }, dims.width, dims.height);

    const element = page.addElement({
      type: 'svg',
      x: (pageWidth - dims.width) / 2,
      y: (pageHeight - dims.height) / 2,
      width: dims.width,
      height: dims.height,
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

    const pageWidth = store.width;
    const pageHeight = store.height;
    const dims = CTA_DIMENSIONS.product_card;
    const defaults = CTA_DEFAULTS.product_card;

    const svgContent = generateCtaSVG('product_card', defaults, dims.width, dims.height);

    const element = page.addElement({
      type: 'svg',
      x: (pageWidth - dims.width) / 2,
      y: (pageHeight - dims.height) / 2,
      width: dims.width,
      height: dims.height,
      src: svgContent,
      keepRatio: false,
      custom: {
        ctaType: 'product_card',
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
              gap: '2px',
            }}>
              <span className="swipe-arrow" style={{ 
                fontSize: '16px', 
                lineHeight: 1,
                animation: 'swipeUpFloat 2s ease-in-out infinite',
                color: 'var(--text-primary)',
              }}>
                ⌃
              </span>
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

          {/* Product Card CTA */}
          <div
            style={{
              ...ctaItemStyle,
              flexDirection: 'column',
              padding: '16px 12px',
              textAlign: 'center',
            }}
            onClick={addDefaultProductCard}
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
              height: '56px',
              background: 'var(--bg-tertiary)',
              borderRadius: '8px',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              marginBottom: '6px',
              border: '1px solid var(--border-primary)',
            }}>
              <div style={{ flex: 0.65, background: '#e5e7eb' }}></div>
              <div style={{ flex: 0.35, padding: '4px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ width: '20px', height: '6px', background: '#374151', borderRadius: '2px' }}></div>
                <div style={{ width: '12px', height: '12px', background: '#3b82f6', borderRadius: '50%' }}></div>
              </div>
            </div>
            <span style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>Product</span>
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
                </div>
                {/* CTA Info */}
                <div>
                  <div style={{ fontSize: '12px', fontWeight: '500' }}>
                    {getCtaTypeLabel(cta.custom?.ctaType)}
                  </div>
                  <div style={{ fontSize: '10px', color: 'var(--text-muted)', maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {cta.custom?.text || cta.custom?.redirectUrl || 'No URL'}
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

      {/* Animation keyframes */}
      <style>{`
        @keyframes swipeUpFloat {
          0%, 100% { 
            transform: translateY(0); 
            opacity: 1; 
          }
          50% { 
            transform: translateY(-6px); 
            opacity: 0.6; 
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
