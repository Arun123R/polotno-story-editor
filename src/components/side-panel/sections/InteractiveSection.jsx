import React from 'react';
import { observer } from 'mobx-react-lite';
import { SectionTab } from 'polotno/side-panel';
import { BASELINE_EXPORT, getStoreExportScale, getStoreExportSize, toCanvas } from '../../../utils/scale';
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

  // Default fallback for other types
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(`
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="${width}" height="${height}" fill="#667eea" rx="12"/>
      <text x="${width / 2}" y="${height / 2}" font-family="Arial" font-size="16" fill="#ffffff" text-anchor="middle" dominant-baseline="middle">${type}</text>
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

  const mapBaselineExportToCurrent = (rectOrPoint) => {
    const exportSize = getStoreExportSize(store);
    const sx = exportSize.width / BASELINE_EXPORT.width;
    const sy = exportSize.height / BASELINE_EXPORT.height;

    if (!rectOrPoint) return rectOrPoint;
    const out = { ...rectOrPoint };
    if (typeof out.x === 'number') out.x = out.x * sx;
    if (typeof out.y === 'number') out.y = out.y * sy;
    if (typeof out.width === 'number') out.width = out.width * sx;
    if (typeof out.height === 'number') out.height = out.height * sy;
    return out;
  };

  /**
   * Add an interactive element to the canvas
   * Uses 'svg' element type which:
   * 1. Allows manual width/height control
   * 2. Can display custom SVG content as a preview
   * 3. Works well with Polotno's selection and manipulation
   */
  const addInteractive = (type) => {
    const baselineDims = INTERACTIVE_DIMENSIONS[type];
    const exportDims = mapBaselineExportToCurrent(baselineDims);
    const exportScale = getStoreExportScale(store);
    const canvasDims = {
      width: toCanvas(exportDims.width, exportScale),
      height: toCanvas(exportDims.height, exportScale),
    };
    const customData = createInteractiveData(type);
    const styleDefaults = INTERACTIVE_STYLES[type] || {};

    // Center the element on the page
    const x = (store.width - canvasDims.width) / 2;
    const y = (store.height - canvasDims.height) / 2;

    // Generate SVG preview based on interactive type
    const svgContent = generateInteractiveSVG(type, customData.data, styleDefaults, canvasDims);

    // Create element with 'svg' type - this allows height control and custom rendering
    const element = page.addElement({
      type: 'svg',
      x,
      y,
      width: canvasDims.width,
      height: canvasDims.height,
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

function _generatePollSVG(data, style, width, height) {
  const bgColor = style?.containerBgColor || 'linear-gradient(135deg, #667eea, #764ba2)';
  const radius = style?.containerBorderRadius || 12;
  const question = data?.question || 'Are you excited for the grand sale?';
  const options = data?.options || [{ text: 'YES' }, { text: 'NO' }];
  const buttonBorder = '#667eea';
  const buttonTextColor = '#667eea';
  const questionTextColor = '#000000';

  const padding = 8;
  const innerRadius = 10;
  const innerX = padding;
  const innerY = padding + 2;
  const innerW = width - padding * 2;
  const questionHeight = 16;
  const optionHeight = 20;
  const optionGap = 6;
  const optionWidth = (innerW - 2 * padding - optionGap) / 2;

  const optionsY = innerY + padding + questionHeight + 6;

  let optionsSVG = '';
  options.slice(0, 2).forEach((opt, i) => {
    const x = innerX + padding + i * (optionWidth + optionGap);
    optionsSVG += `
      <rect x="${x}" y="${optionsY}" width="${optionWidth}" height="${optionHeight}" rx="6" fill="none" stroke="${buttonBorder}" stroke-width="2"/>
      <text x="${x + optionWidth / 2}" y="${optionsY + optionHeight / 2 + 4}" text-anchor="middle" fill="${buttonTextColor}" font-size="10" font-weight="700">${escapeXml(opt.text)}</text>
    `;
  });

  return `
    <defs>
      <filter id="poll-shadow" x="-50%" y="-50%" width="200%" height="200%">
        <feDropShadow dx="0" dy="6" stdDeviation="8" flood-color="#000" flood-opacity="0.25"/>
      </filter>
    </defs>

    <rect width="${width}" height="${height}" rx="${radius}" fill="${bgColor}"/>
    <rect x="${innerX}" y="${innerY}" width="${innerW}" height="52" rx="${innerRadius}" fill="#ffffff" filter="url(#poll-shadow)"/>
    <text x="${width / 2}" y="${innerY + 18}" text-anchor="middle" fill="${questionTextColor}" font-size="11" font-weight="600">${escapeXml(question)}</text>
    ${optionsSVG}
  `;
}

function _generateQuizSVG(data, style, width, height) {
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
      <text x="${width / 2}" y="${y + optionHeight / 2 + 4}" text-anchor="middle" fill="${optionTextColor}" font-size="13" font-weight="500">${escapeXml(opt.text)}${isCorrect ? ' ✓' : ''}</text>
    `;
  });

  return `
    <rect width="${width}" height="${height}" rx="${radius}" fill="${bgColor}"/>
    <text x="${width / 2}" y="${padding + 14}" text-anchor="middle" fill="${textColor}" font-size="15" font-weight="600">${escapeXml(question)}</text>
    ${optionsSVG}
  `;
}

