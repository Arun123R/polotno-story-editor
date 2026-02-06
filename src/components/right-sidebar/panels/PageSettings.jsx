import { observer } from 'mobx-react-lite';
import { useEffect, useState } from 'react';

import { DurationSection, TrashIcon } from '../shared/CommonControls';
import { ColorPicker } from '../shared/ColorPicker';

import { getStorePresetName } from '../../../utils/scale';
import { setStorePreset } from '../../../store/polotnoStore';
import {
  DEFAULT_SLIDE_BACKGROUND,
  normalizeSlideBackground,
  applySlideBackgroundToPage,
} from '../../../utils/slideBackground';

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

  const isSlideActive = activePage.custom?.isActive !== false;
  const allSlidesInactive = Array.isArray(store.pages) && store.pages.length > 0
    ? store.pages.every((p) => p?.custom?.isActive === false)
    : false;

  const currentBg = normalizeSlideBackground(
    activePage.custom?.background || DEFAULT_SLIDE_BACKGROUND
  );

  const [colorPickerMode, setColorPickerMode] = useState(currentBg.color?.type === 'gradient' ? 'gradient' : 'solid');

  useEffect(() => {
    setColorPickerMode(currentBg.color?.type === 'gradient' ? 'gradient' : 'solid');
  }, [activePage.id, currentBg.color?.type]);

  const setBackgroundPatch = (nextBg) => {
    const custom = activePage.custom || {};
    activePage.set({ custom: { ...custom, background: nextBg } });
    applySlideBackgroundToPage(activePage);
  };

  const setColorSolid = (solid) => {
    setBackgroundPatch({
      ...currentBg,
      color: {
        type: 'solid',
        solid,
      },
    });
  };

  const setColorGradient = (patch) => {
    const prev = currentBg.color?.type === 'gradient' ? currentBg.color.gradient : null;
    setBackgroundPatch({
      ...currentBg,
      color: {
        type: 'gradient',
        gradient: {
          from: prev?.from || '#FF0000',
          to: prev?.to || '#0000FF',
          direction: prev?.direction || 'top',
          ...patch,
        },
      },
    });
  };

  const setMedia = (patchOrNull) => {
    if (!patchOrNull) {
      setBackgroundPatch({
        ...currentBg,
        media: null,
      });
      return;
    }

    const prev = currentBg.media || {
      mediaUrl: '',
      sizing: 'fit',
      position: 'bottom-center',
    };
    setBackgroundPatch({
      ...currentBg,
      media: {
        ...prev,
        ...patchOrNull,
      },
    });
  };

  const extractDominantColor = (url) => {
    return new Promise((resolve) => {
      if (!url) return resolve(null);
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d', { willReadFrequently: true });
          if (!ctx) return resolve(null);

          const sampleW = 24;
          const sampleH = 24;
          canvas.width = sampleW;
          canvas.height = sampleH;
          ctx.drawImage(img, 0, 0, sampleW, sampleH);
          const { data } = ctx.getImageData(0, 0, sampleW, sampleH);

          let r = 0;
          let g = 0;
          let b = 0;
          let count = 0;
          for (let i = 0; i < data.length; i += 4) {
            const a = data[i + 3];
            if (a < 32) continue;
            r += data[i];
            g += data[i + 1];
            b += data[i + 2];
            count += 1;
          }
          if (!count) return resolve(null);
          r = Math.round(r / count);
          g = Math.round(g / count);
          b = Math.round(b / count);
          const hex = `#${r.toString(16).padStart(2, '0')}${g
            .toString(16)
            .padStart(2, '0')}${b.toString(16).padStart(2, '0')}`.toUpperCase();
          resolve(hex);
        } catch {
          resolve(null);
        }
      };
      img.onerror = () => resolve(null);
      img.src = url;
    });
  };

  const handlePickMediaFile = (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = typeof reader.result === 'string' ? reader.result : '';
      const currentSolid =
        currentBg.color?.type === 'solid' ? (currentBg.color.solid || '#FFFFFF').toUpperCase() : null;
      const shouldAutoColor = currentSolid === '#FFFFFF';

      setMedia({ mediaUrl: dataUrl });

      if (shouldAutoColor) {
        extractDominantColor(dataUrl).then((hex) => {
          if (hex) setColorSolid(hex);
        });
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="settings-panel page-settings">
      <div className="sidebar-tabs">
        <button className="sidebar-tab active">General</button>
        <button className="sidebar-tab">Animation</button>
      </div>

      <div className="settings-content">
        <div className="section">
          <div className="section-title">Page</div>

          <div className="control-row">
            <span className="control-label">Slide Status</span>
            <div className="control-value" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <label className="toggle-switch" title={isSlideActive ? 'Active' : 'Inactive'}>
                <input
                  type="checkbox"
                  checked={isSlideActive}
                  onChange={(e) => {
                    const next = e.target.checked;
                    activePage.set({
                      custom: {
                        ...(activePage.custom || {}),
                        isActive: next,
                      },
                    });
                  }}
                />
                <span className="toggle-slider" />
              </label>
              <span style={{ fontSize: 12, color: 'var(--sidebar-text-secondary)' }}>
                {isSlideActive ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>

          {allSlidesInactive ? (
            <div
              style={{
                marginTop: 8,
                padding: '8px 10px',
                borderRadius: 8,
                background: 'rgba(245, 158, 11, 0.12)',
                border: '1px solid rgba(245, 158, 11, 0.25)',
                color: 'var(--sidebar-text)',
                fontSize: 12,
              }}
            >
              At least one slide must be active.
            </div>
          ) : null}

          <div className="control-row">
            <span className="control-label">Background</span>
          </div>

          <div className="control-row" style={{ alignItems: 'flex-start' }}>
            <span className="control-label">Color</span>
            <div
              className="control-value"
              style={{
                width: 220,
                flexDirection: 'column',
                alignItems: 'stretch',
                justifyContent: 'flex-start',
                gap: 10,
              }}
            >
              <div className="segment-group" style={{ width: '100%' }}>
                <button
                  className={`segment-btn ${colorPickerMode === 'solid' ? 'active' : ''}`}
                  onClick={() => setColorPickerMode('solid')}
                  type="button"
                >
                  Solid
                </button>
                <button
                  className={`segment-btn ${colorPickerMode === 'gradient' ? 'active' : ''}`}
                  onClick={() => setColorPickerMode('gradient')}
                  type="button"
                >
                  Gradient
                </button>
              </div>

              {colorPickerMode === 'solid' ? (
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <ColorPicker
                    value={currentBg.color?.type === 'solid' ? currentBg.color.solid : '#FFFFFF'}
                    onChange={(color) => setColorSolid(color)}
                  />
                </div>
              ) : (
                <>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                    <span style={{ fontSize: 12, color: 'var(--sidebar-text-muted)', minWidth: 56 }}>From</span>
                    <ColorPicker
                      value={
                        currentBg.color?.type === 'gradient'
                          ? currentBg.color.gradient?.from || '#FF0000'
                          : '#FF0000'
                      }
                      onChange={(color) => setColorGradient({ from: color })}
                    />
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                    <span style={{ fontSize: 12, color: 'var(--sidebar-text-muted)', minWidth: 56 }}>To</span>
                    <ColorPicker
                      value={
                        currentBg.color?.type === 'gradient'
                          ? currentBg.color.gradient?.to || '#0000FF'
                          : '#0000FF'
                      }
                      onChange={(color) => setColorGradient({ to: color })}
                    />
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <span style={{ fontSize: 12, color: 'var(--sidebar-text-muted)' }}>Direction</span>
                    <div className="select-wrapper" style={{ position: 'relative', width: '100%' }}>
                      <select
                        className="select-input"
                        value={
                          currentBg.color?.type === 'gradient'
                            ? currentBg.color.gradient?.direction || 'top'
                            : 'top'
                        }
                        onChange={(e) => setColorGradient({ direction: e.target.value })}
                        style={{ padding: '8px 32px 8px 12px', borderRadius: 8, width: '100%' }}
                      >
                        <option value="top">Top</option>
                        <option value="bottom">Bottom</option>
                        <option value="left">Left</option>
                        <option value="right">Right</option>
                        <option value="radial">Radial</option>
                      </select>
                      <div
                        style={{
                          position: 'absolute',
                          right: 12,
                          top: '50%',
                          transform: 'translateY(-50%)',
                          pointerEvents: 'none',
                          fontSize: 10,
                          color: '#718096',
                        }}
                      >
                        ▼
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="control-row" style={{ alignItems: 'center' }}>
            <span className="control-label">Media</span>
            <div
              className="control-value"
              style={{
                width: 220,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'flex-end',
                gap: 8,
              }}
            >
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <label
                  style={{
                    padding: '8px 10px',
                    borderRadius: 8,
                    border: '1px solid var(--sidebar-border)',
                    background: 'var(--sidebar-bg-secondary)',
                    color: 'var(--sidebar-text)',
                    cursor: 'pointer',
                    fontSize: 12,
                    fontWeight: 600,
                    whiteSpace: 'nowrap',
                  }}
                >
                  Upload
                  <input
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={(e) => handlePickMediaFile(e.target.files?.[0])}
                  />
                </label>

                {currentBg.media?.mediaUrl ? (
                  <button
                    type="button"
                    onClick={() => setMedia(null)}
                    style={{
                      padding: '8px 10px',
                      borderRadius: 8,
                      border: '1px solid var(--sidebar-border)',
                      background: 'transparent',
                      color: 'var(--sidebar-text-secondary)',
                      cursor: 'pointer',
                      fontSize: 12,
                      fontWeight: 600,
                      whiteSpace: 'nowrap',
                    }}
                  >
                    Remove
                  </button>
                ) : null}
              </div>
            </div>
          </div>

          {currentBg.media?.mediaUrl ? (
            <div className="control-row">
              <span className="control-label">Sizing</span>
              <div className="control-value">
                <div className="segment-group" style={{ width: 160 }}>
                  <button
                    className={`segment-btn ${currentBg.media?.sizing !== 'fill' ? 'active' : ''}`}
                    onClick={() => setMedia({ sizing: 'fit' })}
                    type="button"
                  >
                    Fit
                  </button>
                  <button
                    className={`segment-btn ${currentBg.media?.sizing === 'fill' ? 'active' : ''}`}
                    onClick={() => setMedia({ sizing: 'fill' })}
                    type="button"
                  >
                    Fill
                  </button>
                </div>
              </div>
            </div>
          ) : null}

          {currentBg.media?.mediaUrl ? (
            <div className="control-row">
              <span className="control-label">Position</span>
              <div className="control-value" style={{ width: 180 }}>
                <div className="select-wrapper" style={{ position: 'relative', width: '100%' }}>
                  <select
                    className="select-input"
                    value={currentBg.media?.position || 'bottom-center'}
                    onChange={(e) => setMedia({ position: e.target.value })}
                    style={{ padding: '8px 32px 8px 12px', borderRadius: 8, width: '100%' }}
                  >
                    <option value="center">Center</option>
                    <option value="top">Top</option>
                    <option value="bottom">Bottom</option>
                    <option value="left">Left</option>
                    <option value="right">Right</option>
                    <option value="top-left">Top Left</option>
                    <option value="top-right">Top Right</option>
                    <option value="bottom-left">Bottom Left</option>
                    <option value="bottom-right">Bottom Right</option>
                    <option value="bottom-center">Bottom Center</option>
                  </select>
                  <div
                    style={{
                      position: 'absolute',
                      right: 12,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      pointerEvents: 'none',
                      fontSize: 10,
                      color: '#718096',
                    }}
                  >
                    ▼
                  </div>
                </div>
              </div>
            </div>
          ) : null}

          <div className="control-row">
            <span className="control-label">Size</span>
            <div className="control-value">
              <div className="position-row">
                <div className="position-field">
                  <input type="number" className="position-input" value={store.width} disabled />
                  <label>W</label>
                </div>
                <div className="position-field">
                  <input type="number" className="position-input" value={store.height} disabled />
                  <label>H</label>
                </div>
              </div>
            </div>
          </div>

          <div className="control-row">
            <span className="control-label">Presets</span>
            <div className="control-value">
              <div className="segment-group">
                <button
                  className={`segment-btn ${activePreset === 'story' ? 'active' : ''}`}
                  onClick={() => {
                    setActivePreset('story');
                    setStorePreset(store, 'story', { rescaleExisting: true });
                  }}
                >
                  Story
                </button>

                <button
                  className={`segment-btn ${activePreset === 'square' ? 'active' : ''}`}
                  onClick={() => {
                    setActivePreset('square');
                    setStorePreset(store, 'square', { rescaleExisting: true });
                  }}
                >
                  Square
                </button>

                <button
                  className={`segment-btn ${activePreset === 'wide' ? 'active' : ''}`}
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

        <DurationSection store={store} />

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

      <div className="settings-footer">
        <div className="action-buttons">
          <button
            className="action-btn delete"
            onClick={() => store.deletePages([activePage.id])}
            disabled={store.pages.length <= 1}
            style={{ opacity: store.pages.length <= 1 ? 0.5 : 1 }}
          >
            <span><TrashIcon /></span> Delete
          </button>
        </div>
      </div>
    </div>
  );
});

PageSettings.displayName = 'PageSettings';