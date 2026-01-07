import React from 'react';
import { observer } from 'mobx-react-lite';
import { SectionTab } from 'polotno/side-panel';
import {
  createInteractiveData,
  INTERACTIVE_DIMENSIONS,
  getInteractiveTypeLabel,
  getInteractiveTypeIcon,
  INTERACTIVE_STYLES,
} from '../../interactive/schemas';

/* ================= STYLES ================= */

// Generate SVG preview for interactive elements
const generateInteractiveSVG = (type, data, style, dimensions) => {
  const { width, height } = dimensions;

  if (type === 'rating') {
    return generateRatingSVG(data, style, width, height);
  }

  if (type === 'poll') {
    return generatePollSVG(data, style, width, height);
  }

  if (type === 'quiz') {
    return generateQuizSVG(data, style, width, height);
  }

  if (type === 'reaction') {
    return generateReactionSVG(data, style, width, height);
  }

  if (type === 'countdown') {
    return generateCountdownSVG(data, style, width, height);
  }

  if (type === 'promo') {
    return generatePromoSVG(data, style, width, height);
  }

  if (type === 'question') {
    return generateQuestionSVG(data, style, width, height);
  }

  if (type === 'imageQuiz') {
    return generateImageQuizSVG(data, style, width, height);
  }

  // Default fallback for other types
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(`
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="${width}" height="${height}" fill="#667eea" rx="12"/>
      <text x="${width / 2}" y="${height / 2}" font-family="Arial" font-size="16" fill="white" text-anchor="middle" dominant-baseline="middle">${type}</text>
    </svg>
  `)}`;
};

// Generate Poll SVG
const generatePollSVG = (data, style, width, height) => {
  const question = data?.question || 'Are you excited for the grand sale?';
  const options = data?.options || [{ id: '1', label: 'YES' }, { id: '2', label: 'NO' }];
  const layout = data?.layout || 'horizontal'; // 'horizontal' or 'vertical'

  // Use style properties
  const bgColor = style?.containerBgColor || '#ffffff';
  const questionColor = style?.questionColor || '#1f2937';
  const buttonBg = style?.optionBgColor || '#ffffff';
  const buttonBorder = '#e5e7eb';
  const buttonTextColor = style?.optionTextColor || '#1f2937';
  const questionFontSize = style?.questionFontSize || 9;
  const optionFontSize = style?.optionFontSize || 9;

  const padding = 16;
  const questionY = padding + 12;
  const buttonHeight = 26;
  const buttonGap = 6;

  let optionsSVG = '';

  if (layout === 'horizontal') {
    // Horizontal layout - 2 columns
    const buttonsPerRow = 2;
    const buttonWidth = (width - padding * 2 - buttonGap) / buttonsPerRow;
    let buttonY = padding + 32;

    options.forEach((opt, i) => {
      const col = i % buttonsPerRow;
      const row = Math.floor(i / buttonsPerRow);
      const x = padding + col * (buttonWidth + buttonGap);
      const y = buttonY + row * (buttonHeight + buttonGap);

      optionsSVG += `
        <rect x="${x}" y="${y}" width="${buttonWidth}" height="${buttonHeight}" rx="8" fill="${buttonBg}" stroke="${buttonBorder}" stroke-width="1"/>
        <text x="${x + buttonWidth / 2}" y="${y + buttonHeight / 2 + 4}" text-anchor="middle" fill="${buttonTextColor}" font-size="${optionFontSize}" font-weight="600">${opt.label || opt.text || 'Option'}</text>
      `;
    });
  } else {
    // Vertical layout - full width
    const buttonWidth = width - padding * 2;
    let buttonY = padding + 32;

    options.forEach((opt, i) => {
      const y = buttonY + i * (buttonHeight + buttonGap);

      optionsSVG += `
        <rect x="${padding}" y="${y}" width="${buttonWidth}" height="${buttonHeight}" rx="8" fill="${buttonBg}" stroke="${buttonBorder}" stroke-width="1"/>
        <text x="${width / 2}" y="${y + buttonHeight / 2 + 4}" text-anchor="middle" fill="${buttonTextColor}" font-size="${optionFontSize}" font-weight="600">${opt.label || opt.text || 'Option'}</text>
      `;
    });
  }

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(`
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <!-- Main background -->
      <rect width="${width}" height="${height}" fill="${bgColor}" rx="12"/>
      
      <!-- Question with text wrapping -->
      <foreignObject x="${padding}" y="${padding}" width="${width - padding * 2}" height="40">
        <div xmlns="http://www.w3.org/1999/xhtml" style="
          color: ${questionColor};
          font-size: ${questionFontSize}px;
          font-weight: 600;
          text-align: center;
          word-wrap: break-word;
          overflow-wrap: break-word;
          line-height: 1.3;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
        ">${question}</div>
      </foreignObject>
      
      <!-- Options -->
      ${optionsSVG}
    </svg>
  `)}`;
};

