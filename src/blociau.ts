import { RectStyle } from './rect-style';
import { Column } from './column';
import { animate } from './helpers/animate';
import { Animation } from './animation';
import { splitNumberIntoRandomNonRepeatingArray } from './helpers/arrays';
import { createContext, isWhiteOrTransparent } from './helpers/canvas';
import { createEmptySVGElement, createSvgElements } from './helpers/svg';

/**
 * Represents a class for creating and animating code block rectangles based on an image.
 */
export default class Blociau {
  private codeBlockMinWidth: number = 0;
  private codeBlockMaxWidth: number = 0;
  public constructor(
    private blockHeight: number,
    private blociauStyles: RectStyle[],
    private padding: number
  ) {
    this.padding = Math.ceil(padding);

    this.codeBlockMinWidth = Math.min(
      ...this.blociauStyles.map((x) => x.width)
    );
    this.codeBlockMaxWidth = Math.max(
      ...this.blociauStyles.map((x) => x.width)
    );
  }

  /**
   * Creates an SVG element with code block rectangles based on the provided image.
   * @param id - The ID of the SVG element to create.
   * @param image - The image to use as the source for the code block rectangles.
   * @returns The created SVG element with code block rectangles.
   */
  public create(id: string, image: HTMLImageElement): SVGSVGElement {
    const context = createContext(image.width, image.height);
    context.drawImage(image, 0, 0);
    const rowsCount = image.height / this.blockHeight;
    const columnsCount = image.width / this.codeBlockMinWidth;

    const result = this.createSVGRectElements(
      context,
      rowsCount,
      columnsCount,
      this.codeBlockMinWidth,
      this.codeBlockMaxWidth
    );

    const outputSvg = createEmptySVGElement(image.width, image.height, id);

    outputSvg.getElementById(`${id}-code-blocks-group`)?.append(...result);

    return outputSvg;
  }

  /**
   * Animates a block with the given id using the provided SVG element, speed, and delay.
   * @param id - The id of the block to animate.
   * @param svg - The SVG element to use for the animation.
   * @param speed - The speed of the animation in milliseconds.
   * @param delay - The delay before the animation starts in milliseconds.
   * @returns An AnimationCss object representing the animation.
   */
  public animate(
    id: string,
    svg: SVGSVGElement,
    speed: number,
    delay: number
  ): Animation {
    return animate(id, svg, this.padding, this.codeBlockMinWidth, speed, delay);
  }

  private createSVGRectElements(
    context: CanvasRenderingContext2D,
    rowsCount: number,
    columnsCount: number,
    codeBlockMinWidth: number,
    codeBlockMaxWidth: number
  ): SVGRectElement[] {
    // work through each row
    let startY = 0;

    const svgElements: SVGRectElement[] = [];
    // work through each column
    for (let y = 0; y < rowsCount; y++) {
      // create svg elements
      const svgRowColumnElements = this.createRowElements(
        context,
        columnsCount,
        startY,
        codeBlockMinWidth,
        codeBlockMaxWidth
      );
      svgElements.push(...svgRowColumnElements);

      startY += this.blockHeight;
    }
    return svgElements;
  }

  private createRowElements(
    context: CanvasRenderingContext2D,
    columnsCount: number,
    startY: number,
    codeBlockMinWidth: number,
    codeBlockMaxWidth: number
  ): SVGRectElement[] {
    let columns = this.calculateColumns(context, columnsCount, startY);

    // merge filled columns next to each other together
    // this allows us to calculate the min and max length to work with
    columns = this.mergeColumns(columns);

    // split columns into random length blocks for code effect
    columns = this.splitColumnsIntoRandomLengthColumns(
      columns,
      codeBlockMinWidth,
      codeBlockMaxWidth
    );

    // create svg elements
    return createSvgElements(
      columns,
      this.blockHeight,
      this.blociauStyles,
      this.padding
    );
  }

  private calculateColumns(
    context: CanvasRenderingContext2D,
    columnsCount: number,
    startY: number
  ): Column[] {
    let startX = 0;
    const columns: Column[] = [];
    for (let x = 0; x < columnsCount; x++) {
      const whiteOrTransparent = isWhiteOrTransparent(
        context,
        startX,
        startY,
        this.codeBlockMinWidth,
        this.blockHeight
      );

      columns.push({
        startX,
        startY,
        fill: !whiteOrTransparent,
        blockWidth: this.codeBlockMinWidth,
      });
      startX += this.codeBlockMinWidth;
    }
    return columns;
  }

  private mergeColumns(columns: Column[]): Column[] {
    const mergedColumns: Column[] = [];

    for (let x = 0; x < columns.length; x++) {
      const currentColumn = columns[x];

      if (!currentColumn.fill) {
        continue;
      }

      let nextIndex = x + 1;
      let nextColumn = columns[nextIndex];

      while (
        nextColumn &&
        nextColumn.fill &&
        nextColumn.startX === currentColumn.startX + currentColumn.blockWidth
      ) {
        currentColumn.blockWidth += nextColumn.blockWidth;
        nextIndex++;
        nextColumn = columns[nextIndex];
      }

      mergedColumns.push(currentColumn);
      x = nextIndex - 1;
    }

    return mergedColumns;
  }

  private splitColumnsIntoRandomLengthColumns(
    columns: Column[],
    codeBlockMinWidth: number,
    codeBlockMaxWidth: number
  ): Column[] {
    const result: Column[] = [];
    for (let x = 0; x < columns.length; x++) {
      const blockWidth = columns[x].blockWidth;

      const newBlockWidths = splitNumberIntoRandomNonRepeatingArray(
        blockWidth,
        codeBlockMinWidth,
        codeBlockMaxWidth
      );

      let newStartX = columns[x].startX;

      for (let w = 0; w < newBlockWidths.length; w++) {
        const width = newBlockWidths[w];

        const newColumn: Column = {
          fill: true,
          startY: columns[x].startY,
          startX: newStartX,
          blockWidth: width,
        };

        newStartX += width;
        result.push(newColumn);
      }
    }
    return result;
  }
}
