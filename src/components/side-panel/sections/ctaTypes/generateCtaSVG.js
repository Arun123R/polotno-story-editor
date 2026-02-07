import { generateClassicCtaSVG } from './ClassicCTA';
import {
  generateSwipeUpCtaSVG,
  getSwipeUpHeight,
} from './SwipeUpCTA';
import { generateDescribeProductSVG } from './DescribeCTA';
import { generateVisitProductSVG } from './VisitCTA';
import { generateBuyProductSVG } from './BuyCTA';

export function generateCtaSVG(ctaType, data, width, height) {
  switch (ctaType) {
    case 'classic':
      return generateClassicCtaSVG(data, width, height);
    case 'swipe_up':
      return generateSwipeUpCtaSVG(data, width, height);
    case 'product_card':
    case 'describe_product':
      return generateDescribeProductSVG(data, width, height);
    case 'visit_product':
      return generateVisitProductSVG(data, width, height);
    case 'buy_product':
      return generateBuyProductSVG(data, width, height);
    default:
      return generateClassicCtaSVG(data, width, height);
  }
}

export { getSwipeUpHeight };
