import { BlockStyle } from './src/blockStyle';
import Blocks from './src/blocks';

const codeBlockHeight = 10;
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
output?.appendChild(svg);
