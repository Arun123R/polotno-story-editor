import React from 'react';

/**
 * Rating Renderer Component
 * Renders a rating widget with stars or emojis
 */
export const RatingRenderer = ({ data, style, width, height }) => {
  const title = data?.title || 'Rate this!';
  const maxRating = data?.maxRating || 5;
  const currentRating = data?.currentRating || 0;
  const ratingType = data?.type || 'star';
  const emoji = data?.emoji || '⭐';

  const containerStyle = {
    width: width || 260,
    height: height || 'auto',
    minHeight: 80,
    background: style?.containerBgColor || 'rgba(0,0,0,0.5)',
    borderRadius: style?.containerBorderRadius || 12,
    padding: style?.containerPadding || 16,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 12,
    backdropFilter: 'blur(10px)',
    boxSizing: 'border-box',
  };

  const titleStyle = {
    color: style?.titleColor || '#ffffff',
    fontSize: style?.titleFontSize || 14,
    fontWeight: 600,
    textAlign: 'center',
    margin: 0,
  };

  const starsContainerStyle = {
    display: 'flex',
    gap: 8,
    justifyContent: 'center',
  };

  const starStyle = (index) => ({
    fontSize: style?.emojiSize || 32,
    cursor: 'pointer',
    transition: 'all 0.2s',
    filter: index < currentRating ? 'none' : 'grayscale(1) opacity(0.4)',
    transform: index < currentRating ? 'scale(1.1)' : 'scale(1)',
  });

  const renderStars = () => {
    const stars = [];
    for (let i = 0; i < maxRating; i++) {
      stars.push(
        <span key={i} style={starStyle(i)}>
          {ratingType === 'star' ? '⭐' : emoji}
        </span>
      );
    }
    return stars;
  };

  return (
    <div style={containerStyle}>
      <p style={titleStyle}>{title}</p>
      <div style={starsContainerStyle}>
        {renderStars()}
      </div>
    </div>
  );
};

export default RatingRenderer;
