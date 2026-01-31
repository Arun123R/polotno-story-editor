import React from 'react';
import { observer } from 'mobx-react-lite';
import { SectionTab } from 'polotno/side-panel';
import {
  createInteractiveData,
  INTERACTIVE_DIMENSIONS,
  getInteractiveTypeLabel,
  getInteractiveTypeIcon,
  INTERACTIVE_STYLES,
} from '../../interactive/schemas';

// Helper to escape XML characters for SVG text
const escapeXml = (unsafe) => {
  if (typeof unsafe !== 'string') return unsafe;
  return unsafe.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case '\'': return '&apos;';
      case '"': return '&quot;';
    }
  });
};

/* ================= STYLES ================= */

// Generate SVG preview for interactive elements
const generateInteractiveSVG = (type, data, style, dimensions) => {
  const { width, height } = dimensions;

  if (type === 'rating') {
    return generateRatingSVG(data, style, width, height);
  }

  if (type === 'poll') {
    return generatePollSVG(data, style, width, height);
  }

  if (type === 'quiz') {
    return generateQuizSVG(data, style, width, height);
  }

  if (type === 'reaction') {
    return generateReactionSVG(data, style, width, height);
  }

  if (type === 'countdown') {
    return generateCountdownSVG(data, style, width, height);
  }

  if (type === 'promo') {
    return generatePromoSVG(data, style, width, height);
  }

  if (type === 'question') {
    return generateQuestionSVG(data, style, width, height);
  }

  if (type === 'imageQuiz') {
    return generateImageQuizSVG(data, style, width, height);
  }

  // Default fallback for other types
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(`
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="${width}" height="${height}" fill="#667eea" rx="12"/>
      <text x="${width / 2}" y="${height / 2}" font-family="Arial" font-size="16" fill="white" text-anchor="middle" dominant-baseline="middle">${type}</text>
    </svg>
  `)}`;
};

// Generate Poll SVG
const generatePollSVG = (data, style, width, height) => {
  const question = data?.question || 'Are you excited for the grand sale?';
  const options = data?.options || [{ id: '1', label: 'YES' }, { id: '2', label: 'NO' }];
  const layout = data?.layout || 'horizontal'; // 'horizontal' or 'vertical'

  // Use style properties
  const bgColor = style?.containerBgColor || '#ffffff';
  const questionColor = style?.questionColor || '#1f2937';
  const buttonBg = style?.optionBgColor || '#ffffff';
  const buttonBorder = '#e5e7eb';
  const buttonTextColor = style?.optionTextColor || '#1f2937';
  const questionFontSize = style?.questionFontSize || 11;
  const optionFontSize = style?.optionFontSize || 13;

  const padding = 16;
  const questionY = padding + 12;
  const buttonHeight = 26;
  const buttonGap = 6;

  let optionsSVG = '';

  if (layout === 'horizontal') {
    // Horizontal layout - 2 columns
    const buttonsPerRow = 2;
    const buttonWidth = (width - padding * 2 - buttonGap) / buttonsPerRow;
    let buttonY = padding + 32;

    options.forEach((opt, i) => {
      const col = i % buttonsPerRow;
      const row = Math.floor(i / buttonsPerRow);
      const x = padding + col * (buttonWidth + buttonGap);
      const y = buttonY + row * (buttonHeight + buttonGap);

      optionsSVG += `
        <rect x="${x}" y="${y}" width="${buttonWidth}" height="${buttonHeight}" rx="8" fill="${buttonBg}" stroke="${buttonBorder}" stroke-width="1"/>
        <text x="${x + buttonWidth / 2}" y="${y + buttonHeight / 2 + 4}" text-anchor="middle" fill="${buttonTextColor}" font-size="${optionFontSize}" font-weight="600">${opt.label || opt.text || 'Option'}</text>
      `;
    });
  } else {
    // Vertical layout - full width
    const buttonWidth = width - padding * 2;
    let buttonY = padding + 32;

    options.forEach((opt, i) => {
      const y = buttonY + i * (buttonHeight + buttonGap);

      optionsSVG += `
        <rect x="${padding}" y="${y}" width="${buttonWidth}" height="${buttonHeight}" rx="8" fill="${buttonBg}" stroke="${buttonBorder}" stroke-width="1"/>
        <text x="${width / 2}" y="${y + buttonHeight / 2 + 4}" text-anchor="middle" fill="${buttonTextColor}" font-size="${optionFontSize}" font-weight="600">${opt.label || opt.text || 'Option'}</text>
      `;
    });
  }

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(`
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <!-- Main background -->
      <rect width="${width}" height="${height}" fill="${bgColor}" rx="12"/>
      
      <!-- Question with text wrapping -->
      <foreignObject x="${padding}" y="${padding}" width="${width - padding * 2}" height="40">
        <div xmlns="http://www.w3.org/1999/xhtml" style="
          color: ${questionColor};
          font-size: ${questionFontSize}px;
          font-weight: 600;
          text-align: center;
          word-wrap: break-word;
          overflow-wrap: break-word;
          line-height: 1.3;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
        ">${question}</div>
      </foreignObject>
      
      <!-- Options -->
      ${optionsSVG}
    </svg>
  `)}`;
};

