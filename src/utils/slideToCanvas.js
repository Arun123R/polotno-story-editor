/**
 * Slide to Canvas Hydrator
 * 
 * CRITICAL ARCHITECTURE:
 * - Backend JSON = instructions
 * - Canvas elements = execution
 * - Instructions do nothing unless executed
 * 
 * This module converts COMPLETE backend slide JSON into Polotno canvas elements:
 * - slide.image → image element (background)
 * - slide.content.text → text elements
 * - slide.content.ctas → CTA elements (rect + text or SVG)
 * - slide.styling → element properties
 * 
 * EVERY JSON field must become a visible canvas element.
 * NO silent fallbacks. NO partial hydration.
 */

// Story preset dimensions (360x640)
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { CountdownRenderer } from '../components/interactive/renderers/CountdownRenderer';
import { QuestionRenderer } from '../components/interactive/renderers/QuestionRenderer';
import { ImageQuizRenderer } from '../components/interactive/renderers/ImageQuizRenderer';
import { PollRenderer } from '../components/interactive/renderers/PollRenderer';

const CANVAS_WIDTH = 360;
const CANVAS_HEIGHT = 640;

/**
 * Generate a unique ID for canvas elements
 */
const generateId = () => Math.random().toString(36).substr(2, 9);

/**
 * Safely parse JSON content
 */
const parseJSON = (data) => {
    if (!data) return {};
    if (typeof data === 'object') return data;
    try {
        return JSON.parse(data);
    } catch (e) {
        console.warn('[slideToCanvas] Failed to parse JSON:', e);
        return {};
    }
};

// ============================================
// ELEMENT CREATORS
// ============================================

/**
 * Create a Polotno image element that fills the canvas (background)
 */
const createImageElement = (imageUrl, slideId) => ({
    id: `img-${slideId}-${generateId()}`,
    type: 'image',
    name: 'background-image',
    x: 0,
    y: 0,
    width: CANVAS_WIDTH,
    height: CANVAS_HEIGHT,
    src: imageUrl,
    locked: false,
    selectable: true,
    draggable: true,
    cropX: 0,
    cropY: 0,
    cropWidth: 1,
    cropHeight: 1,
    custom: {
        role: 'background',
    },
});

/**
 * Create a Polotno video element that fills the canvas (background)
 */
const createVideoElement = (videoUrl, slideId) => ({
    id: `video-${slideId}-${generateId()}`,
    type: 'video',
    name: 'background-video',
    x: 0,
    y: 0,
    width: CANVAS_WIDTH,
    height: CANVAS_HEIGHT,
    src: videoUrl,
    locked: false,
    selectable: true,
    draggable: true,
    autoplay: true,
    loop: true,
    custom: {
        role: 'background',
    },
});

/**
 * Create a Polotno text element from JSON text data
 * 
 * CRITICAL: This executes the JSON instruction into a visible element
 */
const createTextElement = (textData, slideId, index = 0) => {
    // Handle both object format and simple string
    const isObject = typeof textData === 'object' && textData !== null;

    const text = isObject ? (textData.value || textData.text || '') : String(textData);
    const position = isObject ? (textData.position || {}) : {};
    const size = isObject ? (textData.size || {}) : {};
    const font = isObject ? (textData.font || {}) : {};
    const duration = isObject ? textData.duration : null;

    // Default positions if not specified
    const x = position.x ?? 20;
    const y = position.y ?? (100 + index * 60);
    const width = size.width || CANVAS_WIDTH - 40;
    const height = size.height || 50;

    return {
        id: textData?.id || `text-${slideId}-${generateId()}`,
        type: 'text',
        name: `text-${index}`,
        x: x,
        y: y,
        width: width,
        height: height,
        text: text,
        fontSize: font.fontSize || 24,
        fontFamily: font.fontFamily || 'Arial',
        fontStyle: font.fontStyle || 'normal',
        fontWeight: font.fontWeight || 'normal',
        fill: textData?.color || '#000000',
        align: textData?.alignment?.horizontalAlignment || 'left',
        verticalAlign: textData?.alignment?.verticalAlignment || 'top',
        rotation: textData?.rotation || 0,
        locked: false,
        selectable: true,
        draggable: true,
        custom: {
            role: 'text',
            originalId: textData?.id,
            duration: duration,
        },
    };
};

/**
 * Create a Polotno CTA element from JSON CTA data
 * 
 * CRITICAL: This executes the CTA JSON instruction into visible elements
 * CTA = button with text, redirect URL, and styling
 */
