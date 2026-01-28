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
            { id: 'q1', text: 'London' },
            { id: 'q2', text: 'Paris' },
            { id: 'q3', text: 'Berlin' },
        ],
        correctAnswerId: 'q2',
        showExplanation: false,
        explanation: '',
    },

    rating: {
        title: 'Do you like my eyes?',
        type: 'slider', // 'star' | 'emoji' | 'slider'
        maxRating: 5,
        emoji: '😺',
        currentRating: 3,
    },

    reaction: {
        emojis: ['👍', '👎'],
        showCount: true,
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
        questionFontSize: 11,
        optionBgColor: '#ffffff',
        optionBgHoverColor: '#f3f4f6',
        optionTextColor: '#1f2937',
        optionFontSize: 13,
        optionBorderRadius: 8,
        resultBarColor: '#F97316',
        containerBgColor: '#ffffff', // White card background
        containerBorderRadius: 12,
        containerPadding: 16,
    },

    quiz: {
        questionColor: '#1f2937',
        questionFontSize: 16,
        optionBgColor: '#f9fafb',
        optionTextColor: '#1f2937',
        optionFontSize: 14,
        optionBorderRadius: 8,
        correctColor: '#10b981',
        incorrectColor: '#ef4444',
        containerBgColor: '#ffffff',
        containerBorderRadius: 16,
        containerPadding: 20,
    },

    rating: {
        titleColor: '#000000',
        titleFontSize: 14,
        activeColor: '#fbbf24',
        inactiveColor: 'rgba(255,255,255,0.3)',
        emojiSize: 32,
        containerBgColor: 'rgba(0,0,0,0.5)',
        containerBorderRadius: 12,
        containerPadding: 16,
    },

    reaction: {
        containerBgColor: '#ffffff',
        hoverScale: 1.2,
        emojiSize: 48,
        transparentBg: false,
    },

    countdown: {
        titleColor: '#1f2937',
        titleFontSize: 14,
        digitColor: '#1f2937',
        digitFontSize: 28,
        digitBgColor: 'transparent',
        labelColor: '#9ca3af',
        labelFontSize: 9,
        separatorColor: '#d1d5db',
        containerBgColor: '#ffffff',
        containerBorderRadius: 12,
        containerPadding: 16,
    },

    promo: {
        titleColor: '#1f2937',
        titleFontSize: 14,
        codeColor: '#f97316',
        codeFontSize: 24,
        codeBgColor: '#fff7ed',
        descriptionColor: '#4b5563',
        descriptionFontSize: 12,
        buttonBgColor: '#F97316',
        buttonTextColor: '#ffffff',
        borderColor: '#fdba74',
        containerBgColor: '#ffffff',
        containerBorderRadius: 16,
        containerPadding: 20,
    },

    question: {
        titleColor: '#1f2937',
        titleFontSize: 16,
        inputBgColor: '#f3f4f6',
        inputTextColor: '#9ca3af',
        inputFontSize: 14,
        inputBorderRadius: 8,
        placeholderColor: '#9ca3af',
        submitBgColor: '#F97316',
        submitTextColor: '#ffffff',
        containerBgColor: '#ffffff',
        containerBorderRadius: 16,
        containerPadding: 20,
    },

    imageQuiz: {
        questionColor: '#1f2937',
        questionFontSize: 16,
        imageBorderRadius: 8,
        imageBorderColor: '#e5e7eb',
        selectedBorderColor: '#F97316',
        correctBorderColor: '#10b981',
        incorrectBorderColor: '#ef4444',
        labelColor: '#4b5563',
        labelFontSize: 12,
        containerBgColor: '#ffffff',
        containerBorderRadius: 16,
        containerPadding: 20,
    },
};

// ==================== ELEMENT DIMENSIONS ====================

export const INTERACTIVE_DIMENSIONS = {
    poll: { width: 280, height: 110 },
    quiz: { width: 280, height: 200 },
    rating: { width: 237, height: 90 },
    reaction: { width: 280, height: 80 },
    countdown: { width: 360, height: 140 },
    promo: { width: 320, height: 100 },
    question: { width: 280, height: 160 },
    imageQuiz: { width: 300, height: 240 },
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
