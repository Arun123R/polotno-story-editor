import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { observer } from 'mobx-react-lite';
import {  AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';

// Helper to normalize boolean values
const normalizeBoolean = (val) => val === true || val === 'true' || val === 1;

const RenderPreview = ({ url, slide }) => {
  const isVideo = useMemo(() => {
    if (!url) return false;
    
    const fileObj = slide?.preview?.file || slide?.image?.file || slide?.file?.file || 
                    slide?.preview || slide?.image || slide?.file;
                    
    if (fileObj instanceof File) {
       return fileObj.type?.startsWith('video/');
    }

    if (typeof url === 'string') {
       const lower = url.toLowerCase().split('?')[0];
       return lower.endsWith('.mp4') || lower.endsWith('.webm') || lower.endsWith('.mov') || 
              lower.endsWith('.avi') || lower.endsWith('.mkv');
    }
    return false;
  }, [url, slide]);

  if (isVideo) {
    return (
      <video
        src={url}
        className="w-full h-full object-cover"
        autoPlay
        loop
        muted
        playsInline
      />
    );
  }

  return (
    <img
      src={url}
      alt="Slide content"
      className="w-full h-full object-cover"
    />
  );
};

// Progress bar component
const ProgressBar = ({ isActive, isPassed, duration, onClick }) => {
  return (
    <div 
      className="flex-1 h-1 bg-white/30 rounded-full overflow-hidden cursor-pointer hover:bg-white/40 transition-colors mx-0.5"
      onClick={(e) => { e.stopPropagation(); onClick && onClick(); }}
    >
      <motion.div
        className="h-full bg-white"
        initial={{ width: isPassed ? "100%" : "0%" }}
        animate={{ width: isPassed || isActive ? "100%" : "0%" }}
        transition={{
          duration: isActive ? duration / 1000 : 0,
          ease: "linear"
        }}
      />
    </div>
  );
};

// Timer display
const DataTimer = ({ duration }) => {
  const [timeLeft, setTimeLeft] = useState(Math.ceil(duration / 1000));
  
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTimeLeft(Math.ceil(duration / 1000));
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [duration]);

  return (
    <div className="absolute top-12 right-3 z-30 bg-black/50 text-white px-2 py-1 rounded text-xs font-mono backdrop-blur-sm">
      {timeLeft}s
    </div>
  );
};

