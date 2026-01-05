import { getInteractiveTypeLabel } from './schemas';

/**
 * Generate SVG content for interactive element preview
 */
export function generateInteractiveSVG(type, data, style, dimensions) {
  const { width, height } = dimensions;
  const bgColor = style?.containerBgColor || 'rgba(0,0,0,0.7)';
  const radius = style?.containerBorderRadius || 12;
  const textColor = style?.questionColor || style?.titleColor || '#ffffff';

  let content = '';

  switch (type) {
    case 'poll':
      content = generatePollSVG(data, style, width, height);
      break;
    case 'quiz':
      content = generateQuizSVG(data, style, width, height);
      break;
    case 'rating':
      content = generateRatingSVG(data, style, width, height);
      break;
    case 'reaction':
      content = generateReactionSVG(data, style, width, height);
      break;
    case 'countdown':
      content = generateCountdownSVG(data, style, width, height);
      break;
    case 'promo':
      content = generatePromoSVG(data, style, width, height);
      break;
    case 'question':
      content = generateQuestionSVG(data, style, width, height);
      break;
    case 'imageQuiz':
      content = generateImageQuizSVG(data, style, width, height);
      break;
    default:
      content = `
        <rect width="${width}" height="${height}" rx="${radius}" fill="${bgColor}"/>
        <text x="${width / 2}" y="${height / 2}" text-anchor="middle" dominant-baseline="middle" fill="${textColor}" font-size="14" font-weight="600">${getInteractiveTypeLabel(type)}</text>
      `;
  }

  return `data:image/svg+xml;utf8,${encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
      <style>
        text { font-family: 'Inter', -apple-system, sans-serif; }
      </style>
      ${content}
    </svg>
  `)}`;
}

function generatePollSVG(data, style, width, height) {
  const bgColor = style?.containerBgColor || 'rgba(0,0,0,0.7)';
  const radius = style?.containerBorderRadius || 12;
  const question = data?.question || 'What do you prefer?';
  const options = data?.options || [{ text: 'Option A' }, { text: 'Option B' }];
  const optionBg = style?.optionBgColor || 'rgba(255,255,255,0.2)';
  const textColor = style?.questionColor || '#ffffff';
  const optionTextColor = style?.optionTextColor || '#ffffff';

  const optionHeight = 36;
  const optionGap = 8;
  const padding = 16;
  const questionHeight = 30;

  let optionsSVG = '';
  options.forEach((opt, i) => {
    const y = padding + questionHeight + i * (optionHeight + optionGap);
    optionsSVG += `
      <rect x="${padding}" y="${y}" width="${width - padding * 2}" height="${optionHeight}" rx="8" fill="${optionBg}"/>
      <text x="${width / 2}" y="${y + optionHeight / 2 + 4}" text-anchor="middle" fill="${optionTextColor}" font-size="13" font-weight="500">${escapeXml(opt.text)}</text>
    `;
  });

  return `
    <rect width="${width}" height="${height}" rx="${radius}" fill="${bgColor}"/>
    <text x="${width / 2}" y="${padding + 14}" text-anchor="middle" fill="${textColor}" font-size="15" font-weight="600">${escapeXml(question)}</text>
    ${optionsSVG}
  `;
}

function generateQuizSVG(data, style, width, height) {
  const bgColor = style?.containerBgColor || 'rgba(0,0,0,0.7)';
  const radius = style?.containerBorderRadius || 12;
  const question = data?.question || 'What is the answer?';
  const options = data?.options || [
    { id: '1', text: 'A' },
    { id: '2', text: 'B' },
  ];
  const correctId = data?.correctAnswerId;
  const optionBg = style?.optionBgColor || 'rgba(255,255,255,0.2)';
  const correctColor = style?.correctColor || '#10b981';
  const textColor = style?.questionColor || '#ffffff';
  const optionTextColor = style?.optionTextColor || '#ffffff';

  const optionHeight = 36;
  const optionGap = 8;
  const padding = 16;
  const questionHeight = 30;

  let optionsSVG = '';
  options.forEach((opt, i) => {
    const y = padding + questionHeight + i * (optionHeight + optionGap);
    const isCorrect = opt.id === correctId;
    const bg = isCorrect ? correctColor : optionBg;
    optionsSVG += `
      <rect x="${padding}" y="${y}" width="${width - padding * 2}" height="${optionHeight}" rx="8" fill="${bg}"/>
      <text x="${width / 2}" y="${y + optionHeight / 2 + 4}" text-anchor="middle" fill="${optionTextColor}" font-size="13" font-weight="500">${escapeXml(opt.text)}${isCorrect ? ' ✓' : ''}</text>
    `;
  });

  return `
    <rect width="${width}" height="${height}" rx="${radius}" fill="${bgColor}"/>
    <text x="${width / 2}" y="${padding + 14}" text-anchor="middle" fill="${textColor}" font-size="15" font-weight="600">${escapeXml(question)}</text>
    ${optionsSVG}
  `;
}

function generateRatingSVG(data, style, width, height) {
  const bgColor = style?.containerBgColor || 'rgba(0,0,0,0.7)';
  const radius = style?.containerBorderRadius || 12;
  const title = data?.title || 'Rate this!';
  const maxRating = data?.maxRating || 5;
  const textColor = style?.titleColor || '#ffffff';

  const starSize = style?.emojiSize || 28;
  const starGap = 8;
  const totalStarsWidth = maxRating * starSize + (maxRating - 1) * starGap;
  const startX = (width - totalStarsWidth) / 2;

  let starsSVG = '';
  for (let i = 0; i < maxRating; i++) {
    const x = startX + i * (starSize + starGap);
    starsSVG += `<text x="${x + starSize / 2}" y="${height / 2 + 20}" text-anchor="middle" font-size="${starSize}">⭐</text>`;
  }

  return `
    <rect width="${width}" height="${height}" rx="${radius}" fill="${bgColor}"/>
    <text x="${width / 2}" y="30" text-anchor="middle" fill="${textColor}" font-size="14" font-weight="600">${escapeXml(title)}</text>
    ${starsSVG}
  `;
}

function generateReactionSVG(data, style, width, height) {
  const emojis = data?.emojis || ['😍', '🔥', '😂', '😮', '😢'];
  const emojiSize = style?.emojiSize || 40;
  const emojiGap = 16;
  const totalWidth = emojis.length * emojiSize + (emojis.length - 1) * emojiGap;
  const startX = (width - totalWidth) / 2;

  let emojisSVG = '';
  emojis.forEach((emoji, i) => {
    const x = startX + i * (emojiSize + emojiGap) + emojiSize / 2;
    emojisSVG += `<text x="${x}" y="${height / 2 + emojiSize / 3}" text-anchor="middle" font-size="${emojiSize}">${emoji}</text>`;
  });

  return `
    <rect width="${width}" height="${height}" rx="12" fill="transparent"/>
    ${emojisSVG}
  `;
}

function generateCountdownSVG(data, style, width, height) {
  const bgColor = style?.containerBgColor || 'rgba(0,0,0,0.7)';
  const radius = style?.containerBorderRadius || 16;
  const title = data?.title || 'Ends In';
  const digitBg = style?.digitBgColor || 'rgba(255,255,255,0.15)';
  const digitColor = style?.digitColor || '#ffffff';
  const labelColor = style?.labelColor || 'rgba(255,255,255,0.7)';
  const titleColor = style?.titleColor || '#ffffff';
  const digitSize = style?.digitFontSize || 28;

  const boxWidth = 50;
  const boxHeight = 56;
  const boxGap = 12;
  const units = [
    { val: '00', label: 'Days' },
    { val: '12', label: 'Hrs' },
    { val: '34', label: 'Min' },
    { val: '56', label: 'Sec' },
  ];
  const totalWidth = units.length * boxWidth + (units.length - 1) * boxGap;
  const startX = (width - totalWidth) / 2;
  const startY = height / 2 - 10;

  let boxesSVG = '';
  units.forEach((unit, i) => {
    const x = startX + i * (boxWidth + boxGap);
    boxesSVG += `
      <rect x="${x}" y="${startY}" width="${boxWidth}" height="${boxHeight}" rx="8" fill="${digitBg}"/>
      <text x="${x + boxWidth / 2}" y="${startY + 28}" text-anchor="middle" fill="${digitColor}" font-size="${digitSize}" font-weight="700" font-family="monospace">${unit.val}</text>
      <text x="${x + boxWidth / 2}" y="${startY + boxHeight - 8}" text-anchor="middle" fill="${labelColor}" font-size="9" font-weight="500">${unit.label}</text>
    `;
  });

  return `
    <rect width="${width}" height="${height}" rx="${radius}" fill="${bgColor}"/>
    <text x="${width / 2}" y="28" text-anchor="middle" fill="${titleColor}" font-size="13" font-weight="600" letter-spacing="2">${escapeXml(title.toUpperCase())}</text>
    ${boxesSVG}
  `;
}

function generatePromoSVG(data, style, width, height) {
  const bgColor = style?.containerBgColor || 'rgba(0,0,0,0.7)';
  const radius = style?.containerBorderRadius || 12;
  const title = data?.title || 'Special Offer';
  const code = data?.couponCode || 'SAVE20';
  const codeBg = style?.codeBgColor || 'rgba(255,255,255,0.15)';
  const codeColor = style?.codeColor || '#ffffff';
  const titleColor = style?.titleColor || '#ffffff';
  const buttonBg = style?.buttonBgColor || '#F97316';
  const buttonText = style?.buttonTextColor || '#000000';
  const hasDashed = data?.dashedBorder !== false;
  const borderColor = style?.borderColor || 'rgba(255,255,255,0.3)';

  const codeBoxWidth = Math.min(width - 60, 180);

  return `
    <rect width="${width}" height="${height}" rx="${radius}" fill="${bgColor}" ${hasDashed ? `stroke="${borderColor}" stroke-width="2" stroke-dasharray="8 4"` : ''}/>
    <text x="${width / 2}" y="35" text-anchor="middle" fill="${titleColor}" font-size="14" font-weight="600">${escapeXml(title)}</text>
    <rect x="${(width - codeBoxWidth) / 2}" y="${height / 2 - 16}" width="${codeBoxWidth}" height="40" rx="8" fill="${codeBg}"/>
    <text x="${width / 2 - 20}" y="${height / 2 + 10}" text-anchor="middle" fill="${codeColor}" font-size="20" font-weight="700" font-family="monospace" letter-spacing="2">${escapeXml(code)}</text>
    <rect x="${width / 2 + 40}" y="${height / 2 - 8}" width="50" height="24" rx="4" fill="${buttonBg}"/>
    <text x="${width / 2 + 65}" y="${height / 2 + 6}" text-anchor="middle" fill="${buttonText}" font-size="11" font-weight="600">Copy</text>
  `;
}

function generateQuestionSVG(data, style, width, height) {
  const bgColor = style?.containerBgColor || 'rgba(0,0,0,0.7)';
  const radius = style?.containerBorderRadius || 12;
  const title = data?.title || 'Ask me anything';
  const placeholder = data?.placeholder || 'Type your answer...';
  const inputBg = style?.inputBgColor || 'rgba(255,255,255,0.15)';
  const inputText = style?.placeholderColor || 'rgba(255,255,255,0.5)';
  const titleColor = style?.titleColor || '#ffffff';
  const buttonBg = style?.submitBgColor || '#F97316';
  const buttonText = style?.submitTextColor || '#000000';

  const padding = 16;
  const inputHeight = 40;
  const buttonHeight = 36;

  return `
    <rect width="${width}" height="${height}" rx="${radius}" fill="${bgColor}"/>
    <text x="${width / 2}" y="35" text-anchor="middle" fill="${titleColor}" font-size="15" font-weight="600">${escapeXml(title)}</text>
    <rect x="${padding}" y="50" width="${width - padding * 2}" height="${inputHeight}" rx="8" fill="${inputBg}"/>
    <text x="${padding + 14}" y="76" fill="${inputText}" font-size="13">${escapeXml(placeholder)}</text>
    <rect x="${padding}" y="${height - padding - buttonHeight}" width="${width - padding * 2}" height="${buttonHeight}" rx="8" fill="${buttonBg}"/>
    <text x="${width / 2}" y="${height - padding - buttonHeight / 2 + 5}" text-anchor="middle" fill="${buttonText}" font-size="14" font-weight="600">Submit</text>
  `;
}

function generateImageQuizSVG(data, style, width, height) {
  const bgColor = style?.containerBgColor || 'rgba(0,0,0,0.7)';
  const radius = style?.containerBorderRadius || 12;
  const question = data?.question || 'Which one?';
  const options = data?.options || [
    { id: '1', label: 'A' },
    { id: '2', label: 'B' },
  ];
  const columns = data?.columns || 2;
  const correctId = data?.correctAnswerId;
  const textColor = style?.questionColor || '#ffffff';
  const labelColor = style?.labelColor || '#ffffff';
  const borderColor = style?.imageBorderColor || 'rgba(255,255,255,0.3)';
  const correctBorderColor = style?.correctBorderColor || '#10b981';

  const padding = 14;
  const questionHeight = 28;
  const gridGap = 8;
  const availableWidth = width - padding * 2;
  const imageSize = (availableWidth - gridGap * (columns - 1)) / columns;
  const startY = padding + questionHeight + 8;

  let imagesSVG = '';
  options.slice(0, columns * 2).forEach((opt, i) => {
    const col = i % columns;
    const row = Math.floor(i / columns);
    const x = padding + col * (imageSize + gridGap);
    const y = startY + row * (imageSize + 24);
    const isCorrect = opt.id === correctId;
    const strokeColor = isCorrect ? correctBorderColor : borderColor;
    const strokeWidth = isCorrect ? 3 : 2;

    // Check if option has an image URL
    if (opt.imageUrl) {
      imagesSVG += `
        <defs>
          <clipPath id="clip-${opt.id}">
            <rect x="${x}" y="${y}" width="${imageSize}" height="${imageSize}" rx="8"/>
          </clipPath>
        </defs>
        <image 
          x="${x}" 
          y="${y}" 
          width="${imageSize}" 
          height="${imageSize}" 
          href="${opt.imageUrl}" 
          preserveAspectRatio="xMidYMid slice"
          clip-path="url(#clip-${opt.id})"
        />
        <rect x="${x}" y="${y}" width="${imageSize}" height="${imageSize}" rx="8" fill="none" stroke="${strokeColor}" stroke-width="${strokeWidth}"/>
        <text x="${x + imageSize / 2}" y="${y + imageSize + 16}" text-anchor="middle" fill="${labelColor}" font-size="11">${escapeXml(opt.label)}${isCorrect ? ' ✓' : ''}</text>
      `;
    } else {
      imagesSVG += `
        <rect x="${x}" y="${y}" width="${imageSize}" height="${imageSize}" rx="8" fill="rgba(255,255,255,0.1)" stroke="${strokeColor}" stroke-width="${strokeWidth}"/>
        <text x="${x + imageSize / 2}" y="${y + imageSize / 2 + 10}" text-anchor="middle" font-size="24" fill="rgba(255,255,255,0.3)">🖼️</text>
        <text x="${x + imageSize / 2}" y="${y + imageSize + 16}" text-anchor="middle" fill="${labelColor}" font-size="11">${escapeXml(opt.label)}${isCorrect ? ' ✓' : ''}</text>
      `;
    }
  });

  return `
    <rect width="${width}" height="${height}" rx="${radius}" fill="${bgColor}"/>
    <text x="${width / 2}" y="${padding + 14}" text-anchor="middle" fill="${textColor}" font-size="14" font-weight="600">${escapeXml(question)}</text>
    ${imagesSVG}
  `;
}

function escapeXml(text) {
  if (!text) return '';
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}
