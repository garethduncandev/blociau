import { ImageGridGenerator } from "./grid-generators/image-grid-generator";
import { RandomGridGenerator } from "./grid-generators/random-grid-generator";
import {
  CanvasCharacter,
  CanvasGrid,
  RenderedCharacter,
  RenderedRow,
} from "./models/grid";
import { Options, WordStyle } from "./models/options";
import { Renderer } from "./renderers/renderer";
import { SvgRenderer } from "./renderers/svg-renderer";

export class Blociau {
  private canvasGrid!: CanvasGrid;
  private maxVisibleRows = 0;
  private maxCharactersPerRow = 0;
  private renderedRows: RenderedRow[] = [];
  private history: { renderedRows: RenderedRow[]; index: Index }[] = [];

  private renderer!: Renderer;

  // states, timestamps and indexes
  public runningState: RunningState = "stopped";
  public index: Index = { row: 0, character: 0 };
  private mistakesCount = 0;
  private currentWordColor: string | undefined = undefined;
  private currentWordLength: number | undefined = undefined;
  private currentWordIndex = 0;
  private currentWordCharacterCount = 0;

  public constructor(public options: Options) {}

  public async start(): Promise<void> {
    await this.init();
    this.runningState = "running";
    this.run(false);
  }

  public pause(): void {
    this.runningState = "paused";
  }

  public autoPause(): void {
    this.runningState = "autoPaused";
  }

  public resume(): void {
    this.runningState = "running";
    this.run(true);
  }

  public stop(): void {
    this.runningState = "stopped";
    if (this.renderer) {
      // clear previous render
      this.renderer.destroy();
    }
  }

  private async init(): Promise<void> {
    this.renderedRows = [];
    this.history = [];
    this.index = { row: 0, character: 0 };
    this.validateOptions(this.options);
    this.calculateRowsAndCharacterCount(this.options);

    this.canvasGrid = await this.createCanvasGrid(this.options.inputType);
    this.renderer = this.createRenderer(this.options, this.maxCharactersPerRow);

    this.handleVisibilityChange();
  }

  private validateOptions(options: Options): void {
    if (
      options.minTypingDelayMilliseconds <= 0 ||
      options.maxTypingDelayMilliseconds <= 0
    ) {
      throw new Error(
        "minTypingDelayMilliseconds and maxTypingDelayMilliseconds must be greater than 0",
      );
    }
  }

