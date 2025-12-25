import React from 'react';

/**
 * Promo Code Renderer Component
 * Renders a promotional coupon code with copy button
 */
export const PromoRenderer = ({ data, style, width, height }) => {
  const title = data?.title || 'Special Offer';
  const couponCode = data?.couponCode || 'SAVE20';
  const description = data?.description || '';
  const showCopyButton = data?.showCopyButton !== false;
  const dashedBorder = data?.dashedBorder !== false;

  const containerStyle = {
    width: width || 280,
    height: height || 'auto',
    minHeight: 140,
    background: style?.containerBgColor || 'rgba(0,0,0,0.6)',
    borderRadius: style?.containerBorderRadius || 12,
    padding: style?.containerPadding || 20,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 12,
    backdropFilter: 'blur(10px)',
    boxSizing: 'border-box',
    border: dashedBorder ? `2px dashed ${style?.borderColor || 'rgba(255,255,255,0.3)'}` : 'none',
  };

  const titleStyle = {
    color: style?.titleColor || '#ffffff',
    fontSize: style?.titleFontSize || 14,
    fontWeight: 600,
    margin: 0,
  };

  const codeContainerStyle = {
    background: style?.codeBgColor || 'rgba(255,255,255,0.15)',
    borderRadius: 8,
    padding: '12px 24px',
    display: 'flex',
    alignItems: 'center',
    gap: 12,
  };

  const codeStyle = {
    color: style?.codeColor || '#ffffff',
    fontSize: style?.codeFontSize || 24,
    fontWeight: 700,
    letterSpacing: 3,
    fontFamily: 'monospace',
  };

  const copyButtonStyle = {
    background: style?.buttonBgColor || '#00d4aa',
    color: style?.buttonTextColor || '#000000',
    border: 'none',
    borderRadius: 6,
    padding: '8px 16px',
    fontSize: 12,
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.2s',
  };

  const descriptionStyle = {
    color: style?.descriptionColor || 'rgba(255,255,255,0.8)',
    fontSize: style?.descriptionFontSize || 12,
    textAlign: 'center',
    margin: 0,
  };

  return (
    <div style={containerStyle}>
      <p style={titleStyle}>{title}</p>
      <div style={codeContainerStyle}>
        <span style={codeStyle}>{couponCode}</span>
        {showCopyButton && (
          <button style={copyButtonStyle}>Copy</button>
        )}
      </div>
      {description && <p style={descriptionStyle}>{description}</p>}
    </div>
  );
};

export default PromoRenderer;
