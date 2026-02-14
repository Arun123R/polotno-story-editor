import { observer } from 'mobx-react-lite';
import { useEffect, useState } from 'react';

import { DurationSection, TrashIcon } from '../shared/CommonControls';
import { ColorPicker } from '../shared/ColorPicker';
import Dropdown from '../../shared/Dropdown';

import { getStorePresetName } from '../../../utils/scale';
import {
  DEFAULT_SLIDE_BACKGROUND,
  normalizeSlideBackground,
  applySlideBackgroundToPage,
  buildBackgroundFromMediaUrl,
} from '../../../utils/slideBackground';
import { useEditorContext } from '../../../context/EditorContext';
import { storyAPI } from '../../../services/api';
import { isSystemPage, SYSTEM_PAGE_TYPES } from '../../../store/polotnoStore';

/**
 * Page settings panel (when no element is selected) - Storyly-inspired dark theme
 */
export const PageSettings = observer(({ store }) => {
  const { deletePages } = useEditorContext();
  const activePage = store.activePage;

  // UI-only preset state (NO store change)
  const [, setActivePreset] = useState(getStorePresetName(store));

  // Keep UI in sync with store preset.
  useEffect(() => {
    setActivePreset(getStorePresetName(store));
  }, [store]);

  if (!activePage) return null;

  const isSystemStartPage = isSystemPage(activePage, SYSTEM_PAGE_TYPES.SYSTEM_START_PAGE);

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



  const handlePickMediaFile = async (file) => {
    if (!file) return;

    try {
      // 1. Upload to CDN
      const cdnUrl = await storyAPI.uploadGeneralMedia(file);

      // 2. Determine if we should sync the background color (sidebar upload always auto-colors)

      // Use shared helper so sidebar upload, drag-drop and start-page uploads are identical
      const nextBg = await buildBackgroundFromMediaUrl(cdnUrl, { sizing: 'fit', position: 'bottom-center' });
      if (nextBg) setBackgroundPatch(nextBg);
    } catch (error) {
      console.error('Failed to upload background media:', error);
    }
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

          {!isSystemStartPage ? (
            <>
              <div className="control-row">
                <span className="control-label">Background</span>
              </div>

              <div className="control-row" style={{ alignItems: 'flex-start' }}>
                <span className="control-label" style={{ paddingTop: 7 }}>Color</span>
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
                        <div className="select-wrapper" style={{ width: '100%' }}>
                          <Dropdown
                            value={
                              currentBg.color?.type === 'gradient'
                                ? currentBg.color.gradient?.direction || 'top'
                                : 'top'
                            }
                            onChange={(v) => setColorGradient({ direction: v })}
                            options={[
                              { value: 'top', label: 'Top' },
                              { value: 'bottom', label: 'Bottom' },
                              { value: 'left', label: 'Left' },
                              { value: 'right', label: 'Right' },
                              { value: 'radial', label: 'Radial' },
                            ]}
                            ariaLabel="Gradient direction"
                          />
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
                    <div className="select-wrapper" style={{ width: '100%' }}>
                      <Dropdown
                        value={currentBg.media?.position || 'bottom-center'}
                        onChange={(v) => setMedia({ position: v })}
                        options={[
                          { value: 'center', label: 'Center' },
                          { value: 'top', label: 'Top' },
                          { value: 'bottom', label: 'Bottom' },
                          { value: 'left', label: 'Left' },
                          { value: 'right', label: 'Right' },
                          { value: 'top-left', label: 'Top Left' },
                          { value: 'top-right', label: 'Top Right' },
                          { value: 'bottom-left', label: 'Bottom Left' },
                          { value: 'bottom-right', label: 'Bottom Right' },
                          { value: 'bottom-center', label: 'Bottom Center' },
                        ]}
                        ariaLabel="Media position"
                      />
                    </div>
                  </div>
                </div>
              ) : null}
            </>
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
        </div>

        {!isSystemStartPage ? <DurationSection store={store} /> : null}

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
          {!isSystemStartPage ? (
            <button
              className="action-btn delete"
              onClick={() => deletePages([activePage.id])}
              disabled={store.pages.length <= 1}
              style={{ opacity: store.pages.length <= 1 ? 0.5 : 1 }}
            >
              <span><TrashIcon /></span> Delete
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
});

PageSettings.displayName = 'PageSettings';