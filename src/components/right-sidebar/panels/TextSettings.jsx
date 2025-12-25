import { observer } from 'mobx-react-lite';
import { useState } from 'react';
import {
  PositionSection,
  OpacitySlider,
  ActionButtons,
  DurationSection,
  AnimationSection,
} from '../shared/CommonControls';

/**
 * Text element settings panel - Storyly-inspired dark theme
 */
export const TextSettings = observer(({ store, element }) => {
  const [activeTab, setActiveTab] = useState('general');
  
  if (!element) return null;

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
          General
        </button>
        <button 
          className={`sidebar-tab ${activeTab === 'animation' ? 'active' : ''}`}
          onClick={() => setActiveTab('animation')}
        >
          Animation
        </button>
      </div>

      <div className="settings-content" style={{ padding: '16px' }}>
        {activeTab === 'general' ? (
          <>
            {/* Style Section */}
            <div className="section">
              <div className="section-title">Style</div>

              {/* Position */}
              <div className="control-row">
                <span className="control-label">Position</span>
                <div className="control-value">
                  <div className="position-row">
                    <div className="position-field">
                      <input
                        type="number"
                        className="position-input"
                        value={Math.round(element.x)}
                        onChange={(e) => element.set({ x: parseFloat(e.target.value) || 0 })}
                      />
                      <label>X</label>
                    </div>
                    <div className="position-field">
                      <input
                        type="number"
                        className="position-input"
                        value={Math.round(element.y)}
                        onChange={(e) => element.set({ y: parseFloat(e.target.value) || 0 })}
                      />
                      <label>Y</label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Rotation */}
              <div className="control-row">
                <span className="control-label">Rotation</span>
                <div className="control-value">
                  <input
                    type="number"
                    className="position-input"
                    value={Math.round(element.rotation || 0)}
                    onChange={(e) => element.set({ rotation: parseFloat(e.target.value) || 0 })}
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
                    value={Math.round(element.fontSize || 16)}
                    onChange={(e) => element.set({ fontSize: parseFloat(e.target.value) || 16 })}
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
                      onChange={(e) => element.set({ fontFamily: e.target.value })}
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
                      onChange={(e) => element.set({ fontWeight: e.target.value })}
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
                        element.set({ fontWeight: isBold ? '400' : '700' });
                      }}
                      title="Bold"
                    >
                      Aa
                    </button>
                    <button
                      className={`text-style-btn ${element.fontStyle === 'italic' ? 'active' : ''}`}
                      onClick={() => element.set({ fontStyle: element.fontStyle === 'italic' ? 'normal' : 'italic' })}
                      title="Italic"
                      style={{ fontStyle: 'italic' }}
                    >
                      Aa
                    </button>
                    <button
                      className={`text-style-btn ${element.textDecoration === 'underline' ? 'active' : ''}`}
                      onClick={() => element.set({ textDecoration: element.textDecoration === 'underline' ? '' : 'underline' })}
                      title="Underline"
                      style={{ textDecoration: 'underline' }}
                    >
                      Aa
                    </button>
                    <button
                      className={`text-style-btn ${element.textDecoration === 'line-through' ? 'active' : ''}`}
                      onClick={() => element.set({ textDecoration: element.textDecoration === 'line-through' ? '' : 'line-through' })}
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
                      onClick={() => element.set({ align: 'left' })}
                      title="Align Left"
                    >
                      ☰
                    </button>
                    <button
                      className={`align-btn ${element.align === 'center' ? 'active' : ''}`}
                      onClick={() => element.set({ align: 'center' })}
                      title="Align Center"
                    >
                      ☰
                    </button>
                    <button
                      className={`align-btn ${element.align === 'right' ? 'active' : ''}`}
                      onClick={() => element.set({ align: 'right' })}
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
                  <div className="color-picker-row">
                    <div 
                      className="color-swatch" 
                      style={{ backgroundColor: element.fill || '#000000' }}
                    >
                      <input
                        type="color"
                        value={element.fill || '#000000'}
                        onChange={(e) => element.set({ fill: e.target.value })}
                      />
                    </div>
                    <input
                      type="text"
                      className="color-input-text"
                      value={element.fill || '#000000'}
                      onChange={(e) => element.set({ fill: e.target.value })}
                      style={{ width: '80px' }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Duration Section */}
            <DurationSection store={store} element={element} />

            {/* Action Buttons */}
            <div className="action-buttons">
              <button className="action-btn delete" onClick={() => store.deleteElements([element.id])}>
                <span>🗑</span> Delete
              </button>
            </div>
          </>
        ) : (
          /* Animation Tab */
          <AnimationSection store={store} element={element} />
        )}
      </div>
    </div>
  );
});
