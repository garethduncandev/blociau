import { Column } from './column.js';
import { splitNumberIntoRandomNonRepeatingArray } from './helpers/arrays.js';
import {
  createEmptySVGElement,
  createRectangle,
  createSvgElements,
} from './helpers/svg.js';
import { RectStyle } from './rect-style.js';
import { animate } from './helpers/animate.js';

export class Continuous {
  public constructor(
    private width: number,
    private height: number,
    private codeBlockMinWidth: number,
    private codeBlockMaxWidth: number,
    private blockHeight: number,
    private rectStyles: RectStyle[],
    private padding: number,
    private outputElement: HTMLElement
  ) {}

  public start(): void {
    // random width between min and width

    // create svg and draw
    const outputSvg = createEmptySVGElement(
      this.width,
      this.height,
      'continuous'
    );

    const styleDimensions =
      document.querySelector('style') || document.createElement('style');

    const keyframesTypingCssRule = `
    @keyframes continuous-typing {
        from {
            width: 0;
        }
        to {
            visibility: visible;
        }
    }
    `;

    document.head.appendChild(styleDimensions);

    styleDimensions.sheet?.insertRule(
      keyframesTypingCssRule,
      styleDimensions.sheet.cssRules.length
    );

    this.outputElement.appendChild(outputSvg);

    let startY = 0;

    let currentStyleIndex = 0;

    for (let x = 0; x < 10; x++) {
      // create array of columns

      // random value between codeBlockMinWidth and width
      const randomWidth =
        Math.random() * (this.width - this.codeBlockMinWidth) +
        this.codeBlockMinWidth;

      // create array of random block widths
      const blockWidths = splitNumberIntoRandomNonRepeatingArray(
        randomWidth,
        this.codeBlockMinWidth,
        this.codeBlockMaxWidth
      );

      const columns: Column[] = [];
      let startX = 0;

      for (const blockWidth of blockWidths) {
        columns.push({
          fill: true,
          startX: startX,
          startY: startY,
          blockWidth: blockWidth,
        });
        startX += blockWidth;
      }

      const svgElements = createSvgElements(
        columns,
        this.blockHeight,
        this.rectStyles,
        this.padding
      );

      const animateResult = animate(
        'continuous',
        svgElements,
        this.padding,
        this.codeBlockMinWidth,
        1,
        0
      );

      outputSvg
        .getElementById(`continuous-code-blocks-group`)
        ?.append(...svgElements);

      startY += this.blockHeight;
    }
  }
}
