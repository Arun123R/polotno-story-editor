import React from 'react';
import { observer } from 'mobx-react-lite';
import { TextSection as PolotnoTextSection } from 'polotno/side-panel';
import './TextSection.css';

/**
 * Custom Text Section that wraps Polotno's default TextSection
 * with custom CSS styling to match the right sidebar design system.
 * 
 * Visual changes:
 * - Flat rectangular tabs (like Content | Style | Animate)
 * - Orange text for active tab
 * - Subtle border for active tab
 * - No pill shapes, no underlines, no animations
 * 
 * IMPORTANT: This is a UI-only refactor. All Polotno functionality is preserved.
 */

// Get the original Panel component from Polotno
const OriginalPanel = PolotnoTextSection.Panel;

const CustomTextPanel = observer(({ store }) => {
  return (
    <div className="custom-text-section">
      {/* Wrap Polotno's original Panel with our custom CSS container */}
      <OriginalPanel store={store} />
    </div>
  );
});

// Export the section with custom Panel wrapper
export const TextSection = {
  ...PolotnoTextSection,
  Panel: ({ store }) => <CustomTextPanel store={store} />,
};