// Generate Rating SVG
const generateRatingSVG = (data, style, width, height) => {
  const padding = 8;
  const cardW = width - padding * 2;
  const cardH = height - padding * 2;
  const textY = padding + 18;
  const sliderY = padding + 38;
  const sliderW = cardW - 24;
  const sliderX = padding + 12;
  const title = data?.title || 'Do you like my eyes?';
  const emoji = data?.emoji || '😺';
  const maxRating = data?.maxRating || 5;
  const currentRating = data?.currentRating || 3;
  const fillPercent = Math.min(1, currentRating / maxRating);
  const fillW = sliderW * fillPercent;
  const cardBg = style?.cardBgColor || '#ffffff';
  const titleColor = style?.titleColor || '#000000';
  const titleFontSize = style?.titleFontSize || 12;
  const emojiSize = style?.emojiSize || 18;

  const gradId = 'grad' + Math.random().toString(36).substr(2, 9);
  const svgContent = `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="${gradId}" x1="0" x2="1" y1="0" y2="0">
        <stop offset="0%" stop-color="#d946ef"/>
        <stop offset="50%" stop-color="#f43f5e"/>
        <stop offset="100%" stop-color="#fb923c"/>
      </linearGradient>
    </defs>
    <rect x="${padding}" y="${padding}" width="${cardW}" height="${cardH}" fill="${cardBg}" rx="12"/>
    <text x="${width / 2}" y="${textY}" text-anchor="middle" font-family="-apple-system,BlinkMacSystemFont,sans-serif" font-size="${titleFontSize}" font-weight="600" fill="${titleColor}">
      ${title}
    </text>
    <rect x="${sliderX}" y="${sliderY}" width="${sliderW}" height="8" rx="4" fill="#e5e7eb"/>
    <rect x="${sliderX}" y="${sliderY}" width="${fillW}" height="8" rx="4" fill="url(#${gradId})"/>
    <text x="${sliderX + fillW}" y="${sliderY + 14}" text-anchor="middle" font-size="${emojiSize}">${emoji}</text>
  </svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgContent)}`;
};