// Generate Rating SVG
const generateRatingSVG = (data, style, width, height) => {
  const padding = 8;
  const cardW = width - padding * 2;
  const cardH = height - padding * 2;
  const textY = padding + 18;
  const sliderY = padding + 38;
  const sliderW = cardW - 24;
  const sliderX = padding + 12;
  const title = data?.title || 'Do you like my eyes?';
  const emoji = data?.emoji || '😺';
  const maxRating = data?.maxRating || 5;
  const currentRating = data?.currentRating || 3;
  const fillPercent = Math.min(1, currentRating / maxRating);
  const fillW = sliderW * fillPercent;
  const cardBg = style?.cardBgColor || '#ffffff';
  const titleColor = style?.titleColor || '#000000';
  const titleFontSize = style?.titleFontSize || 12;
  const emojiSize = style?.emojiSize || 18;

  const gradId = 'grad' + Math.random().toString(36).substr(2, 9);
  const svgContent = `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="${gradId}" x1="0" x2="1" y1="0" y2="0">
        <stop offset="0%" stop-color="#d946ef"/>
        <stop offset="50%" stop-color="#f43f5e"/>
        <stop offset="100%" stop-color="#fb923c"/>
      </linearGradient>
    </defs>
    <rect x="${padding}" y="${padding}" width="${cardW}" height="${cardH}" fill="${cardBg}" rx="12"/>
    <text x="${width / 2}" y="${textY}" text-anchor="middle" font-family="-apple-system,BlinkMacSystemFont,sans-serif" font-size="${titleFontSize}" font-weight="600" fill="${titleColor}">
      ${title}
    </text>
    <rect x="${sliderX}" y="${sliderY}" width="${sliderW}" height="8" rx="4" fill="#e5e7eb"/>
    <rect x="${sliderX}" y="${sliderY}" width="${fillW}" height="8" rx="4" fill="url(#${gradId})"/>
    <text x="${sliderX + fillW}" y="${sliderY + 14}" text-anchor="middle" font-size="${emojiSize}">${emoji}</text>
  </svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgContent)}`;
};

// Generate Quiz SVG
const generateQuizSVG = (data, style, width, height) => {
  const question = data?.question || 'What is the largest...';
  const options = data?.options || [{ id: '1', text: 'Option 1' }, { id: '2', text: 'Option 2' }];

  const bgColor = style?.containerBgColor || '#ffffff';
  const questionColor = style?.questionColor || '#1f2937';
  const optionBg = style?.optionBgColor || '#f9fafb';
  const optionTextColor = style?.optionTextColor || '#1f2937';
  // Circle style for letter
  const circleBg = '#e5e7eb'; // Light gray circle as in image
  const circleText = '#1f2937';

  // Layout
  const padding = 20;
  const questionY = 35;

  // Calculate dynamic spacing
  const startY = 60;
  const optionH = 34; // Slightly taller pill
  const gap = 12; // More breathing room

  let optionsSVG = '';
  options.forEach((option, idx) => {


    const y = startY + idx * (optionH + gap);
    const letter = String.fromCharCode(65 + idx); // A, B, C...

    optionsSVG += `
       <g>
         <!-- Option Pill -->
         <rect x="${padding}" y="${y}" width="${width - (padding * 2)}" height="${optionH}" rx="${optionH / 2}" fill="${optionBg}" />
         
         <!-- Letter Circle -->
         <circle cx="${padding + (optionH / 2)}" cy="${y + optionH / 2}" r="12" fill="${circleBg}" opacity="0.5" />
         <text x="${padding + (optionH / 2)}" y="${y + optionH / 2 + 4}" font-family="Inter, Arial, sans-serif" font-size="11" font-weight="700" fill="${circleText}" text-anchor="middle">${letter}</text>
         
         <!-- Text -->
         <text x="${padding + optionH + 12}" y="${y + optionH / 2 + 5}" font-family="Inter, Arial, sans-serif" font-size="14" font-weight="500" fill="${optionTextColor}">${escapeXml(option.text || '')}</text>
       </g>
     `;
  });

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(`
    <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <filter id="shadow-quiz-card" x="-10%" y="-10%" width="120%" height="120%">
          <feGaussianBlur in="SourceAlpha" stdDeviation="2"/>
          <feOffset dx="0" dy="1" result="offsetblur"/>
          <feComponentTransfer>
             <feFuncA type="linear" slope="0.1"/>
          </feComponentTransfer>
          <feMerge> 
            <feMergeNode/>
            <feMergeNode in="SourceGraphic"/> 
          </feMerge>
        </filter>
      </defs>

      <rect width="100%" height="100%" fill="${bgColor}" rx="16" filter="url(#shadow-quiz-card)"/>
      
      <!-- Question -->
      <text x="${padding}" y="${questionY}" font-family="Inter, Arial, sans-serif" font-size="18" font-weight="700" fill="${questionColor}">${escapeXml(question)}</text>
      
      <!-- Options -->
      ${optionsSVG}
    </svg>
  `)}`;
};

// Generate Reaction SVG
const generateReactionSVG = (data, style, width, height) => {
  const emojis = data?.emojis || ['👍', '👎'];
  const showCount = data?.showCount || false;
  const transparentBg = style?.transparentBg || data?.transparentBg || false;
  const bgColor = style?.containerBgColor || '#ffffff';
  const buttonBg = '#f9fafb';
  const buttonBorder = '#e5e7eb';

  const padding = 12;
  const buttonCount = emojis.length;
  const buttonGap = 8;

  // Calculate button dimensions - if showing count, buttons are taller (vertical pills)
  const buttonWidth = Math.min(50, (width - padding * 2 - (buttonCount - 1) * buttonGap) / buttonCount);
  const buttonHeight = showCount ? Math.min(65, height - padding * 2) : buttonWidth;
  const buttonY = (height - buttonHeight) / 2;
  const totalWidth = buttonCount * buttonWidth + (buttonCount - 1) * buttonGap;
  const startX = (width - totalWidth) / 2;

  let buttonsSVG = '';
  emojis.forEach((emoji, idx) => {
    const x = startX + idx * (buttonWidth + buttonGap);

    if (showCount) {
      // Tall pill shape with emoji and count
      buttonsSVG += `
        <rect x="${x}" y="${buttonY}" width="${buttonWidth}" height="${buttonHeight}" rx="${buttonWidth / 2}" fill="${buttonBg}" stroke="${buttonBorder}" stroke-width="1"/>
        <text x="${x + buttonWidth / 2}" y="${buttonY + buttonHeight * 0.35}" text-anchor="middle" font-size="${buttonWidth * 0.5}" dominant-baseline="middle">${emoji}</text>
        <text x="${x + buttonWidth / 2}" y="${buttonY + buttonHeight * 0.75}" text-anchor="middle" font-family="Arial, sans-serif" font-size="${buttonWidth * 0.35}" font-weight="600" fill="#000000" dominant-baseline="middle">2k</text>
      `;
    } else {
      // Standard circle shape
      buttonsSVG += `
        <circle cx="${x + buttonWidth / 2}" cy="${buttonY + buttonWidth / 2}" r="${buttonWidth / 2}" fill="${buttonBg}" stroke="${buttonBorder}" stroke-width="1"/>
        <text x="${x + buttonWidth / 2}" y="${buttonY + buttonWidth / 2 + buttonWidth * 0.05}" text-anchor="middle" font-size="${buttonWidth * 0.6}" dominant-baseline="middle">${emoji}</text>
      `;
    }
  });

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(`
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <!-- Background -->
      ${transparentBg ? '' : `<rect width="${width}" height="${height}" fill="${bgColor}" rx="12"/>`}
      
      <!-- Emoji buttons -->
      ${buttonsSVG}
    </svg>
  `)}`;
};

