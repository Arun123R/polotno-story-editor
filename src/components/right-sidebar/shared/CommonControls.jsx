import { observer } from 'mobx-react-lite';

/**
 * Position controls for element x, y, width, height, rotation - Dark theme style
 */
export const PositionSection = observer(({ element }) => {
  if (!element) return null;

  return (
    <div className="section">
      <div className="section-title">Position & Size</div>
      
      <div className="control-row">
        <span className="control-label">Position</span>
        <div className="control-value">
          <div className="position-row">
            <div className="position-field">
              <input
                type="number"
                className="position-input"
                value={Math.round(element.x)}
                onChange={(e) => element.set({ x: parseFloat(e.target.value) || 0 })}
              />
              <label>X</label>
            </div>
            <div className="position-field">
              <input
                type="number"
                className="position-input"
                value={Math.round(element.y)}
                onChange={(e) => element.set({ y: parseFloat(e.target.value) || 0 })}
              />
              <label>Y</label>
            </div>
          </div>
        </div>
      </div>

      <div className="control-row">
        <span className="control-label">Size</span>
        <div className="control-value">
          <div className="position-row">
            <div className="position-field">
              <input
                type="number"
                className="position-input"
                value={Math.round(element.width)}
                onChange={(e) => element.set({ width: parseFloat(e.target.value) || 1 })}
              />
              <label>W</label>
            </div>
            <div className="position-field">
              <input
                type="number"
                className="position-input"
                value={Math.round(element.height)}
                onChange={(e) => element.set({ height: parseFloat(e.target.value) || 1 })}
              />
              <label>H</label>
            </div>
          </div>
        </div>
      </div>

      <div className="control-row">
        <span className="control-label">Rotation</span>
        <div className="control-value">
          <input
            type="number"
            className="position-input"
            value={Math.round(element.rotation || 0)}
            onChange={(e) => element.set({ rotation: parseFloat(e.target.value) || 0 })}
          />
          <span style={{ color: 'var(--sidebar-text-muted)', fontSize: '11px' }}>°</span>
        </div>
      </div>
    </div>
  );
});

/**
 * Opacity slider control - Dark theme style
 */
export const OpacitySlider = observer(({ element }) => {
  if (!element) return null;

  const opacity = element.opacity ?? 1;
  const percentage = Math.round(opacity * 100);

  return (
    <div className="control-row">
      <span className="control-label">Opacity</span>
      <div className="control-value">
        <div className="slider-container">
          <input
            type="number"
            className="slider-input"
            value={percentage}
            onChange={(e) => element.set({ opacity: (parseInt(e.target.value) || 0) / 100 })}
            min={0}
            max={100}
          />
          <div className="slider-track">
            <input
              type="range"
              min={0}
              max={100}
              value={percentage}
              onChange={(e) => element.set({ opacity: parseInt(e.target.value) / 100 })}
            />
            <div className="slider-fill" style={{ width: `${percentage}%` }}>
              <div className="slider-thumb" />
            </div>
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
  const duration = activePage?.duration || 7;

  return (
    <div className="duration-section">
      <div className="duration-header">
        <span className="duration-title">
          Duration <span style={{ fontSize: '10px', color: 'var(--sidebar-text-muted)' }}>ⓘ</span>
        </span>
        <span className="new-badge">New</span>
      </div>

      <div className="duration-controls">
        <button className="play-btn" onClick={() => store.play()}>
          ▶
        </button>
        <div className="duration-display">
          <div className="time-display">
            00:00 / 00:{String(duration).padStart(2, '0')}
            <span style={{ marginLeft: '8px', cursor: 'pointer' }}>🔊</span>
          </div>
          <div className="time-slider">
            <div className="time-slider-fill" style={{ width: '0%' }} />
          </div>
        </div>
      </div>

      <div className="duration-info">
        Starts at <span>00:00</span> and ends at <span>00:{String(duration).padStart(2, '0')}</span>
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
      <div className="section-title" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span>Animation</span>
        <button 
          onClick={handlePlay}
          style={{
            background: 'var(--accent-primary)',
            color: 'var(--bg-primary)',
            border: 'none',
            borderRadius: '6px',
            padding: '6px 16px',
            fontSize: '12px',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          ▶ Preview
        </button>
      </div>

      {/* Entrance Animation */}
      <div style={{ marginTop: '16px' }}>
        <div style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: '600', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
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
                  value={enterAnimation.delay || 0}
                  onChange={(e) => updateAnimation('enter', { delay: parseInt(e.target.value) || 0 })}
                  style={{ width: '60px' }}
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
      <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid var(--border-primary)' }}>
        <div style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: '600', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
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
                  value={exitAnimation.delay || 0}
                  onChange={(e) => updateAnimation('exit', { delay: parseInt(e.target.value) || 0 })}
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
      <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid var(--border-primary)' }}>
        <div style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: '600', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
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
                  value={loopAnimation.delay || 0}
                  onChange={(e) => updateAnimation('loop', { delay: parseInt(e.target.value) || 0 })}
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
