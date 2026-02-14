import React, { useRef, useEffect, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { Workspace } from 'polotno/canvas/workspace';
import { PageControls as DefaultPageControls } from 'polotno/canvas/page-controls';
import { FitZoomButtons } from './FitZoomButtons';
import { DragDropHandler } from './DragDropHandler';
import { isSystemPage, SYSTEM_PAGE_TYPES, handleSystemStartAction } from '../store/polotnoStore';
import '../components/SystemStartOverlay.css';

/**
 * Start Page buttons rendered INSIDE PageControls so they live in
 * the page's coordinate system — they scroll, zoom, and move with the page.
 *
 * We use a ref to walk up to the nearest page-sized ancestor, then attach
 * absolute positioning to fill it.  This guarantees correct sizing at any zoom.
 */
const SystemStartPageUI = observer(() => {
  const rootRef = useRef(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;

    // Walk up from PageControls to the page container — it's the element
    // whose dimensions match the rendered page (width > 50 && height > 50).
    let parent = el.parentElement;
    let attempts = 0;
    while (parent && attempts < 10) {
      const rect = parent.getBoundingClientRect();
      // The page container is significantly larger than the small controls wrapper
      if (rect.width > 50 && rect.height > 50) {
        // Ensure it's a positioning context
        const cs = getComputedStyle(parent);
        if (cs.position === 'static') {
          parent.style.position = 'relative';
        }
        break;
      }
      parent = parent.parentElement;
      attempts++;
    }
    setReady(true);
  }, []);

  const handleClick = (action) => {
    handleSystemStartAction(action);
  };

  return (
    <div ref={rootRef} className="system-start-page-root" style={{ opacity: ready ? 1 : 0 }}>
      <div className="system-start-page-buttons">
        <button className="system-start-btn" onClick={() => handleClick('upload')}>
          <span className="system-start-btn__icon system-start-btn__icon--upload">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <path d="M21 15l-5-5L5 21" />
            </svg>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="system-start-btn__icon-video">
              <polygon points="23 7 16 12 23 17 23 7" />
              <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
            </svg>
          </span>
          <span className="system-start-btn__label">Upload media</span>
        </button>

        <button className="system-start-btn" onClick={() => handleClick('blank')}>
          <span className="system-start-btn__icon system-start-btn__icon--blank">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </span>
          <span className="system-start-btn__label">Blank Story</span>
        </button>

        <button className="system-start-btn" onClick={() => handleClick('template')}>
          <span className="system-start-btn__icon system-start-btn__icon--template">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
          </span>
          <span className="system-start-btn__label">Get from template</span>
        </button>
      </div>
    </div>
  );
});
SystemStartPageUI.displayName = 'SystemStartPageUI';

/**
 * Custom PageControls wrapper:
 *  - SYSTEM_START_PAGE → renders the Start Page button UI (page-relative)
 *  - All other pages   → default Polotno page controls
 */
const SystemAwarePageControls = observer(({ store, page, ...rest }) => {
  if (isSystemPage(page, SYSTEM_PAGE_TYPES.SYSTEM_START_PAGE)) {
    return <SystemStartPageUI store={store} page={page} />;
  }
  return <DefaultPageControls store={store} page={page} {...rest} />;
});
SystemAwarePageControls.displayName = 'SystemAwarePageControls';

/**
 * EditorWorkspace - Main workspace component
 */
export const EditorWorkspace = observer(({ store }) => {
  return (
    <DragDropHandler store={store}>
      <div
        className="workspace-backdrop"
        style={{ width: '100%', height: '100%', position: 'relative', overflow: 'auto' }}
        data-drop-zone="canvas"
      >
        <Workspace
          store={store}
          backgroundColor="transparent"
          activePageBorderColor="#FF7A1A"
          layout="horizontal"
          components={{ PageControls: SystemAwarePageControls }}
        />

        <FitZoomButtons store={store} />
      </div>
    </DragDropHandler>
  );
});
