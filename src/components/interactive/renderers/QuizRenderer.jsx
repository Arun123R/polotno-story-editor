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
    fontSize: style?.questionFontSize || 18,
    fontWeight: 700,
    textAlign: 'left',
    margin: 0,
    lineHeight: 1.2,
    marginLeft: 4,
  };

  const optionsContainerStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: 12, // More gap
    flex: 1,
  };

  // Letter circle style helper
  const renderCircle = (index) => {
    const letter = String.fromCharCode(65 + index);
    return (
      <div style={{
        width: 24,
        height: 24,
        borderRadius: '50%',
        background: '#e5e7eb', // Light gray background
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 11,
        fontWeight: 700,
        marginRight: 12,
        flexShrink: 0,
        color: '#1f2937', // Dark text
        opacity: 0.8,
      }}>
        {letter}
      </div>
    );
  };

  const getOptionStyle = (option) => ({
    background: style?.optionBgColor || '#f9fafb',
    borderRadius: 30, // Pill shape
    padding: '8px 12px',
    color: style?.optionTextColor || '#1f2937',
    fontSize: style?.optionFontSize || 14,
    fontWeight: 500,
    cursor: 'pointer',
    textAlign: 'left',
    display: 'flex',
    alignItems: 'center',
    border: option.id === correctAnswerId
      ? `2px solid ${style?.correctColor || '#10b981'}`
      : '2px solid transparent', // Or no border by default if desired
    transition: 'all 0.2s',
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
            {renderCircle(index)}
            <span style={{ flex: 1 }}>{option.text}</span>
            {option.id === correctAnswerId && (
              <span style={{ marginLeft: 8, color: '#10b981' }}>✓</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
export default QuizRenderer;
