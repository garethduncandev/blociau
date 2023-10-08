import Blocks from './src/blocks';

const codeBlockHeight = 10;
const codeBlockMinWidth = codeBlockHeight;
const codeBlockMaxWidth = codeBlockMinWidth * 3;
const padding = codeBlockHeight / 4;
const numberStyleVariations = 3;

const blocks = new Blocks(
  codeBlockHeight,
  codeBlockMinWidth,
  codeBlockMaxWidth,
  padding,
  numberStyleVariations
);

const img = document.getElementById('input') as HTMLImageElement;
const output = document.getElementById('output');

const svg = blocks.create('circle', img);

output?.appendChild(svg);
