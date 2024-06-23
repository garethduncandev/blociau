import { RectStyle } from '../rect-style.js';
import { Column } from '../column.js';

export function createEmptySVGElement(
  width: number,
  height: number,
  id: string
): SVGSVGElement {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
  svg.setAttribute('xmlns:svg', 'http://www.w3.org/2000/svg');
  svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
  const elementNS = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  elementNS.setAttribute('id', `${id}-code-blocks-group`);
  svg.appendChild(elementNS);
  return svg;
}

export function createSvgElements(
  columns: Column[],
  blockHeight: number,
  blockStyles: RectStyle[],
  padding: number
): SVGRectElement[] {
  const rectangles: SVGRectElement[] = [];

  let previousBlockStyle: RectStyle | undefined = undefined;
  for (let x = 0; x < columns.length; x++) {
    const rect = createRectangle(
      columns[x].startX,
      columns[x].startY,
      columns[x].blockWidth,
      blockHeight,
      blockStyles,
      padding,
      previousBlockStyle
    );
    previousBlockStyle = rect.blockStyle;
    rectangles.push(rect.svgElement);
  }

  return rectangles;
}

export function createRectangle(
  startX: number,
  startY: number,
  codeBlockWidth: number,
  codeBlockHeight: number,
  blockStyles: RectStyle[],
  padding: number,
  previousBlockStyle: RectStyle | undefined
): { svgElement: SVGRectElement; blockStyle: RectStyle } {
  const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
  rect.setAttribute('width', (codeBlockWidth - padding).toString());
  rect.setAttribute('height', (codeBlockHeight - padding).toString());
  rect.setAttribute('x', startX.toString());
  rect.setAttribute('y', startY.toString());

  blockStyles = blockStyles.filter((x) => x.width === codeBlockWidth);

  const blockStyle = calculateBlockStyle(
    codeBlockWidth,
    blockStyles,
    previousBlockStyle
  );
  rect.setAttribute('rx', blockStyle.borderRadius.toString());

  const className = `block-width-${blockStyle.width} block-index-${
    blockStyles.indexOf(blockStyle) + 1
  }`;

  rect.style.fill = blockStyle.color;
  rect.setAttribute('class', className);

  return { svgElement: rect, blockStyle: blockStyle };
}

function calculateBlockStyle(
  blockWidth: number,
  blockStyles: RectStyle[],
  previousBlockStyle: RectStyle | undefined
): RectStyle {
  let blockStyle: RectStyle | undefined = undefined;

  // focus on block styles that have the same width as the current block
  blockStyles = blockStyles.filter((x) => x.width === blockWidth);

  const blockStylesCount = blockStyles.length;

  do {
    const randomVariation = Math.floor(Math.random() * blockStylesCount) + 1;
    blockStyle = blockStyles[randomVariation - 1];

    continue;
  } while (previousBlockStyle === blockStyle && blockStylesCount > 1);
  return blockStyle;
}