const createCtaElement = (ctaData, slideId, index = 0) => {
    const ctaType = ctaData.type || 'classic';
    const content = ctaData.content || {};
    const styling = ctaData.styling || {};

    // Position defaults
    const position = styling.position || {};
    const size = styling.size || {};
    const x = position.x ?? 100;
    const y = position.y ?? (CANVAS_HEIGHT - 100 - index * 60);
    const width = size.width || 160;
    const height = size.height || 48;

    // For classic/swipeUp CTAs, create an SVG element
    // Polotno SVG elements allow complex shapes with text

    const bgColor = styling.background || '#F97316';
    const textColor = styling.textColor || '#FFFFFF';
    const fontSize = styling.fontSize || 16;
    const borderRadius = styling.borderRadius || 8;
    const text = content.text || 'Shop Now';

    // Create SVG for CTA button
    const isSwipeUp = ctaType === 'swipe_up' || styling.arrowAnimation;
    const arrowColor = styling.arrowColor || textColor;

    let arrowSvg = '';
    if (isSwipeUp) {
        // Bouncing Arrow (Chevron Up)
        // Centered horizontally, positioned slightly above center
        const arrowY = height / 2 - (fontSize / 2) - 5;

        arrowSvg = `
            <path d="M${width / 2 - 6} ${arrowY} L${width / 2} ${arrowY - 6} L${width / 2 + 6} ${arrowY}" 
                  stroke="${arrowColor}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none">
                ${styling.arrowAnimation ? '<animateTransform attributeName="transform" type="translate" values="0 0; 0 -4; 0 0" dur="1.5s" repeatCount="indefinite" />' : ''}
            </path>
            <!-- Second chevron for double arrow effect if needed, simplistic for now -->
        `;
    }

    const svgContent = `
        <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
            <rect x="0" y="0" width="${width}" height="${height}" rx="${borderRadius}" ry="${borderRadius}" fill="${bgColor}" />
            ${arrowSvg}
            <text x="50%" y="${isSwipeUp ? '65%' : '50%'}" dominant-baseline="middle" text-anchor="middle" fill="${textColor}" font-size="${fontSize}" font-family="Arial" style="pointer-events: none;">${escapeXml(text)}</text>
        </svg>
    `;

    return {
        id: ctaData.id || `cta-${slideId}-${generateId()}`,
        type: 'svg',
        name: `cta-${ctaType}-${index}`,
        x: x,
        y: y,
        width: width,
        height: height,
        src: `data:image/svg+xml;utf8,${encodeURIComponent(svgContent.trim())}`,
        rotation: styling.rotation || 0,
        opacity: styling.opacity ?? 1,
        locked: false,
        selectable: true,
        draggable: true,
        custom: {
            role: 'cta',
            ctaType: ctaType,
            // Store ALL semantic data in custom for save
            text: text,
            redirectUrl: content.redirectUrl || '',
            bgColor: bgColor,
            textColor: textColor,
            fontSize: fontSize,
            borderRadius: borderRadius,
            // Product card fields
            title: content.productTitle || '',
            price: content.price || '',
            description: content.description || '',
            originalPrice: content.originalPrice || '',
            imageUrl: content.imageUrl || '',
        },
    };
};

/**
 * Escape XML special characters for SVG text
 */
const escapeXml = (text) => {
    return String(text)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
};

// ============================================
// MAIN: BUILD PAGE FROM SLIDE
// ============================================

/**
 * Convert a single backend slide into a complete Polotno page object
 * 
 * CRITICAL: This function hydrates ALL JSON data into canvas elements
 * - Image is OPTIONAL, not primary
 * - Text and CTAs are explicitly converted
 * - No silent fallbacks
 * 
 * @param {Object} slide - Backend slide data
 * @returns {Object} Polotno page object with all elements
 */
