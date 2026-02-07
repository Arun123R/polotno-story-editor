
import React, { useState } from 'react';

/**
 * EmojiPickerControl - A simplified input for emoji entry.
 * 
 * Instead of a custom popover (which causes clipping/z-index issues and isn't native),
 * this uses a standard HTML input styled to look like an emoji slot.
 * 
 * User interaction:
 * 1. Click the box (focuses input).
 * 2. User presses native emoji shortcut (e.g. Fn or Ctrl+Cmd+Space on Mac, Win+. on Windows).
 * 3. User selects emoji nativey.
 */
export const EmojiPickerControl = ({ label, value, onChange }) => {
    const [isFocused, setIsFocused] = useState(false);

    const handleChange = (e) => {
        // Get the raw value
        let val = e.target.value;

        // If the user pasted or typed multiple chars, usually we only want one emoji.
        // A simple heuristic for "replace": if value length increased and it was already 1 or 2 chars (emoji usually 2 chars), 
        // maybe take the *new* part? 
        // But simplistic approach: just update value. If user types "cat", let it be "cat".
        // Or we could try to limit it. 
        // To mimic a "single slot": if new value is longer, take the last grapheme? Hard without library.
        // Let's just update as is. The parent component might handle validation if needed, 
        // but typically emoji fields are loose.

        // Optimization: If the user selects an emoji from system picker, it usually appends.
        // If we want "replace" behavior:
        // If previous value was present and we added something, take the new suffix.

        // Attempt to keep it single-char-ish (emojis can be surrogate pairs, so length 2).
        // Let's just pass the value.
        onChange(val);
    };

    const handleFocus = (e) => {
        setIsFocused(true);
        e.target.select(); // Auto-select text so next input replaces it
    };

    return (
        <div className="control-row" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <span className="control-label" style={{ fontSize: 13, fontWeight: 500, color: '#374151' }}>{label}</span>
            <input
                type="text"
                value={value}
                onChange={handleChange}
                onFocus={handleFocus}
                onBlur={() => setIsFocused(false)}
                style={{
                    width: 44,
                    height: 44,
                    borderRadius: 8,
                    border: isFocused ? '2px solid var(--border-accent, #3b82f6)' : '1px solid #e5e7eb',
                    background: '#ffffff',
                    fontSize: 28,
                    textAlign: 'center',
                    cursor: 'pointer',
                    outline: 'none',
                    padding: 0,
                    color: '#000000',
                    transition: 'border 0.2s, box-shadow 0.2s'
                }}
                // Add title to hint user
                title="Click to edit. Use system emoji picker (Fn or Ctrl+Cmd+Space)"
            />
        </div>
    );
};
