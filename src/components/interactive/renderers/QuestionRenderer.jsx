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
    height: height || 160,
    background: style?.containerBgColor || '#ffffff',
    borderRadius: style?.containerBorderRadius || 16,
    padding: style?.containerPadding || 20,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    boxSizing: 'border-box',
  };

  const titleStyle = {
    color: style?.titleColor || '#1f2937',
    fontSize: style?.titleFontSize || 20,
    fontWeight: 700,
    textAlign: 'center',
    margin: 0,
    lineHeight: 1.2,
  };

  const inputContainerStyle = {
    width: '100%',
    background: style?.inputBgColor || '#f3f4f6',
    borderRadius: style?.inputBorderRadius || 12,
    padding: '12px 16px',
    boxSizing: 'border-box',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  };

  const inputStyle = {
    width: '100%',
    background: 'transparent',
    border: 'none',
    color: style?.inputTextColor || '#1f2937',
    fontSize: style?.inputFontSize || 14,
    textAlign: 'center',
    outline: 'none',
  };

  const anonymousStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    fontSize: 11,
    color: '#9ca3af',
    justifyContent: 'center',
    marginTop: 8,
  };

  return (
    <div style={containerStyle}>
      <p style={titleStyle}>{title}</p>

      <div style={inputContainerStyle}>
        <input
          type="text"
          placeholder={placeholder}
          disabled
          style={inputStyle}
          readOnly
        />
      </div>

      {allowAnonymous && (
        <div style={anonymousStyle}>
          <span style={{ fontSize: 10 }}>🔒</span>
          <span>Anonymous responses</span>
        </div>
      )}
    </div>
  );
};

export default QuestionRenderer;
