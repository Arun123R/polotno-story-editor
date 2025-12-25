import { observer } from 'mobx-react-lite';
import { useState } from 'react';
import { DurationSection, AnimationSection } from '../shared/CommonControls';

/**
 * SVG element settings panel - Storyly-inspired dark theme
 */
export const SvgSettings = observer(({ store, element }) => {
  const [activeTab, setActiveTab] = useState('general');
  
  if (!element) return null;

  return (
    <div className="settings-panel svg-settings">
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

              {/* Fill Color */}
              <div className="control-row">
                <span className="control-label">Fill Color</span>
                <div className="control-value">
                  <div className="color-picker-row">
                    <div 
                      className="color-swatch" 
                      style={{ backgroundColor: element.fill || '#DDDDE5' }}
                    >
                      <input
                        type="color"
                        value={element.fill || '#DDDDE5'}
                        onChange={(e) => element.set({ fill: e.target.value })}
                      />
                    </div>
                    <input
                      type="text"
                      className="color-input-text"
                      value={element.fill || '#DDDDE5'}
                      onChange={(e) => element.set({ fill: e.target.value })}
                      style={{ width: '80px' }}
                    />
                  </div>
                </div>
              </div>

              {/* Border */}
              <div className="control-row">
                <span className="control-label">Border</span>
                <div className="control-value">
                  <div className="slider-container">
                    <input
                      type="number"
                      className="slider-input"
                      value={Math.round(element.strokeWidth || 0)}
                      onChange={(e) => element.set({ strokeWidth: parseFloat(e.target.value) || 0 })}
                    />
                    <div className="slider-track">
                      <input
                        type="range"
                        min={0}
                        max={20}
                        value={element.strokeWidth || 0}
                        onChange={(e) => element.set({ strokeWidth: parseInt(e.target.value) })}
                      />
                      <div className="slider-fill" style={{ width: `${((element.strokeWidth || 0) / 20) * 100}%` }}>
                        <div className="slider-thumb" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Border Color */}
              {(element.strokeWidth || 0) > 0 && (
                <div className="control-row">
                  <span className="control-label">Border Color</span>
                  <div className="control-value">
                    <div className="color-picker-row">
                      <div 
                        className="color-swatch" 
                        style={{ backgroundColor: element.stroke || '#000000' }}
                      >
                        <input
                          type="color"
                          value={element.stroke || '#000000'}
                          onChange={(e) => element.set({ stroke: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Opacity */}
              <div className="control-row">
                <span className="control-label">Opacity</span>
                <div className="control-value">
                  <div className="slider-container">
                    <input
                      type="number"
                      className="slider-input"
                      value={Math.round((element.opacity ?? 1) * 100)}
                      onChange={(e) => element.set({ opacity: (parseInt(e.target.value) || 0) / 100 })}
                      min={0}
                      max={100}
                    />
                    <div className="slider-track">
                      <input
                        type="range"
                        min={0}
                        max={100}
                        value={Math.round((element.opacity ?? 1) * 100)}
                        onChange={(e) => element.set({ opacity: parseInt(e.target.value) / 100 })}
                      />
                      <div className="slider-fill" style={{ width: `${(element.opacity ?? 1) * 100}%` }}>
                        <div className="slider-thumb" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Flip Controls */}
              <div className="control-row">
                <span className="control-label">Flip</span>
                <div className="control-value">
                  <div className="alignment-group">
                    <button
                      className={`align-btn ${element.flipX ? 'active' : ''}`}
                      onClick={() => element.set({ flipX: !element.flipX })}
                      title="Flip Horizontal"
                    >
                      ↔
                    </button>
                    <button
                      className={`align-btn ${element.flipY ? 'active' : ''}`}
                      onClick={() => element.set({ flipY: !element.flipY })}
                      title="Flip Vertical"
                    >
                      ↕
                    </button>
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
