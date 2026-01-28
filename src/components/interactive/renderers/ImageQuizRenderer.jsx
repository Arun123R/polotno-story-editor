import React from 'react';

/**
 * Image Quiz Renderer Component
 * Renders a quiz with image-based options
 */
// Generate Image Quiz SVG
export const ImageQuizRenderer = ({ data, style, width, height }) => {
  const question = data?.question || 'Which one is correct?';
  const options = data?.options || [];
  const correctAnswerId = data?.correctAnswerId;
  const columns = data?.columns || 2;

  const containerStyle = {
    width: width || 300,
    height: height || 'auto',
    minHeight: 200,
    background: style?.containerBgColor || '#ffffff',
    borderRadius: style?.containerBorderRadius || 16,
    padding: style?.containerPadding || 20,
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    boxSizing: 'border-box',
  };

  const questionStyle = {
    color: style?.questionColor || '#1f2937',
    fontSize: style?.questionFontSize || 16,
    fontWeight: 700,
    textAlign: 'center',
    margin: 0,
    lineHeight: 1.2,
  };

  const gridStyle = {
    display: 'grid',
    gridTemplateColumns: `repeat(${columns}, 1fr)`,
    gap: 12,
    flex: 1,
  };

  const getOptionStyle = () => ({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 8,
    cursor: 'pointer',
  });

  const getImageStyle = (option) => ({
    width: '100%',
    aspectRatio: '1',
    borderRadius: style?.imageBorderRadius || 8,
    border: option.id === correctAnswerId
      ? `3px solid ${style?.correctBorderColor || '#10b981'}`
      : `1px solid ${style?.imageBorderColor || '#e5e7eb'}`,
    background: option.imageUrl ? 'transparent' : '#f3f4f6',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 32,
    color: '#9ca3af', // Camera icon color
    overflow: 'hidden',
    boxSizing: 'border-box',
    position: 'relative',
  });

  const labelStyle = {
    color: style?.labelColor || '#4b5563',
    fontSize: style?.labelFontSize || 12,
    fontWeight: 500,
    textAlign: 'center',
  };

  return (
    <div style={containerStyle}>
      <p style={questionStyle}>{question}</p>
      <div style={gridStyle}>
        {options.map((option, index) => (
          <div key={option.id || index} style={getOptionStyle(option)}>
            <div style={getImageStyle(option)}>
              {option.imageUrl ? (
                <img
                  src={option.imageUrl}
                  alt={option.label}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                '📷'
              )}
            </div>
            <span style={labelStyle}>
              {option.label}
              {option.id === correctAnswerId && (
                <span style={{ color: '#10b981', marginLeft: 4 }}>✓</span>
              )}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
export default ImageQuizRenderer;
