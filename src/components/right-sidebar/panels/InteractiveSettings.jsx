import { observer } from 'mobx-react-lite';
import { useState, useRef, useCallback } from 'react';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import {
  PositionSection,
  AppearanceSection,
  AnimationSection,
  DurationSection,
  TrashIcon,
} from '../shared/CommonControls';
import { ColorPicker } from '../shared/ColorPicker';
import { EmojiPickerControl } from '../shared/EmojiPicker';
import {
  getInteractiveType,
  getInteractiveData,
  getInteractiveStyle,
  getInteractiveTypeLabel,
  getInteractiveTypeIcon,
  INTERACTIVE_STYLES,
  INTERACTIVE_DIMENSIONS,
} from '../../interactive/schemas';
import { generateInteractiveSVG } from '../../side-panel/sections/InteractiveSection';
import { PollRenderer } from '../../interactive/renderers/PollRenderer';
import { QuestionRenderer } from '../../interactive/renderers/QuestionRenderer';
import { ImageQuizRenderer } from '../../interactive/renderers/ImageQuizRenderer';

// Helper to escape XML special characters
const escapeXml = (unsafe) => {
  if (!unsafe) return '';
  return String(unsafe)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
};
import Dropdown from '../../shared/Dropdown';
import { storyAPI } from '../../../services/api';

/**
 * Interactive Settings Panel
 * 
 * Provides comprehensive controls for all interactive element types.
 * Controls dynamically change based on the selected interactiveType.
 */