// Generate Countdown SVG with Individual Digit Tiles
const generateCountdownSVG = (data, style, width, height) => {
  const title = data?.title || "It's almost my b-day!";
  const containerBg = style?.containerBgColor || '#ffffff';
  const textColor = style?.titleColor || '#1f2937';
  const labelColor = style?.labelColor || '#1f2937'; // Darker label color from image
  // New tiling styles
  const digitBoxBg = '#f3f4f6'; // Light gray for digit tiles
  const digitBoxRadius = 6;
  const digitBoxWidth = 32;
  const digitBoxHeight = 44;
  const digitGap = 4; // Gap between two digits of same unit
  const groupGap = 16; // Gap between units (where colon lives)

  // Parsing visibility
  const showDays = data?.showDays !== false;
  const showHours = data?.showHours !== false;
  const showMinutes = data?.showMinutes !== false;
  const showSeconds = data?.showSeconds !== false;

  // Calculate time remaining
  let days = '00', hours = '00', minutes = '00', seconds = '00';

  if (data?.endDate) {
    const endDateTimeString = data.endTime ? `${data.endDate}T${data.endTime}` : data.endDate;
    const targetDate = new Date(endDateTimeString);
    const now = new Date();
    const diff = targetDate - now;

    if (diff > 0) {
      const d = Math.floor(diff / (1000 * 60 * 60 * 24));
      const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const s = Math.floor((diff % (1000 * 60)) / 1000);

      days = d.toString().padStart(2, '0');
      hours = h.toString().padStart(2, '0');
      minutes = m.toString().padStart(2, '0');
      seconds = s.toString().padStart(2, '0');
    }
  }

  // Build the layout groups dynamically
  let groups = [];
  if (showDays) groups.push({ value: days, label: 'days' });
  if (showHours) groups.push({ value: hours, label: 'hours' });
  if (showMinutes) groups.push({ value: minutes, label: 'minutes' });
  if (showSeconds) groups.push({ value: seconds, label: 'seconds' });

  // Calculate total width of the time display to center it
  // Group width = (digitBoxWidth * 2) + digitGap
  const groupWidth = (digitBoxWidth * 2) + digitGap;
  const totalContentWidth = (groups.length * groupWidth) + ((groups.length - 1) * groupGap);

  // Starting X position to center content
  let currentX = (width - totalContentWidth) / 2;
  const startY = 45;

  // Generate SVG parts
  const groupSVGs = groups.map((g, index) => {
    const isLast = index === groups.length - 1;
    const gX = currentX;

    // Update X for next loop
    currentX += groupWidth + groupGap;

    const [d1, d2] = g.value.toString().padStart(2, '0').split('');

    // Digit 1
    const d1Rect = `<rect x="${gX}" y="${startY}" width="${digitBoxWidth}" height="${digitBoxHeight}" rx="${digitBoxRadius}" fill="${digitBoxBg}" />`;
    const d1Text = `<text x="${gX + digitBoxWidth / 2}" y="${startY + 30}" font-family="Inter, Arial, sans-serif" font-size="24" font-weight="700" fill="${textColor}" text-anchor="middle">${d1}</text>`;

    // Digit 2
    const d2X = gX + digitBoxWidth + digitGap;
    const d2Rect = `<rect x="${d2X}" y="${startY}" width="${digitBoxWidth}" height="${digitBoxHeight}" rx="${digitBoxRadius}" fill="${digitBoxBg}" />`;
    const d2Text = `<text x="${d2X + digitBoxWidth / 2}" y="${startY + 30}" font-family="Inter, Arial, sans-serif" font-size="24" font-weight="700" fill="${textColor}" text-anchor="middle">${d2}</text>`;

    // Label
    const labelText = `<text x="${gX + groupWidth / 2}" y="${startY + 60}" font-family="Inter, Arial, sans-serif" font-size="11" font-weight="600" fill="${labelColor}" text-anchor="middle">${g.label}</text>`;

    // Colon (if not last)
    let colon = '';
    if (!isLast) {
      const colonX = d2X + digitBoxWidth + (groupGap / 2);
      colon = `<text x="${colonX}" y="${startY + 28}" font-family="Inter, Arial, sans-serif" font-size="20" font-weight="700" fill="${textColor}" text-anchor="middle">:</text>`;
    }

    return d1Rect + d1Text + d2Rect + d2Text + labelText + colon;
  }).join('');

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(`
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="${width}" height="${height}" fill="${containerBg}" rx="16" stroke="#e5e7eb" stroke-width="1"/>
      
      <!-- Title -->
      <text x="${width / 2}" y="35" font-family="Inter, Arial, sans-serif" font-size="16" font-weight="700" fill="${textColor}" text-anchor="middle">${escapeXml(title)}</text>
      
      <!-- Time Display Groups -->
      ${groupSVGs}
    </svg>
  `)}`;
};

// Generate Promo SVG (Coupon Style) 
// Generate Promo SVG (Coupon Style) 
const generatePromoSVG = (data, style, width, height) => {
  // Use 'Coupon' as default title to match the image if no title provided
  const title = data?.title || 'Coupon';
  const containerBg = style?.containerBgColor || '#ffffff';
  const borderColor = style?.borderColor || '#f97316';
  const textColor = style?.titleColor || '#1f2937';
  const iconBg = style?.codeBgColor || '#fef3c7';
  const dashed = data?.dashedBorder !== false;
  const showCopyButton = data?.showCopyButton !== false;

  const strokeDash = dashed ? '8,6' : '0';

  const iconSVG = showCopyButton ? `
      <!-- Clipboard Icon Background -->
      <!-- Positioned to the right -->
      <rect x="${width - 90}" y="${height / 2 - 25}" width="50" height="50" rx="12" fill="${iconBg}" />
      
      <!-- Clipboard Icon -->
      <g transform="translate(${width - 77}, ${height / 2 - 12}) scale(1.2)">
         <!-- Board -->
         <rect x="0" y="0" width="20" height="26" fill="#d1d5db" rx="2" stroke="#9ca3af" stroke-width="1.5"/>
         <!-- Paper -->
         <rect x="2" y="4" width="16" height="20" fill="#ffffff" />
         <!-- Clip -->
         <rect x="5" y="-2" width="10" height="4" fill="#9ca3af" rx="1" />
      </g>
  ` : '';

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(`
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <!-- Main container with border -->
      <rect x="5" y="5" width="${width - 10}" height="${height - 10}" fill="${containerBg}" rx="24" stroke="${borderColor}" stroke-width="2" stroke-dasharray="${strokeDash}"/>
      
      <!-- 'Coupon' Text -->
      <text x="40" y="${height / 2 + 10}" font-family="Inter, Arial, sans-serif" font-size="28" font-weight="800" fill="${textColor}" text-anchor="start">${escapeXml(title)}</text>
      
      ${iconSVG}
    </svg>
  `)}`;
};

