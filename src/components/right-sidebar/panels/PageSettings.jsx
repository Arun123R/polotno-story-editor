import { observer } from 'mobx-react-lite';
import { useState, useEffect } from 'react';
import { DurationSection } from '../shared/CommonControls';
import { getStorePresetName } from '../../../utils/scale';
import { setStorePreset } from '../../../store/polotnoStore';

/**
 * Page settings panel (when no element is selected) - Storyly-inspired dark theme
 */
export const PageSettings = observer(({ store }) => {
  const activePage = store.activePage;

  // UI-only preset state (NO store change)
  const [activePreset, setActivePreset] = useState(getStorePresetName(store));

  // Keep UI in sync with store preset.
  useEffect(() => {
    setActivePreset(getStorePresetName(store));
  }, [store]);

  if (!activePage) return null;

  return (
    <div className="settings-panel page-settings">
      {/* Tab Navigation */}
      <div className="sidebar-tabs">
        <button className="sidebar-tab active">General</button>
        <button className="sidebar-tab">Animation</button>
      </div>

      <div className="settings-content">
        <div className="section">
          <div className="section-title">Page</div>

          {/* Background */}
          <div className="control-row">
            <span className="control-label">Background</span>
            <div className="control-value">
              <div className="color-picker-row">
                <div
                  className="color-swatch"
                  style={{ backgroundColor: activePage.background || '#ffffff' }}
                >
                  <input
                    type="color"
                    value={activePage.background || '#ffffff'}
                    onChange={(e) =>
                      activePage.set({ background: e.target.value })
                    }
                  />
                </div>
                <input
                  type="text"
                  className="color-input-text"
                  value={activePage.background || '#ffffff'}
                  onChange={(e) =>
                    activePage.set({ background: e.target.value })
                  }
                  style={{ width: '80px' }}
                />
              </div>
            </div>
          </div>

          {/* Size */}
          <div className="control-row">
            <span className="control-label">Size</span>
            <div className="control-value">
              <div className="position-row">
                <div className="position-field">
                  <input
                    type="number"
                    className="position-input"
                    value={store.width}
                    disabled
                  />
                  <label>W</label>
                </div>
                <div className="position-field">
                  <input
                    type="number"
                    className="position-input"
                    value={store.height}
                    disabled
                  />
                  <label>H</label>
                </div>
              </div>
            </div>
          </div>

          {/* Presets */}
          <div className="control-row">
            <span className="control-label">Presets</span>
            <div className="control-value">
              <div className="segment-group">
                <button
                  className={`segment-btn ${activePreset === 'story' ? 'active' : ''
                    }`}
                  onClick={() => {
                    setActivePreset('story');
                    setStorePreset(store, 'story', { rescaleExisting: true });
                  }}
                >
                  Story
                </button>

                <button
                  className={`segment-btn ${activePreset === 'square' ? 'active' : ''
                    }`}
                  onClick={() => {
                    setActivePreset('square');
                    setStorePreset(store, 'square', { rescaleExisting: true });
                  }}
                >
                  Square
                </button>

                <button
                  className={`segment-btn ${activePreset === 'wide' ? 'active' : ''
                    }`}
                  onClick={() => {
                    setActivePreset('wide');
                    setStorePreset(store, 'wide', { rescaleExisting: true });
                  }}
                >
                  Wide
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Duration Section */}
        <DurationSection store={store} />

        {/* Page Actions */}
        <div className="action-buttons">
          <button
            className="action-btn delete"
            onClick={() => store.deletePages([activePage.id])}
            disabled={store.pages.length <= 1}
            style={{ opacity: store.pages.length <= 1 ? 0.5 : 1 }}
          >
            <span>🗑</span> Delete
          </button>
        </div>

        {/* Page Info */}
        <div
          style={{
            marginTop: '16px',
            textAlign: 'center',
            fontSize: '11px',
            color: 'var(--sidebar-text-muted)',
          }}
        >
          Page {store.pages.indexOf(activePage) + 1} of {store.pages.length}
        </div>
      </div>
    </div>
  );
});
PageSettings.displayName = 'PageSettings';