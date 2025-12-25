import { Toolbar } from 'polotno/toolbar/toolbar';

// Null component to disable toolbar controls
const None = () => null;

// Component overrides - disable EVERYTHING except History (Undo/Redo)
const toolbarComponents = {
  // Text components - ALL disabled (including animations)
  TextFontFamily: None,
  TextFontSize: None,
  TextFontVariant: None,
  TextFilters: None,
  TextTransform: None,
  TextFill: None,
  TextSpacing: None,
  TextAnimations: None,  // Disabled - moved to right sidebar
  TextAiWrite: None,

  // Image components - ALL disabled (including animations)
  ImageFlip: None,
  ImageFilters: None,
  ImageFitToBackground: None,
  ImageCrop: None,
  ImageClip: None,
  ImageRemoveBackground: None,
  ImageAnimations: None,  // Disabled - moved to right sidebar

  // SVG components - ALL disabled (including animations)
  SvgFlip: None,
  SvgFilters: None,
  SvgColors: None,
  SvgAnimations: None,  // Disabled - moved to right sidebar

  // Line components - ALL disabled (including animations)
  LineSettings: None,
  LineColor: None,
  LineHeads: None,
  LineAnimations: None,  // Disabled - moved to right sidebar

  // Figure components - ALL disabled (including animations)
  FigureFill: None,
  FigureStroke: None,
  FigureSettings: None,
  FigureFilters: None,
  FigureAnimations: None,  // Disabled - moved to right sidebar

  // Video components - ALL disabled (including animations)
  VideoTrim: None,
  VideoAnimations: None,  // Disabled - moved to right sidebar

  // Multi-select - ALL disabled (including animations)
  ManyAnimations: None,  // Disabled - moved to right sidebar

  // Page components - disabled
  PageDuration: None,
  PageBackground: None,

  // Common controls - disabled (except History which is not overridden)
  Group: None,
  Position: None,
  Opacity: None,
  CopyStyle: None,
  Lock: None,
  Duplicate: None,
  Remove: None,

  // History (Undo/Redo) - NOT overridden, keeps default behavior
};

export const EditorToolbar = ({ store }) => {
  return (
    <div style={{ backgroundColor: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-primary)' }}>
      <Toolbar store={store} components={toolbarComponents} />
    </div>
  );
};