// Generate Question SVG
const generateQuestionSVG = (data, style, width, height) => {
  const title = data?.title || 'Ask me anything!';
  const placeholder = data?.placeholder || 'Tap to ask';
  const containerBg = style?.containerBgColor || '#ffffff';
  const textColor = style?.titleColor || '#1f2937';
  const inputBg = style?.inputBgColor || '#f3f4f6';
  const placeholderColor = style?.placeholderColor || '#9ca3af';

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(`
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
          <feGaussianBlur in="SourceAlpha" stdDeviation="2"/>
          <feOffset dx="0" dy="2" result="offsetblur"/>
          <feComponentTransfer>
             <feFuncA type="linear" slope="0.1"/>
          </feComponentTransfer>
          <feMerge> 
            <feMergeNode/>
            <feMergeNode in="SourceGraphic"/> 
          </feMerge>
        </filter>
      </defs>
      
      <!-- Main Card -->
      <rect x="5" y="5" width="${width - 10}" height="${height - 10}" fill="${containerBg}" rx="16" filter="url(#shadow)"/>
      
      <!-- Speech Bubble Tail Mockup (Optional) - User image shows a speech bubble style in thumbnail, but preview is a card. Let's stick to the card style for now as it's cleaner -->

      <!-- Title -->
      <text x="${width / 2}" y="50" font-family="Inter, Arial, sans-serif" font-size="20" font-weight="700" fill="${textColor}" text-anchor="middle">${escapeXml(title)}</text>
      
      <!-- Input Box -->
      <rect x="25" y="75" width="${width - 50}" height="45" fill="${inputBg}" rx="12"/>
      <text x="${width / 2}" y="103" font-family="Inter, Arial, sans-serif" font-size="14" fill="${placeholderColor}" text-anchor="middle">${escapeXml(placeholder)}</text>
    </svg>
  `)}`;
};

// Generate Image Quiz SVG
const generateImageQuizSVG = (data, style, width, height) => {
  const question = data?.question || 'Which one is correct?';
  const containerBg = style?.containerBgColor || '#ffffff';
  const textColor = style?.questionColor || '#1f2937';
  const labelColor = style?.labelColor || '#4b5563';
  const borderColor = style?.imageBorderColor || '#e5e7eb';
  const options = data?.options || [{ label: 'Option 1' }, { label: 'Option 2' }];

  // Two columns hardcoded for preview simplicity, matching standard layout
  const gap = 12;
  const padding = 20;
  const availableWidth = width - (padding * 2);
  const optionWidth = (availableWidth - gap) / 2;
  // Make options roughly square or slight portrait
  const optionHeight = optionWidth * 1.0;

  const startY = 60;

  let optionsSVG = '';
  // Only render first 2 options for the preview if more exist
  for (let i = 0; i < 2; i++) {
    const x = padding + (i * (optionWidth + gap));
    const label = options[i]?.label || `Option ${i + 1}`;
    const imageUrl = options[i]?.imageUrl;

    let content = '';
    if (imageUrl) {
      // Render image if available
      content = `
          <defs>
             <clipPath id="clip-${i}">
                <rect x="${x}" y="${startY}" width="${optionWidth}" height="${optionHeight}" rx="8" />
             </clipPath>
          </defs>
          <image href="${imageUrl}" x="${x}" y="${startY}" width="${optionWidth}" height="${optionHeight}" preserveAspectRatio="xMidYMid slice" clip-path="url(#clip-${i})" />
          <rect x="${x}" y="${startY}" width="${optionWidth}" height="${optionHeight}" rx="8" fill="none" stroke="${borderColor}" stroke-width="1"/>
        `;
    } else {
      // Render placeholder
      content = `
           <rect x="${x}" y="${startY}" width="${optionWidth}" height="${optionHeight}" rx="8" fill="#f3f4f6" stroke="${borderColor}" stroke-width="1"/>
           <text x="${x + optionWidth / 2}" y="${startY + optionHeight / 2 + 5}" font-family="Arial" font-size="24" fill="#9ca3af" text-anchor="middle">📷</text>
        `;
    }

    optionsSVG += `
       ${content}
       
       <!-- Label -->
       <text x="${x + optionWidth / 2}" y="${startY + optionHeight + 20}" font-family="Inter, Arial, sans-serif" font-size="12" fill="${labelColor}" text-anchor="middle">${escapeXml(label)}</text>
     `;
  }

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(`
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <filter id="shadow-quiz" x="-10%" y="-10%" width="120%" height="120%">
          <feGaussianBlur in="SourceAlpha" stdDeviation="2"/>
          <feOffset dx="0" dy="2" result="offsetblur"/>
          <feComponentTransfer>
             <feFuncA type="linear" slope="0.1"/>
          </feComponentTransfer>
          <feMerge> 
            <feMergeNode/>
            <feMergeNode in="SourceGraphic"/> 
          </feMerge>
        </filter>
      </defs>

      <rect x="5" y="5" width="${width - 10}" height="${height - 10}" fill="${containerBg}" rx="16" filter="url(#shadow-quiz)"/>
      
      <text x="${width / 2}" y="35" font-family="Inter, Arial, sans-serif" font-size="16" font-weight="700" fill="${textColor}" text-anchor="middle">${escapeXml(question)}</text>
      
      ${optionsSVG}
    </svg>
  `)}`;
};

