import { BlockStyle } from './src/blockStyle';
import Blocks from './src/blocks';

const codeBlockHeight = 20;
const codeBlockMinWidth = codeBlockHeight;
const padding = codeBlockHeight / 3;
const borderRadius = 2;
const blockStyles: BlockStyle[] = [
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

const blocks = new Blocks(codeBlockHeight, blockStyles, padding);

const img = document.getElementById('input') as HTMLImageElement;
const output = document.getElementById('output');
const svg = blocks.create('circle', img);

blocks.animate('circle', svg, 0.2);

output?.appendChild(svg);
