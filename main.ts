import { BlockStyle } from './src/blockStyle';
import Blocks from './src/blocks';

const codeBlockHeight = 20;
const codeBlockMinWidth = codeBlockHeight;
const padding = codeBlockHeight / 4;
const borderRadius = 2;
const blockStyles: BlockStyle[] = [
  {
    width: codeBlockMinWidth,
    color: 'red',
    borderRadius: borderRadius,
  },
  {
    width: codeBlockMinWidth,
    color: 'blue',
    borderRadius: borderRadius,
  },
  {
    width: codeBlockMinWidth * 2,
    color: 'yellow',
    borderRadius: borderRadius,
  },
  {
    width: codeBlockMinWidth * 3,
    color: 'green',
    borderRadius: borderRadius,
  },
  {
    width: codeBlockMinWidth * 3,
    color: 'purple',
    borderRadius: borderRadius,
  },
];

const blocks = new Blocks(codeBlockHeight, blockStyles, padding);

const img = document.getElementById('input') as HTMLImageElement;
const output = document.getElementById('output');
const svg = blocks.create('circle', img);

// typing effect
// todo - expose in library
const style = document.createElement('style');
document.head.appendChild(style);

const keyframes = `
@keyframes typing {
  from {
    width: 0;
  }
  to {
    /* width: 100%; */
    opacity: 1;
  }
}
`;

style.sheet?.insertRule(keyframes, style.sheet.cssRules.length);
const rects = svg.getElementsByTagName('rect');

let currentDelay = 0;
let previousRect: SVGRectElement | undefined = undefined;
const typingTime = 0.1;
for (let i = 0; i < rects.length; i++) {
  const rect = rects[i];

  const previousWidth = previousRect
    ? previousRect?.width.baseVal.value + padding
    : 0;

  const currentWidth = rect.width.baseVal.value + padding;

  const delayTime =
    currentDelay + (previousWidth / codeBlockMinWidth) * typingTime;

  const animationDuration = (currentWidth / codeBlockMinWidth) * typingTime;
  rect.style.opacity = '0';

  rect.style.animation = `typing ${animationDuration}s ${delayTime}s linear forwards`;

  currentDelay = delayTime;
  previousRect = rect;
}

output?.appendChild(svg);
