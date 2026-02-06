import React, { useCallback, useEffect, useRef } from 'react';
import { observer } from 'mobx-react-lite';
import Dropdown from '../../shared/Dropdown';

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

export const TrashIcon = (props) => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    focusable="false"
    {...props}
  >
    {/* Lid line */}
    <path d="M4 7h16" />
    {/* Handle */}
    <path d="M9 7V6a3 3 0 0 1 6 0v1" />
    {/* Bin body */}
    <path d="M7 7h10v13a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2V7z" />
    {/* Inner bars */}
    <path d="M10 11v7" />
    <path d="M14 11v7" />
  </svg>
);

const formatTimeMMSS = (ms) => {
  const safeMs = Number.isFinite(ms) ? Math.max(0, ms) : 0;
  const totalSeconds = Math.floor(safeMs / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
};

const getElementTiming = (element, pageDurationMs) => {
  const rawStart = element?.custom?.startTime;
  const rawEnd = element?.custom?.endTime;
  const startTime = Number.isFinite(rawStart) ? rawStart : 0;
  const endTime = Number.isFinite(rawEnd) ? rawEnd : pageDurationMs;
  return {
    startTime: clamp(startTime, 0, pageDurationMs),
    endTime: clamp(Math.max(endTime, startTime), 0, pageDurationMs),
  };
};

const setElementTiming = (element, { startTime, endTime }, pageDurationMs) => {
  if (!element) return;
  const nextStart = clamp(startTime, 0, pageDurationMs);
  const nextEnd = clamp(Math.max(endTime, nextStart), 0, pageDurationMs);

  const prevCustom = element.custom && typeof element.custom === 'object' ? element.custom : {};
  element.set({
    custom: {
      ...prevCustom,
      startTime: nextStart,
      endTime: nextEnd,
    },
  });
};

const mergeCustom = (node, patch) => {
  if (!node) return;
  const prevCustom = node.custom && typeof node.custom === 'object' ? node.custom : {};
  node.set({
    custom: {
      ...prevCustom,
      ...patch,
    },
  });
};

const getCustomFlag = (node, key, fallback = false) => {
  const v = node?.custom?.[key];
  return typeof v === 'boolean' ? v : fallback;
};

const ensureMutedVolume = (node, muted) => {
  // Polotno VideoElement has `volume` (0..1). Audio track has `volume` too.
  // For other elements without volume, just persist the flag.
  if (!node) return;
  const hasVolume = typeof node.volume === 'number';
  if (!hasVolume) return;

  const prevCustom = node.custom && typeof node.custom === 'object' ? node.custom : {};
  const remembered = typeof prevCustom._unmutedVolume === 'number' ? prevCustom._unmutedVolume : null;

  if (muted) {
    // Remember non-zero volume once.
    if ((remembered == null || !Number.isFinite(remembered)) && (node.volume ?? 1) > 0) {
      mergeCustom(node, { _unmutedVolume: node.volume ?? 1 });
    }
    if (node.volume !== 0) node.set({ volume: 0 });
  } else {
    const restoreTo = Number.isFinite(remembered) ? remembered : 1;
    if (node.volume !== restoreTo) node.set({ volume: restoreTo });
  }
};

/**
 * Position controls for element x, y, width, height, rotation - Dark theme style
 */
export const PositionSection = observer(({ element }) => {
  if (!element) return null;

  const handleNumericChange = (setter, value, minValue = null) => {
    const numValue = parseFloat(value);
    if (!isNaN(numValue) && (minValue === null || numValue >= minValue)) {
      setter(numValue);
    }
  };

  return (
    <div className="section">
      <div className="section-title">Position</div>

      <div className="control-row">
        <span className="control-label">Position</span>
        <div className="control-value">
          <span style={{ fontSize: 11, color: '#a0aec0' }}>X</span>
          <input
            type="number"
            className="position-input"
            value={Math.round(element.x)}
            onChange={(e) => handleNumericChange((v) => element.set({ x: v }), e.target.value)}
          />
          <span style={{ fontSize: 11, color: '#a0aec0' }}>Y</span>
          <input
            type="number"
            className="position-input"
            value={Math.round(element.y)}
            onChange={(e) => handleNumericChange((v) => element.set({ y: v }), e.target.value)}
          />
        </div>
      </div>

      <div className="control-row">
        <span className="control-label">Size</span>
        <div className="control-value">
          <span style={{ fontSize: 14, color: '#a0aec0', lineHeight: 1 }}>↔</span>
          <input
            type="number"
            className="position-input"
            value={Math.round(element.width)}
            onChange={(e) => handleNumericChange((v) => element.set({ width: v }), e.target.value, 1)}
          />
          <span style={{ fontSize: 14, color: '#a0aec0', lineHeight: 1 }}>↕</span>
          <input
            type="number"
            className="position-input"
            value={Math.round(element.height)}
            onChange={(e) => handleNumericChange((v) => element.set({ height: v }), e.target.value, 1)}
          />
        </div>
      </div>

      <div className="control-row">
        <span className="control-label">Rotation</span>
        <div className="control-value">
          <span style={{ fontSize: 13, fontWeight: 600, color: '#2d3748' }}>{Math.round(element.rotation ?? 0)}°</span>
        </div>
      </div>
    </div>
  );
});

/**
 * Appearance controls (Opacity, Radius) - Light theme style
 */
export const AppearanceSection = observer(({ element }) => {
  if (!element) return null;

  const opacity = element.opacity ?? 1;
  const percentage = Math.round(opacity * 100);
  const cornerRadius = element.cornerRadius || element.custom?.style?.containerBorderRadius || 0;

  return (
    <div className="section">
      <div className="section-title">Appearance</div>

      <div className="control-row">
        <span className="control-label">Opacity</span>
        <div className="control-value">
          <div className="slider-container" style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 13, fontWeight: 500, color: '#2d3748', minWidth: 45, textAlign: 'right' }}>{percentage} %</span>
            <div className="slider-track" style={{ flex: 1 }}>
              <div
                className="slider-fill"
                style={{ width: `${percentage}%` }}
              >
                <div className="slider-thumb" />
              </div>
              <input
                type="range"
                min={0}
                max={100}
                value={percentage}
                onChange={(e) => element.set({ opacity: parseInt(e.target.value) / 100 })}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="control-row">
        <span className="control-label">Radius</span>
        <div className="control-value">
          <div className="slider-container" style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 13, fontWeight: 500, color: '#2d3748', minWidth: 45, textAlign: 'right' }}>{cornerRadius} px</span>
            <div className="slider-track" style={{ flex: 1 }}>
              <div
                className="slider-fill"
                style={{ width: `${(cornerRadius / 50) * 100}%` }}
              >
                <div className="slider-thumb" />
              </div>
              <input
                type="range"
                min={0}
                max={50}
                value={cornerRadius}
                onChange={(e) => {
                  const val = parseInt(e.target.value);
                  if (element.set) element.set({ cornerRadius: val });
                  if (element.custom?.style) {
                    element.set({
                      custom: {
                        ...element.custom,
                        style: { ...element.custom.style, containerBorderRadius: val }
                      }
                    });
                  }
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

/**
 * Shared Opacity Slider component
 */
export const OpacitySlider = observer(({ element }) => {
  if (!element) return null;
  const opacity = element.opacity ?? 1;
  const percentage = Math.round(opacity * 100);

  return (
    <div className="control-row">
      <span className="control-label">Opacity</span>
      <div className="control-value">
        <div className="slider-container" style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 13, fontWeight: 500, color: '#2d3748', minWidth: 45, textAlign: 'right' }}>{percentage} %</span>
          <div className="slider-track" style={{ flex: 1 }}>
            <div
              className="slider-fill"
              style={{ width: `${percentage}%` }}
            >
              <div className="slider-thumb" />
            </div>
            <input
              type="range"
              min={0}
              max={100}
              value={percentage}
              onChange={(e) => element.set({ opacity: parseInt(e.target.value) / 100 })}
            />
          </div>
        </div>
      </div>
    </div>
  );
});

