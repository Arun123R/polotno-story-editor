import React from 'react';

/**
 * Reaction Renderer Component
 * Renders a row of emoji reactions
 */
export const ReactionRenderer = ({ data, style, width, height }) => {
  const emojis = data?.emojis || ['😍', '🔥', '😂', '😮', '😢'];
  const showCount = data?.showCount || false;

  const containerStyle = {
    width: width || 280,
    height: height || 'auto',
    minHeight: 60,
    background: style?.bgColor || 'transparent',
    borderRadius: 12,
    padding: 12,
    display: 'flex',
    gap: 16,
    justifyContent: 'center',
    alignItems: 'center',
    boxSizing: 'border-box',
  };

  const emojiWrapperStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 4,
  };

  const emojiStyle = {
    fontSize: style?.emojiSize || 48,
    cursor: 'pointer',
    transition: 'transform 0.2s',
    filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))',
  };

  const countStyle = {
    fontSize: 11,
    color: 'rgba(255,255,255,0.7)',
    fontWeight: 600,
  };

  return (
    <div style={containerStyle}>
      {emojis.map((emoji, index) => (
        <div key={index} style={emojiWrapperStyle}>
          <span style={emojiStyle}>{emoji}</span>
          {showCount && <span style={countStyle}>0</span>}
        </div>
      ))}
    </div>
  );
};

export default ReactionRenderer;
