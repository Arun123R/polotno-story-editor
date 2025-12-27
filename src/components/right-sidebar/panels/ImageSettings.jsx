import { observer } from 'mobx-react-lite';
import { useState } from 'react';
import { DurationSection, AnimationSection } from '../shared/CommonControls';

/**
 * Image element settings panel - Storyly-inspired dark theme
 * Supports both single and multi-element selection
 */
export const ImageSettings = observer(({ store, element, elements = [], isMultiSelect = false }) => {
  const [activeTab, setActiveTab] = useState('general');
  
  if (!element) return null;

  // Get all elements to modify (single or multiple)
  const targetElements = isMultiSelect && elements.length > 0 ? elements : [element];
  
  // Helper to apply changes to all selected elements
  const applyToAll = (changes) => {
    targetElements.forEach(el => el.set(changes));
  };

  return (
    <div className="settings-panel image-settings">
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
            <strong>{targetElements.length}</strong> image elements selected
          </div>
        )}

        {activeTab === 'general' ? (
          <>
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
                          onChange={(e) => applyToAll({ x: parseFloat(e.target.value) || 0 })}
                        />
                        <label>X</label>
                      </div>
                      <div className="position-field">
                        <input
                          type="number"
                          className="position-input"
                          value={Math.round(element.y)}
                          onChange={(e) => applyToAll({ y: parseFloat(e.target.value) || 0 })}
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
                    value={Math.round(element.rotation || 0)}
                    onChange={(e) => applyToAll({ rotation: parseFloat(e.target.value) || 0 })}
                  />
                  <span style={{ color: 'var(--sidebar-text-muted)', fontSize: '11px' }}>°</span>
                </div>
              </div>

              {/* Opacity */}
              <div className="control-row">
                <span className="control-label">Opacity</span>
                <div className="control-value">
                  <div className="slider-container">
                    <input
                      type="number"
                      className="slider-input"
                      value={Math.round((element.opacity ?? 1) * 100)}
                      onChange={(e) => applyToAll({ opacity: (parseInt(e.target.value) || 0) / 100 })}
                      min={0}
                      max={100}
                    />
                    <div className="slider-track">
                      <input
                        type="range"
                        min={0}
                        max={100}
                        value={Math.round((element.opacity ?? 1) * 100)}
                        onChange={(e) => applyToAll({ opacity: parseInt(e.target.value) / 100 })}
                      />
                      <div className="slider-fill" style={{ width: `${(element.opacity ?? 1) * 100}%` }}>
                        <div className="slider-thumb" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Border Radius */}
              <div className="control-row">
                <span className="control-label">Radius</span>
                <div className="control-value">
                  <div className="slider-container">
                    <input
                      type="number"
                      className="slider-input"
                      value={Math.round(element.cornerRadius || 0)}
                      onChange={(e) => applyToAll({ cornerRadius: parseFloat(e.target.value) || 0 })}
                    />
                    <div className="slider-track">
                      <input
                        type="range"
                        min={0}
                        max={200}
                        value={element.cornerRadius || 0}
                        onChange={(e) => applyToAll({ cornerRadius: parseInt(e.target.value) })}
                      />
                      <div className="slider-fill" style={{ width: `${((element.cornerRadius || 0) / 200) * 100}%` }}>
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
                      onClick={() => applyToAll({ flipX: !element.flipX })}
                      title="Flip Horizontal"
                    >
                      ↔
                    </button>
                    <button
                      className={`align-btn ${element.flipY ? 'active' : ''}`}
                      onClick={() => applyToAll({ flipY: !element.flipY })}
                      title="Flip Vertical"
                    >
                      ↕
                    </button>
                  </div>
                </div>
              </div>

              {/* Brightness */}
              <div className="control-row">
                <span className="control-label">Brightness</span>
                <div className="control-value">
                  <div className="slider-container">
                    <input
                      type="number"
                      className="slider-input"
                      value={Math.round((element.brightness ?? 0) * 100)}
                      onChange={(e) => applyToAll({ brightness: (parseInt(e.target.value) || 0) / 100 })}
                    />
                    <div className="slider-track">
                      <input
                        type="range"
                        min={-100}
                        max={100}
                        value={Math.round((element.brightness ?? 0) * 100)}
                        onChange={(e) => applyToAll({ brightness: parseInt(e.target.value) / 100 })}
                      />
                      <div className="slider-fill" style={{ width: `${((element.brightness ?? 0) + 1) * 50}%` }}>
                        <div className="slider-thumb" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Contrast */}
              <div className="control-row">
                <span className="control-label">Contrast</span>
                <div className="control-value">
                  <div className="slider-container">
                    <input
                      type="number"
                      className="slider-input"
                      value={Math.round((element.contrast ?? 0) * 100)}
                      onChange={(e) => applyToAll({ contrast: (parseInt(e.target.value) || 0) / 100 })}
                    />
                    <div className="slider-track">
                      <input
                        type="range"
                        min={-100}
                        max={100}
                        value={Math.round((element.contrast ?? 0) * 100)}
                        onChange={(e) => applyToAll({ contrast: parseInt(e.target.value) / 100 })}
                      />
                      <div className="slider-fill" style={{ width: `${((element.contrast ?? 0) + 1) * 50}%` }}>
                        <div className="slider-thumb" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Duration Section */}
            <DurationSection store={store} element={element} />

            {/* Action Buttons */}
            <div className="action-buttons">
              <button 
                className="action-btn delete" 
                onClick={() => store.deleteElements(targetElements.map(el => el.id))}
              >
                <span>🗑</span> {isMultiSelect ? 'Delete All' : 'Delete'}
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