  private handleVisibilityChange(): void {
    document.removeEventListener("visibilitychange", () => undefined);
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) {
        if (this.runningState === "running") {
          console.log("auto pausing");
          this.autoPause();
        }
      } else {
        if (this.runningState === "autoPaused") {
          this.resume();
        }
      }
    });
  }

  private calculateRowsAndCharacterCount(options: Options): void {
    let rowsCount = 0;
    let rowCharactersCount = 0;

    if (options.inputType === "img" && options.image) {
      rowsCount = options.image.height / options.characterHeight;
      rowCharactersCount = options.image.width / options.characterWidth;
    } else {
      rowsCount = options.canvasHeight / options.characterHeight;
      rowCharactersCount = options.canvasWidth / options.characterWidth;
    }

    this.maxVisibleRows = Math.floor(rowsCount);
    this.maxCharactersPerRow = Math.floor(rowCharactersCount);
  }

  private async createCanvasGrid(
    inputType: "img" | "random",
  ): Promise<CanvasGrid> {
    switch (inputType) {
      case "img": {
        if (!this.options.image) {
          throw new Error("Image is required when inputType is img");
        }

        return await new ImageGridGenerator().create(
          this.options.image,
          this.options.characterHeight,
          this.options.characterWidth,
        );
      }
      case "random": {
        return new RandomGridGenerator().create(
          this.maxVisibleRows,
          this.maxCharactersPerRow,
        );
      }
    }
  }

  private createRenderer(
    options: Options,
    maxCharactersPerRow: number,
  ): Renderer {
    let canvasWidth = options.canvasWidth;
    let canvasHeight = options.canvasHeight;

    if (options.inputType === "img" && options.image) {
      canvasWidth = options.image.width;
      canvasHeight = options.image.height;
    }

    switch (options.outputType) {
      case "svg": {
        return new SvgRenderer(
          canvasWidth,
          canvasHeight,
          maxCharactersPerRow,
          options.characterWidth,
          options.characterHeight,
          options.outputElement,
          options.padding,
          options.borderRadius,
        );
      }
      case "canvas": {
        throw new Error("Not implemented");
      }
    }
  }

  private run(resume: boolean): void {
    if (this.runningState !== "running") {
      return;
    }

    window.requestAnimationFrame((timestamp: DOMHighResTimeStamp) => {
      this.onRequestAnimationFrame(timestamp, resume);
    });
  }

  private createRowIfRequired(): void {
    // create row if doent exist
    if (
      this.renderedRows.length === 0 ||
      this.index.row >= this.renderedRows.length
    ) {
      this.renderedRows.push({ characters: [], line: 0 });
    }

    const renderedRow = this.renderedRows[this.index.row];

    if (
      renderedRow.characters.length === 0 ||
      (this.index.character >= renderedRow.characters.length &&
        renderedRow.characters.length < this.maxCharactersPerRow)
    ) {
      renderedRow.characters.push({
        rendered: false,
        wordIndex: 0,
        color: "transparent",
        renderTime: 0,
      });
    }
  }
  private requestCount = 0;
  private onRequestAnimationFrame(
    timestamp: DOMHighResTimeStamp,
    resetTimestamp: boolean,
  ): void {
    this.requestCount++;
    const MAX_STEPS = 300; // reduce scenarios where time between frames is huge
    let currentStep = 0;
    let frameReady = false;
    let requireScroll = false;

    while (!frameReady) {
      if (this.runningState !== "running") {
        frameReady = true;
        break;
      }

      this.createRowIfRequired();

      const gridCharacter = this.getCanvasGridCharacter(this.index);

      if (gridCharacter.visible && this.mistakesCount === 0) {
        this.mistakesCount = this.calculateMistakesCount();
      }

      const previousTimestamp = this.getPreviousTimestamp(timestamp);

      if (previousTimestamp > timestamp) {
        frameReady = true;
        break;
      }

      const characterRenderTime = this.calculateRenderTime(
        gridCharacter.visible,
        previousTimestamp,
      );

      // replace current state with history
      if (this.mistakesCount > 0 && this.history.length > 1) {
        // remove last entry from history (as its the current state)
        this.history.pop();

        // use previous state (and remove as it'll be added again)
        const previousState = this.history.pop();
        if (previousState) {
          this.renderedRows = previousState.renderedRows;
          this.index = previousState.index;
        }
        this.mistakesCount--;
      }

      const renderedCharacter = this.getRenderedGridCharacter(this.index);
      if (!renderedCharacter) {
        throw new Error("Rendered character doesn't exist");
      }

      renderedCharacter.renderTime = characterRenderTime;

      if (resetTimestamp) {
        renderedCharacter.renderTime = timestamp;
        frameReady = true;
      }

      // Should prevent calculating thousands of steps
      // if there is a long delay between last and current time stamp
      if (MAX_STEPS === currentStep) {
        renderedCharacter.renderTime = timestamp;
        frameReady = true;
      }

      this.updateRenderedCharacter(
        renderedCharacter,
        renderedCharacter.renderTime,
      );
      this.updateHistory(this.renderedRows, this.index);
      this.increaseIndex(this.index);

      requireScroll = this.scrollIfRequired(this.index);

      if (requireScroll) {
        this.updateCanvasGrid(this.options.inputType, requireScroll);
      }

      currentStep++;
    }

    currentStep = 0;

    this.renderer.render(this.canvasGrid, this.renderedRows);

    this.run(false);
  }

  private updateCanvasGrid(
    inputType: "img" | "random",
    requireScroll: boolean,
  ): void {
    if (inputType === "img") {
      return;
    }

    if (!requireScroll) {
      return;
    }

    // remove first row of grid, and append new random row

    const newRow = new RandomGridGenerator().createRow(
      this.maxCharactersPerRow,
    );

    this.canvasGrid.rows.shift();
    this.canvasGrid.rows.push(newRow);
  }

  private calculateRenderTime(
    characterVisible: boolean,
    previousTimestamp: DOMHighResTimeStamp,
  ): DOMHighResTimeStamp {
    if (!characterVisible) {
      return previousTimestamp;
    }

    // if (renderedCharacter.renderTime === undefined) {
    const characterDelayMilliseconds = this.randomCharacterDelay(
      this.options.minTypingDelayMilliseconds,
      this.options.maxTypingDelayMilliseconds,
    );

    // get previous render time, and add to it
    const characterRenderTime =
      previousTimestamp + characterDelayMilliseconds / this.options.speed;

    return characterRenderTime;
  }

  private getPreviousTimestamp(
    currentTimestamp: DOMHighResTimeStamp,
  ): DOMHighResTimeStamp {
    const previousState =
      this.history.length > 0
        ? this.history[this.history.length - 1]
        : undefined;
    const previousRenderedCharacter = previousState
      ? this.getRenderedGridCharacter(previousState.index)
      : undefined;
    const previousTimestamp = previousRenderedCharacter
      ? previousRenderedCharacter.renderTime
      : currentTimestamp;

    return previousTimestamp;
  }

  private updateHistory(renderedRows: RenderedRow[], index: Index): void {
    if (this.history.length === this.options.historySize) {
      const [, ...newArray] = this.history;
      this.history = newArray;
    }

    const state: { renderedRows: RenderedRow[]; index: Index } = {
      index: index,
      renderedRows: [...renderedRows],
    };

    this.history.push(structuredClone(state));
  }

  // character delay in milliseconds
  private randomCharacterDelay(
    minDelayMilliseconds: number,
    maxDelayMilliseconds: number,
  ): number {
    // random number between min and max
    return (
      Math.floor(
        Math.random() * (maxDelayMilliseconds - minDelayMilliseconds + 1),
      ) + minDelayMilliseconds
    );
  }

  private getCanvasGridCharacter(index: Index): CanvasCharacter {
    return this.canvasGrid.rows[index.row].characters[index.character];
  }

  private getRenderedGridCharacter(
    index: Index,
  ): RenderedCharacter | undefined {
    if (index.row < 0 || index.row >= this.renderedRows.length) {
      return undefined;
    }

    const row = this.renderedRows[index.row];

    if (index.character < 0 || index.character >= row.characters.length) {
      return undefined;
    }

    return this.renderedRows[index.row].characters[index.character];
  }

  private updateRenderedCharacter(
    renderedCharacter: RenderedCharacter,
    renderTime: DOMHighResTimeStamp,
  ): void {
    try {
      const previousColor = this.currentWordColor;
      const previousWordLength = this.currentWordLength;

      if (!this.currentWordColor || !this.currentWordLength) {
        this.currentWordLength = this.randomLength(
          previousWordLength ?? 0,
          this.options.wordStyles,
        );
        this.currentWordColor = this.randomColor(
          previousColor ?? "",
          this.currentWordLength,
          this.options.wordStyles,
        );
      } else if (this.currentWordCharacterCount > this.currentWordLength) {
        this.currentWordLength = this.randomLength(
          previousWordLength ?? 0,
          this.options.wordStyles,
        );
        this.currentWordColor = this.randomColor(
          previousColor ?? "",
          this.currentWordLength,
          this.options.wordStyles,
        );

        this.currentWordIndex++;
        this.currentWordCharacterCount = 1;
      } else {
        this.currentWordCharacterCount++;
      }

      renderedCharacter.color = this.currentWordColor;
      renderedCharacter.wordIndex = this.currentWordIndex;
      renderedCharacter.rendered = true;
      renderedCharacter.renderTime = renderTime;
    } catch (e) {
      console.error("updateRenderedGrid error", e);
      throw e;
    }
  }

  private increaseIndex(index: Index): void {
    // Different scenarios
    // 1. Very beginning | render, color, increase character count
    // 2. End of row | render, color, increase row, set character count to 0
    // 3. End of grid | render, color, keep row same, set character count to 0, unshift rendered rows, add new row

    if (index.character < this.maxCharactersPerRow - 1) {
      index.character++;
      return;
    }

    // new row required, but not at end of grid
    if (
      index.character === this.maxCharactersPerRow - 1 &&
      index.row < this.maxVisibleRows - 1
    ) {
      index.character = 0;
      index.row++;
      return;
    }
  }

  private scrollIfRequired(index: Index): boolean {
    if (
      index.character === this.maxCharactersPerRow - 1 &&
      index.row === this.maxVisibleRows - 1
    ) {
      index.character = 0;
      const [, ...newArray] = this.renderedRows;
      this.renderedRows = newArray;
      return true;
    }
    return false;
  }

  private calculateMistakesCount(): number {
    const typoChance = this.options.keystrokeCorrectPercentage / 100;

    const random = Math.random();
    const correctKeyStroke = random < typoChance;

    if (correctKeyStroke) {
      return 0;
    }

    // return random number between 1 and length of history
    return Math.floor(Math.random() * this.history.length) + 1;
  }

  private randomColor(
    previousColor: string,
    wordLength: number,
    wordStyles: WordStyle[],
  ): string {
    const colors = (
      wordStyles.find((style) => style.wordLength === wordLength)?.colors ?? []
    ).filter((color) => color !== previousColor);

    const randomIndex = Math.floor(Math.random() * colors.length);
    const color = colors[randomIndex];

    return color;
  }

  private randomLength(
    previousWordLength: number,
    wordStyles: WordStyle[],
  ): number {
    const wordLengths = wordStyles
      .map((style) => style.wordLength)
      .filter((length) => length !== previousWordLength);
    const maxLength = Math.max(...wordLengths);
    const wordLength = Math.floor(Math.random() * maxLength) + 1;
    return wordLength;
  }
}

export type RunningState = "running" | "paused" | "autoPaused" | "stopped";
interface Index {
  row: number;
  character: number;
}
