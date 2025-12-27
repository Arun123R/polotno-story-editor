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

/* ================= TAB ================= */

const InteractiveIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10" />
    <path d="M12 6v6l4 2" />
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
  poll: { bg: 'linear-gradient(135deg, #667eea, #764ba2)', icon: '📊' },
  quiz: { bg: 'linear-gradient(135deg, #f093fb, #f5576c)', icon: '❓' },
  rating: { bg: 'linear-gradient(135deg, #ffecd2, #fcb69f)', icon: '⭐' },
  reaction: { bg: 'linear-gradient(135deg, #a8edea, #fed6e3)', icon: '😍' },
  countdown: { bg: 'linear-gradient(135deg, #30cfd0, #330867)', icon: '⏱️' },
  promo: { bg: 'linear-gradient(135deg, #43e97b, #38f9d7)', icon: '🎟️' },
  question: { bg: 'linear-gradient(135deg, #fa709a, #fee140)', icon: '💬' },
  imageQuiz: { bg: 'linear-gradient(135deg, #4facfe, #00f2fe)', icon: '🖼️' },
};

/* ================= INTERACTION BUTTON ================= */

const InteractionButton = ({ type, onClick }) => {
  const styleConfig = buttonStyles[type];
  const label = getInteractiveTypeLabel(type);
  
  return (
    <button
      onClick={onClick}
      style={{
        height: 90,
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
      <span style={{ fontSize: 28 }}>{styleConfig.icon}</span>
      <span style={{ 
        fontSize: 11, 
        fontWeight: 600, 
        color: '#fff',
        textShadow: '0 1px 2px rgba(0,0,0,0.2)',
      }}>
        {label}
      </span>
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
    const dimensions = INTERACTIVE_DIMENSIONS[type];
    const customData = createInteractiveData(type);
    const styleDefaults = INTERACTIVE_STYLES[type] || {};
    
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

/* ================= SVG GENERATORS ================= */

/**
 * Generate SVG content for interactive element preview
 */
function generateInteractiveSVG(type, data, style, dimensions) {
  const { width, height } = dimensions;
  const bgColor = style?.containerBgColor || 'rgba(0,0,0,0.7)';
  const radius = style?.containerBorderRadius || 12;
  const textColor = style?.questionColor || style?.titleColor || '#ffffff';
  
  let content = '';
  
  switch (type) {
    case 'poll':
      content = generatePollSVG(data, style, width, height);
      break;
    case 'quiz':
      content = generateQuizSVG(data, style, width, height);
      break;
    case 'rating':
      content = generateRatingSVG(data, style, width, height);
      break;
    case 'reaction':
      content = generateReactionSVG(data, style, width, height);
      break;
    case 'countdown':
      content = generateCountdownSVG(data, style, width, height);
      break;
    case 'promo':
      content = generatePromoSVG(data, style, width, height);
      break;
    case 'question':
      content = generateQuestionSVG(data, style, width, height);
      break;
    case 'imageQuiz':
      content = generateImageQuizSVG(data, style, width, height);
      break;
    default:
      content = `
        <rect width="${width}" height="${height}" rx="${radius}" fill="${bgColor}"/>
        <text x="${width/2}" y="${height/2}" text-anchor="middle" dominant-baseline="middle" fill="${textColor}" font-size="14" font-weight="600">${getInteractiveTypeLabel(type)}</text>
      `;
  }
  
  return `data:image/svg+xml;utf8,${encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
      <style>
        text { font-family: 'Inter', -apple-system, sans-serif; }
      </style>
      ${content}
    </svg>
  `)}`;
}

function generatePollSVG(data, style, width, height) {
  const bgColor = style?.containerBgColor || 'rgba(0,0,0,0.7)';
  const radius = style?.containerBorderRadius || 12;
  const question = data?.question || 'What do you prefer?';
  const options = data?.options || [{ text: 'Option A' }, { text: 'Option B' }];
  const optionBg = style?.optionBgColor || 'rgba(255,255,255,0.2)';
  const textColor = style?.questionColor || '#ffffff';
  const optionTextColor = style?.optionTextColor || '#ffffff';
  
  const optionHeight = 36;
  const optionGap = 8;
  const padding = 16;
  const questionHeight = 30;
  
  let optionsSVG = '';
  options.forEach((opt, i) => {
    const y = padding + questionHeight + (i * (optionHeight + optionGap));
    optionsSVG += `
      <rect x="${padding}" y="${y}" width="${width - padding * 2}" height="${optionHeight}" rx="8" fill="${optionBg}"/>
      <text x="${width/2}" y="${y + optionHeight/2 + 4}" text-anchor="middle" fill="${optionTextColor}" font-size="13" font-weight="500">${escapeXml(opt.text)}</text>
    `;
  });
  
  return `
    <rect width="${width}" height="${height}" rx="${radius}" fill="${bgColor}"/>
    <text x="${width/2}" y="${padding + 14}" text-anchor="middle" fill="${textColor}" font-size="15" font-weight="600">${escapeXml(question)}</text>
    ${optionsSVG}
  `;
}

function generateQuizSVG(data, style, width, height) {
  const bgColor = style?.containerBgColor || 'rgba(0,0,0,0.7)';
  const radius = style?.containerBorderRadius || 12;
  const question = data?.question || 'What is the answer?';
  const options = data?.options || [{ id: '1', text: 'A' }, { id: '2', text: 'B' }];
  const correctId = data?.correctAnswerId;
  const optionBg = style?.optionBgColor || 'rgba(255,255,255,0.2)';
  const correctColor = style?.correctColor || '#10b981';
  const textColor = style?.questionColor || '#ffffff';
  const optionTextColor = style?.optionTextColor || '#ffffff';
  
  const optionHeight = 36;
  const optionGap = 8;
  const padding = 16;
  const questionHeight = 30;
  
  let optionsSVG = '';
  options.forEach((opt, i) => {
    const y = padding + questionHeight + (i * (optionHeight + optionGap));
    const isCorrect = opt.id === correctId;
    const bg = isCorrect ? correctColor : optionBg;
    optionsSVG += `
      <rect x="${padding}" y="${y}" width="${width - padding * 2}" height="${optionHeight}" rx="8" fill="${bg}"/>
      <text x="${width/2}" y="${y + optionHeight/2 + 4}" text-anchor="middle" fill="${optionTextColor}" font-size="13" font-weight="500">${escapeXml(opt.text)}${isCorrect ? ' ✓' : ''}</text>
    `;
  });
  
  return `
    <rect width="${width}" height="${height}" rx="${radius}" fill="${bgColor}"/>
    <text x="${width/2}" y="${padding + 14}" text-anchor="middle" fill="${textColor}" font-size="15" font-weight="600">${escapeXml(question)}</text>
    ${optionsSVG}
  `;
}

function generateRatingSVG(data, style, width, height) {
  const bgColor = style?.containerBgColor || 'rgba(0,0,0,0.7)';
  const radius = style?.containerBorderRadius || 12;
  const title = data?.title || 'Rate this!';
  const maxRating = data?.maxRating || 5;
  const textColor = style?.titleColor || '#ffffff';
  
  const starSize = style?.emojiSize || 28;
  const starGap = 8;
  const totalStarsWidth = maxRating * starSize + (maxRating - 1) * starGap;
  const startX = (width - totalStarsWidth) / 2;
  
  let starsSVG = '';
  for (let i = 0; i < maxRating; i++) {
    const x = startX + i * (starSize + starGap);
    starsSVG += `<text x="${x + starSize/2}" y="${height/2 + 20}" text-anchor="middle" font-size="${starSize}">⭐</text>`;
  }
  
  return `
    <rect width="${width}" height="${height}" rx="${radius}" fill="${bgColor}"/>
    <text x="${width/2}" y="30" text-anchor="middle" fill="${textColor}" font-size="14" font-weight="600">${escapeXml(title)}</text>
    ${starsSVG}
  `;
}

function generateReactionSVG(data, style, width, height) {
  const emojis = data?.emojis || ['😍', '🔥', '😂', '😮', '😢'];
  const emojiSize = style?.emojiSize || 40;
  const emojiGap = 16;
  const totalWidth = emojis.length * emojiSize + (emojis.length - 1) * emojiGap;
  const startX = (width - totalWidth) / 2;
  
  let emojisSVG = '';
  emojis.forEach((emoji, i) => {
    const x = startX + i * (emojiSize + emojiGap) + emojiSize/2;
    emojisSVG += `<text x="${x}" y="${height/2 + emojiSize/3}" text-anchor="middle" font-size="${emojiSize}">${emoji}</text>`;
  });
  
  return `
    <rect width="${width}" height="${height}" rx="12" fill="transparent"/>
    ${emojisSVG}
  `;
}

function generateCountdownSVG(data, style, width, height) {
  const bgColor = style?.containerBgColor || 'rgba(0,0,0,0.7)';
  const radius = style?.containerBorderRadius || 16;
  const title = data?.title || 'Ends In';
  const digitBg = style?.digitBgColor || 'rgba(255,255,255,0.15)';
  const digitColor = style?.digitColor || '#ffffff';
  const labelColor = style?.labelColor || 'rgba(255,255,255,0.7)';
  const titleColor = style?.titleColor || '#ffffff';
  const digitSize = style?.digitFontSize || 28;
  
  const boxWidth = 50;
  const boxHeight = 56;
  const boxGap = 12;
  const units = [
    { val: '00', label: 'Days' },
    { val: '12', label: 'Hrs' },
    { val: '34', label: 'Min' },
    { val: '56', label: 'Sec' },
  ];
  const totalWidth = units.length * boxWidth + (units.length - 1) * boxGap;
  const startX = (width - totalWidth) / 2;
  const startY = height/2 - 10;
  
  let boxesSVG = '';
  units.forEach((unit, i) => {
    const x = startX + i * (boxWidth + boxGap);
    boxesSVG += `
      <rect x="${x}" y="${startY}" width="${boxWidth}" height="${boxHeight}" rx="8" fill="${digitBg}"/>
      <text x="${x + boxWidth/2}" y="${startY + 28}" text-anchor="middle" fill="${digitColor}" font-size="${digitSize}" font-weight="700" font-family="monospace">${unit.val}</text>
      <text x="${x + boxWidth/2}" y="${startY + boxHeight - 8}" text-anchor="middle" fill="${labelColor}" font-size="9" font-weight="500">${unit.label}</text>
    `;
  });
  
  return `
    <rect width="${width}" height="${height}" rx="${radius}" fill="${bgColor}"/>
    <text x="${width/2}" y="28" text-anchor="middle" fill="${titleColor}" font-size="13" font-weight="600" letter-spacing="2">${escapeXml(title.toUpperCase())}</text>
    ${boxesSVG}
  `;
}

function generatePromoSVG(data, style, width, height) {
  const bgColor = style?.containerBgColor || 'rgba(0,0,0,0.7)';
  const radius = style?.containerBorderRadius || 12;
  const title = data?.title || 'Special Offer';
  const code = data?.couponCode || 'SAVE20';
  const codeBg = style?.codeBgColor || 'rgba(255,255,255,0.15)';
  const codeColor = style?.codeColor || '#ffffff';
  const titleColor = style?.titleColor || '#ffffff';
  const buttonBg = style?.buttonBgColor || '#F97316';
  const buttonText = style?.buttonTextColor || '#000000';
  const hasDashed = data?.dashedBorder !== false;
  const borderColor = style?.borderColor || 'rgba(255,255,255,0.3)';
  
  const codeBoxWidth = Math.min(width - 60, 180);
  
  return `
    <rect width="${width}" height="${height}" rx="${radius}" fill="${bgColor}" ${hasDashed ? `stroke="${borderColor}" stroke-width="2" stroke-dasharray="8 4"` : ''}/>
    <text x="${width/2}" y="35" text-anchor="middle" fill="${titleColor}" font-size="14" font-weight="600">${escapeXml(title)}</text>
    <rect x="${(width - codeBoxWidth)/2}" y="${height/2 - 16}" width="${codeBoxWidth}" height="40" rx="8" fill="${codeBg}"/>
    <text x="${width/2 - 20}" y="${height/2 + 10}" text-anchor="middle" fill="${codeColor}" font-size="20" font-weight="700" font-family="monospace" letter-spacing="2">${escapeXml(code)}</text>
    <rect x="${width/2 + 40}" y="${height/2 - 8}" width="50" height="24" rx="4" fill="${buttonBg}"/>
    <text x="${width/2 + 65}" y="${height/2 + 6}" text-anchor="middle" fill="${buttonText}" font-size="11" font-weight="600">Copy</text>
  `;
}

function generateQuestionSVG(data, style, width, height) {
  const bgColor = style?.containerBgColor || 'rgba(0,0,0,0.7)';
  const radius = style?.containerBorderRadius || 12;
  const title = data?.title || 'Ask me anything';
  const placeholder = data?.placeholder || 'Type your answer...';
  const inputBg = style?.inputBgColor || 'rgba(255,255,255,0.15)';
  const inputText = style?.placeholderColor || 'rgba(255,255,255,0.5)';
  const titleColor = style?.titleColor || '#ffffff';
  const buttonBg = style?.submitBgColor || '#F97316';
  const buttonText = style?.submitTextColor || '#000000';
  
  const padding = 16;
  const inputHeight = 40;
  const buttonHeight = 36;
  
  return `
    <rect width="${width}" height="${height}" rx="${radius}" fill="${bgColor}"/>
    <text x="${width/2}" y="35" text-anchor="middle" fill="${titleColor}" font-size="15" font-weight="600">${escapeXml(title)}</text>
    <rect x="${padding}" y="50" width="${width - padding * 2}" height="${inputHeight}" rx="8" fill="${inputBg}"/>
    <text x="${padding + 14}" y="76" fill="${inputText}" font-size="13">${escapeXml(placeholder)}</text>
    <rect x="${padding}" y="${height - padding - buttonHeight}" width="${width - padding * 2}" height="${buttonHeight}" rx="8" fill="${buttonBg}"/>
    <text x="${width/2}" y="${height - padding - buttonHeight/2 + 5}" text-anchor="middle" fill="${buttonText}" font-size="14" font-weight="600">Submit</text>
  `;
}

function generateImageQuizSVG(data, style, width, height) {
  const bgColor = style?.containerBgColor || 'rgba(0,0,0,0.7)';
  const radius = style?.containerBorderRadius || 12;
  const question = data?.question || 'Which one?';
  const options = data?.options || [{ id: '1', label: 'A' }, { id: '2', label: 'B' }];
  const columns = data?.columns || 2;
  const correctId = data?.correctAnswerId;
  const textColor = style?.questionColor || '#ffffff';
  const labelColor = style?.labelColor || '#ffffff';
  const borderColor = style?.imageBorderColor || 'rgba(255,255,255,0.3)';
  const correctBorderColor = style?.correctBorderColor || '#10b981';
  
  const padding = 14;
  const questionHeight = 28;
  const gridGap = 8;
  const availableWidth = width - padding * 2;
  const imageSize = (availableWidth - gridGap * (columns - 1)) / columns;
  const startY = padding + questionHeight + 8;
  
  let imagesSVG = '';
  options.slice(0, columns * 2).forEach((opt, i) => {
    const col = i % columns;
    const row = Math.floor(i / columns);
    const x = padding + col * (imageSize + gridGap);
    const y = startY + row * (imageSize + 24);
    const isCorrect = opt.id === correctId;
    const strokeColor = isCorrect ? correctBorderColor : borderColor;
    const strokeWidth = isCorrect ? 3 : 2;
    
    // Check if option has an image URL
    if (opt.imageUrl) {
      imagesSVG += `
        <defs>
          <clipPath id="clip-${opt.id}">
            <rect x="${x}" y="${y}" width="${imageSize}" height="${imageSize}" rx="8"/>
          </clipPath>
        </defs>
        <image 
          x="${x}" 
          y="${y}" 
          width="${imageSize}" 
          height="${imageSize}" 
          href="${opt.imageUrl}" 
          preserveAspectRatio="xMidYMid slice"
          clip-path="url(#clip-${opt.id})"
        />
        <rect x="${x}" y="${y}" width="${imageSize}" height="${imageSize}" rx="8" fill="none" stroke="${strokeColor}" stroke-width="${strokeWidth}"/>
        <text x="${x + imageSize/2}" y="${y + imageSize + 16}" text-anchor="middle" fill="${labelColor}" font-size="11">${escapeXml(opt.label)}${isCorrect ? ' ✓' : ''}</text>
      `;
    } else {
      imagesSVG += `
        <rect x="${x}" y="${y}" width="${imageSize}" height="${imageSize}" rx="8" fill="rgba(255,255,255,0.1)" stroke="${strokeColor}" stroke-width="${strokeWidth}"/>
        <text x="${x + imageSize/2}" y="${y + imageSize/2 + 10}" text-anchor="middle" font-size="24" fill="rgba(255,255,255,0.3)">🖼️</text>
        <text x="${x + imageSize/2}" y="${y + imageSize + 16}" text-anchor="middle" fill="${labelColor}" font-size="11">${escapeXml(opt.label)}${isCorrect ? ' ✓' : ''}</text>
      `;
    }
  });
  
  return `
    <rect width="${width}" height="${height}" rx="${radius}" fill="${bgColor}"/>
    <text x="${width/2}" y="${padding + 14}" text-anchor="middle" fill="${textColor}" font-size="14" font-weight="600">${escapeXml(question)}</text>
    ${imagesSVG}
  `;
}

function escapeXml(text) {
  if (!text) return '';
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/* ================= EXPORT ================= */

export const InteractiveSection = {
  name: 'interactive',
  Tab: InteractiveSectionTab,
  Panel: InteractiveSectionPanel,
};

// Export helper for updating SVG when data changes
export { generateInteractiveSVG };
