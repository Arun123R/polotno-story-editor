import { observer } from 'mobx-react-lite';
import { useState, useRef, useCallback } from 'react';
import { AnimationSection } from '../shared/CommonControls';
import { generateCtaSVG, CTA_DEFAULTS } from '../../side-panel/sections/CtaSection';

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

  // Get CTA type label
  const getCtaTypeLabel = () => {
    switch (ctaType) {
      case 'classic': return 'Classic CTA';
      case 'swipe_up': return 'Swipe-Up CTA';
      case 'image': return 'Image CTA';
      case 'product_card': return 'Product Card';
      default: return 'CTA';
    }
  };

  // Regenerate SVG when data changes
  const regenerateSVG = useCallback((newCustomData) => {
    if (isSvgElement) {
      const newSrc = generateCtaSVG(
        ctaType, 
        newCustomData, 
        element.width, 
        element.height
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
    const numValue = parseFloat(value) || 1;
    element.set({ width: numValue });
    if (isSvgElement) {
      setTimeout(() => regenerateSVG(customData), 0);
    }
  };

  const setHeight = (value) => {
    const numValue = parseFloat(value) || 1;
    element.set({ height: numValue });
    if (isSvgElement) {
      setTimeout(() => regenerateSVG(customData), 0);
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
    if (isSvgElement) {
      updateCustomData('fontSize', parseInt(value) || 14);
    } else if (isTextElement) {
      element.set({ fontSize: parseInt(value) || 14 });
    }
  };

  const setBorderRadius = (value) => {
    const radius = parseFloat(value) || 0;
    if (isSvgElement) {
      updateCustomData('borderRadius', radius);
    } else if (isTextElement) {
      element.set({ backgroundCornerRadius: radius });
    } else if (isImageElement) {
      element.set({ cornerRadius: radius });
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
    const width = parseInt(value) || 0;
    if (isSvgElement) {
      updateCustomData('borderWidth', width);
    } else if (isImageElement) {
      element.set({ strokeWidth: width });
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
    updateCustomData('arrowSize', parseInt(value) || 28);
  };

  const setArrowAnimation = (value) => {
    updateCustomData('arrowAnimation', value);
  };

  // Product Card specific setters
  const setProductTitle = (value) => {
    updateCustomData('title', value);
  };

  const setProductPrice = (value) => {
    updateCustomData('price', value);
  };

  const setButtonBgColor = (value) => {
    updateCustomData('buttonBgColor', value);
  };

  const setPriceBgColor = (value) => {
    updateCustomData('priceBgColor', value);
  };

  // Product Card advanced setters
  const setCardBgColor = (value) => {
    updateCustomData('cardBgColor', value);
  };

  const setButtonTextColor = (value) => {
    updateCustomData('buttonTextColor', value);
  };

  const setButtonFontSize = (value) => {
    updateCustomData('buttonFontSize', parseInt(value) || 16);
  };

  const setButtonFontWeight = (value) => {
    updateCustomData('buttonFontWeight', value);
  };

  const setButtonSize = (value) => {
    updateCustomData('buttonSize', parseInt(value) || 28);
  };

  const setButtonPositionX = (value) => {
    updateCustomData('buttonPositionX', parseInt(value) || 0);
  };

  const setButtonPositionY = (value) => {
    updateCustomData('buttonPositionY', parseInt(value) || 0);
  };

  const setPriceTextColor = (value) => {
    updateCustomData('priceTextColor', value);
  };

  const setPriceFontSize = (value) => {
    updateCustomData('priceFontSize', parseInt(value) || 11);
  };

  const setPriceFontWeight = (value) => {
    updateCustomData('priceFontWeight', value);
  };

  const setTitleColor = (value) => {
    updateCustomData('titleColor', value);
  };

  const setTitleFontSize = (value) => {
    updateCustomData('titleFontSize', parseInt(value) || 13);
  };

  const setTitleFontWeight = (value) => {
    updateCustomData('titleFontWeight', value);
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

  // Get current values with fallbacks
  const getText = () => customData.text || CTA_DEFAULTS[ctaType]?.text || 'Shop Now';
  const getBgColor = () => customData.bgColor || CTA_DEFAULTS[ctaType]?.bgColor || '#3b82f6';
  const getTextColor = () => customData.textColor || CTA_DEFAULTS[ctaType]?.textColor || '#ffffff';
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
      return element.stroke || customData.borderColor || CTA_DEFAULTS[ctaType]?.borderColor || '#ffffff';
    }
    return customData.borderColor || CTA_DEFAULTS[ctaType]?.borderColor || '#ffffff';
  };
  const getFontSize = () => customData.fontSize || CTA_DEFAULTS[ctaType]?.fontSize || 16;
  const getArrowColor = () => customData.arrowColor || CTA_DEFAULTS[ctaType]?.arrowColor || '#ffffff';
  const getArrowSize = () => customData.arrowSize || CTA_DEFAULTS[ctaType]?.arrowSize || 28;
  const getArrowAnimation = () => customData.arrowAnimation !== false;
  const getRedirectUrl = () => customData.redirectUrl || '';

  // Product Card specific getters
  const getProductTitle = () => customData.title || CTA_DEFAULTS.product_card?.title || '';
  const getProductPrice = () => customData.price || CTA_DEFAULTS.product_card?.price || '';
  const getButtonBgColor = () => customData.buttonBgColor || CTA_DEFAULTS.product_card?.buttonBgColor || '#3b82f6';
  const getPriceBgColor = () => customData.priceBgColor || CTA_DEFAULTS.product_card?.priceBgColor || '#10b981';
  const getCardBgColor = () => customData.cardBgColor || CTA_DEFAULTS.product_card?.cardBgColor || '#ffffff';
  const getButtonTextColor = () => customData.buttonTextColor || CTA_DEFAULTS.product_card?.buttonTextColor || '#ffffff';
  const getButtonFontSize = () => customData.buttonFontSize || CTA_DEFAULTS.product_card?.buttonFontSize || 16;
  const getButtonFontWeight = () => customData.buttonFontWeight || CTA_DEFAULTS.product_card?.buttonFontWeight || 'bold';
  const getButtonSize = () => customData.buttonSize || CTA_DEFAULTS.product_card?.buttonSize || 28;
  const getButtonPositionX = () => customData.buttonPositionX || 0;
  const getButtonPositionY = () => customData.buttonPositionY || 0;
  const getPriceTextColor = () => customData.priceTextColor || CTA_DEFAULTS.product_card?.priceTextColor || '#ffffff';
  const getPriceFontSize = () => customData.priceFontSize || CTA_DEFAULTS.product_card?.priceFontSize || 11;
  const getPriceFontWeight = () => customData.priceFontWeight || CTA_DEFAULTS.product_card?.priceFontWeight || 'bold';
  const getTitleColor = () => customData.titleColor || CTA_DEFAULTS.product_card?.titleColor || '#1f2937';
  const getTitleFontSize = () => customData.titleFontSize || CTA_DEFAULTS.product_card?.titleFontSize || 13;
  const getTitleFontWeight = () => customData.titleFontWeight || CTA_DEFAULTS.product_card?.titleFontWeight || '600';
  const getProductImageUrl = () => customData.imageUrl || '';

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

      <div className="settings-content" style={{ padding: '16px' }}>
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

              {/* Product Card Content */}
              {ctaType === 'product_card' && (
                <>
                  {/* Product Image Upload */}
                  <div className="control-row" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '6px', marginTop: '12px' }}>
                    <span className="control-label">Product Image</span>
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
                  </div>

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
                </>
              )}

              {/* Alt Text for Image CTA */}
              {ctaType === 'image' && (
                <div className="control-row" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '6px', marginTop: '12px' }}>
                  <span className="control-label">Alt Text</span>
                  <input
                    type="text"
                    value={customData.altText || ''}
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
                        value={Math.round(element.x || 0)}
                        onChange={(e) => element.set({ x: parseFloat(e.target.value) || 0 })}
                      />
                      <label>X</label>
                    </div>
                    <div className="position-field">
                      <input
                        type="number"
                        className="position-input"
                        value={Math.round(element.y || 0)}
                        onChange={(e) => element.set({ y: parseFloat(e.target.value) || 0 })}
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
                        value={Math.round(element.width || 0)}
                        onChange={(e) => setWidth(e.target.value)}
                      />
                      <label>W</label>
                    </div>
                    <div className="position-field">
                      <input
                        type="number"
                        className="position-input"
                        value={Math.round(element.height || 0)}
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
                    value={Math.round(element.rotation || 0)}
                    onChange={(e) => element.set({ rotation: parseFloat(e.target.value) || 0 })}
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
                      onChange={(e) => element.set({ opacity: (parseInt(e.target.value) || 0) / 100 })}
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

              {/* Product Card Colors */}
              {ctaType === 'product_card' && (
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
                </>
              )}
            </div>

            {/* Product Name Styling - for product_card */}
            {ctaType === 'product_card' && (
              <div className="section">
                <div className="section-title">Product Name Style</div>
                
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
                      min={8}
                      max={36}
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

            {/* Price Badge Styling - for product_card */}
            {ctaType === 'product_card' && (
              <div className="section">
                <div className="section-title">Price Badge Style</div>
                
                <div className="control-row">
                  <span className="control-label">Background</span>
                  <div className="control-value">
                    <div className="color-picker-row">
                      <div 
                        className="color-swatch" 
                        style={{ backgroundColor: getPriceBgColor() }}
                      >
                        <input
                          type="color"
                          value={getPriceBgColor()}
                          onChange={(e) => setPriceBgColor(e.target.value)}
                        />
                      </div>
                      <input
                        type="text"
                        className="color-input-text"
                        value={getPriceBgColor()}
                        onChange={(e) => setPriceBgColor(e.target.value)}
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
                        style={{ backgroundColor: getPriceTextColor() }}
                      >
                        <input
                          type="color"
                          value={getPriceTextColor()}
                          onChange={(e) => setPriceTextColor(e.target.value)}
                        />
                      </div>
                      <input
                        type="text"
                        className="color-input-text"
                        value={getPriceTextColor()}
                        onChange={(e) => setPriceTextColor(e.target.value)}
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
                      min={8}
                      max={24}
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
                      <option value="bold">Bold</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Button Styling - for product_card */}
            {ctaType === 'product_card' && (
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
                  <span className="control-label">Button Size</span>
                  <div className="control-value">
                    <input
                      type="number"
                      className="position-input"
                      value={getButtonSize()}
                      onChange={(e) => setButtonSize(e.target.value)}
                      min={20}
                      max={60}
                    />
                    <span style={{ color: 'var(--sidebar-text-muted)', fontSize: 11 }}>px</span>
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
                      min={8}
                      max={32}
                    />
                    <span style={{ color: 'var(--sidebar-text-muted)', fontSize: 11 }}>px</span>
                  </div>
                </div>

                <div className="control-row">
                  <span className="control-label">Font Weight</span>
                  <div className="control-value">
                    <select
                      value={getButtonFontWeight()}
                      onChange={(e) => setButtonFontWeight(e.target.value)}
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
                      <option value="bold">Bold</option>
                    </select>
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
                          value={getButtonPositionX()}
                          onChange={(e) => setButtonPositionX(e.target.value)}
                        />
                        <label>X</label>
                      </div>
                      <div className="position-field">
                        <input
                          type="number"
                          className="position-input"
                          value={getButtonPositionY()}
                          onChange={(e) => setButtonPositionY(e.target.value)}
                        />
                        <label>Y</label>
                      </div>
                    </div>
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
