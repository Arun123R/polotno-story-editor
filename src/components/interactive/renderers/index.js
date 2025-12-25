/**
 * Interactive Renderers Index
 * Registry of all interactive element renderers
 */

import PollRenderer from './PollRenderer';
import QuizRenderer from './QuizRenderer';
import RatingRenderer from './RatingRenderer';
import ReactionRenderer from './ReactionRenderer';
import CountdownRenderer from './CountdownRenderer';
import PromoRenderer from './PromoRenderer';
import QuestionRenderer from './QuestionRenderer';
import ImageQuizRenderer from './ImageQuizRenderer';

// Renderer registry - maps interactive types to their React components
export const RENDERERS = {
    poll: PollRenderer,
    quiz: QuizRenderer,
    rating: RatingRenderer,
    reaction: ReactionRenderer,
    countdown: CountdownRenderer,
    promo: PromoRenderer,
    question: QuestionRenderer,
    imageQuiz: ImageQuizRenderer,
};

/**
 * Get renderer component for an interactive type
 */
export const getRenderer = (type) => {
    return RENDERERS[type] || null;
};

/**
 * Check if a renderer exists for a type
 */
export const hasRenderer = (type) => {
    return type in RENDERERS;
};

// Export all renderers
export {
    PollRenderer,
    QuizRenderer,
    RatingRenderer,
    ReactionRenderer,
    CountdownRenderer,
    PromoRenderer,
    QuestionRenderer,
    ImageQuizRenderer,
};

export default RENDERERS;
