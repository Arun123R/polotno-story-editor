/**
 * Interactive Element Data Schemas
 * 
 * Each interactive element is stored as a Polotno 'text' element with custom metadata.
 * The custom property contains:
 * - kind: 'interactive' (to identify interactive elements)
 * - interactiveType: The type of interaction
 * - data: Type-specific content data
 * - style: Type-specific styling overrides
 */

// ==================== DEFAULT DATA ====================

export const INTERACTIVE_DEFAULTS = {
    poll: {
        question: 'Are you excited for the grand sale?',
        options: [
            { id: 'opt1', label: 'YES', votes: 0 },
            { id: 'opt2', label: 'NO', votes: 0 },
        ],
        layout: 'horizontal', // 'horizontal' or 'vertical'
        allowMultiple: false,
        showResults: true,
    },

    quiz: {
        question: 'What is the capital of France?',
        options: [
            { id: 'A', text: 'London', isCorrect: false },
            { id: 'B', text: 'Paris', isCorrect: true },
            { id: 'C', text: 'Berlin', isCorrect: false },
        ],
        showExplanation: false,
        duration: {
            start: 0,
            end: 5
        }
    },

    rating: {
        type: 'rating',
        variant: 'slider', // 'star' | 'emoji' | 'slider'
        title: 'Do you like my eyes?',
        maxRating: 5,
        emoji: '😺',
        currentRating: 3,
    },

    reaction: {
        type: 'reaction',
        emojis: ['👍', '👎'],
        showCount: false,
        duration: {
            start: 0,
            end: 5
        }
    },

    countdown: {
        title: "It's almost my b-day!",
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 7 days from now
        endTime: '23:59',
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        showDays: true,
        showHours: true,
        showMinutes: true,
        showSeconds: true,
    },

    promo: {
        title: 'Special Offer',
        couponCode: 'SAVE20',
        description: 'Get 20% off your first order',
        showCopyButton: true,
        dashedBorder: true,
        expiryDate: '',
    },

    question: {
        placeholder: 'Type your answer...',
        title: 'Ask me anything',
        allowAnonymous: true,
        maxLength: 200,
    },

    imageQuiz: {
        question: 'Which one is correct?',
        options: [
            { id: 'img1', imageUrl: '', label: 'Option 1' },
            { id: 'img2', imageUrl: '', label: 'Option 2' },
        ],
        correctAnswerId: 'img1',
        columns: 2,
    },
};

// ==================== DEFAULT STYLES ====================

export const INTERACTIVE_STYLES = {
    poll: {
        questionColor: '#1f2937',
        questionFontSize: 33,
        optionBgColor: '#ffffff',
        optionBgHoverColor: '#f3f4f6',
        optionTextColor: '#1f2937',
        optionFontSize: 39,
        optionBorderRadius: 24,
        resultBarColor: '#F97316',
        containerBgColor: '#ffffff', // White card background
        containerBorderRadius: 36,
        containerPadding: 48,
    },

    quiz: {
        position: {
            x: 84,
            y: 393
        },
        size: {
            width: 840,
            height: 642
        },
        rotation: 0,
        appearance: {
            opacity: 1,
            radius: 48
        },
        colors: {
            background: '#FF0000',
            questionColor: '#FFFFFF',
            optionBackground: '#F9FAFB',
            optionTextColor: '#1F2937',
            correctColor: '#10B981',
            incorrectColor: '#EF4444'
        },
        typography: {
            questionSize: 48,
            optionSize: 42
        },
        spacing: {
            padding: 60,
            optionRadius: 24
        }
    },

    rating: {
        position: { x: 186, y: 783 },
        size: { width: 711, height: 270 },
        rotation: 0,
        opacity: 1,
        radius: 36,
        padding: 60,
        colors: {
            background: '#FFFFFF',
            cardBackground: '#FFFFFF',
            titleColor: '#000000',
            sliderTrack: '#E6E6E6',
            sliderFill: '#F97316',
        },
        typography: {
            titleSize: 42,
            emojiSize: 96,
        },
        // Legacy flat properties for backward compatibility
        titleColor: '#000000',
        titleFontSize: 42,
        activeColor: '#F97316',
        inactiveColor: '#E6E6E6',
        emojiSize: 96,
        containerBgColor: '#FFFFFF',
        containerBorderRadius: 36,
        containerPadding: 60,
    },

    reaction: {
        position: { x: 120, y: 828 },
        size: { width: 840, height: 192 },
        rotation: 0,
        opacity: 1,
        radius: 0,
        padding: 0,
        background: '#FFFFFF',
        transparentBackground: false,
        emojiSize: 144,
        countColor: '#374151',
        countSize: 42,
    },

    countdown: {
        titleColor: '#1f2937',
        digitColor: '#1f2937',
        digitSize: 84,
        digitBackground: '#000000',
        labelColor: '#9ca3af',
        background: '#ffffff',
        radius: 36,
        padding: 48,
    },

    promo: {
        titleColor: '#1f2937',
        titleFontSize: 42,
        codeColor: '#f97316',
        codeFontSize: 72,
        codeBgColor: '#fff7ed',
        descriptionColor: '#4b5563',
        descriptionFontSize: 36,
        buttonBgColor: '#F97316',
        buttonTextColor: '#ffffff',
        borderColor: '#fdba74',
        containerBgColor: '#ffffff',
        containerBorderRadius: 48,
        containerPadding: 60,
    },

    question: {
        titleColor: '#1f2937',
        titleFontSize: 48,
        inputBgColor: '#f3f4f6',
        inputTextColor: '#9ca3af',
        inputFontSize: 42,
        inputBorderRadius: 24,
        placeholderColor: '#9ca3af',
        submitBgColor: '#F97316',
        submitTextColor: '#ffffff',
        containerBgColor: '#ffffff',
        containerBorderRadius: 48,
        containerPadding: 60,
    },

    imageQuiz: {
        questionColor: '#1f2937',
        questionFontSize: 48,
        imageBorderRadius: 24,
        imageBorderColor: '#e5e7eb',
        selectedBorderColor: '#F97316',
        correctBorderColor: '#10b981',
        incorrectBorderColor: '#ef4444',
        labelColor: '#4b5563',
        labelFontSize: 36,
        containerBgColor: '#ffffff',
        containerBorderRadius: 48,
        containerPadding: 60,
    },
};

