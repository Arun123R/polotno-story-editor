import { observer } from 'mobx-react-lite';

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
        <span>🗑</span> Delete
      </button>
    </div>
  );
});

/**
 * Duration section with play button and timeline - Dark theme style
 */
export const DurationSection = observer(({ store, element }) => {
  const activePage = store.activePage;
  const rawDuration = activePage?.duration || 5;
  const durationInSeconds = rawDuration > 100 ? rawDuration / 1000 : rawDuration;

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}.00`;
  };

  const timeStr = formatTime(durationInSeconds);

  return (
    <div className="section duration-section">
      <div className="duration-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span className="section-title" style={{ margin: 0 }}>Duration</span>
          <span style={{ fontSize: '14px', color: '#a0aec0', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>ⓘ</span>
        </div>
        <span style={{
          background: 'var(--sidebar-accent)',
          color: 'white',
          fontSize: '10px',
          fontWeight: '700',
          padding: '2px 8px',
          borderRadius: '4px',
          textTransform: 'uppercase'
        }}>New</span>
      </div>

      <div className="duration-controls" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <button
          className="play-btn"
          onClick={() => store.play()}
          style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            background: 'var(--sidebar-accent)',
            color: 'white',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'transform 0.2s',
            boxShadow: '0 4px 12px rgba(249, 115, 22, 0.2)'
          }}
          onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.95)'}
          onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
        >
          <span style={{ fontSize: '24px', marginLeft: '4px' }}>▶</span>
        </button>
        <div className="duration-display" style={{ flex: 1 }}>
          <div className="time-display" style={{ fontSize: '18px', fontWeight: '600', color: '#2d3748', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            00:00 / {timeStr}
            <span style={{ fontSize: '10px', color: '#718096' }}>▶</span>
          </div>
          <div className="time-slider" style={{ height: '4px', background: '#edf2f7', borderRadius: '2px', position: 'relative' }}>
            <div className="time-slider-fill" style={{ width: '0%', height: '100%', background: 'var(--sidebar-accent)', borderRadius: '2px' }} />
          </div>
        </div>
      </div>

      <div className="duration-info" style={{ marginTop: '16px', fontSize: '13px', color: '#718096', textAlign: 'center' }}>
        Starts at <span style={{ color: 'var(--sidebar-accent)', fontWeight: '600' }}>00:00</span> and ends at <span style={{ color: 'var(--sidebar-accent)', fontWeight: '600' }}>{timeStr}</span>
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
              <select
                className="select-input"
                value={getDisplayName(enterAnimation?.name || 'none')}
                onChange={(e) => setEnterAnimation(e.target.value)}
              >
                {animationPresets.map(anim => (
                  <option key={anim.name} value={anim.name}>
                    {anim.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Direction control for Slide animation */}
        {enterAnimation && isMoveAnimation(enterAnimation.name) && (
          <div className="control-row">
            <span className="control-label">Direction</span>
            <div className="control-value">
              <div className="select-wrapper" style={{ width: '120px' }}>
                <select
                  className="select-input"
                  value={getDirection(enterAnimation)}
                  onChange={(e) => setDirection('enter', e.target.value)}
                >
                  {directionOptions.map(dir => (
                    <option key={dir.value} value={dir.value}>
                      {dir.label}
                    </option>
                  ))}
                </select>
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
                  <select
                    className="select-input"
                    value={enterAnimation.easing || 'easeOut'}
                    onChange={(e) => updateAnimation('enter', { easing: e.target.value })}
                  >
                    {easingOptions.map(opt => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
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
              <select
                className="select-input"
                value={getDisplayName(exitAnimation?.name || 'none')}
                onChange={(e) => setExitAnimation(e.target.value)}
              >
                {animationPresets.map(anim => (
                  <option key={anim.name} value={anim.name}>
                    {anim.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Direction control for Slide animation */}
        {exitAnimation && isMoveAnimation(exitAnimation.name) && (
          <div className="control-row">
            <span className="control-label">Direction</span>
            <div className="control-value">
              <div className="select-wrapper" style={{ width: '120px' }}>
                <select
                  className="select-input"
                  value={getDirection(exitAnimation)}
                  onChange={(e) => setDirection('exit', e.target.value)}
                >
                  {directionOptions.map(dir => (
                    <option key={dir.value} value={dir.value}>
                      {dir.label}
                    </option>
                  ))}
                </select>
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
                  <select
                    className="select-input"
                    value={exitAnimation.easing || 'easeIn'}
                    onChange={(e) => updateAnimation('exit', { easing: e.target.value })}
                  >
                    {easingOptions.map(opt => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
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
              <select
                className="select-input"
                value={getDisplayName(loopAnimation?.name || 'none')}
                onChange={(e) => setLoopAnimation(e.target.value)}
              >
                {animationPresets.map(anim => (
                  <option key={anim.name} value={anim.name}>
                    {anim.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Direction control for Slide animation */}
        {loopAnimation && isMoveAnimation(loopAnimation.name) && (
          <div className="control-row">
            <span className="control-label">Direction</span>
            <div className="control-value">
              <div className="select-wrapper" style={{ width: '120px' }}>
                <select
                  className="select-input"
                  value={getDirection(loopAnimation)}
                  onChange={(e) => setDirection('loop', e.target.value)}
                >
                  {directionOptions.map(dir => (
                    <option key={dir.value} value={dir.value}>
                      {dir.label}
                    </option>
                  ))}
                </select>
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
                  <select
                    className="select-input"
                    value={loopAnimation.easing || 'linear'}
                    onChange={(e) => updateAnimation('loop', { easing: e.target.value })}
                  >
                    {easingOptions.map(opt => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
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
