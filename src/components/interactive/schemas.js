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
        question: 'What do you prefer?',
        options: [
            { id: 'opt1', text: 'Option A', votes: 0 },
            { id: 'opt2', text: 'Option B', votes: 0 },
        ],
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
        emojis: ['😍', '🔥', '😂', '😮', '😢'],
        size: 48,
        showCount: false,
    },

    countdown: {
        title: 'Ends In',
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
        questionColor: '#ffffff',
        questionFontSize: 16,
        optionBgColor: 'rgba(255,255,255,0.2)',
        optionBgHoverColor: 'rgba(255,255,255,0.3)',
        optionTextColor: '#ffffff',
        optionFontSize: 14,
        optionBorderRadius: 8,
        resultBarColor: '#F97316',
        containerBgColor: 'rgba(0,0,0,0.5)',
        containerBorderRadius: 12,
        containerPadding: 16,
    },

    quiz: {
        questionColor: '#ffffff',
        questionFontSize: 16,
        optionBgColor: 'rgba(255,255,255,0.2)',
        optionTextColor: '#ffffff',
        optionFontSize: 14,
        optionBorderRadius: 8,
        correctColor: '#10b981',
        incorrectColor: '#ef4444',
        containerBgColor: 'rgba(0,0,0,0.5)',
        containerBorderRadius: 12,
        containerPadding: 16,
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
        bgColor: 'transparent',
        hoverScale: 1.2,
        emojiSize: 48,
    },

    countdown: {
        titleColor: '#ffffff',
        titleFontSize: 14,
        digitColor: '#ffffff',
        digitFontSize: 36,
        digitBgColor: 'rgba(255,255,255,0.15)',
        labelColor: 'rgba(255,255,255,0.7)',
        labelFontSize: 10,
        separatorColor: '#ffffff',
        containerBgColor: 'rgba(0,0,0,0.6)',
        containerBorderRadius: 16,
        containerPadding: 20,
    },

    promo: {
        titleColor: '#ffffff',
        titleFontSize: 14,
        codeColor: '#ffffff',
        codeFontSize: 24,
        codeBgColor: 'rgba(255,255,255,0.15)',
        descriptionColor: 'rgba(255,255,255,0.8)',
        descriptionFontSize: 12,
        buttonBgColor: '#F97316',
        buttonTextColor: '#000000',
        borderColor: 'rgba(255,255,255,0.3)',
        containerBgColor: 'rgba(0,0,0,0.6)',
        containerBorderRadius: 12,
        containerPadding: 20,
    },

    question: {
        titleColor: '#ffffff',
        titleFontSize: 16,
        inputBgColor: 'rgba(255,255,255,0.15)',
        inputTextColor: '#ffffff',
        inputFontSize: 14,
        inputBorderRadius: 8,
        placeholderColor: 'rgba(255,255,255,0.5)',
        submitBgColor: '#F97316',
        submitTextColor: '#000000',
        containerBgColor: 'rgba(0,0,0,0.5)',
        containerBorderRadius: 12,
        containerPadding: 16,
    },

    imageQuiz: {
        questionColor: '#ffffff',
        questionFontSize: 16,
        imageBorderRadius: 8,
        imageBorderColor: 'rgba(255,255,255,0.3)',
        selectedBorderColor: '#F97316',
        correctBorderColor: '#10b981',
        incorrectBorderColor: '#ef4444',
        labelColor: '#ffffff',
        labelFontSize: 12,
        containerBgColor: 'rgba(0,0,0,0.5)',
        containerBorderRadius: 12,
        containerPadding: 16,
    },
};

// ==================== ELEMENT DIMENSIONS ====================

export const INTERACTIVE_DIMENSIONS = {
    poll: { width: 280, height: 180 },
    quiz: { width: 280, height: 200 },
    rating: { width: 237, height: 90 },
    reaction: { width: 280, height: 80 },
    countdown: { width: 300, height: 140 },
    promo: { width: 280, height: 160 },
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
