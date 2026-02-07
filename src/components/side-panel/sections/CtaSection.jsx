/* eslint-disable react-refresh/only-export-components */
import React from 'react';
import { observer } from 'mobx-react-lite';
import { SectionTab } from 'polotno/side-panel';

import ClassicCTA from './ctaTypes/ClassicCTA';
import SwipeUpCTA from './ctaTypes/SwipeUpCTA';
import ImageCTA from './ctaTypes/ImageCTA';
import VisitCTA from './ctaTypes/VisitCTA';
import DescribeCTA from './ctaTypes/DescribeCTA';
import BuyCTA from './ctaTypes/BuyCTA';

import { getMainCtas } from './ctaTypes/ctaPageUtils';
import {
  ClassicIcon,
  SwipeUpIcon,
  ImageCtaIcon,
  BuyIcon,
  getCtaTypeLabel,
} from './ctaTypes/ctaMeta';

// CTA Icon for tab
const CtaIcon = () => (
  <svg
    width="28"
    height="28"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ fill: 'none', stroke: 'currentColor' }}
  >
    <circle cx="12" cy="12" r="10" />
    <path d="M8 14l4-4 4 4" />
  </svg>
);

// CTA Section Tab
export const CtaSectionTab = (props) => (
  <SectionTab name="CTA" {...props}>
    <div className="flex justify-center items-center">
      <CtaIcon />
    </div>
  </SectionTab>
);

// CTA Section Panel
export const CtaSectionPanel = observer(({ store }) => {
  const mainCtas = getMainCtas(store);

  const selectCtaElement = (element) => {
    store.selectElements([element.id]);
  };

  return (
    <div className="flex flex-col h-full bg-(--bg-secondary) text-(--text-primary) font-sans">
      <div className="px-3 py-3 space-y-6 overflow-y-auto flex-1 pb-20">
        {/* ADD CTA Section */}
        <div>
          <h3 className="text-[12px] font-bold text-(--text-muted) uppercase tracking-wider mb-4 px-1">
            Add CTA
          </h3>
          <div className="flex flex-col gap-4">
            <ClassicCTA store={store} />
            <SwipeUpCTA store={store} />
            <ImageCTA store={store} />
          </div>
        </div>

        {/* PRODUCT CARDS Section */}
        <div>
          <h3 className="text-[12px] font-bold text-(--text-muted) uppercase tracking-wider mb-4 px-1">
            Product Cards
          </h3>
          <div className="grid grid-cols-3 gap-2 px-0 items-start">
            <VisitCTA store={store} />
            <DescribeCTA store={store} />
            <BuyCTA store={store} />
          </div>

          <p className="text-[11px] text-(--text-muted) text-center mt-8 leading-relaxed italic px-2">
            Click a CTA type to add it to canvas.<br /> Select CTA on canvas to edit styles.
          </p>
        </div>

        {/* CTA List - Show all CTAs on current slide */}
        {mainCtas.length > 0 && (
          <div className="mt-4 pt-6 border-t border-(--border-primary)">
            <h3 className="text-[12px] font-bold text-(--text-muted) uppercase tracking-wider mb-4 px-1">
              CTAs on this Slide
            </h3>

            <div className="space-y-2">
              {mainCtas.map((cta) => {
                const isSelected = store.selectedElements.some((el) => el.id === cta.id);
                return (
                  <div
                    key={cta.id}
                    onClick={() => selectCtaElement(cta)}
                    className={`
                    flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all border
                    ${
                      isSelected
                        ? 'bg-(--accent-soft) border-(--accent-primary) shadow-sm ring-1 ring-(--accent-primary)'
                        : 'bg-(--bg-secondary) border-(--border-primary) hover:border-(--border-accent) hover:bg-(--bg-hover)'
                    }
                  `}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-md ${isSelected ? 'bg-(--accent-primary) text-(--surface-light)' : 'bg-(--bg-tertiary) text-(--text-muted)'}`}>
                        {cta.custom?.ctaType === 'classic' && <ClassicIcon className="w-4 h-4" />}
                        {cta.custom?.ctaType === 'swipe_up' && <SwipeUpIcon className="w-4 h-4" />}
                        {cta.custom?.ctaType === 'image' && <ImageCtaIcon className="w-4 h-4" />}
                        {(cta.custom?.ctaType === 'visit_product' ||
                          cta.custom?.ctaType === 'describe_product' ||
                          cta.custom?.ctaType === 'buy_product' ||
                          cta.custom?.ctaType === 'product_card') && <BuyIcon className="w-4 h-4" />}
                      </div>
                      <div className="flex flex-col">
                        <span className={`text-[13px] font-semibold ${isSelected ? 'text-(--text-primary)' : 'text-(--text-secondary)'}`}>
                          {getCtaTypeLabel(cta.custom?.ctaType)}
                        </span>
                        <span className="text-[11px] text-(--text-muted) truncate max-w-35">
                          {cta.custom?.title || cta.custom?.text || cta.custom?.redirectUrl || 'No URL'}
                        </span>
                      </div>
                    </div>
                    {isSelected && (
                      <div className="w-2 h-2 rounded-full bg-(--accent-primary) animate-pulse" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
});

// Export the complete section
export const CtaSection = {
  name: 'cta',
  Tab: CtaSectionTab,
  Panel: CtaSectionPanel,
};

// Keep backward-compatible exports for CtaSettings and other consumers
export { generateCtaSVG, getSwipeUpHeight } from './ctaTypes/generateCtaSVG';
export { CTA_DEFAULTS, CTA_DIMENSIONS } from './ctaTypes/ctaRegistry';
