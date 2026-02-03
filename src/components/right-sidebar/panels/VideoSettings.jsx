import { observer } from 'mobx-react-lite';
import { useState } from 'react';
import { DurationSection, AnimationSection, TrashIcon } from '../shared/CommonControls';

/**
 * Video element settings panel - Storyly-inspired dark theme
 * Supports both single and multi-element selection
 */
export const VideoSettings = observer(({ store, element, elements = [], isMultiSelect = false }) => {
  const [activeTab, setActiveTab] = useState('general');

  if (!element) return null;

  // Get all elements to modify (single or multiple)
  const targetElements = isMultiSelect && elements.length > 0 ? elements : [element];

  // Helper to apply changes to all selected elements
  const applyToAll = (changes) => {
    targetElements.forEach(el => el.set(changes));
  };

  return (
    <div className="settings-panel video-settings">
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
            <strong>{targetElements.length}</strong> video elements selected
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

              {/* Opacity */}
              <div className="control-row">
                <span className="control-label">Opacity</span>
                <div className="control-value">
                  <div className="slider-container">
                    <input
                      type="number"
                      className="slider-input"
                      value={Math.round((element.opacity ?? 1) * 100)}
                      onChange={(e) => {
                        const value = parseInt(e.target.value);
                        applyToAll({ opacity: (isNaN(value) ? 0 : value) / 100 });
                      }}
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

              {/* Volume */}
              <div className="control-row">
                <span className="control-label">Volume</span>
                <div className="control-value">
                  <div className="slider-container">
                    <input
                      type="number"
                      className="slider-input"
                      value={Math.round((element.volume ?? 1) * 100)}
                      onChange={(e) => {
                        const value = parseInt(e.target.value);
                        applyToAll({ volume: (isNaN(value) ? 0 : value) / 100 });
                      }}
                      min={0}
                      max={100}
                    />
                    <div className="slider-track">
                      <input
                        type="range"
                        min={0}
                        max={100}
                        value={Math.round((element.volume ?? 1) * 100)}
                        onChange={(e) => applyToAll({ volume: parseInt(e.target.value) / 100 })}
                      />
                      <div className="slider-fill" style={{ width: `${(element.volume ?? 1) * 100}%` }}>
                        <div className="slider-thumb" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Mute */}
              <div className="control-row">
                <span className="control-label">Audio</span>
                <div className="control-value">
                  <button
                    className={`align-btn ${element.muted ? 'active' : ''}`}
                    onClick={() => applyToAll({ muted: !element.muted })}
                    style={{ width: 'auto', padding: '6px 12px' }}
                  >
                    {element.muted ? '🔇 Muted' : '🔊 On'}
                  </button>
                </div>
              </div>

              {/* Loop */}
              <div className="control-row">
                <span className="control-label">Loop</span>
                <div className="control-value">
                  <button
                    className={`align-btn ${element.loop ? 'active' : ''}`}
                    onClick={() => applyToAll({ loop: !element.loop })}
                    style={{ width: 'auto', padding: '6px 12px' }}
                  >
                    {element.loop ? '🔁 On' : '➡️ Off'}
                  </button>
                </div>
              </div>

              {/* Corner Radius */}
              <div className="control-row">
                <span className="control-label">Radius</span>
                <div className="control-value">
                  <div className="slider-container">
                    <input
                      type="number"
                      className="slider-input"
                      value={Math.round(element.cornerRadius ?? 0)}
                      onChange={(e) => {
                        const value = parseFloat(e.target.value);
                        applyToAll({ cornerRadius: isNaN(value) ? 0 : value });
                      }}
                    />
                    <div className="slider-track">
                      <input
                        type="range"
                        min={0}
                        max={200}
                        value={element.cornerRadius ?? 0}
                        onChange={(e) => applyToAll({ cornerRadius: parseInt(e.target.value) })}
                      />
                      <div className="slider-fill" style={{ width: `${((element.cornerRadius ?? 0) / 200) * 100}%` }}>
                        <div className="slider-thumb" />
                      </div>
                    </div>
                  </div>
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
