import { observer } from 'mobx-react-lite';
import { useState, useRef, useCallback } from 'react';
import {
  PositionSection,
  AppearanceSection,
  AnimationSection,
  DurationSection,
} from '../shared/CommonControls';
import { ColorPicker } from '../shared/ColorPicker';
import {
  getInteractiveType,
  getInteractiveData,
  getInteractiveStyle,
  getInteractiveTypeLabel,
  getInteractiveTypeIcon,
  INTERACTIVE_STYLES,
  INTERACTIVE_DIMENSIONS,
} from '../../interactive/schemas';
import { generateInteractiveSVG } from '../../side-panel/sections/InteractiveSection';

/**
 * Interactive Settings Panel
 * 
 * Provides comprehensive controls for all interactive element types.
 * Controls dynamically change based on the selected interactiveType.
 */
export const InteractiveSettings = observer(({ store, element }) => {
  const [activeTab, setActiveTab] = useState('content');
  const imageInputRef = useRef(null);
  const [uploadingOptionId, setUploadingOptionId] = useState(null);

  if (!element) return null;

  const interactiveType = getInteractiveType(element);
  const data = getInteractiveData(element);
  const style = getInteractiveStyle(element);

  // Regenerate SVG preview when data or style changes
  const regenerateSVG = useCallback((newData, newStyle) => {
    let width = element.width || INTERACTIVE_DIMENSIONS[interactiveType]?.width || 280;
    let height = element.height || INTERACTIVE_DIMENSIONS[interactiveType]?.height || 160;

    // Calculate dynamic height for polls based on options and layout
    if (interactiveType === 'poll' && newData.options) {
      const optionCount = newData.options.length;
      const layout = newData.layout || 'horizontal';
      const padding = 16;
      const questionHeight = 24;
      const buttonHeight = 26;
      const buttonGap = 6;

      if (layout === 'horizontal') {
        const rows = Math.ceil(optionCount / 2);
        height = padding + questionHeight + padding + (rows * buttonHeight) + ((rows - 1) * buttonGap) + padding;
      } else {
        height = padding + questionHeight + padding + (optionCount * buttonHeight) + ((optionCount - 1) * buttonGap) + padding;
      }
    }

    // Calculate dynamic height for quiz based on options
    if (interactiveType === 'quiz' && newData.options) {
      const optionCount = newData.options.length;
      const padding = 12;
      const questionHeight = 20;
      const optionHeight = 28; // Increased to account for padding and borders
      const optionGap = 6;
      const bottomPadding = 24; // Extra padding at bottom to prevent cutoff

      height = padding + questionHeight + 10 + (optionCount * optionHeight) + ((optionCount - 1) * optionGap) + bottomPadding;
    }

    // Dynamic height for reaction
    if (interactiveType === 'reaction') {
      const padding = 12;
      const buttonSize = 40;
      const pillHeight = 65;
      height = newData.showCount ? (pillHeight + padding * 2) : (buttonSize + padding * 2);
    }

    const dimensions = { width, height };
    const styleDefaults = { ...INTERACTIVE_STYLES[interactiveType], ...newStyle };
    const newSrc = generateInteractiveSVG(interactiveType, newData, styleDefaults, dimensions);
    element.set({ src: newSrc, height });
  }, [element, interactiveType]);

  // ==================== DATA UPDATE HELPERS ====================

  const updateData = (key, value) => {
    const newData = { ...data, [key]: value };
    element.set({
      custom: {
        ...element.custom,
        data: newData,
      },
    });
    // Regenerate SVG after data update
    regenerateSVG(newData, style);
  };

  const updateStyle = (key, value) => {
    const newStyle = { ...style, [key]: value };
    element.set({
      custom: {
        ...element.custom,
        style: newStyle,
      },
    });
    // Regenerate SVG after style update
    regenerateSVG(data, newStyle);
  };

  // Update options array
  const updateOptions = (newOptions) => {
    updateData('options', newOptions);
  };

  const addOption = () => {
    const options = data.options || [];
    const newId = `opt${Date.now()} `;
    const newOption = interactiveType === 'imageQuiz'
      ? { id: newId, imageUrl: '', label: `Option ${options.length + 1}` }
      : { id: newId, label: `Option ${options.length + 1}`, votes: 0 };
    updateOptions([...options, newOption]);
  };

  const removeOption = (id) => {
    const options = data.options || [];
    if (options.length > 2) {
      updateOptions(options.filter(opt => opt.id !== id));
    }
  };

  const updateOption = (id, updates) => {
    const options = data.options || [];
    updateOptions(options.map(opt =>
      opt.id === id ? { ...opt, ...updates } : opt
    ));
  };

  // Handle image upload for Image Quiz - converts to base64 for SVG compatibility
  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith('image/') || !uploadingOptionId) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64Url = event.target.result;
      updateOption(uploadingOptionId, { imageUrl: base64Url });
      setUploadingOptionId(null);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const triggerImageUpload = (optionId) => {
    setUploadingOptionId(optionId);
    imageInputRef.current?.click();
  };

  // Update emojis for reaction
  const updateEmojis = (newEmojis) => {
    updateData('emojis', newEmojis);
  };

  const setCorrectAnswer = (id) => {
    updateData('correctAnswerId', id);
  };

  // ==================== RENDER HELPERS ====================

  const renderSectionTitle = (title) => (
    <div className="section-title">{title}</div>
  );

  const renderTextInput = (label, value, onChange, placeholder = '', secondaryLabel = '') => (
    <div className="control-row" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: 8, marginBottom: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', marginBottom: 4 }}>
        <span className="control-label" style={{ fontWeight: 500, color: '#333', fontSize: '13px' }}>{label}</span>
        {secondaryLabel && <span style={{ color: '#a0aec0', fontSize: '12px' }}>{secondaryLabel}</span>}
      </div>
      <input
        type="text"
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          width: '100%',
          padding: '10px 14px',
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: 8,
          color: '#2d3748',
          fontSize: '14px',
        }}
      />
    </div>
  );

  const renderTextArea = (label, value, onChange, placeholder = '') => (
    <div className="control-row" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: 8, marginBottom: 20 }}>
      <span className="control-label" style={{ fontWeight: 500, color: '#333', fontSize: '13px', marginBottom: 4 }}>{label}</span>
      <textarea
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={3}
        style={{
          width: '100%',
          padding: '10px 14px',
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: 8,
          color: '#2d3748',
          fontSize: '14px',
          resize: 'vertical',
        }}
      />
    </div>
  );

  const renderNumberInput = (label, value, onChange, min = 0, max = 100) => (
    <div className="control-row" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
      <span className="control-label" style={{ fontWeight: 500, color: '#333', fontSize: '13px' }}>{label}</span>
      <div style={{ width: 80 }}>
        <input
          type="number"
          value={value ?? min}
          onChange={(e) => {
            const val = parseInt(e.target.value);
            if (!isNaN(val) && val >= min && val <= max) {
              onChange(val);
            }
          }}
          onBlur={(e) => {
            const val = parseInt(e.target.value);
            if (isNaN(val) || val < min) {
              onChange(min);
            } else if (val > max) {
              onChange(max);
            }
          }}
          min={min}
          max={max}
          style={{
            width: '100%',
            padding: '8px 12px',
            borderRadius: 8,
            border: '1px solid var(--sidebar-input-border)',
            background: 'var(--sidebar-input-bg)',
            color: 'var(--sidebar-text)',
            fontSize: '13px',
            textAlign: 'center'
          }}
        />
      </div>
    </div>
  );

  const renderColorPicker = (label, value, onChange, defaultColor = '#ffffff') => (
    <div className="control-row" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: 8, marginBottom: 20 }}>
      <span className="control-label" style={{ fontWeight: 500, color: '#333', fontSize: '13px', marginBottom: 4 }}>{label}</span>
      <div className="control-value" style={{ width: '100%' }}>
        <ColorPicker
          value={value || defaultColor}
          onChange={onChange}
        />
      </div>
    </div>
  );

  const renderToggle = (label, value, onChange) => (
    <div className="control-row" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
      <span className="control-label" style={{ fontWeight: 500, color: '#333', fontSize: '13px' }}>{label}</span>
      <div className="control-value">
        <label className="toggle-switch">
          <input
            type="checkbox"
            checked={value || false}
            onChange={(e) => onChange(e.target.checked)}
          />
          <span className="toggle-slider" />
        </label>
      </div>
    </div>
  );

  const renderSelect = (label, value, onChange, options) => (
    <div className="control-row" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
      <span className="control-label" style={{ fontWeight: 500, color: '#333', fontSize: '13px' }}>{label}</span>
      <div className="control-value" style={{ width: '140px' }}>
        <div className="select-wrapper" style={{ position: 'relative' }}>
          <select
            className="select-input"
            value={value ?? ''}
            onChange={(e) => onChange(e.target.value)}
            style={{ padding: '8px 32px 8px 12px', borderRadius: 8, width: '100%' }}
          >
            {options.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          <div style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', fontSize: 10, color: '#718096' }}>▼</div>
        </div>
      </div>
    </div>
  );

  // ==================== CONTENT TAB RENDERERS ====================

  const renderPollContent = () => (
    <>
      <div className="section">
        {renderTextInput('Question', data.question, (v) => updateData('question', v), 'Enter your question')}
      </div>

      <div className="section" style={{ marginTop: 16 }}>
        {renderSectionTitle('Options')}
        {(data.options || []).map((option, index) => (
          <div key={option.id} style={{
            display: 'flex',
            gap: 8,
            marginBottom: 8,
            alignItems: 'center'
          }}>
            <span style={{
              width: 20,
              fontSize: 11,
              color: 'var(--text-muted)',
              textAlign: 'center'
            }}>
              {index + 1}
            </span>
            <input
              type="text"
              value={option.label ?? option.text ?? ''}
              onChange={(e) => updateOption(option.id, { label: e.target.value })}
              style={{
                flex: 1,
                padding: '8px 10px',
                background: 'var(--sidebar-input-bg)',
                border: '1px solid var(--sidebar-input-border)',
                borderRadius: 6,
                color: 'var(--sidebar-text)',
                fontSize: 12,
              }}
            />
            <button
              onClick={() => removeOption(option.id)}
              disabled={(data.options || []).length <= 2}
              style={{
                width: 28,
                height: 28,
                background: 'transparent',
                border: '1px solid var(--border-primary)',
                borderRadius: 4,
                color: 'var(--text-muted)',
                cursor: (data.options || []).length <= 2 ? 'not-allowed' : 'pointer',
                opacity: (data.options || []).length <= 2 ? 0.4 : 1,
              }}
            >
              ×
            </button>
          </div>
        ))}
        <button
          onClick={addOption}
          style={{
            width: '100%',
            padding: '10px',
            background: 'transparent',
            border: '1px dashed var(--border-primary)',
            borderRadius: 6,
            color: 'var(--accent-primary)',
            fontSize: 12,
            cursor: 'pointer',
            marginTop: 8,
          }}
        >
          + Add Option
        </button>
      </div>

      <div className="section" style={{ marginTop: 16 }}>
        {renderSelect('Layout', data.layout || 'horizontal', (v) => updateData('layout', v), [
          { value: 'horizontal', label: 'Horizontal (2 columns)' },
          { value: 'vertical', label: 'Vertical (full width)' },
        ])}
      </div>

      <div className="section" style={{ marginTop: 16 }}>
        {renderToggle('Show Results', data.showResults, (v) => updateData('showResults', v))}
      </div>
    </>
  );

  const renderQuizContent = () => (
    <>
      <div className="section">
        {renderTextInput('Question', data.question, (v) => updateData('question', v), 'Enter your question')}
      </div>

      <div className="section" style={{ marginTop: 16 }}>
        {renderSectionTitle('Answer Options')}
        {(data.options || []).map((option, index) => (
          <div key={option.id} style={{
            display: 'flex',
            gap: 8,
            marginBottom: 8,
            alignItems: 'center'
          }}>
            <button
              onClick={() => setCorrectAnswer(option.id)}
              style={{
                width: 24,
                height: 24,
                borderRadius: '50%',
                background: data.correctAnswerId === option.id ? '#10b981' : 'transparent',
                border: `2px solid ${data.correctAnswerId === option.id ? '#10b981' : 'var(--border-primary)'} `,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontSize: 12,
              }}
              title="Mark as correct answer"
            >
              {data.correctAnswerId === option.id && '✓'}
            </button>
            <input
              type="text"
              value={option.text ?? ''}
              onChange={(e) => updateOption(option.id, { text: e.target.value })}
              style={{
                flex: 1,
                padding: '8px 10px',
                background: 'var(--sidebar-input-bg)',
                border: '1px solid var(--sidebar-input-border)',
                borderRadius: 6,
                color: 'var(--sidebar-text)',
                fontSize: 12,
              }}
            />
            <button
              onClick={() => removeOption(option.id)}
              disabled={(data.options || []).length <= 2}
              style={{
                width: 28,
                height: 28,
                background: 'transparent',
                border: '1px solid var(--border-primary)',
                borderRadius: 4,
                color: 'var(--text-muted)',
                cursor: (data.options || []).length <= 2 ? 'not-allowed' : 'pointer',
                opacity: (data.options || []).length <= 2 ? 0.4 : 1,
              }}
            >
              ×
            </button>
          </div>
        ))}
        <button
          onClick={addOption}
          style={{
            width: '100%',
            padding: '10px',
            background: 'transparent',
            border: '1px dashed var(--border-primary)',
            borderRadius: 6,
            color: 'var(--accent-primary)',
            fontSize: 12,
            cursor: 'pointer',
            marginTop: 8,
          }}
        >
          + Add Option
        </button>

        <p style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 8 }}>
          Click the circle to mark the correct answer
        </p>
      </div>

      <div className="section" style={{ marginTop: 16 }}>
        {renderToggle('Show Explanation', data.showExplanation, (v) => updateData('showExplanation', v))}

        {data.showExplanation && renderTextArea('Explanation', data.explanation, (v) => updateData('explanation', v), 'Explain the correct answer...')}
      </div>
    </>
  );

  const renderRatingContent = () => (
    <>
      <div className="section">
        {renderTextInput('Title', data.title, (v) => updateData('title', v), 'Do you like my eyes?', 'Tagfic')}

        {renderSelect('Type', data.type, (v) => updateData('type', v), [
          { value: 'star', label: 'Stars' },
          { value: 'emoji', label: 'Emoji' },
          { value: 'slider', label: 'Slider' },
        ])}

        {renderNumberInput('Max Rating', data.maxRating, (v) => updateData('maxRating', v), 1, 10)}

        {(data.type === 'emoji' || data.type === 'slider') && renderTextInput('Emoji', data.emoji, (v) => updateData('emoji', v), '😺')}
      </div>

      {data.type === 'slider' && (
        <div className="section" style={{ marginTop: 16 }}>
          <div className="control-row" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: 8, marginBottom: 20 }}>
            <span className="control-label" style={{ fontWeight: 500, color: '#333', fontSize: '13px', marginBottom: 4 }}>Current Rating</span>
            <div className="control-value" style={{ width: '100%' }}>
              <div className="slider-container">
                <div className="slider-track" style={{ height: 6, background: '#edf2f7' }}>
                  <input
                    type="range"
                    min={0}
                    max={data.maxRating || 5}
                    step={0.1}
                    value={data.currentRating ?? 0}
                    onChange={(e) => updateData('currentRating', parseFloat(e.target.value))}
                    style={{ top: -14 }}
                  />
                  <div className="slider-fill" style={{ width: `${((data.currentRating ?? 0) / (data.maxRating || 5)) * 100}% `, height: '100%' }}>
                    <div className="slider-thumb" style={{ width: 20, height: 20, top: -7, border: '2px solid white', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );

  const renderReactionContent = () => {
    const emojis = data.emojis || ['😍', '🔥', '😂', '😮', '😢'];

    return (
      <>
        <div className="section">
          {renderSectionTitle('Emoji Reactions')}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
            {emojis.map((emoji, index) => (
              <div
                key={index}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                  padding: '6px 10px',
                  background: 'var(--sidebar-input-bg)',
                  borderRadius: 8,
                  border: '1px solid var(--sidebar-input-border)',
                }}
              >
                <input
                  type="text"
                  value={emoji}
                  onChange={(e) => {
                    const newEmojis = [...emojis];
                    newEmojis[index] = e.target.value;
                    updateEmojis(newEmojis);
                  }}
                  style={{
                    width: 30,
                    fontSize: 18,
                    textAlign: 'center',
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--sidebar-text)',
                  }}
                />
                <button
                  onClick={() => {
                    if (emojis.length > 1) {
                      updateEmojis(emojis.filter((_, i) => i !== index));
                    }
                  }}
                  disabled={emojis.length <= 1}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--text-muted)',
                    cursor: emojis.length <= 1 ? 'not-allowed' : 'pointer',
                    fontSize: 12,
                  }}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
          <button
            onClick={() => updateEmojis([...emojis, '👍'])}
            disabled={emojis.length >= 7}
            style={{
              width: '100%',
              padding: '10px',
              background: 'transparent',
              border: '1px dashed var(--border-primary)',
              borderRadius: 6,
              color: 'var(--accent-primary)',
              fontSize: 12,
              cursor: emojis.length >= 7 ? 'not-allowed' : 'pointer',
              opacity: emojis.length >= 7 ? 0.5 : 1,
            }}
          >
            + Add Emoji
          </button>
        </div>

        <div className="section" style={{ marginTop: 16 }}>
          {renderToggle('Show Count', data.showCount, (v) => updateData('showCount', v))}
        </div>
      </>
    );
  };

  const renderCountdownContent = () => (
    <>
      <div className="section">
        {renderTextInput('Title', data.title, (v) => updateData('title', v), 'Ends In')}

        <div className="control-row" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: 6 }}>
          <span className="control-label">End Date</span>
          <input
            type="date"
            value={data.endDate ?? ''}
            onChange={(e) => updateData('endDate', e.target.value)}
            style={{
              width: '100%',
              padding: '10px 12px',
              background: 'var(--sidebar-input-bg)',
              border: '1px solid var(--sidebar-input-border)',
              borderRadius: 6,
              color: 'var(--sidebar-text)',
              fontSize: 12,
            }}
          />
        </div>

        <div className="control-row" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: 6, marginTop: 12 }}>
          <span className="control-label">End Time</span>
          <input
            type="time"
            value={data.endTime || '23:59'}
            onChange={(e) => updateData('endTime', e.target.value)}
            style={{
              width: '100%',
              padding: '10px 12px',
              background: 'var(--sidebar-input-bg)',
              border: '1px solid var(--sidebar-input-border)',
              borderRadius: 6,
              color: 'var(--sidebar-text)',
              fontSize: 12,
            }}
          />
        </div>
      </div>

      <div className="section" style={{ marginTop: 16 }}>
        {renderSectionTitle('Display')}
        {renderToggle('Show Days', data.showDays !== false, (v) => updateData('showDays', v))}
        {renderToggle('Show Hours', data.showHours !== false, (v) => updateData('showHours', v))}
        {renderToggle('Show Minutes', data.showMinutes !== false, (v) => updateData('showMinutes', v))}
        {renderToggle('Show Seconds', data.showSeconds !== false, (v) => updateData('showSeconds', v))}
      </div>
    </>
  );

  const renderPromoContent = () => (
    <>
      <div className="section">
        {renderTextInput('Title', data.title, (v) => updateData('title', v), 'Special Offer')}
        {renderTextInput('Coupon Code', data.couponCode, (v) => updateData('couponCode', v), 'SAVE20')}
        {renderTextArea('Description', data.description, (v) => updateData('description', v), 'Get 20% off your order')}
      </div>

      <div className="section" style={{ marginTop: 16 }}>
        {renderToggle('Show Copy Button', data.showCopyButton !== false, (v) => updateData('showCopyButton', v))}
        {renderToggle('Dashed Border', data.dashedBorder !== false, (v) => updateData('dashedBorder', v))}
      </div>
    </>
  );

  const renderQuestionContent = () => (
    <>
      <div className="section">
        {renderTextInput('Title', data.title, (v) => updateData('title', v), 'Ask me anything')}
        {renderTextInput('Placeholder', data.placeholder, (v) => updateData('placeholder', v), 'Type your answer...')}
        {renderNumberInput('Max Length', data.maxLength, (v) => updateData('maxLength', v), 10, 500)}
      </div>

      <div className="section" style={{ marginTop: 16 }}>
        {renderToggle('Allow Anonymous', data.allowAnonymous !== false, (v) => updateData('allowAnonymous', v))}
      </div>
    </>
  );

  const renderImageQuizContent = () => (
    <>
      <input
        ref={imageInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        style={{ display: 'none' }}
      />

      <div className="section">
        {renderTextInput('Question', data.question, (v) => updateData('question', v), 'Which one is correct?')}

        {renderSelect('Columns', data.columns, (v) => updateData('columns', parseInt(v)), [
          { value: '2', label: '2 Columns' },
          { value: '3', label: '3 Columns' },
          { value: '4', label: '4 Columns' },
        ])}
      </div>

      <div className="section" style={{ marginTop: 16 }}>
        {renderSectionTitle('Image Options')}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          {(data.options || []).map((option) => (
            <div
              key={option.id}
              style={{
                padding: 8,
                background: 'var(--sidebar-input-bg)',
                borderRadius: 8,
                border: `2px solid ${data.correctAnswerId === option.id ? '#10b981' : 'var(--sidebar-input-border)'} `,
              }}
            >
              <div
                onClick={() => triggerImageUpload(option.id)}
                style={{
                  aspectRatio: '1',
                  background: 'var(--bg-tertiary)',
                  borderRadius: 6,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  overflow: 'hidden',
                  marginBottom: 8,
                }}
              >
                {option.imageUrl ? (
                  <img
                    src={option.imageUrl}
                    alt={option.label}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  <span style={{ fontSize: 24, color: 'var(--text-muted)' }}>📷</span>
                )}
              </div>
              <input
                type="text"
                value={option.label ?? ''}
                onChange={(e) => updateOption(option.id, { label: e.target.value })}
                placeholder="Label"
                style={{
                  width: '100%',
                  padding: '6px 8px',
                  background: 'transparent',
                  border: '1px solid var(--border-primary)',
                  borderRadius: 4,
                  color: 'var(--sidebar-text)',
                  fontSize: 11,
                  marginBottom: 6,
                }}
              />
              <div style={{ display: 'flex', gap: 4 }}>
                <button
                  onClick={() => setCorrectAnswer(option.id)}
                  style={{
                    flex: 1,
                    padding: '4px 6px',
                    background: data.correctAnswerId === option.id ? '#10b981' : 'transparent',
                    border: `1px solid ${data.correctAnswerId === option.id ? '#10b981' : 'var(--border-primary)'} `,
                    borderRadius: 4,
                    color: data.correctAnswerId === option.id ? '#fff' : 'var(--text-muted)',
                    fontSize: 9,
                    cursor: 'pointer',
                  }}
                >
                  {data.correctAnswerId === option.id ? '✓ Correct' : 'Mark Correct'}
                </button>
                <button
                  onClick={() => removeOption(option.id)}
                  disabled={(data.options || []).length <= 2}
                  style={{
                    padding: '4px 8px',
                    background: 'transparent',
                    border: '1px solid var(--border-primary)',
                    borderRadius: 4,
                    color: 'var(--text-muted)',
                    fontSize: 10,
                    cursor: (data.options || []).length <= 2 ? 'not-allowed' : 'pointer',
                    opacity: (data.options || []).length <= 2 ? 0.4 : 1,
                  }}
                >
                  ×
                </button>
              </div>
            </div>
          ))}
        </div>
        <button
          onClick={addOption}
          disabled={(data.options || []).length >= 6}
          style={{
            width: '100%',
            padding: '10px',
            background: 'transparent',
            border: '1px dashed var(--border-primary)',
            borderRadius: 6,
            color: 'var(--accent-primary)',
            fontSize: 12,
            cursor: (data.options || []).length >= 6 ? 'not-allowed' : 'pointer',
            marginTop: 12,
            opacity: (data.options || []).length >= 6 ? 0.5 : 1,
          }}
        >
          + Add Option
        </button>
      </div>
    </>
  );

  const renderContentTab = () => {
    switch (interactiveType) {
      case 'poll': return renderPollContent();
      case 'quiz': return renderQuizContent();
      case 'rating': return renderRatingContent();
      case 'reaction': return renderReactionContent();
      case 'countdown': return renderCountdownContent();
      case 'promo': return renderPromoContent();
      case 'question': return renderQuestionContent();
      case 'imageQuiz': return renderImageQuizContent();
      default: return <p style={{ color: 'var(--text-muted)', fontSize: 12 }}>Unknown interactive type</p>;
    }
  };

  // ==================== STYLE TAB ====================

  const renderStyleTab = () => {
    const { style } = element.custom;
    const defaults = INTERACTIVE_STYLES[interactiveType];

    return (
      <>
        <PositionSection element={element} />
        <AppearanceSection element={element} />

        <div className="section">
          {renderSectionTitle('Colors & Styling')}

          {renderColorPicker('Background', style.containerBgColor, (v) => updateStyle('containerBgColor', v), defaults.containerBgColor)}
          {renderNumberInput('Padding', style.containerPadding, (v) => updateStyle('containerPadding', v), 0, 50)}

          {/* Type-specific colors */}
          {(interactiveType === 'poll' || interactiveType === 'quiz' || interactiveType === 'question') && (
            <>
              {renderColorPicker('Question Color', style.questionColor || style.titleColor, (v) => updateStyle(interactiveType === 'question' ? 'titleColor' : 'questionColor', v), defaults.questionColor || defaults.titleColor)}
              {renderNumberInput('Question Size', style.questionFontSize || style.titleFontSize, (v) => updateStyle(interactiveType === 'question' ? 'titleFontSize' : 'questionFontSize', v), 10, 48)}
            </>
          )}

          {(interactiveType === 'poll' || interactiveType === 'quiz') && (
            <>
              {renderColorPicker('Option BG', style.optionBgColor, (v) => updateStyle('optionBgColor', v), defaults.optionBgColor)}
              {renderColorPicker('Option Text', style.optionTextColor, (v) => updateStyle('optionTextColor', v), defaults.optionTextColor)}
              {renderNumberInput('Option Radius', style.optionBorderRadius, (v) => updateStyle('optionBorderRadius', v), 0, 24)}
            </>
          )}

          {interactiveType === 'poll' && renderColorPicker('Result Bar', style.resultBarColor, (v) => updateStyle('resultBarColor', v), defaults.resultBarColor)}

          {interactiveType === 'quiz' && (
            <>
              {renderColorPicker('Correct Color', style.correctColor, (v) => updateStyle('correctColor', v), defaults.correctColor)}
              {renderColorPicker('Incorrect Color', style.incorrectColor, (v) => updateStyle('incorrectColor', v), defaults.incorrectColor)}
            </>
          )}


          {interactiveType === 'reaction' && (
            <>
              {renderToggle('Transparent Background', style.transparentBg, (v) => updateStyle('transparentBg', v))}
              {!style.transparentBg && renderColorPicker('Background', style.containerBgColor, (v) => updateStyle('containerBgColor', v), defaults.containerBgColor)}
              {renderNumberInput('Emoji Size', style.emojiSize, (v) => updateStyle('emojiSize', v), 24, 80)}
            </>
          )}

          {interactiveType === 'countdown' && (
            <>
              {renderColorPicker('Title Color', style.titleColor, (v) => updateStyle('titleColor', v), defaults.titleColor)}
              {renderColorPicker('Digit Color', style.digitColor, (v) => updateStyle('digitColor', v), defaults.digitColor)}
              {renderNumberInput('Digit Size', style.digitFontSize, (v) => updateStyle('digitFontSize', v), 16, 72)}
              {renderColorPicker('Digit BG', style.digitBgColor, (v) => updateStyle('digitBgColor', v), defaults.digitBgColor)}
              {renderColorPicker('Label Color', style.labelColor, (v) => updateStyle('labelColor', v), defaults.labelColor)}
            </>
          )}

          {interactiveType === 'promo' && (
            <>
              {renderColorPicker('Title Color', style.titleColor, (v) => updateStyle('titleColor', v), defaults.titleColor)}
              {renderColorPicker('Code Color', style.codeColor, (v) => updateStyle('codeColor', v), defaults.codeColor)}
              {renderNumberInput('Code Size', style.codeFontSize, (v) => updateStyle('codeFontSize', v), 14, 48)}
              {renderColorPicker('Code BG', style.codeBgColor, (v) => updateStyle('codeBgColor', v), defaults.codeBgColor)}
              {renderColorPicker('Button BG', style.buttonBgColor, (v) => updateStyle('buttonBgColor', v), defaults.buttonBgColor)}
              {renderColorPicker('Border', style.borderColor, (v) => updateStyle('borderColor', v), defaults.borderColor)}
            </>
          )}

          {interactiveType === 'question' && (
            <>
              {renderColorPicker('Input BG', style.inputBgColor, (v) => updateStyle('inputBgColor', v), defaults.inputBgColor)}
              {renderColorPicker('Input Text', style.inputTextColor, (v) => updateStyle('inputTextColor', v), defaults.inputTextColor)}
              {renderColorPicker('Submit BG', style.submitBgColor, (v) => updateStyle('submitBgColor', v), defaults.submitBgColor)}
            </>
          )}

          {interactiveType === 'imageQuiz' && (
            <>
              {renderColorPicker('Question Color', style.questionColor, (v) => updateStyle('questionColor', v), defaults.questionColor)}
              {renderNumberInput('Image Radius', style.imageBorderRadius, (v) => updateStyle('imageBorderRadius', v), 0, 24)}
              {renderColorPicker('Border Color', style.imageBorderColor, (v) => updateStyle('imageBorderColor', v), defaults.imageBorderColor)}
              {renderColorPicker('Correct Border', style.correctBorderColor, (v) => updateStyle('correctBorderColor', v), defaults.correctBorderColor)}
            </>
          )}
        </div>

        {/* Additional Appearance for Rating */}
        {interactiveType === 'rating' && (
          <div className="section">
            {renderSectionTitle('Additional Appearance')}
            {renderColorPicker('Card Background', style.cardBgColor, (v) => updateStyle('cardBgColor', v), '#ffffff')}
            {renderColorPicker('Title Color', style.titleColor, (v) => updateStyle('titleColor', v), '#000000')}
            {renderNumberInput('Title Size', style.titleFontSize, (v) => updateStyle('titleFontSize', v), 8, 24)}
            {renderNumberInput('Emoji Size', style.emojiSize, (v) => updateStyle('emojiSize', v), 16, 64)}
          </div>
        )}

        {/* Reset Default Styles Button */}
        <button
          onClick={() => {
            element.set({
              custom: {
                ...element.custom,
                style: { ...INTERACTIVE_STYLES[interactiveType] },
              },
            });
          }}
          style={{
            width: '100%',
            padding: '10px',
            background: 'transparent',
            border: '1px solid var(--border-primary)',
            borderRadius: 6,
            color: 'var(--text-secondary)',
            fontSize: 12,
            cursor: 'pointer',
            marginTop: 8,
          }}
        >
          Reset to Default Styles
        </button>
      </>
    );
  };

  // ==================== MAIN RENDER ====================

  return (
    <div className="settings-panel interactive-settings">
      {/* Type Badge */}
      {/* <div style={{
        padding: '10px 16px',
        background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
        color: '#ffffff',
        fontSize: 12,
        fontWeight: 600,
        textAlign: 'center',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
      }}>
        <span style={{ fontSize: 16 }}>{getInteractiveTypeIcon(interactiveType)}</span>
        <span>{getInteractiveTypeLabel(interactiveType)}</span>
      </div> */}

      {/* Tabs */}
      <div className="sidebar-tabs">
        <button
          className={`sidebar-tab ${activeTab === 'content' ? 'active' : ''}`}
          onClick={() => setActiveTab('content')}
        >
          Content
        </button>
        <button
          className={`sidebar-tab ${activeTab === 'style' ? 'active' : ''}`}
          onClick={() => setActiveTab('style')}
        >
          Style
        </button>
        <button
          className={`sidebar-tab ${activeTab === 'animation' ? 'active' : ''}`}
          onClick={() => setActiveTab('animation')}
        >
          Animate
        </button>
      </div>

      {/* Content */}
      <div className="settings-content">
        {activeTab === 'content' && renderContentTab()}

        {activeTab === 'style' && renderStyleTab()}

        {activeTab === 'animation' && (
          <AnimationSection store={store} element={element} />
        )}
      </div>

      {/* Duration Section - At bottom, visible on all tabs */}
      <div style={{ paddingBottom: 16 }}>
        <DurationSection store={store} element={element} />
      </div>
    </div>
  );
});

export default InteractiveSettings;