export const InteractiveSettings = observer(({ store, element }) => {
  const [activeTab, setActiveTab] = useState('content');
  const imageInputRef = useRef(null);
  const [uploadingOptionId, setUploadingOptionId] = useState(null);

  if (!element) return null;

  const interactiveType = getInteractiveType(element);
  const data = getInteractiveData(element);
  const style = getInteractiveStyle(element);

  // Regenerate SVG preview when data or style changes
  const regenerateSVG = useCallback((newData, newStyle) => {
    let width = element.width || INTERACTIVE_DIMENSIONS[interactiveType]?.width || 280;
    let height = element.height || INTERACTIVE_DIMENSIONS[interactiveType]?.height || 160;

    // Calculate dynamic height for polls based on options and layout
    if (interactiveType === 'poll' && newData.options) {
      const optionCount = newData.options.length;
      const layoutValue = newData.layout;
      const layoutType = typeof layoutValue === 'object' ? layoutValue?.type : layoutValue;
      const layout = layoutType || 'horizontal';
      const padding = 16;
      const questionHeight = 40; // Space for question
      const optionHeight = 36; // Match SVG generation
      const optionGap = 8; // Match SVG generation

      if (layout === 'horizontal') {
        const rows = Math.ceil(optionCount / 2);
        height = padding + questionHeight + (rows * optionHeight) + ((rows - 1) * optionGap) + padding;
      } else {
        height = padding + questionHeight + (optionCount * optionHeight) + ((optionCount - 1) * optionGap) + padding;
      }
    }

    // Force regeneration for countdown to make toggles work instantly
    if (interactiveType === 'countdown') {
      width = INTERACTIVE_DIMENSIONS['countdown'].width; // Force reset to full width
    }
    // Force reset width for quiz to ensure options fit
    if (interactiveType === 'quiz') {
      width = INTERACTIVE_DIMENSIONS['quiz'].width;
    }
    // Force reset for promo to ensure icon isn't cut off
    if (interactiveType === 'promo') {
      width = INTERACTIVE_DIMENSIONS['promo'].width;
      height = INTERACTIVE_DIMENSIONS['promo'].height;
    }
    // Force reset for imageQuiz
    if (interactiveType === 'imageQuiz') {
      width = INTERACTIVE_DIMENSIONS['imageQuiz'].width;
      height = INTERACTIVE_DIMENSIONS['imageQuiz'].height;
    }

    // Fixed dimensions for rating to prevent changes during styling edits
    if (interactiveType === 'rating') {
      // Keep existing dimensions if element already has them, otherwise use defaults
      width = element.width || INTERACTIVE_DIMENSIONS['rating']?.width || 237;
      height = element.height || INTERACTIVE_DIMENSIONS['rating']?.height || 90;
    }


    // Calculate dynamic height for quiz based on options
    if (interactiveType === 'quiz' && newData.options) {
      const optionCount = newData.options.length;
      const padding = 20;
      const questionHeight = 35; // Larger bold title
      const optionHeight = 34; // Taller pills
      const optionGap = 12; // Gap from generator
      const bottomPadding = 18; // Max safety padding to prevent ANY clipping

      height = padding + questionHeight + 15 + (optionCount * optionHeight) + ((optionCount - 1) * optionGap) + bottomPadding;
    }

    // Dynamic height for reaction
    if (interactiveType === 'reaction') {
      const emojiSize = newStyle.emojiSize || 48;
      const verticalPadding = newData.showCount ? 55 : 16;
      height = Math.max(64, emojiSize + verticalPadding);
    }

    // Dynamic height for question
    if (interactiveType === 'question') {
      const padding = newStyle.padding ?? 20;
      const qSize = newStyle.questionSize ?? 20;
      // Height = PaddingTop + Title (size*1.4) + Margin(12) + Input(45) + PaddingBottom
      height = padding + (qSize * 1.4) + 12 + 45 + padding;
    }

    const dimensions = { width, height };
    let newSrc;

    // Use pure SVG generation for polls (foreignObject doesn't work reliably in data URLs)
    if (interactiveType === 'poll') {
      const bgColor = newStyle.containerBgColor || '#ffffff';
      const questionColor = newStyle.questionColor || '#000000';
      const questionSize = newStyle.questionFontSize || 16;
      const optionBg = newStyle.optionBgColor || '#ffffff';
      const optionText = newStyle.optionTextColor || '#000000';
      const optionRadius = newStyle.optionBorderRadius || 8;
      const resultBarColor = newStyle.resultBarColor || '#F97316';

      const question = newData.question || 'Question?';
      const options = newData.options || [];
      const showResults = newData.showResults || false;

      // Determine layout - handle deeply nested structure: layout.type can be {type: 'horizontal'}
      let layoutValue = newData.layout;
      if (typeof layoutValue === 'object' && layoutValue?.type) {
        layoutValue = typeof layoutValue.type === 'object' ? layoutValue.type.type : layoutValue.type;
      }
      const layout = layoutValue || 'horizontal';
      const isHorizontal = layout === 'horizontal';

      // Calculate positions
      const padding = 16;
      const questionY = padding + 20;
      const optionsStartY = questionY + 20;
      const optionHeight = 36;
      const optionGap = 8;

      let optionsSvg = '';

      if (isHorizontal) {
        // Horizontal layout: 2 columns
        const optionWidth = (width - padding * 2 - optionGap) / 2;
        options.forEach((opt, idx) => {
          const col = idx % 2;
          const row = Math.floor(idx / 2);
          const x = padding + col * (optionWidth + optionGap);
          const y = optionsStartY + row * (optionHeight + optionGap);
          const text = opt.text || opt.label || '';

          // Option background
          optionsSvg += `<rect x="${x}" y="${y}" width="${optionWidth}" height="${optionHeight}" rx="${optionRadius}" fill="${optionBg}" stroke="#e5e7eb" stroke-width="1"/>`;

          // Option text
          optionsSvg += `<text x="${x + optionWidth / 2}" y="${y + optionHeight / 2}" text-anchor="middle" dominant-baseline="middle" fill="${optionText}" font-size="14" font-family="Arial">${escapeXml(text)}</text>`;

          // Result bar if showing results
          if (showResults) {
            const percentage = 0; // Placeholder
            optionsSvg += `<text x="${x + optionWidth - 10}" y="${y + optionHeight / 2}" text-anchor="end" dominant-baseline="middle" fill="${optionText}" font-size="12" opacity="0.7">${percentage}%</text>`;
          }
        });
      } else {
        // Vertical layout: full width
        const optionWidth = width - padding * 2;
        options.forEach((opt, idx) => {
          const x = padding;
          const y = optionsStartY + idx * (optionHeight + optionGap);
          const text = opt.text || opt.label || '';

          // Option background
          optionsSvg += `<rect x="${x}" y="${y}" width="${optionWidth}" height="${optionHeight}" rx="${optionRadius}" fill="${optionBg}" stroke="#e5e7eb" stroke-width="1"/>`;

          // Option text
          optionsSvg += `<text x="${x + optionWidth / 2}" y="${y + optionHeight / 2}" text-anchor="middle" dominant-baseline="middle" fill="${optionText}" font-size="14" font-family="Arial">${escapeXml(text)}</text>`;

          // Result bar if showing results
          if (showResults) {
            const percentage = 0; // Placeholder
            optionsSvg += `<text x="${x + optionWidth - 10}" y="${y + optionHeight / 2}" text-anchor="end" dominant-baseline="middle" fill="${optionText}" font-size="12" opacity="0.7">${percentage}%</text>`;
          }
        });
      }


      newSrc = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(`
        <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
          <rect width="${width}" height="${height}" rx="12" fill="${bgColor}"/>
          <text x="${width / 2}" y="${questionY}" text-anchor="middle" dominant-baseline="middle" fill="${questionColor}" font-size="${questionSize}" font-weight="600" font-family="Arial">${escapeXml(question)}</text>
          ${optionsSvg}
        </svg>
      `)}`;
    } else if (interactiveType === 'quiz') {
      // Quiz SVG generation with nested structure support
      const bgColor = newStyle?.colors?.background || newStyle.containerBgColor || '#FF0000';
      const questionColor = newStyle?.colors?.questionColor || newStyle.questionColor || '#FFFFFF';
      const questionSize = newStyle?.typography?.questionSize || newStyle.questionFontSize || 16;
      const optionBg = newStyle?.colors?.optionBackground || newStyle.optionBgColor || '#F9FAFB';
      const optionTextColor = newStyle?.colors?.optionTextColor || newStyle.optionTextColor || '#1F2937';
      const optionSize = newStyle?.typography?.optionSize || newStyle.optionFontSize || 14;
      const correctColor = newStyle?.colors?.correctColor || newStyle.correctColor || '#10B981';
      const borderRadius = newStyle?.appearance?.radius || newStyle.containerBorderRadius || 16;
      const padding = newStyle?.spacing?.padding || newStyle.containerPadding || 20;
      const optionRadius = newStyle?.spacing?.optionRadius || newStyle.optionBorderRadius || 8;

      const question = newData.question || 'What is the answer?';
      const options = newData.options || [];

      // Calculate positions
      const questionY = padding + 18;
      const optionsStartY = questionY + 30;
      const optionHeight = 34;
      const optionGap = 12;

      let optionsSvg = '';
      options.forEach((opt, idx) => {
        const optY = optionsStartY + idx * (optionHeight + optionGap);
        const text = opt.text || '';
        const letter = String.fromCharCode(65 + idx); // A, B, C...

        // Option pill
        const pillBg = opt.isCorrect ? correctColor : optionBg;
        const borderColor = opt.isCorrect ? correctColor : 'transparent';

        optionsSvg += `<rect x="${padding}" y="${optY}" width="${width - padding * 2}" height="${optionHeight}" rx="${optionRadius}" fill="${pillBg}" stroke="${borderColor}" stroke-width="2"/>`;

        // Letter circle
        optionsSvg += `<circle cx="${padding + 20}" cy="${optY + optionHeight / 2}" r="12" fill="#e5e7eb"/>`;
        optionsSvg += `<text x="${padding + 20}" y="${optY + optionHeight / 2}" text-anchor="middle" dominant-baseline="middle" fill="#1f2937" font-size="11" font-weight="700">${letter}</text>`;

        // Option text
        optionsSvg += `<text x="${padding + 44}" y="${optY + optionHeight / 2}" dominant-baseline="middle" fill="${optionTextColor}" font-size="${optionSize}" font-family="Arial">${escapeXml(text)}</text>`;

        // Checkmark for correct answer
        if (opt.isCorrect) {
          optionsSvg += `<text x="${width - padding - 10}" y="${optY + optionHeight / 2}" text-anchor="end" dominant-baseline="middle" fill="${correctColor}" font-size="16">✓</text>`;
        }
      });

      newSrc = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(`
        <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
          <rect width="${width}" height="${height}" rx="${borderRadius}" fill="${bgColor}"/>
          <text x="${padding + 4}" y="${questionY}" dominant-baseline="middle" fill="${questionColor}" font-size="${questionSize}" font-weight="700" font-family="Arial">${escapeXml(question)}</text>
          ${optionsSvg}
        </svg>
      `)}`;
    } else if (interactiveType === 'rating') {
      // Rating SVG generation with nested structure support
      const bgColor = newStyle?.colors?.background || newStyle.containerBgColor || '#695454';
      const titleColor = newStyle?.colors?.titleColor || newStyle.titleColor || '#000000';
      const titleSize = newStyle?.typography?.titleSize || newStyle.titleFontSize || 14;
      const emojiSize = newStyle?.typography?.emojiSize || newStyle.emojiSize || 32;
      const sliderTrack = newStyle?.colors?.sliderTrack || newStyle.inactiveColor || '#E6E6E6';
      const sliderFill = newStyle?.colors?.sliderFill || newStyle.activeColor || '#F97316';
      const borderRadius = newStyle.radius || newStyle.containerBorderRadius || 12;
      // Use fixed padding for consistent layout (don't use style.padding for layout calculations)
      const padding = 20;

      const title = newData.title || 'Rate this';
      const variant = newData.variant || newData.type || 'slider';
      const emoji = newData.emoji || '😺';
      const maxRating = newData.maxRating || 5;
      const currentRating = newData.currentRating || 3;

      let contentSvg = '';

      // Title
      const titleY = padding + titleSize / 2 + 5;
      contentSvg += `<text x="${width / 2}" y="${titleY}" text-anchor="middle" dominant-baseline="middle" fill="${titleColor}" font-size="${titleSize}" font-weight="600">${escapeXml(title)}</text>`;

      // Rating display based on variant
      const ratingY = titleY + 25;

      if (variant === 'slider') {
        // Slider variant with emoji as thumb
        const sliderWidth = width - padding * 2;
        const sliderHeight = 8;
        const sliderX = padding;
        const fillWidth = (currentRating / maxRating) * sliderWidth;
        const thumbX = sliderX + fillWidth;

        // Define gradient
        contentSvg += `
          <defs>
            <linearGradient id="sliderGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" style="stop-color:#d946ef;stop-opacity:1" />
              <stop offset="100%" style="stop-color:${sliderFill};stop-opacity:1" />
            </linearGradient>
          </defs>
        `;

        contentSvg += `<rect x="${sliderX}" y="${ratingY}" width="${sliderWidth}" height="${sliderHeight}" rx="4" fill="${sliderTrack}"/>`;
        contentSvg += `<rect x="${sliderX}" y="${ratingY}" width="${fillWidth}" height="${sliderHeight}" rx="4" fill="url(#sliderGradient)"/>`;
        // Emoji as slider thumb
        contentSvg += `<text x="${thumbX}" y="${ratingY + 4}" text-anchor="middle" dominant-baseline="middle" font-size="${emojiSize}" style="pointer-events: none;">${emoji}</text>`;
      } else if (variant === 'emoji') {
        // Emoji variant
        const emojiSpacing = (width - padding * 2) / maxRating;
        for (let i = 0; i < maxRating; i++) {
          const emojiX = padding + i * emojiSpacing + emojiSpacing / 2;
          const opacity = i < currentRating ? 1 : 0.3;
          contentSvg += `<text x="${emojiX}" y="${ratingY}" text-anchor="middle" dominant-baseline="middle" font-size="${emojiSize}" opacity="${opacity}">${emoji}</text>`;
        }
      } else {
        // Star variant (default)
        const starSpacing = (width - padding * 2) / maxRating;
        for (let i = 0; i < maxRating; i++) {
          const starX = padding + i * starSpacing + starSpacing / 2;
          const fill = i < currentRating ? sliderFill : sliderTrack;
          contentSvg += `<text x="${starX}" y="${ratingY}" text-anchor="middle" dominant-baseline="middle" font-size="${emojiSize}" fill="${fill}">★</text>`;
        }
      }

      newSrc = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(`
        <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
          <rect width="${width}" height="${height}" rx="${borderRadius}" fill="${bgColor}"/>
          ${contentSvg}
        </svg>
      `)}`;
    } else if (interactiveType === 'question') {
      // Use QuestionRenderer for preview (guarantees match)
      const svgString = renderToStaticMarkup(
        <QuestionRenderer
          data={newData}
          style={newStyle}
          width={width}
          height={height}
        />
      );

      newSrc = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(`
        <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
          <foreignObject width="100%" height="100%">
            <div xmlns="http://www.w3.org/1999/xhtml" style="width:100%;height:100%;">
                ${svgString}
            </div>
          </foreignObject>
        </svg>
      `)}`;
    } else if (interactiveType === 'imageQuiz') {
      // Generate pure SVG for Image Quiz (foreignObject doesn't work with external images)
      const question = newData?.question || 'Which one is correct?';
      const options = newData?.options || [];
      const columns = newData?.columns || 2;
      const correctAnswerId = newData?.correctAnswerId;

      const bgColor = newStyle?.containerBgColor || '#ffffff';
      const questionColor = newStyle?.questionColor || '#1f2937';
      const questionSize = newStyle?.questionFontSize || 16;
      const labelColor = newStyle?.labelColor || '#4b5563';
      const labelSize = newStyle?.labelFontSize || 12;
      const borderRadius = newStyle?.containerBorderRadius || 16;
      const imageBorderRadius = newStyle?.imageBorderRadius || 8;
      const correctBorderColor = newStyle?.correctBorderColor || '#10b981';
      const borderColor = newStyle?.imageBorderColor || '#e5e7eb';
      const padding = newStyle?.containerPadding || 20;

      // Calculate layout
      const questionHeight = 30;
      const gap = 12;
      const gridStartY = padding + questionHeight + gap;
      const availableWidth = width - (padding * 2);
      const optionWidth = (availableWidth - (gap * (columns - 1))) / columns;
      const imageSize = optionWidth;
      const labelHeight = 20;
      const optionHeight = imageSize + gap + labelHeight;

      // Calculate rows
      const rows = Math.ceil(options.length / columns);
      const totalHeight = padding + questionHeight + gap + (rows * optionHeight) + ((rows - 1) * gap) + padding;

      // Build SVG
      let optionsSvg = '';
      options.forEach((option, index) => {
        const row = Math.floor(index / columns);
        const col = index % columns;
        const x = padding + (col * (optionWidth + gap));
        const y = gridStartY + (row * (optionHeight + gap));

        // Image container with border
        const isCorrect = option.id === correctAnswerId;
        const strokeColor = isCorrect ? correctBorderColor : borderColor;
        const strokeWidth = isCorrect ? 3 : 1;

        // Background rect
        optionsSvg += `<rect x="${x}" y="${y}" width="${imageSize}" height="${imageSize}" rx="${imageBorderRadius}" fill="#f3f4f6" stroke="${strokeColor}" stroke-width="${strokeWidth}"/>`;

        // Image if available
        if (option.imageUrl) {
          optionsSvg += `<image x="${x + strokeWidth}" y="${y + strokeWidth}" width="${imageSize - strokeWidth * 2}" height="${imageSize - strokeWidth * 2}" href="${option.imageUrl}" preserveAspectRatio="xMidYMid slice" clip-path="url(#clip-${index})"/>`;
          // Clip path for rounded corners
          optionsSvg += `<defs><clipPath id="clip-${index}"><rect x="${x + strokeWidth}" y="${y + strokeWidth}" width="${imageSize - strokeWidth * 2}" height="${imageSize - strokeWidth * 2}" rx="${imageBorderRadius - strokeWidth}"/></clipPath></defs>`;
        } else {
          // Camera icon placeholder
          optionsSvg += `<text x="${x + imageSize / 2}" y="${y + imageSize / 2}" text-anchor="middle" dominant-baseline="middle" font-size="32">📷</text>`;
        }

        // Label
        const labelY = y + imageSize + gap + labelHeight / 2;
        optionsSvg += `<text x="${x + imageSize / 2}" y="${labelY}" text-anchor="middle" dominant-baseline="middle" fill="${labelColor}" font-size="${labelSize}" font-weight="500">${option.label || ''}`;
        if (isCorrect) {
          optionsSvg += ` <tspan fill="${correctBorderColor}">✓</tspan>`;
        }
        optionsSvg += `</text>`;
      });

      newSrc = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(`
        <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${totalHeight}" viewBox="0 0 ${width} ${totalHeight}">
          <rect width="${width}" height="${totalHeight}" rx="${borderRadius}" fill="${bgColor}"/>
          <text x="${width / 2}" y="${padding + questionHeight / 2}" text-anchor="middle" dominant-baseline="middle" fill="${questionColor}" font-size="${questionSize}" font-weight="700">${question}</text>
          ${optionsSvg}
        </svg>
      `)}`;
    } else {
      const styleDefaults = { ...INTERACTIVE_STYLES[interactiveType], ...newStyle };
      newSrc = generateInteractiveSVG(interactiveType, newData, styleDefaults, dimensions);
    }

    element.set({ src: newSrc, height, width });
  }, [element, interactiveType]);

  // ==================== DATA UPDATE HELPERS ====================

  const updateData = (key, value) => {
    const newData = { ...data, [key]: value };
    element.set({
      custom: {
        ...element.custom,
        data: newData,
      },
    });
    // Regenerate SVG after data update
    regenerateSVG(newData, style);
  };

  const updateStyle = (key, value) => {
    const newStyle = { ...style, [key]: value };
    element.set({
      custom: {
        ...element.custom,
        style: newStyle,
      },
    });
    // Regenerate SVG after style update
    regenerateSVG(data, newStyle);
  };

  // Update nested style properties (for quiz: colors.background, typography.questionSize, etc.)
  const updateNestedStyle = (category, key, value) => {
    const newStyle = {
      ...style,
      [category]: {
        ...(style[category] || {}),
        [key]: value
      }
    };
    element.set({
      custom: {
        ...element.custom,
        style: newStyle,
      },
    });
    // Regenerate SVG after style update
    regenerateSVG(data, newStyle);
  };

  // Update options array
  const updateOptions = (newOptions) => {
    updateData('options', newOptions);
  };

  const addOption = () => {
    const options = data.options || [];
    const newId = `opt${Date.now()} `;
    let newOption;

    if (interactiveType === 'imageQuiz') {
      newOption = { id: newId, imageUrl: '', label: `Option ${options.length + 1}` };
    } else if (interactiveType === 'quiz') {
      newOption = { id: newId, text: `Option ${options.length + 1}` };
    } else {
      const optionText = `Option ${options.length + 1}`;
      newOption = { id: newId, label: optionText, text: optionText, votes: 0 };
    }
    updateOptions([...options, newOption]);
  };

  const removeOption = (id) => {
    const options = data.options || [];
    if (options.length > 2) {
      updateOptions(options.filter(opt => opt.id !== id));
    }
  };

  const updateOption = (id, updates) => {
    const options = data.options || [];
    updateOptions(options.map(opt =>
      opt.id === id ? { ...opt, ...updates } : opt
    ));
  };


  // Handle image upload for Image Quiz - uploads to CDN via API
  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith('image/') || !uploadingOptionId) return;

    try {
      // Upload to CDN and get URL
      const cdnUrl = await storyAPI.uploadGeneralMedia(file);

      // Update the option with the new image URL
      const updatedOptions = (data.options || []).map(opt =>
        opt.id === uploadingOptionId ? { ...opt, imageUrl: cdnUrl } : opt
      );

      // Update the element's custom data (this will automatically regenerate SVG)
      updateOptions(updatedOptions);
      setUploadingOptionId(null);
    } catch (error) {
      console.error('Failed to upload image:', error);
      // Optionally show error to user
    }

    e.target.value = '';
  };

  const triggerImageUpload = (optionId) => {
    setUploadingOptionId(optionId);
    imageInputRef.current?.click();
  };

  // Update emojis for reaction
  const updateEmojis = (newEmojis) => {
    updateData('emojis', newEmojis);
  };

  const setCorrectAnswer = (id) => {
    updateData('correctAnswerId', id);
  };

  // ==================== RENDER HELPERS ====================

  const renderSectionTitle = (title) => (
    <div className="section-title">{title}</div>
  );

  const renderTextInput = (label, value, onChange, placeholder = '', secondaryLabel = '') => (
    <div className="control-row" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: 8, marginBottom: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', marginBottom: 4 }}>
        <span className="control-label" style={{ fontWeight: 500, color: '#333', fontSize: '13px' }}>{label}</span>
        {secondaryLabel && <span style={{ color: '#a0aec0', fontSize: '12px' }}>{secondaryLabel}</span>}
      </div>
      <input
        type="text"
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          width: '100%',
          padding: '10px 14px',
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: 8,
          color: '#2d3748',
          fontSize: '14px',
        }}
      />
    </div>
  );

  const renderTextArea = (label, value, onChange, placeholder = '') => (
    <div className="control-row" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: 8, marginBottom: 20 }}>
      <span className="control-label" style={{ fontWeight: 500, color: '#333', fontSize: '13px', marginBottom: 4 }}>{label}</span>
      <textarea
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={3}
        style={{
          width: '100%',
          padding: '10px 14px',
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: 8,
          color: '#2d3748',
          fontSize: '14px',
          resize: 'vertical',
        }}
      />
    </div>
  );

  const renderNumberInput = (label, value, onChange, min = 0, max = 100) => (
    <div className="control-row" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
      <span className="control-label" style={{ fontWeight: 500, color: '#333', fontSize: '13px' }}>{label}</span>
      <div style={{ width: 80 }}>
        <input
          type="number"
          value={value ?? min}
          onChange={(e) => {
            const val = parseInt(e.target.value);
            if (!isNaN(val) && val >= min && val <= max) {
              onChange(val);
            }
          }}
          onBlur={(e) => {
            const val = parseInt(e.target.value);
            if (isNaN(val) || val < min) {
              onChange(min);
            } else if (val > max) {
              onChange(max);
            }
          }}
          min={min}
          max={max}
          style={{
            width: '100%',
            padding: '8px 12px',
            borderRadius: 8,
            border: '1px solid var(--sidebar-input-border)',
            background: 'var(--sidebar-input-bg)',
            color: 'var(--sidebar-text)',
            fontSize: '13px',
            textAlign: 'center'
          }}
        />
      </div>
    </div>
  );

  const renderColorPicker = (label, value, onChange, defaultColor = '#ffffff') => (
    <div className="control-row" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
      <span className="control-label" style={{ fontWeight: 500, color: '#333', fontSize: '13px' }}>{label}</span>
      <div className="control-value">
        <ColorPicker
          value={value || defaultColor}
          onChange={onChange}
        />
      </div>
    </div>
  );

  const renderToggle = (label, value, onChange) => (
    <div className="control-row" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
      <span className="control-label" style={{ fontWeight: 500, color: '#333', fontSize: '13px' }}>{label}</span>
      <div className="control-value">
        <label className="toggle-switch">
          <input
            type="checkbox"
            checked={value || false}
            onChange={(e) => onChange(e.target.checked)}
          />
          <span className="toggle-slider" />
        </label>
      </div>
    </div>
  );

  const renderSelect = (label, value, onChange, options) => (
    <div className="control-row" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
      <span className="control-label" style={{ fontWeight: 500, color: '#333', fontSize: '13px' }}>{label}</span>
      <div className="control-value" style={{ width: '140px' }}>
        <div className="select-wrapper" style={{ width: '100%' }}>
          <Dropdown
            value={value}
            onChange={onChange}
            options={options}
            placeholder={label}
            ariaLabel={label}
          />
        </div>
      </div>
    </div>
  );

  // ==================== CONTENT TAB RENDERERS ====================

  const renderPollContent = () => (
    <>
      <div className="section">
        {renderTextInput('Question', data.question, (v) => updateData('question', v), 'Enter your question')}
      </div>

      <div className="section" style={{ marginTop: 16 }}>
        {renderSectionTitle('Options')}
        {(data.options || []).map((option, index) => (
          <div key={option.id} style={{
            display: 'flex',
            gap: 8,
            marginBottom: 8,
            alignItems: 'center'
          }}>
            <span style={{
              width: 20,
              fontSize: 11,
              color: 'var(--text-muted)',
              textAlign: 'center'
            }}>
              {index + 1}
            </span>
            <input
              type="text"
              value={option.label ?? option.text ?? ''}
              onChange={(e) => updateOption(option.id, { label: e.target.value, text: e.target.value })}
              style={{
                flex: 1,
                padding: '8px 10px',
                background: 'var(--sidebar-input-bg)',
                border: '1px solid var(--sidebar-input-border)',
                borderRadius: 6,
                color: 'var(--sidebar-text)',
                fontSize: 12,
              }}
            />
            <button
              onClick={() => removeOption(option.id)}
              disabled={(data.options || []).length <= 2}
              style={{
                width: 28,
                height: 28,
                background: 'transparent',
                border: '1px solid var(--border-primary)',
                borderRadius: 4,
                color: 'var(--text-muted)',
                cursor: (data.options || []).length <= 2 ? 'not-allowed' : 'pointer',
                opacity: (data.options || []).length <= 2 ? 0.4 : 1,
              }}
            >
              ×
            </button>
          </div>
        ))}
        <button
          onClick={addOption}
          style={{
            width: '100%',
            padding: '10px',
            background: 'transparent',
            border: '1px dashed var(--border-primary)',
            borderRadius: 6,
            color: 'var(--accent-primary)',
            fontSize: 12,
            cursor: 'pointer',
            marginTop: 8,
          }}
        >
          + Add Option
        </button>
      </div>

      <div className="section" style={{ marginTop: 16 }}>
        {renderSelect('Layout', data.layout?.type || data.layout || 'horizontal', (v) => updateData('layout', { type: v, columns: 2 }), [
          { value: 'horizontal', label: 'Horizontal (2 columns)' },
          { value: 'vertical', label: 'Vertical (full width)' },
        ])}
      </div>

      <div className="section" style={{ marginTop: 16 }}>
        {renderToggle('Show Results', data.showResults, (v) => updateData('showResults', v))}
      </div>
    </>
  );

  const renderQuizContent = () => (
    <>
      <div className="section">
        {renderTextInput('Question', data.question, (v) => updateData('question', v), 'Enter your question')}
      </div>

      <div className="section" style={{ marginTop: 16 }}>
        {renderSectionTitle('Answer Options')}
        {(data.options || []).map((option, index) => (
          <div key={option.id} style={{
            display: 'flex',
            gap: 8,
            marginBottom: 8,
            alignItems: 'center'
          }}>
            <button
              onClick={() => setCorrectAnswer(option.id)}
              style={{
                width: 24,
                height: 24,
                borderRadius: '50%',
                background: data.correctAnswerId === option.id ? '#10b981' : 'transparent',
                border: `2px solid ${data.correctAnswerId === option.id ? '#10b981' : 'var(--border-primary)'} `,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontSize: 12,
              }}
              title="Mark as correct answer"
            >
              {data.correctAnswerId === option.id && '✓'}
            </button>
            <input
              type="text"
              value={option.text ?? ''}
              onChange={(e) => updateOption(option.id, { text: e.target.value })}
              style={{
                flex: 1,
                padding: '8px 10px',
                background: 'var(--sidebar-input-bg)',
                border: '1px solid var(--sidebar-input-border)',
                borderRadius: 6,
                color: 'var(--sidebar-text)',
                fontSize: 12,
              }}
            />
            <button
              onClick={() => removeOption(option.id)}
              disabled={(data.options || []).length <= 2}
              style={{
                width: 28,
                height: 28,
                background: 'transparent',
                border: '1px solid var(--border-primary)',
                borderRadius: 4,
                color: 'var(--text-muted)',
                cursor: (data.options || []).length <= 2 ? 'not-allowed' : 'pointer',
                opacity: (data.options || []).length <= 2 ? 0.4 : 1,
              }}
            >
              ×
            </button>
          </div>
        ))}
        <button
          onClick={addOption}
          style={{
            width: '100%',
            padding: '10px',
            background: 'transparent',
            border: '1px dashed var(--border-primary)',
            borderRadius: 6,
            color: 'var(--accent-primary)',
            fontSize: 12,
            cursor: 'pointer',
            marginTop: 8,
          }}
        >
          + Add Option
        </button>

        <p style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 8 }}>
          Click the circle to mark the correct answer
        </p>
      </div>

      <div className="section" style={{ marginTop: 16 }}>
        {renderToggle('Show Explanation', data.showExplanation, (v) => updateData('showExplanation', v))}

        {data.showExplanation && renderTextArea('Explanation', data.explanation, (v) => updateData('explanation', v), 'Explain the correct answer...')}
      </div>
    </>
  );

  const renderRatingContent = () => (
    <>
      <div className="section">
        {renderTextInput('Title', data.title, (v) => updateData('title', v), 'Do you like my eyes?', 'Tagfic')}

        {renderNumberInput('Max Rating', data.maxRating, (v) => updateData('maxRating', v), 1, 10)}

        <EmojiPickerControl
          label="Emoji"
          value={data.emoji || '😺'}
          onChange={(v) => updateData('emoji', v)}
        />
      </div>

      {data.variant === 'slider' && (
        <div className="section" style={{ marginTop: 16 }}>
          <div className="control-row" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: 8, marginBottom: 20 }}>
            <span className="control-label" style={{ fontWeight: 500, color: '#333', fontSize: '13px', marginBottom: 4 }}>Current Rating</span>
            <div className="control-value" style={{ width: '100%' }}>
              <div className="slider-container">
                <div className="slider-track" style={{ height: 6, background: '#edf2f7' }}>
                  <input
                    type="range"
                    min={0}
                    max={data.maxRating || 5}
                    step={0.1}
                    value={data.currentRating ?? 0}
                    onChange={(e) => updateData('currentRating', parseFloat(e.target.value))}
                    style={{ top: -14 }}
                  />
                  <div className="slider-fill" style={{ width: `${((data.currentRating ?? 0) / (data.maxRating || 5)) * 100}% `, height: '100%' }}>
                    <div className="slider-thumb" style={{ width: 20, height: 20, top: -7, border: '2px solid white', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );

  const renderReactionContent = () => {
    const emojis = data.emojis || ['😍', '🔥', '😂', '😮', '😢'];

    return (
      <>
        <div className="section">
          {renderSectionTitle('Emoji Reactions')}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
            {emojis.map((emoji, index) => (
              <div
                key={index}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                  padding: '6px 10px',
                  background: 'var(--sidebar-input-bg)',
                  borderRadius: 8,
                  border: '1px solid var(--sidebar-input-border)',
                }}
              >
                <input
                  type="text"
                  value={emoji}
                  onChange={(e) => {
                    const newEmojis = [...emojis];
                    newEmojis[index] = e.target.value;
                    updateEmojis(newEmojis);
                  }}
                  style={{
                    width: 30,
                    fontSize: 18,
                    textAlign: 'center',
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--sidebar-text)',
                  }}
                />
                <button
                  onClick={() => {
                    if (emojis.length > 1) {
                      updateEmojis(emojis.filter((_, i) => i !== index));
                    }
                  }}
                  disabled={emojis.length <= 1}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--text-muted)',
                    cursor: emojis.length <= 1 ? 'not-allowed' : 'pointer',
                    fontSize: 12,
                  }}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
          <button
            onClick={() => updateEmojis([...emojis, '👍'])}
            disabled={emojis.length >= 7}
            style={{
              width: '100%',
              padding: '10px',
              background: 'transparent',
              border: '1px dashed var(--border-primary)',
              borderRadius: 6,
              color: 'var(--accent-primary)',
              fontSize: 12,
              cursor: emojis.length >= 7 ? 'not-allowed' : 'pointer',
              opacity: emojis.length >= 7 ? 0.5 : 1,
            }}
          >
            + Add Emoji
          </button>
        </div>

        <div className="section" style={{ marginTop: 16 }}>
          {renderToggle('Show Count', data.showCount, (v) => updateData('showCount', v))}
        </div>
      </>
    );
  };

  const renderCountdownContent = () => (
    <>
      <div className="section">
        {renderTextInput('Title', data.title, (v) => updateData('title', v), 'Ends In')}

        <div className="control-row" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: 6 }}>
          <span className="control-label">End Date</span>
          <input
            type="date"
            value={data.endDate ?? ''}
            onChange={(e) => updateData('endDate', e.target.value)}
            style={{
              width: '100%',
              padding: '10px 12px',
              background: 'var(--sidebar-input-bg)',
              border: '1px solid var(--sidebar-input-border)',
              borderRadius: 6,
              color: 'var(--sidebar-text)',
              fontSize: 12,
            }}
          />
        </div>

        <div className="control-row" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: 6, marginTop: 12 }}>
          <span className="control-label">End Time</span>
          <input
            type="time"
            value={data.endTime || '23:59'}
            onChange={(e) => updateData('endTime', e.target.value)}
            style={{
              width: '100%',
              padding: '10px 12px',
              background: 'var(--sidebar-input-bg)',
              border: '1px solid var(--sidebar-input-border)',
              borderRadius: 6,
              color: 'var(--sidebar-text)',
              fontSize: 12,
            }}
          />
        </div>
      </div>

      <div className="section" style={{ marginTop: 16 }}>
        {renderSectionTitle('Display')}
        {renderToggle('Show Days', data.showDays !== false, (v) => updateData('showDays', v))}
        {renderToggle('Show Hours', data.showHours !== false, (v) => updateData('showHours', v))}
        {renderToggle('Show Minutes', data.showMinutes !== false, (v) => updateData('showMinutes', v))}
        {renderToggle('Show Seconds', data.showSeconds !== false, (v) => updateData('showSeconds', v))}
      </div>
    </>
  );

  const renderPromoContent = () => (
    <>
      <div className="section">
        {renderTextInput('Title', data.title, (v) => updateData('title', v), 'Special Offer')}
        {renderTextInput('Coupon Code', data.couponCode, (v) => updateData('couponCode', v), 'SAVE20')}
        {renderTextArea('Description', data.description, (v) => updateData('description', v), 'Get 20% off your order')}
      </div>

      <div className="section" style={{ marginTop: 16 }}>
        {renderToggle('Show Copy Button', data.showCopyButton !== false, (v) => updateData('showCopyButton', v))}
        {renderToggle('Dashed Border', data.dashedBorder !== false, (v) => updateData('dashedBorder', v))}
      </div>
    </>
  );

  const renderQuestionContent = () => (
    <>
      <div className="section">
        {renderTextInput('Title', data.title, (v) => updateData('title', v), 'Ask me anything')}
        {renderTextInput('Placeholder', data.placeholder, (v) => updateData('placeholder', v), 'Type your answer...')}
        {renderNumberInput('Max Length', data.maxLength, (v) => updateData('maxLength', v), 10, 500)}
      </div>

      <div className="section" style={{ marginTop: 16 }}>
        {renderToggle('Allow Anonymous', data.allowAnonymous !== false, (v) => updateData('allowAnonymous', v))}
      </div>
    </>
  );

  const renderImageQuizContent = () => (
    <>
      <input
        ref={imageInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        style={{ display: 'none' }}
      />

      <div className="section">
        {renderTextInput('Question', data.question, (v) => updateData('question', v), 'Which one is correct?')}

        {renderSelect('Columns', data.columns, (v) => updateData('columns', parseInt(v)), [
          { value: '2', label: '2 Columns' },
          { value: '3', label: '3 Columns' },
          { value: '4', label: '4 Columns' },
        ])}
      </div>

      <div className="section" style={{ marginTop: 16 }}>
        {renderSectionTitle('Image Options')}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          {(data.options || []).map((option) => (
            <div
              key={option.id}
              style={{
                padding: 8,
                background: 'var(--sidebar-input-bg)',
                borderRadius: 8,
                border: `2px solid ${data.correctAnswerId === option.id ? '#10b981' : 'var(--sidebar-input-border)'} `,
              }}
            >
              <div
                onClick={() => triggerImageUpload(option.id)}
                style={{
                  aspectRatio: '1',
                  background: 'var(--bg-tertiary)',
                  borderRadius: 6,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  overflow: 'hidden',
                  marginBottom: 8,
                }}
              >
                {option.imageUrl ? (
                  <img
                    src={option.imageUrl}
                    alt={option.label}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  <span style={{ fontSize: 24, color: 'var(--text-muted)' }}>📷</span>
                )}
              </div>
              <input
                type="text"
                value={option.label ?? ''}
                onChange={(e) => updateOption(option.id, { label: e.target.value })}
                placeholder="Label"
                style={{
                  width: '100%',
                  padding: '6px 8px',
                  background: 'transparent',
                  border: '1px solid var(--border-primary)',
                  borderRadius: 4,
                  color: 'var(--sidebar-text)',
                  fontSize: 11,
                  marginBottom: 6,
                }}
              />
              <div style={{ display: 'flex', gap: 4 }}>
                <button
                  onClick={() => setCorrectAnswer(option.id)}
                  style={{
                    flex: 1,
                    padding: '4px 6px',
                    background: data.correctAnswerId === option.id ? '#10b981' : 'transparent',
                    border: `1px solid ${data.correctAnswerId === option.id ? '#10b981' : 'var(--border-primary)'} `,
                    borderRadius: 4,
                    color: data.correctAnswerId === option.id ? '#fff' : 'var(--text-muted)',
                    fontSize: 9,
                    cursor: 'pointer',
                  }}
                >
                  {data.correctAnswerId === option.id ? '✓ Correct' : 'Mark Correct'}
                </button>
                <button
                  onClick={() => removeOption(option.id)}
                  disabled={(data.options || []).length <= 2}
                  style={{
                    padding: '4px 8px',
                    background: 'transparent',
                    border: '1px solid var(--border-primary)',
                    borderRadius: 4,
                    color: 'var(--text-muted)',
                    fontSize: 10,
                    cursor: (data.options || []).length <= 2 ? 'not-allowed' : 'pointer',
                    opacity: (data.options || []).length <= 2 ? 0.4 : 1,
                  }}
                >
                  ×
                </button>
              </div>
            </div>
          ))}
        </div>
        <button
          onClick={addOption}
          disabled={(data.options || []).length >= 6}
          style={{
            width: '100%',
            padding: '10px',
            background: 'transparent',
            border: '1px dashed var(--border-primary)',
            borderRadius: 6,
            color: 'var(--accent-primary)',
            fontSize: 12,
            cursor: (data.options || []).length >= 6 ? 'not-allowed' : 'pointer',
            marginTop: 12,
            opacity: (data.options || []).length >= 6 ? 0.5 : 1,
          }}
        >
          + Add Option
        </button>
      </div>
    </>
  );

  const renderContentTab = () => {
    switch (interactiveType) {
      case 'poll': return renderPollContent();
      case 'quiz': return renderQuizContent();
      case 'rating': return renderRatingContent();
      case 'reaction': return renderReactionContent();
      case 'countdown': return renderCountdownContent();
      case 'promo': return renderPromoContent();
      case 'question': return renderQuestionContent();
      case 'imageQuiz': return renderImageQuizContent();
      default: return <p style={{ color: 'var(--text-muted)', fontSize: 12 }}>Unknown interactive type</p>;
    }
  };

  // ==================== STYLE TAB ====================

  const renderStyleTab = () => {
    const { style } = element.custom;
    const defaults = INTERACTIVE_STYLES[interactiveType];

    return (
      <>

        <PositionSection element={element} />
        {interactiveType !== 'quiz' && interactiveType !== 'rating' && interactiveType !== 'question' && <AppearanceSection element={element} />}


        <div className="section">
          {renderSectionTitle('Colors & Styling')}

          {/* ... Quiz/Rating blocks ... */}

          {/* Generic Background/Padding for types not handling it themselves */}
          {(interactiveType !== 'quiz' && interactiveType !== 'rating' && interactiveType !== 'question') && (
            <>
              {renderColorPicker('Background', style.background || style.containerBgColor, (v) => updateStyle('containerBgColor', v), defaults.containerBgColor)}
              {renderNumberInput('Padding', style.padding !== undefined ? style.padding : style.containerPadding, (v) => updateStyle('padding', v), 0, 50)}
            </>
          )}

          {/* Type-specific colors for non-quiz types */}
          {(interactiveType === 'poll') && (
            <>
              {renderColorPicker('Question Color', style.questionColor || style.titleColor, (v) => updateStyle('questionColor', v), defaults.questionColor || defaults.titleColor)}
              {renderNumberInput('Question Size', style.questionFontSize || style.titleFontSize, (v) => updateStyle('questionFontSize', v), 10, 48)}
            </>
          )}

          {interactiveType === 'poll' && (
            <>
              {renderColorPicker('Option BG', style.optionBgColor, (v) => updateStyle('optionBgColor', v), defaults.optionBgColor)}
              {renderColorPicker('Option Text', style.optionTextColor, (v) => updateStyle('optionTextColor', v), defaults.optionTextColor)}
              {renderNumberInput('Option Radius', style.optionBorderRadius, (v) => updateStyle('optionBorderRadius', v), 0, 24)}
            </>
          )}

          {interactiveType === 'poll' && renderColorPicker('Result Bar', style.resultBarColor, (v) => updateStyle('resultBarColor', v), defaults.resultBarColor)}


          {interactiveType === 'reaction' && (
            <>
              {renderToggle('Transparent Background', style.transparentBackground, (v) => updateStyle('transparentBackground', v))}
              {!style.transparentBackground && renderColorPicker('Background', style.background || style.containerBgColor, (v) => updateStyle('background', v), '#FFFFFF')}
              {renderNumberInput('Emoji Size', style.emojiSize, (v) => updateStyle('emojiSize', v), 24, 120)}
              {data.showCount && (
                <>
                  {renderColorPicker('Count Color', style.countColor || '#374151', (v) => updateStyle('countColor', v), '#374151')}
                  {renderNumberInput('Count Size', style.countSize || 14, (v) => updateStyle('countSize', v), 10, 48)}
                </>
              )}
              {renderNumberInput('Padding', style.padding !== undefined ? style.padding : 0, (v) => updateStyle('padding', v), 0, 100)}
              {renderNumberInput('Border Radius', style.radius !== undefined ? style.radius : 0, (v) => updateStyle('radius', v), 0, 50)}
            </>
          )}

          {interactiveType === 'countdown' && (
            <>
              {renderColorPicker('Title Color', style.titleColor, (v) => updateStyle('titleColor', v), defaults.titleColor)}
              {renderColorPicker('Digit Color', style.digitColor, (v) => updateStyle('digitColor', v), defaults.digitColor)}
              {renderNumberInput('Digit Size', style.digitSize || style.digitFontSize, (v) => updateStyle('digitSize', v), 16, 72)}
              {renderColorPicker('Digit BG', style.digitBackground || style.digitBgColor, (v) => updateStyle('digitBackground', v), defaults.digitBackground)}
              {renderColorPicker('Label Color', style.labelColor, (v) => updateStyle('labelColor', v), defaults.labelColor)}
              {renderColorPicker('Background', style.background || style.containerBgColor, (v) => updateStyle('background', v), defaults.background)}
              {renderNumberInput('Radius', style.radius !== undefined ? style.radius : style.containerBorderRadius, (v) => updateStyle('radius', v), 0, 50)}
              {renderNumberInput('Padding', style.padding !== undefined ? style.padding : style.containerPadding, (v) => updateStyle('padding', v), 0, 100)}
            </>
          )}

          {interactiveType === 'promo' && (
            <>
              {renderColorPicker('Title Color', style.titleColor, (v) => updateStyle('titleColor', v), defaults.titleColor)}
              {renderColorPicker('Code Color', style.codeColor, (v) => updateStyle('codeColor', v), defaults.codeColor)}
              {renderNumberInput('Code Size', style.codeFontSize, (v) => updateStyle('codeFontSize', v), 14, 48)}
              {renderColorPicker('Code BG', style.codeBgColor, (v) => updateStyle('codeBgColor', v), defaults.codeBgColor)}
              {renderColorPicker('Button BG', style.buttonBgColor, (v) => updateStyle('buttonBgColor', v), defaults.buttonBgColor)}
              {renderColorPicker('Border', style.borderColor, (v) => updateStyle('borderColor', v), defaults.borderColor)}
            </>
          )}

          {interactiveType === 'question' && (
            <>
              {renderColorPicker('Background', style.background, (v) => updateStyle('background', v), '#FFFFFF')}
              {renderNumberInput('Padding', style.padding ?? 20, (v) => updateStyle('padding', v), 0, 50)}
              {renderNumberInput('Radius', style.radius ?? 16, (v) => updateStyle('radius', v), 0, 50)}
              {renderNumberInput('Opacity (%)', Math.round((style.opacity ?? element.opacity ?? 1) * 100), (v) => {
                updateStyle('opacity', v / 100);
              }, 0, 100)}

              {renderColorPicker('Question Color', style.questionColor, (v) => updateStyle('questionColor', v), '#1F2937')}
              {renderNumberInput('Question Size', style.questionSize ?? 20, (v) => updateStyle('questionSize', v), 10, 48)}

              {renderColorPicker('Input BG', style.inputBackground, (v) => updateStyle('inputBackground', v), '#F3F4F6')}
              {renderColorPicker('Input Text', style.inputTextColor, (v) => updateStyle('inputTextColor', v), '#9CA3AF')}
              {renderColorPicker('Submit BG', style.submitBackground, (v) => updateStyle('submitBackground', v), '#F97316')}
            </>
          )}

          {interactiveType === 'imageQuiz' && (
            <>
              {renderColorPicker('Question Color', style.questionColor, (v) => updateStyle('questionColor', v), defaults.questionColor)}
              {renderNumberInput('Image Radius', style.imageBorderRadius, (v) => updateStyle('imageBorderRadius', v), 0, 24)}
              {renderColorPicker('Border Color', style.imageBorderColor, (v) => updateStyle('imageBorderColor', v), defaults.imageBorderColor)}
              {renderColorPicker('Correct Border', style.correctBorderColor, (v) => updateStyle('correctBorderColor', v), defaults.correctBorderColor)}
            </>
          )}
        </div>

        {/* Reset Default Styles Button */}
        <button
          onClick={() => {
            element.set({
              custom: {
                ...element.custom,
                style: { ...INTERACTIVE_STYLES[interactiveType] },
              },
            });
          }}
          style={{
            width: '100%',
            padding: '10px',
            background: 'transparent',
            border: '1px solid var(--border-primary)',
            borderRadius: 6,
            color: 'var(--text-secondary)',
            fontSize: 12,
            cursor: 'pointer',
            marginTop: 8,
          }}
        >
          Reset to Default Styles
        </button>
      </>
    );
  };

  // ==================== MAIN RENDER ====================

  return (
    <div className="settings-panel interactive-settings">
      {/* Type Badge */}
      {/* <div style={{
        padding: '10px 16px',
        background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
        color: '#ffffff',
        fontSize: 12,
        fontWeight: 600,
        textAlign: 'center',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
      }}>
        <span style={{ fontSize: 16 }}>{getInteractiveTypeIcon(interactiveType)}</span>
        <span>{getInteractiveTypeLabel(interactiveType)}</span>
      </div> */}

      {/* Tabs */}
      <div className="sidebar-tabs">
        <button
          className={`sidebar-tab ${activeTab === 'content' ? 'active' : ''}`}
          onClick={() => setActiveTab('content')}
        >
          Content
        </button>
        <button
          className={`sidebar-tab ${activeTab === 'style' ? 'active' : ''}`}
          onClick={() => setActiveTab('style')}
        >
          Style
        </button>
        <button
          className={`sidebar-tab ${activeTab === 'animation' ? 'active' : ''}`}
          onClick={() => setActiveTab('animation')}
        >
          Animate
        </button>
      </div>

      {/* Content */}
      <div className="settings-content">
        {activeTab === 'content' && renderContentTab()}

        {activeTab === 'style' && renderStyleTab()}

        {activeTab === 'animation' && (
          <AnimationSection store={store} element={element} />
        )}

        {/* Duration Section - In scrollable middle content */}
        <div style={{ paddingBottom: 16 }}>
          <DurationSection store={store} element={element} />
        </div>
      </div>

      <div className="settings-footer">
        <div className="action-buttons">
          <button
            className="action-btn delete"
            onClick={() => store.deleteElements([element.id])}
          >
            <span><TrashIcon /></span> Delete
          </button>
        </div>
      </div>
    </div>
  );
});

export default InteractiveSettings;