// Generate Quiz SVG
const generateQuizSVG = (data, style, width, height) => {
  const question = data?.question || 'What is the largest...';
  const options = data?.options || [{ id: '1', text: 'Option 1' }, { id: '2', text: 'Option 2' }];

  const bgColor = style?.containerBgColor || '#ffffff';
  const questionColor = style?.questionColor || '#1f2937';
  const optionBg = style?.optionBgColor || '#f9fafb';
  const optionBorder = '#e5e7eb';
  const optionTextColor = style?.optionTextColor || '#374151';
  const letterBg = '#f3f4f6';
  const letterColor = '#6b7280';
  const questionFontSize = style?.questionFontSize || 10;
  const optionFontSize = style?.optionFontSize || 10;
  const padding = style?.containerPadding || 12;
  const borderRadius = style?.optionBorderRadius || 4;

  const questionY = padding + 10;
  const optionStartY = padding + 30;
  const optionHeight = 20;
  const optionGap = 6;

  let optionsSVG = '';
  options.forEach((option, idx) => {
    const y = optionStartY + idx * (optionHeight + optionGap);
    const letter = String.fromCharCode(65 + idx); // A, B, C...

    optionsSVG += `
      <rect x="${padding}" y="${y}" width="${width - padding * 2}" height="${optionHeight}" fill="${optionBg}" stroke="${optionBorder}" stroke-width="1" rx="${borderRadius}"/>
      <circle cx="${padding + 10}" cy="${y + 10}" r="6" fill="${letterBg}" stroke="${optionBorder}" stroke-width="1"/>
      <text x="${padding + 10}" y="${y + 10}" font-family="Arial, sans-serif" font-size="9" font-weight="600" fill="${letterColor}" text-anchor="middle" dominant-baseline="middle">${letter}</text>
      <text x="${padding + 24}" y="${y + 10}" font-family="Arial, sans-serif" font-size="${optionFontSize}" font-weight="500" fill="${optionTextColor}" dominant-baseline="middle">${option.text || option.label || 'Option'}</text>
    `;
  });

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(`
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="${width}" height="${height}" fill="${bgColor}" rx="12"/>
      
      <!-- Question -->
      <text x="${padding}" y="${questionY}" font-family="Arial, sans-serif" font-size="${questionFontSize}" font-weight="600" fill="${questionColor}">${question}</text>
      
      <!-- Options -->
      ${optionsSVG}
    </svg>
  `)}`;
};

// Generate Reaction SVG
const generateReactionSVG = (data, style, width, height) => {
  const emojis = data?.emojis || ['👍', '👎'];
  const showCount = data?.showCount || false;
  const transparentBg = style?.transparentBg || data?.transparentBg || false;
  const bgColor = style?.containerBgColor || '#ffffff';
  const buttonBg = '#f9fafb';
  const buttonBorder = '#e5e7eb';

  const padding = 12;
  const buttonCount = emojis.length;
  const buttonGap = 8;

  // Calculate button dimensions - if showing count, buttons are taller (vertical pills)
  const buttonWidth = Math.min(50, (width - padding * 2 - (buttonCount - 1) * buttonGap) / buttonCount);
  const buttonHeight = showCount ? Math.min(65, height - padding * 2) : buttonWidth;
  const buttonY = (height - buttonHeight) / 2;
  const totalWidth = buttonCount * buttonWidth + (buttonCount - 1) * buttonGap;
  const startX = (width - totalWidth) / 2;

  let buttonsSVG = '';
  emojis.forEach((emoji, idx) => {
    const x = startX + idx * (buttonWidth + buttonGap);

    if (showCount) {
      // Tall pill shape with emoji and count
      buttonsSVG += `
        <rect x="${x}" y="${buttonY}" width="${buttonWidth}" height="${buttonHeight}" rx="${buttonWidth / 2}" fill="${buttonBg}" stroke="${buttonBorder}" stroke-width="1"/>
        <text x="${x + buttonWidth / 2}" y="${buttonY + buttonHeight * 0.35}" text-anchor="middle" font-size="${buttonWidth * 0.5}" dominant-baseline="middle">${emoji}</text>
        <text x="${x + buttonWidth / 2}" y="${buttonY + buttonHeight * 0.75}" text-anchor="middle" font-family="Arial, sans-serif" font-size="${buttonWidth * 0.35}" font-weight="600" fill="#000000" dominant-baseline="middle">2k</text>
      `;
    } else {
      // Standard circle shape
      buttonsSVG += `
        <circle cx="${x + buttonWidth / 2}" cy="${buttonY + buttonWidth / 2}" r="${buttonWidth / 2}" fill="${buttonBg}" stroke="${buttonBorder}" stroke-width="1"/>
        <text x="${x + buttonWidth / 2}" y="${buttonY + buttonWidth / 2 + buttonWidth * 0.05}" text-anchor="middle" font-size="${buttonWidth * 0.6}" dominant-baseline="middle">${emoji}</text>
      `;
    }
  });

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(`
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <!-- Background -->
      ${transparentBg ? '' : `<rect width="${width}" height="${height}" fill="${bgColor}" rx="12"/>`}
      
      <!-- Emoji buttons -->
      ${buttonsSVG}
    </svg>
  `)}`;
};