// Inject CSS once to ensure black text on rating card
if (typeof document !== 'undefined' && !document.getElementById('rating-question-styles')) {
  const style = document.createElement('style');
  style.id = 'rating-question-styles';
  style.textContent = `
    .rating-question-text {
      color: #000000 !important;
    }
    .poll-question-text {
      color: #000000 !important;
    }
    .poll-option-text {
      color: #374151 !important;
      font-weight: 700 !important;
    }
    .bp5-dark .poll-option-text {
      color: #374151 !important;
    }
    button .poll-option-text,
    .polotno-panel-container button .poll-option-text {
      color: #374151 !important;
    }
  `;
  document.head.appendChild(style);
}

/* ================= TAB ================= */

const InteractiveIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);

export const InteractiveSectionTab = (props) => (
  <SectionTab name="Interactive" {...props}>
    <div className="flex justify-center items-center">
      <InteractiveIcon />
    </div>
  </SectionTab>
);

/* ================= BUTTON STYLES ================= */

const buttonStyles = {
  poll: { bg: '#f8f9fa', icon: '📊' },
  quiz: { bg: '#f8f9fa', icon: '❓' },
  rating: { bg: '#f8f9fa', icon: null },
  reaction: { bg: '#f8f9fa', icon: '😍' },
  countdown: { bg: '#f8f9fa', icon: '⏱️' },
  promo: { bg: '#f8f9fa', icon: '🎟️' },
  question: { bg: '#f8f9fa', icon: '💬' },
  imageQuiz: { bg: '#f8f9fa', icon: '🖼️' },
};

/* ================= INTERACTION BUTTON ================= */