// ==================== ELEMENT DIMENSIONS ====================

export const INTERACTIVE_DIMENSIONS = {
    poll: { width: 840, height: 330 },          // 280 * 3
    quiz: { width: 840, height: 600 },          // 280 * 3, 200 * 3
    rating: { width: 711, height: 270 },        // 237 * 3, 90 * 3
    reaction: { width: 840, height: 240 },      // 280 * 3, 80 * 3
    countdown: { width: 1080, height: 420 },    // 360 * 3, 140 * 3
    promo: { width: 960, height: 300 },         // 320 * 3, 100 * 3
    question: { width: 840, height: 480 },      // 280 * 3, 160 * 3
    imageQuiz: { width: 900, height: 720 },     // 300 * 3, 240 * 3
};

// ==================== HELPER FUNCTIONS ====================

/**
 * Create interactive element custom data
 */
export const createInteractiveData = (type) => {
    return {
        kind: 'interactive',
        interactiveType: type,
        data: { ...INTERACTIVE_DEFAULTS[type] },
        style: { ...INTERACTIVE_STYLES[type] },
    };
};

/**
 * Check if element is an interactive element
 */
export const isInteractiveElement = (element) => {
    return element?.custom?.kind === 'interactive' || element?.custom?.isInteractive;
};

/**
 * Get interactive type from element
 */
export const getInteractiveType = (element) => {
    return element?.custom?.interactiveType;
};

/**
 * Get interactive data from element
 */
export const getInteractiveData = (element) => {
    return element?.custom?.data || {};
};

/**
 * Get interactive style from element
 */
export const getInteractiveStyle = (element) => {
    return element?.custom?.style || {};
};

/**
 * Update interactive data on element
 */
export const updateInteractiveData = (element, dataUpdates) => {
    element.set({
        custom: {
            ...element.custom,
            data: {
                ...element.custom?.data,
                ...dataUpdates,
            },
        },
    });
};

/**
 * Update interactive style on element
 */
export const updateInteractiveStyle = (element, styleUpdates) => {
    element.set({
        custom: {
            ...element.custom,
            style: {
                ...element.custom?.style,
                ...styleUpdates,
            },
        },
    });
};

/**
 * Get label for interactive type
 */
export const getInteractiveTypeLabel = (type) => {
    const labels = {
        poll: 'Poll',
        quiz: 'Quiz',
        rating: 'Rating',
        reaction: 'Reaction',
        countdown: 'Countdown',
        promo: 'Promo Code',
        question: 'Question',
        imageQuiz: 'Image Quiz',
    };
    return labels[type] || 'Interactive';
};

/**
 * Get icon for interactive type
 */
export const getInteractiveTypeIcon = (type) => {
    const icons = {
        poll: '📊',
        quiz: '❓',
        rating: '⭐',
        reaction: '😍',
        countdown: '⏱️',
        promo: '🎟️',
        question: '💬',
        imageQuiz: '🖼️',
    };
    return icons[type] || '⚡';
};
