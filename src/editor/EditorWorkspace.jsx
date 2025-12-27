import React, { useRef } from 'react';
import { Workspace } from "polotno/canvas/workspace";
import { ZoomButtons } from "polotno/toolbar/zoom-buttons";
import { InteractiveOverlay } from "../components/interactive/InteractiveOverlay";

export const EditorWorkspace = ({ store }) => {
  const containerRef = useRef(null);
  
  return (
    <div 
      ref={containerRef}
      style={{ width: '100%', height: '100%', position: 'relative' }}
    >
      <Workspace 
        store={store} 
        backgroundColor="var(--bg-primary)"
        activePageBorderColor="#F97316"
        layout="horizontal" 
      />
      
      {/* Interactive Preview Overlay - positioned on top of canvas */}
      {/* Note: This is disabled for now as Polotno handles its own rendering.
          The interactive elements use text type with custom metadata,
          and the visual preview is approximated through the background property.
          For full live previews, consider implementing a custom Polotno extension
          or using the preview mode. */}
      {/* <InteractiveOverlay store={store} containerRef={containerRef} /> */}
      
      <ZoomButtons store={store} />
    </div>
  );
};