const InteractionButton = ({ type, onClick }) => {
  const styleConfig = buttonStyles[type];
  const label = getInteractiveTypeLabel(type);

  return (
    <button
      onClick={onClick}
      style={{
        height: 160,
        border: '1px solid var(--border-primary)',
        borderRadius: 16,
        background: 'var(--bg-secondary)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        cursor: 'pointer',
        transition: 'all 0.2s',
        boxShadow: 'none',
        outline: 'none',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      {type === 'rating' ? (
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, color: 'inherit', padding: '0 10px', boxSizing: 'border-box' }}>
          <div style={{ width: '100%', height: 110, borderRadius: 12, background: 'var(--bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, boxSizing: 'border-box' }}>
            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 8, paddingLeft: 8, paddingRight: 8 }}>
              <div style={{ fontSize: 11, fontWeight: 600, textAlign: 'center', lineHeight: 1.3, color: 'var(--text-primary)' }}>
                Do you like my eyes?
              </div>
              <div style={{ position: 'relative', height: 16, marginTop: 4 }}>
                <div style={{ position: 'absolute', left: 0, right: 0, top: '50%', transform: 'translateY(-50%)', height: 5, borderRadius: 999, background: 'var(--border-primary)' }} />
                <div style={{ position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)', height: 5, borderRadius: 999, width: '60%', background: 'linear-gradient(90deg, #ec4899 0%, #f97316 50%, #fbbf24 100%)' }} />
                <div style={{ position: 'absolute', left: '60%', top: '50%', transform: 'translate(-50%,-50%)', width: 18, height: 18, borderRadius: 999, background: 'var(--bg-secondary)', border: '2px solid var(--border-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                  <span style={{ fontSize: 11 }}>😺</span>
                </div>
              </div>
            </div>
          </div>
          <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)' }}>
            {label}
          </span>
        </div>
      ) : type === 'quiz' ? (
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, padding: '0 10px', boxSizing: 'border-box' }}>
          <div style={{ width: '100%', height: 110, borderRadius: 12, background: 'var(--bg-secondary)', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'center', padding: '10px', boxSizing: 'border-box', gap: 5 }}>
            <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 2 }}>What is the largest...</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '5px 8px', background: 'var(--bg-secondary)', borderRadius: 6, width: '100%', boxSizing: 'border-box', border: '1px solid var(--border-primary)' }}>
              <div style={{ width: 14, height: 14, borderRadius: '50%', background: 'var(--bg-tertiary)', border: '1px solid var(--border-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <span style={{ fontSize: 8, fontWeight: 700, color: 'var(--text-secondary)' }}>A</span>
              </div>
              <span style={{ fontSize: 9, color: 'var(--text-primary)', fontWeight: 500 }}>Option 1</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '5px 8px', background: 'var(--bg-secondary)', borderRadius: 6, width: '100%', boxSizing: 'border-box', border: '1px solid var(--border-primary)' }}>
              <div style={{ width: 14, height: 14, borderRadius: '50%', background: 'var(--bg-tertiary)', border: '1px solid var(--border-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <span style={{ fontSize: 8, fontWeight: 700, color: 'var(--text-secondary)' }}>B</span>
              </div>
              <span style={{ fontSize: 9, color: 'var(--text-primary)', fontWeight: 500 }}>Option 2</span>
            </div>
          </div>
          <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)' }}>
            {label}
          </span>
        </div>
      ) : type === 'poll' ? (
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, padding: '0 10px', boxSizing: 'border-box' }}>
          <div style={{ width: '100%', height: 110, borderRadius: 12, background: 'var(--bg-secondary)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '14px', boxSizing: 'border-box', gap: 8, paddingLeft: 12, paddingRight: 12 }}>
            <div style={{ fontSize: 11, fontWeight: 600, textAlign: 'center', lineHeight: 1.3, color: 'var(--text-primary)' }}>
              Are you excited for the grand sale?
            </div>
            <div style={{ display: 'flex', width: '100%', background: 'var(--bg-secondary)', border: '1px solid var(--border-primary)', borderRadius: 8, overflow: 'hidden', height: 32 }}>
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 600 }}>
                <span style={{ color: 'var(--text-primary)' }}>NO</span>
              </div>
              <div style={{ width: 1, background: 'var(--border-primary)' }} />
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 600 }}>
                <span style={{ color: 'var(--text-primary)' }}>YES</span>
              </div>
            </div>
          </div>
          <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)' }}>
            {label}
          </span>
        </div>
      ) : type === 'reaction' ? (
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, padding: '0 10px', boxSizing: 'border-box' }}>
          <div style={{ width: '100%', height: 110, borderRadius: 12, background: 'var(--bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px', boxSizing: 'border-box', gap: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: 42 }}>👍</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: 42 }}>👎</span>
            </div>
          </div>
          <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)' }}>
            {label}
          </span>
        </div>
      ) : type === 'countdown' ? (
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, padding: '0 10px', boxSizing: 'border-box' }}>
          <div style={{ width: '100%', height: 110, borderRadius: 12, background: 'var(--bg-secondary)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '10px', boxSizing: 'border-box', gap: 5 }}>
            <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-primary)', textAlign: 'center' }}>
              It's almost my b-day!
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 2, width: '100%' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 16 }}>
                <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>0</span>
                <span style={{ fontSize: 6, color: 'var(--text-muted)', marginTop: -2 }}>days</span>
              </div>
              <span style={{ fontSize: 10, fontWeight: 600, color: 'var(--border-primary)', marginBottom: 6 }}>:</span>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 16 }}>
                <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>02</span>
                <span style={{ fontSize: 6, color: 'var(--text-muted)', marginTop: -2 }}>hours</span>
              </div>
              <span style={{ fontSize: 10, fontWeight: 600, color: 'var(--border-primary)', marginBottom: 6 }}>:</span>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 16 }}>
                <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>44</span>
                <span style={{ fontSize: 6, color: 'var(--text-muted)', marginTop: -2 }}>minutes</span>
              </div>
              <span style={{ fontSize: 10, fontWeight: 600, color: 'var(--border-primary)', marginBottom: 6 }}>:</span>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 16 }}>
                <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>12</span>
                <span style={{ fontSize: 6, color: 'var(--text-muted)', marginTop: -2 }}>seconds</span>
              </div>
            </div>
          </div>
          <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)' }}>
            {label}
          </span>
        </div>
      ) : type === 'promo' ? (
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, padding: '0 10px', boxSizing: 'border-box' }}>
          <div style={{ width: '100%', height: 110, borderRadius: 12, background: 'var(--bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px', boxSizing: 'border-box' }}>
            <div style={{ position: 'relative', background: 'var(--bg-secondary)', border: '2px dashed var(--border-primary)', borderRadius: 12, padding: '12px 16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, width: '85%' }}>
              <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>Coupon</span>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--bg-secondary)', border: '2px solid var(--border-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <span style={{ fontSize: 18 }}>🏷️</span>
              </div>
            </div>
          </div>
          <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)' }}>
            {label}
          </span>
        </div>
      ) : type === 'question' ? (
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, padding: '0 10px', boxSizing: 'border-box' }}>
          <div style={{ width: '100%', height: 110, borderRadius: 12, background: 'var(--bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px', boxSizing: 'border-box' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, width: '100%' }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', textAlign: 'center' }}>Ask a Question</div>
              <div style={{ fontSize: 10, color: 'var(--text-muted)', textAlign: 'center' }}>Tap to ask</div>
            </div>
          </div>
          <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)' }}>
            {label}
          </span>
        </div>
      ) : type === 'imageQuiz' ? (
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, padding: '0 10px', boxSizing: 'border-box' }}>
          <div style={{ width: '100%', height: 110, borderRadius: 12, background: 'var(--bg-secondary)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '12px', boxSizing: 'border-box', gap: 6, paddingLeft: 10, paddingRight: 10 }}>
            <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-primary)', textAlign: 'center', marginBottom: 2 }}>What is the largest species</div>
            <div style={{ display: 'flex', gap: 6, width: '100%', justifyContent: 'center' }}>
              <div style={{ flex: 1, borderRadius: 10, background: 'var(--bg-secondary)', border: '1px solid var(--border-primary)', height: 42, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', maxWidth: 50 }}>
                <span style={{ fontSize: 24 }}>🐻</span>
              </div>
              <div style={{ flex: 1, borderRadius: 10, background: 'var(--bg-secondary)', border: '1px solid var(--border-primary)', height: 42, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', maxWidth: 50 }}>
                <span style={{ fontSize: 24 }}>🐼</span>
              </div>
            </div>
          </div>
          <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)' }}>
            {label}
          </span>
        </div>
      ) : (
        <>
          <span style={{ fontSize: 28 }}>{styleConfig.icon}</span>
          <span style={{ fontSize: 11, fontWeight: 600, color: '#fff', textShadow: '0 1px 2px rgba(0,0,0,0.2)' }}>
            {label}
          </span>
        </>
      )}
    </button>
  );
};

