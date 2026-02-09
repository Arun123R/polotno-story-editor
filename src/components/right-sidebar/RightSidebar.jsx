import { observer } from 'mobx-react-lite';
import { TextSettings } from './panels/TextSettings';
import { ImageSettings } from './panels/ImageSettings';
import { SvgSettings } from './panels/SvgSettings';
import { VideoSettings } from './panels/VideoSettings';
import { PageSettings } from './panels/PageSettings';
import { MultiSelectSettings } from './panels/MultiSelectSettings';
import { CtaSettings } from './panels/CtaSettings';
import { InteractiveSettings } from './panels/InteractiveSettings';
import { isAddSlidePage } from '../../store/polotnoStore';
import './RightSidebar.css';

/**
 * Right Sidebar component that displays element-specific settings panels
 * based on the currently selected element(s) in the store.
 * 
 * When multiple elements of the SAME type are selected, it shows the
 * type-specific panel that applies changes to all selected elements.
 * When multiple elements of DIFFERENT types are selected, it shows
 * the MultiSelectSettings panel with common properties.
 */
export const RightSidebar = observer(({ store }) => {
  const selectedElements = store.selectedElements;
  const activePage = store.activePage;

  // Don't show sidebar on the "Add Slide" page
  if (activePage && isAddSlidePage(activePage)) {
    return null;
  }

  // Helper function to check if all selected elements are of the same type
  const getAllSameType = (elements) => {
    if (elements.length === 0) return null;
    const firstType = elements[0].type;
    const allSame = elements.every(el => el.type === firstType);
    return allSame ? firstType : null;
  };

  // Determine which panel to render based on selection
  const renderPanel = () => {
    // No selection → PageSettings
    if (selectedElements.length === 0) {
      return <PageSettings store={store} />;
    }

    // Single selection → Route by element type
    if (selectedElements.length === 1) {
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
          return <SvgSettings store={store} element={element} />;

        case 'figure':
          return <SvgSettings store={store} element={element} />;

        default:
          return <PageSettings store={store} />;
      }
    }

    // Multiple selection → Check if all elements are the same type
    const sameType = getAllSameType(selectedElements);

    if (sameType) {
      // All selected elements are the same type - show type-specific panel
      // Pass all elements so changes apply to all
      const elements = selectedElements;

      switch (sameType) {
        case 'text':
          return <TextSettings store={store} element={elements[0]} elements={elements} isMultiSelect={true} />;

        case 'image':
          return <ImageSettings store={store} element={elements[0]} elements={elements} isMultiSelect={true} />;

        case 'svg':
          return <SvgSettings store={store} element={elements[0]} elements={elements} isMultiSelect={true} />;

        case 'video':
          return <VideoSettings store={store} element={elements[0]} elements={elements} isMultiSelect={true} />;

        case 'line':
        case 'figure':
          return <SvgSettings store={store} element={elements[0]} elements={elements} isMultiSelect={true} />;

        default:
          return <MultiSelectSettings store={store} />;
      }
    }

    // Different types selected → show MultiSelectSettings
    return <MultiSelectSettings store={store} />;
  };

  return (
    <div className="right-sidebar">
      <div className="right-sidebar-content">
        {renderPanel()}
      </div>
    </div>
  );
});
