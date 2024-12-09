import { ImageGridGenerator } from './grid-generators/image-grid-generator';
import { RandomGridGenerator } from './grid-generators/random-grid-generator';
import {
  CanvasCharacter,
  CanvasGrid,
  RenderedCharacter,
  RenderedGrid,
  RenderedRow,
} from './models/grid';
import { Options, WordStyle } from './models/options';
import { Renderer } from './renderers/renderer';
import { SvgRenderer } from './renderers/svg-renderer';

export class Blociau {
  private canvasGrid!: CanvasGrid;
  public maxVisibleRows: number;
  public maxCharactersPerRow: number;
  private renderedGrid!: RenderedGrid;
  private history: { renderedGrid: RenderedGrid; index: Index }[] = [];

  // render (e.g. cavas or svg)
  private renderer!: Renderer;

  // states, timestamps and indexes
  public runningState: RunningState = 'stopped';
  public currentTimestamp = 0;
  public lastRenderTimestamp = 0;

  public index: Index = { row: 0, character: 0 };

  public characterDelay = 0;

  private mistakesCount = 0;

  public constructor(public options: Options) {
    let rowsCount = 0;
    let rowCharactersCount = 0;

    if (options.inputType === 'img' && options.image) {
      rowsCount = options.image.height / options.characterHeight;
      rowCharactersCount = options.image.width / options.characterWidth;
    } else {
      rowsCount = options.canvasHeight / options.characterHeight;
      rowCharactersCount = options.canvasWidth / options.characterWidth;
    }

    this.maxVisibleRows = Math.floor(rowsCount);
    this.maxCharactersPerRow = Math.floor(rowCharactersCount);
  }

  public async start(): Promise<void> {
    await this.init();
    this.runningState = 'running';
    this.run();
  }

  public pause(): void {
    this.runningState = 'paused';
  }

  public resume(): void {
    this.runningState = 'running';
    this.run();
  }

  public stop(): void {
    this.runningState = 'stopped';
  }

  private async init(): Promise<void> {
    this.canvasGrid = await this.createCanvasGrid(this.options.inputType);
    this.renderedGrid = this.createRenderedGrid();
    this.renderer = this.createRenderer(this.options, this.maxCharactersPerRow);
  }

  private createRenderedGrid(): RenderedGrid {
    const rows: RenderedRow[] = [];

    for (let i = 0; i < this.maxVisibleRows; i++) {
      const characters: RenderedCharacter[] = [];
      for (let j = 0; j < this.maxCharactersPerRow; j++) {
        characters.push({
          rendered: false,
          wordIndex: 0,
          color: 'transparent',
        });
      }
      rows.push({ line: 0, characters });
    }

    return { rows } as RenderedGrid;
  }

  private async createCanvasGrid(
    inputType: 'img' | 'random'
  ): Promise<CanvasGrid> {
    switch (inputType) {
      case 'img': {
        if (!this.options.image) {
          throw new Error('Image is required when inputType is img');
        }

        return await new ImageGridGenerator().create(
          this.options.image,
          this.options.characterHeight,
          this.options.characterWidth
          // this.maxVisibleRows,
          // this.maxCharactersPerRow
        );
      }
      case 'random': {
        return new RandomGridGenerator().create(
          this.maxVisibleRows,
          this.maxCharactersPerRow
        );
      }
    }
  }

  private createRenderer(
    options: Options,
    maxCharactersPerRow: number
  ): Renderer {
    let canvasWidth = options.canvasWidth;
    let canvasHeight = options.canvasHeight;

    if (options.inputType === 'img' && options.image) {
      canvasWidth = options.image.width;
      canvasHeight = options.image.height;
    }

    switch (options.outputType) {
      case 'svg': {
        return new SvgRenderer(
          canvasWidth,
          canvasHeight,
          maxCharactersPerRow,
          options.characterWidth,
          options.characterHeight,
          options.outputElement,
          options.padding,
          options.borderRadius
        );
      }
      case 'canvas': {
        throw new Error('Not implemented');
      }
    }
  }

  private run(): void {
    // this is where the animation happens
    window.requestAnimationFrame((timestamp) =>
      this.onRequestAnimationFrame(timestamp)
    );
  }

  private onRequestAnimationFrame(timestamp: number): void {
    this.currentTimestamp = timestamp;

    const shouldRender = this.shouldRender(
      this.runningState,
      timestamp,
      this.lastRenderTimestamp,
      this.characterDelay
    );

    if (!shouldRender) {
      this.run();
      return;
    }
    let requireCharacterDelay = false;
    if (this.mistakesCount > 0 && this.history.length > 1) {
      this.history.pop();

      // replace rendered grid with one from history
      const previousState = this.history[this.history.length - 1];
      this.renderedGrid = previousState.renderedGrid;
      this.index = previousState.index;
      // remove last 2 entires

      this.mistakesCount--;
      requireCharacterDelay = true;
    } else {
      requireCharacterDelay = this.updateRenderedGrid(this.index);
      this.increaseIndex(this.index);
      this.updateHistory(this.renderedGrid, this.index);

      const totalNumberOfVisibleAnimatedCharacters =
        this.totalNumberOfAvailableCharacters();

      this.mistakesCount = this.calculateMistakesCount(
        totalNumberOfVisibleAnimatedCharacters,
        this.options.maxErrorPercentage,
        this.history.length
      );
    }

    // render the output, could be svg or canvas
    this.renderer.render(this.canvasGrid, this.renderedGrid);
    this.lastRenderTimestamp = timestamp;

    this.characterDelay = requireCharacterDelay
      ? this.randomCharacterDelay(
          this.options.minTypingDelay,
          this.options.maxTypingDelay
        )
      : 0;

    this.run();
  }