function generateRatingSVG(data, style, width, height) {
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
      ${escapeXml(title)}
    </text>
    <rect x="${sliderX}" y="${sliderY}" width="${sliderW}" height="8" rx="4" fill="#e5e7eb"/>
    <rect x="${sliderX}" y="${sliderY}" width="${fillW}" height="8" rx="4" fill="url(#${gradId})"/>
    <text x="${sliderX + fillW}" y="${sliderY + 14}" text-anchor="middle" font-size="${emojiSize}">${escapeXml(emoji)}</text>
  </svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgContent)}`;
}

function _generateReactionSVG(data, style, width, height) {
  const emojis = data?.emojis || ['😍', '🔥', '😂', '😮', '😢'];
  const emojiSize = style?.emojiSize || 40;
  const emojiGap = 16;
  const totalWidth = emojis.length * emojiSize + (emojis.length - 1) * emojiGap;
  const startX = (width - totalWidth) / 2;

  let emojisSVG = '';
  emojis.forEach((emoji, i) => {
    const x = startX + i * (emojiSize + emojiGap) + emojiSize / 2;
    emojisSVG += `<text x="${x}" y="${height / 2 + emojiSize / 3}" text-anchor="middle" font-size="${emojiSize}">${emoji}</text>`;
  });

  return `
    <rect width="${width}" height="${height}" rx="12" fill="transparent"/>
    ${emojisSVG}
  `;
}

function _generateCountdownSVG(data, style, width, height) {
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
  const startY = height / 2 - 10;

  let boxesSVG = '';
  units.forEach((unit, i) => {
    const x = startX + i * (boxWidth + boxGap);
    boxesSVG += `
      <rect x="${x}" y="${startY}" width="${boxWidth}" height="${boxHeight}" rx="8" fill="${digitBg}"/>
      <text x="${x + boxWidth / 2}" y="${startY + 28}" text-anchor="middle" fill="${digitColor}" font-size="${digitSize}" font-weight="700" font-family="monospace">${unit.val}</text>
      <text x="${x + boxWidth / 2}" y="${startY + boxHeight - 8}" text-anchor="middle" fill="${labelColor}" font-size="9" font-weight="500">${unit.label}</text>
    `;
  });

  return `
    <rect width="${width}" height="${height}" rx="${radius}" fill="${bgColor}"/>
    <text x="${width / 2}" y="28" text-anchor="middle" fill="${titleColor}" font-size="13" font-weight="600" letter-spacing="2">${escapeXml(title.toUpperCase())}</text>
    ${boxesSVG}
  `;
}

function _generatePromoSVG(data, style, width, height) {
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
    <text x="${width / 2}" y="35" text-anchor="middle" fill="${titleColor}" font-size="14" font-weight="600">${escapeXml(title)}</text>
    <rect x="${(width - codeBoxWidth) / 2}" y="${height / 2 - 16}" width="${codeBoxWidth}" height="40" rx="8" fill="${codeBg}"/>
    <text x="${width / 2 - 20}" y="${height / 2 + 10}" text-anchor="middle" fill="${codeColor}" font-size="20" font-weight="700" font-family="monospace" letter-spacing="2">${escapeXml(code)}</text>
    <rect x="${width / 2 + 40}" y="${height / 2 - 8}" width="50" height="24" rx="4" fill="${buttonBg}"/>
    <text x="${width / 2 + 65}" y="${height / 2 + 6}" text-anchor="middle" fill="${buttonText}" font-size="11" font-weight="600">Copy</text>
  `;
}

function _generateQuestionSVG(data, style, width, height) {
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
    <text x="${width / 2}" y="35" text-anchor="middle" fill="${titleColor}" font-size="15" font-weight="600">${escapeXml(title)}</text>
    <rect x="${padding}" y="50" width="${width - padding * 2}" height="${inputHeight}" rx="8" fill="${inputBg}"/>
    <text x="${padding + 14}" y="76" fill="${inputText}" font-size="13">${escapeXml(placeholder)}</text>
    <rect x="${padding}" y="${height - padding - buttonHeight}" width="${width - padding * 2}" height="${buttonHeight}" rx="8" fill="${buttonBg}"/>
    <text x="${width / 2}" y="${height - padding - buttonHeight / 2 + 5}" text-anchor="middle" fill="${buttonText}" font-size="14" font-weight="600">Submit</text>
  `;
}

function _generateImageQuizSVG(data, style, width, height) {
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
        <text x="${x + imageSize / 2}" y="${y + imageSize + 16}" text-anchor="middle" fill="${labelColor}" font-size="11">${escapeXml(opt.label)}${isCorrect ? ' ✓' : ''}</text>
      `;
    } else {
      imagesSVG += `
        <rect x="${x}" y="${y}" width="${imageSize}" height="${imageSize}" rx="8" fill="rgba(255,255,255,0.1)" stroke="${strokeColor}" stroke-width="${strokeWidth}"/>
        <text x="${x + imageSize / 2}" y="${y + imageSize / 2 + 10}" text-anchor="middle" font-size="24" fill="rgba(255,255,255,0.3)">🖼️</text>
        <text x="${x + imageSize / 2}" y="${y + imageSize + 16}" text-anchor="middle" fill="${labelColor}" font-size="11">${escapeXml(opt.label)}${isCorrect ? ' ✓' : ''}</text>
      `
    }
  });

  return `
    <rect width="${width}" height="${height}" rx="${radius}" fill="${bgColor}"/>
    <text x="${width / 2}" y="${padding + 14}" text-anchor="middle" fill="${textColor}" font-size="14" font-weight="600">${escapeXml(question)}</text>
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

/* eslint-disable react-refresh/only-export-components */
// Export only components for fast refresh compatibility
export const InteractiveSection = {
  name: 'interactive',
  Tab: InteractiveSectionTab,
  Panel: InteractiveSectionPanel,
};
