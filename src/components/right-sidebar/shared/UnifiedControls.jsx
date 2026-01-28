import React, { useState, useCallback } from 'react';

/**
 * ColorPickerInput - A unified color picker component for consistent
 * color input behavior across the entire project.
 * 
 * Features:
 * - Color swatch with native color picker
 * - Hex input text field
 * - Consistent styling with the design system
 * 
 * @param {string} value - Current color value (hex format)
 * @param {function} onChange - Callback when color changes
 * @param {string} defaultValue - Default color value if none provided
 * @param {boolean} showHexInput - Whether to show hex input field (default: true)
 */
export const ColorPickerInput = ({ 
  value, 
  onChange, 
  defaultValue = '#000000',
  showHexInput = true 
}) => {
  const [localValue, setLocalValue] = useState(value || defaultValue);
  
  // Normalize the color value
  const currentColor = value || defaultValue;
  
  // Handle color change from native picker
  const handleColorChange = useCallback((e) => {
    const newColor = e.target.value;
    setLocalValue(newColor);
    onChange?.(newColor);
  }, [onChange]);
  
  // Handle hex input change
  const handleHexChange = useCallback((e) => {
    let newValue = e.target.value;
    setLocalValue(newValue);
    
    // Only trigger onChange for valid hex colors
    if (/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6}|[0-9A-Fa-f]{8})$/.test(newValue)) {
      onChange?.(newValue);
    } else if (/^([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6}|[0-9A-Fa-f]{8})$/.test(newValue)) {
      onChange?.(`#${newValue}`);
    }
  }, [onChange]);
  
  // Handle blur - ensure value is properly formatted
  const handleHexBlur = useCallback(() => {
    let finalValue = localValue;
    
    // Add # if missing
    if (finalValue && !finalValue.startsWith('#')) {
      finalValue = `#${finalValue}`;
    }
    
    // Validate and set
    if (/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6}|[0-9A-Fa-f]{8})$/.test(finalValue)) {
      setLocalValue(finalValue);
      onChange?.(finalValue);
    } else {
      // Reset to current valid value
      setLocalValue(currentColor);
    }
  }, [localValue, currentColor, onChange]);

  return (
    <div className="color-picker-row">
      {/* Color Swatch with native picker */}
      <div
        className="color-swatch"
        style={{ backgroundColor: currentColor }}
      >
        <input
          type="color"
          value={currentColor.startsWith('#') ? currentColor.slice(0, 7) : `#${currentColor.slice(0, 6)}`}
          onChange={handleColorChange}
        />
      </div>
      
      {/* Hex Input */}
      {showHexInput && (
        <input
          type="text"
          className="color-input-text"
          value={localValue}
          onChange={handleHexChange}
          onBlur={handleHexBlur}
          style={{ width: '80px' }}
          placeholder="#000000"
        />
      )}
    </div>
  );
};

/**
 * SliderWithInput - A unified slider component with numeric input
 * for consistent control behavior (Border, Opacity, Radius, etc.)
 * 
 * @param {string} label - Label for the control
 * @param {number} value - Current value
 * @param {function} onChange - Callback when value changes
 * @param {number} min - Minimum value (default: 0)
 * @param {number} max - Maximum value (default: 100)
 * @param {number} step - Step increment (default: 1)
 * @param {string} unit - Optional unit suffix (e.g., '%', 'px')
 */
export const SliderWithInput = ({
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  unit = ''
}) => {
  // Calculate fill percentage for slider visual
  const fillPercent = ((value - min) / (max - min)) * 100;

  const handleInputChange = useCallback((e) => {
    const newValue = parseFloat(e.target.value);
    if (!isNaN(newValue)) {
      // Clamp to min/max
      const clampedValue = Math.min(max, Math.max(min, newValue));
      onChange?.(clampedValue);
    }
  }, [onChange, min, max]);

  const handleSliderChange = useCallback((e) => {
    const newValue = parseFloat(e.target.value);
    onChange?.(newValue);
  }, [onChange]);

  return (
    <div className="slider-container">
      {/* Numeric Input */}
      <input
        type="number"
        className="slider-input"
        value={Math.round(value)}
        onChange={handleInputChange}
        min={min}
        max={max}
        step={step}
      />
      
      {/* Slider Track */}
      <div className="slider-track">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={handleSliderChange}
        />
        <div className="slider-fill" style={{ width: `${fillPercent}%` }}>
          <div className="slider-thumb" />
        </div>
      </div>
      
      {/* Unit suffix */}
      {unit && (
        <span style={{ color: 'var(--sidebar-text-muted)', fontSize: '11px', marginLeft: '-4px' }}>
          {unit}
        </span>
      )}
    </div>
  );
};

export default {
  ColorPickerInput,
  SliderWithInput
};
