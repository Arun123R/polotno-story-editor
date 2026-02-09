/* eslint-disable react-refresh/only-export-components */
import React from 'react';
import { getCanvasRectFromBaseline } from './ctaPlacement';
import { escapeXml, svgToDataUri } from './svgUtils';

export const SWIPE_UP_CTA_DIMENSIONS = { width: 500, height: 150 };
export const SWIPE_UP_CTA_POSITION = { x: 290, y: 1750 };

export const SWIPE_UP_CTA_DEFAULTS = {
  text: 'Swipe up',
  redirectUrl: 'https://example.com',
  arrowColor: '#9CA3AF',
  textColor: '#000000',
  bgColor: '#9CA3AF',
  fontSize: 45,
  arrowAnimation: true,
};

export const getSwipeUpHeight = (data) => {
  const arrowSize = data.arrowSize ? Number(data.arrowSize) : 52;
  const arrowGap = data.arrowGap !== undefined ? Number(data.arrowGap) : 15;
  const pillHeight = data.pillH !== undefined ? Number(data.pillH) : 90;
  const paddingBottom = 10;
  const paddingTop = 10;
  return paddingBottom + pillHeight + arrowGap + arrowSize + paddingTop;
};

export function generateSwipeUpCtaSVG(data, width, height) {
  const LOGICAL_WIDTH = 500;
  const text = data?.text || '';
  const arrowColor = data?.arrowColor || '#ffffff';
  const textColor = data?.textColor || '#ffffff';
  const bgColor = data?.bgColor || '#000000';
  const isTransparent = data?.transparent === true;
  const fontSize = data?.fontSize || Math.max(24, height * 0.2);

  const hasText = text.trim().length > 0;

  if (hasText) {
    const pillH = data.pillH !== undefined ? Number(data.pillH) : 110;
    const padBot = 10;

    const chevronSize = data.arrowSize ? Number(data.arrowSize) : 52;
    const gap = data.arrowGap !== undefined ? Number(data.arrowGap) : 15;

    const FIXED_PILL_Y = 100;
    const pillY = FIXED_PILL_Y;
    const pillW = data.pillW !== undefined ? Number(data.pillW) : LOGICAL_WIDTH * 0.9;
    const pillX = (LOGICAL_WIDTH - pillW) / 2;
    const pillRad =
      data.pillBorderRadius !== undefined
        ? Number(data.pillBorderRadius)
        : pillH / 2;

    const arrowVisBot = pillY - gap;
    const arrowCY = arrowVisBot - chevronSize / 3;
    const arrowCX = LOGICAL_WIDTH / 2;

    const logicalHeight = pillY + pillH + padBot;

    const textCY = pillY + pillH / 2;

    const arrowAnimation = data?.arrowAnimation !== false;

    return svgToDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${LOGICAL_WIDTH} ${logicalHeight}">
        <style>
          @keyframes arrow-bounce {
            0%, 100% {
              transform: translateY(0);
              opacity: 1;
            }
            50% {
              transform: translateY(-8px);
              opacity: 0.6;
            }
          }
          .swipe-arrow {
            ${arrowAnimation ? 'animation: arrow-bounce 1.8s cubic-bezier(0.4, 0, 0.2, 1) infinite;' : ''}
            transform-origin: center center;
          }
          .static-pill {
            pointer-events: none;
          }
        </style>

        <g class="cta-wrapper">
          <rect
            class="static-pill"
            x="${pillX}"
            y="${pillY}"
            width="${pillW}"
            height="${pillH}"
            rx="${pillRad}"
            fill="${isTransparent ? 'transparent' : bgColor}"
          />

          <path
            class="swipe-arrow"
            d="M ${arrowCX - chevronSize} ${arrowCY + chevronSize / 3}
               L ${arrowCX} ${arrowCY - chevronSize / 3}
               L ${arrowCX + chevronSize} ${arrowCY + chevronSize / 3}"
            stroke="${isTransparent ? arrowColor : bgColor}"
            stroke-width="5"
            stroke-linecap="round"
            stroke-linejoin="round"
            fill="none"
          />

          <text
            x="${LOGICAL_WIDTH / 2}"
            y="${textCY}"
            text-anchor="middle"
            dominant-baseline="middle"
            fill="${textColor}"
            font-size="${fontSize}"
            font-weight="600"
            font-family="Inter, -apple-system, sans-serif"
          >${escapeXml(text)}</text>
        </g>
      </svg>
    `);
  }

  const pillW = data.pillW !== undefined ? Number(data.pillW) : LOGICAL_WIDTH * 0.4;
  const pillH = data.pillH !== undefined ? Number(data.pillH) : 90;
  const padTop = 10;
  const padBot = 10;
  const pillX = (LOGICAL_WIDTH - pillW) / 2;
  const logicalHeight = pillH + padTop + padBot;
  const pillY = (logicalHeight - pillH) / 2;
  const pillRadius =
    data.pillBorderRadius !== undefined ? Number(data.pillBorderRadius) : pillH / 2;

  const chevronSize =
    data.arrowSize ? Number(data.arrowSize) : Math.min(pillW, pillH) * 0.5;
  const arrowCenterX = LOGICAL_WIDTH / 2;
  const arrowCenterY = pillY + pillH / 2;

  const arrowAnimation = data?.arrowAnimation !== false;

  return svgToDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${LOGICAL_WIDTH} ${logicalHeight}">
      <style>
        @keyframes arrow-bounce {
          0%, 100% {
            transform: translateY(0);
            opacity: 1;
          }
          50% {
            transform: translateY(-8px);
            opacity: 0.6;
          }
        }
        .swipe-arrow {
          ${arrowAnimation ? 'animation: arrow-bounce 1.8s cubic-bezier(0.4, 0, 0.2, 1) infinite;' : ''}
          transform-origin: center center;
        }
      </style>

      <g class="cta-wrapper">
        <rect
          x="${pillX}"
          y="${pillY}"
          width="${pillW}"
          height="${pillH}"
          rx="${pillRadius}"
          fill="${isTransparent ? 'transparent' : bgColor}"
        />

        <path
          class="swipe-arrow"
          d="M ${arrowCenterX - chevronSize} ${arrowCenterY + chevronSize / 3}
             L ${arrowCenterX} ${arrowCenterY - chevronSize / 3}
             L ${arrowCenterX + chevronSize} ${arrowCenterY + chevronSize / 3}"
          stroke="${arrowColor}"
          stroke-width="4"
          stroke-linecap="round"
          stroke-linejoin="round"
          fill="none"
        />
      </g>
    </svg>
  `);
}

