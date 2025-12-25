import { observer } from 'mobx-react-lite';
import { useState } from 'react';
import { DurationSection, AnimationSection } from '../shared/CommonControls';

/**
 * Image element settings panel - Storyly-inspired dark theme
 */
export const ImageSettings = observer(({ store, element }) => {
  const [activeTab, setActiveTab] = useState('general');
  
  if (!element) return null;

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

              {/* Border Radius */}
              <div className="control-row">
                <span className="control-label">Radius</span>
                <div className="control-value">
                  <div className="slider-container">
                    <input
                      type="number"
                      className="slider-input"
                      value={Math.round(element.cornerRadius || 0)}
                      onChange={(e) => element.set({ cornerRadius: parseFloat(e.target.value) || 0 })}
                    />
                    <div className="slider-track">
                      <input
                        type="range"
                        min={0}
                        max={200}
                        value={element.cornerRadius || 0}
                        onChange={(e) => element.set({ cornerRadius: parseInt(e.target.value) })}
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

              {/* Brightness */}
              <div className="control-row">
                <span className="control-label">Brightness</span>
                <div className="control-value">
                  <div className="slider-container">
                    <input
                      type="number"
                      className="slider-input"
                      value={Math.round((element.brightness ?? 0) * 100)}
                      onChange={(e) => element.set({ brightness: (parseInt(e.target.value) || 0) / 100 })}
                    />
                    <div className="slider-track">
                      <input
                        type="range"
                        min={-100}
                        max={100}
                        value={Math.round((element.brightness ?? 0) * 100)}
                        onChange={(e) => element.set({ brightness: parseInt(e.target.value) / 100 })}
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
                      onChange={(e) => element.set({ contrast: (parseInt(e.target.value) || 0) / 100 })}
                    />
                    <div className="slider-track">
                      <input
                        type="range"
                        min={-100}
                        max={100}
                        value={Math.round((element.contrast ?? 0) * 100)}
                        onChange={(e) => element.set({ contrast: parseInt(e.target.value) / 100 })}
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
