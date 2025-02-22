import { CanvasGrid } from "./grid";

export class Options {
  public constructor(
    public canvasHeight: number,
    public canvasWidth: number,
    public characterHeight: number,
    public characterWidth: number,
    public wordStyles: WordStyle[],
    public inputType: InputType,
    public outputType: "svg" | "canvas",
    public outputElement: HTMLElement,
    public minTypingDelayMilliseconds: number,
    public maxTypingDelayMilliseconds: number,
    public speed: number,
    public historySize: number,
    public keystrokeCorrectPercentage: number,
    public borderRadius: number,
    public padding: number,
    public image: HTMLImageElement | undefined,
    public grid: CanvasGrid | undefined,
    public minLines: number,
    public maxLines: number,
    public commentColor: string,
  ) {}
}

export class WordStyle {
  public constructor(
    public wordLength: number,
    public colors: string[],
  ) {}
}

export type InputType = "img" | "random" | "grid";
export type OutputType = "svg" | "canvas";
