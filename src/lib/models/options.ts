export class Options {
  public constructor(
    public canvasHeight: number,
    public canvasWidth: number,
    public characterHeight: number,
    public characterWidth: number,
    public wordStyles: WordStyle[],
    public inputType: 'img' | 'random',
    public outputType: 'svg' | 'canvas',
    public outputElement: HTMLElement,
    public maxErrorPercentage: number,
    public minTypingDelay: number,
    public maxTypingDelay: number,
    public historySize: number,
    public borderRadius: number,
    public padding: number,
    public image: HTMLImageElement | undefined
  ) {}
}

export class WordStyle {
  public constructor(
    public wordLength: number,
    public colors: string[]
  ) {}
}
