import { useState, useRef, useEffect } from 'react';
import InfoIcon from '../../InfoIcon';

// Storyly-style tooltip for info icon in Duration header
export default function DurationHeaderWithTooltip() {
  const [open, setOpen] = useState(false);
  const iconRef = useRef(null);
  const tooltipRef = useRef(null);

  // Keyboard accessibility: open on focus, close on blur/Esc
  useEffect(() => {
    if (!open) return;
    function onKeyDown(e) {
      if (e.key === 'Escape') setOpen(false);
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open]);

  // ARIA: Tooltip id for accessibility
  const tooltipId = 'duration-info-tooltip';

  // Positioning: simple absolute below/right of icon, auto-adjust if near edge
  const [tooltipStyle, setTooltipStyle] = useState({});
  useEffect(() => {
    if (open && iconRef.current && tooltipRef.current) {
      const iconRect = iconRef.current.getBoundingClientRect();
      const tipRect = tooltipRef.current.getBoundingClientRect();
      // Tooltip centered horizontally to icon, below it
      let top = iconRect.bottom + 8;
      let left = iconRect.left + iconRect.width / 2 - tipRect.width / 2;
      // Clamp to viewport
      left = Math.max(8, Math.min(left, window.innerWidth - tipRect.width - 8));
      setTooltipStyle({ top: `${top}px`, left: `${left}px`, '--arrow-left': `${tipRect.width / 2 - 9}px` });
    }
  }, [open]);

  return (
    <div className="duration-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative' }}>
      <span className="duration-title">Duration</span>
      <span
        ref={iconRef}
        tabIndex={0}
        aria-label="Show info about Duration"
        aria-describedby={open ? tooltipId : undefined}
        style={{ cursor: 'pointer', outline: 'none', display: 'inline-flex' }}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
      >
        <InfoIcon size={16} color="#99A1AF" style={{ flexShrink: 0 }} />
      </span>
      {open && (
        <div
          ref={tooltipRef}
          id={tooltipId}
          role="tooltip"
          aria-modal="false"
          style={{
            position: 'fixed',
            zIndex: 9999,
            ...tooltipStyle,
            minWidth: 220,
            maxWidth: 320,
            background: '#fff',
            borderRadius: 8,
            boxShadow: '0 4px 16px 0 rgba(0,0,0,0.13)',
            padding: '14px 16px 12px 16px',
            color: '#23272F',
            fontSize: 15,
            lineHeight: 1.5,
            transition: 'opacity 0.18s cubic-bezier(.4,0,.2,1)',
            opacity: open ? 1 : 0,
            pointerEvents: open ? 'auto' : 'none',
            border: '1px solid #F3F4F6',
          }}
        >
          <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4, color: '#FF7A1A', letterSpacing: 0.1 }}>Duration</div>
          <div style={{ color: '#23272F', fontWeight: 400 }}>
            Set the timing for your interactive elements to appear and create a dynamic and immersive experience for your users.
          </div>
          {/* Arrow */}
          <div style={{
            position: 'absolute',
            top: -8,
            left: 'var(--arrow-left, 50%)',
            width: 18,
            height: 10,
            pointerEvents: 'none',
            zIndex: 1,
          }}>
            <svg width="18" height="10" viewBox="0 0 18 10" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 10L0 0H18L9 10Z" fill="#fff" style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.10))' }} />
              <path d="M9 10L0 0H18L9 10Z" fill="#fff" />
              <path d="M9 10L0 0H18L9 10Z" fill="#F3F4F6" fillOpacity=".7" style={{ transform: 'translateY(-1px)' }} />
            </svg>
          </div>
        </div>
      )}
    </div>
  );
}