// Generate Countdown SVG
const generateCountdownSVG = (data, style, width, height) => {
  const title = data?.title || 'Ends In';
  const containerBg = style?.containerBgColor || '#ffffff';
  const textColor = style?.titleColor || '#000000';

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(`
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="${width}" height="${height}" fill="${containerBg}" rx="12"/>
      
      <text x="${width / 2}" y="30" font-family="Arial, sans-serif" font-size="14" font-weight="600" fill="${textColor}" text-anchor="middle">${title}</text>
      
      <!-- Time Display -->
      <text x="${width / 2}" y="${height / 2 + 10}" font-family="Arial, sans-serif" font-size="32" font-weight="700" fill="${textColor}" text-anchor="middle">00:00:00</text>
      <text x="${width / 2}" y="${height / 2 + 30}" font-family="Arial, sans-serif" font-size="10" fill="#9ca3af" text-anchor="middle">days : hours : minutes</text>
    </svg>
  `)}`;
};

// Generate Promo SVG  
const generatePromoSVG = (data, style, width, height) => {
  const title = data?.title || 'Special Offer';
  const code = data?.code || 'SAVE20';
  const containerBg = style?.containerBgColor || '#ffffff';
  const titleColor = style?.titleColor || '#000000';
  const codeColor = style?.codeColor || '#f97316';

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(`
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="${width}" height="${height}" fill="${containerBg}" rx="12"/>
      
      <text x="${width / 2}" y="30" font-family="Arial, sans-serif" font-size="14" font-weight="600" fill="${titleColor}" text-anchor="middle">${title}</text>
      
      <!-- Code Box -->
      <rect x="20" y="45" width="${width - 40}" height="45" fill="#fef3c7" rx="8" stroke="#fb923c" stroke-width="2" stroke-dasharray="5,3"/>
      <text x="${width / 2}" y="72" font-family="Arial, sans-serif" font-size="20" font-weight="700" fill="${codeColor}" text-anchor="middle">${code}</text>
    </svg>
  `)}`;
};

// Generate Question SVG
const generateQuestionSVG = (data, style, width, height) => {
  const question = data?.question || 'Ask me anything!';
  const containerBg = style?.containerBgColor || 'rgba(0,0,0,0.6)';
  const textColor = style?.questionColor || '#ffffff';

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(`
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="${width}" height="${height}" fill="${containerBg}" rx="12"/>
      
      <text x="${width / 2}" y="${height / 2 - 10}" font-family="Arial, sans-serif" font-size="16" font-weight="600" fill="${textColor}" text-anchor="middle">${question}</text>
      <text x="${width / 2}" y="${height / 2 + 15}" font-family="Arial, sans-serif" font-size="12" fill="rgba(255,255,255,0.7)" text-anchor="middle">Tap to ask</text>
    </svg>
  `)}`;
};

// Generate Image Quiz SVG
const generateImageQuizSVG = (data, style, width, height) => {
  const question = data?.question || 'Which one?';
  const containerBg = style?.containerBgColor || 'rgba(0,0,0,0.6)';
  const textColor = style?.questionColor || '#ffffff';

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(`
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="${width}" height="${height}" fill="${containerBg}" rx="12"/>
      
      <text x="${width / 2}" y="30" font-family="Arial, sans-serif" font-size="14" font-weight="600" fill="${textColor}" text-anchor="middle">${question}</text>
      
      <!-- Image Placeholders -->
      <rect x="20" y="50" width="${(width - 52) / 2}" height="${(width - 52) / 2}" fill="rgba(255,255,255,0.1)" rx="8" stroke="rgba(255,255,255,0.3)" stroke-width="2"/>
      <rect x="${32 + (width - 52) / 2}" y="50" width="${(width - 52) / 2}" height="${(width - 52) / 2}" fill="rgba(255,255,255,0.1)" rx="8" stroke="rgba(255,255,255,0.3)" stroke-width="2"/>
    </svg>
  `)}`;
};

// Inject CSS once to ensure black text on rating card
if (typeof document !== 'undefined' && !document.getElementById('rating-question-styles')) {
  const style = document.createElement('style');
  style.id = 'rating-question-styles';
  style.textContent = `
    .rating-question-text {
      color: #000000 !important;
    }
    .poll-question-text {
      color: #000000 !important;
    }
    .poll-option-text {
      color: #374151 !important;
      font-weight: 700 !important;
    }
    .bp5-dark .poll-option-text {
      color: #374151 !important;
    }
    button .poll-option-text,
    .polotno-panel-container button .poll-option-text {
      color: #374151 !important;
    }
  `;
  document.head.appendChild(style);
}

/* ================= TAB ================= */

const InteractiveIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor" stroke="none">
    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
  </svg>
);

export const InteractiveSectionTab = (props) => (
  <SectionTab name="Interactive" {...props}>
    <div className="flex justify-center items-center">
      <InteractiveIcon />
    </div>
  </SectionTab>
);

/* ================= BUTTON STYLES ================= */

