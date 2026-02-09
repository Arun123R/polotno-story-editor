# Mobile Story Preview System

## Overview

The Mobile Story Preview system provides a true mobile preview experience directly within the Studio editor, matching the preview functionality available in the Orange Dashboard.

## Components

### 1. MobilePreviewModal
- **Location**: `src/components/preview/MobilePreviewModal.jsx`
- **Purpose**: Full-screen modal with realistic iPhone frame
- **Features**:
  - Realistic mobile device frame (iPhone style)
  - Status bar and home indicator
  - Backdrop blur effect
  - ESC key and click-outside to close
  - Smooth animations

### 2. StoryPreview
- **Location**: `src/components/preview/StoryPreview.jsx`
- **Purpose**: Renders story slides with animations and interactions
- **Features**:
  - Converts Polotno pages to slides automatically
  - Progress bars (Instagram-style)
  - Auto-advance with configurable duration
  - Slide navigation (prev/next buttons)
  - CTA rendering with full styling support
  - Video playback support
  - Smooth slide transitions (Framer Motion)

### 3. PreviewButton
- **Location**: `src/editor/EditorToolbar.jsx`
- **Purpose**: Toolbar button to open preview
- **Features**:
  - Eye icon for easy recognition
  - Lazy loads modal for performance
  - Minimal design matching toolbar style

## How It Works

### Data Flow

1. **Polotno Store → Slides Conversion**
   ```javascript
   // StoryPreview converts Polotno pages to slide format
   const slides = store.pages.map((page) => ({
     id: page.id,
     image: page.background || firstImageElement.src,
     cta_enabled: page.custom?.cta?.enabled,
     cta_text: page.custom?.cta?.text,
     // ... other CTA properties
   }));
   ```

2. **Slide Rendering**
   - Each slide is rendered with Framer Motion animations
   - Progress bars track slide duration
   - CTAs are rendered with exact styling from page data

3. **Auto-Advance**
   - Uses `setTimeout` for reliable timing
   - Default duration: 5 seconds per slide
   - Loops back to first slide after last

### CTA Data Structure

CTAs are stored in `page.custom.cta`:

```javascript
{
  enabled: boolean,
  text: string,
  backgroundColor: string,
  textColor: string,
  fontSize: number,
  fontFamily: string,
  height: number,
  textAlignment: 'left' | 'center' | 'right',
  alignment: 'left' | 'center' | 'right',
  fullWidth: boolean,
  marginRight: number,
  marginBottom: number,
  marginLeft: number,
  cornerRadius: {
    topLeft: number,
    topRight: number,
    bottomLeft: number,
    bottomRight: number
  },
  borderWidth: number,
  borderColor: string
}
```

## Usage

### Opening Preview

Click the "Preview" button in the toolbar (eye icon) to open the mobile preview modal.

### Keyboard Shortcuts

- **ESC**: Close preview modal
- **Left Arrow**: Previous slide (when modal is open)
- **Right Arrow**: Next slide (when modal is open)

### Customization

#### Change Slide Duration

Edit `SLIDE_DURATION` in `StoryPreview.jsx`:

```javascript
const SLIDE_DURATION = 5000; // milliseconds
```

#### Change Device Frame

Modify the frame dimensions in `MobilePreviewModal.jsx`:

```javascript
<div className="w-[375px] h-[812px]"> // iPhone X/11/12 dimensions
```

#### Add Custom Buttons

Add buttons to the preview by modifying the `StoryPreview` component:

```javascript
{/* Add custom buttons here */}
<button className="absolute top-4 right-4 z-30">
  Custom Button
</button>
```

## Dependencies

- **framer-motion**: Slide animations and transitions
- **lucide-react**: Icons (ChevronLeft, ChevronRight)
- **mobx-react-lite**: Reactive state management

## Performance Considerations

1. **Lazy Loading**: Modal is only loaded when opened
2. **Suspense Boundary**: Prevents blocking main thread
3. **Cleanup**: Timers and event listeners are properly cleaned up
4. **Memoization**: Slide data is memoized to prevent unnecessary re-renders

## Future Enhancements

- [ ] Add sound toggle button
- [ ] Add share button
- [ ] Add close button (X)
- [ ] Support for interactive elements (polls, quizzes)
- [ ] Gesture support (swipe to navigate)
- [ ] Fullscreen mode
- [ ] Device frame selection (iPhone, Android, etc.)
- [ ] Orientation toggle (portrait/landscape)

## Troubleshooting

### Preview doesn't open
- Check browser console for errors
- Ensure framer-motion and lucide-react are installed
- Verify MobilePreviewModal.jsx exists

### Slides don't auto-advance
- Check that slides.length > 1
- Verify SLIDE_DURATION is set correctly
- Check browser console for timer errors

### CTAs don't appear
- Verify page.custom.cta.enabled is true
- Check that CTA data is properly structured
- Inspect element to see if CTA is rendered but hidden

### Images don't load
- Check that page.background or image elements have valid URLs
- Verify CORS settings for external images
- Check browser network tab for failed requests
