import { SidePanel, SectionTab } from 'polotno/side-panel';
// Import default Polotno sections
import {
  ElementsSection,
  UploadSection,
  BackgroundSection,
  // SizeSection,
} from 'polotno/side-panel';

import { TemplatesSection } from '../components/side-panel/sections/TemplatesSection';
import { TextSection } from '../components/side-panel/sections/TextSection';

// Import custom sections
// Import custom sections
import { CtaSection } from '../components/side-panel/sections/CtaSection';
import { InteractiveSection } from '../components/side-panel/sections/InteractiveSectionEntry';
import { UploadSection as CustomUploadSection } from '../components/side-panel/sections/UploadSection'; // Import the new section

// ... existing code ...

// Custom Icons matching the design exactly
const TemplatesIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="7" rx="1" />
    <rect x="3" y="14" width="8" height="6" rx="1" />
    <rect x="13" y="14" width="8" height="6" rx="1" />
  </svg>
);

const TextIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 5h14" />
    <path d="M12 5v14" />
    <path d="M9 19h6" />
    <path d="M5 5v3" />
    <path d="M19 5v3" />
  </svg>
);

const ClickIcon = () => (
  <svg className="custom-click-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    {/* Sparks */}
    <path d="M11 6L11 4" />       {/* Top */}
    <path d="M8 8L6 6" />         {/* Diagonal */}
    <path d="M6 11L4 11" />       {/* Left */}

    {/* Cursor Head (Concave Base - Notched Arrowhead) */}
    <path d="M11 11 L19 14 L15 15 L14 19 Z" />
  </svg>
);

const LightningIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
  </svg>
);

const UploadIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="17 8 12 3 7 8" />
    <line x1="12" y1="3" x2="12" y2="15" />
  </svg>
);

const ElementsIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {/* Heart (top-left) */}
    <path d="M4.5 7.5 
      C4.5 6 6 5 7.8 6.5 
      C9.6 5 11.2 6 11.2 7.5 
      C11.2 9.7 7.8 12 7.8 12 
      C7.8 12 4.5 9.7 4.5 7.5 Z" />

    {/* Triangle (top-right) */}
    <polygon points="13.8 11.2 20.5 11.2 17.2 4.8" />

    {/* Square (bottom-left) */}
    <rect x="5.2" y="15.8" width="5.8" height="5.8" rx="1" />

    {/* Circle (bottom-right) */}
    <circle cx="17.5" cy="18.5" r="3" />
  </svg>
);


const GridIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
    <line x1="9" y1="3" x2="9" y2="21" />
    <line x1="15" y1="3" x2="15" y2="21" />
    <line x1="3" y1="9" x2="21" y2="9" />
    <line x1="3" y1="15" x2="21" y2="15" />
  </svg>
);

// Override Sections with Custom Icons
const CustomTemplatesSection = {
  ...TemplatesSection,
  Tab: (props) => (
    <SectionTab name="Templates" {...props} data-tooltip="Templates">
      <TemplatesIcon />
    </SectionTab>
  )
};

const CustomTextSection = {
  ...TextSection,
  Tab: (props) => (
    <SectionTab name="Text" {...props} data-tooltip="Text">
      <TextIcon />
    </SectionTab>
  ),
};

const CustomCtaSection = {
  ...CtaSection,
  Tab: (props) => (
    <SectionTab name="Click" {...props} data-tooltip="Click">
      <ClickIcon />
    </SectionTab>
  ),
};


const CustomInteractiveSection = {
  ...InteractiveSection,
  Tab: (props) => (
    <SectionTab name="Interactive" {...props} data-tooltip="Interactive">
      <LightningIcon />
    </SectionTab>
  ),
};



const CustomElementsSection = {
  ...ElementsSection,
  Tab: (props) => (
    <SectionTab name="Elements" {...props} data-tooltip="Elements">
      <ElementsIcon />
    </SectionTab>
  ),
};

const CustomBackgroundSection = {
  ...BackgroundSection,
  Tab: (props) => (
    <SectionTab name="Background" {...props} data-tooltip="Background">
      <GridIcon />
    </SectionTab>
  ),
};


// Define sections array
const sections = [
  CustomTemplatesSection,
  CustomTextSection,
  CustomCtaSection,  // Assuming this is the 'Click' cursor icon section
  CustomInteractiveSection,
  CustomUploadSection,
  CustomElementsSection,
  CustomBackgroundSection,
];

export const EditorSidePanel = ({ store }) => {
  return (
    <div className="h-screen" style={{ backgroundColor: 'var(--bg-secondary)' }}>
      <SidePanel
        store={store}
        sections={sections}
        defaultSection="templates"
      />
    </div>
  );
};


