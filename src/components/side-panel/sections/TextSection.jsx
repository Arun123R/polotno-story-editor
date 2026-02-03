/* eslint-disable react-refresh/only-export-components */
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { TextSection as PolotnoTextSection } from 'polotno/side-panel';
import { Tab, Tabs } from '@blueprintjs/core';
import { Trash } from '@blueprintjs/icons';
import './TextSection.css';

const UploadIcon = ({ size = 64 }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M0 32C0 14.3269 14.3269 0 32 0C49.6731 0 64 14.3269 64 32C64 49.6731 49.6731 64 32 64C14.3269 64 0 49.6731 0 32Z"
        fill="#FFEDD4"
      />
      <path
        d="M44 36V41.3333C44 42.0406 43.719 42.7189 43.219 43.219C42.7189 43.719 42.0406 44 41.3333 44H22.6667C21.9594 44 21.2811 43.719 20.781 43.219C20.281 42.7189 20 42.0406 20 41.3333V36"
        stroke="#F54900"
        strokeWidth="2.66667"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M38.6667 26.6667L32 20L25.3334 26.6667"
        stroke="#F54900"
        strokeWidth="2.66667"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M32 20V36"
        stroke="#F54900"
        strokeWidth="2.66667"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

/**
 * Custom Text Section that wraps Polotno's default TextSection
 * with custom CSS styling to match the right sidebar design system.
 * 
 * Visual changes:
 * - Flat rectangular tabs (like Content | Style | Animate)
 * - Orange text for active tab
 * - Subtle border for active tab
 * - No pill shapes, no underlines, no animations
 * 
 * IMPORTANT: This is a UI-only refactor. All Polotno functionality is preserved.
 */

const CustomTextPanel = observer(({ store }) => {
  const [activeTopTab, setActiveTopTab] = useState('text');
  const [isFontDragActive, setIsFontDragActive] = useState(false);
  const fileInputRef = useRef(null);

  const scaleFactor = useMemo(() => {
    // Same scaling idea Polotno uses internally for text presets.
    const w = typeof store?.width === 'number' ? store.width : 1080;
    const h = typeof store?.height === 'number' ? store.height : 1920;
    return (w + h) / 2160;
  }, [store?.width, store?.height]);

  const addText = (options) => {
    if (!store?.activePage) return;

    // Prefer a dedicated API if present in some Polotno versions.
    if (typeof store.addText === 'function') {
      store.addText(options);
      return;
    }

    const page = store.activePage;
    const width = options.width || store.width / 2;

    const x = ((options.x ?? store.width / 2) - width / 2);
    const y = ((options.y ?? store.height / 2) - (options.fontSize || 18) / 2);

    const element = page.addElement({
      type: 'text',
      ...options,
      x,
      y,
      width,
    });

    if (element) {
      store.selectElements([element.id]);
      element.toggleEditMode?.(true);
    }
  };

  const addHeading = () => {
    addText({
      text: 'Heading',
      fontFamily: 'Roboto',
      fontSize: Math.round(48 * scaleFactor),
      fontWeight: 'bold',
    });
  };

  const addSubheading = () => {
    addText({
      text: 'Subheading',
      fontFamily: 'Roboto',
      fontSize: Math.round(28 * scaleFactor),
      fontWeight: '500',
    });
  };

  const addBody = () => {
    addText({
      text: 'Body text',
      fontFamily: 'Roboto',
      fontSize: Math.round(18 * scaleFactor),
      fontWeight: 'normal',
    });
  };

  // Ensure fonts are loaded for canvas rendering.
  useEffect(() => {
    store?.loadFont?.('Roboto');
  }, [store]);

  useEffect(() => {
    if (!store?.fonts) return;
    store.fonts.forEach((f) => {
      if (f?.fontFamily) {
        store.loadFont?.(f.fontFamily);
      }
    });
  }, [store, store?.fonts?.length]);

  const onUploadFontClick = () => {
    fileInputRef.current?.click();
  };

  const onUploadFontChange = async (e) => {
    const files = Array.from(e.target.files || []);
    for (const file of files) {
      // Basic local font loading.
      const url = URL.createObjectURL(file);
      const fontFamily = file.name.split('.').slice(0, -1).join('.') || file.name;
      store.addFont?.({ fontFamily, url });
      store.loadFont?.(fontFamily);
    }
    // reset so re-uploading the same file triggers change
    e.target.value = '';
  };

  const handleFontFiles = async (files) => {
    for (const file of files) {
      if (!file) continue;
      const nameLower = String(file.name || '').toLowerCase();
      const isFontFile =
        nameLower.endsWith('.ttf') ||
        nameLower.endsWith('.otf') ||
        nameLower.endsWith('.woff') ||
        nameLower.endsWith('.woff2') ||
        nameLower.endsWith('.eot');
      if (!isFontFile) continue;

      const url = URL.createObjectURL(file);
      const fontFamily = file.name.split('.').slice(0, -1).join('.') || file.name;
      store.addFont?.({ fontFamily, url });
      store.loadFont?.(fontFamily);
    }
  };

  const onFontDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsFontDragActive(false);

    const files = Array.from(e.dataTransfer?.files || []);
    await handleFontFiles(files);
  };

  const onFontDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsFontDragActive(true);
  };

  const onFontDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsFontDragActive(false);
  };

  return (
    <div className="custom-text-section">
      {/* Keep top tabs: Text | My fonts */}
      <Tabs id="text-panel-tabs" large={true} onChange={(id) => setActiveTopTab(id)} selectedTabId={activeTopTab}>
        <Tab id="text" title="Text" />
        <Tab id="font" title="My fonts" />
      </Tabs>

      {activeTopTab === 'text' && (
        <div className="text-panel-body">
          <div className="add-text-title">ADD TEXT</div>

          <div className="add-text-cards">
            <button type="button" className="add-text-card" onClick={addHeading}>
              <span className="add-text-plus" aria-hidden="true">+</span>
              <span className="add-text-card-text">
                <span className="add-text-card-title">Add Heading</span>
                <span className="add-text-card-subtitle">Preview text style</span>
              </span>
            </button>

            <button type="button" className="add-text-card" onClick={addSubheading}>
              <span className="add-text-plus" aria-hidden="true">+</span>
              <span className="add-text-card-text">
                <span className="add-text-card-title">Add Subheading</span>
                <span className="add-text-card-subtitle">Preview text style</span>
              </span>
            </button>

            <button type="button" className="add-text-card" onClick={addBody}>
              <span className="add-text-plus" aria-hidden="true">+</span>
              <span className="add-text-card-text">
                <span className="add-text-card-title">Add Body Text</span>
                <span className="add-text-card-subtitle">Preview text style</span>
              </span>
            </button>
          </div>
        </div>
      )}

      {activeTopTab === 'font' && (
        <div className="fonts-panel">
          <div
            className={`studio-card fonts-upload-card ${isFontDragActive ? 'drag-active' : ''}`}
            role="button"
            tabIndex={0}
            onClick={onUploadFontClick}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') onUploadFontClick();
            }}
            onDrop={onFontDrop}
            onDragOver={onFontDragOver}
            onDragLeave={onFontDragLeave}
          >
            <div className="fonts-upload-icon">
              <UploadIcon />
            </div>
            <div className="fonts-upload-title">Upload font</div>
            <div className="fonts-upload-subtitle">or drag and drop fonts here</div>

            <input
              ref={fileInputRef}
              type="file"
              accept=".ttf,.otf,.woff,.woff2,.eot"
              style={{ display: 'none' }}
              onChange={onUploadFontChange}
            />
          </div>

          <div className="fonts-panel-list">
            {(store.fonts || []).map((font, idx) => (
              <div
                key={`${font.fontFamily}-${idx}`}
                className="font-item"
                style={{ fontFamily: font.fontFamily }}
                onClick={() => addText({ text: 'Cool text', fontFamily: font.fontFamily, fontSize: Math.round(48 * scaleFactor) })}
              >
                <div className="font-item-name">{font.fontFamily}</div>
                <button
                  type="button"
                  className="font-item-remove"
                  onClick={(e) => {
                    e.stopPropagation();
                    store.removeFont?.(font.fontFamily);
                  }}
                  aria-label={`Remove ${font.fontFamily}`}
                >
                  <Trash size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
});

// Export the section with custom Panel wrapper
export const TextSection = {
  ...PolotnoTextSection,
  Panel: ({ store }) => <CustomTextPanel store={store} />,
};
