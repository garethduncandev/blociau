import Blocks from './src/blocks';

const codeBlockHeight = 10;
const codeBlockMinWidth = codeBlockHeight;
const padding = codeBlockHeight / 4;
const b: { width: number; color: string }[] = [];

const blocks = new Blocks(
  codeBlockHeight,
  [
    {
      width: codeBlockMinWidth,
      color: 'red',
    },
    {
      width: codeBlockMinWidth,
      color: 'blue',
    },
    {
      width: codeBlockMinWidth * 2,
      color: 'yellow',
    },
    {
      width: codeBlockMinWidth * 3,
      color: 'green',
    },
    {
      width: codeBlockMinWidth * 3,
      color: 'purple',
    },
  ],

  padding
);

const img = document.getElementById('input') as HTMLImageElement;
const output = document.getElementById('output');

const svg = blocks.create('circle', img);

output?.appendChild(svg);
