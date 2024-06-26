import { RectStyle } from './rect-style.js';
import { Column } from './column.js';
import { animate } from './helpers/animate.js';
import { Animation } from './animation.js';
import { splitNumberIntoRandomNonRepeatingArray } from './helpers/arrays.js';
import { createContext, isWhiteOrTransparent } from './helpers/canvas.js';
import { createEmptySVGElement, createSvgElements } from './helpers/svg.js';
import { Continuous } from './continuous.js';

/**
 * Represents a class for creating and animating code block rectangles based on an image.
 */
export class Blociau {
  private codeBlockMinWidth: number = 0;
  private codeBlockMaxWidth: number = 0;
  public constructor(
    private blockHeight: number,
    private rectStyles: RectStyle[],
    private padding: number
  ) {
    this.padding = Math.ceil(padding);

    this.codeBlockMinWidth = Math.min(...this.rectStyles.map((x) => x.width));
    this.codeBlockMaxWidth = Math.max(...this.rectStyles.map((x) => x.width));
  }

  /**
   * Creates an SVG element with code block rectangles based on the provided image.
   * @param id - The ID of the SVG element to create.
   * @param image - The image to use as the source for the code block rectangles.
   * @returns The created SVG element with code block rectangles.
   */
  public fromImage(
    id: string,
    image: HTMLImageElement,
    invert: boolean
  ): SVGSVGElement {
    const context = createContext(image.width, image.height);
    context.drawImage(image, 0, 0, image.width, image.height);
    const rowsCount = image.height / this.blockHeight;
    const columnsCount = image.width / this.codeBlockMinWidth;

    const rowsAndColumns = this.createColumnsFromImage(
      context,
      rowsCount,
      columnsCount,
      this.codeBlockMinWidth,
      this.codeBlockMaxWidth,
      invert
    );

    // flatten rows and columns into a single array
    const columns = rowsAndColumns.flatMap((x) => x);

    const result = createSvgElements(
      columns,
      this.blockHeight,
      this.rectStyles,
      this.padding
    );

    const outputSvg = createEmptySVGElement(image.width, image.height, id);

    outputSvg.getElementById(`${id}-code-blocks-group`)?.append(...result);

    return outputSvg;
  }

  /**
   * Creates an SVG element with code block rectangles based on provided width and height.
   * @param id - The ID of the SVG element to create.
   * @param width - The width of the SVG element.
   * @param height - The height of the SVG element.
   * @returns The created SVG element with code block rectangles.
   */
  public fromDimensions(
    id: string,
    width: number,
    height: number
  ): SVGSVGElement {
    const rowsAndColumns = this.createColumnsFromDimensions(
      width,
      height,
      this.codeBlockMinWidth,
      this.codeBlockMaxWidth
    );

    // flatten rows and columns into a single array
    const columns = rowsAndColumns.flatMap((x) => x);

    const result = createSvgElements(
      columns,
      this.blockHeight,
      this.rectStyles,
      this.padding
    );

    const outputSvg = createEmptySVGElement(width, height, id);

    outputSvg.getElementById(`${id}-code-blocks-group`)?.append(...result);

    return outputSvg;
  }

  public continuos(
    outputElementId: string,
    width: number,
    height: number
  ): void {
    const htmlElement = document.getElementById(outputElementId);

    if (!htmlElement) {
      throw new Error(`Element with id ${outputElementId} not found.`);
    }

    const continuous = new Continuous(
      width,
      height,
      this.codeBlockMinWidth,
      this.codeBlockMaxWidth,
      this.blockHeight,
      this.rectStyles,
      this.padding,
      htmlElement
    );

    continuous.start();
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

  private createColumnsFromDimensions(
    width: number,
    height: number,
    codeBlockMinWidth: number,
    codeBlockMaxWidth: number
  ): Column[][] {
    const rows: Column[][] = [];

    const maxRows = Math.floor(height / this.blockHeight);

    let startY = 0;
    for (let y = 0; y < maxRows; y++) {
      const columns = this.createRowColumnsFromDimensions(
        width,
        startY,
        codeBlockMinWidth,
        codeBlockMaxWidth
      );

      rows.push(columns);
      startY += this.blockHeight;
    }
    return rows;
  }

  private createRowColumnsFromDimensions(
    width: number,
    startY: number,
    codeBlockMinWidth: number,
    codeBlockMaxWidth: number
  ): Column[] {
    const maxColumns = Math.floor(width / codeBlockMinWidth);
    const columnWidth = maxColumns * codeBlockMinWidth;

    const column = new Column(0, startY, true, columnWidth);

    let columns: Column[] = [column];

    // split columns into random length blocks for code effect
    columns = this.splitColumnsIntoRandomLengthColumns(
      columns,
      codeBlockMinWidth,
      codeBlockMaxWidth
    );

    return columns;
  }

  private createColumnsFromImage(
    context: CanvasRenderingContext2D,
    rowsCount: number,
    columnsCount: number,
    codeBlockMinWidth: number,
    codeBlockMaxWidth: number,
    invert: boolean
  ): Column[][] {
    const rows: Column[][] = [];

    let startY = 0;
    for (let y = 0; y < rowsCount; y++) {
      const columns = this.createRowColumnsFromImage(
        context,
        columnsCount,
        startY,
        codeBlockMinWidth,
        codeBlockMaxWidth,
        invert
      );

      rows.push(columns);
      startY += this.blockHeight;
    }
    return rows;
  }

  private createRowColumnsFromImage(
    context: CanvasRenderingContext2D,
    columnsCount: number,
    startY: number,
    codeBlockMinWidth: number,
    codeBlockMaxWidth: number,
    invert: boolean
  ): Column[] {
    let columns = this.calculateColumnsFromImage(
      context,
      columnsCount,
      startY,
      invert
    );

    // merge filled columns next to each other together
    // this allows us to calculate the min and max length to work with
    columns = this.mergeColumns(columns);

    // split columns into random length blocks for code effect
    columns = this.splitColumnsIntoRandomLengthColumns(
      columns,
      codeBlockMinWidth,
      codeBlockMaxWidth
    );

    return columns;
  }

  private calculateColumnsFromImage(
    context: CanvasRenderingContext2D,
    columnsCount: number,
    startY: number,
    invert: boolean
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

      const fill = invert ? whiteOrTransparent : !whiteOrTransparent;

      columns.push({
        startX,
        startY,
        fill: fill,
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

        const newColumn = new Column(newStartX, columns[x].startY, true, width);

        newStartX += width;
        result.push(newColumn);
      }
    }
    return result;
  }
}
