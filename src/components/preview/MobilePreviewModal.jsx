import React, { useState, useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import StoryPreview from './StoryPreview';

/**
 * MobilePreviewModal
 * 
 * Full-screen modal that displays a mobile phone frame with story preview.
 * Matches the Orange Dashboard preview experience.
 */
export const MobilePreviewModal = observer(({ store, isOpen, onClose }) => {
  const [isClosing, setIsClosing] = useState(false);

  // Handle ESC key to close
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape' && isOpen) {
        handleClose();
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen]);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      onClose();
    }, 200);
  };

  if (!isOpen && !isClosing) return null;

  return (
    <div
      className={`fixed inset-0 z-[9999] bg-black/80 backdrop-blur-sm flex items-center justify-center py-4 transition-opacity duration-200 ${
        isClosing ? 'opacity-0' : 'opacity-100'
      }`}
      onClick={handleClose}
    >
      {/* Mobile Phone Frame Container - centered */}
      <div
        className={`relative transition-transform duration-200 ${
          isClosing ? 'scale-95' : 'scale-100'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Device Label - Now on top */}
        <div className="absolute -top-8 left-1/2 -translate-x-1/2 text-white/80 text-sm font-medium">
          Mobile Preview
        </div>

        {/* iPhone Frame - Narrower width */}
        <div className="relative bg-black rounded-[2.5rem] p-2.5 shadow-2xl">
          {/* Notch */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-5 bg-black rounded-b-3xl z-10"></div>
          
          {/* Screen - 9:16 aspect ratio (300x560) */}
          <div className="relative w-[300px] h-[560px] bg-white rounded-[2rem] overflow-hidden">
            {/* Status Bar */}
            <div className="absolute top-0 left-0 right-0 h-9 bg-gradient-to-b from-black/5 to-transparent z-20 flex items-center justify-between px-4 pt-1.5">
              <span className="text-[10px] font-semibold">9:41</span>
              <div className="flex items-center gap-1">
                <div className="w-3.5 h-2.5 border border-black/30 rounded-sm relative">
                  <div className="absolute inset-0.5 bg-black/80 rounded-[1px]"></div>
                </div>
              </div>
            </div>

            {/* Story Preview Content */}
            <div className="w-full h-full">
              <StoryPreview store={store} />
            </div>
          </div>

          {/* Home Indicator */}
          <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-28 h-1 bg-white/30 rounded-full"></div>
        </div>

        {/* Close Button - Now at bottom */}
        <button
          onClick={handleClose}
          className="absolute -bottom-16 left-1/2 -translate-x-1/2 text-white hover:text-gray-300 transition-colors flex items-center gap-3 px-12 py-3 rounded-lg bg-orange-500 hover:bg-orange-600 shadow-lg min-w-[200px] justify-center whitespace-nowrap"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
          <span className="text-sm font-medium">Close Preview</span>
        </button>
      </div>
    </div>
  );
});

MobilePreviewModal.displayName = 'MobilePreviewModal';
