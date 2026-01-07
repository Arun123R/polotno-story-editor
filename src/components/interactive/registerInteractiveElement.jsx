/**
 * Interactive Element Custom Type Registration for Polotno
 * 
 * This module registers a custom 'interactive' element type with Polotno
 * that supports proper height control and custom rendering.
 */

import React from 'react';
import { unstable_registerShapeComponent } from 'polotno/config';
import { getInteractiveType, getInteractiveData, getInteractiveStyle, getInteractiveTypeIcon, getInteractiveTypeLabel } from './schemas';

// Live Countdown component for canvas preview
const CountdownPreview = ({ data, style, width, height }) => {
  const [timeLeft, setTimeLeft] = React.useState({ days: 0, hours: 12, minutes: 34, seconds: 56 });

  React.useEffect(() => {
    const endDate = data?.endDate;
    const endTime = data?.endTime || '23:59';
    
    const calculateTimeLeft = () => {
      if (!endDate) {
        return { days: 0, hours: 12, minutes: 34, seconds: 56 };
      }
      const endDateTime = new Date(`${endDate}T${endTime}:00`);
      const now = new Date();
      const diff = endDateTime - now;
      if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
      return {
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / (1000 * 60)) % 60),
        seconds: Math.floor((diff / 1000) % 60),
      };
    };

    setTimeLeft(calculateTimeLeft());
    const timer = setInterval(() => setTimeLeft(calculateTimeLeft()), 1000);
    return () => clearInterval(timer);
  }, [data?.endDate, data?.endTime]);

  const formatNum = (n) => String(n).padStart(2, '0');

  return (
    <div style={{
      width: '100%',
      height: '100%',
      background: style?.containerBgColor || 'rgba(0,0,0,0.7)',
      borderRadius: style?.containerBorderRadius || 12,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 12,
      padding: 16,
      boxSizing: 'border-box',
    }}>
      <div style={{
        color: style?.titleColor || '#fff',
        fontSize: style?.titleFontSize || 14,
        fontWeight: 600,
        textTransform: 'uppercase',
        letterSpacing: 2,
      }}>
        {data?.title || 'Ends In'}
      </div>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        {[
          { val: timeLeft.days, label: 'Days' },
          { val: timeLeft.hours, label: 'Hrs' },
          { val: timeLeft.minutes, label: 'Min' },
          { val: timeLeft.seconds, label: 'Sec' },
        ].map((item, i) => (
          <React.Fragment key={item.label}>
            {i > 0 && <span style={{ color: style?.separatorColor || '#fff', fontSize: 24, opacity: 0.5 }}>:</span>}
            <div style={{
              background: style?.digitBgColor || 'rgba(255,255,255,0.15)',
              borderRadius: 8,
              padding: '8px 12px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 2,
            }}>
              <span style={{
                color: style?.digitColor || '#fff',
                fontSize: style?.digitFontSize || 28,
                fontWeight: 700,
                fontFamily: 'monospace',
                lineHeight: 1,
              }}>
                {formatNum(item.val)}
              </span>
              <span style={{
                color: style?.labelColor || 'rgba(255,255,255,0.7)',
                fontSize: 9,
                textTransform: 'uppercase',
              }}>
                {item.label}
              </span>
            </div>
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

// Poll Preview Component
const PollPreview = ({ data, style, width, height }) => {
  const options = data?.options || [{ text: 'Option A' }, { text: 'Option B' }];
  
  return (
    <div style={{
      width: '100%',
      height: '100%',
      background: style?.containerBgColor || 'rgba(0,0,0,0.6)',
      borderRadius: style?.containerBorderRadius || 12,
      padding: style?.containerPadding || 16,
      boxSizing: 'border-box',
      display: 'flex',
      flexDirection: 'column',
      gap: 10,
    }}>
      <div style={{
        color: style?.questionColor || '#fff',
        fontSize: style?.questionFontSize || 16,
        fontWeight: 600,
        textAlign: 'center',
      }}>
        {data?.question || 'What do you prefer?'}
      </div>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
        {options.map((opt, i) => (
          <div key={i} style={{
            background: style?.optionBgColor || 'rgba(255,255,255,0.2)',
            borderRadius: style?.optionBorderRadius || 8,
            padding: '10px 14px',
            color: style?.optionTextColor || '#fff',
            fontSize: style?.optionFontSize || 14,
            fontWeight: 500,
            textAlign: 'center',
          }}>
            {opt.text}
          </div>
        ))}
      </div>
    </div>
  );
};

// Quiz Preview Component
const QuizPreview = ({ data, style }) => {
  const options = data?.options || [{ id: '1', text: 'A' }, { id: '2', text: 'B' }];
  
  return (
    <div style={{
      width: '100%',
      height: '100%',
      background: style?.containerBgColor || 'rgba(0,0,0,0.6)',
      borderRadius: style?.containerBorderRadius || 12,
      padding: style?.containerPadding || 16,
      boxSizing: 'border-box',
      display: 'flex',
      flexDirection: 'column',
      gap: 10,
    }}>
      <div style={{
        color: style?.questionColor || '#fff',
        fontSize: style?.questionFontSize || 16,
        fontWeight: 600,
        textAlign: 'center',
      }}>
        {data?.question || 'What is the answer?'}
      </div>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
        {options.map((opt, i) => (
          <div key={i} style={{
            background: opt.id === data?.correctAnswerId 
              ? style?.correctColor || '#10b981' 
              : style?.optionBgColor || 'rgba(255,255,255,0.2)',
            borderRadius: style?.optionBorderRadius || 8,
            padding: '10px 14px',
            color: style?.optionTextColor || '#fff',
            fontSize: style?.optionFontSize || 14,
            fontWeight: 500,
            textAlign: 'center',
          }}>
            {opt.text} {opt.id === data?.correctAnswerId && '✓'}
          </div>
        ))}
      </div>
    </div>
  );
};

// Rating Preview Component
const RatingPreview = ({ data, style, width, height }) => {
  const maxRating = data?.maxRating || 5;
  const currentRating = data?.currentRating || 0;
  const emoji = data?.emoji || '😺';
  const title = data?.title || 'Do you like my eyes?';
  const type = data?.type || 'slider';
  
  if (type === 'slider') {
    const padding = style?.containerPadding || 8;
    const cardW = width - padding * 2;
    const cardH = height - padding * 2;
    const sliderW = cardW - 24;
    const fillPercent = Math.min(1, currentRating / maxRating);
    const fillW = sliderW * fillPercent;
    const borderRadius = style?.containerBorderRadius || 12;
    const titleColor = style?.titleColor || '#000';
    const titleFontSize = style?.titleFontSize || 12;
    const emojiSize = style?.emojiSize || 18;
    
    return (
      <div style={{
        width: '100%',
        height: '100%',
        padding: `${padding}px`,
        boxSizing: 'border-box',
      }}>
        <div style={{
          width: '100%',
          height: '100%',
          background: '#ffffff',
          borderRadius: borderRadius,
          padding: '12px 16px',
          boxSizing: 'border-box',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
        }}>
          <div style={{
            color: titleColor,
            fontSize: titleFontSize,
            fontWeight: 600,
            textAlign: 'center',
          }}>
            {title}
          </div>
          <div style={{ position: 'relative', height: 20 }}>
            <div style={{
              position: 'absolute',
              left: 12,
              right: 12,
              top: '50%',
              transform: 'translateY(-50%)',
              height: 8,
              borderRadius: 4,
              background: style?.inactiveColor || '#e5e7eb',
            }} />
            <div style={{
              position: 'absolute',
              left: 12,
              top: '50%',
              transform: 'translateY(-50%)',
              height: 8,
              borderRadius: 4,
              width: `${fillPercent * 100}%`,
              maxWidth: `calc(100% - 24px)`,
              background: style?.activeColor || 'linear-gradient(90deg, #d946ef 0%, #f43f5e 50%, #fb923c 100%)',
            }} />
            <div style={{
              position: 'absolute',
              left: `calc(12px + ${fillPercent * 100}% * (100% - 24px) / 100%)`,
              top: '50%',
              transform: 'translate(-50%, -50%)',
              fontSize: emojiSize,
            }}>
              {emoji}
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div style={{
      width: '100%',
      height: '100%',
      background: style?.containerBgColor || 'rgba(0,0,0,0.6)',
      borderRadius: style?.containerBorderRadius || 12,
      padding: style?.containerPadding || 16,
      boxSizing: 'border-box',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 10,
    }}>
      <div style={{
        color: style?.titleColor || '#fff',
        fontSize: style?.titleFontSize || 14,
        fontWeight: 600,
      }}>
        {title}
      </div>
      <div style={{ display: 'flex', gap: 6 }}>
        {Array.from({ length: maxRating }).map((_, i) => (
          <span key={i} style={{
            fontSize: style?.emojiSize || 28,
            filter: i < currentRating ? 'none' : 'grayscale(1) opacity(0.4)',
          }}>
            {emoji}
          </span>
        ))}
      </div>
    </div>
  );
};

// Reaction Preview Component
const ReactionPreview = ({ data, style }) => {
  const emojis = data?.emojis || ['😍', '🔥', '😂', '😮', '😢'];
  
  return (
    <div style={{
      width: '100%',
      height: '100%',
      background: style?.bgColor || 'transparent',
      borderRadius: 12,
      display: 'flex',
      gap: 12,
      justifyContent: 'center',
      alignItems: 'center',
    }}>
      {emojis.map((emoji, i) => (
        <span key={i} style={{
          fontSize: style?.emojiSize || 40,
          filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))',
        }}>
          {emoji}
        </span>
      ))}
    </div>
  );
};

// Promo Code Preview Component
const PromoPreview = ({ data, style }) => {
  return (
    <div style={{
      width: '100%',
      height: '100%',
      background: style?.containerBgColor || 'rgba(0,0,0,0.7)',
      borderRadius: style?.containerBorderRadius || 12,
      padding: style?.containerPadding || 16,
      boxSizing: 'border-box',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 12,
      border: data?.dashedBorder !== false ? `2px dashed ${style?.borderColor || 'rgba(255,255,255,0.3)'}` : 'none',
    }}>
      <div style={{
        color: style?.titleColor || '#fff',
        fontSize: style?.titleFontSize || 14,
        fontWeight: 600,
      }}>
        {data?.title || 'Special Offer'}
      </div>
      <div style={{
        background: style?.codeBgColor || 'rgba(255,255,255,0.15)',
        borderRadius: 8,
        padding: '10px 20px',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
      }}>
        <span style={{
          color: style?.codeColor || '#fff',
          fontSize: style?.codeFontSize || 22,
          fontWeight: 700,
          letterSpacing: 2,
          fontFamily: 'monospace',
        }}>
          {data?.couponCode || 'SAVE20'}
        </span>
        {data?.showCopyButton !== false && (
          <span style={{
            background: style?.buttonBgColor || '#F97316',
            color: style?.buttonTextColor || '#000',
            padding: '6px 12px',
            borderRadius: 6,
            fontSize: 11,
            fontWeight: 600,
          }}>
            Copy
          </span>
        )}
      </div>
      {data?.description && (
        <div style={{
          color: style?.descriptionColor || 'rgba(255,255,255,0.7)',
          fontSize: style?.descriptionFontSize || 12,
          textAlign: 'center',
        }}>
          {data.description}
        </div>
      )}
    </div>
  );
};

// Question Preview Component
const QuestionPreview = ({ data, style }) => {
  return (
    <div style={{
      width: '100%',
      height: '100%',
      background: style?.containerBgColor || 'rgba(0,0,0,0.6)',
      borderRadius: style?.containerBorderRadius || 12,
      padding: style?.containerPadding || 16,
      boxSizing: 'border-box',
      display: 'flex',
      flexDirection: 'column',
      gap: 10,
    }}>
      <div style={{
        color: style?.titleColor || '#fff',
        fontSize: style?.titleFontSize || 16,
        fontWeight: 600,
        textAlign: 'center',
      }}>
        {data?.title || 'Ask me anything'}
      </div>
      <div style={{
        flex: 1,
        background: style?.inputBgColor || 'rgba(255,255,255,0.15)',
        borderRadius: style?.inputBorderRadius || 8,
        padding: '12px 14px',
        color: style?.placeholderColor || 'rgba(255,255,255,0.5)',
        fontSize: style?.inputFontSize || 14,
      }}>
        {data?.placeholder || 'Type your answer...'}
      </div>
      <div style={{
        background: style?.submitBgColor || '#F97316',
        color: style?.submitTextColor || '#000',
        padding: '10px 16px',
        borderRadius: 8,
        fontSize: 14,
        fontWeight: 600,
        textAlign: 'center',
      }}>
        Submit
      </div>
    </div>
  );
};

// Image Quiz Preview Component
const ImageQuizPreview = ({ data, style }) => {
  const options = data?.options || [{ id: '1', label: 'A' }, { id: '2', label: 'B' }];
  const columns = data?.columns || 2;
  
  return (
    <div style={{
      width: '100%',
      height: '100%',
      background: style?.containerBgColor || 'rgba(0,0,0,0.6)',
      borderRadius: style?.containerBorderRadius || 12,
      padding: style?.containerPadding || 12,
      boxSizing: 'border-box',
      display: 'flex',
      flexDirection: 'column',
      gap: 10,
    }}>
      <div style={{
        color: style?.questionColor || '#fff',
        fontSize: style?.questionFontSize || 14,
        fontWeight: 600,
        textAlign: 'center',
      }}>
        {data?.question || 'Which one?'}
      </div>
      <div style={{
        flex: 1,
        display: 'grid',
        gridTemplateColumns: `repeat(${columns}, 1fr)`,
        gap: 8,
      }}>
        {options.map((opt, i) => (
          <div key={i} style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 4,
          }}>
            <div style={{
              width: '100%',
              aspectRatio: '1',
              borderRadius: style?.imageBorderRadius || 8,
              border: opt.id === data?.correctAnswerId 
                ? `3px solid ${style?.correctBorderColor || '#10b981'}`
                : `2px solid ${style?.imageBorderColor || 'rgba(255,255,255,0.3)'}`,
              background: opt.imageUrl ? 'transparent' : 'rgba(255,255,255,0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 24,
              color: 'rgba(255,255,255,0.3)',
              overflow: 'hidden',
            }}>
              {opt.imageUrl ? (
                <img src={opt.imageUrl} alt={opt.label} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : '🖼️'}
            </div>
            <span style={{
              color: style?.labelColor || '#fff',
              fontSize: style?.labelFontSize || 11,
            }}>
              {opt.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

/**
 * Main Interactive Element Component
 * This is rendered on the Polotno canvas
 */
const InteractiveElement = ({ element }) => {
  const type = getInteractiveType(element);
  const data = getInteractiveData(element);
  const style = getInteractiveStyle(element);
  
  // Force re-render when data or style changes
  const renderKey = React.useMemo(() => {
    return JSON.stringify({ data, style });
  }, [data, style]);
  
  const containerStyle = {
    width: '100%',
    height: '100%',
    fontFamily: 'Inter, -apple-system, sans-serif',
  };

  const renderPreview = () => {
    // Safety check
    if (!type) {
      return (
        <div style={{
          width: '100%',
          height: '100%',
          background: '#f0f0f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <span>Loading...</span>
        </div>
      );
    }

    switch (type) {
      case 'poll':
        return <PollPreview key={renderKey} data={data} style={style} />;
      case 'quiz':
        return <QuizPreview key={renderKey} data={data} style={style} />;
      case 'rating':
        return <RatingPreview key={renderKey} data={data} style={style} width={element.width} height={element.height} />;
      case 'reaction':
        return <ReactionPreview key={renderKey} data={data} style={style} />;
      case 'countdown':
        return <CountdownPreview key={renderKey} data={data} style={style} />;
      case 'promo':
        return <PromoPreview key={renderKey} data={data} style={style} />;
      case 'question':
        return <QuestionPreview key={renderKey} data={data} style={style} />;
      case 'imageQuiz':
        return <ImageQuizPreview key={renderKey} data={data} style={style} />;
      default:
        return (
          <div style={{
            width: '100%',
            height: '100%',
            background: 'rgba(99, 102, 241, 0.2)',
            borderRadius: 12,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            color: '#fff',
          }}>
            <span style={{ fontSize: 32 }}>{getInteractiveTypeIcon(type)}</span>
            <span style={{ fontSize: 14, fontWeight: 600 }}>{getInteractiveTypeLabel(type)}</span>
          </div>
        );
    }
  };

  return (
    <div style={containerStyle}>
      {renderPreview()}
    </div>
  );
};

/**
 * Register the custom interactive element type with Polotno
 * Call this function once when initializing the app
 */
export const registerInteractiveElement = () => {
  try {
    unstable_registerShapeComponent('interactive', InteractiveElement);
    console.log('✅ Interactive element type registered successfully');
  } catch (error) {
    console.warn('⚠️ Could not register interactive element type:', error.message);
  }
};

export default registerInteractiveElement;
