import { RectStyle } from './src/index';
import { Blociau } from './src/index';

const codeBlockHeight = 20;
const codeBlockMinWidth = codeBlockHeight;
const padding = codeBlockHeight / 3;
const borderRadius = 2;
const delay = 1000;
const blockStyles: RectStyle[] = [
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

// // blociau from image
// const img = document.getElementById('input') as HTMLImageElement;
// const output = document.getElementById('output-image');
// const svg = blocks.fromImage('circle', img, false);

// const animateCss = blocks.animate('circle', svg, 3, delay);
// const style =
//   document.querySelector('style') || document.createElement('style');
// document.head.appendChild(style);
// animateCss.cssRules.forEach((cssRule) => {
//   style.sheet?.insertRule(cssRule, style.sheet.cssRules.length);
// });

// output?.appendChild(svg);

// // blociau from dimensions
// const windowWidth = window.innerWidth;
// const height = 300;
// const outputDimensions = document.getElementById('output-dimensions');
// const svgDimensions = blocks.fromDimensions('circle', windowWidth, height);

// const animateCssDimensions = blocks.animate(
//   'circle',
//   svgDimensions,
//   0.1,
//   delay
// );
// const styleDimensions =
//   document.querySelector('style') || document.createElement('style');
// document.head.appendChild(styleDimensions);
// animateCssDimensions.cssRules.forEach((cssRule) => {
//   styleDimensions.sheet?.insertRule(
//     cssRule,
//     styleDimensions.sheet.cssRules.length
//   );
// });

// outputDimensions?.appendChild(svgDimensions);

// continue effect
blocks.continuos('output-continuous', 200, 200);
