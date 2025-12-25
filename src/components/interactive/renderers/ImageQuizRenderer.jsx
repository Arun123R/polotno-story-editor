import React from 'react';

/**
 * Image Quiz Renderer Component
 * Renders a quiz with image-based options
 */
export const ImageQuizRenderer = ({ data, style, width, height }) => {
  const question = data?.question || 'Which one is correct?';
  const options = data?.options || [];
  const correctAnswerId = data?.correctAnswerId;
  const columns = data?.columns || 2;

  const containerStyle = {
    width: width || 300,
    height: height || 'auto',
    minHeight: 200,
    background: style?.containerBgColor || 'rgba(0,0,0,0.5)',
    borderRadius: style?.containerBorderRadius || 12,
    padding: style?.containerPadding || 16,
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
    backdropFilter: 'blur(10px)',
    boxSizing: 'border-box',
  };

  const questionStyle = {
    color: style?.questionColor || '#ffffff',
    fontSize: style?.questionFontSize || 16,
    fontWeight: 600,
    textAlign: 'center',
    margin: 0,
  };

  const gridStyle = {
    display: 'grid',
    gridTemplateColumns: `repeat(${columns}, 1fr)`,
    gap: 10,
    flex: 1,
  };

  const getOptionStyle = (option) => ({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 6,
    cursor: 'pointer',
    transition: 'all 0.2s',
  });

  const getImageStyle = (option) => ({
    width: '100%',
    aspectRatio: '1',
    borderRadius: style?.imageBorderRadius || 8,
    border: option.id === correctAnswerId 
      ? `3px solid ${style?.correctBorderColor || '#10b981'}`
      : `2px solid ${style?.imageBorderColor || 'rgba(255,255,255,0.3)'}`,
    background: option.imageUrl ? 'transparent' : 'rgba(255,255,255,0.1)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 32,
    color: 'rgba(255,255,255,0.3)',
    overflow: 'hidden',
    boxSizing: 'border-box',
  });

  const labelStyle = {
    color: style?.labelColor || '#ffffff',
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
                '🖼️'
              )}
            </div>
            <span style={labelStyle}>
              {option.label}
              {option.id === correctAnswerId && ' ✓'}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ImageQuizRenderer;
