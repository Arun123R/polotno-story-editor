import React from 'react';
import { observer } from 'mobx-react-lite';
import { isSystemPage, SYSTEM_PAGE_TYPES } from '../store/polotnoStore';
import './SystemStartOverlay.css';

/**
 * Pure HTML/CSS overlay for the SYSTEM_START_PAGE.
 * Renders three action buttons (Upload media, Blank Story, Get from template)
 * on top of the Polotno canvas when the system start page is active.
 * No Polotno elements are used — this is UI-only.
 */
const SystemStartOverlay = observer(({ store, onAction }) => {
  const activePage = store.activePage;
  const isSystemStart = isSystemPage(activePage, SYSTEM_PAGE_TYPES.SYSTEM_START_PAGE);

  if (!isSystemStart) return null;

  const handleClick = (action) => {
    if (typeof onAction === 'function') {
      onAction(action);
    }
  };

  return (
    <div className="system-start-overlay">
      <div className="system-start-overlay__content">
        <button
          className="system-start-btn"
          onClick={() => handleClick('upload')}
        >
          <span className="system-start-btn__icon system-start-btn__icon--upload">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <path d="M21 15l-5-5L5 21" />
            </svg>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="system-start-btn__icon-video">
              <polygon points="23 7 16 12 23 17 23 7" />
              <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
            </svg>
          </span>
          <span className="system-start-btn__label">Upload media</span>
        </button>

        <button
          className="system-start-btn"
          onClick={() => handleClick('blank')}
        >
          <span className="system-start-btn__icon system-start-btn__icon--blank">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </span>
          <span className="system-start-btn__label">Blank Story</span>
        </button>

        <button
          className="system-start-btn"
          onClick={() => handleClick('template')}
        >
          <span className="system-start-btn__icon system-start-btn__icon--template">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
          </span>
          <span className="system-start-btn__label">Get from template</span>
        </button>
      </div>
    </div>
  );
});

SystemStartOverlay.displayName = 'SystemStartOverlay';
export default SystemStartOverlay;
