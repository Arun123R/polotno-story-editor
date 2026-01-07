import { SidePanel, SectionTab } from 'polotno/side-panel';
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
import { InteractiveSection } from '../components/side-panel/sections/InteractiveSection';
// import { AppsSection } from '../components/side-panel/sections/AppsSection';

// Custom Text Icon (Box with 'T' and '+')
const TextIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ fill: 'none', stroke: 'currentColor' }}>
    <path d="M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M8 10h8" />
    <path d="M12 10v7" />
    <path d="M19 3v6" />
    <path d="M16 6h6" />
  </svg>
);

// Override TextSection to use custom icon
const CustomTextSection = {
  ...TextSection,
  Tab: (props) => (
    <SectionTab name="Text" {...props}>
      <TextIcon />
    </SectionTab>
  ),
};

// Define sections array - explicitly listing only the sections we want (no videos)
const sections = [
  TemplatesSection,      // Templates
  CustomTextSection,     // Text (Custom Icon)
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
    <div className="h-screen" style={{ backgroundColor: "#ffffff" }}>
      <SidePanel
        store={store}
        sections={sections}
        defaultSection="templates"
      />
    </div>
  );
};


