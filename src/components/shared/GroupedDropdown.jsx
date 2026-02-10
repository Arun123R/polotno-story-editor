import React, { useCallback, useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

/**
 * Grouped Dropdown Component
 * Supports options grouped by category with headers
 */
export function GroupedDropdown({
  groups = [],
  value,
  onChange,
  placeholder = 'Select',
  disabled = false,
  ariaLabel,
  renderTrigger,
  panelMinWidth = 200,
  panelMaxHeight = 300,
}) {
  const dropdownId = useId();
  const triggerRef = useRef(null);
  const panelRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [panelPos, setPanelPos] = useState({ top: 0, left: 0, width: 0, placement: 'bottom', maxHeight: 300 });

  const flatOptions = groups.flatMap(group => group.options);
  const selected = flatOptions.find(opt => opt.value === value) || null;

  const close = useCallback(() => setOpen(false), []);

  const setTriggerNode = useCallback((node) => {
    triggerRef.current = node;
  }, []);

  const updatePanelPosition = useCallback(() => {
    const trigger = triggerRef.current;
    if (!trigger) return;

    const rect = trigger.getBoundingClientRect();
    const viewportH = window.innerHeight;
    const viewportW = window.innerWidth;

    const spaceBelow = viewportH - rect.bottom;
    const spaceAbove = rect.top;
    const shouldOpenUp = spaceBelow < 180 && spaceAbove > spaceBelow;

    const gap = 6;
    const maxH = Math.min(panelMaxHeight, shouldOpenUp ? Math.max(120, spaceAbove - gap - 8) : Math.max(120, spaceBelow - gap - 8));

    const maxAllowedW = Math.max(120, viewportW - 16);
    const panelWidth = Math.min(Math.max(rect.width, panelMinWidth), maxAllowedW);

    const safeLeft = Math.min(
      Math.max(8, rect.left),
      Math.max(8, viewportW - panelWidth - 16)
    );

    setPanelPos({
      top: shouldOpenUp ? rect.top - gap : rect.bottom + gap,
      left: safeLeft,
      width: panelWidth,
      placement: shouldOpenUp ? 'top' : 'bottom',
      maxHeight: maxH,
    });
  }, [panelMaxHeight, panelMinWidth]);

  useEffect(() => {
    if (!open) return;

    updatePanelPosition();

    const onDocMouseDown = (e) => {
      if (!panelRef.current && !triggerRef.current) return;
      if (panelRef.current?.contains(e.target) || triggerRef.current?.contains(e.target)) return;
      close();
    };

    const onKeyDown = (e) => {
      if (e.key === 'Escape') {
        close();
        triggerRef.current?.focus();
      }
    };

    const onReposition = () => updatePanelPosition();

    document.addEventListener('mousedown', onDocMouseDown);
    document.addEventListener('keydown', onKeyDown);
    window.addEventListener('resize', onReposition);
    window.addEventListener('scroll', onReposition, true);

    return () => {
      document.removeEventListener('mousedown', onDocMouseDown);
      document.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('resize', onReposition);
      window.removeEventListener('scroll', onReposition, true);
    };
  }, [open, updatePanelPosition, close]);

  const openMenu = useCallback(() => {
    if (disabled) return;
    setOpen(true);
  }, [disabled]);

  const handleToggle = useCallback(() => {
    if (disabled) return;
    if (open) {
      close();
    } else {
      openMenu();
    }
  }, [disabled, open, close, openMenu]);

  const triggerAria = {
    'aria-label': ariaLabel,
    'aria-haspopup': 'listbox',
    'aria-expanded': open,
    'aria-controls': `${dropdownId}-panel`,
  };

  const customTriggerEl = renderTrigger ? renderTrigger({
    open,
    disabled,
    selected,
    placeholder,
  }) : null;

  const trigger = customTriggerEl ? (
    <div
      ref={setTriggerNode}
      onClick={handleToggle}
      style={{ display: 'inline-block', cursor: disabled ? 'not-allowed' : 'pointer' }}
      {...triggerAria}
    >
      {customTriggerEl}
    </div>
  ) : (
    <button
      ref={triggerRef}
      type="button"
      onClick={handleToggle}
      disabled={disabled}
      {...triggerAria}
      style={{
        padding: '8px 12px',
        background: 'transparent',
        border: '1px solid var(--border-primary)',
        borderRadius: '6px',
        color: 'var(--text-secondary)',
        cursor: 'pointer',
      }}
    >
      {selected?.label ?? placeholder}
    </button>
  );

  return (
    <>
      {trigger}
      {open
        ? createPortal(
            <div
              ref={panelRef}
              id={`${dropdownId}-panel`}
              role="listbox"
              style={{
                position: 'fixed',
                left: panelPos.left,
                top: panelPos.placement === 'top' ? undefined : panelPos.top,
                bottom: panelPos.placement === 'top' ? window.innerHeight - panelPos.top : undefined,
                width: panelPos.width,
                maxHeight: panelPos.maxHeight,
                overflowY: 'auto',
                background: 'var(--bg-secondary, #1e1e1e)',
                border: '1px solid var(--border-primary, #333)',
                borderRadius: '8px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                zIndex: 9999,
                padding: '8px 0',
              }}
            >
              {groups.map((group, groupIdx) => (
                <div key={group.label || groupIdx}>
                  {/* Group Header */}
                  <div
                    style={{
                      padding: '8px 16px 4px',
                      fontSize: '11px',
                      fontWeight: 600,
                      color: 'var(--text-muted, #888)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                    }}
                  >
                    {group.label}
                  </div>
                  {/* Group Options */}
                  {group.options.map((opt) => {
                    const isSelected = opt.value === value;
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        role="option"
                        aria-selected={isSelected}
                        onClick={() => {
                          if (opt.disabled) return;
                          onChange?.(opt.value);
                          close();
                          triggerRef.current?.focus();
                        }}
                        disabled={opt.disabled}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          width: '100%',
                          padding: '10px 16px',
                          background: isSelected ? 'rgba(249, 115, 22, 0.1)' : 'transparent',
                          border: 'none',
                          color: isSelected ? 'var(--accent-primary, #f97316)' : 'var(--text-primary, #fff)',
                          cursor: opt.disabled ? 'not-allowed' : 'pointer',
                          fontSize: '14px',
                          textAlign: 'left',
                          transition: 'background 0.15s',
                        }}
                        onMouseEnter={(e) => {
                          if (!opt.disabled && !isSelected) {
                            e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!isSelected) {
                            e.currentTarget.style.background = 'transparent';
                          }
                        }}
                      >
                        <span>{opt.label}</span>
                        {opt.badge && (
                          <span
                            style={{
                              fontSize: '12px',
                              padding: '2px 8px',
                              borderRadius: '4px',
                              background: 'rgba(255,255,255,0.1)',
                              color: 'var(--text-secondary, #aaa)',
                            }}
                          >
                            {opt.badge}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>,
            document.body
          )
        : null}
    </>
  );
}

export default GroupedDropdown;