/**
 * Shared Corner Radius Slider component
 */
export const CornerRadiusSlider = observer(({ element, max = 50 }) => {
  if (!element) return null;
  const cornerRadius = element.cornerRadius || element.custom?.style?.containerBorderRadius || 0;

  return (
    <div className="control-row">
      <span className="control-label">Radius</span>
      <div className="control-value">
        <div className="slider-container" style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 12 }}>
          <div className="slider-track" style={{ flex: 1 }}>
            <div
              className="slider-fill"
              style={{ width: `${(cornerRadius / max) * 100}%` }}
            >
              <div className="slider-thumb" />
            </div>
            <input
              type="range"
              min={0}
              max={max}
              value={cornerRadius}
              onChange={(e) => {
                const val = parseInt(e.target.value);
                if (element.set) element.set({ cornerRadius: val });
                if (element.custom?.style) {
                  element.set({
                    custom: {
                      ...element.custom,
                      style: { ...element.custom.style, containerBorderRadius: val }
                    }
                  });
                }
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
});

/**
 * Action buttons: Duplicate, Delete - Dark theme style
 */
export const ActionButtons = observer(({ store, element }) => {
  if (!element) return null;

  const handleDuplicate = () => {
    element.clone();
  };

  const handleDelete = () => {
    store.deleteElements([element.id]);
  };

  return (
    <div className="action-buttons">
      <button className="action-btn save" onClick={handleDuplicate}>
        <span>✦</span> Save
      </button>
      <button className="action-btn delete" onClick={handleDelete}>
        <span><TrashIcon /></span> Delete
      </button>
    </div>
  );
});

/**
 * Duration section with play button and timeline - Dark theme style
 */
export const DurationSection = observer(({ store, element }) => {
  const activePage = store.activePage;
  const pageStartMs = activePage?.startTime ?? 0;
  const pageDurationMs = activePage?.duration ?? 7000;
  const pageEndMs = pageStartMs + pageDurationMs;

  // IMPORTANT: element reference is stable; compute directly so MobX drives re-renders on observable changes.
  const elementTiming = getElementTiming(element, pageDurationMs);

  const pageTimeMs = clamp((store.currentTime ?? 0) - pageStartMs, 0, pageDurationMs);
  const progressPct = pageDurationMs > 0 ? (pageTimeMs / pageDurationMs) * 100 : 0;

  // Mute state is persisted separately for slide and element.
  const slideMuted = getCustomFlag(activePage, 'isMuted', false);
  const elementMuted = getCustomFlag(element, 'isMuted', false);
  const isMutedForUI = element ? (slideMuted || elementMuted) : slideMuted;

  const isAudioCapableElement = (el) => {
    return el && typeof el.volume === 'number';
  };

  const applyMuteToSlideElements = useCallback(
    (muted) => {
      if (!activePage) return;
      const children = Array.isArray(activePage.children) ? activePage.children : [];
      children.forEach((child) => {
        if (!isAudioCapableElement(child)) return;
        const childMuted = getCustomFlag(child, 'isMuted', false);
        const effectiveMuted = Boolean(muted || childMuted);
        ensureMutedVolume(child, effectiveMuted);
      });
    },
    [activePage]
  );

  // Keep preview/playback in sync with current mute flags.
  useEffect(() => {
    if (!activePage) return;
    applyMuteToSlideElements(slideMuted);
  }, [activePage, slideMuted, applyMuteToSlideElements]);

  // Apply selected element mute instantly (respecting slide override).
  useEffect(() => {
    if (!element) return;
    ensureMutedVolume(element, Boolean(slideMuted || elementMuted));
  }, [element, slideMuted, elementMuted]);

  const sliderRef = useRef(null);
  const dragCleanupRef = useRef(null);

  useEffect(() => {
    return () => {
      if (typeof dragCleanupRef.current === 'function') {
        dragCleanupRef.current();
      }
      dragCleanupRef.current = null;
    };
  }, []);

  // Ensure we keep the active page selected even if store.currentTime is changed.
  useEffect(() => {
    if (!activePage) return;
  }, [store, activePage, store.currentTime]);

  // Enforce visibility based on timing.
  // We strictly assume that if Time Duration is involved (or playing), 
  // the element's visibility is dictated by the timeline.
  // This avoids "stuck" hidden states from legacy bugs or ambiguous user intents.
  useEffect(() => {
    if (!element || !activePage) return;

    const start = elementTiming.startTime;
    const end = elementTiming.endTime;
    const inRange = pageTimeMs >= start && pageTimeMs <= end;

    // Only enforce strict visibility (hiding) if we are PLAYING.
    // If we are paused (editing/scrubbing), we MUST keep the selected element visible.
    // Hiding a selected element while editing often leads to deselection or inability to adjust handles.
    const shouldEnforceTransparency = store.isPlaying;

    if (shouldEnforceTransparency) {
      const shouldBeVisible = inRange;
      if (element.visible !== shouldBeVisible) {
        element.set({ visible: shouldBeVisible });
      }
    } else {
      // When paused (Edit Mode), always ensure the SELECTED element is visible.
      // This allows the user to see and edit the element even if the playhead is outside its duration.
      if (!element.visible) {
        element.set({ visible: true });
      }
    }

    return () => {
      // CLEANUP: When unmounting (deselecting), ensure it is VISIBLE.
      // This ensures that after editing, the element remains present on the canvas
      // until the global playback logic takes over.
      if (element && !element.visible) {
        element.set({ visible: true });
      }
    };
  }, [store, activePage, element, elementTiming.startTime, elementTiming.endTime, pageTimeMs, store.isPlaying]);

  const seekToPageTime = useCallback(
    (nextPageTimeMs) => {
      if (!activePage) return;
      const nextAbs = pageStartMs + clamp(nextPageTimeMs, 0, pageDurationMs);
      if (typeof store.setCurrentTime === 'function') {
        store.setCurrentTime(nextAbs);
      } else {
        store.currentTime = nextAbs;
      }
      if (typeof store.checkActivePage === 'function') {
        store.checkActivePage();
      }
    },
    [store, activePage, pageStartMs, pageDurationMs]
  );

  const handlePlayPause = useCallback(() => {
    if (!activePage) return;

    // Pause: stop immediately, keep currentTime.
    if (store.isPlaying) {
      if (typeof store._togglePlaying === 'function') {
        store._togglePlaying(false);
      } else {
        store.isPlaying = false;
      }
      return;
    }

    // Play: play only within the currently selected slide.
    // Clamp starting point to current slide bounds.
    const now = Number.isFinite(store.currentTime) ? store.currentTime : pageStartMs;
    const startTime = clamp(now, pageStartMs, pageEndMs);

    store.play({
      startTime,
      endTime: pageEndMs,
      // Leave animatedElementsIds empty to preserve Polotno defaults.
    });
  }, [store, activePage, pageStartMs, pageEndMs]);

  const handleSoundToggle = useCallback(() => {
    if (element) {
      const nextElementMuted = !getCustomFlag(element, 'isMuted', false);
      mergeCustom(element, { isMuted: nextElementMuted });
      // Slide mute overrides element.
      ensureMutedVolume(element, Boolean(slideMuted || nextElementMuted));
      return;
    }

    if (activePage) {
      const nextSlideMuted = !getCustomFlag(activePage, 'isMuted', false);
      mergeCustom(activePage, { isMuted: nextSlideMuted });

      // Apply immediately by iterating over all elements on the slide.
      applyMuteToSlideElements(nextSlideMuted);
    }
  }, [element, activePage, slideMuted, applyMuteToSlideElements]);

  const getSliderClientX = (event) => {
    if (!event) return null;
    if (event.touches?.length) return event.touches[0].clientX;
    if (typeof event.clientX === 'number') return event.clientX;
    if (typeof event.pageX === 'number') return event.pageX;
    return null;
  };

  const getTimeFromEventWithRect = (event, rect) => {
    const clientX = getSliderClientX(event);
    if (clientX === null) return null;
    const x = clamp(clientX - rect.left, 0, rect.width);
    const ratio = rect.width > 0 ? x / rect.width : 0;
    return ratio * pageDurationMs;
  };

  const stopActiveDrag = useCallback(() => {
    if (typeof dragCleanupRef.current === 'function') {
      dragCleanupRef.current();
    }
    dragCleanupRef.current = null;
  }, []);

  const startGlobalDrag = useCallback((event, { onMove, onEnd, captureTarget }) => {
    stopActiveDrag();

    const pointerId = event?.pointerId;
    if (pointerId != null && captureTarget?.setPointerCapture) {
      try {
        captureTarget.setPointerCapture(pointerId);
      } catch {
        // ignore
      }
    }

    const handleMove = (e) => {
      if (e?.cancelable) e.preventDefault();
      onMove?.(e);
    };

    const cleanup = () => {
      try {
        if (pointerId != null && captureTarget?.releasePointerCapture) {
          captureTarget.releasePointerCapture(pointerId);
        }
      } catch {
        // ignore
      }

      window.removeEventListener('pointermove', handleMove, true);
      window.removeEventListener('pointerup', handleEnd, true);
      window.removeEventListener('pointercancel', handleEnd, true);
      window.removeEventListener('mouseup', handleEnd, true);
      window.removeEventListener('blur', handleEnd, true);
      document.removeEventListener('mouseleave', handleEnd, true);
    };

    const handleEnd = (e) => {
      if (e?.cancelable) e.preventDefault();
      cleanup();
      dragCleanupRef.current = null;
      onEnd?.(e);
    };

    // Use capture phase so we always get the end event even when pointer is captured.
    window.addEventListener('pointermove', handleMove, { capture: true, passive: false });
    window.addEventListener('pointerup', handleEnd, { capture: true, passive: false });
    window.addEventListener('pointercancel', handleEnd, { capture: true, passive: false });
    window.addEventListener('mouseup', handleEnd, { capture: true, passive: false });
    window.addEventListener('blur', handleEnd, { capture: true, passive: false });
    document.addEventListener('mouseleave', handleEnd, { capture: true, passive: false });

    dragCleanupRef.current = cleanup;
  }, [stopActiveDrag]);

  const startDrag = (kind, event) => {
    if (!element) return;
    event?.preventDefault?.();
    event?.stopPropagation?.();

    // Capture rect at drag start to avoid issues if component re-renders mid-drag.
    const rect = sliderRef.current?.getBoundingClientRect();
    if (!rect) return;

    const updateTimingFromEvent = (e) => {
      const t = getTimeFromEventWithRect(e, rect);
      if (t === null) return;
      const { startTime, endTime } = getElementTiming(element, pageDurationMs);
      if (kind === 'start') {
        setElementTiming(element, { startTime: t, endTime }, pageDurationMs);
      } else {
        setElementTiming(element, { startTime, endTime: t }, pageDurationMs);
      }
    };

    startGlobalDrag(event, {
      captureTarget: event?.currentTarget,
      onMove: updateTimingFromEvent,
      onEnd: () => { },
    });
  };

  const handleSliderPointerDown = (event) => {
    event?.preventDefault?.();
    // Click/drag on the slider (not handles) seeks current time within the slide.
    const rect = sliderRef.current?.getBoundingClientRect();
    if (!rect) return;
    const t = getTimeFromEventWithRect(event, rect);
    if (t === null) return;
    seekToPageTime(t);

    const onMove = (e) => {
      const next = getTimeFromEventWithRect(e, rect);
      if (next === null) return;
      seekToPageTime(next);
    };

    startGlobalDrag(event, {
      captureTarget: sliderRef.current,
      onMove,
      onEnd: () => { },
    });
  };

  const startPct = pageDurationMs > 0 ? (elementTiming.startTime / pageDurationMs) * 100 : 0;
  const endPct = pageDurationMs > 0 ? (elementTiming.endTime / pageDurationMs) * 100 : 100;

  return (
    <div className="duration-section">
      <div className="duration-header">
        <span className="duration-title">
          Duration <span style={{ fontSize: '10px', color: 'var(--sidebar-text-muted)' }}>ⓘ</span>
        </span>
      </div>

      <div className="duration-controls">
        <button className="play-btn" onClick={handlePlayPause} aria-label={store.isPlaying ? 'Pause' : 'Play'}>
          {store.isPlaying ? '❚❚' : '▶'}
        </button>
        <div className="duration-display">
          <div className="time-display">
            {formatTimeMMSS(pageTimeMs)} / {formatTimeMMSS(pageDurationMs)}
            <span
              style={{ marginLeft: '8px', cursor: 'pointer', userSelect: 'none' }}
              onClick={handleSoundToggle}
              title={element ? 'Toggle element sound' : 'Toggle slide sound'}
            >
              {isMutedForUI ? '🔇' : '🔊'}
            </span>
          </div>
          <div
            ref={(node) => {
              sliderRef.current = node;
              sliderRef.current && (sliderRef.current.dataset.kind = 'time-slider');
            }}
            className="time-slider"
            onMouseDown={handleSliderPointerDown}
            onTouchStart={handleSliderPointerDown}
            onPointerDown={handleSliderPointerDown}
            role="slider"
            aria-label="Timeline"
          >
            <div className="time-slider-range" style={{ left: `${startPct}%`, width: `${Math.max(0, endPct - startPct)}%` }} />
            <div className="time-slider-fill" style={{ width: `${progressPct}%` }} />
            {element && (
              <>
                <div
                  className="time-handle start"
                  style={{ left: `${startPct}%` }}
                  onMouseDown={(e) => startDrag('start', e)}
                  onTouchStart={(e) => startDrag('start', e)}
                  onPointerDown={(e) => startDrag('start', e)}
                  title="Start"
                />
                <div
                  className="time-handle end"
                  style={{ left: `${endPct}%` }}
                  onMouseDown={(e) => startDrag('end', e)}
                  onTouchStart={(e) => startDrag('end', e)}
                  onPointerDown={(e) => startDrag('end', e)}
                  title="End"
                />
              </>
            )}
          </div>
        </div>
      </div>

      <div className="duration-info">
        Starts at <span>{formatTimeMMSS(elementTiming.startTime)}</span> and ends at <span>{formatTimeMMSS(elementTiming.endTime)}</span>
      </div>
    </div>
  );
});

/**
 * Animation controls section - Enhanced with Animate button - Dark theme style
 */
export const AnimationSection = observer(({ store, element }) => {
  if (!element) return null;

  const animations = element.animations || [];
  const enterAnimation = animations.find(a => a.type === 'enter') || null;
  const exitAnimation = animations.find(a => a.type === 'exit') || null;
  const loopAnimation = animations.find(a => a.type === 'loop') || null;

  // Available animation presets (Slide is now a single option with direction)
  const animationPresets = [
    { name: 'none', label: 'None' },
    { name: 'fade', label: 'Fade' },
    { name: 'zoom', label: 'Zoom' },
    { name: 'move', label: 'Slide' },
    { name: 'rotate', label: 'Rotate' },
    { name: 'bounce', label: 'Bounce' },
    { name: 'blink', label: 'Blink' },
  ];

  // Direction options for Slide animation
  const directionOptions = [
    { value: 'up', label: 'Up' },
    { value: 'down', label: 'Down' },
    { value: 'left', label: 'Left' },
    { value: 'right', label: 'Right' },
  ];

  const easingOptions = [
    { value: 'linear', label: 'Linear' },
    { value: 'easeIn', label: 'Ease In' },
    { value: 'easeOut', label: 'Ease Out' },
    { value: 'easeInOut', label: 'Ease In Out' },
  ];

  // Helper to check if animation is a move/slide type
  const isMoveAnimation = (name) => {
    return name === 'move';
  };

  // Get the base animation name for display
  const getDisplayName = (animName) => {
    return animName || 'none';
  };

  // Get the current direction from animation data
  const getDirection = (anim) => {
    return anim?.data?.direction || 'up';
  };

  const setEnterAnimation = (name) => {
    if (name === 'none') {
      const newAnimations = animations.filter(a => a.type !== 'enter');
      element.set({ animations: newAnimations });
    } else {
      const newEnterAnim = {
        name: name,
        type: 'enter',
        duration: enterAnimation?.duration || 1000,
        delay: enterAnimation?.delay || 0,
        easing: enterAnimation?.easing || 'easeOut',
        enabled: true,
        // Add data with direction for move animation
        ...(name === 'move' ? { data: { direction: enterAnimation?.data?.direction || 'up' } } : {})
      };
      const otherAnimations = animations.filter(a => a.type !== 'enter');
      element.set({ animations: [...otherAnimations, newEnterAnim] });
    }
  };

  const setExitAnimation = (name) => {
    if (name === 'none') {
      const newAnimations = animations.filter(a => a.type !== 'exit');
      element.set({ animations: newAnimations });
    } else {
      const newExitAnim = {
        name: name,
        type: 'exit',
        duration: exitAnimation?.duration || 1000,
        delay: exitAnimation?.delay || 0,
        easing: exitAnimation?.easing || 'easeIn',
        enabled: true,
        // Add data with direction for move animation
        ...(name === 'move' ? { data: { direction: exitAnimation?.data?.direction || 'up' } } : {})
      };
      const otherAnimations = animations.filter(a => a.type !== 'exit');
      element.set({ animations: [...otherAnimations, newExitAnim] });
    }
  };

  const setLoopAnimation = (name) => {
    if (name === 'none') {
      const newAnimations = animations.filter(a => a.type !== 'loop');
      element.set({ animations: newAnimations });
    } else {
      const newLoopAnim = {
        name: name,
        type: 'loop',
        duration: loopAnimation?.duration || 1000,
        delay: loopAnimation?.delay || 0,
        easing: loopAnimation?.easing || 'linear',
        enabled: true,
        // Add data with direction for move animation
        ...(name === 'move' ? { data: { direction: loopAnimation?.data?.direction || 'up' } } : {})
      };
      const otherAnimations = animations.filter(a => a.type !== 'loop');
      element.set({ animations: [...otherAnimations, newLoopAnim] });
    }
  };

  const updateAnimation = (type, updates) => {
    const newAnimations = animations.map(anim => {
      if (anim.type === type) {
        // Handle direction updates for move animation
        if (updates.direction !== undefined) {
          return {
            ...anim,
            data: { ...anim.data, direction: updates.direction }
          };
        }
        return { ...anim, ...updates };
      }
      return anim;
    });
    element.set({ animations: newAnimations });
  };

  // Update direction for Slide animation
  const setDirection = (type, direction) => {
    updateAnimation(type, { direction });
  };

  const handlePlay = () => {
    if (store) {
      store.play();
    }
  };

  return (
    <div className="section">
      <div className="section-title" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <span>Animation</span>
        <button
          onClick={handlePlay}
          className="action-btn"
          style={{
            background: 'var(--sidebar-accent)',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            padding: '6px 12px',
            fontSize: '12px',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            width: 'auto',
            maxWidth: '100px',
            flexShrink: 0
          }}
        >
          <span style={{ fontSize: 10 }}>▶</span> Preview
        </button>
      </div>

      {/* Entrance Animation */}
      <div style={{ marginTop: '16px' }}>
        <div style={{ fontSize: '11px', color: '#a0aec0', fontWeight: '700', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          Entrance
        </div>

        <div className="control-row">
          <span className="control-label">Effect</span>
          <div className="control-value">
            <div className="select-wrapper" style={{ width: '120px' }}>
              <Dropdown
                value={getDisplayName(enterAnimation?.name || 'none')}
                onChange={(v) => setEnterAnimation(v)}
                options={animationPresets.map((anim) => ({ value: anim.name, label: anim.label }))}
                ariaLabel="Entrance effect"
              />
            </div>
          </div>
        </div>

        {/* Direction control for Slide animation */}
        {enterAnimation && isMoveAnimation(enterAnimation.name) && (
          <div className="control-row">
            <span className="control-label">Direction</span>
            <div className="control-value">
              <div className="select-wrapper" style={{ width: '120px' }}>
                <Dropdown
                  value={getDirection(enterAnimation)}
                  onChange={(v) => setDirection('enter', v)}
                  options={directionOptions}
                  ariaLabel="Entrance direction"
                />
              </div>
            </div>
          </div>
        )}

        {enterAnimation && (
          <>
            <div className="control-row">
              <span className="control-label">Duration</span>
              <div className="control-value">
                <input
                  type="number"
                  className="position-input"
                  value={enterAnimation.duration || 1000}
                  onChange={(e) => updateAnimation('enter', { duration: parseInt(e.target.value) || 1000 })}
                  step={100}
                  min={0}
                />
                <span style={{ color: 'var(--text-muted)', fontSize: '11px' }}>ms</span>
              </div>
            </div>

            <div className="control-row">
              <span className="control-label">Delay</span>
              <div className="control-value">
                <input
                  type="number"
                  className="position-input"
                  value={enterAnimation.delay ?? 0}
                  onChange={(e) => {
                    const value = parseInt(e.target.value);
                    updateAnimation('enter', { delay: isNaN(value) ? 0 : value });
                  }}
                  step={100}
                  min={0}
                />
                <span style={{ color: 'var(--text-muted)', fontSize: '11px' }}>ms</span>
              </div>
            </div>

            {/* Speed control for rotate, blink, and bounce */}
            {['rotate', 'blink', 'bounce'].includes(enterAnimation.name) && (
              <div className="control-row">
                <span className="control-label">Speed</span>
                <div className="control-value">
                  <input
                    type="number"
                    className="position-input"
                    value={enterAnimation.speed || 1}
                    onChange={(e) => updateAnimation('enter', { speed: parseFloat(e.target.value) || 1 })}
                    step={0.1}
                    min={0.1}
                    max={10}
                  />
                  <span style={{ color: 'var(--text-muted)', fontSize: '11px' }}>x</span>
                </div>
              </div>
            )}

            <div className="control-row">
              <span className="control-label">Easing</span>
              <div className="control-value">
                <div className="select-wrapper" style={{ width: '120px' }}>
                  <Dropdown
                    value={enterAnimation.easing || 'easeOut'}
                    onChange={(v) => updateAnimation('enter', { easing: v })}
                    options={easingOptions}
                    ariaLabel="Entrance easing"
                  />
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Exit Animation */}
      <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid #f2f2f2' }}>
        <div style={{ fontSize: '11px', color: '#a0aec0', fontWeight: '700', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          Exit
        </div>

        <div className="control-row">
          <span className="control-label">Effect</span>
          <div className="control-value">
            <div className="select-wrapper" style={{ width: '120px' }}>
              <Dropdown
                value={getDisplayName(exitAnimation?.name || 'none')}
                onChange={(v) => setExitAnimation(v)}
                options={animationPresets.map((anim) => ({ value: anim.name, label: anim.label }))}
                ariaLabel="Exit effect"
              />
            </div>
          </div>
        </div>

        {/* Direction control for Slide animation */}
        {exitAnimation && isMoveAnimation(exitAnimation.name) && (
          <div className="control-row">
            <span className="control-label">Direction</span>
            <div className="control-value">
              <div className="select-wrapper" style={{ width: '120px' }}>
                <Dropdown
                  value={getDirection(exitAnimation)}
                  onChange={(v) => setDirection('exit', v)}
                  options={directionOptions}
                  ariaLabel="Exit direction"
                />
              </div>
            </div>
          </div>
        )}

        {exitAnimation && (
          <>
            <div className="control-row">
              <span className="control-label">Duration</span>
              <div className="control-value">
                <input
                  type="number"
                  className="position-input"
                  value={exitAnimation.duration || 1000}
                  onChange={(e) => updateAnimation('exit', { duration: parseInt(e.target.value) || 1000 })}
                  style={{ width: '60px' }}
                  step={100}
                  min={0}
                />
                <span style={{ color: 'var(--text-muted)', fontSize: '11px' }}>ms</span>
              </div>
            </div>

            <div className="control-row">
              <span className="control-label">Delay</span>
              <div className="control-value">
                <input
                  type="number"
                  className="position-input"
                  value={exitAnimation.delay ?? 0}
                  onChange={(e) => {
                    const value = parseInt(e.target.value);
                    updateAnimation('exit', { delay: isNaN(value) ? 0 : value });
                  }}
                  style={{ width: '60px' }}
                  step={100}
                  min={0}
                />
                <span style={{ color: 'var(--text-muted)', fontSize: '11px' }}>ms</span>
              </div>
            </div>

            {/* Speed control for rotate, blink, and bounce */}
            {['rotate', 'blink', 'bounce'].includes(exitAnimation.name) && (
              <div className="control-row">
                <span className="control-label">Speed</span>
                <div className="control-value">
                  <input
                    type="number"
                    className="position-input"
                    value={exitAnimation.speed || 1}
                    onChange={(e) => updateAnimation('exit', { speed: parseFloat(e.target.value) || 1 })}
                    style={{ width: '60px' }}
                    step={0.1}
                    min={0.1}
                    max={10}
                  />
                  <span style={{ color: 'var(--text-muted)', fontSize: '11px' }}>x</span>
                </div>
              </div>
            )}

            <div className="control-row">
              <span className="control-label">Easing</span>
              <div className="control-value">
                <div className="select-wrapper" style={{ width: '120px' }}>
                  <Dropdown
                    value={exitAnimation.easing || 'easeIn'}
                    onChange={(v) => updateAnimation('exit', { easing: v })}
                    options={easingOptions}
                    ariaLabel="Exit easing"
                  />
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Loop Animation */}
      <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid #f2f2f2' }}>
        <div style={{ fontSize: '11px', color: '#a0aec0', fontWeight: '700', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          Loop
        </div>

        <div className="control-row">
          <span className="control-label">Effect</span>
          <div className="control-value">
            <div className="select-wrapper" style={{ width: '120px' }}>
              <Dropdown
                value={getDisplayName(loopAnimation?.name || 'none')}
                onChange={(v) => setLoopAnimation(v)}
                options={animationPresets.map((anim) => ({ value: anim.name, label: anim.label }))}
                ariaLabel="Loop effect"
              />
            </div>
          </div>
        </div>

        {/* Direction control for Slide animation */}
        {loopAnimation && isMoveAnimation(loopAnimation.name) && (
          <div className="control-row">
            <span className="control-label">Direction</span>
            <div className="control-value">
              <div className="select-wrapper" style={{ width: '120px' }}>
                <Dropdown
                  value={getDirection(loopAnimation)}
                  onChange={(v) => setDirection('loop', v)}
                  options={directionOptions}
                  ariaLabel="Loop direction"
                />
              </div>
            </div>
          </div>
        )}

        {loopAnimation && (
          <>
            <div className="control-row">
              <span className="control-label">Duration</span>
              <div className="control-value">
                <input
                  type="number"
                  className="position-input"
                  value={loopAnimation.duration || 1000}
                  onChange={(e) => updateAnimation('loop', { duration: parseInt(e.target.value) || 1000 })}
                  style={{ width: '60px' }}
                  step={100}
                  min={0}
                />
                <span style={{ color: 'var(--text-muted)', fontSize: '11px' }}>ms</span>
              </div>
            </div>

            <div className="control-row">
              <span className="control-label">Delay</span>
              <div className="control-value">
                <input
                  type="number"
                  className="position-input"
                  value={loopAnimation.delay ?? 0}
                  onChange={(e) => {
                    const value = parseInt(e.target.value);
                    updateAnimation('loop', { delay: isNaN(value) ? 0 : value });
                  }}
                  style={{ width: '60px' }}
                  step={100}
                  min={0}
                />
                <span style={{ color: 'var(--text-muted)', fontSize: '11px' }}>ms</span>
              </div>
            </div>

            {/* Speed control for rotate, blink, and bounce */}
            {['rotate', 'blink', 'bounce'].includes(loopAnimation.name) && (
              <div className="control-row">
                <span className="control-label">Speed</span>
                <div className="control-value">
                  <input
                    type="number"
                    className="position-input"
                    value={loopAnimation.speed || 1}
                    onChange={(e) => updateAnimation('loop', { speed: parseFloat(e.target.value) || 1 })}
                    style={{ width: '60px' }}
                    step={0.1}
                    min={0.1}
                    max={10}
                  />
                  <span style={{ color: 'var(--text-muted)', fontSize: '11px' }}>x</span>
                </div>
              </div>
            )}

            <div className="control-row">
              <span className="control-label">Easing</span>
              <div className="control-value">
                <div className="select-wrapper" style={{ width: '120px' }}>
                  <Dropdown
                    value={loopAnimation.easing || 'linear'}
                    onChange={(v) => updateAnimation('loop', { easing: v })}
                    options={easingOptions}
                    ariaLabel="Loop easing"
                  />
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Quick Clear */}
      {(enterAnimation || exitAnimation || loopAnimation) && (
        <div style={{ marginTop: '16px' }}>
          <button
            onClick={() => element.set({ animations: [] })}
            style={{
              width: '100%',
              padding: '8px 16px',
              background: 'transparent',
              border: '1px solid var(--border-primary)',
              borderRadius: '6px',
              color: 'var(--text-secondary)',
              fontSize: '12px',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            Clear All Animations
          </button>
        </div>
      )}
    </div>
  );
});
