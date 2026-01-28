import React, { useState, useCallback, useEffect } from 'react';

/**
 * Utility function to convert any color format to hex
 * Handles: hex, rgb, rgba, named colors
 */
export const toHexColor = (color) => {
  if (!color) return '#000000';
  
  // Already hex format
  if (color.startsWith('#')) {
    // Handle short hex (#RGB) -> (#RRGGBB)
    if (color.length === 4) {
      const r = color[1];
      const g = color[2];
      const b = color[3];
      return `#${r}${r}${g}${g}${b}${b}`.toUpperCase();
    }
    // Handle hex with alpha (#RRGGBBAA) -> (#RRGGBB)
    if (color.length === 9) {
      return color.slice(0, 7).toUpperCase();
    }
    return color.toUpperCase();
  }
  
  // Handle rgba(r,g,b,a) or rgb(r,g,b) format
  const rgbMatch = color.match(/rgba?\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*[\d.]+)?\s*\)/i);
  if (rgbMatch) {
    const r = parseInt(rgbMatch[1], 10);
    const g = parseInt(rgbMatch[2], 10);
    const b = parseInt(rgbMatch[3], 10);
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`.toUpperCase();
  }
  
  // Handle named colors by creating a temporary element
  if (typeof document !== 'undefined') {
    const tempDiv = document.createElement('div');
    tempDiv.style.color = color;
    document.body.appendChild(tempDiv);
    const computedColor = getComputedStyle(tempDiv).color;
    document.body.removeChild(tempDiv);
    
    const match = computedColor.match(/rgba?\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/i);
    if (match) {
      const r = parseInt(match[1], 10);
      const g = parseInt(match[2], 10);
      const b = parseInt(match[3], 10);
      return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`.toUpperCase();
    }
  }
  
  return '#000000';
};

/**
 * Validate if a string is a valid hex color
 */
export const isValidHex = (color) => {
  if (!color) return false;
  return /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(color);
};

/**
 * ColorPicker - A unified color picker component for consistent
 * color input behavior across the entire project.
 * 
 * Features:
 * - Color swatch with native color picker
 * - Hex input text field (always shows hex, never rgba)
 * - Automatic conversion of any color format to hex
 * - Consistent styling with the design system
 * 
 * @param {string} value - Current color value (any format)
 * @param {function} onChange - Callback when color changes (always returns hex)
 * @param {string} label - Optional label for the control
 * @param {boolean} showLabel - Whether to show the label (default: false)
 */
export const ColorPicker = ({ 
  value, 
  onChange, 
  label = 'Color',
  showLabel = false,
}) => {
  // Convert incoming value to hex
  const hexValue = toHexColor(value);
  const [localValue, setLocalValue] = useState(hexValue);
  
  // Sync local value when prop changes
  useEffect(() => {
    const newHex = toHexColor(value);
    if (newHex !== localValue) {
      setLocalValue(newHex);
    }
  }, [value]);
  
  // Handle color change from native picker
  const handleColorChange = useCallback((e) => {
    const newColor = e.target.value.toUpperCase();
    setLocalValue(newColor);
    onChange?.(newColor);
  }, [onChange]);
  
  // Handle hex input change
  const handleHexChange = useCallback((e) => {
    let newValue = e.target.value.toUpperCase();
    
    // Allow typing without # prefix
    if (!newValue.startsWith('#') && newValue.length > 0) {
      newValue = `#${newValue}`;
    }
    
    setLocalValue(newValue);
    
    // Only trigger onChange for valid hex colors
    if (isValidHex(newValue)) {
      onChange?.(newValue);
    }
  }, [onChange]);
  
  // Handle blur - validate and format
  const handleHexBlur = useCallback(() => {
    let finalValue = localValue;
    
    // Add # if missing
    if (finalValue && !finalValue.startsWith('#')) {
      finalValue = `#${finalValue}`;
    }
    
    // Validate and set
    if (isValidHex(finalValue)) {
      // Expand short hex
      if (finalValue.length === 4) {
        const r = finalValue[1];
        const g = finalValue[2];
        const b = finalValue[3];
        finalValue = `#${r}${r}${g}${g}${b}${b}`.toUpperCase();
      }
      setLocalValue(finalValue);
      onChange?.(finalValue);
    } else {
      // Reset to last valid value
      setLocalValue(hexValue);
    }
  }, [localValue, hexValue, onChange]);

  return (
    <div className="color-picker-row">
      {/* Color Swatch with native picker */}
      <div
        className="color-swatch"
        style={{ backgroundColor: hexValue }}
      >
        <input
          type="color"
          value={hexValue.slice(0, 7)}
          onChange={handleColorChange}
        />
      </div>
      
      {/* Hex Input - always shows hex format */}
      <input
        type="text"
        className="color-input-text"
        value={localValue}
        onChange={handleHexChange}
        onBlur={handleHexBlur}
        style={{ width: '80px' }}
        placeholder="#000000"
        maxLength={7}
      />
    </div>
  );
};

/**
 * ColorPickerControl - Full control row with label and ColorPicker
 * Use this for consistent layout in settings panels
 */
export const ColorPickerControl = ({
  label,
  value,
  onChange,
}) => {
  return (
    <div className="control-row">
      <span className="control-label">{label}</span>
      <div className="control-value">
        <ColorPicker value={value} onChange={onChange} />
      </div>
    </div>
  );
};

export default ColorPicker;