const slideVariants = {
  enter: (direction) => ({
    x: direction > 0 ? '100%' : '-100%',
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction) => ({
    x: direction < 0 ? '100%' : '-100%',
    opacity: 0,
  })
};

/**
 * StoryPreview Component
 * 
 * Renders a story preview from Polotno store pages.
 * Converts Polotno pages to slides and displays them with animations, CTAs, and controls.
 */
const StoryPreview = observer(({ store }) => {
  // Convert Polotno pages to slides
  const slides = useMemo(() => {
    if (!store || !store.pages) return [];
    
    return store.pages.map((page, index) => {
      // Get the background image or first image element
      let imageUrl = null;
      
      if (page.background && page.background.startsWith('http')) {
        imageUrl = page.background;
      } else {
        // Find first image element
        const imageElement = page.children.find(el => el.type === 'image');
        if (imageElement && imageElement.src) {
          imageUrl = imageElement.src;
        }
      }

      // Extract CTA data from page custom data
      const ctaData = page.custom?.cta || {};
      
      return {
        id: page.id,
        name: `Slide ${index + 1}`,
        image: imageUrl,
        preview: imageUrl,
        cta_enabled: ctaData.enabled || false,
        cta_text: ctaData.text || '',
        cta_background: ctaData.backgroundColor || '#F97316',
        cta_text_color: ctaData.textColor || '#FFFFFF',
        cta_font_size: ctaData.fontSize || 14,
        cta_text_style: ctaData.fontFamily || 'Inter',
        cta_height: ctaData.height || 48,
        cta_text_alignment: ctaData.textAlignment || 'center',
        cta_alignment: ctaData.alignment || 'center',
        cta_full_width: ctaData.fullWidth || false,
        cta_margin_right: ctaData.marginRight || 16,
        cta_margin_bottom: ctaData.marginBottom || 16,
        cta_margin_left: ctaData.marginLeft || 16,
        cta_corner_radius: ctaData.cornerRadius || {
          topLeft: 8,
          topRight: 8,
          bottomLeft: 8,
          bottomRight: 8
        },
        cta_border_stroke: ctaData.borderWidth || 0,
        cta_border_color: ctaData.borderColor || 'transparent',
      };
    });
  }, [store]);

  const [[page, direction], setPage] = useState([0, 0]);
  const currentSlideIndex = page;

  // Default slide duration: 5 seconds
  const SLIDE_DURATION = 5000;

  const currentSlide = slides[currentSlideIndex];

  const handleNextSlide = useCallback(() => {
    setPage(([curr]) => {
      const next = curr + 1 >= slides.length ? 0 : curr + 1;
      return [next, 1];
    });
  }, [slides.length]);

  const handlePrevSlide = useCallback(() => {
    setPage(([curr]) => {
      const next = curr - 1 < 0 ? slides.length - 1 : curr - 1;
      return [next, -1];
    });
  }, [slides.length]);

  const handleSlideClick = useCallback((index) => {
    setPage(([curr]) => [index, index > curr ? 1 : -1]);
  }, []);

  // Auto-advance slides
  useEffect(() => {
    if (!slides || slides.length < 2) return;

    const timer = setTimeout(() => {
      handleNextSlide();
    }, SLIDE_DURATION);

    return () => clearTimeout(timer);
  }, [handleNextSlide, SLIDE_DURATION, slides.length, currentSlideIndex, slides]);

  // Reset if slides change
  useEffect(() => {
    if (slides?.length && currentSlideIndex >= slides.length) {
      setPage([0, 0]);
    }
  }, [slides?.length, currentSlideIndex]);

  if (!slides || slides.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-900">
        <div className="text-center">
          <p className="text-white text-sm mb-2">No slides to preview</p>
          <p className="text-white/60 text-xs">Add pages to your story</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-gray-900 relative">
      {/* Progress Bars */}
      <div className="absolute top-3 left-3 right-3 z-30 flex gap-1">
        {slides.map((_, index) => (
          <ProgressBar
            key={index === currentSlideIndex ? `${index}-active` : index}
            isActive={index === currentSlideIndex}
            isPassed={index < currentSlideIndex}
            duration={SLIDE_DURATION}
            onClick={() => handleSlideClick(index)}
          />
        ))}
      </div>

      {/* Timer */}
      {slides.length > 1 && (
        <DataTimer 
          duration={SLIDE_DURATION} 
          key={`${currentSlideIndex}-${SLIDE_DURATION}`}
        />
      )}

      {/* Navigation Buttons */}
      {slides.length > 1 && (
        <>
          <button
            onClick={handlePrevSlide}
            className="absolute left-2 top-1/2 -translate-y-1/2 z-30 p-2 rounded-full bg-black/30 hover:bg-black/50 transition-colors backdrop-blur-sm"
          >
            <ChevronLeft size={20} className="text-white" />
          </button>
          <button
            onClick={handleNextSlide}
            className="absolute right-2 top-1/2 -translate-y-1/2 z-30 p-2 rounded-full bg-black/30 hover:bg-black/50 transition-colors backdrop-blur-sm"
          >
            <ChevronRight size={20} className="text-white" />
          </button>
        </>
      )}

      {/* Slide Content */}
      <AnimatePresence initial={false} custom={direction}>
        <motion.div
          key={currentSlideIndex}
          custom={direction}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{
            x: { type: "spring", stiffness: 300, damping: 30 },
            opacity: { duration: 0.2 }
          }}
          className="absolute inset-0 w-full h-full"
        >
          {currentSlide?.image ? (
            <RenderPreview url={currentSlide.image} slide={currentSlide} />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-800">
              <span className="text-gray-400 text-sm">No Image</span>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* CTA Rendering */}
      {(() => {
        const isCtaEnabled = normalizeBoolean(currentSlide?.cta_enabled);
        if (!isCtaEnabled) return null;

        const ctaText = currentSlide?.cta_text || "";
        const ctaBg = currentSlide?.cta_background || '#F97316';
        const ctaColor = currentSlide?.cta_text_color || '#FFFFFF';
        const ctaFontSize = currentSlide?.cta_font_size || 14;
        const ctaFamily = currentSlide?.cta_text_style || 'Inter';
        const ctaHeight = currentSlide?.cta_height || 48;
        const ctaAlign = currentSlide?.cta_text_alignment || 'center';
        const ctaBorderStroke = currentSlide?.cta_border_stroke || 0;
        const ctaBorderColor = currentSlide?.cta_border_color || 'transparent';
        const containerAlign = currentSlide?.cta_alignment || 'center';
        const fullWidth = currentSlide?.cta_full_width || false;
        
        const marginRight = currentSlide?.cta_margin_right || 16;
        const marginBottom = currentSlide?.cta_margin_bottom || 16;
        const marginLeft = currentSlide?.cta_margin_left || 16;

        const toNumber = (val, fallback) => {
          const n = Number(val);
          return Number.isFinite(n) ? n : fallback;
        };

        let resolvedCorner = currentSlide?.cta_corner_radius || {};
        if (typeof resolvedCorner === 'string') {
          try {
            resolvedCorner = JSON.parse(resolvedCorner);
          } catch {
            resolvedCorner = {};
          }
        }

        const cornerTopLeft = toNumber(resolvedCorner?.topLeft, 8);
        const cornerTopRight = toNumber(resolvedCorner?.topRight, 8);
        const cornerBottomLeft = toNumber(resolvedCorner?.bottomLeft, 8);
        const cornerBottomRight = toNumber(resolvedCorner?.bottomRight, 8);

        return (
          <div
            className="absolute bottom-0 left-0 right-0 z-100 flex transition-all duration-200"
            style={{
              padding: `0 ${marginRight}px ${marginBottom}px ${marginLeft}px`,
              justifyContent: containerAlign === 'left' ? 'flex-start' : 
                             containerAlign === 'right' ? 'flex-end' : 'center'
            }}
          >
            <div
              style={{
                width: fullWidth ? '100%' : 'auto',
                backgroundColor: ctaBg,
                color: ctaColor,
                fontSize: `${ctaFontSize}px`,
                fontFamily: ctaFamily,
                height: `${ctaHeight}px`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: ctaAlign === 'left' ? 'flex-start' : 
                               ctaAlign === 'right' ? 'flex-end' : 'center',
                borderWidth: `${ctaBorderStroke}px`,
                borderStyle: 'solid',
                borderColor: ctaBorderColor,
                borderTopLeftRadius: `${cornerTopLeft}px`,
                borderTopRightRadius: `${cornerTopRight}px`,
                borderBottomLeftRadius: `${cornerBottomLeft}px`,
                borderBottomRightRadius: `${cornerBottomRight}px`,
                padding: '0 20px',
                cursor: 'default',
                boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                fontWeight: 500,
              }}
            >
              <span className="truncate">{ctaText || 'CTA'}</span>
            </div>
          </div>
        );
      })()}

      {/* Slide Counter */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-30 bg-black/50 text-white px-3 py-1 rounded-full text-xs backdrop-blur-sm">
        {currentSlideIndex + 1} / {slides.length}
      </div>
    </div>
  );
});

StoryPreview.displayName = 'StoryPreview';

export default StoryPreview;