export default function SwipeUpCTA({ store }) {
  const addSwipeUpCta = () => {
    const page = store.activePage;
    if (!page) return;

    const canvasRect = getCanvasRectFromBaseline(
      store,
      SWIPE_UP_CTA_DIMENSIONS,
      SWIPE_UP_CTA_POSITION
    );

    const svgContent = generateSwipeUpCtaSVG(
      SWIPE_UP_CTA_DEFAULTS,
      SWIPE_UP_CTA_DIMENSIONS.width,
      SWIPE_UP_CTA_DIMENSIONS.height
    );

    const element = page.addElement({
      type: 'svg',
      x: canvasRect.x,
      y: canvasRect.y,
      width: canvasRect.width,
      height: canvasRect.height,
      src: svgContent,
      keepRatio: false,
      custom: {
        ctaType: 'swipe_up',
        ...SWIPE_UP_CTA_DEFAULTS,
      },
    });

    store.selectElements([element.id]);
  };

  const previewSvg = generateSwipeUpCtaSVG(SWIPE_UP_CTA_DEFAULTS, 220, 80);

  return (
    <button
      onClick={addSwipeUpCta}
      aria-label="Add Swipe Up CTA"
      className="studio-card cta-card w-full flex flex-col items-center justify-center px-3 group"
    >
      <img
        src={previewSvg}
        alt="Swipe Up preview"
        style={{ width: 180, height: 48, objectFit: 'contain' }}
        className="mb-1 cta-swipe"
      />
    </button>
  );
}
