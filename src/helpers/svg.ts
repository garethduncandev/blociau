import { Column } from '../column';

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
  minCodeBlockWidth: number,
  padding: number,
  styleVariationsCount: number
): SVGRectElement[] {
  const rectangles: SVGRectElement[] = [];

  let previousClassName: string | undefined = undefined;
  for (let x = 0; x < columns.length; x++) {
    const rect = createRectangle(
      columns[x].startX,
      columns[x].startY,
      columns[x].blockWidth,
      blockHeight,
      minCodeBlockWidth,
      styleVariationsCount,
      padding,
      previousClassName
    );
    previousClassName = rect.className;
    rectangles.push(rect.svgElement);
  }

  return rectangles;
}

function createRectangle(
  startX: number,
  startY: number,
  codeBlockWidth: number,
  codeBlockHeight: number,
  minCodeBlockWidth: number,
  styleVariationsCount: number,
  padding: number,
  previousClassName: string | undefined
): { svgElement: SVGRectElement; className: string } {
  const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
  rect.setAttribute('width', (codeBlockWidth - padding).toString());
  rect.setAttribute('height', (codeBlockHeight - padding).toString());
  rect.setAttribute('x', startX.toString());
  rect.setAttribute('y', startY.toString());

  const className = calculateRectClassName(
    codeBlockWidth,
    minCodeBlockWidth,
    previousClassName,
    styleVariationsCount
  );
  rect.setAttribute('class', className);

  return { svgElement: rect, className };
}

function calculateRectClassName(
  blockWidth: number,
  minWidth: number,
  previousClassName: string | undefined,
  styleVariationsCount: number
): string {
  let className: string = '';

  do {
    const randomVariation =
      Math.floor(Math.random() * styleVariationsCount) + 1;
    className = `block-width-${Math.floor(
      blockWidth / minWidth
    )} block-variation-${randomVariation}`;
    continue;
  } while (previousClassName === className);
  return className;
}
