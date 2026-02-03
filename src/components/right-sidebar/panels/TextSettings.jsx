import { observer } from 'mobx-react-lite';
import { useState } from 'react';
import {
  DurationSection,
  AnimationSection,
  TrashIcon,
} from '../shared/CommonControls';
import { ColorPicker } from '../shared/ColorPicker';

/**
 * Text element settings panel - Storyly-inspired dark theme
 * Supports both single and multi-element selection
 */
export const TextSettings = observer(({ store, element, elements = [], isMultiSelect = false }) => {
  const [activeTab, setActiveTab] = useState('general');

  if (!element) return null;

  // Get all elements to modify (single or multiple)
  const targetElements = isMultiSelect && elements.length > 0 ? elements : [element];

  // Helper to apply changes to all selected elements
  const applyToAll = (changes) => {
    targetElements.forEach(el => el.set(changes));
  };

  const fontFamilies = [
    'Inter', 'Roboto', 'Open Sans', 'Lato', 'Montserrat',
    'Poppins', 'Nunito', 'Arial', 'Georgia', 'Times New Roman',
  ];

  const fontWeights = [
    { value: '400', label: 'Regular' },
    { value: '500', label: 'Medium' },
    { value: '600', label: 'Semi Bold' },
    { value: '700', label: 'Bold' },
  ];

  return (
    <div className="settings-panel text-settings">
      {/* Tab Navigation */}
      <div className="sidebar-tabs">
        <button
          className={`sidebar-tab ${activeTab === 'general' ? 'active' : ''}`}
          onClick={() => setActiveTab('general')}
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

      <div className="settings-content">
        {/* Multi-select indicator */}
        {isMultiSelect && (
          <div style={{
            padding: '8px 12px',
            background: 'var(--accent-subtle)',
            borderRadius: '6px',
            marginBottom: '12px',
            fontSize: '12px',
            color: 'var(--accent-primary)',
            textAlign: 'center'
          }}>
            <strong>{targetElements.length}</strong> text elements selected
          </div>
        )}

        {activeTab === 'general' ? (
          <>
            {/* Content Section */}
            <div className="section">
              <div className="section-title">Text Content</div>

              {/* Text Content */}
              <div className="control-row" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '8px' }}>
                <textarea
                  value={element.text || ''}
                  onChange={(e) => applyToAll({ text: e.target.value })}
                  placeholder="Enter your text here..."
                  style={{
                    width: '100%',
                    minHeight: '120px',
                    padding: '12px',
                    background: 'var(--sidebar-input-bg)',
                    border: '1px solid var(--sidebar-input-border)',
                    borderRadius: '8px',
                    color: 'var(--sidebar-text)',
                    fontSize: '14px',
                    fontFamily: 'inherit',
                    resize: 'vertical',
                    lineHeight: '1.5',
                  }}
                />
              </div>
            </div>

            {/* Duration Section */}
            <DurationSection store={store} element={element} />
          </>
        ) : activeTab === 'style' ? (
          <>
            {/* Style Section */}
            <div className="section">
              <div className="section-title">Style</div>

              {/* Position - only show for single selection */}
              {!isMultiSelect && (
                <div className="control-row">
                  <span className="control-label">Position</span>
                  <div className="control-value">
                    <div className="position-row">
                      <div className="position-field">
                        <input
                          type="number"
                          className="position-input"
                          value={Math.round(element.x)}
                          onChange={(e) => {
                            const value = parseFloat(e.target.value);
                            applyToAll({ x: isNaN(value) ? 0 : value });
                          }}
                        />
                        <label>X</label>
                      </div>
                      <div className="position-field">
                        <input
                          type="number"
                          className="position-input"
                          value={Math.round(element.y)}
                          onChange={(e) => {
                            const value = parseFloat(e.target.value);
                            applyToAll({ y: isNaN(value) ? 0 : value });
                          }}
                        />
                        <label>Y</label>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Rotation */}
              <div className="control-row">
                <span className="control-label">Rotation</span>
                <div className="control-value">
                  <input
                    type="number"
                    className="position-input"
                    value={Math.round(element.rotation ?? 0)}
                    onChange={(e) => {
                      const value = parseFloat(e.target.value);
                      applyToAll({ rotation: isNaN(value) ? 0 : value });
                    }}
                  />
                  <span style={{ color: 'var(--sidebar-text-muted)', fontSize: '11px' }}>°</span>
                </div>
              </div>

              {/* Size */}
              <div className="control-row">
                <span className="control-label">Size</span>
                <div className="control-value">
                  <input
                    type="number"
                    className="position-input"
                    value={Math.round(element.fontSize ?? 16)}
                    onChange={(e) => {
                      const value = parseFloat(e.target.value);
                      applyToAll({ fontSize: isNaN(value) ? 16 : value });
                    }}
                  />
                </div>
              </div>

              {/* Font Family */}
              <div className="control-row">
                <span className="control-label">Font</span>
                <div className="control-value">
                  <div className="select-wrapper" style={{ width: '120px' }}>
                    <select
                      className="select-input"
                      value={element.fontFamily || 'Inter'}
                      onChange={(e) => applyToAll({ fontFamily: e.target.value })}
                    >
                      {fontFamilies.map(font => (
                        <option key={font} value={font}>{font}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Font Weight */}
              <div className="control-row">
                <span className="control-label"></span>
                <div className="control-value">
                  <div className="select-wrapper" style={{ width: '120px' }}>
                    <select
                      className="select-input"
                      value={element.fontWeight || '400'}
                      onChange={(e) => applyToAll({ fontWeight: e.target.value })}
                    >
                      {fontWeights.map(w => (
                        <option key={w.value} value={w.value}>{w.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Text Style Buttons */}
              <div className="control-row">
                <span className="control-label"></span>
                <div className="control-value">
                  <div className="text-style-group">
                    <button
                      className={`text-style-btn ${element.fontWeight === 'bold' || element.fontWeight >= 700 ? 'active' : ''}`}
                      onClick={() => {
                        const isBold = element.fontWeight === 'bold' || element.fontWeight >= 700;
                        applyToAll({ fontWeight: isBold ? '400' : '700' });
                      }}
                      title="Bold"
                    >
                      Aa
                    </button>
                    <button
                      className={`text-style-btn ${element.fontStyle === 'italic' ? 'active' : ''}`}
                      onClick={() => applyToAll({ fontStyle: element.fontStyle === 'italic' ? 'normal' : 'italic' })}
                      title="Italic"
                      style={{ fontStyle: 'italic' }}
                    >
                      Aa
                    </button>
                    <button
                      className={`text-style-btn ${element.textDecoration === 'underline' ? 'active' : ''}`}
                      onClick={() => applyToAll({ textDecoration: element.textDecoration === 'underline' ? '' : 'underline' })}
                      title="Underline"
                      style={{ textDecoration: 'underline' }}
                    >
                      Aa
                    </button>
                    <button
                      className={`text-style-btn ${element.textDecoration === 'line-through' ? 'active' : ''}`}
                      onClick={() => applyToAll({ textDecoration: element.textDecoration === 'line-through' ? '' : 'line-through' })}
                      title="Strikethrough"
                      style={{ textDecoration: 'line-through' }}
                    >
                      Ae
                    </button>
                  </div>
                </div>
              </div>

              {/* Highlight / Background */}
              <div className="control-row">
                <span className="control-label">Highlight</span>
                <div className="control-value">
                  <div className="select-wrapper" style={{ width: '120px' }}>
                    <select className="select-input" defaultValue="none">
                      <option value="none">None</option>
                      <option value="solid">Solid</option>
                      <option value="gradient">Gradient</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Alignment */}
              <div className="control-row">
                <span className="control-label">Alignment</span>
                <div className="control-value">
                  <div className="alignment-group">
                    <button
                      className={`align-btn ${element.align === 'left' ? 'active' : ''}`}
                      onClick={() => applyToAll({ align: 'left' })}
                      title="Align Left"
                    >
                      ☰
                    </button>
                    <button
                      className={`align-btn ${element.align === 'center' ? 'active' : ''}`}
                      onClick={() => applyToAll({ align: 'center' })}
                      title="Align Center"
                    >
                      ☰
                    </button>
                    <button
                      className={`align-btn ${element.align === 'right' ? 'active' : ''}`}
                      onClick={() => applyToAll({ align: 'right' })}
                      title="Align Right"
                    >
                      ☰
                    </button>
                  </div>
                </div>
              </div>

              {/* Vertical Alignment */}
              <div className="control-row">
                <span className="control-label"></span>
                <div className="control-value">
                  <div className="alignment-group">
                    <button className="align-btn" title="Top">↑</button>
                    <button className="align-btn active" title="Middle">↕</button>
                    <button className="align-btn" title="Bottom">↓</button>
                  </div>
                </div>
              </div>

              {/* Text Color */}
              <div className="control-row">
                <span className="control-label">Text Color</span>
                <div className="control-value">
                  <ColorPicker
                    value={element.fill || '#000000'}
                    onChange={(color) => applyToAll({ fill: color })}
                  />
                </div>
              </div>
            </div>

            {/* Duration Section */}
            <DurationSection store={store} element={element} />
          </>
        ) : (
          /* Animation Tab */
          <AnimationSection store={store} element={element} />
        )}
      </div>

      <div className="settings-footer">
        <div className="action-buttons">
          <button
            className="action-btn delete"
            onClick={() => store.deleteElements(targetElements.map((el) => el.id))}
          >
            <span><TrashIcon /></span> {isMultiSelect ? 'Delete All' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
});