const buttonStyles = {
  poll: { bg: '#f8f9fa', icon: '📊' },
  quiz: { bg: '#f8f9fa', icon: '❓' },
  rating: { bg: '#f8f9fa', icon: null },
  reaction: { bg: '#f8f9fa', icon: '😍' },
  countdown: { bg: '#f8f9fa', icon: '⏱️' },
  promo: { bg: '#f8f9fa', icon: '🎟️' },
  question: { bg: '#f8f9fa', icon: '💬' },
  imageQuiz: { bg: '#f8f9fa', icon: '🖼️' },
};

/* ================= INTERACTION BUTTON ================= */

const InteractionButton = ({ type, onClick }) => {
  const styleConfig = buttonStyles[type];
  const label = getInteractiveTypeLabel(type);

  return (
    <button
      onClick={onClick}
      style={{
        height: 110,
        border: 'none',
        borderRadius: 12,
        background: styleConfig.bg,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        cursor: 'pointer',
        transition: 'all 0.2s',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = '0 6px 16px rgba(0,0,0,0.2)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
      }}
    >
      {type === 'rating' ? (
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, color: 'inherit' }}>
          <div style={{ width: '100%', height: 75, borderRadius: 12, background: '#ffffff', border: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 10, boxSizing: 'border-box' }}>
            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 6 }}>
              <div style={{ fontSize: 10, fontWeight: 600, textAlign: 'center', lineHeight: 1.2, color: '#1f2937' }}>
                Do you like my eyes?
              </div>
              <div style={{ position: 'relative', height: 14, marginTop: 2 }}>
                <div style={{ position: 'absolute', left: 0, right: 0, top: '50%', transform: 'translateY(-50%)', height: 4, borderRadius: 999, background: '#e5e7eb' }} />
                <div style={{ position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)', height: 4, borderRadius: 999, width: '60%', background: 'linear-gradient(90deg, #ec4899 0%, #f97316 50%, #fbbf24 100%)' }} />
                <div style={{ position: 'absolute', left: '60%', top: '50%', transform: 'translate(-50%,-50%)', width: 16, height: 16, borderRadius: 999, background: '#ffffff', border: '2px solid #e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                  <span style={{ fontSize: 10 }}>😺</span>
                </div>
              </div>
            </div>
          </div>
          <span style={{ fontSize: 11, fontWeight: 500, color: '#9ca3af' }}>
            {label}
          </span>
        </div>
      ) : type === 'quiz' ? (
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
          <div style={{ width: '100%', height: 75, borderRadius: 12, background: '#ffffff', border: '1px solid #e5e7eb', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'center', padding: '10px 12px', boxSizing: 'border-box', gap: 4 }}>
            <div style={{ fontSize: 9, fontWeight: 600, color: '#1f2937', marginBottom: 2 }}>What is the largest...</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 8px', background: '#f9fafb', borderRadius: 6, width: '100%', boxSizing: 'border-box' }}>
              <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#f3f4f6', border: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <span style={{ fontSize: 7, fontWeight: 700, color: '#6b7280' }}>A</span>
              </div>
              <span style={{ fontSize: 7, color: '#6b7280', fontWeight: 500 }}>Option 1</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 8px', background: '#f9fafb', borderRadius: 6, width: '100%', boxSizing: 'border-box' }}>
              <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#f3f4f6', border: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <span style={{ fontSize: 7, fontWeight: 700, color: '#6b7280' }}>B</span>
              </div>
              <span style={{ fontSize: 7, color: '#6b7280', fontWeight: 500 }}>Option 2</span>
            </div>
          </div>
          <span style={{ fontSize: 11, fontWeight: 500, color: '#9ca3af' }}>
            {label}
          </span>
        </div>
      ) : type === 'poll' ? (
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
          <div style={{ width: '100%', height: 75, borderRadius: 12, background: '#ffffff', border: '1px solid #e5e7eb', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '10px', boxSizing: 'border-box', gap: 6 }}>
            <div style={{ fontSize: 9, fontWeight: 600, textAlign: 'center', lineHeight: 1.3, color: '#1f2937' }}>
              Are you excited for the grand sale?
            </div>
            <div style={{ display: 'flex', width: '100%', background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: 8, overflow: 'hidden', height: 26 }}>
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 600 }}>
                <span style={{ color: '#1f2937' }}>YES</span>
              </div>
              <div style={{ width: 1, background: '#e5e7eb' }} />
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 600 }}>
                <span style={{ color: '#1f2937' }}>NO</span>
              </div>
            </div>
          </div>
          <span style={{ fontSize: 11, fontWeight: 500, color: '#9ca3af' }}>
            {label}
          </span>
        </div>
      ) : type === 'reaction' ? (
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
          <div style={{ width: '100%', height: 75, borderRadius: 12, background: '#ffffff', border: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '12px', boxSizing: 'border-box', gap: 12 }}>
            <div style={{ width: 38, height: 38, borderRadius: '50%', background: '#ffffff', border: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <span style={{ fontSize: 22 }}>👍</span>
            </div>
            <div style={{ width: 38, height: 38, borderRadius: '50%', background: '#ffffff', border: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <span style={{ fontSize: 22 }}>👎</span>
            </div>
          </div>
          <span style={{ fontSize: 11, fontWeight: 500, color: '#9ca3af' }}>
            {label}
          </span>
        </div>
      ) : type === 'countdown' ? (
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
          <div style={{ width: '100%', height: 75, borderRadius: 12, background: '#ffffff', border: '1px solid #e5e7eb', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'center', padding: '10px', boxSizing: 'border-box', gap: 4 }}>
            <div style={{ fontSize: 9, fontWeight: 600, color: '#1f2937' }}>
              It's almost my b-day!
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center', gap: 4, width: '100%' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 22 }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: '#1f2937' }}>0</span>
                <span style={{ fontSize: 6, color: '#9ca3af', marginTop: -2 }}>days</span>
              </div>
              <span style={{ fontSize: 10, fontWeight: 600, color: '#d1d5db', marginBottom: 6 }}>:</span>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 22 }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: '#1f2937' }}>0:02</span>
                <span style={{ fontSize: 6, color: '#9ca3af', marginTop: -2 }}>01:02</span>
              </div>
              <span style={{ fontSize: 10, fontWeight: 600, color: '#d1d5db', marginBottom: 6 }}>:</span>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 22 }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: '#1f2937' }}>2:44</span>
                <span style={{ fontSize: 6, color: '#9ca3af', marginTop: -2 }}>minutes</span>
              </div>
            </div>
          </div>
          <span style={{ fontSize: 11, fontWeight: 500, color: '#9ca3af' }}>
            {label}
          </span>
        </div>
      ) : type === 'promo' ? (
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
          <div style={{ width: '100%', height: 75, borderRadius: 12, background: '#ffffff', border: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '12px', boxSizing: 'border-box' }}>
            <div style={{ position: 'relative', background: '#ffffff', border: '1px dashed #fb923c', borderRadius: 8, padding: '8px 12px', display: 'flex', alignItems: 'center', gap: 8, width: '100%' }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: '#1f2937', flex: 1 }}>Coupon</span>
              <div style={{ width: 24, height: 24, borderRadius: 6, background: '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <span style={{ fontSize: 13 }}>📋</span>
              </div>
            </div>
          </div>
          <span style={{ fontSize: 11, fontWeight: 500, color: '#9ca3af' }}>
            {label}
          </span>
        </div>
      ) : type === 'question' ? (
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
          <div style={{ width: '100%', height: 75, borderRadius: 12, background: '#ffffff', border: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '12px', boxSizing: 'border-box' }}>
            <div style={{ position: 'relative', background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: 10, padding: '8px 12px', width: '90%', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <div style={{ fontSize: 10, fontWeight: 600, color: '#1f2937', textAlign: 'center', marginBottom: 2 }}>Ask a Question</div>
              <div style={{ fontSize: 8, color: '#9ca3af', textAlign: 'center' }}>Tap to ask</div>
              <div style={{ position: 'absolute', bottom: -6, left: '50%', transform: 'translateX(-50%)', width: 0, height: 0, borderLeft: '6px solid transparent', borderRight: '6px solid transparent', borderTop: '6px solid #e5e7eb' }} />
              <div style={{ position: 'absolute', bottom: -5, left: '50%', transform: 'translateX(-50%)', width: 0, height: 0, borderLeft: '5px solid transparent', borderRight: '5px solid transparent', borderTop: '5px solid #ffffff' }} />
            </div>
          </div>
          <span style={{ fontSize: 11, fontWeight: 500, color: '#9ca3af' }}>
            {label}
          </span>
        </div>
      ) : type === 'imageQuiz' ? (
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
          <div style={{ width: '100%', height: 75, borderRadius: 12, background: '#ffffff', border: '1px solid #e5e7eb', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '8px', boxSizing: 'border-box', gap: 4 }}>
            <div style={{ fontSize: 8, fontWeight: 600, color: '#1f2937', textAlign: 'center', marginBottom: 2 }}>What is the largest species in the world?</div>
            <div style={{ display: 'flex', gap: 4, width: '100%', justifyContent: 'center' }}>
              <div style={{ flex: 1, borderRadius: 8, background: '#f9fafb', border: '1px solid #e5e7eb', height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', maxWidth: 40 }}>
                <div style={{ position: 'absolute', top: 2, left: 2, width: 10, height: 10, borderRadius: '50%', background: '#f3f4f6', border: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 6, color: '#9ca3af' }}>A</div>
                <span style={{ fontSize: 16 }}>🐻</span>
              </div>
              <div style={{ flex: 1, borderRadius: 8, background: '#f9fafb', border: '1px solid #e5e7eb', height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', maxWidth: 40 }}>
                <div style={{ position: 'absolute', top: 2, left: 2, width: 10, height: 10, borderRadius: '50%', background: '#f3f4f6', border: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 6, color: '#9ca3af' }}>B</div>
                <span style={{ fontSize: 16 }}>🐼</span>
              </div>
            </div>
          </div>
          <span style={{ fontSize: 11, fontWeight: 500, color: '#9ca3af' }}>
            {label}
          </span>
        </div>
      ) : (
        <>
          <span style={{ fontSize: 28 }}>{styleConfig.icon}</span>
          <span style={{ fontSize: 11, fontWeight: 600, color: '#fff', textShadow: '0 1px 2px rgba(0,0,0,0.2)' }}>
            {label}
          </span>
        </>
      )}
    </button>
  );
};

/* ================= PANEL ================= */

export const InteractiveSectionPanel = observer(({ store }) => {
  const page = store?.activePage;
  if (!page) return null;

  /**
   * Add an interactive element to the canvas
   * Uses 'svg' element type which:
   * 1. Allows manual width/height control
   * 2. Can display custom SVG content as a preview
   * 3. Works well with Polotno's selection and manipulation
   */
  const addInteractive = (type) => {
    const dimensions = { ...INTERACTIVE_DIMENSIONS[type] };
    const customData = createInteractiveData(type);
    const styleDefaults = INTERACTIVE_STYLES[type] || {};

    // Calculate dynamic height for poll based on options
    if (type === 'poll' && customData.data.options) {
      const optionCount = customData.data.options.length;
      const layout = customData.data.layout || 'horizontal';
      const padding = 16;
      const questionHeight = 24;
      const buttonHeight = 26;
      const buttonGap = 6;

      if (layout === 'horizontal') {
        const rows = Math.ceil(optionCount / 2);
        dimensions.height = padding + questionHeight + padding + (rows * buttonHeight) + ((rows - 1) * buttonGap) + padding;
      } else {
        dimensions.height = padding + questionHeight + padding + (optionCount * buttonHeight) + ((optionCount - 1) * buttonGap) + padding;
      }
    }

    // Calculate dynamic height for quiz based on options
    if (type === 'quiz' && customData.data.options) {
      const optionCount = customData.data.options.length;
      const padding = 12;
      const questionHeight = 20;
      const optionHeight = 28;
      const optionGap = 6;
      const bottomPadding = 24;

      dimensions.height = padding + questionHeight + 10 + (optionCount * optionHeight) + ((optionCount - 1) * optionGap) + bottomPadding;
    }

    // Calculate dynamic height for reaction based on showCount
    if (type === 'reaction') {
      const padding = 12;
      const buttonSize = 40;
      const pillHeight = 65;
      dimensions.height = customData.data.showCount ? (pillHeight + padding * 2) : (buttonSize + padding * 2);
    }

    // Center the element on the page
    const x = (store.width - dimensions.width) / 2;
    const y = (store.height - dimensions.height) / 2;

    // Generate SVG preview based on interactive type
    const svgContent = generateInteractiveSVG(type, customData.data, styleDefaults, dimensions);

    // Create element with 'svg' type - this allows height control and custom rendering
    const element = page.addElement({
      type: 'svg',
      x,
      y,
      width: dimensions.width,
      height: dimensions.height,
      src: svgContent,
      keepRatio: false, // Allow independent width/height control

      // Interactive metadata
      custom: customData,
    });

    // Auto-select the new element
    store.selectElements([element.id]);
  };

  // Get existing interactive elements on this page
  const interactiveElements = page.children.filter(
    el => el.custom?.kind === 'interactive' || el.custom?.isInteractive
  );

  return (
    <div style={{ padding: 16 }}>
      {/* Section Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        marginBottom: 16,
      }}>
        <div style={{
          width: 32,
          height: 32,
          borderRadius: 8,
          background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 2px 8px rgba(99, 102, 241, 0.4)',
        }}>
          <span style={{ fontSize: 16 }}>⚡</span>
        </div>
        <div>
          <h3 style={{
            fontSize: 14,
            fontWeight: 600,
            margin: 0,
            color: 'var(--text-primary)',
          }}>
            Interactive Stickers
          </h3>
          <p style={{
            fontSize: 11,
            margin: 0,
            color: 'var(--text-muted)',
          }}>
            Add engagement to your stories
          </p>
        </div>
      </div>

      {/* Section Label */}
      <p style={{
        fontSize: 11,
        fontWeight: 600,
        opacity: 0.6,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginBottom: 12,
        color: 'var(--text-secondary)',
      }}>
        Engagement Widgets
      </p>

      {/* Interactive Buttons Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: 10,
        marginBottom: 20,
      }}>
        <InteractionButton type="poll" onClick={() => addInteractive('poll')} />
        <InteractionButton type="quiz" onClick={() => addInteractive('quiz')} />
        <InteractionButton type="rating" onClick={() => addInteractive('rating')} />
        <InteractionButton type="reaction" onClick={() => addInteractive('reaction')} />
        <InteractionButton type="countdown" onClick={() => addInteractive('countdown')} />
        <InteractionButton type="promo" onClick={() => addInteractive('promo')} />
        <InteractionButton type="question" onClick={() => addInteractive('question')} />
        <InteractionButton type="imageQuiz" onClick={() => addInteractive('imageQuiz')} />
      </div>

      {/* Existing Interactive Elements on Page */}
      {interactiveElements.length > 0 && (
        <>
          <p style={{
            fontSize: 11,
            fontWeight: 600,
            opacity: 0.6,
            textTransform: 'uppercase',
            letterSpacing: 0.5,
            marginBottom: 10,
            color: 'var(--text-secondary)',
          }}>
            On This Slide ({interactiveElements.length})
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {interactiveElements.map((el) => {
              const type = el.custom?.interactiveType;
              const isSelected = store.selectedElements.some(s => s.id === el.id);

              return (
                <button
                  key={el.id}
                  onClick={() => store.selectElements([el.id])}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '10px 12px',
                    background: isSelected ? 'var(--accent-primary)' : 'var(--bg-elevated)',
                    border: `1px solid ${isSelected ? 'var(--accent-primary)' : 'var(--border-primary)'}`,
                    borderRadius: 8,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    width: '100%',
                    textAlign: 'left',
                  }}
                >
                  <span style={{ fontSize: 18 }}>{getInteractiveTypeIcon(type)}</span>
                  <span style={{
                    fontSize: 12,
                    fontWeight: 500,
                    color: isSelected ? '#fff' : 'var(--text-primary)',
                  }}>
                    {getInteractiveTypeLabel(type)}
                  </span>
                  <span style={{
                    marginLeft: 'auto',
                    fontSize: 11,
                    color: isSelected ? 'rgba(255,255,255,0.7)' : 'var(--text-muted)',
                  }}>
                    {isSelected ? '✓ Selected' : 'Click to edit'}
                  </span>
                </button>
              );
            })}
          </div>
        </>
      )}

      {/* Help Text */}
      <p style={{
        fontSize: 11,
        color: 'var(--text-muted)',
        textAlign: 'center',
        lineHeight: 1.5,
        marginTop: 20,
        padding: '12px',
        background: 'var(--bg-tertiary)',
        borderRadius: 8,
      }}>
        Click a widget to add it to your story.
        <br />
        Select it on canvas to customize.
      </p>
    </div>
  );
});



/* ================= EXPORT ================= */

export const InteractiveSection = {
  name: 'interactive',
  Tab: InteractiveSectionTab,
  Panel: InteractiveSectionPanel,
};

// Export helper for updating SVG when data changes
export { generateInteractiveSVG };
