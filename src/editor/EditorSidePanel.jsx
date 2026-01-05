import { SidePanel } from 'polotno/side-panel';
// Import default Polotno sections
import {
  TextSection,
  TemplatesSection,
  ElementsSection,
  UploadSection,
  BackgroundSection,
  SizeSection,
} from 'polotno/side-panel';

// Import custom sections
import { CtaSection } from '../components/side-panel/sections/CtaSection';
import { InteractiveSection } from '../components/side-panel/sections/InteractiveSectionEntry';
// import { AppsSection } from '../components/side-panel/sections/AppsSection';

// Define sections array - explicitly listing only the sections we want (no videos)
const sections = [
  TemplatesSection,      // Templates
  TextSection,           // Text
  CtaSection,            // CTA buttons (custom)
  InteractiveSection,    // Interactive widgets (custom)
  UploadSection,         // Upload
  ElementsSection,       // Elements (shapes, lines, etc.)
  BackgroundSection,     // Background
  SizeSection,           // Resize
  // AppsSection,           // App integrations (custom)
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


