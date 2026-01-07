import { observer } from 'mobx-react-lite';
import { useState, useRef, useCallback } from 'react';
import { AnimationSection } from '../shared/CommonControls';
import { generateCtaSVG, CTA_DEFAULTS } from '../../side-panel/sections/CtaSection';
import { toCanvas, toExport } from '../../../utils/scale';

/**
 * CTA Settings Panel
 * 
 * Shows different controls based on CTA type (classic, swipe_up, image, product_card)
 * Now properly handles SVG elements for height control and visual previews.
 */
export const CtaSettings = observer(({ store, element }) => {
  const [activeTab, setActiveTab] = useState('general');
  const productImageInputRef = useRef(null);

  if (!element) return null;

  const ctaType = element.custom?.ctaType || 'classic';
  const isSvgElement = element.type === 'svg';
  const isTextElement = element.type === 'text';
  const isImageElement = element.type === 'image';

  // Get current custom data
  const customData = element.custom || {};

  // Check if it's a product card variant
  const isProductCardVariant = ['product_card', 'visit_product', 'describe_product', 'buy_product'].includes(ctaType);

  // Get CTA type label
  const getCtaTypeLabel = () => {
    switch (ctaType) {
      case 'classic': return 'Classic CTA';
      case 'swipe_up': return 'Swipe-Up CTA';
      case 'image': return 'Image CTA';
      case 'product_card': return 'Product Card';
      case 'visit_product': return 'Visit Product';
      case 'describe_product': return 'Describe Product';
      case 'buy_product': return 'Buy Product';
      default: return 'CTA';
    }
  };

  // Regenerate SVG when data changes
  const regenerateSVG = useCallback((newCustomData) => {
    if (isSvgElement) {
      const exportWidth = toExport(element.width);
      const exportHeight = toExport(element.height);
      const newSrc = generateCtaSVG(
        ctaType, 
        newCustomData, 
        exportWidth, 
        exportHeight
      );
      element.set({ src: newSrc });
    }
  }, [element, ctaType, isSvgElement]);

  // Update custom data and regenerate SVG
  const updateCustomData = (key, value) => {
    const newCustomData = { ...customData, [key]: value };
    element.set({ custom: newCustomData });
    regenerateSVG(newCustomData);
  };

  // Direct element property setters with SVG regeneration
  const setWidth = (value) => {
    const numValue = parseFloat(value);
    if (!isNaN(numValue) && numValue > 0) {
      element.set({ width: numValue });
      if (isSvgElement) {
        setTimeout(() => regenerateSVG(customData), 0);
      }
    }
  };

  const setHeight = (value) => {
    const numValue = parseFloat(value);
    if (!isNaN(numValue) && numValue > 0) {
      element.set({ height: numValue });
      if (isSvgElement) {
        setTimeout(() => regenerateSVG(customData), 0);
      }
    }
  };

  // Style setters that update custom data and regenerate SVG
  const setBackgroundColor = (value) => {
    if (isSvgElement) {
      updateCustomData('bgColor', value);
    } else if (isTextElement) {
      element.set({
        background: value,
        backgroundEnabled: true
      });
    }
  };

  const setTextColor = (value) => {
    if (isSvgElement) {
      updateCustomData('textColor', value);
    } else if (isTextElement) {
      element.set({ fill: value });
    }
  };

  const setFontSize = (value) => {
    const numValue = parseInt(value);
    if (isSvgElement) {
      updateCustomData('fontSize', isNaN(numValue) ? value : numValue);
    } else if (isTextElement && !isNaN(numValue)) {
      element.set({ fontSize: numValue });
    }
  };

  const setBorderRadius = (value) => {
    const radius = parseFloat(value);
    if (isSvgElement) {
      updateCustomData('borderRadius', isNaN(radius) ? value : radius);
    } else if (isTextElement && !isNaN(radius)) {
      element.set({ backgroundCornerRadius: radius });
    } else if (isImageElement && !isNaN(radius)) {
      // Persist in export-units, apply to canvas props.
      element.set({ cornerRadius: toCanvas(radius) });
      updateCustomData('borderRadius', radius);
    }
  };

  const setRedirectUrl = (value) => {
    updateCustomData('redirectUrl', value);
  };

  const setButtonText = (value) => {
    updateCustomData('text', value);
  };

  // Border setters for classic CTA and image CTA
  const setBorderWidth = (value) => {
    const width = parseInt(value);
    if (isSvgElement) {
      updateCustomData('borderWidth', isNaN(width) ? value : width);
    } else if (isImageElement && !isNaN(width)) {
      // Persist in export-units, apply to canvas props.
      element.set({ strokeWidth: toCanvas(width) });
      updateCustomData('borderWidth', width);
    }
  };

  const setBorderColor = (value) => {
    if (isSvgElement) {
      updateCustomData('borderColor', value);
    } else if (isImageElement) {
      element.set({ stroke: value });
      updateCustomData('borderColor', value);
    }
  };

  // Arrow settings for swipe-up
  const setArrowColor = (value) => {
    updateCustomData('arrowColor', value);
  };

  const setArrowSize = (value) => {
    const numValue = parseInt(value);
    updateCustomData('arrowSize', isNaN(numValue) ? value : numValue);
  };

  const setArrowAnimation = (value) => {
    updateCustomData('arrowAnimation', value);
  };

  // Product Card specific setters - Updated for new design
  const setProductTitle = (value) => {
    updateCustomData('title', value);
  };

  const setProductPrice = (value) => {
    updateCustomData('price', value);
  };

  // Card styling setters
  const setCardBgColor = (value) => {
    updateCustomData('cardBgColor', value);
  };

  const setCardBorderRadius = (value) => {
    const numValue = parseInt(value);
    updateCustomData('cardBorderRadius', isNaN(numValue) ? value : numValue);
  };

  const setCardShadow = (value) => {
    updateCustomData('cardShadow', value);
  };

  const setCardShadowBlur = (value) => {
    const numValue = parseInt(value);
    updateCustomData('cardShadowBlur', isNaN(numValue) ? value : numValue);
  };

  const setCardShadowOpacity = (value) => {
    const numValue = parseFloat(value);
    updateCustomData('cardShadowOpacity', isNaN(numValue) ? value : numValue);
  };

  // Image styling setters
  const setImageHeightRatio = (value) => {
    const numValue = parseFloat(value);
    updateCustomData('imageHeightRatio', isNaN(numValue) ? value : numValue);
  };

  const setImageBorderRadius = (value) => {
    const numValue = parseInt(value);
    updateCustomData('imageBorderRadius', isNaN(numValue) ? value : numValue);
  };

  // Title styling setters
  const setTitleColor = (value) => {
    updateCustomData('titleColor', value);
  };

  const setTitleFontSize = (value) => {
    const numValue = parseInt(value);
    updateCustomData('titleFontSize', isNaN(numValue) ? value : numValue);
  };

  const setTitleFontWeight = (value) => {
    updateCustomData('titleFontWeight', value);
  };

  // Price styling setters
  const setPriceColor = (value) => {
    updateCustomData('priceColor', value);
  };

  const setPriceFontSize = (value) => {
    const numValue = parseInt(value);
    updateCustomData('priceFontSize', isNaN(numValue) ? value : numValue);
  };

  const setPriceFontWeight = (value) => {
    updateCustomData('priceFontWeight', value);
  };

  // Arrow button setters
  const setArrowButtonSize = (value) => {
    const numValue = parseInt(value);
    updateCustomData('arrowButtonSize', isNaN(numValue) ? value : numValue);
  };

  const setArrowButtonBgColor = (value) => {
    updateCustomData('arrowButtonBgColor', value);
  };

  const setArrowButtonIconColor = (value) => {
    updateCustomData('arrowButtonIconColor', value);
  };

  const setArrowButtonBorderRadius = (value) => {
    const numValue = parseInt(value);
    updateCustomData('arrowButtonBorderRadius', isNaN(numValue) ? value : numValue);
  };

  const setArrowButtonPositionX = (value) => {
    const numValue = parseInt(value);
    updateCustomData('arrowButtonPositionX', isNaN(numValue) ? value : numValue);
  };

  const setArrowButtonPositionY = (value) => {
    const numValue = parseInt(value);
    updateCustomData('arrowButtonPositionY', isNaN(numValue) ? value : numValue);
  };

  // Favorite icon setters
  const setShowFavoriteIcon = (value) => {
    updateCustomData('showFavoriteIcon', value);
  };

  const setFavoriteIconSize = (value) => {
    const numValue = parseInt(value);
    updateCustomData('favoriteIconSize', isNaN(numValue) ? value : numValue);
  };

  const setFavoriteIconBgColor = (value) => {
    updateCustomData('favoriteIconBgColor', value);
  };

  const setFavoriteIconColor = (value) => {
    updateCustomData('favoriteIconColor', value);
  };

  // Carousel dots setters
  const setShowCarouselDots = (value) => {
    updateCustomData('showCarouselDots', value);
  };

  const setCarouselDotsCount = (value) => {
    const numValue = parseInt(value);
    updateCustomData('carouselDotsCount', isNaN(numValue) ? value : numValue);
  };

  const setCarouselDotsActiveIndex = (value) => {
    const numValue = parseInt(value);
    updateCustomData('carouselDotsActiveIndex', isNaN(numValue) ? value : numValue);
  };

  const setProductImageUrl = (value) => {
    updateCustomData('imageUrl', value);
  };

  // Handle product image upload
  const handleProductImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith('image/')) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setProductImageUrl(event.target.result);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // Get current values with fallbacks - use ?? to allow empty strings
  const getText = () => customData.text ?? CTA_DEFAULTS[ctaType]?.text ?? 'Shop Now';
  const getBgColor = () => customData.bgColor ?? CTA_DEFAULTS[ctaType]?.bgColor ?? '#3b82f6';
  const getTextColor = () => customData.textColor ?? CTA_DEFAULTS[ctaType]?.textColor ?? '#ffffff';
  const getBorderRadius = () => {
    if (isImageElement) {
      return element.cornerRadius ?? customData.borderRadius ?? CTA_DEFAULTS[ctaType]?.borderRadius ?? 12;
    }
    return customData.borderRadius ?? CTA_DEFAULTS[ctaType]?.borderRadius ?? 25;
  };
  const getBorderWidth = () => {
    if (isImageElement) {
      return element.strokeWidth ?? customData.borderWidth ?? CTA_DEFAULTS[ctaType]?.borderWidth ?? 0;
    }
    return customData.borderWidth ?? CTA_DEFAULTS[ctaType]?.borderWidth ?? 0;
  };
  const getBorderColor = () => {
    if (isImageElement) {
      return element.stroke ?? customData.borderColor ?? CTA_DEFAULTS[ctaType]?.borderColor ?? '#ffffff';
    }
    return customData.borderColor ?? CTA_DEFAULTS[ctaType]?.borderColor ?? '#ffffff';
  };
  const getFontSize = () => customData.fontSize ?? CTA_DEFAULTS[ctaType]?.fontSize ?? 16;
  const getArrowColor = () => customData.arrowColor ?? CTA_DEFAULTS[ctaType]?.arrowColor ?? '#ffffff';
  const getArrowSize = () => customData.arrowSize ?? CTA_DEFAULTS[ctaType]?.arrowSize ?? 28;
  const getArrowAnimation = () => customData.arrowAnimation !== false;
  const getRedirectUrl = () => customData.redirectUrl ?? '';

  // Product Card specific getters - Updated for variants
  const getProductTitle = () => customData.title ?? CTA_DEFAULTS[ctaType]?.title ?? 'Product Name';
  const getProductPrice = () => customData.price ?? CTA_DEFAULTS[ctaType]?.price ?? '$150';
  const getProductImageUrl = () => customData.imageUrl ?? '';

  // Card styling getters - use ctaType-specific defaults
  const getCardBgColor = () => customData.cardBgColor ?? CTA_DEFAULTS[ctaType]?.cardBgColor ?? '#ffffff';
  const getCardBorderRadius = () => customData.cardBorderRadius ?? CTA_DEFAULTS[ctaType]?.cardBorderRadius ?? 24;
  const getCardShadow = () => customData.cardShadow !== false;
  const getCardShadowBlur = () => customData.cardShadowBlur ?? CTA_DEFAULTS[ctaType]?.cardShadowBlur ?? 20;
  const getCardShadowOpacity = () => customData.cardShadowOpacity ?? CTA_DEFAULTS[ctaType]?.cardShadowOpacity ?? 0.15;

  // Image styling getters
  const getImageHeightRatio = () => customData.imageHeightRatio ?? CTA_DEFAULTS[ctaType]?.imageHeightRatio ?? 0.68;
  const getImageBorderRadius = () => customData.imageBorderRadius ?? CTA_DEFAULTS[ctaType]?.imageBorderRadius ?? 20;

  // Title styling getters
  const getTitleColor = () => customData.titleColor ?? CTA_DEFAULTS[ctaType]?.titleColor ?? '#1a1a2e';
  const getTitleFontSize = () => customData.titleFontSize ?? CTA_DEFAULTS[ctaType]?.titleFontSize ?? 42;
  const getTitleFontWeight = () => customData.titleFontWeight ?? CTA_DEFAULTS[ctaType]?.titleFontWeight ?? '600';

  // Price styling getters
  const getPriceColor = () => customData.priceColor ?? CTA_DEFAULTS[ctaType]?.priceColor ?? '#e67e22';
  const getPriceFontSize = () => customData.priceFontSize ?? CTA_DEFAULTS[ctaType]?.priceFontSize ?? 38;
  const getPriceFontWeight = () => customData.priceFontWeight ?? CTA_DEFAULTS[ctaType]?.priceFontWeight ?? '700';

  // Arrow button getters
  const getArrowButtonSize = () => customData.arrowButtonSize ?? CTA_DEFAULTS[ctaType]?.arrowButtonSize ?? 80;
  const getArrowButtonBgColor = () => customData.arrowButtonBgColor ?? CTA_DEFAULTS[ctaType]?.arrowButtonBgColor ?? '#f5f5f5';
  const getArrowButtonIconColor = () => customData.arrowButtonIconColor ?? CTA_DEFAULTS[ctaType]?.arrowButtonIconColor ?? '#1a1a2e';
  const getArrowButtonBorderRadius = () => customData.arrowButtonBorderRadius ?? CTA_DEFAULTS[ctaType]?.arrowButtonBorderRadius ?? 20;
  const getArrowButtonPositionX = () => customData.arrowButtonPositionX ?? 0;
  const getArrowButtonPositionY = () => customData.arrowButtonPositionY ?? 0;

  // Favorite icon getters
  const getShowFavoriteIcon = () => customData.showFavoriteIcon !== false;
  const getFavoriteIconSize = () => customData.favoriteIconSize ?? CTA_DEFAULTS[ctaType]?.favoriteIconSize ?? 56;
  const getFavoriteIconBgColor = () => customData.favoriteIconBgColor ?? CTA_DEFAULTS[ctaType]?.favoriteIconBgColor ?? 'rgba(128,128,128,0.6)';
  const getFavoriteIconColor = () => customData.favoriteIconColor ?? CTA_DEFAULTS[ctaType]?.favoriteIconColor ?? '#ffffff';

  // Carousel dots getters - use ctaType-specific defaults
  const getShowCarouselDots = () => customData.showCarouselDots !== false;
  const getCarouselDotsCount = () => customData.carouselDotsCount ?? CTA_DEFAULTS[ctaType]?.carouselDotsCount ?? 4;
  const getCarouselDotsActiveIndex = () => customData.carouselDotsActiveIndex ?? CTA_DEFAULTS[ctaType]?.carouselDotsActiveIndex ?? 0;

  // === NEW PRODUCT CARD VARIANT SETTERS & GETTERS ===

  // Description setters/getters (for buy_product, visit_product)
  const setDescription = (value) => {
    updateCustomData('description', value);
  };
  const getDescription = () => customData.description ?? CTA_DEFAULTS[ctaType]?.description ?? '';

  const setDescriptionColor = (value) => {
    updateCustomData('descriptionColor', value);
  };
  const getDescriptionColor = () => customData.descriptionColor ?? CTA_DEFAULTS[ctaType]?.descriptionColor ?? '#64748b';

  const setDescriptionFontSize = (value) => {
    const numValue = parseInt(value);
    updateCustomData('descriptionFontSize', isNaN(numValue) ? value : numValue);
  };
  const getDescriptionFontSize = () => customData.descriptionFontSize ?? CTA_DEFAULTS[ctaType]?.descriptionFontSize ?? 14;

  // Original price setters/getters (for visit_product)
  const setOriginalPrice = (value) => {
    updateCustomData('originalPrice', value);
  };
  const getOriginalPrice = () => customData.originalPrice ?? CTA_DEFAULTS[ctaType]?.originalPrice ?? '';

  const setShowOriginalPrice = (value) => {
    updateCustomData('showOriginalPrice', value);
  };
  const getShowOriginalPrice = () => customData.showOriginalPrice !== false;

  const setOriginalPriceColor = (value) => {
    updateCustomData('originalPriceColor', value);
  };
  const getOriginalPriceColor = () => customData.originalPriceColor ?? CTA_DEFAULTS[ctaType]?.originalPriceColor ?? '#64748b';

  // Price badge styling (for visit_product - using priceBgColor/priceBorderRadius)
  const setPriceBadgeBg = (value) => {
    updateCustomData('priceBgColor', value);
  };
  const getPriceBadgeBg = () => customData.priceBgColor ?? CTA_DEFAULTS[ctaType]?.priceBgColor ?? '#334155';

  const setPriceBadgeRadius = (value) => {
    const numValue = parseInt(value);
    updateCustomData('priceBorderRadius', isNaN(numValue) ? value : numValue);
  };
  const getPriceBadgeRadius = () => customData.priceBorderRadius ?? CTA_DEFAULTS[ctaType]?.priceBorderRadius ?? 8;

  // Arrow styling (for visit_product - uses arrowButtonIconColor in SVG)
  const setArrowIconColor = (value) => {
    updateCustomData('arrowButtonIconColor', value);
  };
  const getArrowIconColor = () => customData.arrowButtonIconColor ?? CTA_DEFAULTS[ctaType]?.arrowButtonIconColor ?? '#fff';

  // Show image toggle (for buy_product)
  const setShowImage = (value) => {
    updateCustomData('showImage', value);
  };
  const getShowImage = () => customData.showImage !== false;

  const setImageSize = (value) => {
    const numValue = parseInt(value);
    updateCustomData('imageSize', isNaN(numValue) ? value : numValue);
  };
  const getImageSize = () => customData.imageSize ?? CTA_DEFAULTS[ctaType]?.imageSize ?? 140;

  // Button setters/getters (for buy_product - uses buyButton prefix in data)
  const setBuyButtonText = (value) => {
    updateCustomData('buyButtonText', value);
  };
  const getButtonText = () => customData.buyButtonText ?? CTA_DEFAULTS[ctaType]?.buyButtonText ?? 'Buy Now';

  const setButtonBgColor = (value) => {
    updateCustomData('buyButtonBgColor', value);
  };
  const getButtonBgColor = () => customData.buyButtonBgColor ?? CTA_DEFAULTS[ctaType]?.buyButtonBgColor ?? '#1a1a2e';

  const setButtonTextColor = (value) => {
    updateCustomData('buyButtonTextColor', value);
  };
  const getButtonTextColor = () => customData.buyButtonTextColor ?? CTA_DEFAULTS[ctaType]?.buyButtonTextColor ?? '#ffffff';

  const setButtonFontSize = (value) => {
    const numValue = parseInt(value);
    updateCustomData('buyButtonFontSize', isNaN(numValue) ? value : numValue);
  };
  const getButtonFontSize = () => customData.buyButtonFontSize ?? CTA_DEFAULTS[ctaType]?.buyButtonFontSize ?? 14;

  const setButtonBorderRadius = (value) => {
    const numValue = parseInt(value);
    updateCustomData('buyButtonBorderRadius', isNaN(numValue) ? value : numValue);
  };
  const getButtonBorderRadius = () => customData.buyButtonBorderRadius ?? CTA_DEFAULTS[ctaType]?.buyButtonBorderRadius ?? 8;

  return (
    <div className="settings-panel cta-settings">
      {/* CTA Type Badge */}
      <div style={{
        padding: '10px 16px',
        background: 'linear-gradient(90deg,#ff6b35,#f7931e)',
        color: '#ffffff',
        fontSize: '12px',
        fontWeight: '600',
        textAlign: 'center',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
      }}>
        <span style={{ fontSize: '16px' }}>🔗</span>
        <span>{getCtaTypeLabel()}</span>
      </div>

      {/* Tab Navigation */}
      <div className="sidebar-tabs">
        <button
          className={`sidebar-tab ${activeTab === 'general' ? 'active' : ''}`}
          onClick={() => setActiveTab('general')}
        >
          Content
        </button>
        <button
          className={`sidebar-tab ${activeTab === 'style' ? 'active' : ''}`}
          onClick={() => setActiveTab('style')}
        >
          Style
        </button>
        <button
          className={`sidebar-tab ${activeTab === 'animation' ? 'active' : ''}`}
          onClick={() => setActiveTab('animation')}
        >
          Animate
        </button>
      </div>

      <div className="settings-content">
        {/* ==================== CONTENT TAB ==================== */}
        {activeTab === 'general' && (
          <>
            {/* Content Section */}
            <div className="section">
              <div className="section-title">Content</div>

              {/* Redirect URL - for all CTA types */}
              <div className="control-row" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '6px' }}>
                <span className="control-label">Redirect URL</span>
                <input
                  type="url"
                  placeholder="https://example.com"
                  value={getRedirectUrl()}
                  onChange={(e) => setRedirectUrl(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    background: 'var(--sidebar-input-bg)',
                    border: '1px solid var(--sidebar-input-border)',
                    borderRadius: '6px',
                    color: 'var(--sidebar-text)',
                    fontSize: '12px',
                  }}
                />
                {!getRedirectUrl() && (
                  <span style={{ fontSize: '10px', color: '#f59e0b' }}>⚠ URL is required for CTA to work</span>
                )}
              </div>

              {/* Text content - for classic and swipe_up */}
              {(ctaType === 'classic' || ctaType === 'swipe_up') && (
                <div className="control-row" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '6px', marginTop: '12px' }}>
                  <span className="control-label">Button Text</span>
                  <input
                    type="text"
                    value={getText()}
                    onChange={(e) => setButtonText(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      background: 'var(--sidebar-input-bg)',
                      border: '1px solid var(--sidebar-input-border)',
                      borderRadius: '6px',
                      color: 'var(--sidebar-text)',
                      fontSize: '12px',
                    }}
                  />
                </div>
              )}

              {/* Product Card Content - for all product card variants */}
              {isProductCardVariant && (
                <>
                  {/* Product Image Upload - for describe_product and buy_product */}
                  {(ctaType === 'product_card' || ctaType === 'describe_product' || ctaType === 'buy_product') && (
                    <div className="control-row" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '6px', marginTop: '12px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                        <span className="control-label">Product Image</span>
                        {ctaType === 'buy_product' && (
                          <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                            <input
                              type="checkbox"
                              checked={getShowImage()}
                              onChange={(e) => setShowImage(e.target.checked)}
                              style={{ margin: 0 }}
                            />
                            <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Show</span>
                          </label>
                        )}
                      </div>
                      {(ctaType !== 'buy_product' || getShowImage()) && (
                        <div style={{ width: '100%' }}>
                          {getProductImageUrl() ? (
                            <div style={{ position: 'relative', width: '100%' }}>
                              <img
                                src={getProductImageUrl()}
                                alt="Product"
                                style={{
                                  width: '100%',
                                  height: '80px',
                                  objectFit: 'cover',
                                  borderRadius: '8px',
                                  border: '1px solid var(--sidebar-input-border)',
                                }}
                              />
                              <button
                                onClick={() => setProductImageUrl('')}
                                style={{
                                  position: 'absolute',
                                  top: '4px',
                                  right: '4px',
                                  width: '24px',
                                  height: '24px',
                                  borderRadius: '50%',
                                  background: 'rgba(0,0,0,0.6)',
                                  border: 'none',
                                  color: '#fff',
                                  cursor: 'pointer',
                                  fontSize: '12px',
                                }}
                              >
                                ✕
                              </button>
                            </div>
                          ) : (
                            <label style={{
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              justifyContent: 'center',
                              padding: '16px',
                              background: 'var(--sidebar-input-bg)',
                              border: '2px dashed var(--sidebar-input-border)',
                              borderRadius: '8px',
                              cursor: 'pointer',
                              gap: '4px',
                            }}>
                              <span style={{ fontSize: '20px' }}>📷</span>
                              <span style={{ fontSize: '11px', color: 'var(--sidebar-text-muted)' }}>Upload Product Image</span>
                              <input
                                ref={productImageInputRef}
                                type="file"
                                accept="image/png,image/jpg,image/jpeg,image/webp"
                                onChange={handleProductImageUpload}
                                style={{ display: 'none' }}
                              />
                            </label>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Product Title */}
                  <div className="control-row" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '6px', marginTop: '12px' }}>
                    <span className="control-label">Product Title</span>
                    <input
                      type="text"
                      value={getProductTitle()}
                      onChange={(e) => setProductTitle(e.target.value)}
                      placeholder="Product Name"
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        background: 'var(--sidebar-input-bg)',
                        border: '1px solid var(--sidebar-input-border)',
                        borderRadius: '6px',
                        color: 'var(--sidebar-text)',
                        fontSize: '12px',
                      }}
                    />
                  </div>

                  {/* Short Description - for visit_product and buy_product */}
                  {(ctaType === 'visit_product' || ctaType === 'buy_product') && (
                    <div className="control-row" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '6px', marginTop: '12px' }}>
                      <span className="control-label">Short Description</span>
                      <input
                        type="text"
                        value={getDescription()}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Brief product description"
                        style={{
                          width: '100%',
                          padding: '10px 12px',
                          background: 'var(--sidebar-input-bg)',
                          border: '1px solid var(--sidebar-input-border)',
                          borderRadius: '6px',
                          color: 'var(--sidebar-text)',
                          fontSize: '12px',
                        }}
                      />
                    </div>
                  )}

                  {/* Product Price */}
                  <div className="control-row" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '6px', marginTop: '12px' }}>
                    <span className="control-label">Price</span>
                    <input
                      type="text"
                      value={getProductPrice()}
                      onChange={(e) => setProductPrice(e.target.value)}
                      placeholder="$29.99"
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        background: 'var(--sidebar-input-bg)',
                        border: '1px solid var(--sidebar-input-border)',
                        borderRadius: '6px',
                        color: 'var(--sidebar-text)',
                        fontSize: '12px',
                      }}
                    />
                  </div>

                  {/* Original Price with Strike-through - for visit_product */}
                  {ctaType === 'visit_product' && (
                    <div className="control-row" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '6px', marginTop: '12px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                        <span className="control-label">Original Price</span>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                          <input
                            type="checkbox"
                            checked={getShowOriginalPrice()}
                            onChange={(e) => setShowOriginalPrice(e.target.checked)}
                            style={{ margin: 0 }}
                          />
                          <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Show</span>
                        </label>
                      </div>
                      {getShowOriginalPrice() && (
                        <input
                          type="text"
                          value={getOriginalPrice()}
                          onChange={(e) => setOriginalPrice(e.target.value)}
                          placeholder="$49.99"
                          style={{
                            width: '100%',
                            padding: '10px 12px',
                            background: 'var(--sidebar-input-bg)',
                            border: '1px solid var(--sidebar-input-border)',
                            borderRadius: '6px',
                            color: 'var(--sidebar-text)',
                            fontSize: '12px',
                          }}
                        />
                      )}
                    </div>
                  )}

                  {/* Button Text - for buy_product */}
                  {ctaType === 'buy_product' && (
                    <div className="control-row" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '6px', marginTop: '12px' }}>
                      <span className="control-label">Button Text</span>
                      <input
                        type="text"
                        value={getButtonText()}
                        onChange={(e) => setBuyButtonText(e.target.value)}
                        placeholder="Buy Now"
                        style={{
                          width: '100%',
                          padding: '10px 12px',
                          background: 'var(--sidebar-input-bg)',
                          border: '1px solid var(--sidebar-input-border)',
                          borderRadius: '6px',
                          color: 'var(--sidebar-text)',
                          fontSize: '12px',
                        }}
                      />
                    </div>
                  )}
                </>
              )}

              {/* Alt Text for Image CTA */}
              {ctaType === 'image' && (
                <div className="control-row" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '6px', marginTop: '12px' }}>
                  <span className="control-label">Alt Text</span>
                  <input
                    type="text"
                    value={customData.altText ?? ''}
                    onChange={(e) => updateCustomData('altText', e.target.value)}
                    placeholder="Describe this image"
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      background: 'var(--sidebar-input-bg)',
                      border: '1px solid var(--sidebar-input-border)',
                      borderRadius: '6px',
                      color: 'var(--sidebar-text)',
                      fontSize: '12px',
                    }}
                  />
                </div>
              )}
            </div>

            {/* Delete Button */}
            <div className="action-buttons">
              <button
                className="action-btn delete"
                onClick={() => store.deleteElements([element.id])}
              >
                <span>🗑</span> Delete CTA
              </button>
            </div>
          </>
        )}

        {/* ==================== STYLE TAB ==================== */}
        {activeTab === 'style' && (
          <>
            {/* Position & Size Section */}
            <div className="section">
              <div className="section-title">Position & Size</div>

              <div className="control-row">
                <span className="control-label">Position</span>
                <div className="control-value">
                  <div className="position-row">
                    <div className="position-field">
                      <input
                        type="number"
                        className="position-input"
                        value={Math.round(element.x ?? 0)}
                        onChange={(e) => {
                          const value = parseFloat(e.target.value);
                          element.set({ x: isNaN(value) ? 0 : value });
                        }}
                      />
                      <label>X</label>
                    </div>
                    <div className="position-field">
                      <input
                        type="number"
                        className="position-input"
                        value={Math.round(element.y ?? 0)}
                        onChange={(e) => {
                          const value = parseFloat(e.target.value);
                          element.set({ y: isNaN(value) ? 0 : value });
                        }}
                      />
                      <label>Y</label>
                    </div>
                  </div>
                </div>
              </div>

              <div className="control-row">
                <span className="control-label">Size</span>
                <div className="control-value">
                  <div className="position-row">
                    <div className="position-field">
                      <input
                        type="number"
                        className="position-input"
                        value={Math.round(element.width ?? 0)}
                        onChange={(e) => setWidth(e.target.value)}
                      />
                      <label>W</label>
                    </div>
                    <div className="position-field">
                      <input
                        type="number"
                        className="position-input"
                        value={Math.round(element.height ?? 0)}
                        onChange={(e) => setHeight(e.target.value)}
                      />
                      <label>H</label>
                    </div>
                  </div>
                </div>
              </div>

              <div className="control-row">
                <span className="control-label">Rotation</span>
                <div className="control-value">
                  <input
                    type="number"
                    className="position-input"
                    value={Math.round(element.rotation ?? 0)}
                    onChange={(e) => {
                      const value = parseFloat(e.target.value);
                      element.set({ rotation: isNaN(value) ? 0 : value });
                    }}
                  />
                  <span style={{ color: 'var(--sidebar-text-muted)', fontSize: 11 }}>°</span>
                </div>
              </div>

              <div className="control-row">
                <span className="control-label">Opacity</span>
                <div className="control-value">
                  <div className="slider-container">
                    <input
                      type="number"
                      className="slider-input"
                      value={Math.round((element.opacity ?? 1) * 100)}
                      onChange={(e) => {
                        const value = parseInt(e.target.value);
                        element.set({ opacity: (isNaN(value) ? 0 : value) / 100 });
                      }}
                      min={0}
                      max={100}
                    />
                    <div className="slider-track">
                      <div
                        className="slider-fill"
                        style={{ width: `${Math.round((element.opacity ?? 1) * 100)}%` }}
                      >
                        <div className="slider-thumb" />
                      </div>
                      <input
                        type="range"
                        min={0}
                        max={100}
                        value={Math.round((element.opacity ?? 1) * 100)}
                        onChange={(e) => element.set({ opacity: parseInt(e.target.value) / 100 })}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Appearance Section */}
            <div className="section">
              <div className="section-title">Appearance</div>

              {/* Background Color - for classic, swipe_up */}
              {(ctaType === 'classic' || ctaType === 'swipe_up') && (
                <div className="control-row">
                  <span className="control-label">Background</span>
                  <div className="control-value">
                    <div className="color-picker-row">
                      <div
                        className="color-swatch"
                        style={{ backgroundColor: getBgColor() }}
                      >
                        <input
                          type="color"
                          value={getBgColor()}
                          onChange={(e) => setBackgroundColor(e.target.value)}
                        />
                      </div>
                      <input
                        type="text"
                        className="color-input-text"
                        value={getBgColor()}
                        onChange={(e) => setBackgroundColor(e.target.value)}
                        style={{ width: 80 }}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Text Color - for classic, swipe_up */}
              {(ctaType === 'classic' || ctaType === 'swipe_up') && (
                <div className="control-row">
                  <span className="control-label">Text Color</span>
                  <div className="control-value">
                    <div className="color-picker-row">
                      <div
                        className="color-swatch"
                        style={{ backgroundColor: getTextColor() }}
                      >
                        <input
                          type="color"
                          value={getTextColor()}
                          onChange={(e) => setTextColor(e.target.value)}
                        />
                      </div>
                      <input
                        type="text"
                        className="color-input-text"
                        value={getTextColor()}
                        onChange={(e) => setTextColor(e.target.value)}
                        style={{ width: 80 }}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Arrow Color - for swipe_up only */}
              {ctaType === 'swipe_up' && (
                <div className="control-row">
                  <span className="control-label">Arrow Color</span>
                  <div className="control-value">
                    <div className="color-picker-row">
                      <div
                        className="color-swatch"
                        style={{ backgroundColor: getArrowColor() }}
                      >
                        <input
                          type="color"
                          value={getArrowColor()}
                          onChange={(e) => setArrowColor(e.target.value)}
                        />
                      </div>
                      <input
                        type="text"
                        className="color-input-text"
                        value={getArrowColor()}
                        onChange={(e) => setArrowColor(e.target.value)}
                        style={{ width: 80 }}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Arrow Size - for swipe_up only */}
              {ctaType === 'swipe_up' && (
                <div className="control-row">
                  <span className="control-label">Arrow Size</span>
                  <div className="control-value">
                    <input
                      type="number"
                      className="position-input"
                      value={getArrowSize()}
                      onChange={(e) => setArrowSize(e.target.value)}
                      min={12}
                      max={72}
                    />
                    <span style={{ color: 'var(--sidebar-text-muted)', fontSize: 11 }}>px</span>
                  </div>
                </div>
              )}

              {/* Arrow Animation Toggle - for swipe_up only */}
              {ctaType === 'swipe_up' && (
                <div className="control-row">
                  <span className="control-label">Arrow Animation</span>
                  <div className="control-value">
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={getArrowAnimation()}
                        onChange={(e) => setArrowAnimation(e.target.checked)}
                        style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                      />
                      <span style={{ fontSize: '11px', color: 'var(--sidebar-text-muted)' }}>
                        {getArrowAnimation() ? 'Enabled' : 'Disabled'}
                      </span>
                    </label>
                  </div>
                </div>
              )}

              {/* Font Size - for classic, swipe_up */}
              {(ctaType === 'classic' || ctaType === 'swipe_up') && (
                <div className="control-row">
                  <span className="control-label">Font Size</span>
                  <div className="control-value">
                    <input
                      type="number"
                      className="position-input"
                      value={getFontSize()}
                      onChange={(e) => setFontSize(e.target.value)}
                      min={8}
                      max={72}
                    />
                    <span style={{ color: 'var(--sidebar-text-muted)', fontSize: 11 }}>px</span>
                  </div>
                </div>
              )}

              {/* Border Radius - for classic, swipe_up, image */}
              {(ctaType === 'classic' || ctaType === 'swipe_up' || ctaType === 'image') && (
                <div className="control-row">
                  <span className="control-label">Border Radius</span>
                  <div className="control-value">
                    <input
                      type="number"
                      className="position-input"
                      value={getBorderRadius()}
                      onChange={(e) => setBorderRadius(e.target.value)}
                      min={0}
                      max={100}
                    />
                    <span style={{ color: 'var(--sidebar-text-muted)', fontSize: 11 }}>px</span>
                  </div>
                </div>
              )}

              {/* Border Width - for classic and image */}
              {(ctaType === 'classic' || ctaType === 'image') && (
                <div className="control-row">
                  <span className="control-label">Border Width</span>
                  <div className="control-value">
                    <input
                      type="number"
                      className="position-input"
                      value={getBorderWidth()}
                      onChange={(e) => setBorderWidth(e.target.value)}
                      min={0}
                      max={20}
                    />
                    <span style={{ color: 'var(--sidebar-text-muted)', fontSize: 11 }}>px</span>
                  </div>
                </div>
              )}

              {/* Border Color - for classic and image */}
              {(ctaType === 'classic' || ctaType === 'image') && (
                <div className="control-row">
                  <span className="control-label">Border Color</span>
                  <div className="control-value">
                    <div className="color-picker-row">
                      <div
                        className="color-swatch"
                        style={{ backgroundColor: getBorderColor() }}
                      >
                        <input
                          type="color"
                          value={getBorderColor()}
                          onChange={(e) => setBorderColor(e.target.value)}
                        />
                      </div>
                      <input
                        type="text"
                        className="color-input-text"
                        value={getBorderColor()}
                        onChange={(e) => setBorderColor(e.target.value)}
                        style={{ width: 80 }}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Product Card Card Styling - for all product card variants */}
              {isProductCardVariant && (
                <>
                  {/* Card Background Color */}
                  <div className="control-row">
                    <span className="control-label">Card Background</span>
                    <div className="control-value">
                      <div className="color-picker-row">
                        <div
                          className="color-swatch"
                          style={{ backgroundColor: getCardBgColor() }}
                        >
                          <input
                            type="color"
                            value={getCardBgColor()}
                            onChange={(e) => setCardBgColor(e.target.value)}
                          />
                        </div>
                        <input
                          type="text"
                          className="color-input-text"
                          value={getCardBgColor()}
                          onChange={(e) => setCardBgColor(e.target.value)}
                          style={{ width: 80 }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Card Border Radius */}
                  <div className="control-row">
                    <span className="control-label">Card Radius</span>
                    <div className="control-value">
                      <input
                        type="number"
                        className="position-input"
                        value={getCardBorderRadius()}
                        onChange={(e) => setCardBorderRadius(e.target.value)}
                        min={0}
                        max={60}
                      />
                      <span style={{ color: 'var(--sidebar-text-muted)', fontSize: 11 }}>px</span>
                    </div>
                  </div>

                  {/* Card Shadow Toggle */}
                  <div className="control-row">
                    <span className="control-label">Card Shadow</span>
                    <div className="control-value">
                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          checked={getCardShadow()}
                          onChange={(e) => setCardShadow(e.target.checked)}
                          style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                        />
                        <span style={{ fontSize: '11px', color: 'var(--sidebar-text-muted)' }}>
                          {getCardShadow() ? 'Enabled' : 'Disabled'}
                        </span>
                      </label>
                    </div>
                  </div>

                  {getCardShadow() && (
                    <>
                      {/* Shadow Blur */}
                      <div className="control-row">
                        <span className="control-label">Shadow Blur</span>
                        <div className="control-value">
                          <input
                            type="number"
                            className="position-input"
                            value={getCardShadowBlur()}
                            onChange={(e) => setCardShadowBlur(e.target.value)}
                            min={0}
                            max={50}
                          />
                          <span style={{ color: 'var(--sidebar-text-muted)', fontSize: 11 }}>px</span>
                        </div>
                      </div>

                      {/* Shadow Opacity */}
                      <div className="control-row">
                        <span className="control-label">Shadow Opacity</span>
                        <div className="control-value">
                          <div className="slider-container">
                            <input
                              type="number"
                              className="slider-input"
                              value={Math.round(getCardShadowOpacity() * 100)}
                              onChange={(e) => {
                                const value = parseInt(e.target.value);
                                setCardShadowOpacity((isNaN(value) ? 0 : value) / 100);
                              }}
                              min={0}
                              max={100}
                            />
                            <div className="slider-track">
                              <div
                                className="slider-fill"
                                style={{ width: `${Math.round(getCardShadowOpacity() * 100)}%` }}
                              >
                                <div className="slider-thumb" />
                              </div>
                              <input
                                type="range"
                                min={0}
                                max={100}
                                value={Math.round(getCardShadowOpacity() * 100)}
                                onChange={(e) => setCardShadowOpacity(parseInt(e.target.value) / 100)}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </>
              )}
            </div>

            {/* Image Styling - for describe_product and product_card (vertical cards with image) */}
            {(ctaType === 'product_card' || ctaType === 'describe_product') && (
              <div className="section">
                <div className="section-title">Image Style</div>

                <div className="control-row">
                  <span className="control-label">Height Ratio</span>
                  <div className="control-value">
                    <div className="slider-container">
                      <input
                        type="number"
                        className="slider-input"
                        value={Math.round(getImageHeightRatio() * 100)}
                        onChange={(e) => {
                          const value = parseInt(e.target.value);
                          const clamped = Math.max(40, Math.min(85, isNaN(value) ? 68 : value));
                          setImageHeightRatio(clamped / 100);
                        }}
                        min={40}
                        max={85}
                      />
                      <div className="slider-track">
                        <div
                          className="slider-fill"
                          style={{ width: `${((getImageHeightRatio() - 0.4) / 0.45) * 100}%` }}
                        >
                          <div className="slider-thumb" />
                        </div>
                        <input
                          type="range"
                          min={40}
                          max={85}
                          value={Math.round(getImageHeightRatio() * 100)}
                          onChange={(e) => setImageHeightRatio(parseInt(e.target.value) / 100)}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="control-row">
                  <span className="control-label">Image Radius</span>
                  <div className="control-value">
                    <input
                      type="number"
                      className="position-input"
                      value={getImageBorderRadius()}
                      onChange={(e) => setImageBorderRadius(e.target.value)}
                      min={0}
                      max={40}
                    />
                    <span style={{ color: 'var(--sidebar-text-muted)', fontSize: 11 }}>px</span>
                  </div>
                </div>
              </div>
            )}

            {/* Product Title Styling - for all product card variants */}
            {isProductCardVariant && (
              <div className="section">
                <div className="section-title">Title Style</div>

                <div className="control-row">
                  <span className="control-label">Text Color</span>
                  <div className="control-value">
                    <div className="color-picker-row">
                      <div
                        className="color-swatch"
                        style={{ backgroundColor: getTitleColor() }}
                      >
                        <input
                          type="color"
                          value={getTitleColor()}
                          onChange={(e) => setTitleColor(e.target.value)}
                        />
                      </div>
                      <input
                        type="text"
                        className="color-input-text"
                        value={getTitleColor()}
                        onChange={(e) => setTitleColor(e.target.value)}
                        style={{ width: 80 }}
                      />
                    </div>
                  </div>
                </div>

                <div className="control-row">
                  <span className="control-label">Font Size</span>
                  <div className="control-value">
                    <input
                      type="number"
                      className="position-input"
                      value={getTitleFontSize()}
                      onChange={(e) => setTitleFontSize(e.target.value)}
                      min={12}
                      max={72}
                    />
                    <span style={{ color: 'var(--sidebar-text-muted)', fontSize: 11 }}>px</span>
                  </div>
                </div>

                <div className="control-row">
                  <span className="control-label">Font Weight</span>
                  <div className="control-value">
                    <select
                      value={getTitleFontWeight()}
                      onChange={(e) => setTitleFontWeight(e.target.value)}
                      style={{
                        padding: '6px 10px',
                        background: 'var(--sidebar-input-bg)',
                        border: '1px solid var(--sidebar-input-border)',
                        borderRadius: '4px',
                        color: 'var(--sidebar-text)',
                        fontSize: '11px',
                      }}
                    >
                      <option value="400">Normal</option>
                      <option value="500">Medium</option>
                      <option value="600">Semi-Bold</option>
                      <option value="700">Bold</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Price Styling - for all product card variants */}
            {isProductCardVariant && (
              <div className="section">
                <div className="section-title">Price Style</div>

                <div className="control-row">
                  <span className="control-label">Text Color</span>
                  <div className="control-value">
                    <div className="color-picker-row">
                      <div
                        className="color-swatch"
                        style={{ backgroundColor: getPriceColor() }}
                      >
                        <input
                          type="color"
                          value={getPriceColor()}
                          onChange={(e) => setPriceColor(e.target.value)}
                        />
                      </div>
                      <input
                        type="text"
                        className="color-input-text"
                        value={getPriceColor()}
                        onChange={(e) => setPriceColor(e.target.value)}
                        style={{ width: 80 }}
                      />
                    </div>
                  </div>
                </div>

                <div className="control-row">
                  <span className="control-label">Font Size</span>
                  <div className="control-value">
                    <input
                      type="number"
                      className="position-input"
                      value={getPriceFontSize()}
                      onChange={(e) => setPriceFontSize(e.target.value)}
                      min={12}
                      max={72}
                    />
                    <span style={{ color: 'var(--sidebar-text-muted)', fontSize: 11 }}>px</span>
                  </div>
                </div>

                <div className="control-row">
                  <span className="control-label">Font Weight</span>
                  <div className="control-value">
                    <select
                      value={getPriceFontWeight()}
                      onChange={(e) => setPriceFontWeight(e.target.value)}
                      style={{
                        padding: '6px 10px',
                        background: 'var(--sidebar-input-bg)',
                        border: '1px solid var(--sidebar-input-border)',
                        borderRadius: '4px',
                        color: 'var(--sidebar-text)',
                        fontSize: '11px',
                      }}
                    >
                      <option value="400">Normal</option>
                      <option value="500">Medium</option>
                      <option value="600">Semi-Bold</option>
                      <option value="700">Bold</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Arrow Button Styling - for describe_product and product_card */}
            {(ctaType === 'product_card' || ctaType === 'describe_product') && (
              <div className="section">
                <div className="section-title">Arrow Button Style</div>

                <div className="control-row">
                  <span className="control-label">Background</span>
                  <div className="control-value">
                    <div className="color-picker-row">
                      <div
                        className="color-swatch"
                        style={{ backgroundColor: getArrowButtonBgColor() }}
                      >
                        <input
                          type="color"
                          value={getArrowButtonBgColor()}
                          onChange={(e) => setArrowButtonBgColor(e.target.value)}
                        />
                      </div>
                      <input
                        type="text"
                        className="color-input-text"
                        value={getArrowButtonBgColor()}
                        onChange={(e) => setArrowButtonBgColor(e.target.value)}
                        style={{ width: 80 }}
                      />
                    </div>
                  </div>
                </div>

                <div className="control-row">
                  <span className="control-label">Icon Color</span>
                  <div className="control-value">
                    <div className="color-picker-row">
                      <div
                        className="color-swatch"
                        style={{ backgroundColor: getArrowButtonIconColor() }}
                      >
                        <input
                          type="color"
                          value={getArrowButtonIconColor()}
                          onChange={(e) => setArrowButtonIconColor(e.target.value)}
                        />
                      </div>
                      <input
                        type="text"
                        className="color-input-text"
                        value={getArrowButtonIconColor()}
                        onChange={(e) => setArrowButtonIconColor(e.target.value)}
                        style={{ width: 80 }}
                      />
                    </div>
                  </div>
                </div>

                <div className="control-row">
                  <span className="control-label">Button Size</span>
                  <div className="control-value">
                    <input
                      type="number"
                      className="position-input"
                      value={getArrowButtonSize()}
                      onChange={(e) => setArrowButtonSize(e.target.value)}
                      min={40}
                      max={120}
                    />
                    <span style={{ color: 'var(--sidebar-text-muted)', fontSize: 11 }}>px</span>
                  </div>
                </div>

                <div className="control-row">
                  <span className="control-label">Button Radius</span>
                  <div className="control-value">
                    <input
                      type="number"
                      className="position-input"
                      value={getArrowButtonBorderRadius()}
                      onChange={(e) => setArrowButtonBorderRadius(e.target.value)}
                      min={0}
                      max={60}
                    />
                    <span style={{ color: 'var(--sidebar-text-muted)', fontSize: 11 }}>px</span>
                  </div>
                </div>

                <div className="control-row">
                  <span className="control-label">Position Offset</span>
                  <div className="control-value">
                    <div className="position-row">
                      <div className="position-field">
                        <input
                          type="number"
                          className="position-input"
                          value={getArrowButtonPositionX()}
                          onChange={(e) => setArrowButtonPositionX(e.target.value)}
                        />
                        <label>X</label>
                      </div>
                      <div className="position-field">
                        <input
                          type="number"
                          className="position-input"
                          value={getArrowButtonPositionY()}
                          onChange={(e) => setArrowButtonPositionY(e.target.value)}
                        />
                        <label>Y</label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Favorite Icon - for describe_product and product_card */}
            {(ctaType === 'product_card' || ctaType === 'describe_product') && (
              <div className="section">
                <div className="section-title">Favorite Icon</div>

                <div className="control-row">
                  <span className="control-label">Show Icon</span>
                  <div className="control-value">
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={getShowFavoriteIcon()}
                        onChange={(e) => setShowFavoriteIcon(e.target.checked)}
                        style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                      />
                      <span style={{ fontSize: '11px', color: 'var(--sidebar-text-muted)' }}>
                        {getShowFavoriteIcon() ? 'Visible' : 'Hidden'}
                      </span>
                    </label>
                  </div>
                </div>

                {getShowFavoriteIcon() && (
                  <>
                    <div className="control-row">
                      <span className="control-label">Background</span>
                      <div className="control-value">
                        <div className="color-picker-row">
                          <div
                            className="color-swatch"
                            style={{ backgroundColor: getFavoriteIconBgColor() }}
                          >
                            <input
                              type="color"
                              value={getFavoriteIconBgColor().startsWith('rgba') ? '#808080' : getFavoriteIconBgColor()}
                              onChange={(e) => setFavoriteIconBgColor(e.target.value)}
                            />
                          </div>
                          <input
                            type="text"
                            className="color-input-text"
                            value={getFavoriteIconBgColor()}
                            onChange={(e) => setFavoriteIconBgColor(e.target.value)}
                            style={{ width: 80 }}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="control-row">
                      <span className="control-label">Icon Color</span>
                      <div className="control-value">
                        <div className="color-picker-row">
                          <div
                            className="color-swatch"
                            style={{ backgroundColor: getFavoriteIconColor() }}
                          >
                            <input
                              type="color"
                              value={getFavoriteIconColor()}
                              onChange={(e) => setFavoriteIconColor(e.target.value)}
                            />
                          </div>
                          <input
                            type="text"
                            className="color-input-text"
                            value={getFavoriteIconColor()}
                            onChange={(e) => setFavoriteIconColor(e.target.value)}
                            style={{ width: 80 }}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="control-row">
                      <span className="control-label">Icon Size</span>
                      <div className="control-value">
                        <input
                          type="number"
                          className="position-input"
                          value={getFavoriteIconSize()}
                          onChange={(e) => setFavoriteIconSize(e.target.value)}
                          min={24}
                          max={80}
                        />
                        <span style={{ color: 'var(--sidebar-text-muted)', fontSize: 11 }}>px</span>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Carousel Dots - for describe_product and product_card */}
            {(ctaType === 'product_card' || ctaType === 'describe_product') && (
              <div className="section">
                <div className="section-title">Carousel Dots</div>

                <div className="control-row">
                  <span className="control-label">Show Dots</span>
                  <div className="control-value">
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={getShowCarouselDots()}
                        onChange={(e) => setShowCarouselDots(e.target.checked)}
                        style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                      />
                      <span style={{ fontSize: '11px', color: 'var(--sidebar-text-muted)' }}>
                        {getShowCarouselDots() ? 'Visible' : 'Hidden'}
                      </span>
                    </label>
                  </div>
                </div>

                {getShowCarouselDots() && (
                  <>
                    <div className="control-row">
                      <span className="control-label">Dot Count</span>
                      <div className="control-value">
                        <input
                          type="number"
                          className="position-input"
                          value={getCarouselDotsCount()}
                          onChange={(e) => setCarouselDotsCount(e.target.value)}
                          min={2}
                          max={8}
                        />
                      </div>
                    </div>

                    <div className="control-row">
                      <span className="control-label">Active Dot</span>
                      <div className="control-value">
                        <input
                          type="number"
                          className="position-input"
                          value={getCarouselDotsActiveIndex()}
                          onChange={(e) => setCarouselDotsActiveIndex(e.target.value)}
                          min={0}
                          max={getCarouselDotsCount() - 1}
                        />
                        <span style={{ color: 'var(--sidebar-text-muted)', fontSize: 11 }}>index</span>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Visit Product - Arrow Styling */}
            {ctaType === 'visit_product' && (
              <div className="section">
                <div className="section-title">Arrow Style</div>

                <div className="control-row">
                  <span className="control-label">Arrow Color</span>
                  <div className="control-value">
                    <div className="color-picker-row">
                      <div
                        className="color-swatch"
                        style={{ backgroundColor: getArrowIconColor() }}
                      >
                        <input
                          type="color"
                          value={getArrowIconColor()}
                          onChange={(e) => setArrowIconColor(e.target.value)}
                        />
                      </div>
                      <input
                        type="text"
                        className="color-input-text"
                        value={getArrowIconColor()}
                        onChange={(e) => setArrowIconColor(e.target.value)}
                        style={{ width: 80 }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Visit Product - Price Badge Styling */}
            {ctaType === 'visit_product' && (
              <div className="section">
                <div className="section-title">Price Badge</div>

                <div className="control-row">
                  <span className="control-label">Background</span>
                  <div className="control-value">
                    <div className="color-picker-row">
                      <div
                        className="color-swatch"
                        style={{ backgroundColor: getPriceBadgeBg() }}
                      >
                        <input
                          type="color"
                          value={getPriceBadgeBg()}
                          onChange={(e) => setPriceBadgeBg(e.target.value)}
                        />
                      </div>
                      <input
                        type="text"
                        className="color-input-text"
                        value={getPriceBadgeBg()}
                        onChange={(e) => setPriceBadgeBg(e.target.value)}
                        style={{ width: 80 }}
                      />
                    </div>
                  </div>
                </div>

                <div className="control-row">
                  <span className="control-label">Badge Radius</span>
                  <div className="control-value">
                    <input
                      type="number"
                      className="position-input"
                      value={getPriceBadgeRadius()}
                      onChange={(e) => setPriceBadgeRadius(e.target.value)}
                      min={0}
                      max={24}
                    />
                    <span style={{ color: 'var(--sidebar-text-muted)', fontSize: 11 }}>px</span>
                  </div>
                </div>

                {getShowOriginalPrice() && (
                  <div className="control-row">
                    <span className="control-label">Strike Color</span>
                    <div className="control-value">
                      <div className="color-picker-row">
                        <div
                          className="color-swatch"
                          style={{ backgroundColor: getOriginalPriceColor() }}
                        >
                          <input
                            type="color"
                            value={getOriginalPriceColor()}
                            onChange={(e) => setOriginalPriceColor(e.target.value)}
                          />
                        </div>
                        <input
                          type="text"
                          className="color-input-text"
                          value={getOriginalPriceColor()}
                          onChange={(e) => setOriginalPriceColor(e.target.value)}
                          style={{ width: 80 }}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Buy Product - Description Styling */}
            {ctaType === 'buy_product' && (
              <div className="section">
                <div className="section-title">Description Style</div>

                <div className="control-row">
                  <span className="control-label">Text Color</span>
                  <div className="control-value">
                    <div className="color-picker-row">
                      <div
                        className="color-swatch"
                        style={{ backgroundColor: getDescriptionColor() }}
                      >
                        <input
                          type="color"
                          value={getDescriptionColor()}
                          onChange={(e) => setDescriptionColor(e.target.value)}
                        />
                      </div>
                      <input
                        type="text"
                        className="color-input-text"
                        value={getDescriptionColor()}
                        onChange={(e) => setDescriptionColor(e.target.value)}
                        style={{ width: 80 }}
                      />
                    </div>
                  </div>
                </div>

                <div className="control-row">
                  <span className="control-label">Font Size</span>
                  <div className="control-value">
                    <input
                      type="number"
                      className="position-input"
                      value={getDescriptionFontSize()}
                      onChange={(e) => setDescriptionFontSize(e.target.value)}
                      min={10}
                      max={24}
                    />
                    <span style={{ color: 'var(--sidebar-text-muted)', fontSize: 11 }}>px</span>
                  </div>
                </div>
              </div>
            )}

            {/* Buy Product - Button Styling */}
            {ctaType === 'buy_product' && (
              <div className="section">
                <div className="section-title">Button Style</div>

                <div className="control-row">
                  <span className="control-label">Background</span>
                  <div className="control-value">
                    <div className="color-picker-row">
                      <div
                        className="color-swatch"
                        style={{ backgroundColor: getButtonBgColor() }}
                      >
                        <input
                          type="color"
                          value={getButtonBgColor()}
                          onChange={(e) => setButtonBgColor(e.target.value)}
                        />
                      </div>
                      <input
                        type="text"
                        className="color-input-text"
                        value={getButtonBgColor()}
                        onChange={(e) => setButtonBgColor(e.target.value)}
                        style={{ width: 80 }}
                      />
                    </div>
                  </div>
                </div>

                <div className="control-row">
                  <span className="control-label">Text Color</span>
                  <div className="control-value">
                    <div className="color-picker-row">
                      <div
                        className="color-swatch"
                        style={{ backgroundColor: getButtonTextColor() }}
                      >
                        <input
                          type="color"
                          value={getButtonTextColor()}
                          onChange={(e) => setButtonTextColor(e.target.value)}
                        />
                      </div>
                      <input
                        type="text"
                        className="color-input-text"
                        value={getButtonTextColor()}
                        onChange={(e) => setButtonTextColor(e.target.value)}
                        style={{ width: 80 }}
                      />
                    </div>
                  </div>
                </div>

                <div className="control-row">
                  <span className="control-label">Font Size</span>
                  <div className="control-value">
                    <input
                      type="number"
                      className="position-input"
                      value={getButtonFontSize()}
                      onChange={(e) => setButtonFontSize(e.target.value)}
                      min={10}
                      max={24}
                    />
                    <span style={{ color: 'var(--sidebar-text-muted)', fontSize: 11 }}>px</span>
                  </div>
                </div>

                <div className="control-row">
                  <span className="control-label">Border Radius</span>
                  <div className="control-value">
                    <input
                      type="number"
                      className="position-input"
                      value={getButtonBorderRadius()}
                      onChange={(e) => setButtonBorderRadius(e.target.value)}
                      min={0}
                      max={24}
                    />
                    <span style={{ color: 'var(--sidebar-text-muted)', fontSize: 11 }}>px</span>
                  </div>
                </div>
              </div>
            )}

            {/* Buy Product - Image Size (when shown) */}
            {ctaType === 'buy_product' && getShowImage() && (
              <div className="section">
                <div className="section-title">Image Style</div>

                <div className="control-row">
                  <span className="control-label">Image Size</span>
                  <div className="control-value">
                    <input
                      type="number"
                      className="position-input"
                      value={getImageSize()}
                      onChange={(e) => setImageSize(e.target.value)}
                      min={60}
                      max={200}
                    />
                    <span style={{ color: 'var(--sidebar-text-muted)', fontSize: 11 }}>px</span>
                  </div>
                </div>

                <div className="control-row">
                  <span className="control-label">Image Radius</span>
                  <div className="control-value">
                    <input
                      type="number"
                      className="position-input"
                      value={getImageBorderRadius()}
                      onChange={(e) => setImageBorderRadius(e.target.value)}
                      min={0}
                      max={40}
                    />
                    <span style={{ color: 'var(--sidebar-text-muted)', fontSize: 11 }}>px</span>
                  </div>
                </div>
              </div>
            )}

            {/* Reset Button */}
            <button
              onClick={() => {
                const defaults = CTA_DEFAULTS[ctaType] || {};
                const newCustomData = { ...customData, ...defaults };
                element.set({ custom: newCustomData });
                regenerateSVG(newCustomData);
              }}
              style={{
                width: '100%',
                padding: '10px',
                background: 'transparent',
                border: '1px solid var(--border-primary)',
                borderRadius: '6px',
                color: 'var(--text-secondary)',
                fontSize: '12px',
                cursor: 'pointer',
                marginTop: '8px',
              }}
            >
              Reset to Default Styles
            </button>
          </>
        )}

        {/* ==================== ANIMATION TAB ==================== */}
        {activeTab === 'animation' && (
          <AnimationSection store={store} element={element} />
        )}
      </div>
    </div>
  );
});

export default CtaSettings;
