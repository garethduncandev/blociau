import { BlociauStyle } from './src/index';
import Blociau from './src/index';

const codeBlockHeight = 20;
const codeBlockMinWidth = codeBlockHeight;
const padding = codeBlockHeight / 3;
const borderRadius = 2;
const delay = 1000;
const blockStyles: BlociauStyle[] = [
  {
    width: codeBlockMinWidth,
    color: 'black',
    borderRadius: borderRadius,
  },
  {
    width: codeBlockMinWidth,
    color: 'blue',
    borderRadius: borderRadius,
  },
  {
    width: codeBlockMinWidth * 2,
    color: 'green',
    borderRadius: borderRadius,
  },
  {
    width: codeBlockMinWidth * 3,
    color: 'red',
    borderRadius: borderRadius,
  },
  {
    width: codeBlockMinWidth * 3,
    color: 'brown',
    borderRadius: borderRadius,
  },
];

const blocks = new Blociau(codeBlockHeight, blockStyles, padding);

const img = document.getElementById('input') as HTMLImageElement;
const output = document.getElementById('output');
const svg = blocks.create('circle', img);

const animateCss = blocks.animate('circle', svg, 0.2, delay);
const style =
  document.querySelector('style') || document.createElement('style');
document.head.appendChild(style);
animateCss.cssRules.forEach((cssRule) => {
  style.sheet?.insertRule(cssRule, style.sheet.cssRules.length);
});

output?.appendChild(svg);
