import React from 'react';

/**
 * Quiz Renderer Component
 * Renders a quiz with question and answer options
 */
export const QuizRenderer = ({ data, style, width, height }) => {
  const options = data?.options || [];
  const question = data?.question || 'What is the answer?';
  const correctAnswerId = data?.correctAnswerId;

  const containerStyle = {
    width: width || 280,
    height: height || 'auto',
    minHeight: 180,
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

  const getOptionStyle = (option) => ({
    background: style?.optionBgColor || 'rgba(255,255,255,0.2)',
    borderRadius: style?.optionBorderRadius || 8,
    padding: '10px 14px',
    color: style?.optionTextColor || '#ffffff',
    fontSize: style?.optionFontSize || 14,
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'all 0.2s',
    textAlign: 'center',
    border: option.id === correctAnswerId 
      ? `2px solid ${style?.correctColor || '#10b981'}` 
      : '2px solid transparent',
  });

  return (
    <div style={containerStyle}>
      <p style={questionStyle}>{question}</p>
      <div style={optionsContainerStyle}>
        {options.map((option, index) => (
          <div 
            key={option.id || index} 
            style={getOptionStyle(option)}
          >
            {option.text}
            {option.id === correctAnswerId && (
              <span style={{ marginLeft: 8 }}>✓</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default QuizRenderer;