export const buildPageFromSlide = (slide) => {
    if (!slide) {
        console.error('[slideToCanvas] Cannot build page from null slide');
        return null;
    }

    const slideId = slide.id || generateId();
    const children = [];

    console.log(`[slideToCanvas] Building page from slide ${slideId}...`);

    // Parse content and styling
    const content = parseJSON(slide.content);
    const styling = parseJSON(slide.styling);

    console.log(`[slideToCanvas] Slide content:`, content);
    console.log(`[slideToCanvas] Slide styling:`, styling);

    // ============================================
    // STEP 1: Apply background image/video (OPTIONAL)
    // ============================================
    let imageUrl = null;
    let videoUrl = null;

    // Check direct properties first
    if (slide.video && typeof slide.video === 'string' && slide.video.length > 0) {
        videoUrl = slide.video;
    } else if (slide.image && typeof slide.image === 'string' && slide.image.length > 0) {
        imageUrl = slide.image;
    }

    // Check content object as fallback
    if (!videoUrl && !imageUrl) {
        if (content.video && typeof content.video === 'string' && content.video.length > 0) {
            videoUrl = content.video;
        } else if (content.image && typeof content.image === 'string' && content.image.length > 0) {
            imageUrl = content.image;
        }
    }

    if (videoUrl) {
        children.push(createVideoElement(videoUrl, slideId));
        console.log(`[slideToCanvas] ✓ Created VIDEO element`);
    } else if (imageUrl) {
        children.push(createImageElement(imageUrl, slideId));
        console.log(`[slideToCanvas] ✓ Created IMAGE element`);
    } else {
        console.log(`[slideToCanvas] ⚠ No background media for slide ${slideId}`);
    }

    // ============================================
    // STEP 2: Apply text elements from JSON (CRITICAL)
    // ============================================
    if (content.text) {
        const textArray = Array.isArray(content.text) ? content.text : [content.text];

        textArray.forEach((textData, index) => {
            if (textData) {
                const textElement = createTextElement(textData, slideId, index);
                children.push(textElement);
                console.log(`[slideToCanvas] ✓ Created TEXT element ${index}:`, textData);
            }
        });
    }

    // Also check for button_text (legacy format)
    if (content.button_text && !content.ctas?.length) {
        // Create a simple text element for legacy button text
        children.push(createTextElement({
            value: content.button_text,
            position: { x: 20, y: CANVAS_HEIGHT - 80 },
            font: { fontSize: 16 },
            color: '#000000',
        }, slideId, 100));
        console.log(`[slideToCanvas] ✓ Created legacy BUTTON_TEXT element`);
    }

    // ============================================
    // STEP 3: Apply CTA elements from JSON (CRITICAL)
    // ============================================
    // STRATEGY: Try all CTA formats (Keyed > Array > Legacy)
    let ctasFound = false;

    // 1. KEYED FORMAT (cta1, cta2...) - NEW STANDARD
    for (let i = 1; i <= 5; i++) {
        const key = `cta${i}`;
        if (content[key]) {
            const ctaContent = content[key];
            const ctaStyling = styling[key] || {};
            const type = ctaContent.type || 'classic';

            const ctaData = {
                id: `cta-${slideId}-${key}`,
                type: type,
                content: ctaContent,
                styling: ctaStyling
            };

            // Ensure we pass a valid index for positioning defaults if needed
            children.push(createCtaElement(ctaData, slideId, i - 1));
            console.log(`[slideToCanvas] ✓ Created CTA element from ${key}`);
            ctasFound = true;
        }
    }

    // 2. ARRAY FORMAT (content.ctas) - Fallback
    if (!ctasFound && content.ctas && Array.isArray(content.ctas)) {
        content.ctas.forEach((ctaData, index) => {
            if (ctaData) {
                const ctaElement = createCtaElement(ctaData, slideId, index);
                children.push(ctaElement);
                console.log(`[slideToCanvas] ✓ Created CTA element ${index}:`, ctaData.type || 'classic');
                ctasFound = true;
            }
        });
    }

    // 3. LEGACY SINGLE CTA - Fallback
    if (!ctasFound && styling.cta && Object.keys(styling.cta).length > 0) {
        // Legacy single CTA format
        const legacyCta = {
            type: 'classic',
            content: {
                text: content.button_text || 'Click Here',
                redirectUrl: content.link || '',
            },
            styling: {
                position: { x: 100, y: CANVAS_HEIGHT - 80 },
                size: { width: 160, height: 48 },
                background: styling.cta.container?.backgroundColor || '#F97316',
                textColor: styling.cta.text?.color || '#FFFFFF',
                fontSize: styling.cta.text?.fontSize || 16,
                borderRadius: styling.cta.cornerRadius?.topLeft || 8,
            },
        };
        children.push(createCtaElement(legacyCta, slideId, 0));
        console.log(`[slideToCanvas] ✓ Created legacy CTA element`);
    }

    // ============================================
    // STEP 4: Apply Poll elements
    // ============================================
    if (content.poll) {
        const pollContent = content.poll;
        const pollStyling = styling.poll || {};

        console.log(`[slideToCanvas] Creating Poll element`);

        // 1. Map Data to PollRenderer format
        // Handle nested layout structure: layout.type can be {type: 'horizontal'} or 'horizontal'
        const rawLayoutType = pollContent.layout?.type;
        const layoutType = typeof rawLayoutType === 'object' ? rawLayoutType?.type : rawLayoutType;

        const pollData = {
            question: pollContent.question || '',
            options: (pollContent.options || []).map(o => ({
                id: o.id,
                text: o.text,
                votes: 0
            })),
            showResults: pollContent.showResults || false,
            layout: layoutType || 'horizontal'
        };

        // 2. Map Styling to PollRenderer format
        const pollStyle = {
            containerBgColor: pollStyling.background || '#ffffff',
            containerBorderRadius: pollStyling.radius || 12,
            containerPadding: pollStyling.padding || 16,
            questionColor: pollStyling.question?.color || '#000000',
            questionFontSize: pollStyling.question?.fontSize || 16,
            optionBgColor: pollStyling.options?.background || '#ffffff',
            optionTextColor: pollStyling.options?.textColor || '#000000',
            optionBorderRadius: pollStyling.options?.radius || 8,
            optionFontSize: 14,
            resultBarColor: pollStyling.resultBarColor || '#F97316'
        };

        // 3. Geometry - ensure minimum height for polls
        let width = pollStyling.size?.width || 280;
        let height = pollStyling.size?.height || 110;

        // Calculate minimum height based on options count and layout
        if (pollContent.options) {
            const optionCount = pollContent.options.length;
            // Handle nested layout structure
            const rawLayout = pollContent.layout?.type;
            const layoutTypeForHeight = typeof rawLayout === 'object' ? rawLayout?.type : rawLayout;
            const isHorizontal = (layoutTypeForHeight || 'horizontal') === 'horizontal';

            const padding = 16;
            const questionHeight = 40;
            const optionHeight = 36;
            const optionGap = 8;

            let minHeight;
            if (isHorizontal) {
                const rows = Math.ceil(optionCount / 2);
                minHeight = padding + questionHeight + (rows * optionHeight) + ((rows - 1) * optionGap) + padding;
            } else {
                minHeight = padding + questionHeight + (optionCount * optionHeight) + ((optionCount - 1) * optionGap) + padding;
            }

            if (height < minHeight) {
                console.log(`[slideToCanvas] ⚠️ Height ${height}px too small for ${optionCount} options (${layoutType}), using ${minHeight}px`);
                height = minHeight;
            }
        }

        const x = pollStyling.position?.x || 50;
        const y = pollStyling.position?.y || 200;

        // 4. Generate pure SVG (foreignObject doesn't work reliably in data URLs)
        let svgSrc = '';

        const bgColor = pollStyle.containerBgColor || '#ffffff';
        const questionColor = pollStyle.questionColor || '#000000';
        const questionSize = pollStyle.questionFontSize || 16;
        const optionBg = pollStyle.optionBgColor || '#ffffff';
        const optionTextColor = pollStyle.optionTextColor || '#000000';
        const optionRadius = pollStyle.optionBorderRadius || 8;

        const question = pollData.question || 'Question?';
        const options = pollData.options || [];
        const showResults = pollData.showResults || false;

        // Handle deeply nested layout structure: layout.type can be an object {type: 'horizontal'}
        let layoutValue = pollData.layout;
        if (typeof layoutValue === 'object' && layoutValue?.type) {
            // layout.type could be {type: 'horizontal'} or 'horizontal'
            layoutValue = typeof layoutValue.type === 'object' ? layoutValue.type.type : layoutValue.type;
        }
        const layout = layoutValue || 'horizontal';
        const isHorizontal = layout === 'horizontal';

        console.log('[slideToCanvas] Poll layout:', layout, 'isHorizontal:', isHorizontal);

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
                const optX = padding + col * (optionWidth + optionGap);
                const optY = optionsStartY + row * (optionHeight + optionGap);
                const text = opt.text || opt.label || '';

                optionsSvg += `<rect x="${optX}" y="${optY}" width="${optionWidth}" height="${optionHeight}" rx="${optionRadius}" fill="${optionBg}" stroke="#e5e7eb" stroke-width="1"/>`;
                optionsSvg += `<text x="${optX + optionWidth / 2}" y="${optY + optionHeight / 2}" text-anchor="middle" dominant-baseline="middle" fill="${optionTextColor}" font-size="14" font-family="Arial">${escapeXml(text)}</text>`;
            });
        } else {
            // Vertical layout: full width
            const optionWidth = width - padding * 2;
            options.forEach((opt, idx) => {
                const optX = padding;
                const optY = optionsStartY + idx * (optionHeight + optionGap);
                const text = opt.text || opt.label || '';

                optionsSvg += `<rect x="${optX}" y="${optY}" width="${optionWidth}" height="${optionHeight}" rx="${optionRadius}" fill="${optionBg}" stroke="#e5e7eb" stroke-width="1"/>`;
                optionsSvg += `<text x="${optX + optionWidth / 2}" y="${optY + optionHeight / 2}" text-anchor="middle" dominant-baseline="middle" fill="${optionTextColor}" font-size="14" font-family="Arial">${escapeXml(text)}</text>`;
            });
        }

        svgSrc = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(`
            <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
                <rect width="${width}" height="${height}" rx="12" fill="${bgColor}"/>
                <text x="${width / 2}" y="${questionY}" text-anchor="middle" dominant-baseline="middle" fill="${questionColor}" font-size="${questionSize}" font-weight="600" font-family="Arial">${escapeXml(question)}</text>
                ${optionsSvg}
            </svg>
        `)}`;

        // 5. Create element with internal schema structure for editing
        children.push({
            id: `poll-${slideId}`,
            type: 'svg',
            x: x,
            y: y,
            width: width,
            height: height,
            src: svgSrc,
            custom: {
                kind: 'interactive',
                interactiveType: 'poll',
                data: pollData,
                style: pollStyle
            }
        });
    }

    // ============================================
    // STEP 5: Apply Quiz elements
    // ============================================
    if (content.quiz) {
        const quizContent = content.quiz;
        const quizStyling = styling.quiz || {};

        console.log(`[slideToCanvas] Creating Quiz element`);

        // 1. Map Data to QuizRenderer format
        const quizData = {
            question: quizContent.question || '',
            options: (quizContent.options || []).map(o => ({
                id: o.id,
                text: o.text,
                isCorrect: !!o.isCorrect
            })),
            showExplanation: quizContent.showExplanation || false,
            duration: quizContent.duration || { start: 0, end: 5 }
        };

        // 2. Map Styling to QuizRenderer format (nested structure)
        const quizStyle = {
            // Support both nested and flat structures
            colors: {
                background: quizStyling.colors?.background || quizStyling.background || '#FF0000',
                questionColor: quizStyling.colors?.questionColor || quizStyling.questionColor || '#FFFFFF',
                optionBackground: quizStyling.colors?.optionBackground || quizStyling.optionBackground || '#F9FAFB',
                optionTextColor: quizStyling.colors?.optionTextColor || quizStyling.optionTextColor || '#1F2937',
                correctColor: quizStyling.colors?.correctColor || quizStyling.correctColor || '#10B981',
                incorrectColor: quizStyling.colors?.incorrectColor || quizStyling.incorrectColor || '#EF4444'
            },
            typography: {
                questionSize: quizStyling.typography?.questionSize || quizStyling.questionSize || 16,
                optionSize: quizStyling.typography?.optionSize || quizStyling.optionSize || 14
            },
            spacing: {
                padding: quizStyling.spacing?.padding || quizStyling.padding || 20,
                optionRadius: quizStyling.spacing?.optionRadius || quizStyling.optionRadius || 8
            },
            appearance: {
                opacity: quizStyling.appearance?.opacity ?? quizStyling.opacity ?? 1,
                radius: quizStyling.appearance?.radius || quizStyling.radius || 16
            }
        };

        // 3. Geometry
        let width = quizStyling.size?.width || 280;
        let height = quizStyling.size?.height || 214;

        // Calculate minimum height based on options count
        if (quizContent.options) {
            const optionCount = quizContent.options.length;
            const padding = quizStyle.spacing.padding;
            const questionHeight = 35;
            const optionHeight = 34;
            const optionGap = 12;
            const bottomPadding = 18;

            const minHeight = padding + questionHeight + 15 + (optionCount * optionHeight) + ((optionCount - 1) * optionGap) + bottomPadding;

            if (height < minHeight) {
                console.log(`[slideToCanvas] ⚠️ Height ${height}px too small for ${optionCount} quiz options, using ${minHeight}px`);
                height = minHeight;
            }
        }

        const x = quizStyling.position?.x || 40;
        const y = quizStyling.position?.y || 200;

        // 4. Generate SVG for quiz
        const bgColor = quizStyle.colors.background;
        const questionColor = quizStyle.colors.questionColor;
        const questionSize = quizStyle.typography.questionSize;
        const optionBg = quizStyle.colors.optionBackground;
        const optionTextColor = quizStyle.colors.optionTextColor;
        const optionSize = quizStyle.typography.optionSize;
        const correctColor = quizStyle.colors.correctColor;
        const borderRadius = quizStyle.appearance.radius;
        const padding = quizStyle.spacing.padding;
        const optionRadius = quizStyle.spacing.optionRadius;

        const question = quizData.question || 'What is the answer?';
        const options = quizData.options || [];

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

        const svgSrc = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(`
            <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
                <rect width="${width}" height="${height}" rx="${borderRadius}" fill="${bgColor}"/>
                <text x="${padding + 4}" y="${questionY}" dominant-baseline="middle" fill="${questionColor}" font-size="${questionSize}" font-weight="700" font-family="Arial">${escapeXml(question)}</text>
                ${optionsSvg}
            </svg>
        `)}`;

        // 5. Create element with internal schema structure for editing
        children.push({
            id: `quiz-${slideId}`,
            type: 'svg',
            x: x,
            y: y,
            width: width,
            height: height,
            src: svgSrc,
            custom: {
                kind: 'interactive',
                interactiveType: 'quiz',
                data: quizData,
                style: quizStyle
            }
        });

        console.log(`[slideToCanvas] ✓ Created Quiz element`);
    }

    // ============================================
    // STEP 6: Apply Rating elements
    // ============================================
    if (content.rating) {
        const ratingContent = content.rating;
        const ratingStyling = styling.rating || {};

        console.log(`[slideToCanvas] Creating Rating element`);

        // 1. Map Data
        const ratingData = {
            type: 'rating',
            variant: ratingContent.variant || 'slider',
            title: ratingContent.title || '',
            maxRating: ratingContent.maxRating || 5,
            emoji: ratingContent.emoji || '😺',
            currentRating: ratingContent.currentRating || 3
        };

        // 2. Map Styling (nested structure)
        const ratingStyle = {
            colors: {
                background: ratingStyling.colors?.background || ratingStyling.background || '#695454',
                cardBackground: ratingStyling.colors?.cardBackground || ratingStyling.cardBackground || '#863232',
                titleColor: ratingStyling.colors?.titleColor || ratingStyling.titleColor || '#000000',
                sliderTrack: ratingStyling.colors?.sliderTrack || ratingStyling.sliderTrack || '#E6E6E6',
                sliderFill: ratingStyling.colors?.sliderFill || ratingStyling.sliderFill || '#F97316'
            },
            typography: {
                titleSize: ratingStyling.typography?.titleSize || ratingStyling.titleSize || 14,
                emojiSize: ratingStyling.typography?.emojiSize || ratingStyling.emojiSize || 32
            },
            radius: ratingStyling.radius || 12,
            padding: ratingStyling.padding || 36
        };

        // 3. Geometry
        const width = ratingStyling.size?.width || 237;
        const height = ratingStyling.size?.height || 90;
        const x = ratingStyling.position?.x || 62;
        const y = ratingStyling.position?.y || 261;

        // 4. Generate SVG for rating
        const bgColor = ratingStyle.colors.background;
        const cardBg = ratingStyle.colors.cardBackground;
        const titleColor = ratingStyle.colors.titleColor;
        const titleSize = ratingStyle.typography.titleSize;
        const emojiSize = ratingStyle.typography.emojiSize;
        const sliderTrack = ratingStyle.colors.sliderTrack;
        const sliderFill = ratingStyle.colors.sliderFill;
        const borderRadius = ratingStyle.radius;
        // Use fixed padding for consistent layout
        const padding = 20;

        const title = ratingData.title || 'Rate this';
        const variant = ratingData.variant;
        const emoji = ratingData.emoji;
        const maxRating = ratingData.maxRating;
        const currentRating = ratingData.currentRating;

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

        const svgSrc = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(`
            <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
                <rect width="${width}" height="${height}" rx="${borderRadius}" fill="${bgColor}"/>
                ${contentSvg}
            </svg>
        `)}`;

        // 5. Create element
        children.push({
            id: `rating-${slideId}`,
            type: 'svg',
            x: x,
            y: y,
            width: width,
            height: height,
            src: svgSrc,
            custom: {
                kind: 'interactive',
                interactiveType: 'rating',
                data: ratingData,
                style: ratingStyle
            }
        });

        console.log(`[slideToCanvas] ✓ Created Rating element`);
    }

    // ============================================
    // STEP 7: Apply Reaction elements
    // ============================================
    if (content.reaction) {
        const reactionContent = content.reaction;
        const reactionStyling = styling.reaction || {};

        console.log(`[slideToCanvas] Creating Reaction element`);

        // 1. Map Data
        const reactionData = {
            type: 'reaction',
            emojis: reactionContent.emojis || ['👍', '👎'],
            showCount: reactionContent.showCount || false,
            duration: reactionContent.duration || { start: 0, end: 5 }
        };

        // 2. Map Styling
        const reactionStyle = {
            background: reactionStyling.background || '#FFFFFF',
            transparentBackground: reactionStyling.transparentBackground || false,
            padding: reactionStyling.padding !== undefined ? reactionStyling.padding : 0,
            emojiSize: reactionStyling.emojiSize || 48,
            radius: reactionStyling.radius !== undefined ? reactionStyling.radius : 0,
            countColor: reactionStyling.countColor || '#374151',
            countSize: reactionStyling.countSize || 14
        };

        // 3. Geometry
        const width = reactionStyling.size?.width || 280;
        let height = reactionStyling.size?.height || 64;
        if (reactionData.showCount && height < 100) {
            height = 100;
        }
        const x = reactionStyling.position?.x || 40;
        const y = reactionStyling.position?.y || 276;

        // 4. Generate SVG
        const bgColor = reactionStyle.background;
        const transparentBg = reactionStyle.transparentBackground;
        const emojiSize = reactionStyle.emojiSize;
        const countColor = reactionStyle.countColor || '#374151';
        const countSize = reactionStyle.countSize || 14;
        const radius = reactionStyle.radius;
        const emojis = reactionData.emojis;

        // Layout logic
        const gap = 20;
        const totalContentWidth = emojis.length * emojiSize + (emojis.length - 1) * gap;
        const startX = (width - totalContentWidth) / 2;
        const centerY = height / 2;

        const showCount = reactionData.showCount;

        let contentSVG = '';
        emojis.forEach((emoji, index) => {
            const ex = startX + index * (emojiSize + gap) + emojiSize / 2;

            if (showCount) {
                contentSVG += `<text x="${ex}" y="${centerY - 4}" text-anchor="middle" dominant-baseline="middle" font-size="${emojiSize}" style="pointer-events: none;">${emoji}</text>`;
                contentSVG += `<text x="${ex}" y="${centerY + 24}" text-anchor="middle" dominant-baseline="middle" font-size="${countSize}" font-family="Arial, sans-serif" font-weight="600" fill="${countColor}">0</text>`;
            } else {
                contentSVG += `<text x="${ex}" y="${centerY + 2}" text-anchor="middle" dominant-baseline="middle" font-size="${emojiSize}" style="pointer-events: none;">${emoji}</text>`;
            }
        });

        const bgRect = transparentBg ? '' : `<rect width="${width}" height="${height}" rx="${radius}" fill="${bgColor}" />`;

        const svgSrc = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(`
            <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
                ${bgRect}
                ${contentSVG}
            </svg>
        `)}`;

        // 5. Create element
        children.push({
            id: reactionContent.id || `reaction-${slideId}`,
            type: 'svg',
            x: x,
            y: y,
            width: width,
            height: height,
            src: svgSrc,
            custom: {
                kind: 'interactive',
                interactiveType: 'reaction',
                data: reactionData,
                style: reactionStyle
            }
        });
        console.log(`[slideToCanvas] ✓ Created Reaction element`);
    }

    // STEP 8: Apply Countdown elements
    // ============================================
    if (content.countdown) {
        const countdownContent = content.countdown;
        const countdownStyling = styling.countdown || {};

        console.log(`[slideToCanvas] Creating Countdown element`);

        const width = countdownStyling.size?.width || 360;
        const height = countdownStyling.size?.height || 140;
        const x = countdownStyling.position?.x || 0;
        const y = countdownStyling.position?.y || 180;

        // Generate unique ID to avoid conflicts (ignoring user payload ID)
        const elementId = `countdown-${slideId}-${Math.floor(Math.random() * 100000)}`;

        const countdownData = {
            title: countdownContent.title,
            endDate: countdownContent.endDate,
            endTime: countdownContent.endTime,
            showDays: countdownContent.display?.showDays,
            showHours: countdownContent.display?.showHours,
            showMinutes: countdownContent.display?.showMinutes,
            showSeconds: countdownContent.display?.showSeconds,
            duration: countdownContent.duration
        };

        const countdownStyle = {
            titleColor: countdownStyling.titleColor || '#1f2937',
            digitColor: countdownStyling.digitColor || '#1f2937',
            digitSize: countdownStyling.digitSize || 28,
            digitBackground: countdownStyling.digitBackground || '#000000',
            labelColor: countdownStyling.labelColor || '#9ca3af',
            background: countdownStyling.background || '#ffffff',
            radius: countdownStyling.radius !== undefined ? countdownStyling.radius : 12,
            padding: countdownStyling.padding !== undefined ? countdownStyling.padding : 16,
        };

        // Generate SVG using the React Renderer (visual fidelity)
        const svgString = renderToStaticMarkup(
            React.createElement(CountdownRenderer, {
                data: countdownData,
                style: countdownStyle,
                width: width,
                height: height
            })
        );

        const svgSrc = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(`
            <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
                <foreignObject width="100%" height="100%">
                    <div xmlns="http://www.w3.org/1999/xhtml" style="width:100%;height:100%;">
                        ${svgString}
                    </div>
                </foreignObject>
            </svg>
        `)}`;

        children.push({
            id: elementId,
            type: 'svg', // Use 'svg' instead of 'interactive' to support Store validation
            x: x,
            y: y,
            width: width,
            height: height,
            rotation: countdownStyling.rotation || 0,
            opacity: countdownStyling.opacity !== undefined ? countdownStyling.opacity : 1,
            src: svgSrc,
            custom: {
                kind: 'interactive',
                interactiveType: 'countdown',
                data: countdownData,
                style: countdownStyle
            }
        });
    }

    // STEP 9: Apply Question elements
    // ============================================
    if (content.question) {
        const qContent = content.question;
        const qStyling = styling.question || {};

        console.log(`[slideToCanvas] Creating Question element`);

        const width = qStyling.size?.width || 280;
        const height = qStyling.size?.height || 160;
        const x = qStyling.position?.x || 40;
        const y = qStyling.position?.y || 240;

        const elementId = `question-${slideId}-${Math.floor(Math.random() * 100000)}`;

        const qData = {
            title: qContent.title,
            placeholder: qContent.placeholder,
            maxLength: qContent.maxLength,
            allowAnonymous: qContent.allowAnonymous,
            duration: qContent.duration
        };

        const qStyle = {
            background: qStyling.background || '#FFFFFF',
            radius: qStyling.radius !== undefined ? qStyling.radius : 16,
            padding: qStyling.padding !== undefined ? qStyling.padding : 20,
            questionColor: qStyling.questionColor || '#1F2937',
            questionSize: qStyling.questionSize || 16,
            inputBackground: qStyling.inputBackground || '#F3F4F6',
            inputTextColor: qStyling.inputTextColor || '#9CA3AF',
            submitBackground: qStyling.submitBackground || '#F97316'
        };

        const svgString = renderToStaticMarkup(
            React.createElement(QuestionRenderer, {
                data: qData,
                style: qStyle,
                width: width,
                height: height
            })
        );

        const svgSrc = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(`
            <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
                <foreignObject width="100%" height="100%">
                    <div xmlns="http://www.w3.org/1999/xhtml" style="width:100%;height:100%;">
                        ${svgString}
                    </div>
                </foreignObject>
            </svg>
        `)}`;

        children.push({
            id: elementId,
            type: 'svg', // Use 'svg' to avoid Store validation error
            x: x,
            y: y,
            width: width,
            height: height,
            rotation: qStyling.rotation || 0,
            opacity: qStyling.opacity !== undefined ? qStyling.opacity : 1,
            src: svgSrc,
            custom: {
                kind: 'interactive',
                interactiveType: 'question',
                data: qData,
                style: qStyle
            }
        });
    }

    // STEP 10: Apply Image Quiz elements
    // ============================================
    if (content.imageQuiz) {
        const iqContent = content.imageQuiz;
        const iqStyling = styling.imageQuiz || {};

        console.log(`[slideToCanvas] Creating Image Quiz element`);

        const width = iqStyling.size?.width || 300;
        const height = iqStyling.size?.height || 240;
        const x = iqStyling.position?.x || 0;
        const y = iqStyling.position?.y || 0;

        const elementId = `image-quiz-${slideId}-${Math.floor(Math.random() * 100000)}`;

        const iqData = {
            question: iqContent.question,
            options: iqContent.options,
            layout: iqContent.layout,
            columns: 2,
            duration: iqContent.duration
        };

        const iqStyle = {
            background: iqStyling.background || '#FFFFFF',
            radius: iqStyling.radius !== undefined ? iqStyling.radius : 16,
            padding: iqStyling.padding !== undefined ? iqStyling.padding : 20,
            questionColor: iqStyling.questionColor || '#1F2937',
            imageRadius: iqStyling.imageRadius !== undefined ? iqStyling.imageRadius : 8,
            borderColor: iqStyling.borderColor || '#E5E7EB',
            correctBorderColor: iqStyling.correctBorderColor || '#10B981'
        };

        const svgString = renderToStaticMarkup(
            React.createElement(ImageQuizRenderer, {
                data: iqData,
                style: iqStyle,
                width: width,
                height: height
            })
        );

        const svgSrc = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(`
            <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
                <foreignObject width="100%" height="100%">
                    <div xmlns="http://www.w3.org/1999/xhtml" style="width:100%;height:100%;">
                        ${svgString}
                    </div>
                </foreignObject>
            </svg>
        `)}`;

        children.push({
            id: elementId,
            type: 'svg',
            x: x,
            y: y,
            width: width,
            height: height,
            rotation: iqStyling.rotation || 0,
            opacity: iqStyling.opacity !== undefined ? iqStyling.opacity : 1,
            src: svgSrc,
            custom: {
                kind: 'interactive',
                interactiveType: 'imageQuiz',
                data: iqData,
                style: iqStyle
            }
        });
    }

    // ============================================
    // BUILD FINAL PAGE
    // ============================================
    const page = {
        id: slideId,
        width: 'auto',
        height: 'auto',
        background: styling.background?.color?.solid || '#ffffff',
        duration: 5000,
        children,
        custom: {
            originalSlideId: slideId,
            hasMedia: Boolean(videoUrl || imageUrl),
            hasText: Boolean(content.text),
            hasCtas: Boolean(content.ctas?.length),
            order: slide.order || 0,
            // Store original content/styling for save
            originalContent: content,
            originalStyling: styling,
        },
    };

    console.log(`[slideToCanvas] ✓ Page built with ${children.length} elements`);
    return page;
};

// Alias for backward compatibility
export const slideToCanvasPage = buildPageFromSlide;

// ============================================
// BUILD STORE FROM ALL SLIDES
// ============================================

/**
 * Convert a list of backend slides into a complete Polotno store JSON
 * 
 * CRITICAL: Every slide creates exactly one page
 * CRITICAL: Every JSON block becomes visible elements
 * 
 * @param {Array} slides - Array of backend slide objects
 * @returns {Object} Polotno store JSON (ready for store.loadJSON)
 */
export const slidesToCanvasStore = (slides) => {
    if (!Array.isArray(slides) || slides.length === 0) {
        console.warn('[slideToCanvas] No slides provided, creating empty store');
        return {
            width: CANVAS_WIDTH,
            height: CANVAS_HEIGHT,
            pages: [{
                id: 'empty-page',
                width: 'auto',
                height: 'auto',
                background: '#ffffff',
                children: [],
            }],
        };
    }

    console.log(`[slideToCanvas] Converting ${slides.length} slides to canvas store...`);

    // Sort by order
    const sortedSlides = [...slides].sort((a, b) => (a.order || 0) - (b.order || 0));

    // Convert each slide to a page
    const pages = sortedSlides.map((slide, index) => {
        console.log(`[slideToCanvas] Processing slide ${index + 1}/${sortedSlides.length}:`, slide.id);

        // Check if slide has pre-built canvasData
        if (slide.canvasData) {
            const hasValidCanvasData = (
                (typeof slide.canvasData === 'string' && slide.canvasData.trim().length > 10) ||
                (typeof slide.canvasData === 'object' && slide.canvasData.pages?.length > 0)
            );

            if (hasValidCanvasData) {
                try {
                    const existingCanvas = typeof slide.canvasData === 'string'
                        ? JSON.parse(slide.canvasData)
                        : slide.canvasData;

                    if (existingCanvas.pages && existingCanvas.pages.length > 0) {
                        const page = { ...existingCanvas.pages[0] };
                        page.id = slide.id || page.id;
                        page.custom = {
                            ...page.custom,
                            originalSlideId: slide.id,
                            order: slide.order || index,
                        };
                        console.log(`[slideToCanvas] ✓ Using existing canvasData for slide ${slide.id}`);
                        return page;
                    }
                } catch (e) {
                    console.warn(`[slideToCanvas] Failed to parse canvasData for slide ${slide.id}:`, e);
                }
            }
        }

        // No valid canvasData - build page from JSON
        return buildPageFromSlide(slide);
    }).filter(Boolean);

    const store = {
        width: CANVAS_WIDTH,
        height: CANVAS_HEIGHT,
        pages: pages.length > 0 ? pages : [{
            id: 'empty-page',
            width: 'auto',
            height: 'auto',
            background: '#ffffff',
            children: [],
        }],
    };

    console.log(`[slideToCanvas] ✓ Canvas store built with ${store.pages.length} pages`);
    return store;
};

// ============================================
// CAMPAIGN HYDRATOR
// ============================================

/**
 * Hydrate entire campaign into Polotno store
 * 
 * CRITICAL: Loads ALL slides and creates ALL canvas pages at once
 * 
 * @param {Object} campaign - Campaign data from backend
 * @param {Object} store - Polotno store instance
 * @param {string} targetGroupId - Optional specific group to hydrate
 * @returns {Promise<boolean>} Success status
 */
export const hydrateCampaignToEditor = async (campaign, store, targetGroupId = null) => {
    if (!store) {
        console.error('[slideToCanvas] Cannot hydrate: store is null');
        return false;
    }

    if (!campaign || !campaign.details) {
        console.error('[slideToCanvas] Cannot hydrate: campaign or details is null');
        return false;
    }

    console.log('[slideToCanvas] Hydrating campaign to editor...');

    // Find target group
    const groups = campaign.details || [];
    const targetGroup = targetGroupId
        ? groups.find(g => g.id === targetGroupId)
        : groups[0];

    if (!targetGroup) {
        console.error('[slideToCanvas] No story group found');
        return false;
    }

    console.log(`[slideToCanvas] Hydrating group: ${targetGroup.id} (${targetGroup.name || 'unnamed'})`);

    // Get slides from group
    const slides = targetGroup.slides || targetGroup.storygroups || targetGroup.stories || [];

    if (slides.length === 0) {
        console.warn('[slideToCanvas] No slides in group');
        return false;
    }

    console.log(`[slideToCanvas] Found ${slides.length} slides to hydrate`);

    // Build and load canvas store
    const canvasStore = slidesToCanvasStore(slides);
    await store.loadJSON(canvasStore);

    console.log(`[slideToCanvas] ✓ Campaign hydrated: ${store.pages.length} pages loaded`);
    return true;
};

// ============================================
// LOAD SLIDES INTO STORE (UTILITY)
// ============================================

/**
 * Load slides into Polotno store
 * 
 * @param {Object} store - Polotno store instance
 * @param {Array} slides - Backend slides
 * @returns {Promise<boolean>} Success status
 */
export const loadSlidesIntoStore = async (store, slides) => {
    if (!store) {
        console.error('[slideToCanvas] No store provided');
        return false;
    }

    console.log(`[slideToCanvas] Loading ${slides?.length || 0} slides into store...`);

    try {
        const canvasStore = slidesToCanvasStore(slides);

        console.log('[slideToCanvas] Generated canvas store:', {
            width: canvasStore.width,
            height: canvasStore.height,
            pageCount: canvasStore.pages.length,
            pages: canvasStore.pages.map(p => ({
                id: p.id,
                childrenCount: p.children?.length || 0,
            })),
        });

        await store.loadJSON(canvasStore);

        console.log(`[slideToCanvas] ✓ Successfully loaded ${canvasStore.pages.length} pages`);
        return true;
    } catch (error) {
        console.error('[slideToCanvas] Failed to load slides:', error);
        return false;
    }
};

export default {
    buildPageFromSlide,
    slideToCanvasPage,
    slidesToCanvasStore,
    hydrateCampaignToEditor,
    loadSlidesIntoStore,
    CANVAS_WIDTH,
    CANVAS_HEIGHT,
};
