import React, { cloneElement, isValidElement, useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

const DEFAULT_MAX_PANEL_HEIGHT = 260;
const DEFAULT_MIN_PANEL_WIDTH = 200;

function toOption(option) {
  if (typeof option === 'string') {
    return { value: option, label: option };
  }
  return option;
}

export function Dropdown({
  options,
  value,
  defaultValue,
  onChange,
  placeholder = 'Select',
  disabled = false,
  className = '',
  style,
  panelMaxHeight = DEFAULT_MAX_PANEL_HEIGHT,
  panelMinWidth = DEFAULT_MIN_PANEL_WIDTH,
  ariaLabel,
  renderTrigger,
  showOptionAvatar = false,
  showOptionOrder = false,
}) {
  const dropdownId = useId();
  const triggerRef = useRef(null);
  const panelRef = useRef(null);

  const setTriggerNode = useCallback((node) => {
    triggerRef.current = node;
  }, []);

  const normalizedOptions = useMemo(() => (options || []).map(toOption), [options]);

  const isControlled = value !== undefined;
  const [uncontrolledValue, setUncontrolledValue] = useState(defaultValue);
  const currentValue = isControlled ? value : uncontrolledValue;

  const selected = useMemo(
    () => normalizedOptions.find((opt) => opt.value === currentValue) || null,
    [normalizedOptions, currentValue]
  );

  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(() => {
    const idx = normalizedOptions.findIndex((opt) => opt.value === currentValue);
    return idx >= 0 ? idx : 0;
  });

  const activeIndexRef = useRef(activeIndex);
  const optionsRef = useRef(normalizedOptions);
  const valueRef = useRef(currentValue);

  useEffect(() => {
    activeIndexRef.current = activeIndex;
  }, [activeIndex]);

  useEffect(() => {
    optionsRef.current = normalizedOptions;
  }, [normalizedOptions]);

  useEffect(() => {
    valueRef.current = currentValue;
  }, [currentValue]);

  const [panelPos, setPanelPos] = useState({ top: 0, left: 0, width: 0, placement: 'bottom' });

  const close = () => setOpen(false);

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
      const trigger = triggerRef.current;
      const panel = panelRef.current;
      if (!trigger || !panel) return;
      const target = e.target;
      if (trigger.contains(target) || panel.contains(target)) return;
      close();
    };

    const onKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        close();
        triggerRef.current?.focus();
      }

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActiveIndex((i) => Math.min(i + 1, optionsRef.current.length - 1));
      }

      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActiveIndex((i) => Math.max(i - 1, 0));
      }

      if (e.key === 'Enter') {
        e.preventDefault();
        const opt = optionsRef.current[activeIndexRef.current];
        if (opt && !opt.disabled) {
          if (!isControlled) setUncontrolledValue(opt.value);
          onChange?.(opt.value);
          close();
          triggerRef.current?.focus();
        }
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
  }, [open, isControlled, onChange, updatePanelPosition]);

  const openMenu = () => {
    if (disabled) return;
    const idx = normalizedOptions.findIndex((opt) => opt.value === currentValue);
    setActiveIndex(idx >= 0 ? idx : 0);
    setOpen(true);
  };

  const handleToggle = () => {
    if (disabled) return;
    if (open) {
      close();
    } else {
      openMenu();
    }
  };

  const handleTriggerKeyDown = (e) => {
    if (disabled) return;

    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      openMenu();
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      openMenu();
    }
  };

  const rootClass = `app-dropdown ${className}`.trim();

  const triggerAria = {
    'aria-label': ariaLabel,
    'aria-haspopup': 'listbox',
    'aria-expanded': open,
    'aria-controls': `${dropdownId}-panel`,
  };

  const composeHandlers = (userHandler, ourHandler) => {
    return (e) => {
      userHandler?.(e);
      if (e?.defaultPrevented) return;
      ourHandler?.(e);
    };
  };

  const customTriggerEl = useMemo(() => {
    if (typeof renderTrigger !== 'function') return null;
    const el = renderTrigger({
      open,
      disabled,
      selected,
      placeholder,
    });
    if (!isValidElement(el)) return null;

    const injectedProps = {
      ref: setTriggerNode,
      disabled,
      onClick: composeHandlers(el.props?.onClick, handleToggle),
      onKeyDown: composeHandlers(el.props?.onKeyDown, handleTriggerKeyDown),
      ...triggerAria,
    };

    return cloneElement(el, injectedProps);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [renderTrigger, open, disabled, selected, placeholder, setTriggerNode, handleToggle, handleTriggerKeyDown, dropdownId]);

  return (
    <div className={rootClass} style={style}>
      {customTriggerEl ? (
        customTriggerEl
      ) : (
        <button
          ref={setTriggerNode}
          type="button"
          className="select-input"
          onClick={handleToggle}
          onKeyDown={handleTriggerKeyDown}
          disabled={disabled}
          aria-label={ariaLabel}
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-controls={`${dropdownId}-panel`}
          style={{ textAlign: 'left' }}
        >
          {selected?.label ?? placeholder}
        </button>
      )}

      {open
        ? createPortal(
            <div
              ref={panelRef}
              id={`${dropdownId}-panel`}
              className={`app-dropdown__panel ${panelPos.placement === 'top' ? 'is-top' : ''}`}
              role="listbox"
              style={{
                position: 'fixed',
                left: panelPos.left,
                top: panelPos.placement === 'top' ? undefined : panelPos.top,
                bottom: panelPos.placement === 'top' ? window.innerHeight - panelPos.top : undefined,
                width: panelPos.width,
                maxHeight: panelPos.maxHeight,
                overflowY: 'auto',
              }}
            >
              {normalizedOptions.map((opt, idx) => {
                const isSelected = opt.value === currentValue;
                const isActive = idx === activeIndex;
                // Avatar logic (opt-in): opt.image, opt.ringColor, opt.nameColor
                const avatarUrl = showOptionAvatar ? opt.image : null;
                const avatarColor = showOptionAvatar ? (opt.ringColor || '#ccc') : null;
                const avatarTextColor = showOptionAvatar ? (opt.nameColor || '#fff') : null;
                const fallbackText =
                  showOptionAvatar && typeof opt.label === 'string'
                    ? opt.label.replace(/^\(\d+\)\s*/, '').charAt(0).toUpperCase()
                    : null;

                // Order logic (opt-in): extract from label or opt.order
                let order = '';
                if (showOptionOrder) {
                  if (typeof opt.label === 'string' && opt.label.match(/^\(\d+\)/)) {
                    order = opt.label.match(/^\((\d+)\)/)[1];
                  } else if (opt.order !== undefined && opt.order !== null) {
                    order = String(opt.order);
                  }
                }

                const optionLabel =
                  typeof opt.label === 'string'
                    ? (showOptionOrder ? opt.label.replace(/^\(\d+\)\s*/, '') : opt.label)
                    : opt.label;

                return (
                  <button
                    key={String(opt.value)}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    className={`app-dropdown__option ${isSelected ? 'is-selected' : ''} ${isActive ? 'is-active' : ''}`}
                    onMouseEnter={() => setActiveIndex(idx)}
                    onClick={() => {
                      if (opt.disabled) return;
                      if (!isControlled) setUncontrolledValue(opt.value);
                      onChange?.(opt.value);
                      close();
                      triggerRef.current?.focus();
                    }}
                    disabled={opt.disabled}
                    style={{ display: 'flex', alignItems: 'center', gap: showOptionAvatar || showOptionOrder ? 12 : 8 }}
                  >
                    {order && (
                      <span style={{ fontWeight: 600, fontSize: 16, marginRight: 6, color: '#888', minWidth: 24, textAlign: 'right' }}>
                        ({order})
                      </span>
                    )}
                    {showOptionAvatar ? (
                      <span
                        style={{
                          width: 30,
                          height: 30,
                          minWidth: 30,
                          minHeight: 30,
                          borderRadius: '50%',
                          background: avatarUrl ? 'transparent' : avatarColor,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          overflow: 'hidden',
                          marginRight: 8,
                          border: avatarUrl ? `2px solid ${avatarColor}` : 'none',
                          boxSizing: 'border-box',
                        }}
                      >
                        {avatarUrl ? (
                          <img
                            src={avatarUrl}
                            alt="avatar"
                            style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }}
                          />
                        ) : (
                          <span style={{ color: avatarTextColor, fontWeight: 600, fontSize: 16 }}>{fallbackText || '?'}</span>
                        )}
                      </span>
                    ) : null}
                    {optionLabel}
                  </button>
                );
              })}
            </div>,
            document.body
          )
        : null}
    </div>
  );
}

export default Dropdown;
