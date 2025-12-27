import React from 'react';

/**
 * Question Renderer Component
 * Renders a question input box for collecting user responses
 */
export const QuestionRenderer = ({ data, style, width, height }) => {
  const title = data?.title || 'Ask me anything';
  const placeholder = data?.placeholder || 'Type your answer...';
  const allowAnonymous = data?.allowAnonymous !== false;

  const containerStyle = {
    width: width || 280,
    height: height || 'auto',
    minHeight: 140,
    background: style?.containerBgColor || 'rgba(0,0,0,0.5)',
    borderRadius: style?.containerBorderRadius || 12,
    padding: style?.containerPadding || 16,
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
    backdropFilter: 'blur(10px)',
    boxSizing: 'border-box',
  };

  const titleStyle = {
    color: style?.titleColor || '#ffffff',
    fontSize: style?.titleFontSize || 16,
    fontWeight: 600,
    textAlign: 'center',
    margin: 0,
  };

  const inputStyle = {
    width: '100%',
    padding: '14px 16px',
    background: style?.inputBgColor || 'rgba(255,255,255,0.15)',
    border: 'none',
    borderRadius: style?.inputBorderRadius || 8,
    color: style?.inputTextColor || '#ffffff',
    fontSize: style?.inputFontSize || 14,
    outline: 'none',
    boxSizing: 'border-box',
  };

  const submitButtonStyle = {
    width: '100%',
    padding: '12px 16px',
    background: style?.submitBgColor || '#F97316',
    color: style?.submitTextColor || '#000000',
    border: 'none',
    borderRadius: 8,
    fontSize: 14,
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.2s',
  };

  const anonymousStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    fontSize: 11,
    color: 'rgba(255,255,255,0.6)',
    justifyContent: 'center',
  };

  return (
    <div style={containerStyle}>
      <p style={titleStyle}>{title}</p>
      <input 
        type="text" 
        placeholder={placeholder}
        style={inputStyle}
        readOnly
      />
      <button style={submitButtonStyle}>Submit</button>
      {allowAnonymous && (
        <div style={anonymousStyle}>
          <span>🔒</span>
          <span>Anonymous responses</span>
        </div>
      )}
    </div>
  );
};

export default QuestionRenderer;
