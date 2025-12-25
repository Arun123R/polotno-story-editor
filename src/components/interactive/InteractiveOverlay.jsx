import React from 'react';
import { observer } from 'mobx-react-lite';
import { getRenderer } from './renderers';
import { isInteractiveElement, getInteractiveType, getInteractiveData, getInteractiveStyle } from './schemas';

/**
 * Interactive Overlay Component
 * 
 * This component renders a visual overlay on top of Polotno canvas elements
 * to show interactive previews that update in real-time.
 * 
 * It positions itself absolutely over the canvas based on element coordinates.
 */
export const InteractiveOverlay = observer(({ store, containerRef }) => {
  const page = store?.activePage;
  
  if (!page || !containerRef?.current) return null;
  
  // Get all interactive elements on the current page
  const interactiveElements = page.children.filter(isInteractiveElement);
  
  if (interactiveElements.length === 0) return null;
  
  // Get canvas dimensions and scale
  const containerRect = containerRef.current.getBoundingClientRect();
  const scale = store.scale || 1;
  
  // Calculate offset for centering
  const offsetX = (containerRect.width - store.width * scale) / 2;
  const offsetY = (containerRect.height - store.height * scale) / 2;

  return (
    <div 
      className="interactive-overlay"
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none', // Allow clicks to pass through to canvas
        overflow: 'hidden',
        zIndex: 10,
      }}
    >
      {interactiveElements.map((element) => {
        const type = getInteractiveType(element);
        const data = getInteractiveData(element);
        const style = getInteractiveStyle(element);
        const Renderer = getRenderer(type);
        
        if (!Renderer) return null;
        
        // Calculate screen position considering scale
        const screenX = offsetX + element.x * scale;
        const screenY = offsetY + element.y * scale;
        const screenWidth = element.width * scale;
        const screenHeight = element.height * scale;
        
        return (
          <div
            key={element.id}
            className="interactive-element-wrapper"
            style={{
              position: 'absolute',
              left: screenX,
              top: screenY,
              width: screenWidth,
              height: screenHeight,
              transform: `rotate(${element.rotation || 0}deg)`,
              transformOrigin: 'top left',
              opacity: element.opacity ?? 1,
              pointerEvents: 'auto', // Enable interactions
            }}
          >
            <div
              style={{
                width: element.width,
                height: element.height,
                transform: `scale(${scale})`,
                transformOrigin: 'top left',
              }}
            >
              <Renderer 
                data={data} 
                style={style} 
                width={element.width}
                height={element.height}
                element={element}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
});

export default InteractiveOverlay;
