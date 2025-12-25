import { observer } from 'mobx-react-lite';
import { TextSettings } from './panels/TextSettings';
import { ImageSettings } from './panels/ImageSettings';
import { SvgSettings } from './panels/SvgSettings';
import { VideoSettings } from './panels/VideoSettings';
import { PageSettings } from './panels/PageSettings';
import { MultiSelectSettings } from './panels/MultiSelectSettings';
import { CtaSettings } from './panels/CtaSettings';
import { InteractiveSettings } from './panels/InteractiveSettings';
import './RightSidebar.css';

/**
 * Right Sidebar component that displays element-specific settings panels
 * based on the currently selected element(s) in the store.
 */
export const RightSidebar = observer(({ store }) => {
  const selectedElements = store.selectedElements;

  // Determine which panel to render based on selection
  const renderPanel = () => {
    // No selection → PageSettings
    if (selectedElements.length === 0) {
      return <PageSettings store={store} />;
    }

    // Multiple selection → MultiSelectSettings
    if (selectedElements.length > 1) {
      return <MultiSelectSettings store={store} />;
    }

    // Single selection → Route by element type
    const element = selectedElements[0];
    
    // Interactive elements get priority routing (by type or custom data)
    if (element.type === 'interactive' || element.custom?.kind === 'interactive' || element.custom?.isInteractive) {
      return <InteractiveSettings store={store} element={element} />;
    }
    
    // CTA elements get next priority routing (check if element has ctaType in custom data)
    if (element.custom?.ctaType) {
      return <CtaSettings store={store} element={element} />;
    }
    
    switch (element.type) {
      case 'text':
        return <TextSettings store={store} element={element} />;
      
      case 'image':
        return <ImageSettings store={store} element={element} />;
      
      case 'svg':
        return <SvgSettings store={store} element={element} />;
      
      case 'video':
        return <VideoSettings store={store} element={element} />;
      
      case 'line':
        // Line elements can use SVG settings for now
        return <SvgSettings store={store} element={element} />;
      
      case 'figure':
        // Figure elements can use SVG settings for now
        return <SvgSettings store={store} element={element} />;
      
      default:
        // Unknown type → show page settings as fallback
        return <PageSettings store={store} />;
    }
  };

  return (
    <div className="right-sidebar">
      <div className="right-sidebar-content">
        {renderPanel()}
      </div>
    </div>
  );
});
