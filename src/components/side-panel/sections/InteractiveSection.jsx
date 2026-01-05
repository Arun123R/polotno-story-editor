import React from 'react';
import { observer } from 'mobx-react-lite';
import { SectionTab } from 'polotno/side-panel';
import { BASELINE_EXPORT, getStoreExportScale, getStoreExportSize, toCanvas } from '../../../utils/scale';
import { generateInteractiveSVG } from '../../interactive/interactiveSvg';
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