/* ================= PANEL ================= */

export const InteractiveSectionPanel = observer(({ store }) => {
  const page = store?.activePage;
  if (!page) return null;

  /**
   * Add an interactive element to the canvas
   * Uses 'svg' element type which:
   * 1. Allows manual width/height control
   * 2. Can display custom SVG content as a preview
   * 3. Works well with Polotno's selection and manipulation
   */
  const addInteractive = (type) => {
    const dimensions = { ...INTERACTIVE_DIMENSIONS[type] };
    const customData = createInteractiveData(type);
    const styleDefaults = INTERACTIVE_STYLES[type] || {};

    // Calculate dynamic height for poll based on options
    if (type === 'poll' && customData.data.options) {
      const optionCount = customData.data.options.length;
      const layout = customData.data.layout || 'horizontal';
      const padding = 16;
      const questionHeight = 24;
      const buttonHeight = 26;
      const buttonGap = 6;

      if (layout === 'horizontal') {
        const rows = Math.ceil(optionCount / 2);
        dimensions.height = padding + questionHeight + padding + (rows * buttonHeight) + ((rows - 1) * buttonGap) + padding;
      } else {
        dimensions.height = padding + questionHeight + padding + (optionCount * buttonHeight) + ((optionCount - 1) * buttonGap) + padding;
      }
    }

    // Calculate dynamic height for quiz based on options
    if (type === 'quiz' && customData.data.options) {
      const optionCount = customData.data.options.length;
      const padding = 20;
      const questionHeight = 35;
      const optionHeight = 34;
      const optionGap = 12;
      const bottomPadding = 20;
      dimensions.height = padding + questionHeight + 15 + (optionCount * optionHeight) + ((optionCount - 1) * optionGap) + bottomPadding;
    }



    // Calculate dynamic height for reaction based on showCount
    if (type === 'reaction') {
      const padding = 12;
      const buttonSize = 40;
      const pillHeight = 65;
      dimensions.height = customData.data.showCount ? (pillHeight + padding * 2) : (buttonSize + padding * 2);
    }

    // Safety check for dimensions
    const canvasWidth = store.width || page.width || 1080;
    const canvasHeight = store.height || page.height || 1920;

    // Center the element on the page
    const x = (canvasWidth - dimensions.width) / 2;
    const y = (canvasHeight - dimensions.height) / 2;

    // Generate SVG preview as a fallback if needed
    const svgContent = generateInteractiveSVG(type, customData.data, styleDefaults, dimensions);

    // Create element with 'svg' type to ensure visibility
    // We use the generated SVG as the source
    const element = page.addElement({
      type: 'svg',
      x: isNaN(x) ? 100 : x,
      y: isNaN(y) ? 100 : y,
      width: dimensions.width, // Ensure this reflects the updated 340
      height: dimensions.height,
      keepRatio: false,
      src: svgContent,
      custom: {
        ...customData,
        isInteractive: true,
      }
    });

    // Auto-select the new element
    if (element) {
      store.selectElements([element.id]);
    }
  };

  // Get existing interactive elements on this page
  const interactiveElements = page.children.filter(
    el => el.custom?.kind === 'interactive' || el.custom?.isInteractive
  );

  return (
    <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100vh', overflowY: 'auto', padding: '16px 16px 150px 16px', boxSizing: 'border-box' }}>
      {/* Section Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        marginBottom: 16,
      }}>
        <div style={{
          width: 36,
          height: 36,
          borderRadius: 10,
          background: '#FFF3E8',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: '1px solid #FFE5D9',
        }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FF7A1A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
        </div>
        <div>
          <h3 style={{
            fontSize: 14,
            fontWeight: 600,
            margin: 0,
            color: 'var(--text-primary)',
          }}>
            Interactive Stickers
          </h3>
          <p style={{
            fontSize: 11,
            margin: 0,
            color: 'var(--text-muted)',
          }}>
            Add engagement to your stories
          </p>
        </div>
      </div>

      {/* Section Label */}
      <p style={{
        fontSize: 11,
        fontWeight: 600,
        opacity: 0.6,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginBottom: 12,
        color: 'var(--text-secondary)',
      }}>
        Engagement Widgets
      </p>

      {/* Interactive Buttons Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, minmax(0, 140px))',
        gap: 12,
        marginBottom: 20,
        justifyContent: 'space-between',
      }}>
        <InteractionButton type="poll" onClick={() => addInteractive('poll')} />
        <InteractionButton type="quiz" onClick={() => addInteractive('quiz')} />
        <InteractionButton type="rating" onClick={() => addInteractive('rating')} />
        <InteractionButton type="reaction" onClick={() => addInteractive('reaction')} />
        <InteractionButton type="countdown" onClick={() => addInteractive('countdown')} />
        <InteractionButton type="promo" onClick={() => addInteractive('promo')} />
        <InteractionButton type="question" onClick={() => addInteractive('question')} />
        <InteractionButton type="imageQuiz" onClick={() => addInteractive('imageQuiz')} />
      </div>

      {/* Existing Interactive Elements on Page */}
      {interactiveElements.length > 0 && (
        <>
          <p style={{
            fontSize: 11,
            fontWeight: 600,
            opacity: 0.6,
            textTransform: 'uppercase',
            letterSpacing: 0.5,
            marginBottom: 10,
            color: 'var(--text-secondary)',
          }}>
            On This Slide ({interactiveElements.length})
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {interactiveElements.map((el) => {
              const type = el.custom?.interactiveType;
              const isSelected = store.selectedElements.some(s => s.id === el.id);

              return (
                <button
                  key={el.id}
                  onClick={() => store.selectElements([el.id])}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '10px 12px',
                    background: isSelected ? '#FFF3E8' : 'var(--bg-elevated)',
                    border: isSelected ? '1px solid #FFF3E8' : '1px solid var(--border-primary)',
                    borderRadius: 8,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    width: '100%',
                    textAlign: 'left',
                    outline: 'none',
                  }}
                >
                  <span style={{ fontSize: 18, color: isSelected ? '#FF7A1A' : 'inherit' }}>{getInteractiveTypeIcon(type)}</span>
                  <span style={{
                    fontSize: 12,
                    fontWeight: 500,
                    color: isSelected ? '#FF7A1A' : 'var(--text-primary)',
                  }}>
                    {getInteractiveTypeLabel(type)}
                  </span>
                  <span style={{
                    marginLeft: 'auto',
                    fontSize: 11,
                    color: isSelected ? '#FF7A1A' : 'var(--text-muted)',
                  }}>
                    {isSelected ? '✓ Selected' : 'Click to edit'}
                  </span>
                </button>
              );
            })}
          </div>
        </>
      )}

      {/* Help Text */}
      <p style={{
        fontSize: 11,
        color: 'var(--text-muted)',
        textAlign: 'center',
        lineHeight: 1.5,
        marginTop: 20,
        padding: '12px',
        background: 'var(--bg-tertiary)',
        borderRadius: 8,
      }}>
        Click a widget to add it to your story.
        <br />
        Select it on canvas to customize.
      </p>
    </div>
  );
});



/* ================= EXPORT ================= */

export const InteractiveSection = {
  name: 'interactive',
  Tab: InteractiveSectionTab,
  Panel: InteractiveSectionPanel,
};

// Export helper for updating SVG when data changes
export { generateInteractiveSVG };
