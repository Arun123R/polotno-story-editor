/**
 * Interactive Components Index
 * 
 * Exports all interactive-related components, schemas, and utilities
 */

// Schemas and data management
export {
    INTERACTIVE_DEFAULTS,
    INTERACTIVE_STYLES,
    INTERACTIVE_DIMENSIONS,
    createInteractiveData,
    isInteractiveElement,
    getInteractiveType,
    getInteractiveData,
    getInteractiveStyle,
    updateInteractiveData,
    updateInteractiveStyle,
    getInteractiveTypeLabel,
    getInteractiveTypeIcon,
} from './schemas';

// Renderers
export {
    RENDERERS,
    getRenderer,
    hasRenderer,
    PollRenderer,
    QuizRenderer,
    RatingRenderer,
    ReactionRenderer,
    CountdownRenderer,
    PromoRenderer,
    QuestionRenderer,
    ImageQuizRenderer,
} from './renderers';

// Overlay component
export { InteractiveOverlay } from './InteractiveOverlay';

// Custom element registration
export { registerInteractiveElement } from './registerInteractiveElement';