  private updateHistory(renderedGrid: RenderedGrid, index: Index): void {
    if (this.history.length === this.options.historySize) {
      this.history.shift();
    }

    const state: { renderedGrid: RenderedGrid; index: Index } = {
      index: index,
      renderedGrid: renderedGrid,
    };

    this.history.push(structuredClone(state));
  }

  private totalNumberOfAvailableCharacters(): number {
    return this.canvasGrid.rows.reduce((acc, row) => {
      return acc + row.characters.length;
    }, 0);
  }

  // character delay in milliseconds
  private randomCharacterDelay(minDelay: number, maxDelay: number): number {
    // random number between min and max
    return Math.floor(Math.random() * (maxDelay - minDelay + 1)) + minDelay;
  }

  private shouldRender(
    runningState: RunningState,
    currentTimestamp: number,
    lastRenderTimestamp: number,
    characterDelay: number
  ): boolean {
    if (runningState !== 'running') {
      return false;
    }

    // if the difference between the current timestamp and the previous timestamp
    // is greater than the character delay then we should render
    return currentTimestamp - lastRenderTimestamp >= characterDelay;
  }

  private getCanvasGridCharacter(index: Index): CanvasCharacter {
    return this.canvasGrid.rows[index.row].characters[index.character];
  }

  private getRenderedGridCharacter(index: Index): RenderedCharacter {
    return this.renderedGrid.rows[index.row].characters[index.character];
  }

  // private currentWord: RenderedWord | undefined = undefined;
  private currentWordColor: string | undefined = undefined;
  private currentWordLength: number | undefined = undefined;
  private currentWordIndex: number = 0;
  private currentWordCharacterCount = 0;

  // todo switch to index instead of grid index
  private updateRenderedGrid(index: Index): boolean {
    try {
      const gridCharacter = this.getCanvasGridCharacter(index);
      const renderedCharacter = this.getRenderedGridCharacter(index);

      const previousColor = this.currentWordColor;
      const previousWordLength = this.currentWordLength;

      if (!this.currentWordColor || !this.currentWordLength) {
        this.currentWordLength = this.randomLength(
          previousWordLength ?? 0,
          this.options.wordStyles
        );
        this.currentWordColor = this.randomColor(
          previousColor ?? '',
          this.currentWordLength,
          this.options.wordStyles
        );
      } else if (this.currentWordCharacterCount > this.currentWordLength) {
        this.currentWordLength = this.randomLength(
          previousWordLength ?? 0,
          this.options.wordStyles
        );
        this.currentWordColor = this.randomColor(
          previousColor ?? '',
          this.currentWordLength,
          this.options.wordStyles
        );

        this.currentWordIndex++;
        this.currentWordCharacterCount = 1;
      } else {
        this.currentWordCharacterCount++;
      }

      renderedCharacter.color = this.currentWordColor;
      renderedCharacter.wordIndex = this.currentWordIndex;
      renderedCharacter.rendered = true;

      return gridCharacter.visible;
    } catch (e) {
      console.error('updateRenderedGrid error', e);
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

    if (
      index.character === this.maxCharactersPerRow - 1 &&
      index.row === this.maxVisibleRows - 1
    ) {
      index.character = 0;
      this.renderedGrid.rows.shift();
      const newRow = this.pushNewRow();
      this.renderedGrid.rows.push(newRow);
    }
  }

  private pushNewRow(): RenderedRow {
    const characters: RenderedCharacter[] = [];
    for (let x = 0; x < this.maxCharactersPerRow; x++) {
      characters.push({
        rendered: false,
        wordIndex: 0,
        color: 'transparent',
      });
    }

    return { line: 0, characters };
  }

  private correctKeyStroke(): boolean {
    // return true 1 in 10 times
    return Math.random() < 0.92;
  }

  private calculateMistakesCount(
    totalVisibleAnimatedCharacters: number,
    maxErrorPercentage: number,
    historyLength: number
  ): number {
    const correctKeyStroke = this.correctKeyStroke();

    if (correctKeyStroke) {
      return 0;
    }

    let result = this.randomNumberOfKeystrokeMistakes(
      totalVisibleAnimatedCharacters,
      maxErrorPercentage
    );

    result = result > historyLength ? historyLength : result;

    return result;
  }

  private randomNumberOfKeystrokeMistakes(
    totalVisibleAnimatedCharacters: number,
    maxErrorPercentage: number
  ): number {
    const max = (maxErrorPercentage / 100) * totalVisibleAnimatedCharacters;
    const result = Math.floor(Math.random() * max) + 1;
    return result;
  }

  private randomColor(
    previousColor: string,
    wordLength: number,
    wordStyles: WordStyle[]
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
    wordStyles: WordStyle[]
  ): number {
    const wordLengths = wordStyles
      .map((style) => style.wordLength)
      .filter((length) => length !== previousWordLength);
    const maxLength = Math.max(...wordLengths);
    const wordLength = Math.floor(Math.random() * maxLength) + 1;
    return wordLength;
  }
}

type RunningState = 'running' | 'paused' | 'stopped';
type Index = { row: number; character: number };
