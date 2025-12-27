import React from 'react';

/**
 * Poll Renderer Component
 * Renders a poll with question and clickable options
 */
export const PollRenderer = ({ data, style, width, height }) => {
  const options = data?.options || [];
  const question = data?.question || 'What do you prefer?';
  const showResults = data?.showResults || false;
  const totalVotes = options.reduce((sum, opt) => sum + (opt.votes || 0), 0);

  const containerStyle = {
    width: width || 280,
    height: height || 'auto',
    minHeight: 160,
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

  const optionsContainerStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
    flex: 1,
  };

  const optionStyle = {
    background: style?.optionBgColor || 'rgba(255,255,255,0.2)',
    borderRadius: style?.optionBorderRadius || 8,
    padding: '10px 14px',
    color: style?.optionTextColor || '#ffffff',
    fontSize: style?.optionFontSize || 14,
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'all 0.2s',
    position: 'relative',
    overflow: 'hidden',
    textAlign: 'center',
  };

  const resultBarStyle = (percentage) => ({
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: `${percentage}%`,
    background: style?.resultBarColor || '#F97316',
    opacity: 0.3,
    borderRadius: style?.optionBorderRadius || 8,
    transition: 'width 0.3s ease',
  });

  return (
    <div style={containerStyle}>
      <p style={questionStyle}>{question}</p>
      <div style={optionsContainerStyle}>
        {options.map((option, index) => {
          const percentage = totalVotes > 0 
            ? Math.round((option.votes || 0) / totalVotes * 100) 
            : 0;
          
          return (
            <div 
              key={option.id || index} 
              style={optionStyle}
            >
              {showResults && <div style={resultBarStyle(percentage)} />}
              <span style={{ position: 'relative', zIndex: 1 }}>
                {option.text}
                {showResults && <span style={{ marginLeft: 8, opacity: 0.7 }}>{percentage}%</span>}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PollRenderer;
