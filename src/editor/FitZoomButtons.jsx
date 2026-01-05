import React, { useState, useRef, useEffect } from 'react';
import { observer } from 'mobx-react-lite';

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

const ZOOM_PRESETS = [
  { label: 'Fit', value: 'fit' },
  { label: '25%', value: 0.25 },
  { label: '50%', value: 0.5 },
  { label: '75%', value: 0.75 },
  { label: '100%', value: 1 },
  { label: '150%', value: 1.5 },
  { label: '200%', value: 2 },
];

export const FitZoomButtons = observer(({ store }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const scaleToFit = store.scaleToFit || 1;
  const relativeScale = scaleToFit > 0 ? store.scale / scaleToFit : store.scale;
  const percent = Math.round(relativeScale * 100);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  const zoomIn = () => {
    const next = clamp(relativeScale * 1.2, 0.05, 5);
    store.setScale(scaleToFit * next);
  };

  const zoomOut = () => {
    const next = clamp(relativeScale / 1.2, 0.05, 5);
    store.setScale(scaleToFit * next);
  };

  const handlePresetClick = (preset) => {
    if (preset.value === 'fit') {
      store.setScale(scaleToFit);
    } else {
      store.setScale(scaleToFit * preset.value);
    }
    setIsOpen(false);
  };

  return (
    <div
      ref={dropdownRef}
      style={{
        position: 'absolute',
        left: '50%',
        bottom: 12,
        transform: 'translateX(-50%)',
        zIndex: 20,
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '6px 10px',
        borderRadius: 999,
        background: 'var(--bg-secondary)',
        border: '1px solid var(--border-primary)',
      }}
    >
      <button type="button" onClick={zoomOut} aria-label="Zoom out" style={btnStyle}>
        −
      </button>

      <div style={{ position: 'relative' }}>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Zoom presets"
          style={labelStyle}
        >
          {percent}%
        </button>

        {isOpen && (
          <div
            style={{
              position: 'absolute',
              bottom: '100%',
              left: '50%',
              transform: 'translateX(-50%)',
              marginBottom: 8,
              minWidth: 100,
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-primary)',
              borderRadius: 8,
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              overflow: 'hidden',
            }}
          >
            {ZOOM_PRESETS.map((preset) => (
              <button
                key={preset.label}
                type="button"
                onClick={() => handlePresetClick(preset)}
                style={{
                  width: '100%',
                  padding: '8px 16px',
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-primary)',
                  cursor: 'pointer',
                  fontSize: 12,
                  textAlign: 'left',
                  transition: 'background 0.15s',
                }}
                onMouseEnter={(e) => e.target.style.background = 'var(--bg-primary)'}
                onMouseLeave={(e) => e.target.style.background = 'transparent'}
              >
                {preset.label}
              </button>
            ))}
          </div>
        )}
      </div>

      <button type="button" onClick={zoomIn} aria-label="Zoom in" style={btnStyle}>
        +
      </button>
    </div>
  );
});

const btnStyle = {
  height: 28,
  width: 28,
  borderRadius: 999,
  background: 'var(--bg-primary)',
  border: '1px solid var(--border-primary)',
  color: 'var(--text-primary)',
  cursor: 'pointer',
  fontSize: 16,
  lineHeight: '26px',
};

const labelStyle = {
  height: 28,
  minWidth: 64,
  padding: '0 10px',
  borderRadius: 999,
  background: 'var(--bg-primary)',
  border: '1px solid var(--border-primary)',
  color: 'var(--text-primary)',
  cursor: 'pointer',
  fontSize: 12,
  fontWeight: 600,
};
